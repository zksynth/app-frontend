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
	Image
} from "@chakra-ui/react";
import { ConnectButton as RainbowConnect } from "@rainbow-me/rainbowkit";
import { FaBars } from "react-icons/fa";
import { MdSpaceDashboard, MdSwapHorizontalCircle } from "react-icons/md";

import React, { useEffect, useState } from "react";
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
import { motion } from 'framer-motion';

function NavBar() {
	// const [address, setAddress] = useState(null);
	const router = useRouter();
	const { colorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { status, message, fetchData, setChain } =
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
			(status !== "fetching") &&
			!init
		) {
			setInit(true);
			fetchData(null, ChainID.ARB_GOERLI);
		}
	}, [isConnected, isConnecting, activeConnector, fetchData, setChain, chain, init, chains, address, status]);

	return (
		<>
			<Flex alignItems={"center"} justify='space-between' h={'100px'}>
				<Flex align={'center'} gap={10} width={"33%"} mt={2}>
					<Box cursor="pointer" maxW={"30px"}>
						<Image
							onClick={() => {
								router.push("/");
							}}
							src={'/logo.svg'}
							alt=""
							width="35px"
							height="35px"
							minW={"28px"}
							minH={"28px"}
						/>
					</Box>
					<Flex gap={2}>
						<NavLocalLink
							path={"/"}
							title={"Dashboard"}
							pathname={router.pathname}
						>
							{/* <MdSpaceDashboard /> */}
						</NavLocalLink>
						<NavLocalLink
							path={"/swap"}
							title="Swap"
							pathname={router.pathname}
						>
							{/* <MdSwapHorizontalCircle /> */}
						</NavLocalLink>

						{/* <NavLocalLink
							path={"/syx"}
							title="DAO"
							pathname={router.pathname}
						>
							<MdSwapHorizontalCircle />
						</NavLocalLink> */}

						{/* <NavLocalLink
							path={"/temp"}
							title="Analytics"
							pathname={router.pathname}
						>
							<MdSwapHorizontalCircle />
						</NavLocalLink> */}
					</Flex>
				</Flex>

				<Flex width={"33%"} justify="flex-end" align={"center"} gap={2}>
				<Box display={{ sm: "none", md: "block" }}>
						<RainbowConnect chainStatus={"icon"} />
					</Box>
				</Flex>
			</Flex>
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
}: any) => {
	const [isPath, setIsPath] = useState(false);

	useEffect(() => {
		setIsPath(pathname == path);
	}, [setIsPath, pathname, path]);

	return (
		<Flex align={"center"}>
			<motion.div
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
			<Flex
				align={"center"}
				h={'38px'}
				px={4}
				cursor="pointer"
				rounded={100}
				bgColor={isPath ? "gray.700" : 'gray.800'}
				_hover={{ bgColor:  !isPath ? "gray.700" : "gray.600" }}
			>
				<Box
					color={isPath ? "primary" : "gray.100"}
					
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
			</motion.div>
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
