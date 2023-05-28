import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	Divider,
	Switch,
	Collapse,
	Input,
	Tooltip,
	useToast,
	Link,
} from "@chakra-ui/react";
import { getContract, send } from "../../../src/contract";
import { useContext, useEffect } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { PYTH_ENDPOINT, dollarFormatter, numOrZero, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import InfoFooter from "../_utils/InfoFooter";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { base58 } from "ethers/lib/utils.js";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

const Issue = ({ asset, amount, setAmount, amountNumber }: any) => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const [useReferral, setUseReferral] = useState(false);
	const [referral, setReferral] = useState<string | null>(null);

	const { isConnected, address } = useAccount();
	const { chain } = useNetwork();
	
	const {
		updateSynthWalletBalance,
		pools,
		tradingPool,
		updatePoolBalance,
		account,
	} = useContext(AppDataContext);

	useEffect(() => {
		if (referral == null) {
			const { ref: refCode } = router.query;
			if (refCode) {
				setReferral(refCode as string);
				setUseReferral(true);
			} else {
				setUseReferral(false);
			}
		}
	});

	const max = () => {
		if(!address) return '0';
		return (
			Big(pools[tradingPool].adjustedCollateral)
				.sub(pools[tradingPool].userDebt)
				.div(asset.priceUSD)
				.gt(0)
				? Big(pools[tradingPool].adjustedCollateral)
						.sub(pools[tradingPool].userDebt)
						.div(asset.priceUSD)
				: 0
		).toString();
	};

	const toast = useToast();

	const mint = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");

		// let synth = await getContract("ERC20X", chain?.id!, asset.token.id);
		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		let value = Big(amount)
			.times(10 ** 18)
			.toFixed(0);
		// let _referral = useReferral ? BigNumber.from(base58.decode(referral!)).toHexString() : ethers.constants.AddressZero;
		// get .feed from pool.collaterals & pool.synths if feed is not bytes(0)
		// const pythFeeds = pools[tradingPool].collaterals.concat(pools[tradingPool].synths).filter((c: any) => c.feed != ethers.constants.HashZero).map((c: any) => c.feed);
		// const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
		// const priceFeedUpdateData = await pythPriceService.getPriceFeedsUpdateData(pythFeeds);

		send(pool, "mint", [
			asset.token.id, 
			value, 
			address, 
			// priceFeedUpdateData
		])
			.then(async (res: any) => {
				// setMessage("Confirming...");
				// setResponse("Transaction sent! Waiting for confirmation");
				// setHash(res.hash);
				// setConfirmed(true);
				
				// decode logs
				const response = await res.wait(1);
				const decodedLogs = response.logs.map((log: any) => {
					try {
						return pool.interface.parseLog(log);
					} catch (e) {
						console.log(e);
					}
				});
				if(chain?.id == 280){
					decodedLogs.pop();
				}
				console.log(decodedLogs[decodedLogs.length - 3].args.value.toString(), decodedLogs[decodedLogs.length - 2].args.value.toString(), decodedLogs[decodedLogs.length - 1].args.value.toString());

				let amountUSD = Big(decodedLogs[decodedLogs.length - 2].args.value.toString())
					.mul(asset.priceUSD)
					.div(10 ** 18)
					.mul(1 + asset.mintFee / 10000);
				// add fee
				amountUSD = amountUSD.mul(1 + asset.mintFee / 10000);

				updatePoolBalance(
					pools[tradingPool].id,
					decodedLogs[decodedLogs.length - 1].args.value.toString(),
					amountUSD.toString(),
					false
				);
				updateSynthWalletBalance(
					asset.token.id,
					pools[tradingPool].id,
					decodedLogs[decodedLogs.length - 2].args.value.toString(),
					false
				);
				setAmount("0");

				setLoading(false);
				toast({
					title: "Mint Successful",
					description: <Box>
						<Text>
							{`You have minted ${amount} ${asset.token.symbol}`}
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
					position: "top-right",
				})
				// setMessage("Transaction Successful!");
				// setResponse(
				// 	`You have minted ${tokenFormatter.format(amountNumber)} ${
				// 		asset.token.symbol
				// 	}`
				// );
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

	const isValid = () => {
		if (referral == "" || referral == null) return true;
		try {
			const decodedString = BigNumber.from(
				base58.decode(referral!)
			).toHexString();
			return ethers.utils.isAddress(decodedString);
		} catch (err) {
			return false;
		}
	};

	// const _setUseReferral = () => {
	// 	if (useReferral) {
	// 		setReferral("");
	// 		setUseReferral(false);
	// 	} else {
	// 		const { ref: refCode } = router.query;
	// 		if (refCode) {
	// 			setReferral(refCode as string);
	// 		} else {
	// 			setReferral("");
	// 		}
	// 		setUseReferral(true);
	// 	}
	// };

	return (
		<Box roundedBottom={16} px={5} pb={5} pt={0.5} bg="blackAlpha.200">
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
						<Text fontSize={"md"} color="blackAlpha.600" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
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

			<Box>
				<Text
					mt={6}
					fontSize={"sm"}
					color="blackAlpha.600"
					fontWeight={"bold"}
				>
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
						<Text fontSize={"md"} color="blackAlpha.600">
							Health Factor
						</Text>
						<Text fontSize={"md"}>
							{numOrZero(pools[tradingPool].userCollateral > 0
								? (100 * pools[tradingPool].userDebt) /
								  pools[tradingPool].userCollateral
								: 0
							).toFixed(1)}{" "}
							% {"->"}{" "}
							{numOrZero(
								(pools[tradingPool].userCollateral > 0
									? (pools[tradingPool].userDebt +
											amount * asset.priceUSD) /
									  pools[tradingPool].userCollateral
									: 0) * 100
							).toFixed(1)}
							%
						</Text>
					</Flex>
					<Divider my={2} />
					<Flex justify="space-between">
						<Text fontSize={"md"} color="blackAlpha.600">
							Available to issue
						</Text>
						<Text fontSize={"md"}>
							{dollarFormatter.format(
								numOrZero(pools[tradingPool].adjustedCollateral -
									pools[tradingPool].userDebt)
							)}{" "}
							{"->"}{" "}
							{dollarFormatter.format(
								numOrZero(pools[tradingPool].adjustedCollateral -
									amount * asset.priceUSD -
									pools[tradingPool].userDebt)
							)}
						</Text>
					</Flex>
				</Box>

				{/* {!account && (
					<>
						{" "}
						<Flex mt={6} gap={2} align={"center"}>
							<Text
								fontSize={"sm"}
								color="blackAlpha.600"
								fontWeight={"bold"}
							>
								Use Referral Code
							</Text>
							<Switch
								colorScheme={"primary"}
								isChecked={useReferral}
								onChange={_setUseReferral}
							/>
						</Flex>
						<Collapse in={useReferral} animateOpacity>
							<Box mt={3}>
								<Input
									placeholder="Referral Code"
									value={referral!}
									onChange={(e) =>
										setReferral(e.target.value)
									}
									isInvalid={!isValid()}
									errorBorderColor="red.400"
									colorScheme={"primary"}
								/>
							</Box>
						</Collapse>{" "}
					</>
				)} */}
			</Box>

			<Flex mt={2} justify="space-between"></Flex>
			<Button
				isDisabled={
					loading ||
					!isConnected ||
					chain?.unsupported ||
					!amount ||
					amountNumber == 0 ||
					Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ||
					!isValid()
				}
				isLoading={loading}
				loadingText="Please sign the transaction"
				bgColor="primary.400"
				width="100%"
				color="white"
				mt={4}
				onClick={mint}
				size="lg"
				rounded={16}
				_hover={{
					opacity: "0.5",
				}}
			>
				{isConnected && !chain?.unsupported ? (
					isValid() ? (
						Big(amountNumber > 0 ? amount : amountNumber).gt(
							max()
						) ? (
							<>Insufficient Collateral</>
						) : !amount || amountNumber == 0 ? (
							<>Enter amount</>
						) : (
							<>Mint</>
						)
					) : (
						<>Invalid Referral Code</>
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
	);
};

export default Issue;
