import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Link,
	Image,
	Select,
	Alert,
	AlertIcon,
	InputGroup,
	NumberInput,
	NumberInputField,
} from "@chakra-ui/react";

const Big = require("big.js");

import { getAddress, getContract, send, call } from "../../../src/contract";
import { useEffect, useContext } from "react";
import { BiPlusCircle } from "react-icons/bi";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { tokenFormatter, dollarFormatter } from "../../../src/const";
import InputWithSlider from "../../inputs/InputWithSlider";
import { FaCoins, FaPlusCircle } from "react-icons/fa";
import InputWithMax from "../../inputs/InputWithMax";
import { ArrowDownIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { IoIosArrowBack } from "react-icons/io";


const WithdrawStep2 = ({
	handleWithdraw,
	asset,
	setSelectedAsset,
}: any) => {
	const {
		chain,
		safeCRatio,
		adjustedCollateral,
		adjustedDebt
	} = useContext(AppDataContext);

	const [amount, setAmount] = React.useState(0);
	const [claimLoading, setClaimLoading] = useState(false);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	// const { isConnected, tronWeb, address } = useContext(WalletContext);
	const { isConnected, address } = useAccount();
	const { chain: activeChain } = useNetwork();
	const { data: ethBalance } = useBalance({
		address,
	});


	const max = () => {
		if(!Number(safeCRatio)) return 0;
		if(!Number(asset.inputTokenPriceUSD)) return 0;
		console.log(asset);
		return Math.min(Big(asset.maximumLTV/100).times(Big(adjustedCollateral).div(safeCRatio).minus(adjustedDebt)).div(asset.inputTokenPriceUSD).toNumber(), asset.balance);
	};

	const handleMax = () => {
		setAmount(max());
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
				setMessage(`You have successfully withdrawn ${_amount} ${_asset} from your position!`)
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setMessage(JSON.stringify(err))
				setResponse("Transaction failed. Please try again!");
			});
	};

	return (
		<Box>
			{asset && (
				<>
					<>
						<Box mt={6} textAlign="center">
							<Flex
								// flexDir={"column"}
								justify={"center"}
								align="center"
								gap={2}
							>
								<Image
									src={`/icons/${asset.inputToken.symbol.toUpperCase()}.png`}
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
									value={amount || 0}
									onChange={(_value: any) => {
										setAmount(_value);
									}}
									max={max()}
									min={0}
									step={0.01}
									display="flex"
									alignItems="center"
									justifyContent={"center"}
								>
									<NumberInputField
										textAlign={"center"}
										pr={0}
										fontSize={"5xl"}
									/>
								</NumberInput>
							</InputGroup>

							<Text color={"gray.400"}>
								{dollarFormatter.format(
									amount * asset.inputTokenPriceUSD
								)}
							</Text>
						</Box>
						<Flex mt={10} justify="space-between">
							<Text fontSize={"xs"} color="gray.400">
								Maximum LTV: {asset?.maximumLTV} %
							</Text>

							<Flex align={'center'} gap={1}>
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
							size={'lg'}
							disabled={
								loading ||
								!isConnected || 
								activeChain?.unsupported ||
								!amount ||
								amount == 0 ||
								amount > max()
							}
							loadingText="Please sign the transaction"
							isLoading={loading}
							bgColor='secondary'
							width="100%"
							mt={4}
							onClick={withdraw}
							color='white'
							rounded={16}
						>
							{isConnected && !activeChain?.unsupported ? (
								amount > max() ? (
									<>Insufficient Collateral</>
								) : !amount || amount == 0 ? (
									<>Enter amount</>
								) : (
									<>Withdraw</>
								)
							) : (
								<>Please connect your wallet</>
							)}
						</Button>
					</>

					<Button
						width={"100%"}
						variant="ghost"
						mt={1.5}
						onClick={() => setSelectedAsset(null)}
						display={"flex"}
						gap={1}
						alignContent="center"
						rounded={16}
					>
						<IoIosArrowBack /> Go Back
					</Button>
				</>
			)}
		</Box>
	);
};

export default WithdrawStep2;
