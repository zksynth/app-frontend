import {
	Box,
	Button,
	Flex,
	Heading,
	Progress,
	Text,
	useBreakpointValue,
	useColorMode,
	useMediaQuery,
	useToast,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/NavBar/Navbar";
import { useEffect } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { Status } from "../components/utils/status";
import { defaultChain } from "../src/const";
import { usePriceData } from "../components/context/PriceContext";
import Success from "../components/modals/debt/Success";

export default function Index({ children }: any) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [refresh, setRefresh] = useState(0);

	useEffect(() => {
		const handleStart = (url: any) => {
			setLoading(true);
			setRefresh(Math.random());
		};
		const handleComplete = (url: any) => {
			setLoading(false);
			setRefresh(Math.random());
		};

		router.events.on("routeChangeStart", handleStart);
		router.events.on("routeChangeComplete", handleComplete);
		router.events.on("routeChangeError", handleComplete);

		return () => {
			router.events.off("routeChangeStart", handleStart);
			router.events.off("routeChangeComplete", handleComplete);
			router.events.off("routeChangeError", handleComplete);
		};
	}, [loading, refresh]);

	const [hydrated, setHydrated] = useState(false);
	const { status, message } = useContext(AppDataContext);
	const { status: priceStatus } = usePriceData();

	const { chain } = useNetwork();

	useEffect(() => {
		setHydrated(true);
	}, []);

	const { chains, error, isLoading, pendingChainId, switchNetworkAsync } =
		useSwitchNetwork();
	const toast = useToast();

	const switchNetwork = async (chainId: number) => {
		switchNetworkAsync!(chainId).catch((err) => {
			console.log("Error", err);
			toast({
				title: "Unable to switch network.",
				description: "Please try switching networks from your wallet.",
				position: "top-right",
				status: "error",
				duration: 9000,
				isClosable: true,
			});
		});
	};

	if (!hydrated) return <></>;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { colorMode } = useColorMode();

	return (
		<Box>
			{/* <Flex align={'center'} justify={'center'} bgColor={colorMode == 'dark' ? "bg.600" : 'lightBg.600'} color={colorMode == 'dark' ? 'whiteAlpha.700' : 'blackAlpha.700'}>
				<Text
					textAlign={'center'} 
					fontSize={'sm'}
					fontWeight="medium"
					p={2}
					px={4}>
					{process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? "This is a testnet. Please do not send real assets to these addresses" : "We're still in beta. Even though we are audited, only deposit what you can afford to lose."}
				</Text>
			</Flex> */}
			<Flex
				display={{ sm: "block", md: "none" }}
				align={"center"}
				justify={"center"}
				bgColor={colorMode == "dark" ? "darkBg.400" : "lightBg.400"}
				color={"whiteAlpha.700"}
			>
				<Text
					textAlign={"center"}
					fontSize={"sm"}
					fontWeight="medium"
					p={1.5}
				>
					Not optimised for mobile view yet
				</Text>
			</Flex>
			{chain?.id !== defaultChain.id && switchNetworkAsync && (
				<Flex
					align={"center"}
					justify={"center"}
					bgColor="primary.600"
					color={"white"}
				>
					<Text
						textAlign={"center"}
						fontSize={"sm"}
						fontWeight="medium"
						p={1.5}
					>
						Please switch to {defaultChain.name} Network to use this
						app
					</Text>
					<Button
						ml={2}
						size="xs"
						bg={"white"}
						_hover={{ bg: "whiteAlpha.800" }}
						color={"black"}
						rounded={"full"}
						my={1}
						onClick={() => switchNetwork(defaultChain.id)}
					>
						Switch to {defaultChain.name}
					</Button>
				</Flex>
			)}
			{(status == Status.FETCHING ||
				priceStatus !== Status.SUCCESS ||
				loading) && (
				<Progress
					bg={"blackAlpha.200"}
					colorScheme="primary"
					size="xs"
					isIndeterminate
				/>
			)}

			<Box bgColor="gray.800" color={"gray.400"}>
				{status == Status.ERROR && (
					<Text
						textAlign={"center"}
						width="100%"
						fontSize={"sm"}
						fontWeight="bold"
						p={2}
					>
						{message}
					</Text>
				)}
			</Box>

			<Box
				bgGradient={
					colorMode == "dark"
						? "linear(to-b, blackAlpha.500, blackAlpha.800)"
						: "linear(to-b, blackAlpha.200, blackAlpha.400)"
				}
				zIndex={0}
			>
				<Flex
					justify={"center"}
					flexDirection={{ sm: "column", md: "row" }}
					minH="97vh"
					maxW={"100%"}
				>
					<Box
						zIndex={2}
						minW={{ sm: "0", md: "0", lg: "1200px" }}
						w={"100%"}
						px={{ sm: "4", md: "0" }}
					>
						<Flex justify="center">
							<Box minW={"0"} w="100%" maxW={"1200px"}>
								<Navbar />
								<motion.div
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 15 }}
									transition={{ duration: 0.25 }}
								>
									<Box zIndex={1}>
										{process.env
											.NEXT_PUBLIC_UNDER_MAINTAINANCE ==
										"true" ? (
											<Flex
												h={"80vh"}
												align={"center"}
												justify={"center"}
											>
												<Box textAlign={"center"}>
													<Heading>
														App in under
														maintainance
													</Heading>
													<Text
														color={"whiteAlpha.600"}
													>
														Please Check Back Again
														in a moment
													</Text>
												</Box>
											</Flex>
										) : (
											<>{children}</>
										)}
									</Box>
								</motion.div>
							</Box>
						</Flex>
					</Box>
				</Flex>
				<Footer />
				<Box></Box>
			</Box>
		</Box>
	);
}
