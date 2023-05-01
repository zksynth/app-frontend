import { Box, Heading, Text, Flex, useClipboard, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Button } from '@chakra-ui/react'
import { base58 } from 'ethers/lib/utils.js';
import React, { useContext } from 'react'
import { FaCopy } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { dollarFormatter } from '../../src/const';
import { AppDataContext } from '../context/AppDataProvider';

export default function Referral() {
    const { referrals, account } = useContext(AppDataContext);
    const { address } = useAccount();

    const { onCopy: onLinkCopy, hasCopied: hasCopiedLink } = useClipboard(
		`${process.env.NEXT_PUBLIC_VERCEL_URL}/?ref=${base58.encode(address ?? "0x")}`
	);

  return (
    <>
    <> 
			<Box
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
			</Box> 
			</>
    </>
  )
}
