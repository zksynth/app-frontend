import React, { useState } from "react";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Tr,
	Td,
	Flex,
	Image,
	Text,
	Box,
	useDisclosure,
	Button,
	InputGroup,
	NumberInput,
	NumberInputField,
	Select,
	Divider,
    IconButton,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
	dollarFormatter,
	preciseTokenFormatter,
	tokenFormatter,
} from "../../../src/const";
import Big from "big.js";
import InfoFooter from "../_utils/InfoFooter";
import Response from "../_utils/Response";
import { useAccount, useNetwork } from "wagmi";

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Deposit from "./Deposit";
import Link from "next/link";
import { ethers } from "ethers";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import Withdraw from "./Withdraw";

export default function CollateralModal({ collateral, tradingPool }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const [tabSelected, setTabSelected] = useState(0);

	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);

	const { adjustedCollateral, totalDebt } = useContext(AppDataContext);

	const borderStyle = {
		borderColor: "#1F2632",
	};

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setMessage("");
		setAmount("0");
		setAmountNumber(0);
		onClose();
	};

	const _setAmount = (e: string) => {
		setAmount(e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	};

	const handleMax = () => {
		setAmount(max());
		setAmountNumber(isNaN(Number(max())) ? 0 : Number(max()));
	};

	const selectTab = (index: number) => {
		setTabSelected(index);
	};

	const max = () => {
		if (tabSelected == 0) {
			return ethers.utils.formatUnits(
				collateral.walletBalance,
				collateral.token.decimals
			);
		} else {
			const val =
				collateral.priceUSD > 0
					? Big(adjustedCollateral)
							.sub(totalDebt)
							.div(collateral.priceUSD)
							.mul(1e8)
							.toNumber()
					: 0;
			return Math.min(
				collateral.balance ?? 0,
				val > 0 ? val : 0
			).toString();
		}
	};

	const tryApprove = () => {
		if (!collateral) return true;
		if (!collateral.allowance) return true;
		if (Big(collateral.allowance).eq(0)) return true;
		return Big(collateral.allowance).lt(
			parseFloat(amount) * 10 ** (collateral.token.decimals ?? 18) || 1
		);
	};

	return (
		<>
			<Tr cursor="pointer" onClick={onOpen} _hover={{borderLeft: '1px', borderColor: 'primary'}}>
				<Td {...borderStyle}>
						<Flex gap={2}>
							<Image
								src={`/icons/${collateral.token.symbol}.svg`}
								width="32px"
								alt=""
							/>
							<Box>
								<Text>{collateral.token.name}</Text>
								<Flex color="gray.500" fontSize={"sm"} gap={1}>
									<Text>
										{collateral.token.symbol} -{" "}
										{preciseTokenFormatter.format(
											Big(collateral.walletBalance ?? 0)
												.div(
													10 **
														(collateral.token
															.decimals ?? 18)
												)
												.toNumber()
										)}{" "}
										in wallet
									</Text>
								</Flex>
							</Box>
						</Flex>
				</Td>
				<Td
					{...borderStyle}
					color={
						Big(collateral.balance ?? 0).gt(0)
							? "white"
							: "gray.500"
					}
					isNumeric
				>
					{preciseTokenFormatter.format(
						Big(collateral.balance ?? 0)
							.div(10 ** (collateral.token.decimals ?? 18))
							.toNumber()
					)}
					{Big(collateral.balance ?? 0).gt(0) ? "" : ".00"}
				</Td>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"} bgColor="gray.800" rounded={16}>
					<ModalCloseButton rounded={"full"} mt={1} />
					<ModalHeader>
						<Flex
							justify={"center"}
							gap={3}
							pt={1}
							align={"center"}
						>
							<Image
								src={`/icons/${collateral.token.symbol}.svg`}
								alt=""
								width={"34px"}
							/>
							<Text>{collateral.token.name}</Text>
							<Link href="/faucet">
								<Button size={"xs"} rounded="full">
									Use Faucet
								</Button>
							</Link>
						</Flex>
					</ModalHeader>
					<ModalBody m={0} p={0}>
						<Divider />
						<Box mb={6} mt={4} px={8}>
							{!tryApprove() || tabSelected == 1 ? (
								<>
									<Flex justify={"center"} mb={2}>
										<Flex
											justify={"center"}
											align="center"
											gap={0.5}
											bg="gray.700"
											rounded="full"
										></Flex>
									</Flex>
									<InputGroup
										mt={5}
										variant={"unstyled"}
										display="flex"
										placeholder="Enter amount"
									>
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
											<Box ml={10}>
												<NumberInputField
													textAlign={"center"}
													pr={0}
													fontSize={"5xl"}
													placeholder="0"
												/>

												<Text
													fontSize="sm"
													textAlign={"center"}
													color={"gray.400"}
												>
													{dollarFormatter.format(
														(collateral.priceUSD *
															amountNumber) /
															1e8
													)}
												</Text>
											</Box>

											<Button
												variant={"unstyled"}
												fontSize="sm"
												fontWeight={"bold"}
												onClick={handleMax}
											>
												MAX
											</Button>
										</NumberInput>
									</InputGroup>
								</>
							) : (
								<>
									<Text mt={16} mb={12} color="gray.400">
										To deposit {collateral.token.symbol} you
										need to approve the contract to spend
										your tokens.
									</Text>
								</>
							)}
						</Box>

						<Tabs onChange={selectTab}>
							<TabList>
								<Tab w={"50%"} _selected={{color: 'primary', borderColor:'primary'}}>Deposit</Tab>
								<Tab w={"50%"} _selected={{color: 'secondary', borderColor:'secondary'}}>Withdraw</Tab>
							</TabList>

							<TabPanels>
								<TabPanel m={0} p={0}>
									<Deposit
										collateral={collateral}
										amount={amount}
										amountNumber={amountNumber}
									/>
								</TabPanel>
								<TabPanel m={0} p={0}>
									<Withdraw
										collateral={collateral}
										amount={amount}
										amountNumber={amountNumber}
									/>
								</TabPanel>
							</TabPanels>
						</Tabs>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}
