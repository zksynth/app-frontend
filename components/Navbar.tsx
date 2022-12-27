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
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	useDisclosure,
	Switch,
	LinkBox,
} from "@chakra-ui/react";

import { ConnectButton as RainbowConnect } from "@rainbow-me/rainbowkit";
import { FaBars } from "react-icons/fa";
import { BsMoonFill, BsSunFill } from "react-icons/bs";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import "../styles/Home.module.css";
import darklogo from "../public/dark_logo.svg";
import lightlogo from "../public/light_logo.svg";
import { useAccount, useConnect, useNetwork } from "wagmi";
import { useContext } from "react";
import { AppDataContext } from "./context/AppDataProvider";
import { ChainID } from "../src/chains";
import { BigNumber } from "ethers";

function NavBar() {
	// const [address, setAddress] = useState(null);
	const router = useRouter();
	const { toggleColorMode } = useColorMode();
	const { colorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { fetchData, isDataReady, isFetchingData, setChain } = useContext(AppDataContext);

	const { chain, chains } = useNetwork();
	const [init, setInit] = useState(false);
	
	const {
		address,
		isConnected,
		isConnecting,
		connector: activeConnector,
		
	} = useAccount({
		onConnect({ address, connector, isReconnected }) {
			if((chain as any).unsupported) return
			console.log("Connected", address);
			fetchData(address!, connector!.chains[0].id);
			setChain(connector!.chains[0].id);
		},
		onDisconnect() {
			console.log("Disconnected");
			fetchData(null, ChainID.ARB_GOERLI);
			setChain(ChainID.ARB_GOERLI);
		},
	});

	useEffect(() => {
		if (activeConnector)
			(window as any).ethereum.on(
				"accountsChanged",
				function (accounts: any[]) {
					console.log(activeConnector);
					// Time to reload your interface with accounts[0]!
					fetchData(accounts[0], activeConnector?.chains[0].id);
					setChain(activeConnector?.chains[0].id);
				}
			);
			(window as any).ethereum.on(
				"chainChanged",
				function (chainId: any[]) {
					if(chains[0]){
						if(chains[0].id == BigNumber.from(chainId).toNumber()) {
							fetchData(address as string, BigNumber.from(chainId).toNumber());
							setChain(BigNumber.from(chainId).toNumber());
						}
					}
				}
			);
		if (localStorage.getItem("chakra-ui-color-mode") === "light") {
			localStorage.setItem("chakra-ui-color-mode", "dark");
		}
		if ((!(isConnected && !isConnecting) || chain?.unsupported) && (!isDataReady || !isFetchingData) && !init) {
			setInit(true);
			fetchData(null, ChainID.ARB_GOERLI);
		}
	}, [isConnected, isConnecting, activeConnector, fetchData, setChain, chain, isDataReady, isFetchingData]);

	return (
		<>
			<Flex alignItems={"center"}>
				<Box width={"33%"} mt={2}>
					<Image
						onClick={() => {
							router.push("/");
						}}
						src={
							// colorMode == "dark" ?
							// darklogo
							//  :
							lightlogo
						}
						alt=""
						width="100px"
						height="70px"
					/>
				</Box>

				<Flex
					justify={"center"}
					width={"33%"}
					display={{ sm: "none", md: "flex" }}
				>
					<Flex gap={6}>
						<Link href="/" as="/">
							<Text
								my="1rem"
								color={
									router.pathname == "/" ? "primary" : "white"
								}
								textDecoration={
									router.pathname == "/" ? "underline" : ""
								}
								textUnderlineOffset={5}
								cursor={"pointer"}
								onClick={onClose}
								fontFamily="Roboto"
								fontWeight={"bold"}
								fontSize="sm"
							>
								Home
							</Text>
						</Link>

						<Link href={"/exchange"} as="/exchange">
							<Text
								cursor={"pointer"}
								color={
									router.pathname == "/exchange"
										? "primary"
										: "gray.100"
								}
								textDecoration={
									router.pathname == "/exchange"
										? "underline"
										: ""
								}
								textUnderlineOffset={5}
								my="1rem"
								onClick={onClose}
								fontFamily="Roboto"
								fontWeight={"bold"}
								fontSize="sm"
							>
								Swap
							</Text>
						</Link>

						{/* <Link href={"/analytics"} as="/analytics">
							<Text
								cursor={"pointer"}
								color={
									router.pathname == "/analytics"
										? "primary"
										: "gray.100"
								}
								textDecoration={
									router.pathname == "/analytics"
										? "underline"
										: ""
								}
								textUnderlineOffset={5}
								my="1rem"
								onClick={onClose}
								fontFamily="Roboto"
								fontWeight={"bold"}
								fontSize="sm"
							>
								Analytics
							</Text>
							</Link> */}
					</Flex>
				</Flex>

				<Flex width={"33%"} justify="flex-end" align={"center"}>
					<Box display={{ sm: "none", md: "block" }}>
						{/* <ConnectButton /> */}
						<RainbowConnect chainStatus={"icon"} />
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
								width="100px"
								height="100px"
							/>
						</Flex>

						<Box mt="1rem" minWidth={"100%"}></Box>
					</DrawerHeader>
					<DrawerBody>
						<Box>
							<UnorderedList
								display={"flex"}
								flexDirection="column"
								alignItems="center"
								justifyContent={"center"}
								listStyleType="none"
							>
								<ListItem>
									<Link href="/">
										<Text
											my="1rem"
											color={
												router.pathname == "/"
													? "primary"
													: "white"
											}
											textDecoration={
												router.pathname == "/"
													? "underline"
													: ""
											}
											textUnderlineOffset={5}
											cursor={"pointer"}
											onClick={onClose}
											fontFamily="Roboto"
											fontWeight={"bold"}
											fontSize="sm"
										>
											Home
										</Text>
									</Link>
								</ListItem>

								{/* <ListItem>
									<Link href="/pools">
										<Text
											my="1rem"
											color={
												router.pathname.includes("pool")
													? "primary"
													: "gray.100"
											}
											textDecoration={
												router.pathname.includes("pool")
													? "underline"
													: ""
											}
											textUnderlineOffset={5}
											cursor={"pointer"}
											onClick={onClose}
											fontFamily="Roboto"
											fontWeight={"bold"}
											fontSize="sm"
										>
											Pools
										</Text>
									</Link>
								</ListItem> */}

								<ListItem>
									<Link href={"/exchange"}>
										<Text
											cursor={"pointer"}
											color={
												router.pathname == "/exchange"
													? "primary"
													: "gray.100"
											}
											textDecoration={
												router.pathname == "/exchange"
													? "underline"
													: ""
											}
											textUnderlineOffset={5}
											my="1rem"
											onClick={onClose}
											fontFamily="Roboto"
											fontWeight={"bold"}
											fontSize="sm"
										>
											Swap
										</Text>
									</Link>
								</ListItem>
								<ListItem my="1rem">
									{/* <ConnectButton /> */}
									<RainbowConnect />
								</ListItem>
							</UnorderedList>
						</Box>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
}

export default NavBar;
