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
import { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import { dollarFormatter } from "../src/const";

import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Account() {
	const { address } = useAccount();

	const { onCopy: onLinkCopy, hasCopied: hasCopiedLink } = useClipboard(
		`${process.env.NEXT_PUBLIC_VERCEL_URL}/?ref=${base58.encode(address ?? "0x")}`
	);

	const { referrals, account } = useContext(AppDataContext);

	return (
		<>
			<Head>
				<title>Account | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>

			{address ? <>
				<Box pt="100px">
				<Heading size={"lg"}>
					{/* {address?.slice(0, 8) + "..." + address?.slice(38)} */}
					Your Account
				</Heading>
				<Text mt={1} color='whiteAlpha.700'>{address}</Text>

				<Flex my={10} gap={20}>
					<Box>
						<Heading size={"sm"} color="whiteAlpha.700">
							Active Since
						</Heading>
						<Text mt={0.5} fontSize={"2xl"}>
						{account ? new Date(account.createdAt * 1000)
								.toDateString()
								.slice(4) : '-' }
						</Text>
					</Box>

					<Box>
						<Heading size={"sm"} color="whiteAlpha.700">
							Total Volume
						</Heading>
						<Text mt={0.5} fontSize={"2xl"}>
							{account ? dollarFormatter.format(account?.totalMintUSD ?? 0) : '-'}
						</Text>
					</Box>
				</Flex>
			</Box>

			{account && <> 
			{/* <Box
				mt={5}
				bg="bg2"
				px={6}
				py={6}
				rounded={10}
				border="2px"
				borderColor={"whiteAlpha.100"}
			>
				<Flex justify={"space-between"}>
					<Box>
						<Heading size={"md"} mb={10}>
							Refer and Earn
						</Heading>
						<Flex gap={10}>
							<Box maxW={"200px"}>
								<Heading>1</Heading>
								<Text>Invite Your Friends</Text>
								<Text fontSize={"sm"} color="whiteAlpha.700">
									Just share the link
								</Text>
							</Box>

							<Box maxW={"220px"}>
								<Heading>2</Heading>
								<Text>Mint/Swap</Text>
								<Text fontSize={"sm"} color="whiteAlpha.700">
									They Mint/Swap using your referral code
								</Text>
							</Box>
							<Box maxW={"200px"}>
								<Heading>3</Heading>
								<Text>You Earn Fees</Text>
								<Text fontSize={"sm"} color="whiteAlpha.700">
									Get upto 20% of their fees
								</Text>
							</Box>
						</Flex>
					</Box>
					<Box>
						<Box
							mb={2}
							bg={"whiteAlpha.50"}
							border="2px"
							borderColor="whiteAlpha.200"
							color={"whiteAlpha.700"}
							py={2.5}
							px={4}
							rounded={8}
						>
							{`${
								process.env.NEXT_PUBLIC_VERCEL_URL
							}/?ref=${base58.encode(address!)}`}
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
				{referrals.length > 0 && (
					<Box mt={10} mx={-6}>
						<Heading size={'sm'}>My Referrals</Heading>
						<TableContainer>
							<Table variant="simple">
								<Thead>
									<Tr>
										<Th>My Referrals</Th>
										<Th>Volume (USD)</Th>
										<Th isNumeric>Referral Fees</Th>
									</Tr>
								</Thead>
								<Tbody>
									{referrals.map(
										(account: any, index: number) => (
											<Tr key={index}>
												<Td>
													{account.id.slice(0, 8) +
														"..." +
														account.id.slice(36)}
												</Td>
												<Td>
													{dollarFormatter.format(
														Number(
															account.totalMintUSD
														) +
															Number(
																account.totalBurnUSD
															)
													)}
												</Td>
												<Td isNumeric>{"-"}</Td>
											</Tr>
										)
									)}
								</Tbody>
							</Table>
						</TableContainer>
					</Box>
				)}
			</Box>  */}
			</>}
			 </>: <>
				<Flex flexDir="column"  justify={'center'} align='center' h='80vh'>
				<Heading mb={5}>{address ? 'Your Account' : 'Connect Your Wallet'}</Heading>
				<Box>
					<ConnectButton/>
				</Box>
				</Flex>
			</>}
			
		</>
	);
}
