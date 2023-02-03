import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	IconButton,
	Select,
	InputGroup,
	NumberInputField,
} from "@chakra-ui/react";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	NumberInput
} from "@chakra-ui/react";
import Image from "next/image";
import { AiOutlineMinus } from "react-icons/ai";
import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { tokenFormatter, dollarFormatter } from '../../../src/const';
import Big from "big.js";
import Response from "../_utils/Response";
import InfoFooter from "../_utils/InfoFooter";

const RepayModal = ({ asset, handleRepay }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);
	const [message, setMessage] = useState('');

	const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

	const { chain } = useContext(AppDataContext);

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setAmount('0');
		setAmountNumber(0);
		onClose();
	};

	const max = () => {
		if(!Number(asset._mintedTokens[selectedAssetIndex].lastPriceUSD)) return '0';

		return Math.min(
			Big(asset._mintedTokens[selectedAssetIndex].balance ?? 0).div(
				10 ** asset.inputToken.decimals
			).toNumber(),
			Big(asset.balance ?? 0).div(
				10 ** asset.inputToken.decimals
			).div(
				asset._mintedTokens[selectedAssetIndex].lastPriceUSD
			).toNumber()
		).toString();
	};

	const repay = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage('');
		let synthex = await getContract("SyntheX", chain);
		const _amount = amount;
		const _asset = asset._mintedTokens[selectedAssetIndex].symbol;
		let value = Big(amount).times(10 ** asset.inputToken.decimals).toFixed(0);
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
				setMessage(`Repaid ${_amount} ${_asset}`);
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setMessage(JSON.stringify(err));
				setResponse("Transaction failed. Please try again!");
			});
	};

	const { address, isConnected, isConnecting } = useAccount();
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
				bg={'blackAlpha.300'}
				_hover={{ bg: 'blackAlpha.600' }}
				onClick={onOpen}
				icon={<AiOutlineMinus />}
				aria-label={""}
				isRound={true}
				size={"lg"}
			></IconButton>
			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"} bgColor="gray.800" rounded={16}>
					<ModalCloseButton rounded={'full'} mt={1}/>
					<ModalHeader>{asset.name}</ModalHeader>
					<ModalBody>
					<Box mt={4} mb={10}>
						<Flex justify={"center"} mb={2}>
							<Flex
								width={"33%"}
								justify={"center"}
								align="center"
								gap={2}
								bg="gray.600"
								rounded="full"
							>
								<Image
									src={`/icons/${asset._mintedTokens[
										selectedAssetIndex
									].symbol}.svg`}
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
										setAmount('0');
										setAmountNumber(0);
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
								value={amount}
								onChange={_setAmount}
								min={0}
								step={0.01}
								display="flex"
								alignItems="center"
								justifyContent={"center"}
							>
								<NumberInputField
									placeholder="0"
									textAlign={"center"}
									pr={0}
									fontSize={"6xl"}
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
							<Text fontSize={"xs"} color="gray.400">
								1 {asset._mintedTokens[selectedAssetIndex].symbol} = {dollarFormatter.format(asset._mintedTokens[selectedAssetIndex].lastPriceUSD)}
							</Text>
							{/* <Text fontSize={"xs"} color="gray.400">
								Market LTV = {parseFloat(asset.maximumLTV)} %
							</Text> */}

							<Flex gap={1}>
								<Text fontSize={"xs"} color="gray.400">
									Available:
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
							bgColor='secondary'
							width="100%"
							mt={4}
							onClick={repay}
							loadingText="Please sign the transaction"
							size={'lg'}
							rounded={16}
						>
							{(isConnected && !activeChain?.unsupported) ? (
								amountNumber > parseFloat(max()) ? (
									<>Insufficient Debt</>
								) : !amount || amountNumber == 0 ? (
									<>Enter amount</>
								) : (
									<>Burn </>
								)
							) : (
								<>Please connect your wallet</>
							)}
						</Button>

						<Response response={response} message={message} hash={hash} confirmed={confirmed} />
					</ModalBody>

					<InfoFooter message='
						Repaying your debt will reduce your liquidation risk. If your health falls below 100%, you will be liquidated and your collateral will be sold to repay your debt.
					'/>

				</ModalContent>
			</Modal>
		</Box>
	);
};

export default RepayModal;
