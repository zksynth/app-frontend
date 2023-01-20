import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Select,
	IconButton,
	InputGroup,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	NumberInput,
	NumberInputField,
} from "@chakra-ui/react";

import { AiOutlineInfoCircle, AiOutlinePlus } from "react-icons/ai";
import { getContract, send } from "../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { dollarFormatter, tokenFormatter } from "../../src/const";
import Big from "big.js";
import InputWithSlider from "../inputs/InputWithSlider";
import Response from "./utils/Response";
import InfoFooter from "./utils/InfoFooter";
import Image from "next/image";

const ROUNDING = 0.98;

const IssueModal = ({ asset, handleIssue }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setMessage("");
		setAmount('0');
		setAmountNumber(0);
		onClose();
	};

	const {
		chain,
		togglePoolEnabled,
		adjustedCollateral,
		adjustedDebt,
		safeCRatio,
	} = useContext(AppDataContext);

	const max = () => {
		if (!Number(safeCRatio)) return '0';
		if (!Number(asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD)) return '0';
		// MAX = ((Ac/safeC) - Ad)*Vr
		return Big(asset.maximumLTV / 100)
			.times(Big(adjustedCollateral).div(safeCRatio).minus(adjustedDebt))
			.div(asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD)
			.toString();
	};

	const issue = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");

		let synthex = await getContract("SyntheX", chain);
		let value = Big(amount)
			.times(10 ** asset.inputToken.decimals)
			.toFixed(0);
		send(
			synthex,
			"issue",
			[asset.id, asset._mintedTokens[selectedAssetIndex].id, value],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleIssue(asset._mintedTokens[selectedAssetIndex].id, value);
				if (!asset.isEnabled) togglePoolEnabled(asset.id);
				setResponse("Transaction Successful!");
				setMessage(
					`You have successfully issued ${tokenFormatter.format(
						amountNumber
					)} ${asset._mintedTokens[selectedAssetIndex].symbol}`
				);
			})
			.catch((err: any) => {
				console.log(err);
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
				setMessage(JSON.stringify(err));
			});
	};

	const { isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	const _setAmount = (e: string) => {
		setAmount(e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	}

	const handleMax = () => {
		setAmount(max());
		setAmountNumber(
			isNaN(Number(max())) ? 0 : Number(max())
		);
	};


	return (
		<Box>
			<IconButton
				variant="solid"
				onClick={onOpen}
				icon={<AiOutlinePlus />}
				aria-label={""}
				isRound={true}
				p={2}
			></IconButton>
			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"} bgColor="">
					<ModalCloseButton />
					<ModalHeader>{asset.name}</ModalHeader>
					<ModalBody>
						

						<Box mb={10} mt={4}>
						<Flex justify={"center"} mb={2}>
							<Flex
								width={"33%"}
								justify={"center"}
								align="center"
								gap={2}
								bg="gray.600"
								rounded="full"
								pl={2}
							>
								<Image
									src={`/icons/${asset._mintedTokens[
										selectedAssetIndex
									].symbol.toUpperCase()}.png`}
									alt=""
									width={"40"}
									height={"40"}
								/>

								<Select
									variant={"unstyled"}
									my={2}
									placeholder="Select asset to issue"
									value={selectedAssetIndex}
									onChange={(e) =>
										{
											setSelectedAssetIndex(
											parseInt(e.target.value)
										)
										setAmount('0')
										setAmountNumber(0)
									}
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
							</Flex>
						</Flex>
						<InputGroup variant={"unstyled"} display="flex">
							<NumberInput
								w={"100%"}
								value={Number(amount) > 0
									? tokenFormatter.format(parseFloat(amount))
									: amount}
								onChange={_setAmount}
								min={0}
								step={0.01}
								display="flex"
								alignItems="center"
								justifyContent={"center"}
							>
								<NumberInputField
									textAlign={"center"}
									pr={0}
									fontSize={"5xl"}
								/>
							</NumberInput>
						</InputGroup>

						<Text
							fontSize="sm"
							textAlign={"center"}
							color={"gray.400"}
						>
							{dollarFormatter.format(
								asset._mintedTokens[selectedAssetIndex]
									?.lastPriceUSD * amountNumber
							)}
						</Text>

						</Box>

						<Flex mt={2} justify="space-between">
							{/* <Text fontSize={"xs"} color="gray.400">
								1 {asset._mintedTokens[selectedAssetIndex].symbol} = {asset._mintedTokens[selectedAssetIndex].lastPriceUSD}{" "}
								USD
							</Text> */}
							<Text fontSize={"xs"} color="gray.400">
								Market LTV = {parseFloat(asset.maximumLTV)} %
							</Text>

							<Flex gap={1}>
								<Text fontSize={"xs"} color="gray.400">
									Max:
								</Text>

								<Text
									cursor={"pointer"}
									onClick={handleMax}
									textDecor="underline"
									fontSize={"xs"}
									color="gray.400"
								>
									{tokenFormatter.format(parseFloat(max()))}{" "}
									{
										asset._mintedTokens[selectedAssetIndex]
											.symbol
									}
								</Text>
							</Flex>
						</Flex>
						<Button
							disabled={
								loading ||
								!isConnected ||
								activeChain?.unsupported ||
								!amount ||
								amountNumber == 0 ||
								amountNumber > parseFloat(max())
							}
							isLoading={loading}
							loadingText="Please sign the transaction"
							bgColor="primary"
							width="100%"
							color="gray.700"
							mt={4}
							onClick={issue}
							size="lg"
							rounded={16}
							_hover={{
								opacity: "0.5",
							}}
						>
							{isConnected && !activeChain?.unsupported ? (
								amountNumber > parseFloat(max()) ? (
									<>Insufficient Collateral</>
								) : !amount || amountNumber == 0 ? (
									<>Enter amount</>
								) : (
									<>Mint ✨</>
								)
							) : (
								<>Please connect your wallet</>
							)}
						</Button>

						<Response
							response={response}
							message={message}
							hash={hash}
							confirmed={confirmed}
						/>
					</ModalBody>
					<InfoFooter
						message="
						You can issue a new asset against your collateral. Debt is dynamic and depends on total debt of the pool.
					"
					/>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default IssueModal;
