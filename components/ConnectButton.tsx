import { Box, Flex, Heading, Image } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const accountPath = "/account";

const Connect = () => {
	const router = useRouter();
	return (
		<ConnectButton.Custom>
			{({
				account,
				chain,
				openAccountModal,
				openChainModal,
				openConnectModal,
				authenticationStatus,
				mounted,
			}) => {
				// Note: If your app doesn't use authentication, you
				// can remove all 'authenticationStatus' checks
				const ready = mounted && authenticationStatus !== "loading";
				const connected =
					ready &&
					account &&
					chain &&
					(!authenticationStatus ||
						authenticationStatus === "authenticated");
				return (
					<div
						{...(!ready && {
							"aria-hidden": true,
							style: {
								opacity: 0,
								pointerEvents: "none",
								userSelect: "none",
							},
						})}
					>
						{(() => {
							if (!connected) {
								return <ConnectButton />;
							}
							if (chain.unsupported) {
								return <ConnectButton />;
							}
							return (
								<>
									<Link href={accountPath} as={accountPath}>
										<Box>
											<Flex align={"center"}>
												<motion.div
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
												>
													<Flex
														align={"center"}
														h={"38px"}
														px={4}
														cursor="pointer"
														rounded={100}
														bgColor={
															router.pathname ==
															accountPath
																? "whiteAlpha.100"
																: "whiteAlpha.50"
														}
														_hover={{
															bgColor: !(
																router.pathname ==
																accountPath
															)
																? "whiteAlpha.200"
																: "whiteAlpha.100",
															shadow: "md",
														}}
														shadow={
															router.pathname ==
															accountPath
																? "md"
																: "none"
														}
														border="2px"
														borderColor={
															"whiteAlpha.50"
														}
													>
														<Box
															color={
																router.pathname ==
																accountPath
																	? "primary.400"
																	: "gray.100"
															}
															fontFamily="Roboto"
															fontWeight={"bold"}
															fontSize="sm"
														>
															<Flex
																align={"center"}
																gap={2}
															>
																{/* {children} */}
																<Heading
																	size={"xs"}
																>
																	{
																		account.displayName
																	}
																</Heading>
															</Flex>
														</Box>
													</Flex>
												</motion.div>
											</Flex>
										</Box>
									</Link>
								</>
							);
						})()}
					</div>
				);
			}}
		</ConnectButton.Custom>
	);
};

export default Connect;
