import React from "react";
import Info from "../infos/Info";
import { Flex, Text, Box, Heading, Button, Grid, GridItem, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Big from "big.js";
import { useAppData } from "../context/AppDataProvider";
import { dollarFormatter, tokenFormatter } from "../../src/const";
import { useSyntheticsData } from "../context/SyntheticsPosition";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { BsArrowRight } from "react-icons/bs";
import { MdArrowRight } from "react-icons/md";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useRouter } from "next/router";
import { VARIANT } from "../../styles/theme";

export default function MinimalSynthPosition({ poolIndex }: any) {
	const { pools, account, setTradingPool } = useAppData();
	const { position } = useSyntheticsData();

	const pos = position(poolIndex);
	const router = useRouter()

	const view = () => {
		localStorage.setItem("tradingPool", poolIndex.toString());
		setTradingPool(poolIndex);
		router.push('/synthetics')
	}

	const { colorMode } = useColorMode();

	return (
		<>
			<Box
				mb={-5}
				display={{ sm: "block", md: "block" }}
				className={`${VARIANT}-${colorMode}-containerBody`}
			>
				<Flex
					align={"center"}
					justify={"space-between"}
					px={5}
					py={2}
					className={`${VARIANT}-${colorMode}-containerHeader`}
				>
					<Heading fontSize={"18px"}>{pools[poolIndex].name}</Heading>

					<Button variant={'unstyled'} onClick={view}>
						<Flex align={'center'} gap={2} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>
							<Text fontSize={'sm'} fontWeight={'normal'}>
						View Position
							</Text>
						<AiOutlineArrowRight />
						</Flex>
					</Button>
				</Flex>
				<Flex
					p={5}
					justifyContent={"space-between"}
					alignContent={"center"}
				>
					<Flex flexDir={"column"} justify="center">
						<motion.div
							initial={{ opacity: 0, y: 0 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 15 }}
							transition={{ duration: 0.25 }}
							key={poolIndex}
						>
							<Grid
								templateColumns='repeat(2, 1fr)'
								gap={{ sm: 10, md: 6 }}
								zIndex={1}
							>
								<GridItem>
								<Flex mr={3} gap={3} align="start">
									<Info
										message={`
									Sum of all your collateral deposited in USD
								`}
										title={"Total Collateral"}
									>
										<Box cursor={"help"}>
											<Heading
												size={"xs"}
												color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
												mb={0.5}
											>
												Collateral
											</Heading>
											<Flex
												fontWeight={"semibold"}
												fontSize={"lg"}
												gap={1}
												color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}
											>
												<Text fontWeight={"normal"}>
													$
												</Text>
												<Text>
													{tokenFormatter.format(
														Number(
															pos.collateral
														)
													)}
												</Text>
											</Flex>
										</Box>
									</Info>
								</Flex>
								</GridItem>
								<GridItem>
								<Flex gap={3} align="start">
									<Info
										message={`When you issue synths, you are allocated a share of pool's total debt. As the pool's total value changes, your debt changes as well`}
										title={"Debt is variable"}
									>
										<Box cursor={"help"}>
											<Heading
												mb={0.5}
												size={"xs"}
												color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
											>
												Debt
											</Heading>
											<Flex gap={2} align="center">
												<Flex
													fontWeight={"semibold"}
													fontSize={"lg"}
													gap={1}
													color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}
												>
													<Text
														fontWeight={
															"normal"
														}
													>
														$
													</Text>
													<Text>
														{tokenFormatter.format(
															Number(pos.debt)
														)}
													</Text>
												</Flex>
											</Flex>
										</Box>
									</Info>
								</Flex>
								</GridItem>
								<GridItem>
								<Flex gap={3} mr={3} align="start">
									<Info
										message={`You can issue debt till you reach Collateral's Base LTV`}
										title={"Borrow Capacity"}
									>
										<Box cursor={"help"}>
											<Heading
												mb={0.5}
												size={"xs"}
												color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
											>
												Available to Mint
											</Heading>
											<Flex gap={2} align="center">
												<Flex
													fontWeight={"semibold"}
													fontSize={"lg"}
													gap={1}
													color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}
												>
													<Text
														fontWeight={
															"normal"
														}
													>
														$
													</Text>
													<Text>
													{tokenFormatter.format(
														Number(pos.availableToIssue)
													)}
													</Text>
												</Flex>
											</Flex>
										</Box>
									</Info>
								</Flex>
								</GridItem>
								<GridItem>
								<Flex gap={3} align="start">
									<Info
										message={`Your Debt Limit depends on your LTV %. Account would be liquidated if LTV is greater than your Collateral's Liquidation Threshold`}
										title={"Loan to Value (LTV) Ratio"}
									>
										<Box cursor={"help"}>
											<Heading
												mb={0.5}
												size={"xs"}
												color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
											>
												Borrow Limit
											</Heading>
											<Flex gap={2} align="center">
												<Flex
													fontWeight={"semibold"}
													fontSize={"lg"}
													gap={1}
													color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}
												>
													<Text
														fontWeight={"semibold"}
														fontSize={"xl"}
														color={
															Big(pos.availableToIssue).gt(0)
																? "green.400"
																: "yellow.400"
														}
													>
														{Number(pos.debtLimit).toFixed(1)}{" "}
														%
													</Text>
												</Flex>
											</Flex>
										</Box>
									</Info>
								</Flex>
								</GridItem>
							</Grid>
						</motion.div>
					</Flex>
				</Flex>
			</Box>
		</>
	);
}
