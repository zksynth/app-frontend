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

export default function Withdraw({ collateral, amount, setAmount, amountNumber }: any) {
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const {
		chain,
		pools,
		tradingPool,
		updateCollateralWalletBalance,
		updateCollateralAmount,
	} = useContext(AppDataContext);

	// adjustedDebt - pools[tradingPool]?.userDebt = assetAmount*assetPrice*ltv
	const max = () => {
		const v1 = collateral.priceUSD > 0 ? Big(pools[tradingPool]?.adjustedCollateral).sub(pools[tradingPool]?.userDebt).div(collateral.priceUSD).mul(1e4).div(collateral.baseLTV) : Big(0);
        const v2 = Big(collateral.balance ?? 0).div(10**18);
		// min(v1, v2)
		return (v1.gt(v2) ? v2 : v1).toString();
	};

	const withdraw = async () => {
		setLoading(true);
		setMessage("")
		setConfirmed(false);
		setResponse(null);
		setHash(null);
		const poolId = pools[tradingPool].id;
		const pool = await getContract("Pool", chain, poolId);
		const _amount = Big(amount).mul(10**collateral.token.decimals).toFixed(0);
		let tx;
		if (collateral.token.id == ETH_ADDRESS.toLowerCase()) {
			tx = send(
				pool,
				"withdrawETH",
				[_amount],
				chain
			);
		} else {
			tx = send(
				pool,
				"withdraw",
				[
					collateral.token.id,
					_amount,
				],
				chain
			);
		}
		tx.then(async (res: any) => {
			setLoading(false);
			setMessage("Confirming...");
			setResponse("Transaction sent! Waiting for confirmation");
			setHash(res.hash);
			const response = await res.wait(1);
			// decode transfer event from response.logs
			const decodedLogs = response.logs.map((log: any) =>
				{
					try {
						return pool.interface.parseLog(log)
					} catch (e) {
						console.log(e)
					}
				});

			const collateralId = decodedLogs[0].args[1].toLowerCase();
			const depositedAmount = decodedLogs[0].args[2].toString();
			setConfirmed(true);
			updateCollateralWalletBalance(collateralId, poolId, depositedAmount, false);
			updateCollateralAmount(collateralId, poolId, depositedAmount, true);
			setAmount('0');
			setMessage(
				"Transaction Successful!"
			);
			setResponse(`You have withdrawn ${amount} ${collateral.token.symbol}.`);
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
								<Text fontSize={"md"}>{(pools[tradingPool]?.userDebt/pools[tradingPool]?.userCollateral * 100).toFixed(1)} % {"->"} {pools[tradingPool]?.userCollateral - amount*collateral.priceUSD > 0 ? (pools[tradingPool]?.userDebt /(pools[tradingPool]?.userCollateral - (amount*collateral.priceUSD)) * 100).toFixed(1) : '0'}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(pools[tradingPool]?.adjustedCollateral - pools[tradingPool]?.userDebt)} {"->"} {dollarFormatter.format(pools[tradingPool]?.adjustedCollateral - amount*collateral.priceUSD*collateral.baseLTV/10000 - pools[tradingPool]?.userDebt)}</Text>
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
                        Big(amountNumber > 0 ? amount : amountNumber).gt(max()) 
                    }
                    isLoading={loading}
                    loadingText="Please sign the transaction"
                    bgColor="secondary.400"
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
                        Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ? (
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
				<Box mx={-4} mb={-3}>
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