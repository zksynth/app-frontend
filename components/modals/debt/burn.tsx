import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Divider
} from "@chakra-ui/react";

import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import InfoFooter from "../_utils/InfoFooter";

const Burn = ({ asset, amount, amountNumber }: any) => {

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const max = () => {
		// minimum of both
		return Big(totalDebt).div(asset.priceUSD).gt(Big(asset.walletBalance ?? 0).div(10 ** 18)) ? Big(asset.walletBalance ?? 0).div(10 ** 18).toString() : Big(totalDebt).div(asset.priceUSD).toString();
	}

	const {
		chain,
		totalDebt,
		updateSynthWalletBalance,
		totalCollateral,
		adjustedCollateral,
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

		let synth = await getContract("ERC20X", chain, asset.token.id);
		let value = Big(amount)
			.times(10 ** 18)
			.toFixed(0);
		send(
			synth,
			"burn",
			[value],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				// decode logs
				const response = await res.wait(1);
				const decodedLogs = response.logs.map((log: any) =>
				{
					try {
						return synth.interface.parseLog(log)
					} catch (e) {
						console.log(e)
					}
				});

				updatePoolBalance(pools[tradingPool].id, decodedLogs[0].args.value.toString(), true);
				updateSynthWalletBalance(asset.token.id, pools[tradingPool].id, decodedLogs[3].args.value.toString(), true);

				setConfirmed(true);
				setResponse("Transaction Successful!");
				setMessage(
					`You have burned ${tokenFormatter.format(
						amountNumber
					)} ${asset.token.symbol}`
				);
			})
			.catch((err: any) => {
				console.log(err);
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
				setMessage(JSON.stringify(err));
			});
	};

	const { isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	return (
		<Box roundedBottom={16} px={5} pb={0.5} pt={0.5} bg='blackAlpha.200'>
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
								<Text fontSize={"md"}>{(totalDebt/totalCollateral * 100).toFixed(1)} % {"->"} {((totalDebt - (amount*asset.priceUSD)) /(totalCollateral) * 100).toFixed(1)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="gray.400">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format(adjustedCollateral - totalDebt)} {"->"} {dollarFormatter.format(adjustedCollateral + amount*asset.priceUSD - totalDebt)}</Text>
							</Flex>
						</Box>
					</Box>

						<Flex mt={2} justify="space-between">
						</Flex>
						<Button
							disabled={
								loading ||
								!isConnected ||
								activeChain?.unsupported ||
								!amount ||
								amountNumber == 0 ||
								Big(amount).gt(max())
							}
							isLoading={loading}
							loadingText="Please sign the transaction"
							bgColor="secondary"
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
							{isConnected && !activeChain?.unsupported ? (
								Big(amount).gt(max()) ? (
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
						<Box mx={-4}>

					<InfoFooter
						message="
						You can issue a new asset against your collateral. Debt is dynamic and depends on total debt of the pool.
						"
						/>
						</Box>
		</Box>
	);
};

export default Burn;
