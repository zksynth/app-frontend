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
import { useRouter } from "next/router";
import { base58 } from "ethers/lib/utils.js";
import { useToast } from '@chakra-ui/react';
const Big = require("big.js");
import { ExternalLinkIcon, InfoIcon } from "@chakra-ui/icons";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

function Swap() {
	const [inputAssetIndex, setInputAssetIndex] = useState(1);
	const [outputAssetIndex, setOutputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState(0);
	const [outputAmount, setOutputAmount] = useState(0);
	const [nullValue, setNullValue] = useState(false);
	const [gas, setGas] = useState(0);
	const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure()
	const [hidden, setHidden] = useState(!isOpen);
	const { chain } = useNetwork();

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
		// let contract = await getContract("ERC20X", chain?.id!, pools[tradingPool].synths[inputAssetIndex].token.id);
		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		const _inputAmount = inputAmount;
		const _inputAsset =
			pools[tradingPool].synths[inputAssetIndex].token.symbol;
		const _outputAsset =
			pools[tradingPool].synths[outputAssetIndex].token.symbol;
		const _outputAmount = outputAmount;

		let _referral = useReferral ? BigNumber.from(base58.decode(referral!)).toHexString() : ethers.constants.AddressZero;

		// const pythFeeds = pools[tradingPool].synths.filter((c: any) => (c.feed != ethers.constants.HashZero) && (c.token.symbol == _inputAsset || c.token.symbol == _outputAsset)).map((c: any) => c.feed);
		// const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
		// const priceFeedUpdateData = await pythPriceService.getPriceFeedsUpdateData(pythFeeds);

		send(
			pool,
			"swap",
			[
				pools[tradingPool].synths[inputAssetIndex].token.id,
				ethers.utils.parseEther(inputAmount.toString()),
				pools[tradingPool].synths[outputAssetIndex].token.id,
				0,
				address,
				// priceFeedUpdateData
			]
		)
			.then(async (res: any) => {
				// setMessage("Confirming...");
				// setResponse("Transaction sent! Waiting for confirmation");
				// setHash(res.hash);
				const response = await res.wait(1);
				// decode response.logs
				const decodedLogs = response.logs.map((log: any) =>
				{try {
					return pool.interface.parseLog(log);
				} catch (e) {
					console.log(e);
				}}
				);
				if(chain?.id! == 280){
					decodedLogs.pop();
				}
				console.log(decodedLogs);
				console.log(decodedLogs[decodedLogs.length - 3].args.value.toString(), decodedLogs[decodedLogs.length - 2].args.value.toString(), decodedLogs[decodedLogs.length - 1].args.value.toString());

				setConfirmed(true);
				handleExchange(
					inputToken().token.id,
					outputToken().token.id,
					decodedLogs[decodedLogs.length - 1].args.value.toString(),
					decodedLogs[decodedLogs.length - 3].args.value.toString(),
				);
				// setMessage(
				// 	"Transaction Successful!"
				// );
				setInputAmount(0);
				setOutputAmount(0);

				// setTimeout(() => {
				// 	setMessage("");
				// 	setResponse("");
				// 	setHash(null);
				// }, 10000)
				// setResponse(`Swapped ${_inputAmount} ${_inputAsset} for ${_outputAmount} ${_outputAsset}`);

				setLoading(false);
				toast({
					title: "Swap Successful!",
					description: <Box>
						<Text>
					{`Swapped ${_inputAmount} ${_inputAsset} for ${_outputAmount} ${_outputAsset}`}
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
				// setMessage(JSON.stringify(err));
				// setConfirmed(true);
				// setResponse("Transaction failed. Please try again!");
			});
	};

	useEffect(() => {
		if (pools[tradingPool] && !isNaN(Number(inputAmount)) && validateInput() == 0)
			getContract("Pool", chain?.id!, pools[tradingPool].id).then(async (contract: any) => {
				// const pythFeeds = pools[tradingPool].synths.filter((c: any) => (c.feed != ethers.constants.HashZero) && (c.token.id == inputToken().token.id || c.token.id == outputToken().token.id)).map((c: any) => c.feed);
				// const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
				// const priceFeedUpdateData = await pythPriceService.getPriceFeedsUpdateData(pythFeeds);

				// estimate gas
				contract.estimateGas
					.swap(
						pools[tradingPool].synths[inputAssetIndex].token.id,
						ethers.utils.parseEther(inputAmount.toString()),
						pools[tradingPool].synths[outputAssetIndex].token.id,
						0,
						address,
						// priceFeedUpdateData
					)
					.then((gas: any) => {
						setGas(
							Number(ethers.utils.formatUnits(gas, "gwei")) * 2000 / 10
						);
					})
					.catch((err: any) => {
						console.log(err);
					});
			});
	});

	const { isConnected, address } = useAccount();

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

	const [useReferral, setUseReferral] = useState(false);
	const [referral, setReferral] = useState<string | null>(null);

	const router = useRouter();

	useEffect(() => {
		if (referral == null) {
			const { ref: refCode } = router.query;
			if (refCode) {
				setReferral(refCode as string);
				setUseReferral(true);
			} else {
				setUseReferral(false);
			}
		}
	});

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
					.toString()
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
			return Big(inputAmount).gt(Big(inputToken().walletBalance ?? 0).div(1e18));
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
		else if (inputAmount <= 0) return ERRORS.INVALID_AMOUNT
		else if (swapInputExceedsBalance()) return ERRORS.INSUFFICIENT_BALANCE
		else return 0
	}

	// const _setUseReferral = () => {
	// 	if (useReferral) {
	// 		setReferral("");
	// 		setUseReferral(false);
	// 	} else {
	// 		const { ref: refCode } = router.query;
	// 		if (refCode) {
	// 			setReferral(refCode as string);
	// 		} else {
	// 			setReferral("");
	// 		}
	// 		setUseReferral(true);
	// 	}
	// };

	const isValid = () => {
		if (referral == "" || referral == null) return true;
		try {
			const decodedString = BigNumber.from(
				base58.decode(referral!)
			).toHexString();
			return ethers.utils.isAddress(decodedString);
		} catch (err) {
			return false;
		}
	};

	return (
		<>
			<Head>
				<title>
					{" "}
					{tokenFormatter.format(
						inputToken()?.priceUSD / outputToken()?.priceUSD
					)}{" "}
					{outputToken()?.token.symbol}/{inputToken()?.token.symbol} | ZKSynth
				</title>
				<link rel="icon" type="image/x-icon" href="/veZS.png"></link>
			</Head>
			{pools[tradingPool] ? (
				<Box shadow='2xl' rounded={16}>
					<Box px="5" py={10} roundedTop={15} 
						// bg={"whiteAlpha.100"}
					>
						<Flex align="center" justify={"space-between"}>
							<InputGroup width={"70%"}>
								<Input
									{...inputStyle}
									value={inputAmount}
									onChange={updateInputAmount}
									min={0}
								/>
							</InputGroup>

							<SelectBody
								onOpen={onInputOpen}
								asset={inputToken()}
							/>
						</Flex>

						<Flex
							fontSize={"sm"}
							color="blackAlpha.700"
							justify={"space-between"}
							align="center"
							mt={4}
							mr={2}
						>
							<Text>
								{dollarFormatter.format(
									inputAmount * inputToken()?.priceUSD 
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
											? Big(inputToken().walletBalance ?? 0)
													.div(1e18)
													.toNumber()
											: 0
									)}
								</Text>
							</Flex>
						</Flex>
					</Box>

					<Flex px="5" mt={-5} align='center'>
						<Divider w={'10px'} border='1px' borderColor={'blackAlpha.300'} />
						<Button
							bg="whiteAlpha.50"
							border={'2px'}
							borderColor={'blackAlpha.300'}
							_hover={{ bg: "blackAlpha.50" }}
							rounded="100%"
							onClick={switchTokens}
							variant="unstyled"
							w={"40px"}
							h={"40px"}
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<MdOutlineSwapVert size={"18px"} />
						</Button>
						<Divider border='1px' borderColor={'blackAlpha.300'} />

					</Flex>

					<Box px="5" pt={7} roundedBottom={15} bg={"whiteAlpha"}>
						{/* Output */}
						<Flex align="center" justify={"space-between"}>
							<InputGroup width={"70%"}>
								<Input
									{...inputStyle}
									value={outputAmount}
									onChange={updateOutputAmount}
									min={0}
								/>
							</InputGroup>

							<SelectBody
								onOpen={onOutputOpen}
								asset={outputToken()}
							/>
						</Flex>

						<Flex
							fontSize={"sm"}
							color="blackAlpha.700"
							justify={"space-between"}
							align="center"
							mt={4}
							mb={-4}
							mr={2}
						>
							<Text>
								{dollarFormatter.format(
									outputAmount * outputToken()?.priceUSD
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
					
					{ gas > 0 && <Box pb={10} pt={5}>
						<Flex
							justify="space-between"
							align={"center"}
							mt={12}
							mb={!isOpen ? !account ? '-4' : '-6' : '0'}
							bg="blackAlpha.50"
							color="blackAlpha.700"
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
								
								animate={{ height: isOpen ? 94 : 0 }}
								style={{
								height: 94,
								width: '100%',
								}}
							>
								{isOpen && 	
								<Box border={'2px'} borderColor='whiteAlpha.200' mt={2} px={4} py={2} rounded={16} fontSize='sm' color={'gray.400'}>
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

						{/* <Box py={5}>
						{!account && (
							<>
								{" "}
								<Flex mt={isOpen ? 8 : 3} mb={3} gap={2} align={"center"}>
									<Text
										fontSize={"sm"}
										color="gray.400"
										fontWeight={"bold"}
									>
										Use Referral Code
									</Text>
									<Switch
										colorScheme={"primary"}
										isChecked={useReferral}
										onChange={_setUseReferral}
									/>
								</Flex>
								<Collapse in={useReferral} animateOpacity>
									<Box mb={2} >
										<Input
											placeholder="Referral Code"
											value={referral!}
											onChange={(e) =>
												setReferral(e.target.value)
											}
											isInvalid={!isValid()}
											errorBorderColor="red.400"
											colorScheme={"primary"}
										/>
									</Box>
								</Collapse>{" "}
							</>
						)}
						</Box> */}
						</Box>}

						<Button
							mt={!gas ? 14 : 0}
							mb={5}
							size="lg"
							fontSize={"xl"}
							width={"100%"}
							// bgColor={"primary.400"}
							bgGradient="linear(to-b, primary.400, primary.400)"
							rounded={16}
							onClick={exchange}
							isDisabled={
								loading ||
								validateInput() > 0 ||
								!isValid() || 
								pools[tradingPool].paused
							}
							loadingText="Sign the transaction in your wallet"
							isLoading={loading}
							_hover={{ opacity: 0.6 }}
							color="white"
							height={"55px"}
						>
							{pools[tradingPool].paused ? 'Market Paused Till 5PM EDT' : !isValid() ? 'Invalid Referral' : validateInput() > 0 ? ERROR_MSG[validateInput()] : "Swap"}
						</Button>
						{hash && <Box mt={-5} pb={4}>
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
				border={"2px"}
				borderColor="blackAlpha.200"
				px={1}
				py={1}
				pr={2}
				gap={1}
				mr={-1}
			>
				<Image
					src={"/icons/" + asset?.token.symbol + ".svg"}
					height={34}
					style={{margin: "4px"}}
					width={34}
					alt={asset?.symbol}
				/>

				<Text fontSize="xl" color="blackAlpha.600" fontWeight={"bold"}>
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
