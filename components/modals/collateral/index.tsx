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
import { dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Deposit from "./Deposit";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import Withdraw from "./Withdraw";
import { WETH_ADDRESS } from "../../../src/const";

export default function CollateralModal({ collateral }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [tabSelected, setTabSelected] = useState(0);

	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);
	const [isNative, setIsNative] = useState(false);

	const { pools, tradingPool } = useContext(AppDataContext);

	useEffect(() => {});

	const borderStyle = {
		borderColor: "whiteAlpha.100",
	};

	const _onClose = () => {
		setAmount("0");
		setAmountNumber(0);
		onClose();
		setIsNative(false);
	};

	const _setAmount = (e: string) => {
		if (Number(e) !== 0 && Number(e) < 0.000001) e = "0";
		setAmount(Number(e) ? Big(e).toString() : e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	};

	const selectTab = (index: number) => {
		setTabSelected(index);
	};

	const max = () => {
		if (tabSelected == 0) {
			return Big((isNative ?  collateral.nativeBalance : collateral.walletBalance) ?? 0)
				.div(10 ** collateral.token.decimals)
				.toString();
		} else {
			const v1 =
				collateral.priceUSD > 0
					? Big(pools[tradingPool].adjustedCollateral)
							.sub(pools[tradingPool].userDebt)
							.div(collateral.priceUSD)
							.mul(1e4)
							.div(collateral.baseLTV)
					: Big(0);
			const v2 = Big(collateral.balance ?? 0).div(10 ** 18);
			// min(v1, v2)
			return (v1.gt(v2) ? v2 : v1).toString();
		}
	};

	const tryApprove = () => {
		if (!collateral) return true;
		if (isNative) return false;
		if (!collateral.allowance) return true;
		if (Big(collateral.allowance).eq(0)) return true;
		return Big(collateral.allowance).lt(
			parseFloat(amount) * 10 ** (collateral.token.decimals ?? 18) || 1
		);
	};

	const _onOpen = () => {
		if(collateral.token.id == WETH_ADDRESS.toLowerCase()) setIsNative(true);
		onOpen();
	}

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={_onOpen}
				borderLeft="2px"
				borderColor="transparent"
				_hover={{ borderColor: "primary.400", bg: "blackAlpha.100" }}
			>
				<Td {...borderStyle}>
					<Flex gap={3}>
						<Image
							src={`/icons/${collateral.token.symbol}.svg`}
							width="38px"
							alt=""
						/>
						<Box>
							<Text>{collateral.token.name}</Text>
							<Flex color="gray.500" fontSize={"sm"} gap={1}>
								<Text>
									{collateral.token.symbol} -{" "}
									{tokenFormatter.format(
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
					fontSize={"md"}
				>
					{tokenFormatter.format(
						Big(collateral.balance ?? 0)
							.div(10 ** (collateral.token.decimals ?? 18))
							.toNumber()
					)}
					{Big(collateral.balance ?? 0).gt(0) ? "" : ".00"}
				</Td>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<ModalContent
					width={"30rem"}
					bgColor="bg2"
					rounded={16}
					border="2px"
					borderColor={"#212E44"}
					mx={2}
				>
					<ModalCloseButton rounded={"full"} mt={1} />
					<ModalHeader>
						<Flex
							justify={"center"}
							gap={2}
							pt={1}
							align={"center"}
						>
							<Image
								src={`/icons/${collateral.token.symbol}.svg`}
								alt=""
								width={"38px"}
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
							{collateral.token.id ==
								WETH_ADDRESS.toLowerCase() && (
								<>
									<Flex justify={"center"} mb={2}>
										<Flex
											justify={"center"}
											align="center"
											gap={0.5}
											bg="gray.700"
											rounded="full"
										>
											<Tabs
												variant="soft-rounded"
												colorScheme="primary"
												onChange={(index) => index == 1 ? setIsNative(false) : setIsNative(true)}
												index={isNative ? 0 : 1}
												size='sm'
											>
												<TabList>
													<Tab _selected={{bg: 'white'}}>ETH</Tab>
													<Tab _selected={{bg: 'white'}}>WETH</Tab>
												</TabList>
											</Tabs>
										</Flex>
									</Flex>
								</>
							)}
							{!tryApprove() || tabSelected == 1 ? (
								<>
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
														collateral.priceUSD *
															amountNumber
													)}
												</Text>
											</Box>

											<Box>
												<Button
													variant={"unstyled"}
													fontSize="sm"
													fontWeight={"bold"}
													onClick={() =>
														_setAmount(
															Big(max())
																.div(2)
																.toString()
														)
													}
													py={-2}
												>
													50%
												</Button>
												<Button
													variant={"unstyled"}
													fontSize="sm"
													fontWeight={"bold"}
													onClick={() =>
														_setAmount(max())
													}
												>
													MAX
												</Button>
											</Box>
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
								<Tab
									w={"50%"}
									_selected={{
										color: "primary.400",
										borderColor: "primary.400",
									}}
								>
									Deposit
								</Tab>
								<Tab
									w={"50%"}
									_selected={{
										color: "secondary.400",
										borderColor: "secondary.400",
									}}
								>
									Withdraw
								</Tab>
							</TabList>

							<TabPanels>
								<TabPanel m={0} p={0}>
									<Deposit
										collateral={collateral}
										amount={amount}
										amountNumber={amountNumber}
										setAmount={_setAmount}
										isNative={isNative}
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
