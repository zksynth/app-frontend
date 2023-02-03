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
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { tokenFormatter, dollarFormatter, compactTokenFormatter } from "../../../src/const";
import { FaCoins, FaPlusCircle } from "react-icons/fa";
import Response from "../_utils/Response";
import { ArrowRightIcon } from "@chakra-ui/icons";

const CLAIM_AMOUNTS: any = {
	USDC: "1000",
	stETH: "100",
	WETH: "1",
};

const DepositModal = ({
	handleDeposit,
	asset,
	prevStep,
	setSelectedAsset,
}: any) => {
	const {
		chain,
		updateCollateralWalletBalance,
		addCollateralAllowance,
		toggleCollateralEnabled,
		adjustedCollateral,
		adjustedDebt
	} = useContext(AppDataContext);

	const [amount, setAmount] = React.useState("0");
	const [amountNumber, setAmountNumber] = useState(0);

	const [claimLoading, setClaimLoading] = useState(false);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const { isConnected, address } = useAccount();
	const { chain: activeChain } = useNetwork();
	const { data: ethBalance } = useBalance({
		address,
	});

	const balance = () => {
		if (!asset) return 0;
		if (!asset.walletBalance) return 0;
		return Big(asset.walletBalance).div(10 ** asset.inputToken.decimals).toString();
	};

	const handleMax = () => {
		setAmount(balance());
		setAmountNumber(
			isNaN(Number(balance())) ? 0 : Number(balance())
		);
	};

	const maxQuota = () => {
		if(asset.inputTokenPriceUSD == 0) return 100;
		return Big(asset._capacity).div(10**(asset.inputToken.decimals ?? 18)).sub(Big(asset.totalValueLockedUSD).div(asset.inputTokenPriceUSD)).toNumber()
	}

	const handleMaxQuota = () => {
		setAmount(maxQuota());
		setAmountNumber(
			isNaN(Number(maxQuota())) ? 0 : Number(maxQuota())
		);
	};

	const deposit = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");
		let synthex = await getContract("SyntheX", chain);
		let value = Big(amount)
			.mul(Big(10).pow(Number(asset.inputToken.decimals)))
			.toFixed(0);

		send(
			synthex,
			"deposit",
			[asset.id, value],
			chain,
			asset.id == ethers.constants.AddressZero ? value : 0
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleDeposit(
					asset["id"],
					Big(amount)
						.mul(Big(10).pow(Number(asset.inputToken.decimals)))
						.toFixed(0)
				);
				if (!asset.isEnabled) {
					toggleCollateralEnabled(asset.id);
				}
				setMessage(
					`You have successfully deposited ${amount} ${asset.inputToken.symbol}`
				);
				setResponse("Transaction Successful!");
			})
			.catch((err: any) => {
				setMessage(JSON.stringify(err));
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	const claim = async () => {
		setClaimLoading(true);
		let token = await getContract("MockToken", chain, asset.id);
		const _amount = ethers.utils
			.parseEther(CLAIM_AMOUNTS[asset.inputToken.symbol])
			.toString();
		send(token, "mint", [address, _amount], chain)
			.then(async (res: any) => {
				await res.wait(1)
				updateCollateralWalletBalance(asset.id, _amount, false);
				setAmount(CLAIM_AMOUNTS[asset.inputToken.symbol]);
				setAmountNumber(Number(CLAIM_AMOUNTS[asset.inputToken.symbol]));
				setClaimLoading(false);
			})
			.catch((err: any) => {
				console.log(err);
				setClaimLoading(false);
			});
	};

	const amountLowerThanMin = () => {
		// if (Number(amount) > asset?.minCollateral / 10 ** asset.decimal) {
		// 	return false;
		// }
		// return true;
		return false;
	};

	const approve = async () => {
		setLoading(true);
		let collateral = await getContract("MockToken", chain, asset["id"]);
		send(
			collateral,
			"approve",
			[getAddress("SyntheX", chain), ethers.constants.MaxUint256],
			chain
		)
			.then(async (res: any) => {
				await res.wait(1);
				addCollateralAllowance(
					asset.id,
					ethers.constants.MaxUint256.toString()
				);
				setLoading(false);
			})
			.catch((err: any) => {
				console.log("err", err);
				setLoading(false);
			});
	};

	const tryApprove = () => {
		if (!asset) return true;
		if (!asset.allowance) return true;
		return Big(asset?.allowance).lt(
			parseFloat(amount) * 10 ** (asset?.inputToken.decimals ?? 18) || 1
		);
	};

	const _setAmount = (e: string) => {
		setAmount(e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	}

	return (
		<Box>
			{asset && (
				<>
					{tryApprove() ? (
						<>
							<Flex
								flexDir={"column"}
								align="center"
								justify="center"
								textAlign={"center"}
								my={6}
								gap={2}
							>
								<Image
									src={`/icons/${asset?.inputToken.symbol}.svg`}
									alt=""
									width={"20"}
									height={"20"}
									my={1}
								/>
								<Text fontSize={"sm"} color="gray.400">
									To Deposit {asset?.name} token, you need to
									approve it for SyntheX to use.
								</Text>
							</Flex>
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
								bg={"secondary"}
								_hover={{
									opacity: 0.8,
								}}
								width="100%"
								onClick={approve}
								isDisabled={loading}
								size='lg'
								rounded={16}
							>
								{isConnected && !activeChain?.unsupported ? (
									ethBalance?.value.lt(
										ethers.utils.parseEther("0.01")
									) ? (
										<>Insufficient ETH for gas ⛽️</>
									) : (
										<>Approve {asset?.symbol}</>
									)
								) : (
									<>Please connect your wallet</>
								)}
							</Button>
						</>
					) : (
						<>
							<Box mt={4} mb={10} textAlign="center">
								<Flex
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
										parseFloat(amount) * asset.inputTokenPriceUSD
									)}
								</Text>
							</Box>
							<Flex mt={10} justify="space-between" align={'center'}>
								<Box>

								<Text fontSize={"xs"} color="gray.400">
									Asset LTV: {asset?.maximumLTV} %
								</Text>

								<Text fontSize={"xs"} color="gray.400">
									Health: {(adjustedDebt !== 0 && adjustedCollateral !== 0) ? (100 * adjustedCollateral / adjustedDebt).toFixed(0) : '-'} % <ArrowRightIcon w={'2'}/> {tokenFormatter.format((100 * (adjustedCollateral + (amountNumber*asset.inputTokenPriceUSD)) / adjustedDebt))} %
								</Text>
								</Box>
								<Box>

								<Flex align={'center'} gap={1} justify='end'>
									<Text fontSize={"xs"} color="gray.400">
										Balance:
									</Text>

									<Text
										fontSize={"xs"}
										color="gray.400"
										onClick={handleMax}
										cursor="pointer"
										textDecor={"underline"}
									>
										{tokenFormatter.format(balance())}{" "}
										{asset?.inputToken.symbol}
									</Text>

									{Object.keys(CLAIM_AMOUNTS).includes(asset.inputToken.symbol) && (
										<Button
											isLoading={claimLoading}
											size={"xs"}
											onClick={claim}
											color="white"
											variant={"solid"}
											rounded={'full'}
										>
											<FaCoins />{" "}
											<Text ml={2}>
												Claim
											</Text>
										</Button>
									)}
								</Flex>

								<Flex align={'center'} gap={1} justify='end'>
									<Text fontSize={"xs"}
										color="gray.400">
									Remaining Quota: 
									</Text>
									{asset.inputTokenPriceUSD > 0 ? <Text
										fontSize={"xs"}
										color="gray.400"
										onClick={handleMaxQuota}
										cursor="pointer"
										textDecor={"underline"}
									>
										{compactTokenFormatter.format(maxQuota())} {asset.inputToken.symbol}
									</Text>
									: '-'}
								</Flex>

								</Box>

							</Flex>
							<Button
								size={"lg"}
								isLoading={loading}
								loadingText="Please sign the transaction"
								disabled={
									amountLowerThanMin() ||
									loading ||
									!isConnected ||
									!amount ||
									amountNumber == 0 ||
									amountNumber > balance() ||
									amountNumber > maxQuota()
								}
								bgColor="#3EE6C4"
								color={"gray.800"}
								width="100%"
								mt={4}
								isDisabled={loading}
								onClick={deposit}
                                rounded={16}
							>
								{isConnected ? (

									!amount || amountNumber == 0 ? (
										"Enter amount"
									) : amountNumber > maxQuota() ? (
										"Exceeding max quota"
									) : amountNumber > balance() ? (
										"Insufficient Balance"
									) : (
										<>Deposit</>
									)
								) : (
									<>Please connect your wallet</>
								)}
							</Button>
						</>
					)}
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

export default DepositModal;
