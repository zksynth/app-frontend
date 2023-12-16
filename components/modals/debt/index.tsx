import React, { useState } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Tr,
	Flex,
	Image,
	Text,
	Box,
	IconButton,
	useDisclosure,
	InputGroup,
	NumberInput,
	NumberInputField,
	Button,
	Link,
	Divider,
	Tooltip,
	useColorMode,
} from "@chakra-ui/react";
import {
	dollarFormatter,
	tokenFormatter
} from "../../../src/const";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Mint from "./mint";
import Burn from "./burn";
import Big from "big.js";
import { useAccount } from "wagmi";
import TdBox from "../../dashboard/TdBox";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { formatInput, parseInput } from "../../utils/number";
import TokenInfo from "../_utils/TokenInfo";
import { VARIANT } from "../../../styles/theme";

export default function Debt({ synth, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [amount, setAmount] = React.useState("");
	const [amountNumber, setAmountNumber] = useState(0);
	const [tabSelected, setTabSelected] = useState(0);

	const { address } = useAccount();

	const { walletBalances } = useBalanceData();

	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position(0);

	const _onClose = () => {
		setAmount("");
		setAmountNumber(0);
		onClose();
	};

	const _setAmount = (e: string) => {
		e = parseInput(e);
		setAmount(e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	};

	const selectTab = (index: number) => {
		setTabSelected(index);
	};

	const max = () => {
		if(!address) return '0';
		if(!prices[synth.token.id] || prices[synth.token.id] == 0) return '0';
		if (tabSelected == 0) {
			return (
				Big(pos.adjustedCollateral)
					.sub(pos.debt)
					.div(prices[synth.token.id] ?? 0)
					.gt(0)
					? Big(pos.adjustedCollateral)
							.sub(pos.debt)
							.div(prices[synth.token.id] ?? 0)
					: 0
			).toString();
		} else {
			const v1 = Big(pos.debt ?? 0).div(prices[synth.token.id] ?? 0);
			const v2 = Big(walletBalances[synth.token.id] ?? 0).div(10 ** 18);
			return (v1.gt(v2) ? v2 : v1).toFixed(18);
		}
	};

    const addToMetamask = async () => {
        (window as any).ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', // Initially only supports ERC20, but eventually more!
              options: {
                address: synth.token.id, // The address that the token is at.
                symbol: synth.token.symbol, // A ticker symbol or shorthand, up to 5 chars.
                decimals: synth.token.decimals, // The number of decimals in the token
                image: process.env.NEXT_PUBLIC_VERCEL_URL + '/icons/'+synth.token.symbol+'.svg', // A string url of the token logo
              },
            }
        });
    }

	const { colorMode } = useColorMode();

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={onOpen}
				_hover={{ bg: colorMode == 'dark' ? "darkBg.400" : "whiteAlpha.600" }}
			>
				<TdBox isFirst={index == 0} alignBox='left'>
					<TokenInfo token={synth.token} color={colorMode == 'dark' ? "secondary.200" : "secondary.600"} />
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='center'>
					$ {tokenFormatter.format(prices[synth.token.id] ?? 0)}
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='center'>
					{dollarFormatter.format(
						Number(synth.synthDayData?.[0]?.dayId ?? 0) == Math.floor(Date.now() / (1000 * 3600 * 24)) ? Big(synth.synthDayData?.[0]?.dailyMinted ?? 0).add(synth.synthDayData?.[0]?.dailyBurned ?? 0)
							.mul(prices[synth.token.id] ?? 0)
                            .div(10**18)
							.toNumber() : 0
					)}
				</TdBox>
				<TdBox isNumeric isFirst={index == 0} alignBox='right'>
					<Text>
					{dollarFormatter.format(
						Big(synth.totalSupply)
						.mul(prices[synth.token.id] ?? 0)
						.div(10**18)
						.toNumber()
						)}
					</Text>
				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"} bgColor="transparent" shadow={'none'} rounded={0} mx={2}>
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
								src={`/icons/${synth.token.symbol}.svg`}
								alt=""
								width={"32px"}
							/>

							<Text>{synth.token.name.split(" ").slice(1).join(" ")}</Text>
							<Tooltip label='Add to Metamask'>
							<IconButton
								icon={
									<Image
										src="https://cdn.consensys.net/uploads/metamask-1.svg"
										w={"20px"}
                                        alt=""
									/>
								}
                                onClick={addToMetamask}
								size={"xs"}
								rounded="full"
								aria-label={""}
							/>
							</Tooltip>
						</Flex>
					</ModalHeader>
					<ModalBody m={0} p={0}>
						{<>
							<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.200'}/>
							<Box bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'} pb={12} pt={6} px={8}>
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
													((prices[synth.token.id] ?? 0) *
														amountNumber)
												)}
											</Text>
										</Box>
										<Box>
										<Button
											variant={"unstyled"}
											fontSize="sm"
											fontWeight={"bold"}
											onClick={() => _setAmount(Big(max()).div(2).toFixed(18))}
											py={-2}
										>
											50%
										</Button>
										<Button
											variant={"unstyled"}
											fontSize="sm"
											fontWeight={"bold"}
											onClick={() => _setAmount(Big(max()).mul(0.9999).toFixed(18))}
										>
											MAX
										</Button>
										</Box>

									</NumberInput>
								</InputGroup>
							</Box>
							{VARIANT == 'edgy' && <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> }
							<Box className={`${VARIANT}-${colorMode}-containerFooter`}>
						<Tabs variant={'enclosed'} onChange={selectTab} index={tabSelected}>
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
									Mint
								</Tab>
								<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.300'} orientation="vertical" h={'44px'} />
								<Tab
									w={"50%"}
									border={0}
									borderColor={colorMode == 'dark' ? 'whiteAlpha.50' : 'secondary.400'}
									_selected={{
										color: "secondary.400",
										borderBottom: "2px"
									}}
									rounded={0}
								>
									Burn
								</Tab>
							</TabList>
							<TabPanels>
								<TabPanel m={0} p={0}>
									<Mint
										asset={synth}
										amount={amount}
										amountNumber={amountNumber}
										setAmount={_setAmount}
										onClose={_onClose}
									/>
								</TabPanel>
								<TabPanel m={0} p={0}>
									<Burn
										asset={synth}
										amount={amount}
										amountNumber={amountNumber}
										setAmount={_setAmount}
										onClose={_onClose}
									/>
								</TabPanel>
							</TabPanels>
						</Tabs>
							</Box>
						</>}

					</ModalBody>
					</Box>
				</ModalContent>
			</Modal>
		</>
	);
}
