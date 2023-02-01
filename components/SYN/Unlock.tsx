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
	Tooltip,
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
import { Divider } from "@chakra-ui/react";
import moment from "moment";

export default function Unlock() {
	const [amount, setAmount] = useState("0");
	const [amountNumber, setAmountNumber] = useState(0);

	const { tokenUnlocks, syn, increaseUnlockAllowance, addedToUnlock } =
		useContext(TokenContext);
	const { chain } = useContext(AppDataContext);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState(null);
	const [error, setError] = useState<string | null>(null);

	const unlock = async () => {
		setLoading(true);
		const tokenUnlockerContract = await getContract("TokenUnlocker", chain);
		send(
			tokenUnlockerContract,
			"startUnlock",
			[ethers.utils.parseEther(amount)],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				await res.wait(1);
				addedToUnlock(amount);
			})
			.catch((err: any) => {
				console.log(err);
				setLoading(false);
				setError(JSON.stringify(err));
			});
	};

	const approve = async () => {
		const sealedSyn = await getContract("LockedSYN", chain);
		const staking = await getAddress("TokenUnlocker", chain);

		send(
			sealedSyn,
			"approve",
			[staking, ethers.constants.MaxUint256],
			chain
		)
			.then((res: any) => {
				increaseUnlockAllowance(ethers.constants.MaxUint256.toString());
			})
			.catch((err: any) => {
				console.log(err);
				setError(JSON.stringify(err));
			});
	};

	const _setAmount = (e: string) => {
		setAmount(e);
		setAmountNumber(isNaN(Number(e)) ? 0 : Number(e));
	};

	const _setMax = () => {
		setAmount(syn.sealedBalance ?? 0);
		setAmountNumber(
			isNaN(Number(syn.sealedBalance)) ? 0 : Number(syn.sealedBalance)
		);
	};

	return (
		<>
			<Flex
				flexDir={"column"}
				justify="center"
				align={"center"}
				textAlign={"center"}
			>
				<Heading size={"md"}>Redeem 1:1 xSYN for SYN</Heading>

				<Text mt={2} mb={5} fontSize="sm" w={"50%"}>
					Unlocking process is irreversible and takes 6 months to
					completely redeem
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
				{Big(tokenUnlocks.allowance ?? 0).lt(
					ethers.utils.parseEther(amountNumber.toString()).toString()
				) ? (
					<Button
						size="md"
						mt={4}
						rounded={16}
						colorScheme="primarySchema"
						variant="outline"
						onClick={approve}
						disabled={
							loading ||
							Big(amountNumber).lte(0) ||
							Big(amountNumber).gt(Number(syn.sealedBalance ?? 0))
						}
						isLoading={loading}
						loadingText="Approving"
					>
						{Big(amountNumber).lte(0)
							? "Enter an amount"
							: Big(amountNumber).gt(Number(syn.sealedBalance ?? 0))
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
						onClick={unlock}
						disabled={
							Big(tokenUnlocks.remainingQuota ?? 0).lt(amountNumber) ||
							loading ||
							Big(amountNumber).lte(0) ||
							Big(amountNumber).gt(Number(syn.sealedBalance ?? 0))
						}
					>
						{Big(tokenUnlocks.remainingQuota ?? 0).lt(amountNumber)
							? "Out of tokens. Please try again later"
							: Big(amountNumber).lte(0)
							? "Enter an amount"
							: Big(amountNumber).gt(Number(syn.sealedBalance ?? 0))
							? "Insufficient balance"
							: loading
							? "Loading..."
							: "Start Unlock"}
					</Button>
				)}
				<Tooltip label="Amount remaining to be unlocked" size={"sm"}>
					<Text fontSize={"sm"} my={4}>
						Remaining Quota:{" "}
						{tokenFormatter.format(
							parseFloat(tokenUnlocks.remainingQuota ?? 0)
						)}{" "}
						xSYN
					</Text>
				</Tooltip>

				<Divider w={"60%"} mb={2} />

				<Text decoration={"underline"}>Note</Text>
				<Text fontSize={"sm"}>
					Unlocking will start in{" "}
					{parseInt(tokenUnlocks.lockupPeriod ?? 0)/(30*24*3600)} months
				</Text>
				<Text fontSize={"sm"}>
					Release {" "} {tokenFormatter.format(
							parseInt(tokenUnlocks.percUnlockAtRelease ?? 0) / 1e2
						)}
						% on unlock
				</Text>
				<Text fontSize={"sm"}>
					Linear unlocking from {new Date(
						Date.now() +
							parseInt(tokenUnlocks.lockupPeriod ?? 0) * 1000
					).toLocaleDateString()} till{" "}
					{new Date(
						Date.now() +
							parseInt(tokenUnlocks.lockupPeriod ?? 0) * 1000 +
							parseInt(tokenUnlocks.unlockPeriod ?? 0) * 1000
					).toLocaleDateString()}
				</Text>

				{/* Pending unlocks */}
				<Divider w={"60%"} my={5} />

				<Heading size={"sm"}>Pending Unlocks</Heading>

				{tokenUnlocks.pendingUnlocks && tokenUnlocks.pendingUnlocks.length > 0 ? (
					tokenUnlocks.pendingUnlocks.map(
						(unlock: any, i: number) => {
							return (
								<Flex
									key={i}
									w={"60%"}
									justify={"space-between"}
									align={"center"}
									my={2}
								>
									<Text>
										{tokenFormatter.format(
											parseFloat(unlock.amount)
										)}
									</Text>
									<Text>
										{moment
											.unix(unlock.requestTime)
											.format("MMM Do YYYY")}
									</Text>
								</Flex>
							);
						}
					)
				) : (
					<Text color={"gray.400"} mt={5} fontSize="xs">
						No pending unlocks
					</Text>
				)}
			</Flex>
		</>
	);
}
