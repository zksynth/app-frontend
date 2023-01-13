import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	IconButton,
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
import { AppDataContext } from "../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { tokenFormatter } from "../../src/const";
import InputWithSlider from '../inputs/InputWithSlider';
import Big from "big.js";
import Response from "./utils/Response";
import InfoFooter from "./utils/InfoFooter";

const RepayModal = ({ asset, handleRepay }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [amount, setAmount] = React.useState(0);
	const [message, setMessage] = useState('');

	const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

	const { chain } = useContext(AppDataContext);

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setAmount(0);
		onClose();
	};

	const max = () => {
		return Math.min(
			Big(asset._mintedTokens[selectedAssetIndex].balance ?? 0).div(
				10 ** asset.inputToken.decimals
			).toNumber(),
			Big(asset.balance ?? 0).div(
				10 ** asset.inputToken.decimals
			).div(
				asset._mintedTokens[selectedAssetIndex].lastPriceUSD
			).toNumber()
		);
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
		let value = BigInt(_amount * 10 ** asset.inputToken.decimals).toString();
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

	return (
		<Box>
			<IconButton
				// disabled={!isConnected}
				variant="ghost"
				onClick={onOpen}
				icon={<BiMinusCircle size={25} color="gray" />}
				aria-label={""}
				isRound={true}
				bgColor="white"
				size={"md"}
				my={1}
				_hover={{opacity: 0.6}}
			></IconButton>
			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"}>
					<ModalCloseButton />
					<ModalHeader>Repay {asset["symbol"]}</ModalHeader>
					<ModalBody>
						<Flex>
							<Text fontSize="xs">
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
							my={2}
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
								activeChain?.unsupported ||
								!amount ||
								amount == 0 ||
								amount > max()
							}
							isLoading={loading}
							bgColor='red.400'
							width="100%"
							mt={4}
							onClick={repay}
							loadingText="Please sign the transaction"
						>
							{(isConnected && !activeChain?.unsupported) ? (
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

						<Response response={response} message={message} hash={hash} confirmed={confirmed} />
					</ModalBody>

					<InfoFooter message='
						Repaying your debt will reduce your liquidation risk. If your health falls below the minimum (1.0), you will be liquidated and your collateral will be sold to repay your debt.
					'/>

				</ModalContent>
			</Modal>
		</Box>
	);
};

export default RepayModal;
