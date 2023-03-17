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

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Deposit from "./Deposit";
import Link from "next/link";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import Withdraw from "./Withdraw";

export default function CollateralModal({ collateral, tradingPool }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [tabSelected, setTabSelected] = useState(0);

	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);

	const { adjustedCollateral, totalCollateral, totalDebt } = useContext(AppDataContext);

	const borderStyle = {
		borderColor: "whiteAlpha.100",
	};

	const _onClose = () => {
		setAmount("0");
		setAmountNumber(0);
		onClose();
	};

	const _setAmount = (e: string) => {
		if(Big(e).mul(collateral.priceUSD).lt(0.1)) return;
		setAmount(e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	};

	const selectTab = (index: number) => {
		setTabSelected(index);
	};

	const max = () => {
		if (tabSelected == 0) {
			return Big(
				collateral.walletBalance ?? 0
			).div(10**collateral.token.decimals).toString();
		} else {
			const v1 = collateral.priceUSD > 0 ? Big(adjustedCollateral).sub(totalDebt).div(collateral.priceUSD).mul(1e4).div(collateral.baseLTV) : Big(0);
			const v2 = Big(collateral.balance ?? 0).div(10**18);
			// min(v1, v2)
			return (v1.gt(v2) ? v2 : v1).toString();
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
			<Tr cursor="pointer" onClick={onOpen} borderLeft='2px' borderColor='transparent' _hover={{ borderColor: 'primary', bg: 'blackAlpha.100' }}>
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
                    fontSize={'md'}
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
															amountNumber)
													)}
												</Text>
											</Box>

											<Button
												variant={"unstyled"}
												fontSize="sm"
												fontWeight={"bold"}
												onClick={() => _setAmount(max())}
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
										setAmount={_setAmount}
									/>
								</TabPanel>
								<TabPanel m={0} p={0}>
									<Withdraw
										collateral={collateral}
										amount={amount}
										amountNumber={amountNumber}
										setAmount={_setAmount}
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
