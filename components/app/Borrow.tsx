import {
	Box,
	Flex,
	Text,
	Divider,
	Button,
	CircularProgress,
	Skeleton,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { tokenFormatter } from "../../src/const";
import { useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { call, getABI, getAddress, getContract } from "../../src/contract";
import { ethers } from "ethers";
import Big from "big.js";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { AiFillPlusCircle } from "react-icons/ai";
import { MdGeneratingTokens } from "react-icons/md";

export default function Borrow() {
	const {
		totalDebt,
		availableToBorrow,
		adjustedCollateral,
		adjustedDebt,
		pools,
		dollarFormatter,
		chain,
	} = useContext(AppDataContext);

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);

	const [hydrated, setHydrated] = useState(false);

	const { address, isConnected, isConnecting } = useAccount();
	const { chain: connectedChain } = useNetwork();

	useEffect(() => {
		setHydrated(true);
		if (connectedChain) {
			if (
				!synAccrued &&
				isConnected &&
				!(connectedChain as any).unsupported
			) {
				_setSynAccrued();
			}
		}
	}, [connectedChain, synAccrued, isConnected]);

	const _setSynAccrued = async () => {
		const synthex = await getContract("SyntheX", chain);
		const result = await synthex.callStatic.getSYNAccrued(address, pools.map((pool: any) => pool.id))
		setSynAccrued(result.toString());
	};

	const claim = async () => {
		setClaiming(true);
		const synthex = await getContract("SyntheX", chain);
		synthex["claimSYN(address,address[])"](address, pools.map((pool: any) => pool.id))
			.then(async (result: any) => {
				await result.wait(1);
				setClaiming(false);
				setSynAccrued("0");
			})
			.catch((err: any) => {
				console.log(err);
				setClaiming(false);
			});
	};

	if(!hydrated) return <></>

	return (
		<Flex
			flexDir={"column"}
			justify="space-between"
			px={"30px"}
			py="22px"
			height={"100%"}
		>
			<Flex flexDir={"column"} justify={"space-between"} height={"50%"}>
				<Flex justify={"space-between"}>
					<Box>
						<Text fontSize={"sm"}>Borrow Balance</Text>
						<Text fontSize={"2xl"} fontWeight="bold">
							{dollarFormatter?.format(totalDebt)}
						</Text>
					</Box>
					<Box textAlign={"right"}>
						<Text fontSize={"sm"}>Rewards</Text>
						<Flex align={"center"} gap={1}>
							{connectedChain &&
							!(connectedChain as any).unsupported ? (
								synAccrued !== null && isConnected ? (
									<Text fontSize={"2xl"} fontWeight="bold">
										{tokenFormatter?.format(
											synAccrued / 1e18
										)}
									</Text>
								) : (
									<Skeleton
										height={"20px"}
										width="60px"
										mr={1}
									/>
								)
							) : (
								<>-</>
							)}

							<Text fontSize={"2xl"} fontWeight="bold">
								$SYN
							</Text>
						</Flex>
						<Button
							size="sm"
							mt={1}
							onClick={claim}
							isLoading={claiming}
							loadingText="Claiming"
							disabled={Big(synAccrued ?? 0).eq(0)}
							rounded={20}
						>
							<MdGeneratingTokens /> <Text ml={1}>Claim</Text>
						</Button>
					</Box>
				</Flex>
			</Flex>

			<Flex flexDir={"column"} justify="space-between" height={"50%"}>
				<Flex justify={"space-between"} align="end" >
					<Box textAlign={"left"}>
						<Text fontSize={"sm"}>Health Factor</Text>
						<Text fontSize={"2xl"} fontWeight="bold">
							{tokenFormatter?.format(
								adjustedCollateral > 0
									? adjustedCollateral / adjustedDebt
									: Infinity
							)}
						</Text>
					</Box>

					<Flex justify={"flex-end"} gap={4}>
						<Text fontSize={"sm"} color="gray.400">
							Safe: 1.30
						</Text>
						<Divider
							orientation="vertical"
							height={"20px"}
							borderColor="gray.400"
						/>
						<Text fontSize={"sm"} color="gray.400">
							Min: 1.00
						</Text>
					</Flex>
				</Flex>

				<Box textAlign={"right"} mb={2}>
					<Flex width={"100%"}>
						<Box
							minH={2}
							roundedLeft={10}
							bgColor="primary"
							width={
								100 * (adjustedDebt / adjustedCollateral) + "%"
							}
						></Box>
						<Box
							minH={2}
							roundedRight={10}
							bgColor="gray.600"
							width={
								adjustedCollateral > 0
									? 100 *
											(1 -
												adjustedDebt /
													adjustedCollateral) +
									  "%"
									: "100%"
							}
						></Box>
					</Flex>
				</Box>
			</Flex>
		</Flex>
	);
}
