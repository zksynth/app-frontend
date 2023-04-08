import React, { useState } from "react";

import {
	Flex,
	Text,
	Box,
	useDisclosure,
	Button,
	Divider,
	Tooltip,
} from "@chakra-ui/react";
import { dollarFormatter, numOrZero } from '../../../src/const';
import Big from "big.js";
import InfoFooter from "../_utils/InfoFooter";
import Response from "../_utils/Response";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { WETH_ADDRESS, compactTokenFormatter } from "../../../src/const";

export default function Deposit({ collateral, amount, setAmount, amountNumber, isNative }: any) {

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
		addCollateralAllowance,
	} = useContext(AppDataContext);

	const max = () => {
		return Big(
			(isNative ?  collateral.nativeBalance : collateral.walletBalance) ?? 0
		).div(10**collateral.token.decimals).toString();
	};

	const deposit = async () => {
		setLoading(true);
		setMessage("")
		setConfirmed(false);
		setResponse(null);
		setHash(null);
		const poolId = pools[tradingPool].id;
		const pool = await getContract("Pool", chain, poolId);

		let tx;
		if (isNative) {
			tx = send(
				pool,
				"depositETH",
				[],
				chain,
				ethers.utils
					.parseUnits(amount, collateral.token.decimals)
					.toString()
			);
		} else {
			tx = send(
				pool,
				"deposit",
				[
					collateral.token.id,
					ethers.utils.parseUnits(amount, collateral.token.decimals),
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
			const collateralId = decodedLogs[decodedLogs.length - 1].args[1].toLowerCase();
			const depositedAmount = decodedLogs[decodedLogs.length - 1].args[2].toString();
			setConfirmed(true);
			updateCollateralWalletBalance(collateralId, poolId, depositedAmount, true);
			updateCollateralAmount(collateralId, poolId, depositedAmount, false);
			setAmount('0');
			setMessage(
				"Transaction Successful!"
			);
			setResponse(`You have deposited ${Big(depositedAmount).div(10**collateral.token.decimals).toString()} ${collateral.token.symbol}`);
		}).catch((err: any) => {
			console.log(err);
			setMessage(JSON.stringify(err));
			setLoading(false);
			setConfirmed(true);
			setResponse("Transaction failed. Please try again!");
		});
	};

	const approve = async () => {
		setLoading(true);
		let collateralContract = await getContract(
			"MockToken",
			chain,
			collateral.token.id
		);
		send(
			collateralContract,
			"approve",
			[pools[tradingPool].id, ethers.constants.MaxUint256],
			chain
		)
			.then(async (res: any) => {
				await res.wait(1);
				addCollateralAllowance(
					collateral.token.id,
					ethers.constants.MaxInt256.toString()
				);
				setLoading(false);
			})
			.catch((err: any) => {
				console.log("err", err);
				setLoading(false);
			});
	};

	const tryApprove = () => {
		if (!collateral) return true;
		if(isNative) return false;
		if (!collateral.allowance) return true;
		if (Big(collateral.allowance).eq(0)) return true;
		return Big(collateral.allowance).lt(
			parseFloat(amount) * 10 ** (collateral.token.decimals ?? 18) || 1
		);
	};

	const { address, isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	const { data: ethBalance } = useBalance({
		address,
	});

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
							{collateral.totalDeposit}
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

				{!tryApprove() && (
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
								<Text fontSize={"md"}>{numOrZero(pools[tradingPool].userDebt/pools[tradingPool].userCollateral * 100).toFixed(1)} % {"->"} {numOrZero(pools[tradingPool].userDebt /(pools[tradingPool].userCollateral + (amount*collateral.priceUSD)) * 100).toFixed(1)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(pools[tradingPool].adjustedCollateral - pools[tradingPool].userDebt)} {"->"} {dollarFormatter.format(pools[tradingPool].adjustedCollateral + amount*collateral.priceUSD*collateral.baseLTV/10000 - pools[tradingPool].userDebt)}</Text>
							</Flex>
						</Box>
					</Box>
				)}

				{tryApprove() ? (
					<Button
						disabled={
							loading ||
							ethBalance?.value.lt(
								ethers.utils.parseEther("0.01")
							) ||
							!isConnected ||
							activeChain?.unsupported
						}
						isLoading={loading}
						loadingText="Please sign the transaction"
						bg={"primary.400"}
						color='gray.800'
						_hover={{
							opacity: 0.8,
						}}
						mt={10}
						width="100%"
						onClick={approve}
						isDisabled={loading}
						size="lg"
						rounded={16}
					>
						{isConnected && !activeChain?.unsupported ? (
							ethBalance?.value.lt(
								ethers.utils.parseEther("0.01")
							) ? (
								<>Insufficient ETH for gas ⛽️</>
							) : (
								<>Approve {collateral?.token.symbol}</>
							)
						) : (
							<>Please connect your wallet</>
						)}
					</Button>
				) : (
					<Button
						disabled={
							loading ||
							!isConnected ||
							activeChain?.unsupported ||
							!amount ||
							amountNumber == 0 ||
							Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ||
							amountNumber > parseFloat(max())
						}
						isLoading={loading}
						loadingText="Please sign the transaction"
						bgColor="primary.400"
						width="100%"
						color="gray.700"
						mt={4}
						onClick={deposit}
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
								<>Deposit</>
							)
						) : (
							<>Please connect your wallet</>
						)}
					</Button>
				)}

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
