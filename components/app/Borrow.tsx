import {
	Box,
	Flex,
	Text,
	Divider,
	Button,
	CircularProgress,
	Skeleton,
	Tooltip,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { tokenFormatter } from "../../src/const";
import { useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { call, getABI, getAddress, getContract } from "../../src/contract";
import { ethers } from "ethers";
import Big from "big.js";
import { InfoIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { AiFillPlusCircle } from "react-icons/ai";
import { MdGeneratingTokens } from "react-icons/md";

export default function Borrow() {
	const {
		totalDebt,
		safeCRatio,
		adjustedCollateral,
		adjustedDebt,
		pools,
		dollarFormatter,
		chain,
	} = useContext(AppDataContext);

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);

	const { address, isConnected, isConnecting } = useAccount();
	const { chain: connectedChain } = useNetwork();

	useEffect(() => {
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
		const result = 0
		// await synthex.callStatic.getSYNAccrued(
		// 	address,
		// 	pools.map((pool: any) => pool.id)
		// );
		setSynAccrued(result.toString());
	};

	const claim = async () => {
		setClaiming(true);
		const synthex = await getContract("SyntheX", chain);
		synthex["claimSYN(address,address[])"](
			address,
			pools.map((pool: any) => pool.id)
		)
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

	return (
		<Flex
			flexDir={"column"}
			justify="space-between"
			px={"30px"}
			py="22px"
			height={"100%"}
		>
			<Flex flexDir={"column"} justify={"space-between"} height={"30%"}>
				<Flex justify={"space-between"} align="start">
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
								xSYN
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

			<Divider/>

			<Flex flexDir={"column"} justify="space-between" height={"50%"}>
				<Flex justify={"space-between"} align="start">
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

					<Box textAlign="right">
						<Text fontSize={"sm"}>Available to Borrow</Text>
						<Text fontSize={"2xl"} fontWeight="bold">
							{dollarFormatter?.format(
								Big(
									Big(adjustedCollateral)
										.div(safeCRatio)
										.minus(adjustedDebt)
								).toNumber()
							)}
						</Text>
					</Box>
				</Flex>

				<Box pb={4}>
					<Box mb={4} width="40%">
						
							<Flex align="center">
								<Text fontSize={"sm"} color="gray.400">
									Safe {">"} {safeCRatio*100}%
								</Text>
								<Divider
									orientation="vertical"
									height={"15px"}
									mt={"3px"}
									borderColor="gray.400"
									mx={2}
								/>
								<Text fontSize={"sm"} color="gray.400">
									Minimum: 100%
								</Text>
								<Tooltip
							fontSize={"xs"}
							label={ <>
							{`You are allowed to issue only till your health factor reaches ${safeCRatio} and will be liquidated if it falls below 1.0`} 
							</>}
						>
								<InfoIcon ml={2} color="gray.400" />
						</Tooltip>
							</Flex>
					</Box>

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
