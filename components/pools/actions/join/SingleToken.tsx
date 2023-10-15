import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../context/PriceContext";
import { useToast } from "@chakra-ui/react";
import { NATIVE, WETH_ADDRESS, defaultChain } from "../../../../src/const";
import { ethers } from "ethers";
import { getAddress, getArtifact, getContract, send } from "../../../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { useDexData } from "../../../context/DexDataProvider";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import { formatBalError } from "../../../../src/errors";
import StableDepositLayout from "./layouts/StableDepositLayout";
import { parseInput } from "../../../utils/number";
import useHandleError, { PlatformType } from "../../../utils/useHandleError";

export default function SingleTokenDeposit({ pool, onClose }: any) {
    const poolTokens = pool.tokens.filter((token: any) => token.token.id != pool.address);
    const indexOfPoolToken = pool.tokens.findIndex((token: any) => token.token.id == pool.address);

	const [amount, setAmount] = React.useState('');
	const { prices } = usePriceData();
	const { address, isConnected } = useAccount();
	const { vault } = useDexData();
	const { walletBalances, allowances, updateFromTx } = useBalanceData();
	const { chain } = useNetwork();
	const [loading, setLoading] = React.useState(false);
	const [isNative, setIsNative] = React.useState(false);
	const [bptOut, setBptOut] = React.useState<any>('');
    const [tokenSelectedIndex, setTokenSelectedIndex] = React.useState(indexOfPoolToken == 0 ? 1 : 0);
    const [maxSlippage, setMaxSlippage] = React.useState('0.5');
    const [error, setError] = React.useState('');

    const handleBalError = useHandleError(PlatformType.DEX);

	const deposit = async () => {
		setLoading(true);
        if(!address) return;
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
        let _amounts = pool.tokens.map((token: any, i: number) => i == tokenSelectedIndex ? Big(amount).mul(10**pool.tokens[i].token.decimals).toFixed(0) : 0);
        // remove that amount from array
        if(indexOfPoolToken != -1) _amounts.splice(indexOfPoolToken, 1);
        let args = [
			pool.id,
			address,
			address,
			{
				assets: pool.tokens.map((token: any, i: number) => token.token.id == WETH_ADDRESS(chain?.id!) ? isNative ? ethers.constants.AddressZero : token.token.id : token.token.id),
				maxAmountsIn: pool.tokens.map((token: any) => ethers.constants.MaxUint256),
				userData: ethers.utils.defaultAbiCoder.encode(
						['uint256', 'uint256[]', 'uint256'], 
						[1, _amounts, '0']
					),
				fromInternalBalance: false
			}
		];
		const ethAmount = Big(amount).mul(1e18).toFixed(0);
		send(vaultContract, "joinPool", args, isNative ? ethAmount : '0')
		.then(async (res: any) => {
            let response = await res.wait();
			updateFromTx(response);
			setLoading(false);
			setAmount('0');
            setIsNative(false);
            onClose();
		})
		.catch((err: any) => {
			handleBalError(err);
			setLoading(false);
		})
	}

    const queryBptOut = async (_amount = amount) => {
        return new Promise<string>(async (resolve, reject) => {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const balancerHelper = new ethers.Contract(getAddress("BalancerHelpers", chain?.id ?? defaultChain.id), getArtifact("BalancerHelpers"), provider);
            let _amounts = pool.tokens.map((token: any, i: number) => i == tokenSelectedIndex ? Big(_amount).mul(10**pool.tokens[i].token.decimals).toFixed(0) : 0);
            // remove that amount from array
            if(indexOfPoolToken != -1) _amounts.splice(indexOfPoolToken, 1);
            let maxAmountsIn = pool.tokens.map((token: any, index: number) => index == Number(tokenSelectedIndex) ? Big(_amount).mul(10**token.token.decimals).mul(100+maxSlippage).div(100).toFixed(0) : ethers.constants.MaxUint256);
            let args = [
                pool.id,
                address,
                address,
                {
                    assets: pool.tokens.map((token: any, i: number) => token.token.id),
                    maxAmountsIn,
                    userData: Big(pool.totalShares ?? 0).eq(0) ? ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]'], 
                            [0, _amounts]
                        ) : ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]', 'uint256'], 
                            [1, _amounts, 0]
                        ),
                    fromInternalBalance: false
                }
            ];
            try{
                const res = await balancerHelper.callStatic.queryJoin(...args);
                resolve(res.bptOut.toString());
            } catch (err) {
                console.log("Failed querying join", err);
                reject(formatBalError(err));
            }
        })
    }

	// return index of token in pool tokens to approve
	const shouldApprove = () => {
        if(isNative && pool.tokens[tokenSelectedIndex].token.id == WETH_ADDRESS(chain?.id!)) return false;
        if(isNaN(Number(amount)) || Number(amount) == 0) return false;
        if(Big(allowances[pool.tokens[tokenSelectedIndex].token.id]?.[vault.address] ?? 0).lt(Big(amount).mul(10 ** pool.tokens[tokenSelectedIndex].token.decimals))) {
            return true;
        }
        return false;
	}

	const validate = () => {
        if(!isConnected) return {valid: false, message: "Connect wallet"};
		if(chain?.unsupported) return {valid: false, message: "Unsupported network"};
		if(loading) return {valid: false, message: "Loading..."}
		// check balances
        if(isNaN(Number(amount)) || Number(amount) == 0) {
            return {
                valid: false,
                message: "Enter amount"
            };
        }
        if(Big(walletBalances[(isNative && pool.tokens[tokenSelectedIndex].token.id == WETH_ADDRESS(chain?.id!)) ? ethers.constants.AddressZero : pool.tokens[tokenSelectedIndex].token.id] ?? 0).lt(Big(amount).mul(10 ** pool.tokens[tokenSelectedIndex].token.decimals))) {
            return {
                valid: false,
                message: `Insufficient ${pool.tokens[tokenSelectedIndex].token.symbol} balance`
            };
        }
		if(shouldApprove()) {
			return {
				valid: true,
				message: `Approve ${pool.tokens[tokenSelectedIndex].token.symbol} for use`
			}
		}
        if(error && error.length > 0) {
            return {
                valid: false,
                message: error
            };
        }
		return {
			valid: true,
			message: "Deposit"
		}
	}

	const approve = async () => {
        setLoading(true);
		let token = await getContract("MockToken", chain?.id!, pool.tokens[tokenSelectedIndex].token.id);
		send(token, "approve", [
			vault.address,
			ethers.constants.MaxUint256
		])
		.then(async(res: any) => {
            let response = await res.wait();
            updateFromTx(response);
            setLoading(false);
		})
		.catch((err: any) => {
            handleBalError(err);
            setLoading(false);
		})
	}

    const onSelectUpdate = (e: any) => {
        setTokenSelectedIndex(Number(e.target.value.split('-')[0]));
        setIsNative(e.target.value.split('-')[1] == NATIVE);
        setAmount('');
    }

    const values = () => {
        if(isNaN(Number(amount)) || Number(amount) == 0) return null;
        if(!bptOut) return null;
        let poolValue = poolTokens.reduce((a: any, b: any) => {
            return a.add(Big(b.balance).mul(prices[b.token.id] ?? 0));
        }, Big(0)).toNumber();
        let sharePrice = poolValue / (pool.totalShares);
        
        // value of input tokens: sum of Big(amount).mul(prices[poolTokens[i].token.id] ?? 0)
        let inputValues = Big(amount).mul(prices[pool.tokens[tokenSelectedIndex].token.id] ?? 0).toNumber();

        return {
            slippage: (100*((sharePrice * bptOut / 1e18) - inputValues)/ inputValues).toFixed(4),
            outputUSD: (sharePrice * bptOut / 1e18).toFixed(2),
            inputUSD: inputValues.toFixed(2)
        }
    }

    const setMax = () => {
        _setAmount(Big(walletBalances[(isNative && pool.tokens[tokenSelectedIndex].token.id == WETH_ADDRESS(chain?.id!)) ? ethers.constants.AddressZero : pool.tokens[tokenSelectedIndex].token.id] ?? 0).div(10 ** pool.tokens[tokenSelectedIndex].token.decimals).toFixed(pool.tokens[tokenSelectedIndex].token.decimals));
    }

    const _setAmount = (value: any) => {
		value = parseInput(value);
        setAmount(value);

        if(isNaN(Number(value)) || Number(value) == 0) return;
        else{
            setBptOut('');
            setLoading(true);
            queryBptOut(value)
            .then((res: any) => {
                setLoading(false);
                setBptOut(res);
                setError('');
            })
            .catch((err: any) => {
                console.log(err);
                setLoading(false);
                setError(err ? err.split("_").join(" ") : "Error");
                setBptOut('')
            })
        }
    }

	return (
		<StableDepositLayout
            pool={pool} 
            amount={amount} 
            setAmount={_setAmount} 
            onSelectUpdate={onSelectUpdate}
            isNative={isNative} 
            values={values()} 
            bptOut={bptOut} 
            loading={loading} 
            validate={validate} 
            maxSlippage={maxSlippage} 
            setMaxSlippage={setMaxSlippage} 
            setMax={setMax}
            shouldApprove={shouldApprove} 
            approve={approve} 
            deposit={deposit}
            tokenSelectedIndex={tokenSelectedIndex}
        />
	);
}
