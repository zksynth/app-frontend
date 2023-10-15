import React, { useContext } from "react";
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
	ModalOverlay,
	useColorMode,
} from "@chakra-ui/react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { BsStars } from "react-icons/bs";
import { motion, Variants } from "framer-motion";
import { useLendingData } from "../../context/LendingDataProvider";
import { HEADING_FONT, VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";

const itemVariants: Variants = {
	open: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
	closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export default function PoolSelector() {
	const { pools, protocols } = useLendingData();
	const [searchedPools, setSearchedPools] = React.useState<any[]>([]);

	const router = useRouter();
	const selectedPool = Number(router.query.market);

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

	const { colorMode } = useColorMode();

	return (
		<Box>
			<Box id="menu-list-123" h='40px'>
				<motion.nav
					initial={false}
					animate={isOpen ? "open" : "closed"}
					className="menu"
				>
					<Flex zIndex={2} >
						{pools[selectedPool] ? (
							<motion.button
								whileTap={{ scale: 0.97 }}
								onClick={() => setIsOpen(!isOpen)}
							>
								<Flex align={"center"}  gap={6}>
									<Flex>
										<Box textAlign={'left'}>
										<Flex gap={4}>
										<Heading fontSize={{sm: '3xl', md: "3xl", lg: '32px'}} fontWeight={HEADING_FONT == 'Chakra Petch' ? 'bold' : 'semibold'}>
											{protocols[selectedPool].name}
										</Heading>
										</Flex>
										</Box>
									</Flex>
									<Flex align={'center'} color={colorMode == 'dark' ? 'whiteAlpha.700' : 'blackAlpha.700'} >
									<Text fontSize={'sm'} display={{sm: 'none', md: 'block', lg: 'block'}} >{!isOpen ? 'All Pools' : 'Tap To Close'}</Text>
									<motion.div
										variants={{
											open: { rotate: 180, marginBottom: '4px' },
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
							<Skeleton height="30px" width="200px" rounded={0} />
						)}
					</Flex>
					<motion.ul
						variants={{
							open: {
								clipPath: "inset(0% 0% 0% 0%)",
								transition: {
									type: "spring",
									bounce: 0,
									duration: 0.4,
									delayChildren: 0.2,
									staggerChildren: 0.05,
								},
							},
							closed: {
								clipPath: "inset(00% 50% 90% 50%)",
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
							width: "450px",
							zIndex: '100',
							borderRadius: VARIANT == 'rounded' ? '16px' : '0px',
							// background: "linear-gradient(45deg, transparent 10px, #1D1F24 0) bottom left, linear-gradient(-135deg, transparent 10px, #1D1F24 0) top right",
							// backgroundRepeat: 'no-repeat',
							// backgroundSize: '100% 50%',
							// boxShadow: '0px 0px 20px 0px rgba(0,255,0,0.5)',
						}}
						
					>
						<Box className={`${VARIANT}-${colorMode}-containerBody`}>
							<Box className={`${VARIANT}-${colorMode}-containerHeader`}>
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
										// background: "linear-gradient(-135deg, transparent 10px, #2B2E32 0) top right",
										// backgroundRepeat: 'no-repeat',
										// backgroundSize: '100% 100%',
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
							</Box>

						{VARIANT == 'edgy' && <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> }

						{searchedPools.map((pool, index) => {
							return (
								<motion.li
									variants={itemVariants}
									onClick={() => {
										router.push(`/lend/${index}`);
										setIsOpen(false);
									}}
									key={index}
								>
									<Box
										_hover={{ bg: "bg.600" }}
										cursor="pointer"
										px={4}
										my={0}
									>
										<Flex
											paddingY={1}
											justify={"space-between"}
											align="center"
											py="20px"
										>
											<Box>
												<Flex gap={2}>
												<Heading fontSize={"xl"}>
													{protocols[index].name}
												</Heading>
												{protocols[index].slug == 'synthetic' && <Flex rounded={'full'} px={2} py={1} bgGradient={'linear(to-r, secondary.700, secondary.400, primary.400)'}> 
													<BsStars />
													<Heading fontSize={'sm'} fontWeight={'bold'}>Synthetic</Heading>
												</Flex>}
												</Flex>
												<Flex
													justify={"start"}
													mr={2}
													mt="3"
												>
													{pool
														.slice(0, 10)
														.map(
															(
																market: any,
																index: number
															) => (
																<Box
																	mr={-2}
																	key={index}
																>
																	{/* {JSON.stringify(market)} */}
																	<Image
																		width={
																			"30px"
																		}
																		height={
																			"30px"
																		}
																		src={`/icons/${market.inputToken.symbol}.svg`}
																		alt={""}
																	/>
																</Box>
															)
														)}
												</Flex>
											</Box>
											<Flex mr={4}>
												{/* {pool.synths
													.slice(0, 5)
													.map(
														(
															synth: any,
															index: number
														) => (
															<Box
																mr={-3}
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
													)} */}
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
		</Box>
	);
}
