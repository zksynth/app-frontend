import {
	Box,
	Button,
	Flex,
	Heading,
	Text,
	useClipboard,
} from "@chakra-ui/react";
import Big from "big.js";
import { BigNumber } from "ethers";
import { base58 } from "ethers/lib/utils.js";
import Head from "next/head";
import React from "react";
import { FaCopy } from "react-icons/fa";
import { useAccount, useBalance } from "wagmi";

export default function Account() {
	const { address } = useAccount();

	const { onCopy: onLinkCopy, hasCopied: hasCopiedLink } = useClipboard(
		`${process.env.NEXT_PUBLIC_VERCEL_URL}/?ref=${base58.encode(address!)}`
	);

	return (
		<>
		<Head>
				<title>Account | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Box pt="100px">
				<Heading size={"lg"}>
					{/* {address?.slice(0, 8) + "..." + address?.slice(38)} */}
                    Your Account
				</Heading>
			</Box>

			<Box mt={5} bg="bg2" px={6} py={6} rounded={10} border='2px' borderColor={'whiteAlpha.100'}>
				<Flex justify={"space-between"}>
					<Box>
						<Heading size={"md"} mb={10}>
							Refer and Earn
						</Heading>
						<Flex gap={10}>
							<Box maxW={"200px"}>
								<Heading>1</Heading>
								<Text>Invite Your Friends</Text>
								<Text fontSize={'sm'} color='whiteAlpha.700'>Just share the link</Text>

							</Box>

							<Box maxW={"220px"}>
								<Heading>2</Heading>
								<Text>
									Mint/Swap
								</Text>
								<Text fontSize={'sm'} color='whiteAlpha.700'>They get upto 10% fee rebate</Text>

							</Box>
							<Box maxW={"200px"}>
								<Heading>3</Heading>
								<Text>You Earn Fees</Text>
								<Text fontSize={'sm'} color='whiteAlpha.700'>Get upto 20% of their fees</Text>

							</Box>
						</Flex>
					</Box>
					<Box>
						<Box
							mb={2}
							bg={"whiteAlpha.50"}
                            border='2px'
                            borderColor='whiteAlpha.200'
							py={2.5}
							px={4}
							rounded={8}
						>
							{`${process.env.NEXT_PUBLIC_VERCEL_URL}/?ref=${base58.encode(address!)}`}
						</Box>
						<Flex gap={2} justify="end">
							<Button onClick={onLinkCopy}>
								{" "}
								<FaCopy style={{ marginRight: "8px" }} />{" "}
								{hasCopiedLink ? "Copied!" : "Copy"}
							</Button>
						</Flex>
					</Box>
				</Flex>
			</Box>
		</>
	);
}
