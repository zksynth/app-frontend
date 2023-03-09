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
	Image
} from "@chakra-ui/react";
import { Tooltip as ReToolTip} from 'recharts';
import React, { useState } from "react";
import { AiOutlineCaretRight, AiOutlineEnter, AiOutlineSwap } from "react-icons/ai";
import { useContext } from "react";
import { TokenContext } from "../context/TokenContext";
import { tokenFormatter } from "../../src/const";
import { getContract, send, getAddress } from "../../src/contract";
import { AppDataContext } from "../context/AppDataProvider";
import { ethers } from "ethers";
import Big from "big.js";
import { Divider } from "@chakra-ui/react";
import moment from "moment";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function Unlock() {
	const [amount, setAmount] = useState("0");
	const [amountNumber, setAmountNumber] = useState(0);

	const { tokenUnlocks, syn, increaseUnlockAllowance, addedToUnlock } =
		useContext(TokenContext);
	const { chain } = useContext(AppDataContext);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState(null);
	const [error, setError] = useState<string | null>(null);
	const [isUnlocking, setIsUnlocking] = useState(true);

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
		const sealedSyn = await getContract("EscrowedSYN", chain);
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
	const data = [
		{ name: (new Date()).toDateString(), value: 0 },
		{ name: (new Date(Date.now() + 1000*parseInt(tokenUnlocks.lockupPeriod ?? 0))).toDateString(), value: 0 },
		{ name: (new Date(Date.now() + 1 + 1000*parseInt(tokenUnlocks.lockupPeriod ?? 0))).toDateString(), value: 100 },
		{ name: (new Date(Date.now() + 1000*parseInt(tokenUnlocks.lockupPeriod ?? 0) + 1000*parseInt(tokenUnlocks.unlockPeriod ?? 0))).toDateString(), value: 1000 }
	]

	return (
		<>
			<Flex
				flexDir={"column"}
				justify="center"
				align={"center"}
				textAlign={"center"}
			>
				{/* <Flex align={'center'} gap={1}>
				<Heading size={"md"}>esSYX</Heading>
				<AiOutlineSwap/>
				<Heading size={"md"}>SYN</Heading>
				</Flex> */}

				<Flex w={'400px'} align="center" justify={"center"} bg='blackAlpha.100' py={6} mt={5} px={4} roundedTop={18}>
					<Box w={'160px'}>
					{/* <Text textAlign={'left'}>From</Text> */}
					<Flex cursor={'pointer'} onClick={() => {setIsUnlocking(!isUnlocking)}} align={'center'} gap={2} bg='gray.600' rounded={'full'} px={3} py={3}>
					<Image src={`/${isUnlocking? 'esSYX' : 'SYX'}.svg`} width={8} alt=''/>
					<Text>
						{isUnlocking? 'esSYX' : 'SYX'}
					</Text>
					<AiOutlineSwap/>
					</Flex>
					</Box>
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
							fontSize={"2xl"}
							placeholder="Enter Amount"
							textAlign={"center"}
							pr={0}
							ml={-4}
						/>
					</NumberInput>

					<Button
						fontWeight={'bold'}
						variant='unstyled'
						size={"sm"}
						onClick={_setMax}
					>
						MAX
					</Button>
				</Flex>

				<Box roundedBottom={18} pt={4} py={4} px={4} w={'400px'} bg='blackAlpha.200'>
					<Text mb={1} fontSize='sm' textAlign={'left'} color='gray.400'>You will receive</Text>

					<Flex align={'center'} >
					<Box >
					{/* <Text textAlign={'left'}>From</Text> */}
					<Flex align={'center'} gap={2} bg='gray.600' rounded={'full'} px={2} py={2} pr={4}>
					<Image src={`/${!isUnlocking? 'esSYX' : 'SYX'}.svg`} width={8} alt=''/>
					<Text>
						{!isUnlocking? 'esSYX' : 'SYX'}
					</Text>
					</Flex>
					</Box>

					<NumberInput
						variant={"unstyled"}
						py={2}
						value={
							Number(amount) > 0
								? tokenFormatter.format(parseFloat(amount))
								: amount
						}
						onChange={_setAmount}
						isDisabled={true}
					>
						<NumberInputField
							fontSize={"2xl"}
							placeholder="Enter Amount"
							textAlign={"center"}
							pr={0}
							pl={0.5}
						/>
					</NumberInput>

					</Flex>
				</Box>

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
						esSYX
					</Text>
				</Tooltip>

				<Divider w={"60%"} mb={2} />

				{/* <Text decoration={"underline"}>Note</Text>
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
				</Text> */}

{(isUnlocking && Number(amount) > 0) && <AreaChart width={730} height={250} data={data}
  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
  <defs>
    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <XAxis dataKey="name" color="#000" />
  <YAxis />
  <CartesianGrid strokeDasharray="3 3" />
  <ReToolTip />
  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
</AreaChart>}

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
