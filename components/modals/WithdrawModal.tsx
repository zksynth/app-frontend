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
import Response from "./utils/Response";
import InfoFooter from "./utils/InfoFooter";

const WithdrawModal = ({ asset, handleWithdraw }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [amount, setAmount] = React.useState(0);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState('');

	const { safeCRatio, adjustedCollateral, adjustedDebt, chain, explorer } =
		useContext(AppDataContext);
	const { isConnected } = useAccount();

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setAmount(0);
		onClose();
	};

	const max = () => {
		return Big(asset.maximumLTV/100).times(Big(adjustedCollateral).div(safeCRatio).minus(adjustedDebt)).div(asset.inputTokenPriceUSD).toNumber();
	};

	const withdraw = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let synthex = await getContract("SyntheX", chain);
		const _amount = amount;
		const _asset = asset.inputToken.symbol;
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
				setMessage(`You have successfully withdrawn ${_amount} ${_asset} from your position!`)
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setMessage(JSON.stringify(err))
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
						<Flex mt={-2} mb={2} justify='space-between'>
						<Text fontSize={"xs"} color="gray.400">
								1 {asset.inputToken.symbol} ={" "}
								{asset.inputTokenPriceUSD} USD
							</Text>
						<Text fontSize={'xs'} color='gray.400'  textAlign='right'>Max {tokenFormatter.format(max())} {asset.inputToken.symbol}</Text>
						</Flex>
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
							bgColor='red.400'
							width="100%"
							mt={4}
							onClick={withdraw}
							color='white'
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

						<Response response={response} message={message} hash={hash} confirmed={confirmed} />
					</ModalBody>

					<InfoFooter 
						message='
						By withdrawing your collateral, your health factor will reduce. 
						You will be able to borrow less and your position will be at risk of liquidation.
					'/>

				</ModalContent>
			</Modal>
		</Box>
	);
};

export default WithdrawModal;
