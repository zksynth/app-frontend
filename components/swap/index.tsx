import {
	Box,
	Text,
	Flex,
	Input,
	Button,
	InputGroup,
	useDisclosure,
	Divider,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { getContract, send, estimateGas } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { MdOutlineSwapVert } from "react-icons/md";
import { AppDataContext } from "../context/AppDataProvider";
import Head from "next/head";
import Image from "next/image";
import { ethers } from "ethers";
import TokenSelector from "./TokenSelector";
import { RiArrowDropDownLine, RiArrowDropUpLine, RiArrowUpFill } from "react-icons/ri";
import { dollarFormatter, tokenFormatter } from "../../src/const";
import SwapSkeleton from "./Skeleton";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import Response from "../modals/_utils/Response";
import { motion } from "framer-motion";
import { ERRORS, ERROR_MSG } from '../../src/errors';
const Big = require("big.js");

function Swap() {
	const [inputAssetIndex, setInputAssetIndex] = useState(1);
	const [outputAssetIndex, setOutputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState(0);
	const [outputAmount, setOutputAmount] = useState(0);
	const [nullValue, setNullValue] = useState(false);
	const [gas, setGas] = useState(0);
	const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure()
	const [hidden, setHidden] = useState(!isOpen)

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

	const { chain } = useContext(AppDataContext);

	const updateInputAmount = (e: any) => {
		setInputAmount(e.target.value);
		if (isNaN(Number(e.target.value))) return;
		let outputAmount =
			(Number(e.target.value) * inputToken()?.priceUSD) /
			outputToken()?.priceUSD;
		setOutputAmount(
			Number(
				Big(1)
					.minus(Big(pools[tradingPool]._fee ?? 0).div(1e22))
					.times(outputAmount)
					.toFixed(10)
			)
		);
	};

	const onInputTokenSelected = (e: number) => {
		if (outputAssetIndex == e) {
			setOutputAssetIndex(inputAssetIndex);
		}
		setInputAssetIndex(e);
		// calculate output amount
		let _outputAmount = Big(inputAmount)
			.times(inputToken(e).priceUSD)
			.div(outputToken().priceUSD);
		setOutputAmount(
			Number(
				Big(1)
					.minus(Big(pools[tradingPool]._fee ?? 0).div(1e22))
					.times(_outputAmount)
					.toFixed(10)
			)
		);
		onInputClose();
	};

	const updateOutputAmount = (e: any) => {
		setOutputAmount(e.target.value);
		if (isNaN(Number(e.target.value))) return;
		let inputAmount = Big(Number(e.target.value))
			.times(
				pools[tradingPool].synths[outputAssetIndex].priceUSD
			)
			.div(
				pools[tradingPool].synths[inputAssetIndex].priceUSD
			);
		setInputAmount(
			Number(
				Big(1)
					.minus(Big(pools[tradingPool]._fee ?? 0).div(1e22))
					.times(inputAmount)
					.toFixed(10)
			)
		);
	};

	const onOutputTokenSelected = (e: number) => {
		if (inputAssetIndex == e) {
			setInputAssetIndex(outputAssetIndex);
		}
		setOutputAssetIndex(e);
		// calculate input amount
		let _inputAmount = Big(outputAmount)
			.times(outputToken(e).priceUSD)
			.div(inputToken().priceUSD);
		setInputAmount(
			Number(
				Big(1)
					.minus(Big(pools[tradingPool]._fee ?? 0).div(1e22))
					.times(_inputAmount)
					.toFixed(10)
			)
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
		let contract = await getContract("ERC20X", chain, pools[tradingPool].synths[inputAssetIndex].token.id);
		const _inputAmount = inputAmount;
		const _inputAsset =
			pools[tradingPool].synths[inputAssetIndex].token.symbol;
		const _outputAsset =
			pools[tradingPool].synths[outputAssetIndex].token.symbol;
		const _outputAmount = outputAmount;
		send(
			contract,
			"swap",
			[
				ethers.utils.parseEther(inputAmount.toString()),
				pools[tradingPool].synths[outputAssetIndex].token.id,
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

	useEffect(() => {
		if (pools[tradingPool] && !isNaN(Number(inputAmount)) && validateInput() == 0)
			getContract("ERC20X", chain, pools[tradingPool].synths[inputAssetIndex].token.id).then((contract: any) => {
				// estimate gas
				contract.estimateGas
					.swap(
						ethers.utils.parseEther(Number(inputAmount).toString()),
						pools[tradingPool].synths[outputAssetIndex].token.id,
					)
					.then((gas: any) => {
						setGas(
							Number(ethers.utils.formatUnits(gas, "gwei")) * 2000
						);
					})
					.catch((err: any) => {
						console.log(err);
					});
			});
	});

	const { isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	const { pools, tradingPool, updateSynthWalletBalance } =
		useContext(AppDataContext);

	const handleExchange = (
		src: string,
		dst: string,
		srcValue: string,
		dstValue: string
	) => {
		updateSynthWalletBalance(dst, pools[tradingPool].id, dstValue, false);
		updateSynthWalletBalance(src, pools[tradingPool].id, srcValue, true);
		setNullValue(!nullValue);
	};

	useEffect(() => {
		if (
			inputAssetIndex > 1 &&
			pools[tradingPool].synths.length < inputAssetIndex
		) {
			setInputAssetIndex(0);
		}
		if (
			outputAssetIndex > 1 &&
			pools[tradingPool].synths.length < outputAssetIndex
		) {
			setOutputAssetIndex(pools[tradingPool].synths.length - 1);
		}
	}, [inputAssetIndex, outputAssetIndex, pools, tradingPool]);

	const handleMax = () => {
		let _inputAmount = Big(inputToken().walletBalance ?? 0).div(1e18);
		setInputAmount(_inputAmount);
		let _outputAmount = Big(_inputAmount)
			.times(inputToken().priceUSD)
			.div(outputToken().priceUSD);
		setOutputAmount(
			Number(
				Big(1)
					.minus(Big(inputToken().burnFee ?? 0).add(outputToken().mintFee ?? 0).div(10000))
					.times(_outputAmount)
					.toFixed(10)
			)
		);
	};

	const inputToken = (_inputAssetIndex = inputAssetIndex) => {
		if (!pools[tradingPool]) return null;
		return pools[tradingPool].synths[_inputAssetIndex];
	};

	const outputToken = (_outputAssetIndex = outputAssetIndex) => {
		if (!pools[tradingPool]) return null;
		return pools[tradingPool].synths[_outputAssetIndex];
	};

	const swapInputExceedsBalance = () => {
		if (inputAmount) {
			return inputAmount > inputToken().walletBalance / 1e18;
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

	const validateInput = () => {
		if(!isConnected) return ERRORS.NOT_CONNECTED
		else if(activeChain?.unsupported) return ERRORS.UNSUPPORTED_CHAIN
		else if (inputAmount <= 0) return ERRORS.INVALID_AMOUNT
		else if (swapInputExceedsBalance()) return ERRORS.INSUFFICIENT_BALANCE
		else return 0
	}

	// if (pools.length == 0) return <></>;

	return (
		<>
			<Head>
				<title>
					{" "}
					{tokenFormatter.format(
						inputToken()?.priceUSD / outputToken()?.priceUSD
					)}{" "}
					{outputToken()?.token.symbol}/{inputToken()?.token.symbol} | Synthex
				</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			{pools[tradingPool] ? (
				<Box>
					<Box px="5" py={10} roundedTop={15} bg={"gray.700"}>
						<Flex align="center" justify={"space-between"}>
							<InputGroup width={"70%"}>
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
									inputAmount * inputToken()?.priceUSD / 1e8
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
											? Big(inputToken().walletBalance ?? 0)
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
						<Flex align="center" justify={"space-between"}>
							<InputGroup width={"70%"}>
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
							mb={-4}
							mr={2}
						>
							<Text>
								{dollarFormatter.format(
									outputAmount * outputToken()?.priceUSD / 1e8
								)}
							</Text>
							<Flex gap={1}>
								<Text>Balance: </Text>
								<Text>
									{" "}
									{tokenFormatter.format(
										outputToken()
											? Big(outputToken().walletBalance ?? 0)
													.div(1e18)
													.toNumber()
											: 0
									)}
								</Text>
							</Flex>
						</Flex>
					
					{ gas > 0 && <>
						<Flex
							justify="space-between"
							align={"center"}
							mt={12}
							bg="whiteAlpha.50"
							color="gray.200"
							rounded={16}
							px={4}
							py={2}
							cursor="pointer"
							{...getButtonProps()}
							_hover={{ bg: "whiteAlpha.100" }}
						>
							<Flex align={"center"} gap={2} fontSize="md">
								<InfoOutlineIcon />
								<Text>
									1 {inputToken().token.symbol} ={" "}
									{tokenFormatter.format(
										inputToken()?.priceUSD /
											outputToken()?.priceUSD
									)}{" "}
									{outputToken().token.symbol}
								</Text>
								<Text fontSize={'sm'} color={"gray.400"}>
									(
									{dollarFormatter.format(
										inputToken()?.priceUSD/1e8
									)}
									)
								</Text>
							</Flex>
							<Flex mr={-2}>
								{!isOpen ? <RiArrowDropDownLine size={30} /> : <RiArrowDropUpLine size={30} />}
							</Flex>
						</Flex>

						<motion.div
							{...getDisclosureProps()}
							hidden={hidden}
							initial={false}
							onAnimationStart={() => setHidden(false)}
							onAnimationComplete={() => setHidden(!isOpen)}
							animate={{ height: isOpen ? 94 : 0 }}
							style={{
							height: 94,
							width: '100%',
							}}
						>
							{isOpen && 	
							<Box border={'1px'} borderColor='gray.700' mt={2} px={4} py={2} rounded={16} fontSize='sm' color={'gray.400'}>
								<Flex justify={'space-between'}>
								<Text>Price Impact</Text>
								<Text>{Number(inputToken().burnFee) + Number(outputToken().mintFee) / 10000} %</Text>
								</Flex>
								<Divider my={1}/>
								<Flex justify={'space-between'} mb={0.5}>
								<Text>Swap Fee</Text>
								<Text>{Number(inputToken().burnFee) + Number(outputToken().mintFee) / 10000} %</Text>
								</Flex>
								<Flex justify={'space-between'} mb={0.5}>
								<Text>Slippage</Text>
								<Text>0 %</Text>
								</Flex>
								<Flex justify={'space-between'}>
								<Text>Estimated Gas</Text>
								<Text>{dollarFormatter.format(gas)}</Text>
								</Flex>
							</Box>}
						</motion.div>
						</>}

						<Button
							mt={gas == 0 ? 12 : isOpen ? 8 : 3}
							mb={5}
							size="lg"
							fontSize={"xl"}
							width={"100%"}
							bgColor={"primary"}
							rounded={16}
							onClick={exchange}
							disabled={
								loading ||
								validateInput() > 0
							}
							loadingText="Sign the transaction in your wallet"
							isLoading={loading}
							_hover={{ bg: "gray.600" }}
							color="#171717"
							height={"55px"}
						>
							{validateInput() > 0 ? ERROR_MSG[validateInput()] : "Swap"}
						</Button>
						{hash && <Box my={5} mt={-5} pb={4}>
						<Response
							response={response}
							message={message}
							hash={hash}
							confirmed={confirmed}
						/>
						</Box>}
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
	return (
		<Box cursor="pointer" onClick={onOpen}>
			<Flex
				justify={"space-between"}
				align={"center"}
				bg="whiteAlpha.200"
				rounded={"full"}
				shadow={"2xl"}
				px={1}
				py={1}
				pr={2}
				gap={0.5}
				mr={-1}
			>
				<Image
					src={"/icons/" + asset?.token.symbol + ".svg"}
					height={40}
					width={40}
					alt={asset?.symbol}
				/>

				<Text fontSize="xl" color="gray.200" fontWeight={"bold"}>
					{asset.token.symbol}
				</Text>
				<Box>
					<RiArrowDropDownLine size={30} />
				</Box>
			</Flex>
		</Box>
	);
}

export default Swap;
