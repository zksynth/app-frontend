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
	Progress,
	Image,
	Alert,
	AlertIcon,
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
import axios from "axios";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { getContract, send } from "../../src/contract";
import { useContext } from "react";
import { WalletContext } from "../context/WalletContextProvider";
import { BiPlusCircle } from "react-icons/bi";
import { AppDataContext } from "../context/AppDataProvider";
import { ChainID } from "../../src/chains";
import { useAccount, useNetwork } from "wagmi";
import { dollarFormatter, tokenFormatter } from '../../src/const';
import Big from "big.js";
import InputWithSlider from '../inputs/InputWithSlider';

const DepositModal = ({ asset, handleIssue }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);

	const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

	const [amount, setAmount] = React.useState(0);

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setAmount(0);
		onClose();
	};

	const { chain, availableToBorrow, explorer, togglePoolEnabled, adjustedCollateral, adjustedDebt } =
		useContext(AppDataContext);

	const max = () => {
		return (adjustedCollateral-adjustedDebt)/asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD;
	};

	// 1/1.69 - 1/1.5 = 0.58823529411764705882352941176471 - 0.66666666666666666666666666666667 = -0.07843137254901960784313725490196
	const issue = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");

		let synthex = await getContract("SyntheX", chain);
		let value = BigInt(amount * 10 ** asset.inputToken.decimals).toString();
		send(synthex, asset.isEnabled ? 'issue' : 'enterAndIssue', [asset.id, asset._mintedTokens[selectedAssetIndex].id, value], chain)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleIssue(asset._mintedTokens[selectedAssetIndex].id, value);
				if (!asset.isEnabled) togglePoolEnabled(asset.id);
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};


	const {
		address,
		isConnected,
		isConnecting,
	} = useAccount();

	const { chain: activeChain } = useNetwork();

	return (
		<Box>
			{/* <IconButton
			// disabled={!isConnected}
				variant="ghost"
				onClick={onOpen}
				icon={<BiPlusCircle size={35} color="gray" />}
				aria-label={''}
				isRound={true}></IconButton> */}

			<Button
				onClick={onOpen}
				variant={"ghost"}
				size="sm"
				bgColor={"secondary"}
				rounded={100}
				color="white"
				my={1}
				_hover={{ bgColor: "gray.700" }}
			>
				<Text mr={1}>Mint</Text> <BiPlusCircle size={20} />
			</Button>
			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"} bgColor="">
					<ModalCloseButton />
					<ModalHeader>Issue {asset.name}</ModalHeader>
					<ModalBody>
						
						<Flex justify={'space-between'}>
							<Text my={1} fontSize='sm'>Price: {dollarFormatter.format(asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD)}</Text>
							<Text my={1} fontSize='sm'>Available to borrow: {tokenFormatter.format((adjustedCollateral-adjustedDebt)/asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD)} {asset._mintedTokens[selectedAssetIndex]?.symbol}</Text>
						</Flex>
						<Select my={2} placeholder="Select asset to issue" value={selectedAssetIndex} onChange={(e) => setSelectedAssetIndex(parseInt(e.target.value))}>
							{asset._mintedTokens.map((token: any, index: number) => (
								<option value={index} key={index}>
									{token.symbol}
								</option>
							))}
						</Select>
						<InputWithSlider 
						asset={asset._mintedTokens[selectedAssetIndex]} 
						max={max()} 
						min={0}
						onUpdate={(_value: any) => {
							setAmount(_value);
						}}
						/>
						<Flex mt={2} justify="space-between">
							<Text fontSize={"xs"} color="gray.400">
								1 {asset._mintedTokens[selectedAssetIndex].symbol} = {asset._mintedTokens[selectedAssetIndex].lastPriceUSD}{" "}
								USD
							</Text>
							<Text fontSize={"xs"} color="gray.400">
								Volatility Ratio ={" "}
								{parseFloat(asset.maximumLTV) / 100}
							</Text>
						</Flex>
						<Button
							disabled={
								loading ||
								!(isConnected) || 
								activeChain?.unsupported ||
								!amount ||
								amount == 0 ||
								amount > max()
							}
							isLoading={loading}
							loadingText="Please sign the transaction"
							bgColor="#3EE6C4"
							width="100%"
							mt={4}
							onClick={issue}
						>
							{isConnected && !activeChain?.unsupported ? (
								amount > max() ? (
									<>Insufficient Collateral</>
								) : !amount || amount == 0 ? (
									<>Enter amount</>
								) : (
									<>Issue</>
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

export default DepositModal;
