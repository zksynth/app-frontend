import React, { useContext, useState } from "react";
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

import { BiMinusCircle } from "react-icons/bi";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { getContract, send } from "../../src/contract";
import { WalletContext } from "../context/WalletContextProvider";
import { AppDataContext } from "../context/AppDataProvider";
const { Big } = require("big.js");
import axios from "axios";
import { ChainID } from "../../src/chains";
import { useAccount, useNetwork } from "wagmi";
import InputWithSlider from "../inputs/InputWithSlider";
import { tokenFormatter } from '../../src/const';

const WithdrawModal = ({ asset, handleWithdraw }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [amount, setAmount] = React.useState(0);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);

	const { safeCRatio, totalCollateral, totalDebt, chain, explorer } =
		useContext(AppDataContext);
	const {
		address,
		isConnected,
		isConnecting,
	} = useAccount();

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setAmount(0);
		onClose();
	};

	const max = () => {
		return (
			(0.999 * ((totalCollateral * 100) / safeCRatio) - totalDebt) /
			asset.inputTokenPriceUSD
		);
	};

	const withdraw = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let synthex = await getContract("SyntheX", chain);
		let value = Big(amount)
			.mul(Big(10).pow(Number(asset.inputToken.decimals)))
			.toFixed(0);
		send(synthex, "withdraw", [asset.id, value], chain)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");

				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleWithdraw(asset.id, value);
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	const { chain: activeChain } = useNetwork();

	return (
		<Box>
			<IconButton
				variant="ghost"
				onClick={onOpen}
				color="gray.400"
				icon={<BiMinusCircle size={37} />}
				aria-label={""}
				isRound={true}
			></IconButton>
			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"}>
					<ModalCloseButton />
					<ModalHeader>
						Withdraw collateral
					</ModalHeader>
					<ModalBody>
						<Text fontSize={'xs'} color='gray' mt={-2} mb={2} textAlign='right'>Max {tokenFormatter.format(max())} {asset.inputToken.symbol}</Text>
						<InputWithSlider
							asset={asset.inputToken}
							max={max()}
							min={0}
							onUpdate={(_value: any) => {
								setAmount(_value);
							}}
							color={'red.400'}
						/>
						<Flex mt={2} justify="space-between">
							<Text fontSize={"xs"} color="gray.400">
								1 {asset.inputToken.symbol} ={" "}
								{asset.inputTokenPriceUSD} USD
							</Text>
						</Flex>
						<Button
							disabled={
								loading ||
								!isConnected || 
								activeChain?.unsupported ||
								!amount ||
								amount == 0 ||
								amount > max()
							}
							loadingText="Please sign the transaction"
							isLoading={loading}
							colorScheme={"red"}
							width="100%"
							mt={4}
							onClick={withdraw}
						>
							{isConnected && !activeChain?.unsupported ? (
								amount > max() ? (
									<>Insufficient Collateral</>
								) : !amount || amount == 0 ? (
									<>Enter amount</>
								) : (
									<>Withdraw</>
								)
							) : (
								<>Please connect your wallet</>
							)}
						</Button>

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

export default WithdrawModal;
