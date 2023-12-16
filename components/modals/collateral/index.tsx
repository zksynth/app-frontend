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
	Divider,
	useColorMode,
} from "@chakra-ui/react";
import { ADDRESS_ZERO, NATIVE, W_NATIVE, dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Deposit from "./Deposit";
import Link from "next/link";
import Withdraw from "./Withdraw";
import { WETH_ADDRESS } from "../../../src/const";
import { useNetwork, useAccount, useSignTypedData } from 'wagmi';
import { formatInput, isValidAndPositiveNS, parseInput } from '../../utils/number';
import TdBox from "../../dashboard/TdBox";
import { useBalanceData } from "../../context/BalanceProvider";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { usePriceData } from "../../context/PriceContext";
import TokenInfo from "../_utils/TokenInfo";
import { VARIANT } from "../../../styles/theme";

export default function CollateralModal({ collateral, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [tabSelected, setTabSelected] = useState(0);

	const [amount, setAmount] = React.useState("");
	const [isNative, setIsNative] = useState(false);
	const { chain } = useNetwork();
	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position();

	const _onClose = () => {
		setAmount("0");
		onClose();
		setIsNative(false);
	};

	const _setAmount = (e: string) => {
		e = parseInput(e);
		setAmount(e);
	};

	const selectTab = (index: number) => {
		setTabSelected(index);
	};

	const max = () => {
		if (tabSelected == 0) {
			return Big((isNative ? walletBalances[ADDRESS_ZERO] : walletBalances[collateral.token.id]) ?? 0)
				.div(10 ** collateral.token.decimals)
				.toString();
		} else {
			const v1 = prices[collateral.token.id] > 0
					? Big(pos.adjustedCollateral)
							.sub(pos.debt)
							.div(prices[collateral.token.id])
							.div(collateral.baseLTV)
							.mul(1e4)
					: Big(0);
			const v2 = Big(collateral.balance ?? 0).div(10 ** collateral.token.decimals);
			// min(v1, v2)
			return (v1.gt(v2) ? v2 : v1).toString();
		}
	};

	const _onOpen = () => {
		if(collateral.token.id == WETH_ADDRESS(chain?.id!)?.toLowerCase()) setIsNative(true);
		onOpen();
	}

	const { walletBalances, allowances, nonces } = useBalanceData();

	const { colorMode } = useColorMode();

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={_onOpen}
				_hover={{ bg: colorMode == 'dark' ? "darkBg.400" : "whiteAlpha.600" }}
			>
				<TdBox
					isFirst={index == 0}
					alignBox='left'
				>
					<TokenInfo token={collateral.token} color={colorMode == 'dark' ? "primary.200" : "primary.600"} />
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='right'
					isNumeric
				>
					<Box color={
						Big(collateral.balance ?? 0).gt(0)
							? colorMode == 'dark' ? "primary.200" : "primary.600"
							: colorMode == 'dark' ? "whiteAlpha.500" : "blackAlpha.500"
					}>

					<Text fontSize={'md'}>
						{tokenFormatter.format(
							Big(collateral.balance ?? 0)
								.div(10 ** (collateral.token.decimals ?? 18))
								.toNumber()
						)}
						{Big(collateral.balance ?? 0).gt(0) ? "" : ".00"}
					</Text>

					{Big(collateral.balance ?? 0).gt(0) && <Text fontSize={'xs'} color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'}>
						{dollarFormatter.format(
							Big(collateral.balance ?? 0)
								.div(10 ** (collateral.token.decimals ?? 18))
								.mul(prices[collateral.token.id] ?? 0)
								.toNumber()
						)}
					</Text>}
					</Box>
				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<ModalContent
					width={"30rem"}
					bgColor="transparent" shadow={'none'}
					rounded={0}
					mx={2}
				>
					<Box className={`${VARIANT}-${colorMode}-containerBody2`}>
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
								width={"32px"}
							/>
							<Text>{collateral.token.name}</Text>
							{chain?.testnet && <Link href="/faucet">
								<Button size={"xs"} rounded="full" mb={1}>
									Use Faucet
								</Button>
							</Link>}
						</Flex>
					</ModalHeader>
					<ModalBody m={0} p={0}>
						{<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.200'}/>}
						<Box bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'} pb={12} pt={4} px={8}>
							{collateral.token.id ==
								WETH_ADDRESS(chain?.id!)?.toLowerCase() && (
								<>
									<Flex justify={"center"} mb={5}>
									<Tabs
										variant="unstyled"
										onChange={(index) =>
											index == 1
												? setIsNative(false)
												: setIsNative(true)
										}
										index={isNative ? 0 : 1}
										size="sm"
									>
										<TabList>
											<Box className={VARIANT + '-' + colorMode + '-' + (isNative ? `${tabSelected == 0 ? 'secondary' : 'primary'}TabLeftSelected` : `${tabSelected == 0 ? 'secondary' : 'primary'}TabLeft`)}>
											<Tab>
												{NATIVE}
											</Tab>
											</Box>
											<Box className={VARIANT + '-' + colorMode + '-' + (!isNative ? `${tabSelected == 0 ? 'secondary' : 'primary'}TabRightSelected` : `${tabSelected == 0 ? 'secondary' : 'primary'}TabRight`)}>
											<Tab>
												{W_NATIVE}
											</Tab>
											</Box>
										</TabList>
									</Tabs>
									</Flex>
								</>
							)}
									<InputGroup
										mt={5}
										variant={"unstyled"}
										display="flex"
									>
										<NumberInput
											w={"100%"}
											value={formatInput(amount)}
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
													color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}
												>
													{dollarFormatter.format(
														prices[collateral.token.id] *
															Number(amount)
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
							
						</Box>
						{VARIANT == 'edgy' && <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> }
						<Box className={`${VARIANT}-${colorMode}-containerFooter`}>
						<Tabs variant={'enclosed'} onChange={selectTab}>
							<TabList>
								<Tab
									w={"50%"}
									border={0}
									borderColor={colorMode == 'dark' ? 'whiteAlpha.50' : 'primary.400'}
									_selected={{
										color: "primary.400",
										borderBottom: "2px"
									}}
									rounded={0}
								>
									Deposit
								</Tab>
								<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.300'} orientation="vertical" h={'44px'} />
								<Tab
									w={"50%"}
									border={0}
									borderColor={colorMode == 'dark' ? 'whiteAlpha.50' : 'primary.400'}
									_selected={{
										color: "primary.400",
										borderBottom: "2px"
									}}
									rounded={0}
								>
									Withdraw
								</Tab>
							</TabList>

							<TabPanels>
								<TabPanel m={0} p={0}>
									<Deposit
										collateral={collateral}
										amount={amount}
										setAmount={_setAmount}
										isNative={isNative}
										onClose={_onClose}
									/>
								</TabPanel>
								<TabPanel m={0} p={0}>
									<Withdraw
										collateral={collateral}
										amount={amount}
										setAmount={_setAmount}
										isNative={isNative}
										onClose={_onClose}
									/>
								</TabPanel>
							</TabPanels>
						</Tabs>
						</Box>
					</ModalBody>
					</Box>
				</ModalContent>
			</Modal>
		</>
	);
}
