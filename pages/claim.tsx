import {
	Box,
	CardHeader,
	Heading,
	Text,
	Flex,
	Button,
	Skeleton,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { ESYX_PRICE, tokenFormatter, dollarFormatter } from '../src/const';
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

export default function Claim() {
	const { address, isConnected, isConnecting } = useAccount();
	const { chain: connectedChain } = useNetwork();

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);

	const { pools } = useContext(AppDataContext);

	const { claimed } = useContext(TokenContext);

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
              console.log(result);
							setSynAccrued(result[0].toString());
						});
				});
			}
		}
	}, [connectedChain, synAccrued, isConnected, pools, address]);

	const claim = async () => {
		setClaiming(true);
		const synthex = await getContract("SyntheX", connectedChain!.id);
		synthex["claimReward(address,address,address[])"](
			pools[0].rewardTokens[0].token.id,
			address,
			pools.map((pool: any) => pool.id)
		)
			.then(async (result: any) => {
				await result.wait(1);
				setClaiming(false);
				setSynAccrued("0");
				claimed((synAccrued / 1e18).toString());
			})
			.catch((err: any) => {
				console.log(err);
				setClaiming(false);
			});
	};
	return (
		<>
    <Head>
				<title>Claim Rewards | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Box textAlign={"left"} pt="100px">
				<Heading size={"lg"}>Liquidity Incentive</Heading>

				<Text mb={5} mt={2} color='gray.400'>
					Provide liquidity by issuing synthetic assets to earn esSYX.
				</Text>

				<Flex justify={"start"} align={"center"} gap={1}></Flex>
				<Box bg={"#0A1931"} border='2px' borderColor={'whiteAlpha.100'} rounded={16} mt={5}>
					<TableContainer pt={1}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<Th color={"gray.500"}>Incentive Token</Th>
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
											<Image src={"/esSYX.svg"} w="10" alt="esSYX" />
											<Text>esSYX</Text>
										</Flex>
									</Td>
									<Td isNumeric>
										{connectedChain &&
										!(connectedChain as any).unsupported ? (
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
										!(connectedChain as any).unsupported ? (
											synAccrued !== null &&
											isConnected ? (
												<Text fontSize={"md"}>
													{dollarFormatter?.format(
														synAccrued * ESYX_PRICE / 1e18
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
                    <Text color={'gray.400'} fontWeight='bold'>
                    Total  
                    </Text>
                    </Td>
									<Td borderColor={"transparent"}></Td>
									<Td borderColor={"transparent"} isNumeric>
                  {connectedChain &&
										!(connectedChain as any).unsupported ? (
											synAccrued !== null &&
											isConnected ? (
												<Text fontSize={"md"}>
													{dollarFormatter?.format(
														synAccrued * ESYX_PRICE / 1e18
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
									<Td borderColor={"transparent"} isNumeric>
										<Button
											size="md"
											mt={2}
											onClick={claim}
											isLoading={claiming}
											loadingText="Claiming"
											disabled={Big(synAccrued ?? 0).eq(
												0
											)}
											rounded={16}
											colorScheme="primary"
											variant="outline"
										>
											Claim All
										</Button>
									</Td>
								</Tr>
							</Tbody>
						</Table>
					</TableContainer>
				</Box>
			</Box>
		</>
	);
}
