import {
	Flex,
	Text,
	Box,
	Image,
	Progress,
	useDisclosure,
	Collapse,
	Stack,
	IconButton,
	Heading,
	useColorMode,
	Button,
} from "@chakra-ui/react";


import { ConnectButton as RainbowConnect } from '@rainbow-me/rainbowkit';
import ConnectButton from './ConnectButton'; 
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import "../styles/Home.module.css";
import { useAccount, useNetwork } from "wagmi";
import { useContext } from "react";
import { AppDataContext } from "./context/AppDataProvider";
import { ChainID } from "../src/chains";
import { BigNumber } from "ethers";
import { TokenContext } from "./context/TokenContext";
import { motion } from "framer-motion";
import { RiArrowDropDownLine } from "react-icons/ri";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { tokenFormatter, query } from '../src/const';

function NavBar() {
	const router = useRouter();
	const { ref } = router.query;
	const { status, account, fetchData, setChain, refreshData, pools, setRefresh, refresh } =

		useContext(AppDataContext);
	const { fetchData: fetchTokenData } = useContext(TokenContext);

	const { chain, chains } = useNetwork();
	const [init, setInit] = useState(false);
	const [hasRefreshed, setHasRefreshed] = useState(false);

	const { isOpen: isToggleOpen, onToggle } = useDisclosure();
	const [isSubscribed, setIsSubscribed] = useState(false);

	const {
		address,
		isConnected,
		isConnecting,
		connector: activeConnector,
	} = useAccount({
		onConnect({ address, connector, isReconnected }) {
			console.log("onConnect");
			if ((chain as any).unsupported) return;
			setChain(connector!.chains[0].id);
			fetchData(address!, connector!.chains[0].id)
			.then((_) => {
				for(let i in refresh){
					clearInterval(refresh[i]);
				}
				setRefresh([]);
			})
			fetchTokenData(address!, connector!.chains[0].id);
			setInit(true);
		},
		onDisconnect() {
			console.log("onDisconnect");
			fetchData(null, ChainID.ARB_GOERLI)
			.then((_) => {
				for(let i in refresh){
					clearInterval(refresh[i]);
				}
				setRefresh([]);
			})
			setChain(ChainID.ARB_GOERLI);
		},
	});

	useEffect(() => {
		if (activeConnector && window.ethereum && !isSubscribed) {
			(window as any).ethereum.on(
				"accountsChanged",
				function (accounts: any[]) {
					// refresh page
					window.location.reload();
				}
			);
			(window as any).ethereum.on(
				"chainChanged",
				function (chainId: any[]) {
					// refresh page
					window.location.reload();
				}
			);
			setIsSubscribed(true);
		}
		if (localStorage.getItem("chakra-ui-color-mode") === "light") {
			localStorage.setItem("chakra-ui-color-mode", "dark");
			// reload
			window.location.reload();
		}
		if (
			(!(isConnected && !isConnecting) || chain?.unsupported) &&
			status !== "fetching" &&
			!init
		) {
			setInit(true);
			fetchData(null, ChainID.ARB_GOERLI);
		}
	}, [activeConnector, address, chain?.unsupported, chains, fetchData, init, isConnected, isConnecting, isSubscribed, refresh, setChain, setRefresh, status]);


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
			<Flex alignItems={"center"} justify="space-between" h={"100px"} w='100%'>
				<Flex justify="space-between" align={"center"} gap={10} mt={2} w='100%'>
					<Flex gap={10} align='center' cursor="pointer">
						<Image
							onClick={() => {
								router.push(
									{
										pathname: '/about',
										query: router.query
									}
								);
							}}
							src={"/logo.svg"}
							alt=""
							width="28px"
						/>
						<Flex
						
						gap={2}
						align="center"
						display={{ sm: "none", md: "flex" }}
					>
						<NavLocalLink
							path={"/"}
							title={"Dashboard"}
						></NavLocalLink>
						<NavLocalLink
							path={"/swap"}
							title="Swap"
						></NavLocalLink>
						<NavLocalLink
							path={"/claim"}
							title="Claim"
						></NavLocalLink>
						<Box id="dao-nav-link">
							<motion.nav
								initial={false}
								animate={isOpen ? "open" : "closed"}
								className="menu"
							>
								<Flex zIndex={2}>
									<motion.button
										onHoverStart={() => setIsOpen(true)}
									>
										<Flex
											align={"center"}
											id="dao-nav-link"
											h={"38px"}
										>
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
														bg="whiteAlpha.50"
														_hover={{
															bgColor:
																"whiteAlpha.100",
														}}
														border="2px"
														borderColor={
															"whiteAlpha.50"
														}
													>
														<Box
															color={"gray.100"}
															fontFamily="Roboto"
															fontWeight={"bold"}
															fontSize="sm"
														>
															<Flex
																align={"center"}
															>
																<Heading
																	size={"xs"}
																	mr={-1}
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
																		size={
																			28
																		}
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
											clipPath:
												"inset(0% 0% 0% 0% round 0px)",
											transition: {
												type: "spring",
												bounce: 0,
												duration: 0.25,
												delayChildren: 0.2,
												staggerChildren: 0.05,
											},
										},
										closed: {
											clipPath:
												"inset(10% 50% 90% 50% round 0px)",
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
										position: "fixed",
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
					</Flex>
					</Flex>
					
					<Flex display={{sm: 'flex', md: 'none'}}>
						<IconButton
							onClick={onToggle}
							icon={
								isOpen ? (
									<CloseIcon w={3} h={3} />
								) : (
									<HamburgerIcon w={5} h={5} />
								)
							}
							variant={"ghost"}
							aria-label={"Toggle Navigation"}
						/>
					</Flex>
				</Flex>

				<Flex	
					display={{ sm: "none", md: "flex" }}
					justify="flex-end"
					align={"center"}
					gap={2}
					w='100%'
					
				>
				<motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
					<Link href={{ pathname: "/leaderboard", query: router.query }} >
						<Flex
							align={"center"}
							h={"38px"}
							w='100%'
							px={3}
							cursor="pointer"
							rounded={100}
						>
							<Box
								color={"gray.100"}
								fontSize="sm"
							>
								<Flex align={"center"} gap={2}>
									
									<Heading size={"sm"} color={router.pathname == '/leaderboard' ? 'primary.400' : 'white'}>{(Number(account?.totalPoint ?? '0')).toFixed(0)} Points</Heading>
								</Flex>
							</Box>
						</Flex>
					</Link>
				</motion.div>

					<Box>
						<ConnectButton />
						{/* <Button onClick={toggleColorMode}>
							Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
						</Button> */}

					</Box>
				</Flex>
			</Flex>
			<Collapse in={isToggleOpen} animateOpacity>
				<MobileNav />
			</Collapse>
		</>
	);
}

const MobileNav = ({}: any) => {
	const router = useRouter();
	return (
		<Flex flexDir={"column"} bg='whiteAlpha.50' p={4} gap={4}>
			<NavLocalLink
				path={"/"}
				title={"Dashboard"}
			></NavLocalLink>
			<NavLocalLink
				path={"/swap"}
				title="Swap"
			></NavLocalLink>
			<NavLocalLink
				path={"/claim"}
				title="Claim"
			></NavLocalLink>
			<NavLocalLink
				path={"/dao/syx"}
				title="Token"
			></NavLocalLink>

			<NavLocalLink
				path={"/dao/vest"}
				title="Vest"
			></NavLocalLink>
			<Box>
				<RainbowConnect />
			</Box>
		</Flex>
	);
};

const NavLink = ({
	path,
	title,
	target = "_parent",
	newTab = false,
	children,
	bg = "whiteAlpha.50",

}: any) => {
	const [isPath, setIsPath] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// search path
		setIsPath(path == router.pathname);
	}, [setIsPath, router.pathname, path]);

	return (
		<Flex align={"center"}>
			<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<Flex
					align={"center"}
					h={"38px"}
					px={4}
					cursor="pointer"
					rounded={100}
					bgColor={isPath ? "whiteAlpha.100" : bg}
					_hover={{
						bgColor: !isPath ? "whiteAlpha.200" : "whiteAlpha.100",
						shadow: "md",
					}}
					shadow={isPath ? "md" : "none"}
					border="2px"
					borderColor={"whiteAlpha.50"}
				>
					<Box
						color={isPath ? "primary.400" : "gray.100"}
						fontFamily="Roboto"
						fontWeight={"bold"}
						fontSize="sm"
					>
						<Flex align={"center"} gap={2}>
							{children}
							<Heading size={"xs"}>{title}</Heading>
						</Flex>
					</Box>
				</Flex>
			</motion.div>
		</Flex>
	);
};

const NavLocalLink = ({
	path,
	title,
	children,
	lighten,
	bg = "whiteAlpha.50",
}: any) => {
	const router = useRouter();
	return (
		<Link href={{ pathname: path, query: router.query }} >
			<Box>
				<NavLink
					path={path}
					title={title}
					lighten={lighten}
					bg={bg}
				>
					{" "}
					{children}{" "}
				</NavLink>
			</Box>
		</Link>
	);
};

const NavExternalLink = ({ path, title, pathname, children, lighten }: any) => {
	const [isPath, setIsPath] = useState(false);

	useEffect(() => {
		setIsPath(pathname == path);
	}, [setIsPath, pathname, path]);

	return (
		<Link
			href={`${path}`}
			as={`${path}`}
			target={"_blank"}
			rel="noreferrer"
		>
			<NavLink
				path={path}
				title={title}
				pathname={pathname}
				lighten={lighten}
			>
				{" "}
				{children}{" "}
			</NavLink>
		</Link>
	);
};

export default NavBar;
