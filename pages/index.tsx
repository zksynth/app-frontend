import {
	Box,
	Flex,
	Image,
	Text,
	Heading,
	Progress,
	Tooltip,
	Divider,
	Link,
	Tag,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import CollateralTable from "../components/dashboard/CollateralTable";
import PoolSelector from "../components/dashboard/PoolSelector";
import { dollarFormatter, ESYX_PRICE } from "../src/const";
import IssuanceTable from "../components/dashboard/IssuanceTable";
import { motion } from "framer-motion";
import Head from "next/head";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import Big from "big.js";
import { TbReportMoney } from "react-icons/tb";
import { IoMdCash, IoMdAnalytics } from "react-icons/io";

import APRInfo from "../components/infos/APRInfo";
import Info from "../components/infos/Info";
import Highlighter from "../components/utils/highlighter";
import ForexPaused from "../components/dashboard/ForexPaused";
import Paused from "../components/dashboard/Paused";
import IconBox from "../components/dashboard/IconBox";

const poolBoxStyle = {
	bg: "whiteAlpha.500",
	// bgGradient={
	// 	"linear(to-b, rgba(5, 104, 204, 0.2), rgba(5, 119, 230, 0.1))"
	// }
	rounded: 18,
	h: "100%",
	border: "2px solid",
	borderColor: 'whiteAlpha.300',
	shadow: "xl"
}

export default function TempPage() {
	const { pools, tradingPool, account } = useContext(AppDataContext);

	const [hydrated, setHydrated] = React.useState(false);

	React.useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return <></>;

	const debtLimit = () =>
		(100 * pools[tradingPool]?.userDebt) /
		pools[tradingPool]?.userCollateral;

	const availableToIssue = () => {
		if(!pools[tradingPool]?.adjustedCollateral) return 0;
		if(pools[tradingPool].adjustedCollateral - pools[tradingPool]?.userDebt < 0) return 0;
		return pools[tradingPool].adjustedCollateral - pools[tradingPool].userDebt
	}

	const totalPortfolioValue = () => {
		if (!pools[tradingPool]) return "0";
		let total = Big(0);
		for (let i = 0; i < pools[tradingPool]?.synths.length; i++) {
			const synth = pools[tradingPool]?.synths[i];
			total = total.add(
				Big(synth.walletBalance ?? 0)
					.div(1e18)
					.mul(synth.priceUSD ?? 0)
			);
		}
		return total.toFixed(2);
	}

	return (
		<>
			<Head>
				<title>ZKSynth | Dashboard</title>
				<link rel="icon" type="image/x-icon" href="/veZS.png"></link>
			</Head>
				<Box w={'100%'}>
				<Box
					w='100%'
					display={{ sm: "block", md: "flex" }}
					pt="100px"
					justifyContent={"space-between"}
					alignContent={"center"}
				>
					<Flex flexDir={"column"} justify="center">
						<Box mb={8}>
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
								gap={{ sm: 10, md: 12 }}
								zIndex={1}
							>
								<Flex mt={4} gap={3} align="start">
									<IconBox>
										{/* <Image
											h={"18px"}
											src="/icon1.svg"
											alt="icon1"
											ml={0.5}
										/> */}
										<IoMdCash size={'22px'} />
									</IconBox>

									<Info
										message={`
											Sum of all your collateral deposited in USD
										`}
										title={"Total Collateral"}
									>

									<Box cursor={'help'}>
										<Heading
											size={"sm"}
											color="blackAlpha.700"
											mb={0.5}
										>
											Collateral
										</Heading>
										<Flex
											fontWeight={"semibold"}
											fontSize={"xl"}
											gap={1}
											color={"blackAlpha.800"}
										>
											<Text
												fontWeight={"normal"}
											>
												$
											</Text>
											<Text>
												{(
													pools[tradingPool]
														?.userCollateral ?? 0
												).toFixed(2)}
											</Text>
										</Flex>
									</Box>
									</Info>
								</Flex>

								<Flex mt={4} gap={3} align="start">
									<IconBox>
										{/* <Image
											h={"17px"}
											src="/icon3.svg"
											alt={"icon3"}
										/> */}
										<TbReportMoney size={'22px'}  />
									</IconBox>

									<Info
										message={`When you issue synths, you are allocated a share of pool's total debt. As the pool's total value changes, your debt changes as well`}
										title={"Debt is variable"}
									>
										<Box cursor={"help"}>
											<Heading
												mb={0.5}
												size={"sm"}
												color="blackAlpha.700"
											>
												Debt
											</Heading>
											<Flex gap={2} align="center">
												<Flex
													fontWeight={"semibold"}
													fontSize={"xl"}
													gap={1}
													color={"blackAlpha.800"}
												>
													<Text fontWeight={"normal"}>
														$
													</Text>
													<Text>
														{(
															pools[tradingPool]
																?.userDebt ?? 0
														).toFixed(2)}
													</Text>
												</Flex>
											</Flex>
										</Box>
									</Info>
								</Flex>

								{Big(pools[tradingPool]?.userDebt ?? 0).gt(0) && <Flex mt={4} gap={3} align="start">
									<IconBox>
										{/* <Image
											h={"20px"}
											src="/icon2.svg"
											alt={"icon2"}
										/> */}
										<IoMdAnalytics size={'20px'} />
									</IconBox>

									<Info
										message={`
										In order to make profit, you'd mint synthetics that move up relative to pool's total liquidity. So your debt will be lower to your synthetic holdings.
										`}
										title={"Profit and Loss"}
									>
										<Box cursor={"help"}>
											<Heading
												mb={0.5}
												size={"sm"}
												color="blackAlpha.700"
											>
												PnL
											</Heading>
											<Flex gap={2} align="center">
												<Flex
													fontWeight={"semibold"}
													fontSize={"xl"}
													gap={1}
													color={Big(totalPortfolioValue()).gt(pools[tradingPool]?.userDebt ?? 0) ? 'green.400' : 'red.400'}
												>
													<Text
														// color={"whiteAlpha.800"}
														fontWeight={"normal"}
													>
														$
													</Text>
													<Text>
														{Big(totalPortfolioValue()).sub(pools[tradingPool]?.userDebt).toFixed(2)} ({Big(totalPortfolioValue()).sub(pools[tradingPool]?.userDebt).mul(100).div(pools[tradingPool]?.userDebt).toFixed(2)}%)
													</Text>
												</Flex>
											</Flex>
										</Box>
									</Info>
								</Flex>}
							</Flex>
						</motion.div>
					</Flex>
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
							<Info
								message={`Your Debt Limit depends on your LTV %. Account would be liquidated if LTV is greater than your Collateral's Liquidation Threshold`}
								title={"Loan to Value (LTV) Ratio"}
							>
								<Flex
									justify={{ sm: "start", md: "end" }}
									align="center"
									gap={1}
									cursor={"help"}
								>
									<Heading
										size={"sm"}
										mb={1}
										color="blackAlpha.700"
									>
										Borrow Limit
									</Heading>

									<Box mb={2}>
										<InfoOutlineIcon
											color={"blackAlpha.500"}
											h={3}
										/>
									</Box>
								</Flex>
							</Info>
							<Text
								fontWeight={"semibold"}
								fontSize={"3xl"}
								mb={2}
								color={
									pools[tradingPool]?.userCollateral > 0
										? availableToIssue() > 1
										? "green.400"
										: "yellow.500"
										: "primary.400"
								}
							>
								{(pools[tradingPool]?.userCollateral > 0
									? debtLimit()
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
								bg="blackAlpha.200"
							>
								<Box
									h={2}
									rounded="full"
									bg={
										availableToIssue() > 1
												? "green.500"
												: "yellow.500"
									}
									width={
										(pools[tradingPool]?.userCollateral > 0
											? debtLimit()
											: "0") + "%"
									}
								></Box>
							</Box>
							<Info
								message={`You can issue debt till you reach Collateral's Base LTV`}
								title={"Borrow Capacity"}
							>
								<Flex
									justify={{ sm: "start", md: "end" }}
									align="center"
									gap={1}
									cursor={"help"}
								>
									<Text fontSize={"sm"} color="blackAlpha.700">
										Available to Issue
									</Text>
									<Text
										fontSize={"sm"}
										mr={0.5}
										fontWeight="medium"
									>
										{dollarFormatter.format(
											availableToIssue()
										)}
									</Text>
									<Box mb={1}>
										<InfoOutlineIcon
											color={"blackAlpha.600"}
											h={3}
										/>
									</Box>
								</Flex>
							</Info>
						</Box>
					</motion.div>
				</Box>

				<Box pb={"100px"} mt={"75px"} w='100%'>
					{!pools[tradingPool]?.paused ? (
						<Flex
							flexDir={{ sm: "column", md: "row" }}
							align={"stretch"}
							gap={8}
							zIndex={1}
						>
							<Box
								w={{ sm: "100%", md: "33%" }}
								alignSelf="stretch"
							>
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
										{...poolBoxStyle}
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
										{...poolBoxStyle}
									>
										<IssuanceTable />
									</Box>
								</motion.div>
							</Box>
						</Flex>
					) : tradingPool == 0 ? (
						<ForexPaused />
					) : (
						<Paused />
					)}
				</Box>
				</Box>
		</>
	);
}
