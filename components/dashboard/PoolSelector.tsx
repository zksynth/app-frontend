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
	Tag,
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
								<Flex align={"center"} mb={4} gap={10}>
									<Flex>
										<Box textAlign={'left'}>
										{/* <Text fontSize={'sm'} color='whiteAlpha.600'>Market Name</Text> */}
										<Flex gap={4}>

										<Heading fontSize={{sm: '3xl', md: "3xl", lg: '3xl'}} fontWeight='semibold'
										// fontFamily='MonumentExtended'
										color={'blackAlpha.800'}
										>
											{pools[tradingPool].name}
										</Heading>
										{/* <Text fontSize={'xs'}>Earning</Text> */}
										{/* <Tag mt={2}>10% APY</Tag> */}

										</Flex>
										</Box>
									</Flex>
									<Flex align={'center'} color='blackAlpha.900'>
									<Text fontSize={'xs'} display={{sm: 'none', md: 'block', lg: 'block'}} >{!isOpen ? 'All Markets' : 'Tap To Close'}</Text>
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
							width: "100%",
							zIndex: '100',
							backgroundColor: "#ffffff",
							border: "2px solid gray",
							borderRadius: "10px"
						}}
					>
						<Box shadow={'xl'}>
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
										_hover={{ bg: "blackAlpha.50" }}
										cursor="pointer"
										px={4}
										my={0}
										// p={'12px'}
									>
										<Flex
											paddingY={1}
											justify={"space-between"}
											align="center"
											py="20px"
										>
											<Box>
												<Heading fontSize={"xl"}>
													{pool.name} ({pool.symbol})
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
													.slice(0, 5)
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
						</Box>
					</motion.ul>
				</motion.nav>
			</Box>
		</div>
	);
}
