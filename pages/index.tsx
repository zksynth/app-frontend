import {
	Box,
	Flex,
	Image,
	Text,
	Heading,
	Progress,
	Tooltip,
	Divider,
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
import { BsLightningChargeFill, BsStars } from "react-icons/bs";
import { FaBurn } from "react-icons/fa";
import APRInfo from "../components/infos/APRInfo";
import Info from "../components/infos/Info"
import { AiFillStop, AiOutlineStop } from "react-icons/ai";

export default function TempPage() {
	const {
		pools,
		tradingPool
	} = useContext(AppDataContext);

	const [hydrated, setHydrated] = React.useState(false);

	React.useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return <></>;

	const esSyxApr = () => {
		if (!pools[tradingPool]) return "0";
		if(Big(pools[tradingPool]?.totalDebtUSD).eq(0)) return "0"
		return Big(pools[tradingPool]?.rewardSpeeds[0])
			.div(1e18)
			.mul(365 * 24 * 60 * 60 * ESYX_PRICE)
			.div(pools[tradingPool]?.totalDebtUSD)
			.toFixed(2);
	};

	const debtBurnApr = () => {
		if (!pools[tradingPool]) return "0";
		if(Big(pools[tradingPool]?.totalDebtUSD).eq(0)) return "0"
		return Big(pools[tradingPool]?.averageDailyBurn ?? 0)
			.mul(365)
			.div(pools[tradingPool]?.totalDebtUSD)
			.mul(100)
			.toFixed(2);
	};

	return (
		<>
			<Head>
				<title>Dashboard | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Box
				display={{ sm: "block", md: "flex" }}
				pt="100px"
				justifyContent={"space-between"}
			>
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
						<Flex
							flexDir={{ sm: "column", md: "row" }}
							gap={{ sm: 10, md: 16 }}
							zIndex={1}
						>
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
										color="whiteAlpha.700"
										mb={0.5}
									>
										Collateral
									</Heading>
									<Text
										fontWeight={"semibold"}
										fontSize={"xl"}
									>
										{dollarFormatter.format(
											pools[tradingPool]?.userCollateral ?? 0
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
									<Heading
										fontSize={"sm"}
										color="whiteAlpha.700"
									>
										APY
									</Heading>
									<Tooltip
										bg="bg2"
										rounded={8}
										p={0}
										label={<APRInfo debtBurnApr={debtBurnApr()} esSyxApr={esSyxApr()} />}
									>
										<Flex mb={0.5} gap={1.5} align="center" cursor={"help"}>
											<Text
												fontSize={"xl"}
												fontWeight={"semibold"}
											> {(Number(debtBurnApr()) + Number(esSyxApr())).toFixed(2)} %
											</Text>

											<BsStars color={"gray.400"} />
										</Flex>
									</Tooltip>
								</Box>
							</Flex>

							<Flex mt={4} gap={3} align="start">
								<Image
									h={"35px"}
									minH="35px"
									src="/icon3.svg"
									alt={"icon3"}
								/>
								<Tooltip
									bg="bg2"
									p={0}
									rounded={8}
									label={
										<Info message={`When you issue synths, you are allocated a share of pool's total debt. As the pool's total value changes, your debt changes as well`} title={'Debt is variable'} />
									}
									>
								<Box mt={-1} cursor={"help"}>
									
										<Heading
										mb={0.5}
											size={"sm"}
											color="whiteAlpha.700"
										>
											Issued Debt
										</Heading>
									<Flex  gap={2} align="center">

									<Text
										fontSize={"xl"}
										fontWeight={"semibold"}
									>
										{dollarFormatter.format(pools[tradingPool]?.userDebt ?? 0)}
									</Text>
										
											<BsLightningChargeFill
												color={"gray.400"}
											/>
									</Flex>

								</Box>
										</Tooltip>
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
					<Box
						textAlign={{ sm: "left", md: "right" }}
						mt={{ sm: 16, md: 3 }}
					>
						<Tooltip
						bg="bg2"
						p={0}
						rounded={8}
								label={<Info message={`Your Debt Limit depends on your LTV %. Account would be liquidated if LTV is greater than your Collateral's Liquidation Threshold`} title={'Loan to Value (LTV) Ratio'}/>}
							>
						<Flex
							justify={{ sm: "start", md: "end" }}
							align="center"
							gap={2}
							cursor={"help"}
						>
							
							<Heading size={"sm"} mb={1} color="whiteAlpha.700">
								Debt Limit
							</Heading>

							<Box mb={1.5}>

								<InfoIcon
									color={"gray.400"}
									/>
									</Box>
						</Flex>
							</Tooltip>
						<Text
							fontWeight={"semibold"}
							fontSize={"3xl"}
							mb={2}
							color={
								pools[tradingPool]?.userCollateral > 0
									? (100 * pools[tradingPool]?.userDebt) / pools[tradingPool]?.userCollateral < 80
										? "primary.400"
										: (100 * pools[tradingPool]?.userDebt) / pools[tradingPool]?.userCollateral <
										  90
										? "yellow.400"
										: "red.400"
									: "primary.400"
							}
						>
							{(pools[tradingPool]?.userCollateral > 0
								? (100 * pools[tradingPool]?.userDebt ?? 0) / pools[tradingPool]?.userCollateral
								: pools[tradingPool]?.userCollateral ?? 0
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
									pools[tradingPool]?.userCollateral > 0
										? (100 * pools[tradingPool]?.userDebt) / pools[tradingPool]?.userCollateral <
										  80
											? "primary.400"
											: (100 * pools[tradingPool]?.userDebt) /
													pools[tradingPool]?.userCollateral <
											  90
											? "yellow.400"
											: "red.400"
										: "primary.400"
								}
								width={
									(pools[tradingPool]?.userCollateral > 0
										? (100 * pools[tradingPool]?.userDebt) / pools[tradingPool]?.userCollateral
										: pools[tradingPool]?.userCollateral) + "%"
								}
							></Box>
						</Box>
						<Tooltip
						bg="bg2"
						p={0}
						rounded={8}
								label={<Info message={`You can issue debt till you reach Collateral's Base LTV`} title={'Borrow Capacity'}/>}

							>
						<Flex
							justify={{ sm: "start", md: "end" }}
							align="center"
							gap={1}
							cursor={"help"}
						>
							<Text fontSize={"sm"} color="gray.400">
								Available to Issue
							</Text>
							<Text fontSize={"sm"} mr={0.5} fontWeight="medium">
								{ dollarFormatter.format(
									pools[tradingPool]?.adjustedCollateral ? 
									(pools[tradingPool]?.adjustedCollateral - pools[tradingPool]?.userDebt < 0 ? 0 : pools[tradingPool]?.adjustedCollateral - pools[tradingPool]?.userDebt)
										: 0) 
										}
							</Text>
							
								<InfoIcon
									cursor={"help"}
									color={"gray.400"}
								/>
						</Flex>
							</Tooltip>
					</Box>
				</motion.div>
			</Box>

			<Flex
				flexDir={{ sm: "column", md: "row" }}
				align={"stretch"}
				gap={8}
				pb={"100px"}
				mt={"80px"}
				zIndex={1}
			>
				<Box w={{ sm: "100%", md: "33%" }} alignSelf="stretch">
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.25 }}
						key={tradingPool}
						style={{
							height: "100%",
						}}
					>
						<Box
							bg={"bg2"}
							rounded={10}
							h={"100%"}
							border="2px"
							borderColor={"whiteAlpha.50"}
						>
							<CollateralTable />
						</Box>
					</motion.div>
				</Box>
				<Box w={{ sm: "100%", md: "67%" }}>
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.25 }}
						key={tradingPool + 2}
					>
						<Box
							bg={"bg2"}
							rounded={10}
							h={"100%"}
							border="2px"
							borderColor={"whiteAlpha.50"}
						>
							<IssuanceTable />
						</Box>
					</motion.div>
				</Box>
			</Flex>
		</>
	);
}
