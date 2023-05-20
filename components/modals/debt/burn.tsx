import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Divider,
	Link,
	Tooltip
} from "@chakra-ui/react";

import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { PYTH_ENDPOINT, dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import InfoFooter from "../_utils/InfoFooter";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useToast } from '@chakra-ui/react';
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { ethers } from "ethers";



const Burn = ({ asset, amount, setAmount, amountNumber }: any) => {

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const { address } = useAccount();
	const { chain } = useNetwork();
	const toast = useToast();

	const max = () => {
		if(!address) return '0';
		// minimum of both
		const v1 = Big(pools[tradingPool].userDebt).div(asset.priceUSD);
		const v2 = Big(asset.walletBalance ?? 0).div(10 ** 18);
		return (v1.gt(v2) ? v2 : v1).toString();
	}

	const {
		updateSynthWalletBalance,
		pools,
		tradingPool,
		updatePoolBalance
	} = useContext(AppDataContext);

	const burn = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");

		const pythFeeds = pools[tradingPool].collaterals.concat(pools[tradingPool].synths).filter((c: any) => c.feed != ethers.constants.HashZero).map((c: any) => c.feed);
		const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
		const priceFeedUpdateData = await pythPriceService.getPriceFeedsUpdateData(pythFeeds);

		// let synth = await getContract("ERC20X", chain?.id!, asset.token.id);
		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		let value = Big(amount)
			.times(10 ** 18)
			.toFixed(0);
		send(
			pool,
			"burn",
			[asset.token.id, value, priceFeedUpdateData]
		)
			.then(async (res: any) => {
				// setMessage("Confirming...");
				// setResponse("Transaction sent! Waiting for confirmation");
				// setHash(res.hash);
				// decode logs
				const response = await res.wait(1);
				const decodedLogs = response.logs.map((log: any) =>
				{
					try {
						return pool.interface.parseLog(log)
					} catch (e) {
						console.log(e)
					}
				});
				if(chain?.id! == 280){
					decodedLogs.pop();
				}
				console.log("decodedLogs", decodedLogs);
				console.log(decodedLogs[decodedLogs.length - 1].args.value.toString(), decodedLogs[decodedLogs.length - 2].args.value.toString(), decodedLogs[decodedLogs.length - 3].args.value.toString());
				const amountUSD = Big(decodedLogs[decodedLogs.length - 2].args.value.toString()).mul(asset.priceUSD).div(10 ** 18).mul(1 - asset.burnFee/10000).toFixed(4);
				updatePoolBalance(pools[tradingPool].id, decodedLogs[decodedLogs.length - 1].args.value.toString(), amountUSD, true);
				updateSynthWalletBalance(asset.token.id, pools[tradingPool].id, decodedLogs[decodedLogs.length - 2].args.value.toString(), true);
				setAmount('0');
				setConfirmed(true);

				// setMessage("Transaction Successful!");
				// setResponse(
				// 	`You have burned ${tokenFormatter.format(
				// 		amountNumber
				// 	)} ${asset.token.symbol}`
				// );

				setLoading(false);
				toast({
					title: "Burn Successful!",
					description: <Box>
						<Text>
					{`You have burned ${amount} ${asset.token.symbol}`}
						</Text>
					<Link href={chain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
						<Flex align={'center'} gap={2}>
						<ExternalLinkIcon />
						<Text>View Transaction</Text>
						</Flex>
					</Link>
					</Box>,
					status: "success",
					duration: 10000,
					isClosable: true,
					position: "top-right"
				});
			})
			.catch((err: any) => {
				console.log(err);
				if(err?.reason == "user rejected transaction"){
					toast({
						title: "Transaction Rejected",
						description: "You have rejected the transaction",
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top-right"
					})
				}
				setLoading(false);
				// setConfirmed(true);
				// setResponse("Transaction failed. Please try again!");
				// setMessage(JSON.stringify(err));
			});
	};

	const { isConnected } = useAccount();

	return (
		<Box px={5} pb={5} pt={0.5} bg='blackAlpha.200'>
		<Box
				// border="1px"
				// borderColor={"gray.700"}
				mt={6}
				// mb={2}
				rounded={8}
				// p={2}
			>
				<Tooltip label={`Fee for Minting and Burning ${asset.token.symbol}`}>
				<Flex justify="space-between">
						<Text fontSize={"md"} color="gray.400" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Mint / Burn Fee
						</Text>

						<Text fontSize={"md"}>
							{tokenFormatter.format(
								Number(
									asset.mintFee / 100
								) 
							)} {'%'} / {tokenFormatter.format(
								Number(
									asset.burnFee / 100
								) 
							)} {'%'}
						</Text>
					</Flex> 
					</Tooltip>
			</Box>
				<Box  >
						<Box>
						<Text mt={6} fontSize={"sm"} color='gray.400' fontWeight={'bold'}>
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
								<Text fontSize={"md"}>{(pools[tradingPool].userDebt/pools[tradingPool].userCollateral * 100).toFixed(1)} % {"->"} {((pools[tradingPool].userDebt - (amount*asset.priceUSD)) /(pools[tradingPool].userCollateral) * 100).toFixed(1)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(pools[tradingPool].adjustedCollateral - pools[tradingPool].userDebt)} {"->"} {dollarFormatter.format(pools[tradingPool].adjustedCollateral + amount*asset.priceUSD - pools[tradingPool].userDebt)}</Text>
							</Flex>
						</Box>
					</Box>

						<Flex mt={2} justify="space-between">
						</Flex>
						<Button
							isDisabled={
								loading ||
								!isConnected ||
								chain?.unsupported ||
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
							onClick={burn}
							size="lg"
							rounded={16}
							_hover={{
								opacity: "0.5",
							}}
						>
							{isConnected && !chain?.unsupported ? (
								Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ? (
									<>Insufficient Collateral</>
								) : !amount || amountNumber == 0 ? (
									<>Enter amount</>
								) : (
									<>Burn</>
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
						{/* <Box mx={-4}>

					<InfoFooter
						message="
						You can issue a new asset against your collateral. Debt is dynamic and depends on total debt of the pool.
						"
						/>
						</Box> */}
		</Box>
		</Box>
	);
};

export default Burn;
