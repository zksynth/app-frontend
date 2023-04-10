import {
	Box,
	CardHeader,
	Heading,
	Text,
	Flex,
	Button,
	Skeleton,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { tokenFormatter } from "../../src/const";
import { getContract } from "../../src/contract";
import Big from "big.js";
import { useContext } from 'react';
import { AppDataContext } from "../context/AppDataProvider";
import { TokenContext } from "../context/TokenContext";

export default function Claim() {
	const { address, isConnected, isConnecting } = useAccount();
	const { chain: connectedChain } = useNetwork();

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);

	const {pools} = useContext(AppDataContext);

	const { claimed } = useContext(TokenContext);

    useEffect(() => {
		if (connectedChain) {
			if (
				synAccrued == null &&
				isConnected &&
				!(connectedChain as any).unsupported &&
                pools.length > 0
			) {
				getContract("SyntheX", connectedChain!.id)
				.then(synthex => {
					synthex.callStatic.getRewardsAccrued(
						[pools[0].rewardTokens[0].id],
						address,
						pools.map((pool: any) => pool.id)
					).then(result => {
						setSynAccrued(result[0].toString());
					})

				})
			}
		}
	}, [connectedChain, synAccrued, isConnected, pools, address]);

	

    const claim = async () => {
		setClaiming(true);
		console.log(pools);
		const synthex = await getContract("SyntheX", connectedChain!.id);
		synthex["claimReward(address,address,address[])"](
            [pools[0].rewardTokens[0].token.id],
			address,
			pools.map((pool: any) => pool.id)
		)
			.then(async (result: any) => {
				await result.wait(1);
				setClaiming(false);
				setSynAccrued("0");
				claimed((synAccrued/1e18).toString());
			})
			.catch((err: any) => {
				console.log(err);
				setClaiming(false);
			});
	};



	return (
		<>
			<Box textAlign={"center"}>
				<Heading size={"md"}>Claim your esSYX</Heading>

				<Text mt={2} mb={5} fontSize="sm">
					Provide liquidity by issuing synthetic assets to earn esSYX.
				</Text>

				<Text fontSize={'sm'}>Available</Text>
				<Flex justify={'center'} align={"center"} gap={1}>
					{connectedChain && !(connectedChain as any).unsupported ? (
						synAccrued !== null && isConnected ? (
							<Text fontSize={"2xl"} fontWeight="bold">
								{tokenFormatter?.format(synAccrued / 1e18)}
							</Text>
						) : (
							<Skeleton height={"20px"} width="60px" mr={1} />
						)
					) : (
						<>-</>
					)}

					<Text fontSize={"2xl"} fontWeight="bold">
						esSYX
					</Text>
				</Flex>

                <Button
							size="md"
							mt={2}
							onClick={claim}
							isLoading={claiming}
							loadingText="Claiming"
							isDisabled={Big(synAccrued ?? 0).eq(0)}
							rounded={16}
                            colorScheme="primary"
                            variant="outline"
						>
							Claim All
						</Button>
			</Box>
		</>
	);
}
