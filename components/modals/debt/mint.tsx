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
	Tooltip,
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
import { ethers } from "ethers";

const Issue = ({ asset, amount, amountNumber }: any) => {

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const {
		chain,
		adjustedCollateral,
		totalDebt,
		updateSynthWalletBalance,
		pools,
		tradingPool,
		totalCollateral,
		updatePoolBalance
	} = useContext(AppDataContext);

	const max = () => {
		return (Big(adjustedCollateral).sub(totalDebt).div(asset.priceUSD).gt(0) ? Big(adjustedCollateral).sub(totalDebt).div(asset.priceUSD) : 0).toString();
	};

	const mint = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");

		let synth = await getContract("ERC20X", chain, asset.token.id);
		let value = Big(amount).times(10 ** 18).toFixed(0);
		send(
			synth,
			"mint",
			[value],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				setConfirmed(true);
				
				// decode logs
				const response = await res.wait(1);
				const decodedLogs = response.logs.map((log: any) =>
				{
					try {
						return synth.interface.parseLog(log)
					} catch (e) {
						console.log(e)
					}
				});

				updatePoolBalance(pools[tradingPool].id, decodedLogs[1].args.value.toString(), false);
				updateSynthWalletBalance(asset.token.id, pools[tradingPool].id, decodedLogs[3].args.value.toString(), false);

				setResponse("Transaction Successful!");
				setMessage(
					`You have minted ${tokenFormatter.format(
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

		<Box
					// border="1px"
					// borderColor={"gray.700"}
					mt={8}
					rounded={8}
					// p={2}
				>
					{/* <Flex justify="space-between">
						<Text fontSize={"md"} color="gray.400">
							Mint / Burn Fee
						</Text>

						<Text fontSize={"md"}>
							{tokenFormatter.format(
								Number(
									asset.mintFee / 100
								) 
							)} {'%'} / {tokenFormatter.format(
								Number(
									asset.burnFee / 100
								) 
							)} {'%'}
						</Text>
					</Flex> */}
				</Box>	

					<Box>
						<Text mt={4} fontSize={"sm"} color='gray.400' fontWeight={'bold'}>
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
								<Text fontSize={"md"}>{(totalDebt/totalCollateral * 100).toFixed(1)} % {"->"} {((totalDebt + (amount*asset.priceUSD)) /(totalCollateral) * 100).toFixed(1)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(adjustedCollateral - totalDebt)} {"->"} {dollarFormatter.format(adjustedCollateral - amount*asset.priceUSD - totalDebt)}</Text>
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
								Big(amount).gt(max())
							}
							isLoading={loading}
							loadingText="Please sign the transaction"
							bgColor="primary"
							width="100%"
							color="gray.700"
							mt={4}
							onClick={mint}
							size="lg"
							rounded={16}
							_hover={{
								opacity: "0.5",
							}}
						>
							{isConnected && !activeChain?.unsupported ? (
								Big(amount).gt(max()) ? (
									<>Insufficient Collateral</>
								) : !amount || amountNumber == 0 ? (
									<>Enter amount</>
								) : (
									<>Mint</>
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

export default Issue;
