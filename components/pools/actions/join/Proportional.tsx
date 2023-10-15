import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../context/PriceContext";
import { ADDRESS_ZERO, WETH_ADDRESS, defaultChain } from "../../../../src/const";
import { ethers } from "ethers";
import { getAddress, getArtifact, getContract, send } from "../../../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { useDexData } from "../../../context/DexDataProvider";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import ProportionalDepositLayout from "./layouts/ProportionalDepositLayout";
import { parseInput } from "../../../utils/number";
import useHandleError, { PlatformType } from "../../../utils/useHandleError";

export default function ProportionalDeposit({ pool, onClose }: any) {
    const poolTokens = pool.tokens.filter((token: any) => token.token.id != pool.address);
	const [amounts, setAmounts] = React.useState(
		poolTokens.map((token: any) => "")
	);
	
	const { prices } = usePriceData();
	const { address, isConnected } = useAccount();
	const { vault } = useDexData();
	const { walletBalances, allowances, updateFromTx } = useBalanceData();
	const { chain } = useNetwork();
	const [loading, setLoading] = React.useState(false);
	const [isNative, setIsNative] = React.useState(false);
	const [bptOut, setBptOut] = React.useState<any>(null);
    const [maxSlippage, setMaxSlippage] = React.useState('0.5');

	const handleBalError = useHandleError(PlatformType.DEX);

	const deposit = async () => {
		setLoading(true);
		if(!address) return;
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
		let _amounts = amounts.map((amount: any, i: number) => Big(amount).mul(10**poolTokens[i].token.decimals).toFixed(0));
        let _minBptOut = Big(bptOut ?? 0).mul(100).div(100+Number(maxSlippage)).toFixed(0)
		let maxAmountsIn = poolTokens.map((token: any, i: number) => Big(amounts[i]).mul(10**token.token.decimals).mul(100+Number(maxSlippage)).div(100).toFixed(0));
        let userData = ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'uint256[]', 'uint256'], 
            [1, _amounts, _minBptOut]
        );
		let poolTokenIndex = pool.tokens.findIndex((token: any) => token.token.id == pool.address);

		// Handle first deposit
        if(Big(pool.totalShares ?? 0).eq(0)){
			userData = ethers.utils.defaultAbiCoder.encode(
				['uint256', 'uint256[]'], 
				[0, _amounts]
			);
			if(poolTokenIndex !== -1) {
				// insert 0 in index of pool token
				_amounts.splice(poolTokenIndex, 0, 0);
				userData = ethers.utils.defaultAbiCoder.encode(
					['uint256', 'uint256[]'], 
					[0, _amounts]
				);
			}
		} 
		
		// insert into maxAmountsIn
		if(poolTokenIndex !== -1) maxAmountsIn.splice(poolTokenIndex, 0, ethers.constants.MaxUint256);
        
		let args = [
			pool.id,
			address,
			address,
			{
				assets: pool.tokens.map((token: any, i: number) => token.token.id == WETH_ADDRESS(chain?.id!) ? isNative ? ethers.constants.AddressZero : token.token.id : token.token.id),
				maxAmountsIn,
				userData,
				fromInternalBalance: false
			}
		];
		const ethAmount = Big(amounts[poolTokens.findIndex((token: any) => token.token.id == WETH_ADDRESS(chain?.id!))] ?? 0).mul(1e18).toFixed(0);
		send(vaultContract, "joinPool", args, isNative ? ethAmount : '0')
		.then(async (res: any) => {
			let response = await res.wait();
			updateFromTx(response);
			setLoading(false);
			setAmounts(poolTokens.map((token: any) => ""));
			onClose();
		})
		.catch((err: any) => {
			handleBalError(err);
			setLoading(false);
		})
	}

    // to rebalance tokens in proportion
	useEffect(() => {
        if(!amounts[0]) return;
		setAmount(amounts[0], 0)
	}, [pool])

    const queryJoin = async (_amounts = amounts) => {
        return new Promise<any>(async (resolve, reject) => {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const balancerHelper = new ethers.Contract(getAddress("BalancerHelpers", chain?.id ?? defaultChain.id), getArtifact("BalancerHelpers"), provider);
            let args = [
                pool.id,
                address,
                address,
                {
                    assets: pool.tokens.map((token: any, i: number) => token.token.id),
                    maxAmountsIn: pool.tokens.map((token: any) => ethers.constants.MaxUint256),
                    userData: Big(pool.totalShares ?? 0).eq(0) ? ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]'], 
                            [0, _amounts.map((amount: any, i: number) => Big(amount).mul(10**poolTokens[i].token.decimals).toFixed(0))]
                        ) : ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]', 'uint256'], 
                            [1, _amounts.map((amount: any, i: number) => Big(amount).mul(10**poolTokens[i].token.decimals).toFixed(0)), 0]
                        ),
                    fromInternalBalance: false
                }
            ];
			balancerHelper.callStatic.queryJoin(...args)
			.then((res: any) => {
				resolve(res);
			})
			.catch((err: any) => {
				reject(err);
			})
        })
    }

	// return index of token in pool tokens to approve
	const tokenToApprove = () => {		
		// check allowances
		for(let i = 0; i < poolTokens.length; i++) {
			if(isNative && poolTokens[i].token.id == WETH_ADDRESS(chain?.id!)) continue;
			if(isNaN(Number(amounts[i])) || Number(amounts[i]) == 0) continue;
			if(Big(allowances[poolTokens[i].token.id]?.[vault.address] ?? 0).lt(Big(amounts[i] ?? 0).mul(10 ** poolTokens[i].token.decimals))) {
				return i;
			}
		}
		return -1;
	}

	const validate = () => {
		if(!isConnected) return {valid: false, message: "Connect wallet"};
		if(chain?.unsupported) return {valid: false, message: "Unsupported network"};
		// check balances
		for(let i = 0; i < poolTokens.length; i++) {
			if(isNaN(Number(amounts[i])) || Number(amounts[i]) == 0) {
				return {
					valid: false,
					message: "Enter amount"
				};
			}
			if(Big(walletBalances[(isNative && poolTokens[i].token.id == WETH_ADDRESS(chain?.id!)) ? ethers.constants.AddressZero : poolTokens[i].token.id] ?? 0).lt(Big(amounts[i]).mul(10 ** poolTokens[i].token.decimals))) {
				return {
					valid: false,
					message: `Insufficient ${poolTokens[i].token.symbol} balance`
				};
			}
		}
		if(tokenToApprove() !== -1) {
			return {
				valid: true,
				message: `Approve ${poolTokens[tokenToApprove()].token.symbol} for use`
			}
		}
		if(loading) return {valid: false, message: "Loading..."}
		return {
			valid: true,
			message: "Deposit"
		}
	}

	const approve = async () => {
		setLoading(true);
		let token = await getContract("MockToken", chain?.id!, poolTokens[tokenToApprove()].token.id);
		send(token, "approve", [
			vault.address,
			ethers.constants.MaxUint256
		])
		.then(async (res: any) => {
			let response = await res.wait();
			console.log(response);
            updateFromTx(response);
			setLoading(false);
		})
		.catch((err: any) => {
			handleBalError(err);
			setLoading(false);
		})
	}

	const setAmount = (_amount: string, index: number) => {
		_amount = parseInput(_amount);
		// TODO: Check if required
        if(Number(_amount) < 0 || _amount == '-' || loading) {
			setAmounts(
				amounts.map((amount: any, i: number) => {
					if(i == index) return _amount;
					return amount;
				})
			)
		}
		let _amounts: any[] = [...amounts];
		let isValid = true;

		for(let i = 0; i < _amounts.length; i++){
			if(Number(i) == index){
				_amounts[i] = _amount;
			} else {
				if(isNaN(Number(_amount)) || poolTokens[index].balance == 0) {
					isValid = false;
					continue;
				}
				_amounts[i] = Big(_amount).mul(poolTokens[i].balance).div(poolTokens[index].balance).toFixed(poolTokens[i].token.decimals);
			}
		}
		setAmounts(_amounts);
		if(!isValid || Number(_amount) == 0) return;
		
		setLoading(true);
		queryJoin(_amounts)
		.then((res: any) => {
			setLoading(false);
			setBptOut(res.bptOut.toString());
		})
		.catch((err: any) => {
			setLoading(false);
			setBptOut(undefined);
		})

	}

    const values = () => {
        for(let i in amounts){
			let amount = amounts[i];
			if(isNaN(Number(amount)) || Number(amount) == 0) return null;
		}
        if(!bptOut) return null;
		// if(loading) return null;
		let poolValue = poolTokens.reduce((a: any, b: any) => {
            return a.add(Big(b.balance).mul(prices[b.token.id] ?? 0));
        }, Big(0)).toNumber();
		let sharePrice = poolValue / (pool.totalShares);
        
        // value of input tokens: sum of Big(amount).mul(prices[poolTokens[i].token.id] ?? 0)
        let inputValues = amounts.reduce((a: any, b: any, i: number) => {
            return a.add(Big(b).mul(prices[poolTokens[i].token.id] ?? 0));
        }, Big(0)).toNumber();

        return {
            slippage: (100*((sharePrice * bptOut / 1e18) - inputValues)/ inputValues).toFixed(4),
            outputUSD: (sharePrice * bptOut / 1e18).toFixed(2),
            inputUSD: inputValues.toFixed(2)
        }
    }

	const setMax = (multiplier: number) => {
		let _amountsMin: any[] = [];
		let _amounts: string[][] = [];
		for(let i = 0; i < poolTokens.length; i++){
			_amounts.push([])
			let walletBalance = walletBalances[poolTokens[i].token.id] ?? 0;
			if(poolTokens[i].token.id == WETH_ADDRESS(chain?.id ?? defaultChain.id) && isNative){
				walletBalance = walletBalances[ADDRESS_ZERO] ?? 0;
			}
			let amount = Big(walletBalance).div(10 ** poolTokens[i].token.decimals).toFixed(poolTokens[i].token.decimals);
			for(let j = 0; j < amounts.length; j++){
				if(i == j){
					_amounts[i].push(amount);
				} else if (Big(poolTokens[i].balance).gt(0)) {
					_amounts[i].push(Big(amount).mul(poolTokens[j].balance).div(poolTokens[i].balance).toFixed(poolTokens[j].token.decimals));
				} else {
					_amounts[i].push("0");
				}
			}
		}
		// find array with lowest _amounts[i][0]
		let min = _amounts[0][0];
		let minIndex = 0;
		for(let i = 1; i < _amounts.length; i++){
			if(Big(_amounts[i][0]).lt(min)){
				min = _amounts[i][0];
				minIndex = i;
			}
		}
		_amountsMin = _amounts[minIndex]
		// multiply by multiplier
		for(let i = 0; i < _amountsMin.length; i++){
			_amountsMin[i] = Big(_amountsMin[i]).mul(multiplier).toFixed(poolTokens[i].token.decimals);
		}
		setAmounts(_amountsMin);
		setLoading(true);
		queryJoin(_amountsMin)
		.then((res: any) => {
			setLoading(false);
			setBptOut(res.bptOut.toString());
		})
		.catch((err: any) => {
			setLoading(false);
			setBptOut(undefined);
		})
	}

	return (
		<ProportionalDepositLayout 
			pool={pool}
			amounts={amounts} 
			setAmount={setAmount} 
			isNative={isNative} 
			setIsNative={setIsNative} 
			values={values()} 
			bptOut={bptOut} 
			loading={loading} 
			validate={validate} 
			maxSlippage={maxSlippage} 
			setMax={setMax}
			setMaxSlippage={setMaxSlippage} 
			tokenToApprove={tokenToApprove} 
			approve={approve} 
			deposit={deposit}
		/>
	);
}
