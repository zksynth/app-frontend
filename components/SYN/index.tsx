import {
	Box,
	CardHeader,
	Heading,
	Text,
	Flex,
	Button,
	Skeleton,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import React, { useContext, useState } from "react";
import { TokenContext } from "../context/TokenContext";
import Claim from "./Claim";
import Stake from "./Stake";
import { tokenFormatter, dollarFormatter } from '../../src/const';
import { UnlockIcon } from "@chakra-ui/icons";
import Unlock from "./Unlock";
import { useAccount } from 'wagmi';

export default function SYX() {
	const [tabIndex, setTabIndex] = React.useState(1);
	const { staking, syn, tokenUnlocks } = useContext(TokenContext);

	const { isConnected } = useAccount()

	const tabStyle = (index: number) => ({
		borderRadius: 100,
		_hover: {
			bg: tabIndex == index ? "secondary" : "whiteAlpha.100",
		},
		color: tabIndex == index ? "white" : "gray.300",
		bg: tabIndex == index ? "secondary" : "transparent",
		onClick: () => setTabIndex(index),
	});

	return (
		<Flex flexDir={"column"} align={"center"} mt={10} mb={10} rounded={15}>
			<Box textAlign={"center"}>
				<Heading size={"lg"}>SyntheX Token (SYX)</Heading>
				<Flex my={10} mb={20} gap={32} minW={'100%'}>
					<Box>
						<Text fontSize={'sm'} color='gray.400'>Price</Text>
						<Text>{dollarFormatter.format(100)}</Text>
					</Box>

					<Box>
						<Text fontSize={'sm'} color='gray.400'>Token Supply</Text>
						<Text>{dollarFormatter.format(100)}</Text>
					</Box>

					<Box>
						<Text fontSize={'sm'} color='gray.400'>Market Cap</Text>
						<Text>{dollarFormatter.format(100)}</Text>
					</Box>

				</Flex>
			</Box>

			<Box
				w={"70%"}
				minW="600px"
				bgColor="gray.700"
				textAlign={"center"}
				px={6}
				py={6}
				pb={10}
				roundedTop={15}
			>
				<Heading size={'md'} mt={1}>Escrowed SYN</Heading>
				<Text my={5} mb={10} mx={20} fontSize="md" color={'gray.400'}>
					esSYX token rewards SyntheX protocol users, unlocking 1:1 for SYX after linear time. Earn protocol fees and participate in governance.
				</Text>
				<Heading size={"md"}>Overview</Heading>
				<Flex justify="space-evenly" mt={5}>
					<Box w={"33%"}>
						<Heading size={"xs"} color="gray.300">
							esSYX Balance
						</Heading>
						{syn.sealedBalance ? (
							<Text mt={2}>
								{tokenFormatter.format(
									parseFloat(syn.sealedBalance)
								)}
							</Text>
						) : isConnected ? (
							<Skeleton
								height="20px"
								width="100px"
								mx={"auto"}
								mt={2}
							/>
						) : <>-</>}
					</Box>

					<Box w={"33%"}>
						<Heading size={"xs"} color="gray.300">
							Staked
						</Heading>
						{staking.staked ? (
							<Text mt={2}>
								{tokenFormatter.format(
									parseFloat(staking.staked)
								)}
							</Text>
						) : isConnected ? (
							<Skeleton
								height="20px"
								width="100px"
								mx={"auto"}
								mt={2}
							/>
						) : <>-</>}
					</Box>

					<Box w={"33%"}>
						<Heading size={"xs"} color="gray.300">
							Unlocking
						</Heading>
						{tokenUnlocks.pendingUnlocks ? (
							<Text mt={2}>
								{
									// sum of all tokenUnlocks.pendingUnlocks[].amount
									tokenFormatter.format(
										tokenUnlocks.pendingUnlocks.reduce(
											(acc, curr) =>
												acc + parseFloat(curr.amount),
											0
										)
									)
								}
							</Text>
						) : isConnected ? (
							<Skeleton
								height="20px"
								width="100px"
								mx={"auto"}
								mt={2}
							/>
						) : <>-</>}
					</Box>
				</Flex>
			</Box>

			<Flex
				mt={-5}
				gap={1}
				// p={'3px'}
				zIndex={1}
				borderRadius={"100"}
				bgColor="gray.700"
				border={"3px solid"}
				borderColor="gray.800"
			>
				<Button {...tabStyle(0)}>Claim</Button>
				<Button {...tabStyle(1)}>Stake</Button>
				<Button {...tabStyle(2)}>Redeem</Button>
			</Flex>

			<Box
				w="70%"
				minW="600px"
				mt={-7}
				pb={10}
				pt={14}
				roundedBottom={15}
				bg={"gray.800"}
				zIndex={0}
			>
				<Box>
					{tabIndex == 0 ? (
						<>
							<Claim />
						</>
					) : tabIndex == 1 ? (
						<>
							<Stake />
						</>
					) : (
						<>
							<Unlock />
						</>
					)}
				</Box>
			</Box>
		</Flex>
	);
}
