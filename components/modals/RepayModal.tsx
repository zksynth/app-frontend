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
	AlertIcon,
	Alert,
	Select,
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
import { useContext } from "react";
import { WalletContext } from "../context/WalletContextProvider";
import axios from "axios";
import { AppDataContext } from "../context/AppDataProvider";
import { ChainID } from "../../src/chains";
import { useAccount } from "wagmi";
import { tokenFormatter } from "../../src/const";
import InputWithSlider from '../inputs/InputWithSlider';

const RepayModal = ({ asset, handleRepay }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [amount, setAmount] = React.useState(0);

	const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

	const { chain, explorer } = useContext(AppDataContext);

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

	const setMax = () => {
		setAmount(max());
	};

	const max = () => {
		return Math.min(
			asset._mintedTokens[selectedAssetIndex].balance /
				10 ** asset.inputToken.decimals, // user token balance
			asset.balance /
				10 ** asset.inputToken.decimals /
				asset._mintedTokens[selectedAssetIndex].lastPriceUSD // debt in terms of this token
		);
	};

	const repay = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let synthex = await getContract("SyntheX", chain);
		let value = BigInt(amount * 10 ** asset.inputToken.decimals).toString();
		send(
			synthex,
			"burn",
			[asset.id, asset._mintedTokens[selectedAssetIndex].id, value],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleRepay(asset._mintedTokens[selectedAssetIndex].id, value);
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	const { address, isConnected, isConnecting } = useAccount();

	return (
		<Box>
			<IconButton
				// disabled={!isConnected}
				variant="ghost"
				onClick={onOpen}
				icon={<BiMinusCircle size={20} color="gray" />}
				aria-label={""}
				isRound={true}
				bgColor="white"
				size={"sm"}
				my={1}
			></IconButton>
			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"}>
					<ModalCloseButton />
					<ModalHeader>Repay {asset["symbol"]}</ModalHeader>
					<ModalBody>
						<Flex>
							<Text fontSize="sm">
								Balance:{" "}
								{tokenFormatter.format(
									asset._mintedTokens[selectedAssetIndex]
										.balance /
										10 ** asset.inputToken.decimals
								)}{" "}
								{asset._mintedTokens[selectedAssetIndex].symbol}
							</Text>
						</Flex>
						<Select
							my={1}
							placeholder="Select asset to issue"
							value={selectedAssetIndex}
							onChange={(e) =>
								setSelectedAssetIndex(parseInt(e.target.value))
							}
						>
							{asset._mintedTokens.map(
								(token: any, index: number) => (
									<option value={index} key={index}>
										{token.symbol}
									</option>
								)
							)}
						</Select>
						<InputWithSlider asset={asset._mintedTokens[selectedAssetIndex]} max={max()} min={0} onUpdate={(_value: any) => {setAmount(_value)}} color='red.400'/>
						<Flex mt={2} justify="space-between">
							<Text fontSize={"xs"} color="gray.400">
								1 {asset._mintedTokens[selectedAssetIndex].symbol} = {asset._mintedTokens[selectedAssetIndex].lastPriceUSD} USD
							</Text>
						</Flex>
						<Button
							disabled={
								loading ||
								!isConnected ||
								!amount ||
								amount == 0 ||
								amount > max()
							}
							isLoading={loading}
							colorScheme={"red"}
							width="100%"
							mt={4}
							onClick={repay}
							loadingText="Please sign the transaction"
						>
							{isConnected ? (
								amount > max() ? (
									<>Insufficient Debt</>
								) : !amount || amount == 0 ? (
									<>Enter amount</>
								) : (
									<>Repay</>
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

export default RepayModal;
