import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../context/PriceContext";
import {
    useToast,
} from "@chakra-ui/react";
import { NATIVE, WETH_ADDRESS, defaultChain, dollarFormatter, tokenFormatter } from "../../../../src/const";
import { ethers } from "ethers";
import { getAddress, getArtifact, getContract, send } from "../../../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { useDexData } from "../../../context/DexDataProvider";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import { formatBalError } from "../../../../src/errors";
import StableWithdrawLayout from "./layouts/StableWithdrawLayout";
import { parseInput } from "../../../utils/number";
import useHandleError, { PlatformType } from "../../../utils/useHandleError";

export default function SingleTokenWithdraw({ pool, onClose }: any) {
    const poolTokens = pool.tokens.filter((token: any) => token.token.id != pool.address);
	const [amount, setAmount] = React.useState('');
	const { prices } = usePriceData();
	const { address, isConnected } = useAccount();
	const { vault } = useDexData();
	const { walletBalances, updateFromTx } = useBalanceData();
	const { chain } = useNetwork();
	const [loading, setLoading] = React.useState(false);
	const [isNative, setIsNative] = React.useState(false);
    const [tokenSelectedIndex, setTokenSelectedIndex] = React.useState(poolTokens[0].index ?? 0);
    const [maxSlippage, setMaxSlippage] = React.useState('0.5');
    const [error, setError] = React.useState('');
    const [bptIn, setBptIn] = React.useState('0');

    const handleBalError = useHandleError(PlatformType.DEX);

	const withdrawWithExit = async () => {
		setLoading(true);
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
        let _amounts = pool.tokens.map((token: any, i: number) => i == tokenSelectedIndex ? Big(Number(amount)).mul(10**pool.tokens[i].token.decimals).toFixed(0) : 0);
        const indexOfPoolToken = pool.tokens.findIndex((token: any) => token.token.id == pool.address);
        // remove that amount from array
        if(indexOfPoolToken != -1) _amounts.splice(indexOfPoolToken, 1);
        let args = [
			pool.id,
			address,
			address,
			{
				assets: pool.tokens.map((token: any, i: number) => token.token.id == WETH_ADDRESS(chain?.id!) && isNative ? ethers.constants.AddressZero : token.token.id),
				minAmountsOut: pool.tokens.map((token: any, i: number) => '0'),
				userData: ethers.utils.defaultAbiCoder.encode(
						['uint256', 'uint256[]', 'uint256'], 
						[2, _amounts, walletBalances[pool.address]]
					),
				fromInternalBalance: false
			}
		];
		send(vaultContract, "exitPool", args)
		.then(async (res: any) => {
			let response = await res.wait();
            updateFromTx(response);
			setLoading(false);
			setAmount('');
            setIsNative(false);
		})
		.catch((err: any) => {
			handleBalError(err);
			setLoading(false);
		})
	}

    const withdrawWithSwap = async () => {
		setLoading(true);
		const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"));
        
		let args = [
			0,
			[{
                poolId: pool.id,
                assetInIndex: pool.tokens.findIndex((t: any) => t.token.id == pool.address),
                assetOutIndex: tokenSelectedIndex,
                amount: Big(bptIn).toFixed(0),
                userData: '0x'
            }],
			pool.tokens.map((token: any, index: number) => token.token.id),
			{
				sender: address,
				fromInternalBalance: false,
				recipient: address,
				toInternalBalance: false
			},
			pool.tokens.map((token: any, index: number) => walletBalances[token.token.id]),
			// deadline in sec
			Date.now() + 60*60*24*30,
		];

		send(vaultContract, "batchSwap", args)
		.then(async (res: any) => {
			let response = await res.wait();
            updateFromTx(response);
			setLoading(false);
			setAmount('');
            onClose();
		})
		.catch((err: any) => {
			handleBalError(err);
			setLoading(false);
		})
	}

    const withdraw = pool.poolType == 'ComposableStable' ? withdrawWithSwap : withdrawWithExit;

    const queryBptInWithExit = async (_amount = amount) => {
        return new Promise<string>(async (resolve, reject) => {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const balancerHelper = new ethers.Contract(getAddress("BalancerHelpers", chain?.id ?? defaultChain.id), getArtifact("BalancerHelpers"), provider);
            let _amounts = pool.tokens.map((token: any, i: number) => i == tokenSelectedIndex ? Big(Number(_amount)).mul(10**pool.tokens[i].token.decimals).toFixed(0) : 0);
            const indexOfPoolToken = pool.tokens.findIndex((token: any) => token.token.id == pool.address);
            // remove that amount from array
            if(indexOfPoolToken != -1) _amounts.splice(indexOfPoolToken, 1);
            const index = indexOfPoolToken == -1 ? tokenSelectedIndex : (tokenSelectedIndex >= indexOfPoolToken ? tokenSelectedIndex - 1: tokenSelectedIndex);
            let args = [
                pool.id,
                address,
                address,
                {
                    assets: pool.tokens.map((token: any, i: number) => token.token.id),
                    minAmountsOut: pool.tokens.map((token: any, i: number) => '0'),
                    userData: ethers.utils.defaultAbiCoder.encode(
                            ['uint256', 'uint256[]', 'uint256'], 
                            [2, _amounts, walletBalances[pool.address]]
                        ),
                    fromInternalBalance: false
                }
            ];
            try{
                const res = await balancerHelper.callStatic.queryExit(...args);
                resolve(res.bptIn.toString());
            } catch (err) {
                console.log((err));
                reject(formatBalError(err));
            }
        })
    }

    const queryBptInWithSwap = (_amount = amount) => {
		return new Promise((resolve, reject) => {
			const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"), provider);
			let args = [
				1,
				[{
                    poolId: pool.id,
                    assetInIndex: pool.tokens.findIndex((t: any) => t.token.id == pool.address),
                    assetOutIndex: tokenSelectedIndex,
                    amount: Big(_amount).mul(10**pool.tokens[tokenSelectedIndex].token.decimals).toFixed(0),
                    userData: '0x'
                }],
				pool.tokens.map((token: any, index: number) => token.token.id),
				{
					sender: address,
					fromInternalBalance: false,
					recipient: address,
					toInternalBalance: false
				}
			];

			vaultContract.callStatic.queryBatchSwap(...args)
			.then((res: any) => {
				resolve(res[pool.tokens.findIndex((token: any) => token.token.id == pool.address)].toString());
				setLoading(false);
			})
			.catch((err: any) => {
				if(formatBalError(err)){
					reject(formatBalError(err));
				} else {
					reject(JSON.stringify(err));
				}
				setLoading(false);
			})
		})
	}

    const queryAmountOutWithSwap = (_bptIn = bptIn) => {
		return new Promise((resolve, reject) => {
			const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			const vaultContract = new ethers.Contract(vault.address, getArtifact("Vault"), provider);
			let args = [
				0,
				[{
                    poolId: pool.id,
                    assetInIndex: pool.tokens.findIndex((t: any) => t.token.id == pool.address),
                    assetOutIndex: tokenSelectedIndex,
                    amount: Big(_bptIn).mul(10**18).toFixed(0),
                    userData: '0x'
                }],
				pool.tokens.map((token: any, index: number) => token.token.id),
				{
					sender: address,
					fromInternalBalance: false,
					recipient: address,
					toInternalBalance: false
				}
			];

			vaultContract.callStatic.queryBatchSwap(...args)
			.then((res: any) => {
				resolve(Big(res[tokenSelectedIndex].toString()).abs().toString());
				setLoading(false);
			})
			.catch((err: any) => {
				if(formatBalError(err)){
					reject(formatBalError(err));
				} else {
					reject(JSON.stringify(err));
				}
				setLoading(false);
			})
		})
	}

    const queryBptIn = pool.poolType == 'ComposableStable' ? queryBptInWithSwap : queryBptInWithExit;

	const validate = () => {
        if(!isConnected) return {valid: false, message: "Connect wallet"};
		if(chain?.unsupported) return {valid: false, message: "Unsupported network"};
		if(loading) return {valid: false, message: "Loading..."}

		// check balances
        if(isNaN(Number(bptIn)) || Number(bptIn) == 0) {
            return {
                valid: false,
                message: "Enter amount"
            };
        } else if(error && error.length > 0) {
            return {
                valid: false,
                message: error
            };
        } else if(Big(bptIn).gt(walletBalances[pool.address])) {
            return {
                valid: false,
                message: "Insufficient balance"
            };
        } else {
            return {
                valid: true,
                message: "Withdraw"
            }
        }
	}

    const onSelectUpdate = (e: any) => {
        setTokenSelectedIndex(Number(e.target.value.split('-')[0]));
        setIsNative(e.target.value.split('-')[1] == NATIVE);
        setAmount('');
    }

    const values = () => {
        if(isNaN(Number(amount)) || Number(amount) == 0) return null;
        let poolValue = poolTokens.reduce((a: any, b: any) => {
            return a.add(Big(b.balance).mul(prices[b.token.id] ?? 0));
        }, Big(0)).toNumber();
        let sharePrice = poolValue / (pool.totalShares);
        
        // value of input tokens: sum of Big(amount).mul(prices[poolTokens[i].token.id] ?? 0)
        let inputValues = Big(amount).mul(prices[pool.tokens[tokenSelectedIndex].token.id] ?? 0).toNumber();
        return {
            slippage: (100*(inputValues - (sharePrice * Number(bptIn) / 1e18))/ (sharePrice * Number(bptIn) / 1e18)).toFixed(4),
            inputUSD: (sharePrice * Number(bptIn) / 1e18),
            outputUSD: inputValues
        };
    }

    const _setAmount = (value: string) => {
		value = parseInput(value);
        setAmount(value);

        if(!Number(value) || isNaN(Number(value))) return;
        else {
            setLoading(true);
            setError('');
            setBptIn('');
            queryBptIn(value).then((res: any) => {
                setLoading(false);
                setError('');
                setBptIn(res);
            })
            .catch((err: any) => {
                setLoading(false);
                setError(err ?? 'Tx will fail');
            })
        }
    }

    const setMax = (multiplier: number) => {
        setLoading(true);
        let _bptIn = Big(walletBalances[pool.address]).div(10**18).mul(multiplier).toFixed(18);
        queryAmountOutWithSwap(_bptIn)
        .then((res: any) => {
            setBptIn(Big(walletBalances[pool.address]).mul(multiplier).toString())
            setAmount(Big(res).div(10**pool.tokens[tokenSelectedIndex].token.decimals).toFixed());
            setLoading(false)
        })
        .catch((err) => {
            console.log(err);
            setLoading(false)
        })
    }

	return (
		<StableWithdrawLayout
            pool={pool}
            amount={amount}
            setAmount={_setAmount}
            tokenSelectedIndex={tokenSelectedIndex}
            isNative={isNative}
            onSelectUpdate={onSelectUpdate}
            setMax={setMax}
            values={values()}
            bptIn={bptIn}
            maxSlippage={maxSlippage} 
            setMaxSlippage={setMaxSlippage}
            loading={loading}
            validate={validate}
            withdraw={withdraw}
        />
	);
}
