import { Box, useDisclosure, Text, Flex, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getContract, send, estimateGas, getAddress } from "../../src/contract";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import Head from "next/head";
import TokenSelector from "./TokenSelector";
import { ADDRESS_ZERO, EIP712_VERSION, ROUTER_ENDPOINT, WETH_ADDRESS, defaultChain, tokenFormatter } from "../../src/const";
import SwapSkeleton from "./Skeleton";
import { useToast } from '@chakra-ui/react';
import useUpdateData from "../utils/useUpdateData";
import { useBalanceData } from "../context/BalanceProvider";
import { usePriceData } from "../context/PriceContext";
import axios from 'axios';
import SwapLayout from "./SwapLayout";
import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { parseInput } from "../utils/number";
import useHandleError, { PlatformType } from "../utils/useHandleError";

function Swap() {
	const [inputAssetIndex, setInputAssetIndex] = useState(2);
	const [outputAssetIndex, setOutputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState('');
	const [outputAmount, setOutputAmount] = useState('');
	const [gas, setGas] = useState(0);
	const [error, setError] = useState('');
	
	const { chain } = useNetwork();
	const { prices } = usePriceData();
	const { isConnected, address } = useAccount();

	const {
		isOpen: isInputOpen,
		onOpen: onInputOpen,
		onClose: onInputClose,
	} = useDisclosure();
	const {
		isOpen: isOutputOpen,
		onOpen: onOutputOpen,
		onClose: onOutputClose,
	} = useDisclosure();

	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const [swapData, setSwapData] = useState<any>(null);
	const [data, setData] = useState<any>(null);
	const [maxSlippage, setMaxSlippage] = useState(0.5);
	const [deadline_m, setDeadline_m] = useState(20);
	const {getUpdateData} = useUpdateData();
	const [approvedAmount, setApprovedAmount] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [deadline, setDeadline] = useState('0');

	const { walletBalances, updateFromTx, tokens: _tokens, allowances, nonces, addNonce } = useBalanceData();
    const tokens: any[] = [{ id: ethers.constants.AddressZero, symbol: chain?.nativeCurrency.symbol ?? 'MNT', name: chain?.nativeCurrency.name ?? 'Mantle', decimals: chain?.nativeCurrency.decimals ?? 18, balance: walletBalances[ethers.constants.AddressZero] }].concat(_tokens);

	const handleError = useHandleError(PlatformType.DEX);

	const isUnwrap = (tokens[inputAssetIndex]?.id == WETH_ADDRESS(chain?.id ?? defaultChain.id) && tokens[outputAssetIndex]?.id == ADDRESS_ZERO);
	const isWrap = (tokens[inputAssetIndex]?.id == ADDRESS_ZERO && tokens[outputAssetIndex]?.id == WETH_ADDRESS(chain?.id ?? defaultChain.id));

	const calculateOutputAmount = (inputAmount: string) => {
		return new Promise((resolve, reject) => {
			axios.get(ROUTER_ENDPOINT+'/getPath', {
				params: {
					tokenIn: tokens[inputAssetIndex]?.id,
					tokenOut: tokens[outputAssetIndex]?.id,
					amount: inputAmount,
					kind: 0,
					sender: address ?? ADDRESS_ZERO,
					recipient: address ?? "XYZ",
					deadline: (Date.now()/1000).toFixed(0) + deadline_m * 60,
					slipage: maxSlippage
				}
			})
			.then((res) => {
				resolve(res.data.data);
			})
			.catch((err) => {
				reject(err);
			})
		})
	}

	const calculateInputAmount = (outputAmount: string) => {
		return new Promise((resolve, reject) => {
			axios.get(ROUTER_ENDPOINT+'/getPath', {
				params: {
					tokenIn: tokens[inputAssetIndex]?.id,
					tokenOut: tokens[outputAssetIndex]?.id,
					amount: outputAmount,
					kind: 1,
					sender: address ?? ADDRESS_ZERO,
					recipient: address ?? "XYZ",
					deadline: (Date.now()/1000).toFixed(0) + deadline_m * 60,
					slipage: maxSlippage
				}
			})
			.then((res) => {
				resolve(res.data.data);
			})
			.catch((err) => {
				reject(err);
			})
		})
	}

	const updateInputAmount = (value: any) => {
		value = parseInput(value);
		setInputAmount(value);
		if (isNaN(Number(value)) || Number(value) == 0) {
			setOutputAmount('0');
			return;
		}
		if(isWrap || isUnwrap){
			setOutputAmount(value);
		} else {
			setLoading(true);
			calculateOutputAmount(value)
			.then((res: any) => {
				console.log(res);
				setOutputAmount(Big(res.fData.estimatedOut).div(10**tokens[outputAssetIndex]?.decimals).toString());
				setSwapData(res);
				setLoading(false);
				setError('');
			})
			.catch((err) => {
				setLoading(false);
				setError('Insufficient liquidity')
				// If estimation failed, set output to its perivous value
				setInputAmount(inputAmount)
			})
		}
	};

	const updateOutputAmount = (value: any) => {
		value = parseInput(value);
		setOutputAmount(value);
		if (isNaN(Number(value)) || Number(value) == 0) return;
		if(isWrap || isUnwrap){
			setInputAmount(value);
		} else {
			setLoading(true);
			calculateInputAmount(value)
			.then((res: any) => {
				setLoading(false);
				let inputValue = Big(res.fData.estimatedIn).div(10**tokens[inputAssetIndex]?.decimals).toString();
				setInputAmount(inputValue);
				setError('');

				calculateOutputAmount(inputValue)
				.then((res: any) => {
					setSwapData(res);
				})
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				setError('Insufficient liquidity')
				// If estimation failed, set output amount to its previous value
				setOutputAmount(outputAmount);
			})
		}
	};

	const onInputTokenSelected = (e: number) => {
		if (outputAssetIndex == e) {
			setOutputAssetIndex(inputAssetIndex);
		}
		setInputAssetIndex(e);
		setInputAmount("" as any);
		setOutputAmount('0');
		setApprovedAmount('0');
		setData(null);
		onInputClose();
		setSwapData(null);
		setApprovedAmount('0');
		setDeadline('0');
		setData(null);
		setGas(0);
	};
	
	const onOutputTokenSelected = (e: number) => {
		if (inputAssetIndex == e) {
			setInputAssetIndex(outputAssetIndex);
		}
		setOutputAssetIndex(e);
		setInputAmount('');
		setOutputAmount('0');
		onOutputClose();
		setSwapData(null);
		setApprovedAmount('0');
		setDeadline('0');
		setData(null);
		setGas(0);
	};

	const switchTokens = () => {
		let temp = inputAssetIndex;
		setInputAssetIndex(outputAssetIndex);
		setOutputAssetIndex(temp);
		setInputAmount('');
		setOutputAmount('0');
		setSwapData(null);
		setApprovedAmount('0');
		setDeadline('0');
		setData(null);
		setGas(0);
	};

	const exchange = async () => {
		const token = tokens[inputAssetIndex];
		if(!address) return;
		if(swapData?.recipient == "XYZ") {
			updateInputAmount(inputAmount)
			return;
		};
		if(shouldApprove()){
			const routerAddress = getAddress("Router", chain?.id!);
			if(token.isPermit) approve(token, routerAddress)
			else approveTx(token, routerAddress)
		} else {
			if (!inputAmount || !outputAmount) {
				return;
			}
			setLoading(true);
			// calculateInputAmount()
			const router = await getContract("Router", chain?.id!);
			let tx;
			if(isWrap || isUnwrap){
				let weth = await getContract("WETH9", chain?.id!, WETH_ADDRESS(chain?.id!));
				if(isWrap) tx = send(weth, "deposit", [], Big(inputAmount).mul(10**token.decimals).toFixed(0));
				else tx = send(weth, "withdraw", [Big(outputAmount).mul(10**token.decimals).toFixed(0)]);
			} else {
				const tokenPricesToUpdate = swapData.swaps.filter((swap: any) => swap.isBalancerPool == false).map((swap: any) => swap.assets).flat();
				const pythData = await getUpdateData(tokenPricesToUpdate);
				// concat swap assets[]
				let _swapData = {...swapData};
				if(token.id == ADDRESS_ZERO){
					let ethAmount = Big(inputAmount).mul(10**token.decimals).toFixed(0);
					tx = send(router, "swap", [_swapData, pythData], ethAmount)
				} else {
					let calls = [];
					if(Big(approvedAmount ?? 0).gt(0)){
						const {v, r, s} = ethers.utils.splitSignature(data!);
						calls.push(
							router.interface.encodeFunctionData("permit", [approvedAmount, deadline, token.id, v, r, s])
						)
					}
					calls.push(
						router.interface.encodeFunctionData("swap", [_swapData, pythData])
					);
					tx = send(router, "multicall", [calls])
				}
			}

			tx.then(async (res: any) => {
				let response = await res.wait();
				updateFromTx(response);
				setLoading(false);
				toast({
					title: 'Transaction submitted',
					description: <Box>
						<Text>
							{`You have swapped ${inputAmount} ${tokens[inputAssetIndex]?.symbol} for ${tokens[outputAssetIndex]?.symbol}`}
						</Text>
						<Link href={chain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
							<Flex align={'center'} gap={2}>
							<ExternalLinkIcon />
							<Text>View Transaction</Text>
							</Flex>
						</Link>
					</Box>,
					status: 'success',
					duration: 5000,
					isClosable: true,
					position: 'top-right'
				})
				setInputAmount('');
				setOutputAmount('0');
				setSwapData(null);
				if(Big(approvedAmount ?? 0).gt(0)){
					addNonce(token.id, '1')
					setApprovedAmount('0');
					setDeadline('0');
					setData(null);
				}
			})
			.catch((err: any) => {
				setLoading(false);
				handleError(err)
			})
		}
	};

	const approveTx = async (token: any, routerAddress: string) => {
		setLoading(true);
		const tokenContract = await getContract("MockToken", chain?.id ?? defaultChain.id, token.id);
		send(
			tokenContract,
			"approve",
			[
				routerAddress,
				ethers.constants.MaxUint256
			]
		)
		.then(async (res: any) => {
			let response = await res.wait();
			updateFromTx(response);
			setLoading(false);
			toast({
				title: "Approval Successful",
				description: <Box>
					<Text>
						{`You have approved ${token.symbol}`}
					</Text>
					<Link href={chain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
						<Flex align={'center'} gap={2}>
						<ExternalLinkIcon />
						<Text>View Transaction</Text>
						</Flex>
					</Link>
				</Box>,
				status: "success",
				duration: 10000,
				isClosable: true,
				position: "top-right"
			})
		}).catch((err: any) => {
			handleError(err);
			setLoading(false);
		})
	}

	const approve = async (token: any, routerAddress: string) => {
		setLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * deadline_m).toFixed(0);
		// const _amount = Big(inputAmount).toFixed(token.decimals, 0);
		const value = ethers.constants.MaxUint256;
		signTypedDataAsync({
			domain: {
				name: token.name,
				version: EIP712_VERSION(token.id),
				chainId: chain?.id ?? defaultChain.id,
				verifyingContract: token.id,
			},
			types: {
				Permit: [
					{ name: "owner", type: "address" },
					{ name: "spender", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "nonce", type: "uint256" },
					{ name: "deadline", type: "uint256" },
				]
			},
			value: {
				owner: address!,
				spender: routerAddress as any,
				value,
				nonce: nonces[token.id] ?? 0,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApprovedAmount(ethers.constants.MaxUint256.toString());
				setLoading(false);
				toast({
					title: "Approval Signed",
					description: <Box>
						<Text>
							{`For use of ${token.symbol}`}
						</Text>
					</Box>,
					status: "info",
					duration: 10000,
					isClosable: true,
					position: "top-right"
				})
			})
			.catch((err: any) => {
				handleError(err);
				setLoading(false);
			});
	};

	const handleMax = () => {
		let _inputAmount = Big(walletBalances[tokens[inputAssetIndex].id] ?? 0).div(10 ** tokens[inputAssetIndex].decimals);
		updateInputAmount(_inputAmount.toString())
	};

	const swapInputExceedsBalance = () => {
		if (inputAmount) {
			return Big(inputAmount).gt(Big(walletBalances[tokens[inputAssetIndex].id] ?? 0).div(10 ** tokens[inputAssetIndex].decimals));
		}
		return false;
	};

	const shouldApprove = () => {
		const routerAddress = getAddress("Router", chain?.id! ?? defaultChain.id);
		const token = tokens[inputAssetIndex];
		if(token.id == ADDRESS_ZERO) return false;
		if(isUnwrap) return false;
		if (Big(allowances[token.id]?.[routerAddress] ?? 0).add(Big(approvedAmount).mul(10**token.decimals)).lt(Big(inputAmount).mul(10**token.decimals))){
			return true;
		}
		return false;
	}

	const validate = () => {
		if(!isConnected) return {valid: false, message: "Please connect your wallet"}
		else if (chain?.unsupported) return {valid: false, message: "Unsupported Chain"}
		if(loading) return {valid: false, message: "Loading..."}
		if(error.length > 0) return {valid: false, message: error}
		else if (Number(inputAmount) <= 0) return {valid: false, message: "Enter Amount"}
		else if (Number(outputAmount) <= 0) return {valid: false, message: "Insufficient Liquidity"}
		else if (swapInputExceedsBalance()) return {valid: false, message: "Insufficient Balance"}
		else if (shouldApprove()) return { valid: true, message: `Approve ${tokens[inputAssetIndex].symbol} for use`}
		else if (Number(deadline_m) == 0) return {valid: false, message: "Please set deadline"}
		else if (maxSlippage == 0) return {valid: false, message: "Please set slippage"}
		else if (isWrap) return {valid: true, message: "Wrap"}
		else if (isUnwrap) return {valid: true, message: "Unwrap"}
		else return {valid: true, message: "Swap"}
	}

	const estimateGas = async (_swapData = swapData) => {
		if(!_swapData || validate().message !== 'Swap') return;
		const token = tokens[inputAssetIndex];
		let router = await getContract("Router", chain?.id!);
		let provider = new ethers.providers.Web3Provider(window.ethereum as any);
		router = router.connect(provider.getSigner());
		let tx;
		const tokenPricesToUpdate = swapData.swaps.filter((swap: any) => swap.isBalancerPool == false).map((swap: any) => swap.assets).flat();
		const pythData = await getUpdateData(tokenPricesToUpdate);
		// concat swap assets[]
		_swapData = {..._swapData};
		if(token.id == ADDRESS_ZERO || !window.ethereum){
			tx = new Promise((resolve, reject) => resolve(100000));
		} else {
			let calls = [];
			if(Big(approvedAmount ?? 0).gt(0)){
				const {v, r, s} = ethers.utils.splitSignature(data!);
				calls.push(router.interface.encodeFunctionData("permit", [approvedAmount, deadline, token.id, v, r, s]))
			}
			calls.push(
				router.interface.encodeFunctionData("swap", [_swapData, pythData])
			);
			tx = router.estimateGas.multicall(calls);
		}
		tx.then(async (res: any) => {
			setGas(res.toString());
		})
		.catch((err: any) => {
			console.log("Error estimating gas:", JSON.stringify(err).slice(0, 400));
			setGas(0);
		})
	}

	useEffect(() => {
		if(swapData && Number(inputAmount) > 0){
			estimateGas();
		}
	}, [inputAmount, approvedAmount, swapData])

	return (
		<>
			<Head>
				<title>
					{" "}
					{tokenFormatter.format(
						(prices[tokens[inputAssetIndex]?.id] / prices[tokens[outputAssetIndex]?.id]) || 0
					)}{" "}
					{tokens[outputAssetIndex]?.symbol}/{tokens[inputAssetIndex]?.symbol} | {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
				</title>
				<link rel="icon" type="image/x-icon" href={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`}></link>
			</Head>
			{tokens.length > 1 ? (
				<SwapLayout
					inputAmount={inputAmount}
					updateInputAmount={updateInputAmount}
					inputAssetIndex={inputAssetIndex}
					onInputOpen={onInputOpen}
					outputAmount={outputAmount}
					updateOutputAmount={updateOutputAmount}
					outputAssetIndex={outputAssetIndex}
					onOutputOpen={onOutputOpen}
					handleMax={handleMax}
					switchTokens={switchTokens}
					exchange={exchange}
					validate={validate}
					loading={loading}
					gas={gas}
					maxSlippage={maxSlippage}
					setMaxSlippage={setMaxSlippage}
					deadline={deadline_m}
					setDeadline={setDeadline_m}
					swapData={swapData}
				/>
			) : (
				<SwapSkeleton />
			)}

			<TokenSelector
				isOpen={isInputOpen}
				onOpen={onInputOpen}
				onClose={onInputClose}
				onTokenSelected={onInputTokenSelected}
			/>
			<TokenSelector
				isOpen={isOutputOpen}
				onOpen={onOutputOpen}
				onClose={onOutputClose}
				onTokenSelected={onOutputTokenSelected}
			/>
		</>
	);
}

export default Swap;