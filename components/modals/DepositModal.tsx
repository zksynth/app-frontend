import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Input,
	IconButton,
	InputRightElement,
	InputGroup,
	Spinner,
	Link,
	Image,
	InputLeftAddon,
	InputRightAddon,
	Select,
	Alert,
	AlertIcon,
} from "@chakra-ui/react";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";

import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from "@chakra-ui/react";

const Big = require("big.js");

import { AiOutlineInfoCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { getAddress, getContract, send, call } from "../../src/contract";
import { useEffect, useContext } from "react";
import { WalletContext } from "../context/WalletContextProvider";
import { BiPlusCircle } from "react-icons/bi";
import { AppDataContext } from "../context/AppDataProvider";
import axios from "axios";
import { ChainID } from "../../src/chains";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { tokenFormatter } from "../../src/const";
import { BsPlusCircleFill } from "react-icons/bs";

const CLAIM_AMOUNTS: any = {
	WTRX: "100000000000",
	ETH: "1000",
	NEAR: "10000",
};

const DepositModal = ({ handleDeposit }: any) => {
	const [selectedAsset, setSelectedAsset] = React.useState<number>(0);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { collaterals, chain, updateCollateralWalletBalance, addCollateralAllowance, explorer, toggleCollateralEnabled } = useContext(AppDataContext);

	const [amount, setAmount] = React.useState(0);
	const [sliderValue, setSliderValue] = React.useState(0);
	const [claimLoading, setClaimLoading] = useState(false);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);

	// const { isConnected, tronWeb, address } = useContext(WalletContext);
	const { isConnected, address } = useAccount();


	const asset = () => collaterals[selectedAsset];
	const balance = () => {
		if (!asset()) return 0;
		if (!asset().walletBalance) return 0;
		return asset().walletBalance / 10 ** asset().inputToken.decimals;
	};

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setAmount(0);
		onClose();
	};

	const changeAmount = (event: any) => {
		setAmount(event.target.value);
	};

	const deposit = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let synthex = await getContract("SyntheX", chain);
		let value = Big(amount)
			.mul(Big(10).pow(Number(asset().inputToken.decimals)))
			.toFixed(0);

		console.log(asset().isEnabled);

		send(synthex, 'enterAndDeposit', [asset().id, value], chain)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				if (chain == ChainID.NILE) {
					setHash(res);
					checkResponse(res);
				} else {
					setHash(res.hash);
					await res.wait(1);
					setConfirmed(true);
					handleDeposit(
						asset()["id"],
						Big(amount)
							.mul(Big(10).pow(Number(asset().inputToken.decimals)))
							.toFixed(0)
					);
					if(!asset().isEnabled){
						toggleCollateralEnabled(asset().id)
					}
					updateSlider(20)
					setResponse("Transaction Successful!");
				}
			})
			.catch((err: any) => {
				console.log('err', err)
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	const checkResponse = (tx_id: string, retryCount = 0) => {
		axios
			.get(
				"https://nile.trongrid.io/wallet/gettransactionbyid?value=" +
					tx_id
			)
			.then((res) => {
				if (!res.data.ret) {
					setTimeout(() => {
						checkResponse(tx_id);
					}, 2000);
				} else {
					setConfirmed(true);
					if (res.data.ret[0].contractRet == "SUCCESS") {
						setResponse("Transaction Successful!");
						handleDeposit(
							asset()["coll_address"],
							Big(amount)
								.mul(Big(10).pow(Number(asset()["decimal"])))
								.toFixed(0)
						);
					} else {
						if (retryCount < 3)
							setTimeout(() => {
								checkResponse(tx_id, retryCount + 1);
							}, 2000);
						else {
							setResponse(
								"Transaction Failed. Please try again."
							);
						}
					}
				}
			});
	};

	const claim = async () => {
		setClaimLoading(true);
		let token = await getContract("MockToken", chain, asset().id);
		const _amount = ethers.utils
			.parseEther(CLAIM_AMOUNTS[asset().inputToken.symbol])
			.toString();
		send(token, "mint", [address, _amount], chain)
			.then(async (res: any) => {
				console.log(hash);
				setClaimLoading(false);
				updateCollateralWalletBalance(asset().id, _amount, false);
			})
			.catch((err: any) => {
				console.log(err);
				setClaimLoading(false);
			});
	};

	const amountLowerThanMin = () => {
		// if (Number(amount) > asset()?.minCollateral / 10 ** asset().decimal) {
		// 	return false;
		// }
		// return true;
		return false;
	};

	const approve = async () => {
		setLoading(true);
		let collateral = await getContract("ERC20", chain, asset()["id"]);
		send(
			collateral,
			"approve",
			[getAddress("SyntheX", chain), ethers.constants.MaxUint256],
			chain
		)
		.then(async (res: any) => {
			await res.wait(1);
			addCollateralAllowance(asset().id, ethers.constants.MaxUint256.toString());
			setLoading(false);
		})
		.catch((err: any) => {
			console.log('err', err);
			setLoading(false);
		});
	};

	const updateSlider = (e: any) => {
		setSliderValue(e);
		setAmount((balance() * e) / 100);
	};

	const updateAsset = (e: any) => {
		setSelectedAsset(e.target.value);
	};

	const tryApprove = () => {
		// console.log(asset()?.allowance, (amount+0.1));

		// console.log(Big(asset()?.allowance).lt(amount+0.1));
		if (!asset()) return true;
		if (!asset().allowance) return true;
		return Big(asset()?.allowance).lt(ethers.constants.One);
	};

	const {
		address: evmAddress,
		isConnected: isEvmConnected,
		isConnecting: isEvmConnecting,
	} = useAccount();


	return (
		<Box>
			<Button
				width={"100%"}
				size="lg"
				bgColor={"primary"}
				rounded={10}
				onClick={onOpen}
				_hover={{ bgColor: "gray.700", color: "white" }}
			>
				<Text mr={1}>Add</Text> <BiPlusCircle />
			</Button>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent
					width={"30rem"}
					// bgColor="blackAlpha.800" color={"white"}
				>
					<ModalCloseButton />

					<ModalHeader>Deposit collateral</ModalHeader>
					<ModalBody>
						
						{!asset() && <Text mb={4}>Choose an asset you would like to deposit</Text>}
						<Select
							placeholder="Select asset"
							onChange={updateAsset}
							mb={2}
							value={selectedAsset}
						>
							{collaterals.map(
								(collateral: any, index: number) => (
									<option
										key={collateral.symbol}
										value={index}
									>
										{collateral.name}
									</option>
								)
							)}
						</Select>
						{ asset() && <>{tryApprove() ? (
							<>
							<Flex my={4}>
								<Image
									src={`/icons/${asset()?.symbol}.png`}
									alt=""
									width="35"
									height={35}
									mb={5}
								/>
								<Text fontSize={"sm"}>
									To Deposit {asset()?.name} token, you need
									to approve it for SyntheX to use.
								</Text>
							</Flex>
								<Button
									disabled={!(isConnected || isEvmConnected)}
									isLoading={loading}
									loadingText="Please sign the transaction"
									colorScheme={"orange"}
									width="100%"
									mt={4}
									onClick={approve}
									isDisabled={loading}
								>
									{isConnected || isEvmConnected ? (
										<>Approve {asset()?.symbol}</>
									) : (
										<>Please connect your wallet</>
									)}
								</Button>
								</>
						) : (
							<>
								<Box>
									<Flex
										justify={"space-between"}
										align="center"
										width={"100%"}
										mb={2}
									>
										<Text textAlign="right" fontSize={"xs"} color="gray.400">
											Balance:{" "}
											{tokenFormatter.format(balance())}{" "}
											{asset()?.symbol}
										</Text>
										<Button
											isLoading={claimLoading}
											size={"xs"}
											// rounded={40}
											onClick={claim}
											color="black"
											// variant={'ghost'}
										>
											Claim testnet tokens 💰
										</Button>
									</Flex>
									<InputGroup size="md" alignItems={"center"}>
										<Image
											src={`/icons/${asset()?.symbol}.png`}
											alt=""
											width="35"
											height={35}
										/>
										<Input
											type="number"
											placeholder="Enter amount"
											onChange={changeAmount}
											value={amount}
										/>
										<InputRightAddon>
										<Text fontSize={'sm'}>
											{asset()?.inputToken.symbol}
										</Text>
										</InputRightAddon>
									</InputGroup>
									<Slider
										aria-label="slider-ex-1"
										defaultValue={30}
										onChange={updateSlider}
										mt={4}
										value={sliderValue}
									>
										<SliderTrack>
											<SliderFilledTrack bgColor="#3EE6C4" />
										</SliderTrack>
										<SliderThumb />
									</Slider>
									<Flex mt={4} justify="space-between">
										<Text fontSize={"xs"} color="gray.400">
											Volatility Ratio: {asset()?.maximumLTV/100}
										</Text>

										<Text fontSize={"xs"} color="gray.400">
											1 {asset()?.inputToken.symbol} ={" "}
											{asset()?.inputTokenPriceUSD} USD
										</Text>
									</Flex>
								</Box>
								<Button
									isLoading={loading}
									loadingText="Please sign the transaction"
									disabled={
										amountLowerThanMin() ||
										loading ||
										!(isConnected || isEvmConnected) ||
										!amount ||
										amount == 0 ||
										amount > balance()
									}
									bgColor="#3EE6C4"
									color={"gray.800"}
									width="100%"
									mt={4}
									isDisabled={loading}
									onClick={deposit}
								>
									{isConnected || isEvmConnected ? (
										!amount || amount == 0 ? (
											"Enter amount"
										) : amountLowerThanMin() ? (
											"Amount too less"
										) : amount > balance() ? (
											"Insufficient Balance"
										) : (
											<>Deposit</>
										)
									) : (
										<>Please connect your wallet</>
									)}
								</Button>
							</>
						)}</>} 

						{response && (
							<Box width={"100%"} my={2} color="black">
								<Alert
									status={
										response.includes("confirm")
											? "info"
											: confirmed &&
											  response.includes("Success")
											? "success"
											: "error"
									}
									variant="subtle"
									rounded={6}
								>
									<AlertIcon />
									<Box>
										<Text fontSize="md" mb={0}>
											{response}
										</Text>
										{hash && (
											<Link
												href={explorer() + hash}
												target="_blank"
											>
												{" "}
												<Text fontSize={"sm"}>
													View on explorer
												</Text>
											</Link>
										)}
									</Box>
								</Alert>
							</Box>
						)}
					</ModalBody>
					<ModalFooter>
						<AiOutlineInfoCircle size={20} />
						<Text ml="2">More Info</Text>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default DepositModal;
