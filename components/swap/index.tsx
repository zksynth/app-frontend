import {
	Box,
	Text,
	Flex,
	Input,
	Button,
	InputGroup,
	Link,
	Alert,
	AlertIcon,
	Skeleton,
	useDisclosure,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { getContract, send } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { MdOutlineSwapVert } from "react-icons/md";
import { AppDataContext } from "../context/AppDataProvider";
import Head from "next/head";
import Image from "next/image";
import { ethers } from "ethers";
import TokenSelector from "./TokenSelector";
import { RiArrowDropDownLine } from "react-icons/ri";
import { dollarFormatter } from "../../src/const";
import SwapSkeleton from "./Skeleton";
import InfoFooter from "../modals/_utils/InfoFooter";
import { AiOutlineInfoCircle } from "react-icons/ai";
const Big = require("big.js");

function Swap() {
	const [inputAssetIndex, setInputAssetIndex] = useState(1);
	const [outputAssetIndex, setOutputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState(0);
	const [outputAmount, setOutputAmount] = useState(0);
	const [nullValue, setNullValue] = useState(false);

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
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const { chain, explorer } = useContext(AppDataContext);

	const updateInputAmount = (e: any) => {
		setInputAmount(e.target.value);
		if(!Number(e.target.value)) return;
		let outputAmount =
			(e.target.value * inputToken().lastPriceUSD) /
			outputToken().lastPriceUSD;
		setOutputAmount(
			Number(Big(1)
				.minus(Big(pools[tradingPool]._fee).div(1e22))
				.times(outputAmount)
				.toFixed(10))
		);
	};

	const onInputTokenSelected = (e: number) => {
		if (outputAssetIndex == e) {
			setOutputAssetIndex(inputAssetIndex);
		}
		setInputAssetIndex(e);
		// calculate output amount
		let _outputAmount = Big(inputAmount)
			.times(inputToken(e).lastPriceUSD)
			.div(outputToken().lastPriceUSD);
		setOutputAmount(
			Number(Big(1)
				.minus(Big(pools[tradingPool]._fee).div(1e22))
				.times(_outputAmount)
				.toFixed(10))
		);
		onInputClose();
	};

	const updateOutputAmount = (e: any) => {
		setOutputAmount(e.target.value);
		if(!Number(e.target.value)) return;
		let inputAmount = Big(e.target.value)
			.times(
				pools[tradingPool]._mintedTokens[outputAssetIndex].lastPriceUSD
			)
			.div(
				pools[tradingPool]._mintedTokens[inputAssetIndex].lastPriceUSD
			);
		setInputAmount(
			Number(Big(1)
				.minus(Big(pools[tradingPool]._fee).div(1e22))
				.times(inputAmount)
				.toFixed(10))
		);
	};

	const onOutputTokenSelected = (e: number) => {
		if (inputAssetIndex == e) {
			setInputAssetIndex(outputAssetIndex);
		}
		setOutputAssetIndex(e);
		// calculate input amount
		let _inputAmount = Big(outputAmount)
			.times(outputToken(e).lastPriceUSD)
			.div(inputToken().lastPriceUSD);
		setInputAmount(
			Number(Big(1)
				.minus(Big(pools[tradingPool]._fee).div(1e22))
				.times(_inputAmount)
				.toFixed(10))
		);
		onOutputClose();
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
		setMessage("");
		let contract = await getContract("SyntheX", chain);
		const _inputAmount = inputAmount;
		const _inputAsset =
			pools[tradingPool]._mintedTokens[inputAssetIndex].symbol;
		const _outputAsset =
			pools[tradingPool]._mintedTokens[outputAssetIndex].symbol;
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
				setMessage(
					`Swapped ${_inputAmount} ${_inputAsset} for ${_outputAmount} ${_outputAsset}`
				);
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				console.log(err);
				setMessage(JSON.stringify(err));
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	const { isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	const { synths, tradingPool, pools, tokenFormatter, updateSynthBalance } =
		useContext(AppDataContext);

	const handleExchange = (
		src: string,
		dst: string,
		srcValue: string,
		dstValue: string
	) => {
		updateSynthBalance(dst, dstValue, false);
		updateSynthBalance(src, srcValue, true);
		setNullValue(!nullValue);
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
		let _inputAmount = Big(inputToken().balance ?? 0).div(1e18);
		setInputAmount(_inputAmount);
		let _outputAmount = Big(_inputAmount)
			.times(inputToken().lastPriceUSD)
			.div(outputToken().lastPriceUSD);
		setOutputAmount(
			Number(Big(1)
				.minus(Big(pools[tradingPool]._fee).div(1e22))
				.times(_outputAmount)
				.toFixed(10))
		);
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

	const inputStyle = {
		variant: "unstyled",
		fontSize: "3xl",
		borderColor: "transparent",

		_hover: { borderColor: "transparent" },
		borderRadius: "0",
		pr: "4.5rem",
		height: "50px",
		type: "number",
		placeholder: "Enter amount",
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
				<Box>
					<Box px="5" py={10} roundedTop={15} bg={"gray.700"}>
						<Flex align="center">
							<InputGroup>
								<Input
									{...inputStyle}
									value={inputAmount}
									onChange={updateInputAmount}
								/>
							</InputGroup>

							<SelectBody
								onOpen={onInputOpen}
								asset={inputToken()}
							/>
						</Flex>

						<Flex
							fontSize={"sm"}
							color="gray.400"
							justify={"space-between"}
							align="center"
							mt={4}
							mr={2}
						>
							<Text>
								{dollarFormatter.format(
									inputAmount * inputToken().lastPriceUSD
								)}
							</Text>
							<Flex gap={1}>
								<Text>Balance: </Text>
								<Text
									onClick={handleMax}
									_hover={{ textDecor: "underline" }}
									cursor="pointer"
								>
									{" "}
									{tokenFormatter.format(
										inputToken()
											? Big(inputToken().balance ?? 0)
													.div(1e18)
													.toNumber()
											: 0
									)}
								</Text>
							</Flex>
						</Flex>
					</Box>

					<Box px="5">
						<Button
							mt={-5}
							bg="gray.700"
							border={"2px"}
							borderColor="gray.800"
							_hover={{ bg: "gray.900" }}
							rounded="100%"
							onClick={switchTokens}
							variant="unstyled"
							w={"40px"}
							h={"40px"}
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<MdOutlineSwapVert size={"16px"} />
						</Button>
					</Box>

					<Box px="5" pt={7} roundedBottom={15} bg={"gray.800"}>
						{/* Output */}
						<Flex gap={1}>
							<InputGroup>
								<Input
									{...inputStyle}
									value={outputAmount}
									onChange={updateOutputAmount}
								/>
							</InputGroup>

							<SelectBody
								onOpen={onOutputOpen}
								asset={outputToken()}
							/>
						</Flex>

						<Flex
							fontSize={"sm"}
							color="gray.400"
							justify={"space-between"}
							align="center"
							mt={4}
							mr={2}
						>
							<Text>
								{dollarFormatter.format(
									outputAmount * outputToken().lastPriceUSD
								)}
							</Text>
							<Flex gap={1}>
								<Text>Balance: </Text>
								<Text>
									{" "}
									{tokenFormatter.format(
										outputToken()
											? Big(outputToken().balance ?? 0)
													.div(1e18)
													.toNumber()
											: 0
									)}
								</Text>
							</Flex>
						</Flex>

						<Button
						mt={8}
							size="lg"
							fontSize={"lg"}
							width={"100%"}
							bgColor={"primary"}
							rounded={16}
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
							height={"55px"}
						>
							{isConnected && !activeChain?.unsupported
								? swapInputExceedsBalance()
									? "Insufficient Balance"
									: inputAmount > 0
									? "Swap"
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
									rounded={16}
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

						<Flex
							align={"center"}
							mx={1}
							my={4}
							justify="space-between"
						>
							<Text fontSize={"xs"} color="gray.400">
								Trading Fee: {pools[tradingPool]._fee / 1e20} %
							</Text>
							<Text fontSize={"xs"} color="gray.400">
								Slippage: {0} %
							</Text>
						</Flex>
					</Box>
				</Box>
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

export function SelectBody({ asset, onOpen }: any) {
	const selectStyle = {
		minW: "30%",
		maxW: "30%",
		cursor: "pointer",
	};
	return (
		<Box {...selectStyle} onClick={onOpen}>
			<Flex
				justify={"space-between"}
				align={"center"}
				bg="whiteAlpha.200"
				rounded={"full"}
				shadow={"2xl"}
				px={1}
				py={1}
				gap={1}
			>
				<Image
					src={"/icons/" + asset?.symbol.toUpperCase() + ".png"}
					height={40}
					width={40}
					alt={asset?.symbol}
				/>

				<Text fontSize="xl" color="gray.200" fontWeight={"bold"}>
					{asset.symbol}
				</Text>
				<Box ml={1}>
					<RiArrowDropDownLine size={25} />
				</Box>
			</Flex>
		</Box>
	);
}

export default Swap;
