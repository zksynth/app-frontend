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
			<Flex pt="100px" justify={"space-between"}>
				<Box>
					<Box mb={4}>
						<PoolSelector />
					</Box>
					<motion.div
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.75 }}
						key={tradingPool}
					>
						<Flex gap={16} zIndex={1}>
							<Flex mt={4} gap={3} align="start">
								<Image
									h={"35px"}
									minH="35px"
									src="/icon1.svg"
									alt="icon1"
								/>
								<Box mt={-1}>
									<Text
										fontSize={"sm"}
										color="gray.500"
										mb={0.5}
									>
										Collateral
									</Text>
									<Heading fontSize={"xl"}>
										{dollarFormatter.format(
											totalCollateral
										)}
									</Heading>
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
									<Flex mb={0.5} gap={1.5} align="center">
										<Text fontSize={"sm"} color="gray.500">
											Rewards
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
									<Heading fontSize={"xl"}>
										{pools[tradingPool]?.totalDebtUSD > 0
											? tokenFormatter.format(
													Number(
														Big(
															pools[tradingPool]
																?.averageDailyBurn ??
																0
														)
															.div(1e18)
															.mul(365)
															.div(
																pools[
																	tradingPool
																]?.totalDebtUSD
															)
															.mul(100)
															.toFixed(2)
													)
											  )
											: "0"}{" "}
										%
									</Heading>
									<Flex gap={1} mt={1}>
										<Image src="/esSYX.svg" alt={"esSYN"} />
										<Text fontSize={"sm"} color="gray.400">
											{(
												(pools[tradingPool]
													?.rewardSpeeds[0] *
													365 *
													24 *
													60 *
													60 *
													ESYX_PRICE) /
												pools[tradingPool]?.totalDebtUSD
											).toFixed(2)}{" "}
											%
										</Text>
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
										<Text fontSize={"sm"} color="gray.500">
											Issued Debt
										</Text>
										<Tooltip
											label={`When you issue synths, you are allocated a share of the debt pool. As the pool's total value changes, your debt changes as well`}
										>
											<InfoOutlineIcon
												cursor={"help"}
												color={"gray.400"}
											/>
										</Tooltip>
									</Flex>

									<Heading fontSize={"xl"}>
										{dollarFormatter.format(totalDebt)}
									</Heading>
								</Box>
							</Flex>
						</Flex>
					</motion.div>
				</Box>
				<motion.div
					initial={{ opacity: 0, y: 0 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.75 }}
					key={tradingPool}
				>
					<Box textAlign={"right"} mt={3} alignSelf="end">
						<Flex justify={"end"} align="center" gap={1}>
							<Text fontSize={"sm"} mb={1} color="gray.400">
								Debt Limit
							</Text>

							<Tooltip
								label={`Your Debt Limit depends on your LTV (Loan to Value) %. Account would be liquidated if LTV is greater than your Collateral's Liquidation Threshold`}
							>
								<InfoOutlineIcon
									cursor={"help"}
									color={"gray.400"}
								/>
							</Tooltip>
						</Flex>
						<Heading
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
						</Heading>
						<Box
							my={2}
							mt={4}
							h={2}
							width={"300px"}
							rounded="full"
							bg="gray.800"
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
						<Flex justify={"end"} align="center" gap={1}>
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
								label={`You can issue debt till you reach collateral's Base LTV (75-80%)`}
							>
								<InfoOutlineIcon
									cursor={"help"}
									color={"gray.400"}
								/>
							</Tooltip>
						</Flex>
					</Box>
				</motion.div>
			</Flex>

			<Flex gap={8} pb={"100px"} mt={"80px"} zIndex={1}>
				<Box w={"33%"}>
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.5 }}
						key={tradingPool}
					>
						<Box
							bg={"gray.800"}
							rounded="10"
						>
							<CollateralTable />
						</Box>
					</motion.div>
				</Box>

				<Box w="67%">
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.5 }}
						key={tradingPool}
					>
						<Box bg={"gray.800"} rounded="10">
							<IssuanceTable />
						</Box>
					</motion.div>
				</Box>
			</Flex>
		</>
	);
}
