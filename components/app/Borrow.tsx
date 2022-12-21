import { Box, Flex, Text, Divider, Button } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { tokenFormatter } from "../../src/const";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { call, getABI, getAddress, getContract } from "../../src/contract";
import { ethers } from "ethers";

export default function Borrow() {
	const {
		totalCollateral,
		totalDebt,
		availableToBorrow,
		adjustedCollateral,
		adjustedDebt,
		minCRatio,
		safeCRatio,
		dollarFormatter,
		chain,
	} = useContext(AppDataContext);

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);

	const { address, isConnected, isConnecting } = useAccount();

	useEffect(() => {
		if (!synAccrued && address) {
			(async () => {
				const provider = new ethers.providers.Web3Provider(
					(window as any).ethereum!,
					"any"
				);
				const synthex = await getContract("SyntheX", chain);
				synthex.callStatic.synAccrued(address).then((result: any) => {
					setSynAccrued(result.toString());
				});
			})();
		}
	});

	const claim = async () => {
		setClaiming(true);
		const synthex = await getContract("SyntheX", chain);
		synthex
			.claimSYN1(address)
			.then(async (result: any) => {
				await result.wait(1);
				setClaiming(false);
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
			bgColor="#171717"
			rounded={15}
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

					{/* <Box textAlign={'right'}>
						<Text fontSize={'sm'}>Available to Borrow</Text>
						<Text fontSize={'2xl'} fontWeight="bold">
							{dollarFormatter?.format(availableToBorrow())}
						</Text>
					</Box> */}
					<Box textAlign={"right"}>
						<Text fontSize={"sm"}>Claim Rewards</Text>
						<Text fontSize={"2xl"} fontWeight="bold">
							{tokenFormatter?.format(synAccrued / 1e18)} $SYN
						</Text>
						<Button
							color={"black"}
							size="sm"
							mt={1}
							width="100%"
							onClick={claim}
							isLoading={claiming}
							loadingText="Claiming"
						>
							Claim 💰
						</Button>
					</Box>
				</Flex>
				{/* <Stats/> */}
			</Flex>

			{/* <Divider mb={4} borderColor={'#3C3C3C'}/> */}
			<Flex flexDir={"column"} justify="space-between" height={"50%"}>
				<Flex justify={"space-between"} align='end'>
					{/* <Box>
						<Text fontSize={'sm'}>Collateralisation Ratio</Text>
						<Text fontSize={'xl'} fontWeight="bold">
							{((100 * totalCollateral) / totalDebt).toFixed(2)} %
						</Text>
					</Box> */}
					<Box textAlign={"left"}>
						<Text fontSize={"sm"}>Health Factor</Text>
						<Text fontSize={"2xl"} fontWeight="bold">
							{tokenFormatter?.format(
								adjustedCollateral / adjustedDebt
							)}
						</Text>
						<Text fontSize={"sm"} color="gray">
							Min 1.00
						</Text>
					</Box>

					{/* <Box textAlign={'left'}>
						<Text fontSize={'sm'}>Minimum Required</Text>
						<Text fontSize={'xl'} fontWeight="bold">
							{minCRatio} %
						</Text>

						
					</Box> */}

					<Flex justify={"flex-end"} gap={6} mb={-2}>
						<Text fontSize={"sm"} color="gray">
							Safe: 1.30
						</Text>
						<Divider
							orientation="vertical"
							height={"20px"}
							borderColor="gray"
						/>
						<Text fontSize={"sm"} color="gray">
							Min: 1.00
						</Text>
					</Flex>
				</Flex>

				<Box textAlign={"right"} mb={4}>
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
							bgColor="gray.700"
							width={
								100 * (1 - adjustedDebt / adjustedCollateral) +
								"%"
							}
						></Box>
					</Flex>
				</Box>
			</Flex>
		</Flex>
	);
}
