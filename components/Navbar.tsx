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
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import "../styles/Home.module.css";
import darklogo from "../public/dark_logo.svg";
import lightlogo from "../public/light_logo.svg";
import { useAccount } from "wagmi";
import { useContext } from 'react';
import { AppDataContext } from "./context/AppDataProvider";

function NavBar() {
	// const [address, setAddress] = useState(null);
	const router = useRouter();
	const { toggleColorMode } = useColorMode();
	const { colorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { fetchData, setChain } = useContext(AppDataContext);

	const {address, isConnected: isEvmConnected, isConnecting: isEvmConnecting} = useAccount({
		onConnect({ address, connector, isReconnected }) {
			console.log('Connected', address)
			fetchData(address!, connector!.chains[0].id);
			setChain(connector!.chains[0].id);
		}
	});

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
									<RainbowConnect/>
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
