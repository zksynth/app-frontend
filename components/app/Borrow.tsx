import { Box, Flex, Text, Divider, Button, CircularProgress, Skeleton } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { tokenFormatter } from "../../src/const";
import { useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { call, getABI, getAddress, getContract } from "../../src/contract";
import { ethers } from "ethers";
import Big from "big.js";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { AiFillPlusCircle } from 'react-icons/ai';
import { MdGeneratingTokens } from "react-icons/md";

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
	const { chain: connectedChain } = useNetwork();

	useEffect(() => {
		if (
			!synAccrued &&
			isConnected &&
			!(connectedChain as any).unsupported
		) {
			_setSynAccrued()
		}
	});

	const _setSynAccrued = async () => {
		const synthex = await getContract("SyntheX", chain);
		const result = await synthex.callStatic.getSYNAccrued(address)
		setSynAccrued(result.toString());
	}

	const claim = async () => {
		setClaiming(true);
		const synthex = await getContract("SyntheX", chain);
		synthex['claimSYN(address)'](address)
			.then(async (result: any) => {
				await result.wait(1);
				setClaiming(false);
				setSynAccrued('0')
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
						<Text fontSize={"sm"}>Rewards</Text>

						<Flex align={'center'} gap={1}>
						{!(connectedChain as any).unsupported ? 
						(synAccrued !== null && isConnected) ? <Text fontSize={"2xl"} fontWeight="bold">{tokenFormatter?.format(synAccrued / 1e18)}</Text> : 
						<Skeleton height={'20px'} width='60px' mr={1}/>
					: <>-</>
				}
						

					<Text fontSize={"2xl"} fontWeight="bold">$SYN</Text>
					</Flex>
						<Button
							size="sm"
							mt={1}
							// width="100%"
							onClick={claim}
							isLoading={claiming}
							loadingText="Claiming"
							disabled={Big(synAccrued ?? 0).eq(0)}
							rounded={20}
						>
							<MdGeneratingTokens/> <Text ml={1}>Claim</Text>
						</Button>
					</Box>
				</Flex>
				{/* <Stats/> */}
			</Flex>

			{/* <Divider mb={4} borderColor={'#3C3C3C'}/> */}
			<Flex flexDir={"column"} justify="space-between" height={"50%"}>
				<Flex justify={"space-between"} align="end">
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
								adjustedCollateral > 0
									? adjustedCollateral / adjustedDebt
									: Infinity
							)}
						</Text>
					</Box>


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
