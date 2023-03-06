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
	TableCaption,
	TableContainer,
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
} from "@chakra-ui/react";
import { AppDataContext } from "../../context/AppDataProvider";
import {
	preciseTokenFormatter,
	tokenFormatter,
	compactTokenFormatter,
	dollarFormatter,
} from "../../../src/const";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

import { motion } from "framer-motion";
import Mint from "./mint";
import Burn from "./burn";

import Big from "big.js";
import {
	Pagination,
	usePagination,
	PaginationNext,
	PaginationPage,
	PaginationPrevious,
	PaginationContainer,
	PaginationPageGroup,
} from "@ajna/pagination";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { Skeleton } from "@chakra-ui/react";

export default function Debt({ synth }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { adjustedCollateral, totalDebt } = useContext(AppDataContext);

	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);
	const [tabSelected, setTabSelected] = useState(0);

	const borderStyle = {
		borderColor: "#1F2632",
	};

	const _onClose = () => {
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
			const val = adjustedCollateral - totalDebt;
			return (val > 0 ? val : 0).toString();
		} else {
			return Math.min(
				Big(totalDebt).div(synth.priceUSD).mul(1e8).toNumber(),
				Big(synth.walletBalance ?? 0)
					.div(10 ** 18)
					.toNumber()
			).toString();
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
				_hover={{ borderLeft: "1px", borderColor: "primary" }}
			>
				<Td {...borderStyle}>
					<Flex gap={1}>
						<Image
							src={`/icons/${synth.token.symbol}.svg`}
							width="45px"
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
									{preciseTokenFormatter.format(
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
				<Td {...borderStyle} fontSize="sm">
					{dollarFormatter.format(synth.priceUSD / 1e8)}
				</Td>
				<Td {...borderStyle} fontSize="sm">
					{dollarFormatter.format(
						Big(synth.token.totalSupply)
							.mul(synth.priceUSD)
							.div(1e8)
							.div(1e18)
							.toNumber()
					)}
				</Td>
				<Td {...borderStyle} fontSize="sm" isNumeric>
					{dollarFormatter.format(
						Big(synth.token.totalSupply)
							.mul(synth.priceUSD)
							.div(1e8)
							.div(1e18)
							.toNumber()
					)}
				</Td>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"} bgColor="gray.800" rounded={16}>
					<ModalCloseButton rounded={"full"} mt={1} />
					<ModalHeader>
						<Flex
							justify={"center"}
							gap={1.5}
							pt={1}
							align={"center"}
						>
							<Image
								src={`/icons/${synth.token.symbol}.svg`}
								alt=""
								width={"44px"}
							/>

							<Text>{synth.token.name.split(" ").slice(1, -2).join(" ")}</Text>

							<IconButton
								icon={
									<Image
										src="https://cdn.consensys.net/uploads/metamask-1.svg"
										w={"20px"}
									/>
								}
                                onClick={addToMetamask}
								size={"xs"}
								rounded="full"
								aria-label={""}
							/>
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
						</Box>

						<Tabs onChange={selectTab}>
							<TabList>
								<Tab
									w={"50%"}
									_selected={{
										color: "primary",
										borderColor: "primary",
									}}
								>
									Mint
								</Tab>
								<Tab
									w={"50%"}
									_selected={{
										color: "secondary",
										borderColor: "secondary",
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
									/>
								</TabPanel>
								<TabPanel m={0} p={0}>
									<Burn
										asset={synth}
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
