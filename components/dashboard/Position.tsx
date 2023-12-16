import React from "react";
import Info from "../infos/Info";
import { Flex, Text, Box, Heading, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IoMdAnalytics, IoMdCash } from "react-icons/io";
import IconBox from "./IconBox";
import { TbReportMoney } from "react-icons/tb";
import Big from "big.js";
import { useAppData } from "../context/AppDataProvider";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { dollarFormatter, tokenFormatter } from "../../src/const";
import { useSyntheticsData } from "../context/SyntheticsPosition";
import { VARIANT } from "../../styles/theme";

export default function Position({ poolIndex }: any) {
	const { pools, tradingPool, account } = useAppData();
	const { position } = useSyntheticsData();

	const pos = position(tradingPool);
	const { colorMode } = useColorMode();

	return (
		<>
			{Big(pos?.collateral).gt(0) ? (
				<Flex
					flexDir={'column'}
					wrap={"wrap"}
					w="100%"
					className={`${VARIANT}-${colorMode}-containerBody`}
					shadow={'0'}
				>
					<Flex
						align={"center"}
						justify={"space-between"}
						px={5}
						py={4}
						className={`${VARIANT}-${colorMode}-containerHeader`}
					>
						<Heading fontSize={"18px"}>Your Position</Heading>

						<Info
							message={`You can issue debt till you reach Collateral's Base LTV`}
							title={"Borrow Capacity"}
						>
							<Flex
								justify={{ sm: "start", md: "end" }}
								align="center"
								gap={1}
								cursor={"help"}
								fontSize={"sm"}
							>
								<Text color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}>
									Available to Mint:{" "}
								</Text>
								<Text mr={0.5} fontWeight="medium">
									{dollarFormatter.format(
										Number(pos.availableToIssue)
									)}
								</Text>
							</Flex>
						</Info>
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
								key={tradingPool}
							>
								<Flex
									flexDir={{ sm: "column", md: "row" }}
									gap={{ sm: 10, md: 12 }}
									zIndex={1}
								>
									<Flex gap={3} align="start">
										<IconBox>
											<IoMdCash size={"18px"} />
										</IconBox>

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

									<Flex gap={3} align="start">
										<IconBox>
											<TbReportMoney size={"18px"} />
										</IconBox>

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
								mt={{ sm: 16, md: 0 }}
								minW={'200px'}
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
											color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
										>
											Borrow Limit
										</Heading>

										<Box mb={1}>
											<InfoOutlineIcon
												color={colorMode == 'dark' ?  "whiteAlpha.500" : "blackAlpha.500"}
												h={3}
											/>
										</Box>
									</Flex>
								</Info>
								<Text
									fontWeight={"semibold"}
									fontSize={"3xl"}
									color={
										Big(pos.availableToIssue).gt(0)
											? "green.400"
											: "yellow.400"
									}
								>
									{Number(pos.debtLimit).toFixed(1)} %
								</Text>
								<Box
									mt={2}
									width={"100%"}
									bg={colorMode == 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'}
								>
									<Box
										h={1.5}
										bg={
											Big(pos.availableToIssue).gt(0)
												? "green.400"
												: "yellow.400"
										}
										width={pos.debtLimit + "%"}
									></Box>
								</Box>
							</Box>
						</motion.div>
					</Flex>
				</Flex>
			) : (
				<></>
			)}
		</>
	);
}
