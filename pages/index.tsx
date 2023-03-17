import {
	Box,
	Flex,
	Image,
	Text,
	Heading,
	Progress,
	Tooltip,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import CollateralTable from "../components/dashboard/CollateralTable";
import PoolSelector from "../components/dashboard/PoolSelector";
import { dollarFormatter, ESYX_PRICE, tokenFormatter } from "../src/const";
import IssuanceTable from "../components/dashboard/IssuanceTable";
import { motion } from "framer-motion";
import Head from "next/head";
import { InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import Big from "big.js";
export default function TempPage() {
	const {
		pools,
		tradingPool,
		totalCollateral,
		totalDebt,
		adjustedCollateral,
	} = useContext(AppDataContext);

	const [hydrated, setHydrated] = React.useState(false);

	React.useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return <></>;

	return (
		<>
			<Head>
				<title>Dashboard | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Box display={{sm: 'block', md: 'flex'}} pt="100px" justifyContent={"space-between"}>
				<Box>
					<Box mb={4}>
						<PoolSelector />
					</Box>
					<motion.div
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.25 }}
						key={tradingPool}
					>
						<Flex flexDir={{sm: 'column', md: 'row'}} gap={{sm: 10, md: 16}} zIndex={1}>
							<Flex mt={4} gap={3} align="start">
								<Image
									h={"35px"}
									minH="35px"
									src="/icon1.svg"
									alt="icon1"
								/>
								<Box mt={-1}>
									<Heading
										size={"sm"}
										color="whiteAlpha.600"
										mb={0.5}
									>
										Collateral
									</Heading>
									<Text fontWeight={'semibold'} fontSize={"xl"}>
										{dollarFormatter.format(
											totalCollateral
										)}
									</Text>
								</Box>
							</Flex>

							<Flex mt={4} gap={3} align="start">
								<Image
									h={"35px"}
									minH="35px"
									src="/icon2.svg"
									alt={"icon2"}
								/>
								<Box mt={-1}>
									<Heading fontSize={"sm"} color="whiteAlpha.600">
										APY
									</Heading>
									<Flex mb={0.5} gap={1.5} align="center">
										<Text fontSize={"xl"} fontWeight={'semibold'}>
											{pools[tradingPool]?.totalDebtUSD >
											0
												? tokenFormatter.format(
														Number(
															Big(
																pools[
																	tradingPool
																]
																	?.averageDailyBurn ??
																	0
															)
																.div(1e18)
																.mul(365)
																.div(
																	pools[
																		tradingPool
																	]
																		?.totalDebtUSD
																)
																.mul(100)
																.toFixed(2)
														)
												  )
												: "0"}{" "}
											%
										</Text>

										<Tooltip
											label={`Amount of your debt burned based on 7-day average data`}
										>
											<InfoOutlineIcon
												cursor={"help"}
												color={"gray.400"}
											/>
										</Tooltip>
									</Flex>

									<Flex gap={1} mt={1}>
									<Tooltip label='Additional Annual Reward in esSYX Tokens'>
									
										<Text fontSize={"sm"} cursor={'help'} >
										+ {(
												((pools[tradingPool]
													?.rewardSpeeds[0] /
													1e18) *
													365 *
													24 *
													60 *
													60 *
													ESYX_PRICE) /
												pools[tradingPool]?.totalDebtUSD
											).toFixed(2)}{" "}
											%
										</Text>
										</Tooltip>
										<Image
											src="/esSYX.svg"
											w={5}
											alt={"esSYN"}
										/>
									</Flex>
								</Box>
							</Flex>

							<Flex mt={4} gap={3} align="start">
								<Image
									h={"35px"}
									minH="35px"
									src="/icon3.svg"
									alt={"icon3"}
								/>
								<Box mt={-1}>
									<Flex mb={0.5} gap={1.5} align="center">
										<Heading size={"sm"} color="whiteAlpha.600">
											Issued Debt
										</Heading>
										<Tooltip
											label={`When you issue synths, you are allocated a share of pool's total debt. As the pool's total value changes, your debt changes as well`}
										>
											<InfoOutlineIcon
												cursor={"help"}
												color={"gray.400"}
											/>
										</Tooltip>
									</Flex>

									<Text fontSize={"xl"} fontWeight={'semibold'}>
										{dollarFormatter.format(totalDebt)}
									</Text>
								</Box>
							</Flex>
						</Flex>
					</motion.div>
				</Box>
				<motion.div
					initial={{ opacity: 0, y: 0 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					key={tradingPool}
				>
					<Box textAlign={{sm: "left", md: "right"}} mt={{sm: 16, md: 3}} >
						<Flex justify={{sm: "start", md: "end"}} align="center" gap={1}>
							<Heading size={"sm"} mb={1} color="gray.400">
								Debt Limit
							</Heading>

							<Tooltip
								label={`Your Debt Limit depends on your LTV (Loan to Value) %. Account would be liquidated if LTV is greater than your Collateral's Liquidation Threshold`}
							>
								<InfoOutlineIcon
									cursor={"help"}
									color={"gray.400"}
									mb={1}
								/>
							</Tooltip>
						</Flex>
						<Text
							fontWeight={'semibold'}
							fontSize={"3xl"}
							mb={2}
							color={
								totalCollateral > 0
									? (100 * totalDebt) / totalCollateral < 80
										? "primary"
										: (100 * totalDebt) / totalCollateral <
										  90
										? "yellow.400"
										: "red.400"
									: "primary"
							}
						>
							{(totalCollateral > 0
								? (100 * totalDebt) / totalCollateral
								: totalCollateral
							).toFixed(1)}{" "}
							%
						</Text>
						<Box
							my={2}
							mt={4}
							h={2}
							width={"300px"}
							rounded="full"
							bg="whiteAlpha.200"
						>
							<Box
								h={2}
								rounded="full"
								bg={
									totalCollateral > 0
										? (100 * totalDebt) / totalCollateral <
										  80
											? "primary"
											: (100 * totalDebt) /
													totalCollateral <
											  90
											? "yellow.400"
											: "red.400"
										: "primary"
								}
								width={
									(totalCollateral > 0
										? (100 * totalDebt) / totalCollateral
										: totalCollateral) + "%"
								}
							></Box>
						</Box>
						<Flex justify={{sm: "start", md: "end"}} align="center" gap={1}>
							<Text fontSize={"sm"} color="gray.400">
								Available to Issue
							</Text>
							<Text fontSize={"sm"} mr={0.5} fontWeight="medium">
								{dollarFormatter.format(
									adjustedCollateral - totalDebt < 0
										? 0
										: adjustedCollateral - totalDebt
								)}
							</Text>
							<Tooltip
								label={`You can issue debt till you reach collateral's Base LTV`}
							>
								<InfoOutlineIcon
									cursor={"help"}
									color={"gray.400"}
								/>
							</Tooltip>
						</Flex>
					</Box>
				</motion.div>
			</Box>

			<Flex flexDir={{sm: "column", md: "row"}} align={"stretch"} gap={8} pb={"100px"} mt={"80px"} zIndex={1}>
				<Box w={{sm: "100%", md: "33%"}} alignSelf='stretch' >
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					key={tradingPool}
					style={{
						height: '100%'
					}}
				>
					<Box bg={'#0A1931'} rounded={10} h={'100%'} border="2px" borderColor={"whiteAlpha.50"}>
					<CollateralTable />
					</Box>
				</motion.div>
				</Box>
				<Box w={{sm: "100%", md: "67%"}}>
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					key={tradingPool + 2}
				>
					<Box bg={'#0A1931'} rounded={10} h={'100%'} border="2px" borderColor={"whiteAlpha.50"}>
					<IssuanceTable />
					</Box>
				</motion.div>
				</Box>
			</Flex>
		</>
	);
}
