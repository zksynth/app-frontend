import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Link,
	Image,
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

const Big = require("big.js");

import { AiFillPlusCircle, AiOutlineInfoCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { getAddress, getContract, send, call } from "../../src/contract";
import { useEffect, useContext } from "react";
import { WalletContext } from "../context/WalletContextProvider";
import { BiPlusCircle } from "react-icons/bi";
import { AppDataContext } from "../context/AppDataProvider";
import axios from "axios";
import { ChainID } from "../../src/chains";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { tokenFormatter } from "../../src/const";
import InputWithSlider from "../inputs/InputWithSlider";
import { MdOutlineAddCircle } from 'react-icons/md';
import { FaCoins } from "react-icons/fa";

const CLAIM_AMOUNTS: any = {
	WTRX: "100000000",
	ETH: "10",
	NEAR: "1000",
};

const DepositModal = ({ handleDeposit }: any) => {
	const [selectedAsset, setSelectedAsset] = React.useState<number>(0);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		collaterals,
		chain,
		updateCollateralWalletBalance,
		addCollateralAllowance,
		explorer,
		toggleCollateralEnabled,
	} = useContext(AppDataContext);

	const [amount, setAmount] = React.useState(0);
	const [claimLoading, setClaimLoading] = useState(false);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);

	// const { isConnected, tronWeb, address } = useContext(WalletContext);
	const { isConnected, address } = useAccount();
	const { chain: activeChain } = useNetwork();
	const { data: ethBalance } = useBalance({
		address,
	});

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

		send(
			synthex,
			asset().isEnabled ? "deposit" : "enterAndDeposit",
			[asset().id, value],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleDeposit(
					asset()["id"],
					Big(amount)
						.mul(Big(10).pow(Number(asset().inputToken.decimals)))
						.toFixed(0)
				);
				if (!asset().isEnabled) {
					toggleCollateralEnabled(asset().id);
				}
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				console.log("err", err);
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
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
		let collateral = await getContract("MockToken", chain, asset()["id"]);
		send(
			collateral,
			"approve",
			[getAddress("SyntheX", chain), ethers.constants.MaxUint256],
			chain
		)
			.then(async (res: any) => {
				await res.wait(1);
				addCollateralAllowance(
					asset().id,
					ethers.constants.MaxUint256.toString()
				);
				setLoading(false);
			})
			.catch((err: any) => {
				console.log("err", err);
				setLoading(false);
			});
	};

	const updateAsset = (e: any) => {
		setSelectedAsset(e.target.value);
	};

	const tryApprove = () => {
		if (!asset()) return true;
		if (!asset().allowance) return true;
		return Big(asset()?.allowance).lt(ethers.constants.One);
	};

	return (
		<Box>
			<Button
				width={"100%"}
				size="lg"
				rounded={40}
				onClick={onOpen}
				bgColor="primary"
				_hover={{ opacity: 0.6 }}
			>
				<MdOutlineAddCircle size={22} /> <Text ml={'2px'}>Add</Text>
			</Button>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent
					width={"30rem"}
					// bgColor="blackAlpha.800" color={"white"}
				>
					<ModalCloseButton />

					<ModalHeader>Add collateral</ModalHeader>
					<ModalBody>
						{!asset() && (
							<Text mb={4}>
								Choose an asset you would like to deposit
							</Text>
						)}
						<Select
							placeholder="Select asset"
							onChange={updateAsset}
							mb={2}
							value={selectedAsset}
						>
							{collaterals.map(
								(collateral: any, index: number) => (
									<option key={index} value={index}>
										{collateral.name}
									</option>
								)
							)}
						</Select>
						{asset() && (
							<>
								{tryApprove() ? (
									<>
										<Flex my={6} gap={2}>
											<Image
												src={`/icons/${asset()?.inputToken.symbol?.toUpperCase()}.png`}
												alt=""
												width="35"
												height={35}
												my={1}
											/>
											<Text fontSize={"sm"}>
												To Deposit {asset()?.name}{" "}
												token, you need to approve it
												for SyntheX to use.
											</Text>
										</Flex>
										<Button
											disabled={
												ethBalance?.value.lt(
													ethers.utils.parseEther(
														"0.01"
													)
												) ||
												!isConnected ||
												activeChain?.unsupported
											}
											isLoading={loading}
											loadingText="Please sign the transaction"
											colorScheme={"orange"}
											width="100%"
											onClick={approve}
											isDisabled={loading}
										>
											{isConnected &&
											!activeChain?.unsupported ? (
												ethBalance?.value.lt(
													ethers.utils.parseEther(
														"0.01"
													)
												) ? (
													<>
														Insufficient ETH for gas
														⛽️
													</>
												) : (
													<>
														Approve{" "}
														{asset()?.symbol}
													</>
												)
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
												<Text
													textAlign="right"
													fontSize={"xs"}
													color="gray.400"
												>
													Balance:{" "}
													{tokenFormatter.format(
														balance()
													)}{" "}
													{asset()?.symbol}
												</Text>
												<Button
													isLoading={claimLoading}
													size={"xs"}
													onClick={claim}
													color="white"
													variant={"solid"}
													rounded={20}
												>
													<FaCoins/> <Text ml={2}>Claim w{asset()?.inputToken.symbol?.toUpperCase()}</Text>
												</Button>
											</Flex>

											<InputWithSlider
												asset={asset().inputToken}
												onUpdate={(_value: any) => {
													setAmount(_value);
												}}
												max={balance()}
												min={0}
											/>

											<Flex
												mt={2}
												justify="space-between"
											>
												<Text
													fontSize={"xs"}
													color="gray.400"
												>
													Volatility Ratio:{" "}
													{asset()?.maximumLTV / 100}
												</Text>

												<Text
													fontSize={"xs"}
													color="gray.400"
												>
													1{" "}
													{asset()?.inputToken.symbol}{" "}
													={" "}
													{
														asset()
															?.inputTokenPriceUSD
													}{" "}
													USD
												</Text>
											</Flex>
										</Box>
										<Button
											isLoading={loading}
											loadingText="Please sign the transaction"
											disabled={
												amountLowerThanMin() ||
												loading ||
												!isConnected ||
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
											{isConnected ? (
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
								)}
							</>
						)}

						{response && (
							<Box width={"100%"} my={2}>
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
