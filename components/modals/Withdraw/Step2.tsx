import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	Image,
	InputGroup,
	NumberInput,
	NumberInputField,
} from "@chakra-ui/react";

const Big = require("big.js");

import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { tokenFormatter, dollarFormatter } from "../../../src/const";
import Response from "../_utils/Response";

const WithdrawStep2 = ({ handleWithdraw, asset, setSelectedAsset }: any) => {
	const { chain, safeCRatio, adjustedCollateral, adjustedDebt } = useContext(AppDataContext);

	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const { isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	const max = () => {
		if (!Number(safeCRatio)) return 0;
		if (!Number(asset.inputTokenPriceUSD)) return 0;
		console.log(asset);
		return Math.min(
			Big(asset.maximumLTV / 100)
				.times(
					Big(adjustedCollateral).div(safeCRatio).minus(adjustedDebt)
				)
				.div(asset.inputTokenPriceUSD)
				.toNumber(),
			asset.balance
		);
	};

	const handleMax = () => {
		setAmount(max().toString());
		setAmountNumber(max());
	};

	const withdraw = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let synthex = await getContract("SyntheX", chain);
		const _amount = amount;
		const _asset = asset.inputToken.symbol;
		let value = Big(amount)
			.mul(Big(10).pow(Number(asset.inputToken.decimals)))
			.toFixed(0);
		send(synthex, "withdraw", [asset.id, value], chain)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");

				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleWithdraw(asset.id, value);
				setMessage(
					`You have successfully withdrawn ${_amount} ${_asset} from your position!`
				);
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				console.log(err)
				setLoading(false);
				setConfirmed(true);
				setMessage(JSON.stringify(err));
				setResponse("Transaction failed. Please try again!");
			});
	};

	const _setAmount = (e: string) => {
		setAmount(e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	};

	return (
		<Box>
			{asset && (
				<>
					<>
						<Box mt={6} mb={10} textAlign="center">
							<Flex
								// flexDir={"column"}
								justify={"center"}
								align="center"
								gap={2}
							>
								<Image
									src={`/icons/${asset.inputToken.symbol}.svg`}
									alt=""
									width={"30"}
									height={"30"}
								/>

								<Text
									fontSize={"xl"}
									fontWeight="bold"
									textAlign="center"
								>
									{asset.inputToken.symbol}
								</Text>
							</Flex>

							<InputGroup variant={"unstyled"} display="flex">
								<NumberInput
									w={"100%"}
									value={amount}
									onChange={_setAmount}
									max={max()}
									min={0}
									step={0.01}
									display="flex"
									alignItems="center"
									justifyContent={"center"}
								>
									<NumberInputField
										placeholder="0"
										textAlign={"center"}
										pr={0}
										fontSize={"6xl"}
									/>
								</NumberInput>
							</InputGroup>

							<Text color={"gray.400"}>
								{dollarFormatter.format(
									amountNumber * asset.inputTokenPriceUSD
								)}
							</Text>
						</Box>
						<Flex mt={10} justify="space-between">
							<Text fontSize={"xs"} color="gray.400">
								Maximum LTV: {asset?.maximumLTV} %
							</Text>

							<Flex align={"center"} gap={1}>
								<Text fontSize={"xs"} color="gray.400">
									Available:
								</Text>

								<Text
									fontSize={"xs"}
									color="gray.400"
									onClick={handleMax}
									cursor="pointer"
									textDecor={"underline"}
								>
									{tokenFormatter.format(max())}{" "}
									{asset?.inputToken.symbol}
								</Text>
							</Flex>
						</Flex>
						<Button
							size={"lg"}
							disabled={
								loading ||
								!isConnected ||
								activeChain?.unsupported ||
								!amount ||
								amountNumber == 0 ||
								amountNumber > max()
							}
							loadingText="Please sign the transaction"
							isLoading={loading}
							bgColor="secondary"
							width="100%"
							mt={4}
							onClick={withdraw}
							color="white"
							rounded={16}
						>
							{isConnected && !activeChain?.unsupported ? (
								amountNumber > max() ? (
									<>Insufficient Collateral</>
								) : !amount || amountNumber == 0 ? (
									<>Enter amount</>
								) : (
									<>Withdraw</>
								)
							) : (
								<>Please connect your wallet</>
							)}
						</Button>
					</>
					<Response
						response={response}
						message={message}
						hash={hash}
						confirmed={confirmed}
					/>
				</>
			)}
		</Box>
	);
};

export default WithdrawStep2;
