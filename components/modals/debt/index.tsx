import React, { useState } from "react";
import { useContext } from "react";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Tr,
	Th,
	Td,
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
} from "@chakra-ui/react";
import { AppDataContext } from "../../context/AppDataProvider";
import {
	dollarFormatter,
	tokenFormatter
} from "../../../src/const";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Mint from "./mint";
import Burn from "./burn";
import Big from "big.js";

export default function Debt({ synth }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { pools, tradingPool } = useContext(AppDataContext);

	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);
	const [tabSelected, setTabSelected] = useState(0);

	const borderStyle = {
		borderColor: "whiteAlpha.100",
	};

	const _onClose = () => {
		setAmount("0");
		setAmountNumber(0);
		onClose();
	};

	const _setAmount = (e: string) => {
		if(Number(e) > 0 && Number(e) < 0.000001) e = '0';
		setAmount(Number(e) ? Big(e).toString() : e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	};

	const selectTab = (index: number) => {
		setTabSelected(index);
	};

	const max = () => {
		if (tabSelected == 0) {
			return (Big(pools[tradingPool].adjustedCollateral).sub(pools[tradingPool].userDebt).div(synth.priceUSD).gt(0) ? Big(pools[tradingPool].adjustedCollateral).sub(pools[tradingPool].userDebt).div(synth.priceUSD) : 0).toString();
		} else {
			return (Big(pools[tradingPool].userDebt).div(synth.priceUSD).gt(Big(synth.walletBalance ?? 0).div(10 ** 18)) ? Big(synth.walletBalance ?? 0).div(10 ** 18) : Big(pools[tradingPool].userDebt).div(synth.priceUSD)).toString()
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
                image: 'https://app.synthex.finance/icons/'+synth.token.symbol+'.svg', // A string url of the token logo
              },
            }
        });
    }

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={onOpen}
				borderLeft='2px' borderColor='transparent' _hover={{ borderColor: 'primary.400', bg: 'blackAlpha.100' }}
			>
				<Td {...borderStyle}>
					<Flex gap={3}>
						<Image
							src={`/icons/${synth.token.symbol}.svg`}
							width="38px"
							alt=""
						/>
						<Box>
							<Text>
								{synth.token.name
									.split(" ")
									.slice(1, -2)
									.join(" ")}
							</Text>
							<Flex color="gray.500" fontSize={"sm"} gap={1}>
								<Text>
									{synth.token.symbol} -{" "}
									{tokenFormatter.format(
										Big(synth.walletBalance ?? 0)
											.div(10 ** synth.token.decimals)
											.toNumber()
									)}{" "}
									in wallet
								</Text>
							</Flex>
						</Box>
					</Flex>
				</Td>
				<Td {...borderStyle} fontSize="md" color='gray.400'>
					{dollarFormatter.format(synth.priceUSD)}
				</Td>
				<Td {...borderStyle} fontSize="md" color='gray.400'>
					{dollarFormatter.format(
						Big(synth.synthDayData[0]?.dailyMinted ?? 0).add(synth.synthDayData[0]?.dailyBurned ?? 0)
							.mul(synth.priceUSD)
                            .div(10**18)
							.toNumber()
					)}
				</Td>
				<Td {...borderStyle} fontSize="md" color='gray.400' isNumeric>
					{dollarFormatter.format(
						Big(synth.totalSupply)
							.mul(synth.priceUSD)
                            .div(10**18)
							.toNumber()
					)}
				</Td>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"} bgColor="bg2" rounded={16} border='2px' mx={2} borderColor={'#212E44'}>
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
								width={"38px"}
							/>

							<Text>{synth.token.name.split(" ").slice(1, -2).join(" ")}</Text>
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
						<Divider />
						<Box mb={6} mt={4} px={8}>
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
                                                (synth.priceUSD *
                                                    amountNumber)
                                            )}
                                        </Text>
                                    </Box>
									<Box>
									<Button
                                        variant={"unstyled"}
                                        fontSize="sm"
                                        fontWeight={"bold"}
                                        onClick={() => _setAmount(Big(max()).div(2).toString())}
										py={-2}
                                    >
                                        50%
                                    </Button>
                                    <Button
                                        variant={"unstyled"}
                                        fontSize="sm"
                                        fontWeight={"bold"}
                                        onClick={() => _setAmount(max())}
                                    >
                                        MAX
                                    </Button>
									</Box>

                                </NumberInput>
                            </InputGroup>
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
									Mint
								</Tab>
								<Tab
									w={"50%"}
									_selected={{
										color: "secondary.400",
										borderColor: "secondary.400",
									}}
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
									/>
								</TabPanel>
								<TabPanel m={0} p={0}>
									<Burn
										asset={synth}
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
