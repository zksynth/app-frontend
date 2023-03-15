import React, { useContext } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import {
	Box,
	Flex,
	Heading,
	Skeleton,
	Input,
	Divider,
	Image,
} from "@chakra-ui/react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
	open: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
	closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export default function PoolSelector() {
	const { pools, tradingPool, setTradingPool, totalCollateral, adjustedCollateral } = useContext(AppDataContext);
	const [isOpen, setIsOpen] = React.useState(false);

	window.addEventListener("click", function (e) {
		if (
			!document.getElementById("menu-list-123")?.contains(e.target as any)
		) {
			setIsOpen(false);
		}
	});

	return (
		<div>
			<Box width={"500px"} id="menu-list-123">
				<motion.nav
					initial={false}
					animate={isOpen ? "open" : "closed"}
					className="menu"
				>
					<Flex zIndex={2}>
					{pools[tradingPool] ? <motion.button
							whileTap={{ scale: 0.97 }}
							onClick={() => setIsOpen(!isOpen)}
						>
							<Flex align={"center"} mb={4}>
									<Heading fontSize={"3xl"}>
										{pools[tradingPool].name}
									</Heading>
									<motion.div
									variants={{
										open: { rotate: 180 },
										closed: { rotate: 0 },
									}}
									transition={{ duration: 0.2 }}
									style={{ originY: 0.55 }}
								>
									<RiArrowDropDownLine size={36} />
								</motion.div>
							</Flex>
						</motion.button>
						: (
							<Skeleton height="30px" width="200px" rounded={8} />
						)}
					</Flex>

					<motion.ul
						variants={{
							open: {
								clipPath: "inset(0% 0% 0% 0% round 10px)",
								transition: {
									type: "spring",
									bounce: 0,
									duration: 0.4,
									delayChildren: 0.2,
									staggerChildren: 0.05,
								},
							},
							closed: {
								clipPath: "inset(10% 50% 90% 50% round 10px)",
								transition: {
									type: "spring",
									bounce: 0,
									duration: 0.3,
								},
							},
						}}
						style={{
							pointerEvents: isOpen ? "auto" : "none",
							listStyle: "none",
							display: "flex",
							flexDirection: "column",
							position: "fixed",
							width: "400px",	
							padding: "12px",
							paddingBottom: "18px",	
							backgroundColor: "#202837",
							zIndex: 100,
						}}
					>
						<motion.div
							variants={{
								open: {
									opacity: 1,
									y: 0,
									transition: {
										ease: "easeOut",
										duration: 0.1,
									},
								},
								closed: {
									opacity: 0,
									y: 20,
									transition: { duration: 0.1 },
								},
							}}
						>
							<Input
								placeholder="Search Pool"
								bg={"gray.700"}
								border="0"
								my={2}
								mb={4}
								h="44px"
								_selected={{ border: "0" }}
							/>
							<Divider borderColor={"gray.700"} />
						</motion.div>

						{pools.map((pool, index) => {
							return (
								<motion.li
									variants={itemVariants}
									onClick={() => {
										setTradingPool(index);
										setIsOpen(false);
									}}
									key={index}
								>
									<Box
										_hover={{ bg: "gray.700" }}
										cursor="pointer"
										mx={-3}
										px={4}
									>
										<Flex
											justify={"space-between"}
											align="center"
											py="3"
										>
											<Flex mr={6}>
												{pool.synths
													.slice(0, 3)
													.map(
														(
															synth: any,
															index: number
														) => (
															<Box
																mr={-6}
																key={index}
															>
																<Image
																	width={
																		"44px"
																	}
																	height={
																		"44px"
																	}
																	src={`/icons/${synth.token.symbol}.svg`}
																	alt={""}
																/>
															</Box>
														)
													)}
											</Flex>
											<Box>
												<Heading fontSize={"xl"}>
													{pool.name}
												</Heading>
												<Flex
													justify={"end"}
													mr={2}
													mt="2"
												>
													{pool.collaterals
														.slice(0, 3)
														.map(
															(
																synth: any,
																index: number
															) => (
																<Box
																	mr={-2}
																	key={index}
																>
																	<Image
																		width={
																			"22px"
																		}
																		height={
																			"22px"
																		}
																		src={`/icons/${synth.token.symbol}.svg`}
																		alt={""}
																	/>
																</Box>
															)
														)}
												</Flex>
											</Box>
										</Flex>
										<Divider borderColor={"gray.700"} />
									</Box>
								</motion.li>
							);
						})}

						{/* <Box py={1} mb={-6} mx={-3} px={3} bg='gray.700'>
							<Text fontSize={'sm'}>Showing {pools.length} markets</Text>
						</Box> */}
					</motion.ul>
				</motion.nav>
			</Box>
		</div>
	);
}
