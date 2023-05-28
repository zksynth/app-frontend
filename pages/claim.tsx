import {
	Box,
	CardHeader,
	Heading,
	Text,
	Flex,
	Button,
	Skeleton,
	Tooltip,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { ESYX_PRICE, tokenFormatter, dollarFormatter } from "../src/const";
import { getContract } from "../src/contract";
import Big from "big.js";
import { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import { TokenContext } from "../components/context/TokenContext";

import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
	Image,
	IconButton,
} from "@chakra-ui/react";
import Head from "next/head";
import { motion } from "framer-motion";
import { useToast } from '@chakra-ui/react';

export default function Claim() {
	const { address, isConnected, isConnecting } = useAccount();
	const { chain: connectedChain } = useNetwork();

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);

	const { pools } = useContext(AppDataContext);

	const { claimed } = useContext(TokenContext);
	const toast = useToast();

	useEffect(() => {
		if (connectedChain) {
			if (
				synAccrued == null &&
				isConnected &&
				!(connectedChain as any).unsupported &&
				pools.length > 0
			) {
				getContract("SyntheX", connectedChain!.id).then((synthex) => {
					synthex.callStatic
						.getRewardsAccrued(
							[pools[0].rewardTokens[0].id],
							address,
							pools.map((pool: any) => pool.id)
						)
						.then((result) => {
							setSynAccrued(result[0].toString());
						});
				});
			}
		}
	}, [connectedChain, synAccrued, isConnected, pools, address]);

	const claim = async () => {
		setClaiming(true);
		const synthex = await getContract("SyntheX", connectedChain!.id);
		synthex["claimReward"](
			[pools[0].rewardTokens[0].id],
			address,
			pools.map((pool: any) => pool.id)
		)
			.then(async (result: any) => {
				await result.wait(1);
				setClaiming(false);
				setSynAccrued("0");
				claimed((synAccrued / 1e18).toString());
				toast({
					title: "Claimed!",
					description: "Your rewards have been claimed.",
					status: "success",
					duration: 10000,
					isClosable: true,
					position: 'top-right'
				})
			})
			.catch((err: any) => {
				console.log(err);
				setClaiming(false);
				toast({
					title: "Error",
					description: "There was an error claiming your rewards.",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: 'top-right'
				})
			});
	};

	const addToMetamask = async () => {
		(window as any).ethereum.request({
			method: "wallet_watchAsset",
			params: {
				type: "ERC20", // Initially only supports ERC20, but eventually more!
				options: {
					address: pools[0].rewardTokens[0].id, // The address that the token is at.
					symbol: "esSYX", // A ticker symbol or shorthand, up to 5 chars.
					decimals: 18, // The number of decimals in the token
					image: "https://app.synthex.finance/esSYX.svg", // A string url of the token logo
				},
			},
		});
	};

	return (
		<>
			<Head>
				<title>Claim Rewards | ZKSynth</title>
				<link rel="icon" type="image/x-icon" href="/veZS.png"></link>
			</Head>
			<Box textAlign={"left"} pt="100px" >
				<motion.div
					initial={{ opacity: 0, y: 0 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
				>
					<Heading size={"lg"}>Liquidity Incentive</Heading>

					<Text mb={5} mt={2} color="blackAlpha.700">
						Provide liquidity by issuing synthetic assets to earn veZS.
					</Text>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					style={{
						height: "100%",
					}}
				>
					<Box
						bg={"whiteAlpha.500"}
						border="2px"
						borderColor={"whiteAlpha.300"}
						rounded={16}
						mt={5}
						shadow='xl'
					>
						<TableContainer pt={1}>
							<Table variant="simple">
								<Thead>
									<Tr>
										<Th color={"gray.500"}>
											Incentive Token
										</Th>
										<Th color={"gray.500"} isNumeric>
											Amount
										</Th>
										<Th color={"gray.500"} isNumeric>
											Value
										</Th>
										<Th color={"gray.500"} isNumeric></Th>
									</Tr>
								</Thead>
								<Tbody>
									<Tr>
										<Td>
											<Flex align={"center"} gap={2}>
												<Image
													src={"/veZS.png"}
													w="10"
													alt="veZS"
												/>
												<Box>
													{/* <Text>Escrowed SYX</Text> */}
													<Text fontSize={"md"}>
														veZS
													</Text>
												</Box>
												<Tooltip label="Add to Metamask">
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
										</Td>
										<Td isNumeric>
											{connectedChain &&
											!(connectedChain as any)
												.unsupported ? (
												synAccrued !== null &&
												isConnected ? (
													<Text fontSize={"md"}>
														{tokenFormatter?.format(
															synAccrued / 1e18
														)}
													</Text>
												) : (
													<Skeleton
														height={"20px"}
														width="60px"
														mr={1}
													/>
												)
											) : (
												<>-</>
											)}
										</Td>
										<Td isNumeric>
											{connectedChain &&
											!(connectedChain as any)
												.unsupported ? (
												synAccrued !== null &&
												isConnected ? (
													<Text fontSize={"md"}>
														{dollarFormatter?.format(
															(synAccrued *
																ESYX_PRICE) /
																1e18
														)}
													</Text>
												) : (
													<Skeleton
														height={"20px"}
														width="60px"
														mr={1}
													/>
												)
											) : (
												<>-</>
											)}
										</Td>
										<Td></Td>
									</Tr>

									<Tr>
										<Td borderColor={"transparent"}>
											<Text
												color={"gray.400"}
												fontWeight="bold"
											>
												Total
											</Text>
										</Td>
										<Td borderColor={"transparent"}></Td>
										<Td
											borderColor={"transparent"}
											isNumeric
										>
											{connectedChain &&
											!(connectedChain as any)
												.unsupported ? (
												synAccrued !== null &&
												isConnected ? (
													<Text fontSize={"md"}>
														{dollarFormatter?.format(
															(synAccrued *
																ESYX_PRICE) /
																1e18
														)}
													</Text>
												) : (
													<Skeleton
														height={"20px"}
														width="60px"
														mr={1}
													/>
												)
											) : (
												<>-</>
											)}
										</Td>
										<Td
											borderColor={"transparent"}
											isNumeric
										>
											<Button
												size="md"
												mt={2}
												onClick={claim}
												isLoading={claiming}
												loadingText="Claiming"
												isDisabled={Big(
													synAccrued ?? 0
												).eq(0)}
												rounded={16}
												colorScheme="primary"
												variant="outline"
												_hover={{
													color: "white",
												}}
											>
												Claim All
											</Button>
										</Td>
									</Tr>
								</Tbody>
							</Table>
						</TableContainer>
					</Box>

					<Text mt={12} mb={1} color="blackAlpha.600">
						Disclaimer
					</Text>
					<Text fontSize={"xs"} color="blackAlpha.500">
						Please note that the information provided in this
						message is intended solely for informational purposes
						and is not an offer, solicitation, or recommendation to
						buy or sell any security, investment product, or other
						financial instrument. The esSYX tokens mentioned in this
						message are being offered solely as a liquidity
						incentive in our DeFi protocol, and users may earn these
						tokens by holding debt on Synthex. It is important to
						note that the SYX token, which the esSYX tokens can be
						converted to at a later date on a 1:1 basis, is not yet
						launched, and will be announced at a later date.
						Furthermore, please be aware that the esSYX tokens are
						priced at the public sale price, and this price may
						fluctuate based on market conditions. Therefore, it is
						important to conduct your own research and due diligence
						before deciding to participate in this offering. Please
						also be advised that the purchase and use of any tokens,
						including the esSYX tokens, may involve significant
						risks and uncertainties, including the potential for
						loss of investment. As such, we strongly recommend that
						you consult with a qualified financial advisor or
						attorney before making any investment decisions. By
						accepting these tokens, you acknowledge that you have
						read, understood, and accepted the above disclaimer, as
						well as any other terms and conditions associated with
						this offering.
					</Text>
				</motion.div>
			</Box>
		</>
	);
}
