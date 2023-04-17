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
} from "@chakra-ui/react";
import ConnectButton from '../ConnectButton'; 
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import "../../styles/Home.module.css";
import { useAccount, useNetwork } from "wagmi";
import { useContext } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { TokenContext } from "../context/TokenContext";
import { motion } from "framer-motion";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import NavLocalLink from "./NavLocalLink";
import DAOMenu from "./DAOMenu";
import NavExternalLink from "./NavExternalLink";

function NavBar() {
	const router = useRouter();
	const { ref } = router.query;
	const { status, account, fetchData, refreshData, pools, setRefresh, refresh } = useContext(AppDataContext);
	const { fetchData: fetchTokenData } = useContext(TokenContext);

	const { chain, chains } = useNetwork();
	const [init, setInit] = useState(false);

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
			fetchData(address!)
			.then((_) => {
				for(let i in refresh){
					clearInterval(refresh[i]);
				}
				setRefresh([]);
			})
			fetchTokenData(address!);
			setInit(true);
		},
		onDisconnect() {
			console.log("onDisconnect");
			fetchData(null)
			.then((_) => {
				for(let i in refresh){
					clearInterval(refresh[i]);
				}
				setRefresh([]);
			})
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
			fetchData(null);
		}
	}, [activeConnector, address, chain?.unsupported, chains, fetchData, init, isConnected, isConnecting, isSubscribed, refresh, setRefresh, status]);


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
										pathname: '/',
										query: router.query
									}
								);
							}}
							src={"/logo.svg"}
							alt=""
							width="26px"
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
						<NavLocalLink
							path={"/earn"}
							title="Earn"
						></NavLocalLink>
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

				<NavExternalLink path={'https://docs.synthex.finance/r/quick-start'} title={'Docs'}></NavExternalLink>

				<DAOMenu />


					<Box>
						<ConnectButton />
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
	const { account } = useContext(AppDataContext);

	return (
		<Flex flexDir={"column"}  p={4} gap={4}>
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
			</Box>
		</Flex>
	);
};

export default NavBar;
