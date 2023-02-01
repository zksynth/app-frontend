import {
	Box,
	Text,
	Heading,
	Flex,
	Input,
	NumberInput,
	NumberInputField,
	Button,
	IconButton,
	Divider,
	Tooltip,
	Skeleton,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { AiOutlineCaretRight, AiOutlineEnter } from "react-icons/ai";
import { useContext } from "react";
import { TokenContext } from "../context/TokenContext";
import { tokenFormatter } from "../../src/const";
import { getContract, send, getAddress } from "../../src/contract";
import { AppDataContext } from "../context/AppDataProvider";
import { ethers } from "ethers";
import Big from "big.js";
import { useAccount } from 'wagmi';

export default function Stake() {
	const [amount, setAmount] = useState("0");
	const [amountNumber, setAmountNumber] = useState(0);

	const { staking, syn, increaseStakingAllowance, staked } =
		useContext(TokenContext);
	const { chain } = useContext(AppDataContext);

	const { isConnected } = useAccount()

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [claiming, setClaiming] = useState(false);
	const [unstaking, setUnstaking] = useState(false);

	const stake = async () => {
		setLoading(true);
		setResponse(null);
		setError(null);
		const stakingRewardsContract = await getContract(
			"StakingRewards",
			chain
		);
		send(
			stakingRewardsContract,
			"stake",
			[ethers.utils.parseEther(amount)],
			chain
		)
			.then(async (res: any) => {
				await res.wait(1);
				staked(amount);
				setLoading(false);
				setResponse(`Staked ${amount} xSYN successfully`);
			})
			.catch((err: any) => {
				setLoading(false);
				setError(JSON.stringify(err));
			});
	};

	const claim = async () => {
		setClaiming(true);
		setResponse(null);
		setError(null);

		const stakingRewardsContract = await getContract(
			"StakingRewards",
			chain
		);

		send(stakingRewardsContract, "getReward", [], chain)
			.then(async (res: any) => {
				await res.wait(1);
				setClaiming(false);
				setResponse(`Claimed rewards successfully`);
			})
			.catch((err: any) => {
				setClaiming(false);
				setError(JSON.stringify(err));
			});
	};

	const exit = async () => {
		setUnstaking(true);
		setResponse(null);
		setError(null);

		const stakingRewardsContract = await getContract(
			"StakingRewards",
			chain
		);

		send(stakingRewardsContract, "exit", [], chain)
			.then(async (res: any) => {
				await res.wait(1);
				setUnstaking(false);
				setResponse(`Unstaked successfully`);
			})
			.catch((err: any) => {
				setUnstaking(false);
				setError(JSON.stringify(err));
			});
	};

	const _setAmount = (e: string) => {
		setAmount(e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	};

	const _setMax = () => {
		setAmount(syn.sealedBalance);
		setAmountNumber(
			isNaN(Number(syn.sealedBalance)) ? 0 : Number(syn.sealedBalance)
		);
	};

	const approve = async () => {
		setLoading(true);
		setResponse(null);
		setError(null);

		const sealedSyn = await getContract("LockedSYN", chain);
		const staking = await getAddress("StakingRewards", chain);

		send(
			sealedSyn,
			"approve",
			[staking, ethers.constants.MaxUint256],
			chain
		)
			.then(async (res: any) => {
				await res.wait(1);
				setLoading(false);
				setResponse(`Approved ${amount} xSYN. You can now stake`);
				increaseStakingAllowance(
					ethers.constants.MaxUint256.toString()
				);
			})
			.catch((err: any) => {
				setLoading(false);
				setError(JSON.stringify(err));
			});
	};

	return (
		<>
			<Flex
				flexDir={"column"}
				justify="center"
				align={"center"}
				textAlign={"center"}
			>
				<Flex gap={2} align="center">
					<Heading size={"md"}>Stake and earn</Heading>

					{staking.rewardRate ? (
						<Heading size={"md"} color="primary">
							{tokenFormatter.format(
								(100*parseFloat(staking.rewardRate) *
									365 *
									24 *
									60 *
									60) /
									parseFloat(staking.totalSupply)
							)}
							%
						</Heading>
					) : isConnected ? (
						<Skeleton
							height="20px"
							width="100px"
							mx={"auto"}
							mb={1}
						/>
					) : <>-</>}

					<Heading size={"md"}>APR</Heading>
				</Flex>

				<Text mt={2} mb={5} fontSize="sm">
					Stake xSYN to earn more xSYN. You can unstake at any time.
				</Text>

				<Flex w={"50%"} align="center" justify={"center"}>
					<NumberInput
						variant={"unstyled"}
						py={2}
						value={
							Number(amount) > 0
								? tokenFormatter.format(parseFloat(amount))
								: amount
						}
						onChange={_setAmount}
					>
						<NumberInputField
							fontSize={"xl"}
							placeholder="Enter Amount"
							textAlign={"center"}
							pr={0}
							pl={8}
						/>
					</NumberInput>

					<Button
						variant={"unstyled"}
						textDecor="underline"
						size={"sm"}
						onClick={_setMax}
					>
						Max
					</Button>
				</Flex>
				{Big(staking.allowance ?? 0).lt(
					ethers.utils.parseEther(amountNumber.toString()).toString()
				) ? (
					<Button
						size="md"
						mt={4}
						rounded={16}
						colorScheme="primarySchema"
						variant="outline"
						onClick={approve}
						loadingText="Approving"
						isLoading={loading}
						disabled={
							loading ||
							Big(amountNumber).lte(0) ||
							Big(amountNumber).gt(Number(syn.sealedBalance))
						}
					>
						{Big(amountNumber).lte(0)
							? "Enter an amount"
							: Big(amountNumber).gt(Number(syn.sealedBalance))
							? "Insufficient balance"
							: loading
							? "Loading..."
							: "Approve"}
					</Button>
				) : (
					<Button
						size="md"
						mt={4}
						rounded={16}
						colorScheme="primarySchema"
						variant="outline"
						onClick={stake}
						disabled={
							loading ||
							Big(amountNumber).lte(0) ||
							Big(amountNumber).gt(Number(syn.sealedBalance))
						}
						isLoading={loading}
						loadingText="Staking"
					>
						{Big(amountNumber).lte(0)
							? "Enter an amount"
							: Big(amountNumber).gt(Number(syn.sealedBalance))
							? "Insufficient balance"
							: "Stake"}
					</Button>
				)}

				{/* Pending unlocks */}
				<Divider w={"60%"} my={5} />

				<Heading size={"sm"}>Position</Heading>

				<Flex
					w={"60%"}
					justify={"space-between"}
					align={"center"}
					my={2}
				>
					<Text>Staked Amount</Text>
					<Flex gap={2} align="center">
						{staking.staked ? (
							<Text>
								{tokenFormatter.format(
									parseFloat(staking.staked)
								)}
							</Text>
						) : (
							<Skeleton
								height="20px"
								width="100px"
								mx={"auto"}
								mt={2}
							/>
						)}
					</Flex>
				</Flex>

				<Flex
					w={"60%"}
					justify={"space-between"}
					align={"center"}
					my={2}
				>
					<Text>Earned Rewards</Text>

					<Flex gap={2} align="center">
						{staking.earned ? (
							<>
								<Text>
									{tokenFormatter.format(
										parseFloat(staking.earned)
									)}
								</Text>

								<Button
									variant={"outline"}
									rounded={16}
									size={"sm"}
									loadingText="Claiming"
									isLoading={claiming}
									onClick={claim}
									disabled={
										claiming ||
										Big(staking.earned ?? 0).lte(0)
									}
								>
									Claim
								</Button>
							</>
						) : (
							<Skeleton
								height="20px"
								width="100px"
								mx={"auto"}
								mt={2}
							/>
						)}
					</Flex>
				</Flex>

				<Tooltip label="Withdraw all and claim pending rewards">
					<Button
						variant={"outline"}
						rounded={16}
						loadingText="Unstaking"
						isLoading={unstaking}
						onClick={exit}
						disabled={unstaking || Big(staking.staked ?? 0).lte(0)}
					>
						Unstake
					</Button>
				</Tooltip>
			</Flex>
		</>
	);
}
