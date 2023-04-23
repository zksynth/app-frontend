import React, { useState } from "react";

import {
	Flex,
	Text,
	Box,
	useDisclosure,
	Button,
	Divider,
	Tooltip,
	Switch,
} from "@chakra-ui/react";
import { dollarFormatter, numOrZero } from '../../../src/const';
import Big from "big.js";
import Response from "../_utils/Response";
import { useAccount, useBalance, useNetwork, useSignTypedData } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { compactTokenFormatter } from "../../../src/const";
import { ExternalLinkIcon, InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useToast } from '@chakra-ui/react';
import Link from "next/link";

export default function Deposit({ collateral, amount, setAmount, amountNumber, isNative }: any) {

	const [approveLoading, setApproveLoading] = useState(false);
	const [loading, setLoading] = useState(false);

	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const { chain } = useNetwork();
	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveMax, setApproveMax] = useState(false);

	const {
		pools,
		tradingPool,
		updateCollateralWalletBalance,
		updateCollateralAmount,
		addCollateralAllowance,
		incrementNonce
	} = useContext(AppDataContext);

	const max = () => {
		return Big(
			(isNative ?  collateral.nativeBalance : collateral.walletBalance) ?? 0
		).div(10**collateral.token.decimals).toString();
	};

	// stage: 0: before approval, 1: approval pending, 2: after approval, 3: approval not needed
	const validate = () => {
		if(!isConnected){
			return {
				stage: 0,
				message: "Connect Wallet"
			}
		} else if (ethBalance?.value.lt(
			ethers.utils.parseEther("0.00001")
		)) {
			return {
				stage: 0,
				message: "Insufficient ETH for Gas Fee"
			}
		} else if (chain?.unsupported){
			return {
				stage: 0,
				message: "Unsupported Network"
			}
		}
		else if(amountNumber == 0){
			return {
				stage: 0,
				message: "Enter Amount"
			}
		} else if (amountNumber > Number(max())) {
			return {
				stage: 0,
				message: "Amount Exceeds Balance"
			}
		} else if (!collateral || !collateral?.allowance) {
			return {
				stage: 0,
				message: "Loading..."
			}
		}

		// check allowance if not native
		if (!isNative) {
			if (Big(collateral.allowance).add(Number(approvedAmount) * 10 ** (collateral.token.decimals ?? 18)).eq(0)){
				return {
					stage: 1,
					message: "Approve Use Of" + " " + collateral.token.symbol
				}
			} else if(Big(collateral.allowance).add(Number(approvedAmount) * 10 ** (collateral.token.decimals ?? 18)).lt(
				parseFloat(amount) * 10 ** (collateral.token.decimals ?? 18) || 1
			)) {
				return {
					stage: 1,
					message: "Approve Use Of" + " " + collateral.token.symbol
				}
			}


		} else {
			return {
				stage: 3,
				message: "Deposit"
			}
		}

		if(Big(collateral.allowance).gt(
			parseFloat(amount) * 10 ** (collateral.token.decimals ?? 18) || 1
		)) {
			return {
				stage: 3,
				message: ""
			}
		}

		return {
			stage: 2,
			message: `Approved ${collateral.token.symbol} For Use`
		}
	}

	const toast = useToast();

	const deposit = async () => {
		setLoading(true);
		setMessage("")
		setConfirmed(false);
		setResponse(null);
		setHash(null);
		const poolId = pools[tradingPool].id;
		const pool = await getContract("Pool", chain?.id!, poolId);
		const _amount = ethers.utils.parseUnits(Big(amount).toFixed(collateral.token.decimals, 0), collateral.token.decimals); 

		let tx;
		if (isNative) {
			tx = send(
				pool,
				"depositETH",
				[
					address
				],
				_amount.toString()
			);
		} else {
			console.log("data", data);
			if(Number(approvedAmount) > 0){
				const {v, r, s} = ethers.utils.splitSignature(data!);
				tx = send(
					pool,
					"depositWithPermit",
					[
						collateral.token.id,
						_amount,
						address,
						approveMax ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(approvedAmount.toString(), collateral.token.decimals),
						deadline,
						v,
						r,
						s
					]
				);
			} else {
				tx = send(
					pool,
					"deposit",
					[
						collateral.token.id,
						_amount,
						address
					]
				);
			}
		}
		tx.then(async (res: any) => {
			// setMessage("Confirming...");
			// setResponse("Transaction sent! Waiting for confirmation");
			// setHash(res.hash);
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
			if(approveMax){
				addCollateralAllowance(collateralId, poolId, ethers.constants.MaxUint256.toString());
			}
			if(Number(approvedAmount) > 0){
				incrementNonce(collateral.token.id);
			}
			setConfirmed(true);
			updateCollateralWalletBalance(collateralId, poolId, depositedAmount, true);
			updateCollateralAmount(collateralId, poolId, depositedAmount, false);
			setAmount('0');
			// setMessage(
			// 	"Transaction Successful!"
			// );
			// setResponse(`You have deposited ${Big(depositedAmount).div(10**collateral.token.decimals).toString()} ${collateral.token.symbol}`);
			setApproveMax(false);
			setApprovedAmount('0');
			
			setLoading(false);
			toast({
				title: "Deposit Successful",
				description: <Box>
					<Text>
				{`You have deposited ${Big(depositedAmount).div(10**collateral.token.decimals).toString()} ${collateral.token.symbol}`}
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
			
		}).catch((err: any) => {
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
			// setMessage(JSON.stringify(err));
			// setConfirmed(true);
			// setResponse("Transaction failed. Please try again!");
		});
	};

	const approve = async () => {
		setApproveLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * 20).toFixed(0);
		// const _amount = Big(amount).round(collateral.token.decimals, 0).toString()
		const _amount = Big(amount).toFixed(collateral.token.decimals, 0);
		const value = approveMax ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(_amount, collateral.token.decimals);
		signTypedDataAsync({
			domain: {
				name: await collateral.token.name,
				version: "1",
				chainId: chain?.id!,
				verifyingContract: collateral.token.id,
			},
			types: {
				Permit: [
					{ name: "owner", type: "address" },
					{ name: "spender", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "nonce", type: "uint256" },
					{ name: "deadline", type: "uint256" },
				]
			},
			value: {
				owner: address!,
				spender: pools[tradingPool].id,
				value,
				nonce: collateral.nonce,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				// await res.wait(1);
				console.log(res);
				setData(res);
				setDeadline(_deadline);
				setApprovedAmount(approveMax ? (Number.MAX_SAFE_INTEGER).toString() : _amount);
				setApproveLoading(false);
			})
			.catch((err: any) => {
				console.log("err", JSON.stringify(err));
				if(err?.cause?.reason == "user rejected signing"){
					toast({
						title: "Signature Rejected",
						description: "You have rejected the signature",
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top-right"
					})
				}
				setApproveLoading(false);
			});
	};

	const { address, isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	const { data: ethBalance } = useBalance({
		address,
	});

	return (
		<>
			<Box bg={"blackAlpha.200"} roundedBottom={16} px={5} pt={5} pb={5}>
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

					{validate().stage == 1 && <Tooltip label='
						Approve Max will approve unlimited amount. This will save gas fees in the future.
					'>
					<Flex align={'center'} mb={2} mt={6} color='gray.400' gap={2}>
						<Text fontSize={"sm"} color='gray.400' fontWeight={'bold'} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Approve Max
						</Text>
						<Switch size={'sm'} colorScheme='primary' onChange={() => setApproveMax(!approveMax)} isChecked={approveMax} />
					</Flex>
					</Tooltip>
					}

				
					{(validate().stage == 1|| validate().stage == 0) ? <Button
						isDisabled={validate().stage != 1}
						isLoading={approveLoading}
						loadingText="Please sign the transaction"
						colorScheme={'primary'}
						bg={"primary.400"}
						color='gray.800'
						mt={2}
						width="100%"
						onClick={approve}
						size="lg"
						rounded={16}
						leftIcon={
							validate().stage ==1 ? <Tooltip label='
								Approve tokens to be used by the protocol.
							'>
							<InfoOutlineIcon/>
							</Tooltip> : <></>
						}
					>
						{validate().message}
					</Button> : <Button
						isDisabled={validate().stage == 1}
						isLoading={loading}
						loadingText="Please sign the transaction"
						bgColor={validate().stage == 1 ? "primary.400" : "primary.400"}
						width="100%"
						color="gray.700"
						colorScheme={'primary'}
						mt={2}
						onClick={deposit}
						size="lg"
						rounded={16}
					>
						{isConnected && !activeChain?.unsupported ? (
							Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ? (
								<>Insufficient Wallet Balance</>
							) : !amount || amountNumber == 0 ? (
								<>Enter Amount</>
							) : (
								<>Deposit</>
							)
						) : (
							<>Please connect your wallet</>
						)}
					</Button>}
				

				<Response
					response={response}
					message={message}
					hash={hash}
					confirmed={confirmed}
				/>
			</Box>
		</>
	);
}
