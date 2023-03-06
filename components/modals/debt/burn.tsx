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
	Link,
	Image,
	Divider
} from "@chakra-ui/react";

import { AiOutlineInfoCircle, AiOutlinePlus } from "react-icons/ai";
import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import InfoFooter from "../_utils/InfoFooter";
import { BiMinus } from 'react-icons/bi';
import { assert } from "console";

const Burn = ({ asset, amount, amountNumber }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setMessage("");
		onClose();
	};

	const max = () => {
		return Math.min(
			Big(totalDebt).div(asset.priceUSD).mul(1e8).toNumber(),
			Big(asset.walletBalance ?? 0)
				.div(10 ** 18)
				.toNumber()
		).toString();
	}

	const {
		chain,
		totalDebt,
		updateSynthWalletBalance,
		totalCollateral,
		adjustedCollateral,
		pools,
		tradingPool,
	} = useContext(AppDataContext);

	const burn = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");

		let synth = await getContract("ERC20X", chain, asset.token.id);
		let value = Big(amount)
			.times(10 ** 18)
			.toFixed(0);
		send(
			synth,
			"burn",
			[value],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				updateSynthWalletBalance(asset.token.id, pools[tradingPool].id, value, true);
				setResponse("Transaction Successful!");
				setMessage(
					`You have burned ${tokenFormatter.format(
						amountNumber
					)} ${asset.token.symbol}`
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

	return (
		<Box roundedBottom={16} px={5} pb={0.5} pt={0.5} bg='blackAlpha.200'>
						<Box>
						<Text mt={8} fontSize={"sm"} color='gray.400' fontWeight={'bold'}>
							Transaction Overview
						</Text>
						<Box
							// border="1px"
							// borderColor={"gray.700"}
							my={4}
							rounded={8}
							// p={2}
						>
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Health Factor
								</Text>
								<Text fontSize={"md"}>{(totalDebt/totalCollateral * 100).toFixed(1)} % {"->"} {((totalDebt - (amount*asset.priceUSD/1e8)) /(totalCollateral) * 100).toFixed(1)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(adjustedCollateral - totalDebt)} {"->"} {dollarFormatter.format(adjustedCollateral + amount*asset.priceUSD/1e8 - totalDebt)}</Text>
							</Flex>
						</Box>
					</Box>

						<Flex mt={2} justify="space-between">
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
							bgColor="secondary"
							width="100%"
							color="white"
							mt={4}
							onClick={burn}
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
									<>Burn</>
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
						<Box mx={-4}>

					<InfoFooter
						message="
						You can issue a new asset against your collateral. Debt is dynamic and depends on total debt of the pool.
						"
						/>
						</Box>
		</Box>
	);
};

export default Burn;
