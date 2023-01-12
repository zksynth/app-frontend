import {
	Box,
	Text,
	Flex,
	Divider,
	useColorMode,
	Progress,
	Input,
	Button,
	InputGroup,
	InputRightElement,
	Select,
	Spinner,
	Link,
	Alert,
	AlertIcon,
	Skeleton,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { getContract, send } from "../src/contract";
import { useAccount, useNetwork } from "wagmi";
import web3 from "web3";
import { WalletContext } from "./context/WalletContextProvider";
import { MdOutlineSwapVert } from "react-icons/md";
import TradingChart from "./charts/TradingChart";
import { AppDataContext } from "./context/AppDataProvider";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { BsArrowRightCircle } from "react-icons/bs";
import { ChainID } from "../src/chains";
import { ethers } from "ethers";
const Big = require("big.js");

function Swap({ handleChange }: any) {
	const [inputAssetIndex, setInputAssetIndex] = useState(1);
	const [outputAssetIndex, setOutputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState(0);
	const [outputAmount, setOutputAmount] = useState(0);
	const [nullValue, setNullValue] = useState(false);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState('');

	const { chain, explorer } = useContext(AppDataContext);

	const updateInputAmount = (e: any) => {
		setInputAmount(e.target.value);
		let outputAmount =
			(e.target.value * inputToken().lastPriceUSD) /
			outputToken().lastPriceUSD;
		setOutputAmount((Big(1).minus(Big(pools[tradingPool]._fee).div(1e18)).times(outputAmount)).toNumber());
	};

	const updateInputAssetIndex = (e: any) => {
		if (outputAssetIndex == e.target.value) {
			setOutputAssetIndex(inputAssetIndex);
		}
		setInputAssetIndex(e.target.value);
		// calculate output amount
		let _outputAmount = Big(inputAmount).times(inputToken(e.target.value).lastPriceUSD).div(outputToken().lastPriceUSD);
		setOutputAmount((Big(1).minus(Big(pools[tradingPool]._fee).div(1e18)).times(_outputAmount)).toNumber());
	};

	const updateOutputAmount = (e: any) => {
		setOutputAmount(e.target.value);
		let inputAmount = Big(e.target.value)
			.times(pools[tradingPool]._mintedTokens[outputAssetIndex].lastPriceUSD)
			.div(pools[tradingPool]._mintedTokens[inputAssetIndex].lastPriceUSD);
		setInputAmount((Big(1).minus(Big(pools[tradingPool]._fee).div(1e18)).times(inputAmount).toNumber()));
	};

	const updateOutputAssetIndex = (e: any) => {
		if (inputAssetIndex == e.target.value) {
			setInputAssetIndex(outputAssetIndex);
		}
		setOutputAssetIndex(e.target.value);
		// calculate input amount
		let _inputAmount = Big(outputAmount).times(outputToken(e.target.value).lastPriceUSD).div(inputToken().lastPriceUSD);
		setInputAmount((Big(1).minus(Big(pools[tradingPool]._fee).div(1e18)).times(_inputAmount)).toNumber());
	};

	const switchTokens = () => {
		let temp = inputAssetIndex;
		setInputAssetIndex(outputAssetIndex);
		setOutputAssetIndex(temp);
		setInputAmount(0);
		setOutputAmount(0);
	};

	const exchange = async () => {
		if (!inputAmount || !outputAmount) {
			return;
		}
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage('');
		let contract = await getContract("SyntheX", chain);
		const _inputAmount = inputAmount;
		const _inputAsset = pools[tradingPool]._mintedTokens[inputAssetIndex].symbol;
		const _outputAsset = pools[tradingPool]._mintedTokens[outputAssetIndex].symbol;
		const _outputAmount = outputAmount;
		send(
			contract,
			"exchange",
			[
				pools[tradingPool].id,
				pools[tradingPool]._mintedTokens[inputAssetIndex].id,
				pools[tradingPool]._mintedTokens[outputAssetIndex].id,
				ethers.utils.parseEther(inputAmount.toString()),
			],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleExchange(
					inputToken().id,
					outputToken().id,
					Big(inputAmount)
						.mul(10 ** 18)
						.toString(),
					Big(outputAmount)
						.mul(10 ** 18)
						.toString()
				);
				setMessage(`Swapped ${_inputAmount} ${_inputAsset} for ${_outputAmount} ${_outputAsset}`)
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				setMessage(JSON.stringify(err));
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	const { isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	const {
		synths,
		tradingPool,
		pools,
		tokenFormatter,
		updateSynthBalance,
	} = useContext(AppDataContext);

	const handleExchange = (
		src: string,
		dst: string,
		srcValue: string,
		dstValue: string
	) => {
		updateSynthBalance(dst, dstValue, false);
		updateSynthBalance(src, srcValue, true);
		setNullValue(!nullValue);
		handleChange();
	};

	useEffect(() => {
		if (
			inputAssetIndex > 1 &&
			pools[tradingPool]._mintedTokens.length < inputAssetIndex
		) {
			setInputAssetIndex(0);
		}
		if (
			outputAssetIndex > 1 &&
			pools[tradingPool]._mintedTokens.length < outputAssetIndex
		) {
			setOutputAssetIndex(pools[tradingPool]._mintedTokens.length - 1);
		}
	}, [inputAssetIndex, outputAssetIndex, pools, synths, tradingPool]);

	const handleMax = () => {
		let _inputAmount = Big(inputToken().balance).div(1e18);
		setInputAmount(_inputAmount);
		let _outputAmount = Big(_inputAmount).times(inputToken().lastPriceUSD).div(outputToken().lastPriceUSD)
		setOutputAmount(Big(1).minus(Big(pools[tradingPool]._fee).div(1e18)).times(_outputAmount).toNumber());
	};

	const inputToken = (_inputAssetIndex = inputAssetIndex) => {
		if (!pools[tradingPool]) return null;
		return pools[tradingPool]._mintedTokens[_inputAssetIndex];
	};

	const outputToken = (_outputAssetIndex = outputAssetIndex) => {
		if (!pools[tradingPool]) return null;
		return pools[tradingPool]._mintedTokens[_outputAssetIndex];
	};

	const swapInputExceedsBalance = () => {
		if (inputAmount) {
			return inputAmount > inputToken().balance / 1e18;
		}
		return false;
	};

	return (
		<>
			<Head>
				{tokenFormatter && (
					<title>
						{" "}
						{tokenFormatter.format(
							inputToken()?.lastPriceUSD /
								outputToken()?.lastPriceUSD
						)}{" "}
						{outputToken()?.symbol}/{inputToken()?.symbol} | Synthex
					</title>
				)}
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			{pools[tradingPool] ? (
				<Box px={{ sm: "5", md: "10" }} pb={20} mt={8} rounded={6}>
					<Flex justify={"space-between"} mb={5}>
						{/* Asset Name */}
						<Flex gap={2}>
							<Box mt={2}>
								<Image
									src={
										"/icons/" +
										inputToken()?.symbol.toUpperCase() +
										".png"
									}
									height={"60px"}
									width={"60px"}
									style={{
										maxHeight: "60px",
										maxWidth: "60px",
									}}
									alt={inputToken()?.symbol}
								/>
							</Box>

							<Box mb={3}>
								<Text fontSize="3xl" fontWeight={"bold"}>
									{inputToken()?.symbol}/
									{outputToken()?.symbol}
								</Text>
								<Text
									fontSize="sm"
									display={"flex"}
									alignItems="center"
									mt={0}
								>
									{inputToken()?.name} / {outputToken()?.name}
								</Text>
							</Box>
						</Flex>
						{/* Asset Price */}
						<Box>
							<Flex flexDir={"column"} align={"end"} gap={1}>
								<Text fontSize={"3xl"} fontWeight="bold">
									{tokenFormatter.format(
										inputToken()?.lastPriceUSD /
											outputToken()?.lastPriceUSD
									)}
								</Text>
								<Text fontSize={"sm"}>
									{outputToken()?.symbol}/
									{inputToken()?.symbol}
								</Text>
							</Flex>
						</Box>
					</Flex>
					<TradingChart
						input={
							pools[tradingPool]._mintedTokens[inputAssetIndex]
								?.symbol
						}
						output={
							pools[tradingPool]._mintedTokens[outputAssetIndex]
								?.symbol
						}
					/>

					{/* Input */}
					<Flex>
						<InputGroup size="md">
							<Input
								pr="4.5rem"
								height="50px"
								type="number"
								placeholder="Enter amount"
								value={inputAmount}
								onChange={updateInputAmount}
								borderColor="gray.400"
							/>
							<InputRightElement width="5rem">
								<Button
									h="2.4rem"
									mr={1.5}
									mt={2.5}
									px={5}
									size="sm"
									variant={"ghost"}
									onClick={handleMax}
									_hover={{ bg: "none" }}
								>
									Set Max
								</Button>
							</InputRightElement>
						</InputGroup>
						<Select
							width={"30%"}
							height="50px"
							value={inputAssetIndex}
							onChange={updateInputAssetIndex}
							borderColor="gray.400"
						>
							{pools[tradingPool]._mintedTokens.map(
								(synth: any, index: number) => (
									<option key={synth.id} value={index}>
										{synth.symbol}
									</option>
								)
							)}
						</Select>
					</Flex>

					{/* Output */}
					<Button
						my={2}
						rounded="100"
						onClick={switchTokens}
						variant="ghost"
						_hover={{ bg: "none" }}
					>
						<MdOutlineSwapVert size={"20px"} />
					</Button>

					<Flex>
						<InputGroup size="md">
							<Input
								pr="4.5rem"
								height="50px"
								type="number"
								placeholder="Enter amount"
								value={outputAmount}
								onChange={updateOutputAmount}
								borderColor="gray.400"
							/>
						</InputGroup>
						<Select
							borderColor="gray.400"
							width={"30%"}
							height="50px"
							value={outputAssetIndex}
							onChange={updateOutputAssetIndex}
						>
							{(pools[tradingPool]._mintedTokens ?? synths).map(
								(synth: any, index: number) => (
									<option key={synth["id"]} value={index}>
										{synth["symbol"]}
									</option>
								)
							)}
						</Select>
					</Flex>

					<Flex align={'center'} mt={6} justify='space-between'>
					<Text fontSize={"xs"} color="gray.400">
						Trading Fee: {pools[tradingPool]._fee/1e16} %
					</Text>
					<Text fontSize={"xs"} color="gray.400">
						Slippage: {0} %
					</Text>
					</Flex>
					<Button
						mt={6}
						size="lg"
						width={"100%"}
						bgColor={"primary"}
						onClick={exchange}
						disabled={
							loading ||
							!isConnected ||
							activeChain?.unsupported ||
							inputAmount <= 0 ||
							swapInputExceedsBalance()
						}
						loadingText="Sign the transaction in your wallet"
						isLoading={loading}
						_hover={{ bg: "gray.600" }}
						color="#171717"
					>
						{isConnected && !activeChain?.unsupported
							? swapInputExceedsBalance()
								? "Insufficient Balance"
								: inputAmount > 0
								? "Exchange"
								: "Enter Amount"
							: "Please connect your wallet"}
					</Button>

					{response && (
						<Box width={"100%"} mt={4}>
							<Alert
								status={
									response.includes("confirm")
										? "info"
										: confirmed &&
										  response.includes("Success")
										? "success"
										: "error"
								}
								variant="top-accent"
								rounded={6}
							>
								<AlertIcon />
								<Box>
									<Text fontSize="md" mb={0}>
										{response}
									</Text>
									<Text fontSize="xs" mb={0}>
											{message.slice(0, 100)}
										</Text>
									{hash && (
										<Link
											href={explorer() + hash}
											target="_blank"
										>
											{" "}
											<Text fontSize={"xs"}>
												View on explorer
											</Text>
										</Link>
									)}
								</Box>
							</Alert>
						</Box>
					)}
				</Box>
			): <>
			
			<Skeleton
					color={"gray"}
					bgColor={"gray"}
					height={"382px"}
					rounded={"10"}
				></Skeleton>
			</>}
		</>
	);
}

export default Swap;
