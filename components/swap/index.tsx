import {
	Box,
	Text,
	Flex,
	Input,
	Button,
	InputGroup,
	useDisclosure,
	Divider,
	Link,
	NumberInput,
	NumberInputField,
	useColorMode,
	Heading,
	Tooltip,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { getContract, send, estimateGas } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { MdOutlineSwapVert } from "react-icons/md";
import { AppDataContext } from "../context/AppDataProvider";
import Head from "next/head";
import Image from "next/image";
import { BigNumber, ethers } from "ethers";
import TokenSelector from "./TokenSelector";
import { RiArrowDropDownLine, RiArrowDropUpLine, RiArrowUpFill } from "react-icons/ri";
import { PYTH_ENDPOINT, dollarFormatter, tokenFormatter } from "../../src/const";
import SwapSkeleton from "./Skeleton";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import Response from "../modals/_utils/Response";
import { motion } from "framer-motion";
import { ERRORS, ERROR_MSG } from '../../src/errors';
import { useToast } from '@chakra-ui/react';
const Big = require("big.js");
import { ExternalLinkIcon, InfoIcon } from "@chakra-ui/icons";
import { useBalanceData } from "../context/BalanceProvider";
import useUpdateData from "../utils/useUpdateData";
import useHandleError, { PlatformType } from "../utils/useHandleError";
import { formatInput, parseInput } from "../utils/number";
import { usePriceData } from "../context/PriceContext";
import { VARIANT } from "../../styles/theme";

function Swap() {
	const [inputAssetIndex, setInputAssetIndex] = useState(4);
	const [outputAssetIndex, setOutputAssetIndex] = useState(9);
	const [inputAmount, setInputAmount] = useState("");
	const [outputAmount, setOutputAmount] = useState("");
	const [gas, setGas] = useState(0);
	const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure()
	const [hidden, setHidden] = useState(!isOpen);
	const { chain } = useNetwork();

	const { walletBalances } = useBalanceData();

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

	const { account } = useContext(AppDataContext);
	const toast = useToast();

	const updateInputAmount = (value: any) => {
		value = parseInput(value);
		setInputAmount(value);
		let outputAmount = Big(value).mul(prices[inputToken()?.token.id] ?? 0).div(prices[outputToken()?.token?.id] ?? 0);
		setOutputAmount(
				Big(1)
					.minus(Big(pools[tradingPool]._fee ?? 0).div(1e22))
					.times(outputAmount)
					.toFixed(10)
		);
	};

	const onInputTokenSelected = (e: number) => {
		if (outputAssetIndex == e) {
			setOutputAssetIndex(inputAssetIndex);
		}
		setInputAssetIndex(e);
		// calculate output amount
		let _outputAmount = Big(Number(inputAmount))
			.times(inputToken(e).priceUSD)
			.div(outputToken().priceUSD);
		setOutputAmount(
				Big(1)
					.minus(Big(pools[tradingPool]._fee ?? 0).div(1e22))
					.times(_outputAmount)
					.toFixed(10)
		);
		onInputClose();
	};

	const updateOutputAmount = (value: any) => {
		value = parseInput(value);
		setOutputAmount(value);

		let inputAmount = Big(value).mul(prices[outputToken()?.token.id] ?? 0).div(prices[inputToken()?.token?.id] ?? 0);

		setInputAmount(
			Big(1)
				.minus(Big(pools[tradingPool]._fee ?? 0).div(1e22))
				.times(inputAmount)
				.toFixed(10)
		);
	};

	const onOutputTokenSelected = (e: number) => {
		if (inputAssetIndex == e) {
			setInputAssetIndex(outputAssetIndex);
		}
		setOutputAssetIndex(e);
		// Calculate input amount
		let _inputAmount = Big(Number(outputAmount))
			.times(prices[outputToken(e)?.token?.id] ?? 0)
			.div(prices[inputToken()?.token?.id] ?? 0);
		setInputAmount(
			Big(1)
				.minus(Big(pools[tradingPool]._fee ?? 0).div(1e22))
				.times(_inputAmount)
				.toFixed(10)
		);
		onOutputClose();
	};

	const switchTokens = () => {
		let temp = inputAssetIndex;
		setInputAssetIndex(outputAssetIndex);
		setOutputAssetIndex(temp);
		setInputAmount("");
		setOutputAmount("");
	};

	const { getUpdateData } = useUpdateData();
	const { updateFromTx } = useBalanceData();
	const handleError = useHandleError(PlatformType.DEX);

	const exchange = async () => {
		if (!inputAmount || !outputAmount) {
			return;
		}
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");
		// let contract = await getContract("ERC20X", chain?.id!, pools[tradingPool].synths[inputAssetIndex].token.id);
		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		const _inputAmount = inputAmount;
		const _inputAsset =
			pools[tradingPool].synths[inputAssetIndex].token.symbol;
		const _outputAsset =
			pools[tradingPool].synths[outputAssetIndex].token.symbol;
		const _outputAmount = outputAmount;

		const priceFeedUpdateData = await getUpdateData([inputToken().token.id, outputToken().token.id]);

		send(
			pool,
			"swap",
			[
				pools[tradingPool].synths[inputAssetIndex].token.id,
				ethers.utils.parseEther(inputAmount.toString()),
				pools[tradingPool].synths[outputAssetIndex].token.id,
				0,
				address,
				priceFeedUpdateData
			]
		)
			.then(async (res: any) => {
				const response = await res.wait(1);
				updateFromTx(response);
				setConfirmed(true);
				setInputAmount("");
				setOutputAmount("");
				setLoading(false);
				toast({
					title: "Swap Successful!",
					description: <Box>
						<Text>
					{`Swapped ${tokenFormatter.format(Number(_inputAmount))} ${_inputAsset} for ${tokenFormatter.format(Number(_outputAmount))} ${_outputAsset}`}
						</Text>
					<Link href={chain?.blockExplorers?.default.url + "tx/" + res.hash} target="_blank">
						<Flex align={'center'} gap={2}>
						<ExternalLinkIcon />
						<Text>View Transaction</Text>
						</Flex>
					</Link>
					</Box>,
					status: "success",
					duration: 10000,
					isClosable: true,
					position: "top-right",
				})
			})
			.catch((err: any) => {
				console.log('Caught Error', err);
				handleError(err);
				if(err?.reason == "user rejected transaction"){
					toast({
						title: "Transaction Rejected",
						description: "You have rejected the transaction",
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top-right"
					})
				}
				setLoading(false);
			});
	};

	// useEffect(() => {
	// 	if (pools[tradingPool] && !isNaN(Number(inputAmount)) && validateInput() == 0 && !gas)
	// 		getContract("Pool", chain?.id!, pools[tradingPool].id).then(async (contract: any) => {
	// 			const priceFeedUpdateData = await getUpdateData([inputToken().token.id, outputToken().token.id]);
	// 			// estimate gas
	// 			contract.estimateGas
	// 				.swap(
	// 					pools[tradingPool].synths[inputAssetIndex].token.id,
	// 					ethers.utils.parseEther(inputAmount.toString()),
	// 					pools[tradingPool].synths[outputAssetIndex].token.id,
	// 					0,
	// 					address,
	// 					priceFeedUpdateData,
	// 					{from: address}
	// 				)
	// 				.then((gas: any) => {
	// 					setGas(
	// 						Number(ethers.utils.formatUnits(gas, "gwei")) * 2000 / 10
	// 					);
	// 				})
	// 				.catch((err: any) => {
	// 					console.log(err);
	// 				});
	// 		});
	// });

	const { isConnected, address } = useAccount();
	const { pools, tradingPool } = useContext(AppDataContext);

	useEffect(() => {
		if (
			inputAssetIndex > 1 &&
			pools[tradingPool]?.synths?.length < inputAssetIndex
		) {
			setInputAssetIndex(0);
		}
		if (
			outputAssetIndex > 1 &&
			pools[tradingPool]?.synths?.length < outputAssetIndex
		) {
			setOutputAssetIndex(pools[tradingPool].synths.length - 1);
		}
	}, [inputAssetIndex, outputAssetIndex, pools, tradingPool]);

	const handleMax = () => {
		let _inputAmount = Big(walletBalances[inputToken().token.id] ?? 0).div(1e18).toFixed(inputToken().token.decimals);
		updateInputAmount(_inputAmount);
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
			return Big(inputAmount).gt(Big(walletBalances[inputToken().token.id] ?? 0).div(1e18));
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
		else if(chain?.unsupported) return ERRORS.UNSUPPORTED_CHAIN
		else if (Number(inputAmount) <= 0) return ERRORS.INVALID_AMOUNT
		else if (swapInputExceedsBalance()) return ERRORS.INSUFFICIENT_BALANCE
		else return 0
	}

	const { prices } = usePriceData();
	const { colorMode } = useColorMode();

	return (
		<>
			<Head>
				<title>
					{" "}
					{tokenFormatter.format(
						prices[inputToken()?.token?.id] ? prices[inputToken()?.token?.id] / prices[outputToken()?.token?.id] : 0
					)}{" "}
					{outputToken() && outputToken()?.token.symbol}/{inputToken()?.token.symbol} | {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
				</title>
				<link rel="icon" type="image/x-icon" href={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}.favicon`}></link>
			</Head>
			{pools[tradingPool] ? (
				<Box className={`${VARIANT}-${colorMode}-containerBody`} pb={5}>
					<Box className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={4}>
						<Flex align={'center'} justify={'space-between'}>
							<Flex align={'center'} gap={4}>
								<Heading size={'sm'}>Swap</Heading>
							</Flex>
							<Flex>
							</Flex>
						</Flex>
					</Box>
					<Box px="5" py={10} bg={'darkBg.400'} borderTop={'1px'} borderColor={'whiteAlpha.50'}>
						<Flex align="center" justify={"space-between"}>
							<InputGroup width={"70%"}>
								<NumberInput
									w={"100%"}
									value={formatInput(inputAmount)}
									onChange={updateInputAmount}
									min={0}
									step={0.01}
									{...inputStyle}
								>
									<NumberInputField
										pr={0}
										fontSize={"4xl"}
										placeholder="0"
										border={0}
									/>
								</NumberInput>
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
									Number(inputAmount) * prices[inputToken()?.token?.id] 
								)}
							</Text>
							<Flex gap={1}>
								<Text>Balance: </Text>
								<Text
									onClick={handleMax}
									_hover={{ textDecor: "underline" }}
									cursor="pointer"
									textDecor={'underline'} style={{textUnderlineOffset: '2px'}}
								>
									{" "}
									{tokenFormatter.format(
										inputToken()
											? Big(walletBalances[inputToken().token.id] ?? 0)
													.div(1e18)
													.toNumber()
											: 0
									)}
								</Text>
							</Flex>
						</Flex>
					</Box>

					<Flex px="5" my={-4} align='center'>
						<Button
							_hover={{ bg: colorMode == 'dark' ? "whiteAlpha.50" : 'blackAlpha.100' }}
							rounded={'0'}
							onClick={switchTokens}
							variant="unstyled"
							size={'sm'}
							display="flex"
							alignItems="center"
							justifyContent="center"
							bg={colorMode == 'dark' ? 'darkBg.200' : 'blackAlpha.200'}
							transform={"rotate(45deg)"}
							mx={1.5}
						>
							<Box  transform="rotate(-45deg)">
							<MdOutlineSwapVert size={"20px"} />
							</Box>
						</Button>
					</Flex>

					<Box px="5" pt={7} roundedBottom={15} bg={"whiteAlpha"}>
						{/* Output */}
						<Flex align="center" justify={"space-between"}>
						<InputGroup width={"70%"}>
							<NumberInput
								w={"100%"}
								value={formatInput(outputAmount)}
								onChange={updateOutputAmount}
								min={0}
								step={0.01}
								{...inputStyle}
							>
								<NumberInputField
									pr={0}
									fontSize={"4xl"}
									placeholder="0"
									border={0}
								/>
							</NumberInput>
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
									Number(outputAmount) * prices[outputToken()?.token?.id] ?? 0
								)}
							</Text>
							<Flex gap={1}>
								<Text>Balance: </Text>
								<Text>
									{" "}
									{tokenFormatter.format(
										outputToken()
											? Big(walletBalances[outputToken().token.id] ?? 0)
													.div(1e18)
													.toNumber()
											: 0
									)}
								</Text>
							</Flex>
						</Flex>
					
					{gas > 0 && <>
						<Box pb={10} pt={5}>
						<Flex
							justify="space-between"
							align={"center"}
							mt={12}
							mb={!isOpen ? !account ? '-4' : '-6' : '0'}
							bg="blackAlpha.50"
							color="blackAlpha.700"
							rounded={16}
							px={4}
							py={'6px'}
							cursor="pointer"
							{...getButtonProps()}
							_hover={{ bg: "blackAlpha.200" }}
							border={"2px"}
							borderColor={"blackAlpha.50"}
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
										inputToken()?.priceUSD
									)}
									)
								</Text>
							</Flex>
							<Flex mr={-2}>
								{!isOpen ? <RiArrowDropDownLine size={30} /> : <RiArrowDropUpLine size={30} />}
							</Flex>
						</Flex>
						<Box mb={isOpen ? -2 : 0}>
							<motion.div
								{...getDisclosureProps()}
								hidden={hidden}
								initial={false}
								onAnimationStart={() => setHidden(false)}
								onAnimationComplete={() => setHidden(!isOpen)}
								
								animate={{ height: isOpen ? 100 : 0 }}
								style={{
									height: 100,
									width: '100%',
								}}
							>
								{isOpen && 	
								<Box border={'2px'} borderColor='blackAlpha.200' mt={2} px={4} py={"10px"} rounded={16} fontSize='sm' color={'blackAlpha.800'}>
									<Flex justify={'space-between'}>
									<Text>Price Impact</Text>
									<Text>{100*(Number(inputToken().burnFee) + Number(outputToken().mintFee)) / 10000} %</Text>
									</Flex>
									<Divider my={1}/>
									<Flex justify={'space-between'} mb={0.5}>
									<Text>Swap Fee</Text>
									<Text>{100*(Number(inputToken().burnFee) + Number(outputToken().mintFee))/ 10000} %</Text>
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
						</Box>
						</Box>
					</>}

						<Box mt={!gas ? 14 : 0} className={(loading || validateInput() > 0 || pools[tradingPool].paused) ? `${VARIANT}-${colorMode}-disabledPrimaryButton` : `${VARIANT}-${colorMode}-primaryButton`}>
							<Button
								

								size="lg"
								fontSize={"xl"}
								width={"100%"}
								onClick={exchange}
								bg={'transparent'}
								isDisabled={loading ||
									validateInput() > 0 ||
									pools[tradingPool].paused}
								loadingText="Loading"
								isLoading={loading}
								_hover={{ opacity: 0.6 }}
								color="white"
								height={"55px"}
							>
								{pools[tradingPool].paused ? 'Market Paused Till 5PM EDT' : validateInput() > 0 ? ERROR_MSG[validateInput()] : "Swap"}
							</Button>
						</Box>
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
	const {colorMode} = useColorMode();
	return (
		<Box cursor="pointer" onClick={onOpen}>
			<Flex
				className={`${VARIANT}-${colorMode}-selectButton`}
				justify={"space-between"}
				align={"center"}
				shadow={"lg"}
				px={1}
				py={1}
				pr={2}
				mr={-1}
				border={'2px'}
				borderColor={'blackAlpha.200'}
			>
				<Image
					src={"/icons/" + asset?.token.symbol + ".svg"}
					height={34}
					style={{margin: "4px"}}
					width={34}
					alt={asset?.symbol}
				/>

				<Heading fontWeight={'bold'} ml={2} fontSize="xl" color={colorMode == 'light' ? "blackAlpha.800" : "whiteAlpha.800"}>
					{asset.token.symbol}
				</Heading>
				<Box>
					<RiArrowDropDownLine size={30} />
				</Box>
			</Flex>
		</Box>
	);
}

export default Swap;
