import React, { useState } from "react";

import {
	Flex,
	Image,
	Text,
	Box,
	useDisclosure,
	Button,
	Divider,
    Tooltip,
} from "@chakra-ui/react";
import Big from "big.js";
import InfoFooter from "../_utils/InfoFooter";
import Response from "../_utils/Response";
import { useAccount, useBalance, useNetwork } from "wagmi";
import Link from "next/link";
import { ethers } from "ethers";
import { getAddress, getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { ETH_ADDRESS, compactTokenFormatter, dollarFormatter } from "../../../src/const";

export default function Withdraw({ collateral, amount, amountNumber }: any) {
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const {
		chain,
		pools,
		tradingPool,
        adjustedCollateral,
        totalCollateral,
        totalDebt,
		updateCollateralWalletBalance,
		updateCollateralAmount,
		addCollateralAllowance,
	} = useContext(AppDataContext);

	const max = () => {
        const val = collateral.priceUSD > 0 ? Big(adjustedCollateral).sub(totalDebt).div(collateral.priceUSD).toNumber() : 0;
        return Math.min(
            collateral.balance ?? 0,
            val > 0 ? val : 0
        ).toString();
	};

	const withdraw = async () => {
		const poolId = pools[tradingPool].id;
		const pool = await getContract("Pool", chain, poolId);
		let tx;
		if (collateral.token.id == ETH_ADDRESS.toLowerCase()) {
			tx = send(
				pool,
				"withdrawETH",
				[ethers.utils
					.parseUnits(amount, collateral.token.decimals)
					.toString()],
				chain
			);
		} else {
			tx = send(
				pool,
				"withdraw",
				[
					collateral.token.id,
					ethers.utils.parseUnits(amount, collateral.token.decimals),
				],
				chain
			);
		}
		tx.then(async (res: any) => {
			setLoading(false);
			setResponse("Transaction sent! Waiting for confirmation...");
			setHash(res.hash);
			await res.wait(1);
			setConfirmed(true);
			const collateralId = collateral.token.id;
			const value = Big(amount)
				.mul(Big(10).pow(Number(collateral.token.decimals)))
				.toFixed(0);
			updateCollateralWalletBalance(collateralId, poolId, value, false);
			updateCollateralAmount(collateralId, poolId, value, true);
			setMessage(
				`You have withdrawn ${amount} ${collateral.token.symbol} from your position.`
			);
			setResponse("Transaction Successful!");
		}).catch((err: any) => {
			console.log(err);
			setMessage(JSON.stringify(err));
			setLoading(false);
			setConfirmed(true);
			setResponse("Transaction failed. Please try again!");
		});
	};

	const { address, isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	return (
		<>
			<Box bg={"blackAlpha.200"} roundedBottom={16} px={5} pt={5} pb={2}>
				<Box
					// border="1px"
					// borderColor={"gray.700"}
					mt={4}
					rounded={8}
					// p={2}
				>
					<Flex justify="space-between">
						<Tooltip label='Max capacity to have this asset as collateral'>
						<Text fontSize={"md"} color="gray.400" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Capacity
						</Text>
						</Tooltip>

						<Text fontSize={"md"}>
							{compactTokenFormatter.format(
								Number(
									ethers.utils.formatUnits(
										collateral.totalDeposits ?? 0,
										collateral.token.decimals
									)
								)
							)}{" "}
							/{" "}
							{compactTokenFormatter.format(
								Number(
									ethers.utils.formatUnits(
										collateral.cap,
										collateral.token.decimals
									)
								)
							)}
						</Text>
					</Flex>
					<Divider my={2} />

					<Flex justify="space-between">
						{/* <Text fontSize={"xs"} color="gray.400">
								1 {asset._mintedTokens[selectedAssetIndex].symbol} = {asset._mintedTokens[selectedAssetIndex].lastPriceUSD}{" "}
								USD
							</Text> */}

							<Flex gap={1}>
						<Tooltip label='Minimum Loan to Value Ratio'>

						<Text fontSize={"md"} color="gray.400" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Base LTV
						</Text>
						</Tooltip>
						<Text fontSize={"md"} color="gray.400">
						/ 
						</Text>
						<Tooltip label='Account would be liquidated if LTV reaches this threshold' >

						<Text fontSize={"md"} color="gray.400" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Liq Threshold
						</Text>
						</Tooltip>
							</Flex>

						<Text fontSize={"md"}>
							{parseFloat(collateral.baseLTV) / 100} % /{" "}
							{parseFloat(collateral.liqThreshold) / 100} %
						</Text>
					</Flex>
				</Box>

				
                <Box>
						<Text mt={8} fontSize={"sm"} color='gray.400' fontWeight={'bold'}>
							Transaction Overview
						</Text>
						<Box
							// border="1px"
							// borderColor={"gray.700"}
							my={4}
							rounded={8}
							// p={2}
						>
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Health Factor
								</Text>
								<Text fontSize={"md"}>{(totalDebt/totalCollateral * 100).toFixed(1)} % {"->"} {(totalDebt /(totalCollateral - (amount*collateral.priceUSD)) * 100).toFixed(1)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(adjustedCollateral - totalDebt)} {"->"} {dollarFormatter.format(adjustedCollateral - amount*collateral.priceUSD*collateral.baseLTV/10000 - totalDebt)}</Text>
							</Flex>
						</Box>
					</Box>
            
				
                <Button
                    disabled={
                        loading ||
                        !isConnected ||
                        activeChain?.unsupported ||
                        !amount ||
                        amountNumber == 0 ||
                        amountNumber > parseFloat(max())
                    }
                    isLoading={loading}
                    loadingText="Please sign the transaction"
                    bgColor="secondary"
                    width="100%"
                    color="white"
                    mt={4}
                    onClick={withdraw}
                    size="lg"
                    rounded={16}
                    _hover={{
                        opacity: "0.5",
                    }}
                >
                    {isConnected && !activeChain?.unsupported ? (
                        amountNumber > parseFloat(max()) ? (
                            <>Insufficient Wallet Balance</>
                        ) : !amount || amountNumber == 0 ? (
                            <>Enter amount</>
                        ) : (
                            <>Withdraw</>
                        )
                    ) : (
                        <>Please connect your wallet</>
                    )}
                </Button>

				<Response
					response={response}
					message={message}
					hash={hash}
					confirmed={confirmed}
				/>
				<Box mx={-4}>

				<InfoFooter
					message="
						You can issue a new asset against your collateral. Debt is dynamic and depends on total debt of the pool.
					"
				/>
                </Box>
			</Box>
		</>
	);
}
