import { Flex, Text, Box, Heading } from "@chakra-ui/react";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiArrowDropDownLine } from "react-icons/ri";
import NavLocalLink from "./NavLocalLink";

export default function NavBar() {
	const router = useRouter();

	const [isOpen, setIsOpen] = React.useState(false);

	window.addEventListener("click", function (e) {
		if (
			!document.getElementById("dao-nav-link")?.contains(e.target as any)
		) {
			setIsOpen(false);
		}
	});

	return (
		<>
			<Box id="dao-nav-link" maxH={'40px'}>
				<motion.nav
					initial={false}
					animate={isOpen ? "open" : "closed"}
					className="menu"
				>
					<Flex zIndex={2}>
						<motion.button onHoverStart={() => setIsOpen(true)}>
							<Flex align={"center"} id="dao-nav-link" h={"38px"}>
								<Flex align={"center"}>
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Flex
											align={"center"}
											h={"38px"}
											pl={4}
											pr={1}
											cursor="pointer"
											rounded={100}
											// bg="whiteAlpha.50"
											// _hover={{
											// 	bgColor: "whiteAlpha.100",
											// }}
											// border="2px"
											// borderColor={"whiteAlpha.50"}
										>
											<Box
												color={router.pathname.includes('dao') ? 'primary.400': 'gray.100'}
												fontFamily="Roboto"
												fontWeight={"bold"}
												fontSize="sm"
											>
												<Flex align={"center"}>
													<Heading
														size={"xs"}
														mr={-1}
														mt={0.5}
													>
														DAO
													</Heading>

													<motion.div
														variants={{
															open: {
																rotate: 180,
																y: -2,
															},
															closed: {
																rotate: 0,
															},
														}}
														transition={{
															duration: 0.25,
														}}
														style={{
															originY: 0.55,
														}}
													>
														<RiArrowDropDownLine
															size={28}
														/>
													</motion.div>
												</Flex>
											</Box>
										</Flex>
									</motion.div>
								</Flex>
							</Flex>
						</motion.button>
					</Flex>

					<motion.ul
						onHoverEnd={() => setIsOpen(false)}
						variants={{
							open: {
								clipPath: "inset(0% 0% 0% 0% round 0px)",
								transition: {
									type: "spring",
									bounce: 0,
									duration: 0.25,
									delayChildren: 0.2,
									staggerChildren: 0.05,
								},
							},
							closed: {
								clipPath: "inset(10% 50% 90% 50% round 0px)",
								transition: {
									type: "spring",
									bounce: 0,
									duration: 0.35,
								},
							},
						}}
						style={{
							pointerEvents: isOpen ? "auto" : "none",
							listStyle: "none",
							display: "flex",
							flexDirection: "column",
							position: "relative",
							paddingBottom: "18px",
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
							<Flex
								flexDir={"column"}
								justify="left"
								align="left"
								gap={2}
								mt={3}
								mx={1}
							>

								<NavLocalLink
									path={"/dao/syx"}
									title="Token"
									></NavLocalLink>

								<NavLocalLink
									path={"/dao/vest"}
									title="Vest"
								></NavLocalLink>
							</Flex>
						</motion.div>
					</motion.ul>
				</motion.nav>
			</Box>
		</>
	);
}
