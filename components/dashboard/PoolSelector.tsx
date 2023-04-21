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
	Text,
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
	const { pools, tradingPool, setTradingPool } = useContext(AppDataContext);
	const [searchedPools, setSearchedPools] = React.useState<any[]>([]);

	React.useEffect(() => {
		setSearchedPools(pools);
	}, [pools]);

	const [isOpen, setIsOpen] = React.useState(false);

	window.addEventListener("click", function (e) {
		if (
			!document.getElementById("menu-list-123")?.contains(e.target as any)
		) {
			setIsOpen(false);
		}
	});

	const handleSearch = (e: any) => {
		const search = e.target.value;
		const filteredPools = Object.keys(pools).filter((pool: any) => {
			return pools[pool].name.toLowerCase().includes(search.toLowerCase());
		});
		const newPools: any[] = [];
		filteredPools.forEach((pool: any) => {
			newPools[pool] = pools[pool];
		});
		setSearchedPools(newPools);
	};

	return (
		<div>
			<Box id="menu-list-123" h='50px'>
				<motion.nav
					initial={false}
					animate={isOpen ? "open" : "closed"}
					className="menu"
				>
					<Flex zIndex={2} >
						{pools[tradingPool] ? (
							<motion.button
								whileTap={{ scale: 0.97 }}
								onClick={() => setIsOpen(!isOpen)}
							>
								<Flex align={"end"} mb={4} gap={10}>
									<Flex>
										<Box textAlign={'left'}>
										{/* <Text fontSize={'sm'} color='whiteAlpha.600'>Market Name</Text> */}
										<Heading fontSize={"3xl"}>
											{pools[tradingPool].name}
										</Heading>
										</Box>
									</Flex>
									<Flex align={'center'} color='whiteAlpha.800'>
									<Text fontSize={'sm'} >{ !isOpen ? 'All Markets' : 'Tap To Close'}</Text>
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

								</Flex>
							</motion.button>
						) : (
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
							position: "relative",
							width: "400px",
							zIndex: '100',
							backgroundColor: "#0A1931",
							border: "2px solid #212E44",
							borderRadius: "10px"
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
							style={{
								padding: "4px 10px",
								borderRadius: '8px 8px 0 0'
							}}
						>
							<Input
								placeholder="Search Pool"
								bg={'transparent'}
								rounded={0}
								my={3}
								pl={1}
								variant='unstyled'
								onChange={handleSearch}
								_active={{ borderColor: "transparent" }}
							/>
						</motion.div>

						<Divider/>

						{searchedPools.map((pool, index) => {
							return (
								<motion.li
									variants={itemVariants}
									onClick={() => {
										localStorage.setItem("tradingPool", index.toString());
										setTradingPool(index);
										setIsOpen(false);
									}}
									key={index}
								>
									<Box
										_hover={{ bg: "whiteAlpha.50" }}
										cursor="pointer"
										px={4}
										// p={'12px'}
									>
										<Flex
											justify={"space-between"}
											align="center"
											py="20px"
										>
											<Box>
												<Heading fontSize={"xl"}>
													{pool.name}
												</Heading>
												<Flex
													justify={"start"}
													mr={2}
													mt="3"
												>
													{pool.collaterals
														.slice(0, 4)
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
																			"30px"
																		}
																		height={
																			"30px"
																		}
																		src={`/icons/${synth.token.symbol}.svg`}
																		alt={""}
																	/>
																</Box>
															)
														)}
												</Flex>
											</Box>
											<Flex mr={4}>
												{pool.synths
													.slice(0, 4)
													.map(
														(
															synth: any,
															index: number
														) => (
															<Box
																mr={-4}
																key={index}
															>
																<Image
																	width={
																		"40px"
																	}
																	src={`/icons/${synth.token.symbol}.svg`}
																	alt={""}
																/>
															</Box>
														)
													)}
											</Flex>
											
										</Flex>
										{index != pools.length - 1 && <Divider
											borderColor={"whiteAlpha.200"}
											mx={-4}
											w="109%"
										/>}
									</Box>
								</motion.li>
							);
						})}
					</motion.ul>
				</motion.nav>
			</Box>
		</div>
	);
}
