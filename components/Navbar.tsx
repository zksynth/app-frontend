import {
	Flex,
	Text,
	Box,
	useColorMode,
	Button,
	UnorderedList,
	ListItem,
	Drawer,
	DrawerBody,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	useDisclosure,
	IconButton,
} from "@chakra-ui/react";

import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuItemOption,
	MenuGroup,
	MenuOptionGroup,
	MenuDivider,
} from "@chakra-ui/react";
import { ConnectButton as RainbowConnect } from "@rainbow-me/rainbowkit";
import { FaBars } from "react-icons/fa";
import { MdSpaceDashboard, MdSwapHorizontalCircle } from "react-icons/md";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import "../styles/Home.module.css";
import darklogo from "../public/dark_logo.svg";
import lightlogo from "../public/light_logo.svg";
import logo from "../public/logo.svg";
import { useAccount, useNetwork } from "wagmi";
import { useContext } from "react";
import { AppDataContext } from "./context/AppDataProvider";
import { ChainID } from "../src/chains";
import { BigNumber } from "ethers";
import { RiCopperCoinFill, RiMenu5Fill } from "react-icons/ri";
import { FiBarChart2 } from "react-icons/fi";
import { TokenContext } from "./context/TokenContext";

function NavBar() {
	// const [address, setAddress] = useState(null);
	const router = useRouter();
	const { colorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { fetchData, isDataReady, isFetchingData, setChain } =
		useContext(AppDataContext);
	const { fetchData: fetchTokenData } = useContext(TokenContext);

	const { chain, chains } = useNetwork();
	const [init, setInit] = useState(false);

	const {
		address,
		isConnected,
		isConnecting,
		connector: activeConnector,
	} = useAccount({
		onConnect({ address, connector, isReconnected }) {
			if ((chain as any).unsupported) return;
			fetchData(address!, connector!.chains[0].id);
			setChain(connector!.chains[0].id);
			fetchTokenData(address!, connector!.chains[0].id);
		},
		onDisconnect() {
			fetchData(null, ChainID.ARB_GOERLI);
			setChain(ChainID.ARB_GOERLI);
		},
	});

	useEffect(() => {
		if (activeConnector && window.ethereum) {
			(window as any).ethereum.on(
				"accountsChanged",
				function (accounts: any[]) {
					// Time to reload your interface with accounts[0]!
					fetchData(accounts[0], activeConnector?.chains[0].id);
					setChain(activeConnector?.chains[0].id);
				}
			);
			(window as any).ethereum.on(
				"chainChanged",
				function (chainId: any[]) {
					if (chains[0]) {
						if (
							chains[0].id == BigNumber.from(chainId).toNumber()
						) {
							fetchData(
								address as string,
								BigNumber.from(chainId).toNumber()
							);
							setChain(BigNumber.from(chainId).toNumber());
						}
					}
				}
			);
		}
		if (localStorage.getItem("chakra-ui-color-mode") === "light") {
			localStorage.setItem("chakra-ui-color-mode", "dark");
			// reload
			window.location.reload();
		}
		if (
			(!(isConnected && !isConnecting) || chain?.unsupported) &&
			(!isDataReady || !isFetchingData) &&
			!init
		) {
			setInit(true);
			fetchData(null, ChainID.ARB_GOERLI);
		}
	}, [
		isConnected,
		isConnecting,
		activeConnector,
		fetchData,
		setChain,
		chain,
		isDataReady,
		isFetchingData,
		init,
		chains,
		address,
	]);

	return (
		<>
			<Flex alignItems={"center"} justify='space-between'>
				<Box width={"33%"} mt={2} py={5}>
					<Box cursor="pointer" maxW={"30px"}>
						<Image
							onClick={() => {
								router.push("/");
							}}
							src={logo}
							alt=""
							width="30"
							height="30"
						/>
					</Box>
				</Box>

				<Flex
					justify={"center"}
					width={"33%"}
					display={{ sm: "none", md: "flex" }}
				>
					<Flex gap={1}>
						<NavLocalLink
							path={"/"}
							title={"Dashboard"}
							pathname={router.pathname}
						>
							<MdSpaceDashboard />
						</NavLocalLink>
						<NavLocalLink
							path={"/swap"}
							title="Swap"
							pathname={router.pathname}
						>
							<MdSwapHorizontalCircle />
						</NavLocalLink>
					</Flex>
				</Flex>

				<Flex width={"33%"} justify="flex-end" align={"center"} gap={2}>
				<Box display={{ sm: "none", md: "block" }}>
						<RainbowConnect chainStatus={"icon"} />
					</Box>
					<Box display={{ sm: "none", md: "block" }}>
						<Menu
						>
							<MenuButton 
								_hover={{ bg: 'gray.700' }}
								color="white"
								rounded={"full"}
								aria-label={""}
								_expanded={{ bg: 'secondary' }}
								p={2}
								>
									<RiMenu5Fill size={20} />
							</MenuButton>
							<MenuList
								bg={"none"}
								border="0"
								shadow={0}
								mt={-1}
							>
								<Flex flexDir={'column'} align='end'>
								<NavLocalLink
									path={"/syn"}
									title="xSYN"
									pathname={router.pathname}
									lighten={true}
								>
									<RiCopperCoinFill />
								</NavLocalLink>

								<Box my={1}/>

								<NavExternalLink
									path={"https://stats.synthex.finance"}
									newTab={true}
									title="Analytics"
									pathname={router.pathname}
									lighten={true}
								>
									<FiBarChart2 />
								</NavExternalLink>
								</Flex>
							</MenuList>
						</Menu>
					</Box>
					
				</Flex>

				<Box display={{ sm: "block", md: "none", lg: "none" }}>
					<FaBars size={20} onClick={onOpen} color="white" />
				</Box>
			</Flex>
			<Drawer placement={"right"} onClose={onClose} isOpen={isOpen}>
				<DrawerOverlay />
				<DrawerContent alignItems={"center"} bgColor={"gray.800"}>
					<DrawerHeader borderBottomWidth="1px">
						<Flex alignItems={"center"}>
							<Image
								src={colorMode == "dark" ? darklogo : lightlogo}
								alt=""
								width="100"
								height="100"
							/>
						</Flex>

						<Box mt="1rem" minWidth={"100%"}></Box>
					</DrawerHeader>
					<DrawerBody>
						<Box>
						<NavLocalLink
							path={"/"}
							title={"Dashboard"}
							pathname={router.pathname}
						>
							<MdSpaceDashboard />
						</NavLocalLink>
						<NavLocalLink
							path={"/swap"}
							title="Swap"
							pathname={router.pathname}
						>
							<MdSwapHorizontalCircle />
						</NavLocalLink>

						<NavLocalLink
									path={"/syn"}
									title="xSYN"
									pathname={router.pathname}
									lighten={true}
								>
									<RiCopperCoinFill />
								</NavLocalLink>

								<Box my={1}/>

								<NavExternalLink
									path={"https://stats.synthex.finance"}
									newTab={true}
									title="Analytics"
									pathname={router.pathname}
									lighten={true}
								>
									<FiBarChart2 />
								</NavExternalLink>
						</Box>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
}

const NavLink = ({
	path,
	title,
	target = "_parent",
	newTab = false,
	pathname,
	children,
	lighten = false,
}: any) => {
	const [isPath, setIsPath] = useState(false);

	useEffect(() => {
		setIsPath(pathname == path);
	}, [setIsPath, pathname, path]);

	return (
		<Flex align={"center"}>
			<Flex
				align={"center"}
				h={10}
				px={4}
				cursor="pointer"
				rounded={100}
				bgColor={isPath ? "gray.700" : lighten ? 'gray.800' : "transparent"}
				_hover={{ bgColor:  !isPath ? "gray.800" : "gray.700" }}
			>
				<Box
					color={isPath ? "primary" : "gray.100"}
					my="1rem"
					fontFamily="Roboto"
					fontWeight={"bold"}
					fontSize="sm"
				>
					<Flex align={"center"} gap={2}>
						{children}
						<Text>{title}</Text>
					</Flex>
				</Box>
			</Flex>
		</Flex>
	);
};

const NavLocalLink = ({ path, title, pathname, children, lighten }: any) => {
	return (
		<Link href={`${path}`} as={`${path}`}>
			<Box>
				<NavLink path={path} title={title} pathname={pathname} lighten={lighten}>
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
			<NavLink path={path} title={title} pathname={pathname} lighten={lighten}>
				{" "}
				{children}{" "}
			</NavLink>
		</Link>
	);
};

export default NavBar;
