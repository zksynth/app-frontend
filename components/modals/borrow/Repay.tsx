import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	Divider,
	Link,
	Select,
	useColorMode
} from "@chakra-ui/react";
import { getABI, getContract, send } from "../../../src/contract";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { EIP712_VERSION, defaultChain, dollarFormatter } from "../../../src/const";
import Big from "big.js";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useToast } from '@chakra-ui/react';
import { BigNumber, ethers } from "ethers";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import { useLendingData } from "../../context/LendingDataProvider";
import { VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";

const Repay = ({ market, amount, setAmount, isNative, debtType, setDebtType, max, isMax, onClose }: any) => {
	const [loading, setLoading] = useState(false);
	const { address } = useAccount();
	const { chain } = useNetwork();
	const toast = useToast();

	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveLoading, setApproveLoading] = useState(false);

	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	
	const router = useRouter();
	const pos = lendingPosition(Number(router.query.market) || 0);

	const {nonces, allowances, updateFromTx, setBalance} = useBalanceData();

	const { protocol, updatePositions } = useLendingData();

	const handleError = useHandleError(PlatformType.LENDING);

	// stage: 0: before approval, 1: approval pending, 2: after approval, 3: approval not needed
	const validate = () => {
		if(!isConnected){
			return {
				stage: 0,
				message: "Connect Wallet"
			}
		} else if (chain?.unsupported){
			return {
				stage: 0,
				message: "Unsupported Network"
			}
		} else if(Number(amount) == 0 || isNaN(Number(amount))){
			return {
				stage: 0,
				message: "Enter Amount"
			}
		} else if (Big(amount).gt(max)) {
			return {
				stage: 0,
				message: "Amount Exceeds Balance"
			}
		}
		else if (!market || !allowances[market.inputToken.id]?.[market.protocol._lendingPoolAddress]) {
			return {
				stage: 0,
				message: "Loading..."
			}
		}

		let _amount = Big(amount).mul(10 ** (market.inputToken.decimals ?? 18)).toFixed(0);
		
		// Check allowance if not native
		if (!isNative) {
			if(Big(allowances[market.inputToken.id]?.[market.protocol._lendingPoolAddress]).add(Big(approvedAmount).mul(10 ** (market.inputToken.decimals ?? 18))).lt(
				_amount
			)) {
				return {
					stage: 1,
					message: "Approve Use Of" + " " + market.inputToken.symbol
				}
			} else if(!isMax && Big(approvedAmount).gt(0) && !Big(approvedAmount).eq(amount)){
				return {
					stage: 1,
					message: "Approve Use Of" + " " + market.inputToken.symbol
				}
			}
		} else {
			return {
				stage: 3,
				message: "Repay"
			}
		}

		return {
			stage: 3,
			message: ""
		}
	}

	const repay = async () => {
		if (!amount) return;
		setLoading(true);
		
		let pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);
		let value = isMax ? isNative ? Big(amount).mul(1001).div(1000)
		.times(10 ** market.inputToken.decimals)
		.toFixed(0) : ethers.constants.MaxUint256.toString() : Big(amount)
		.times(10 ** market.inputToken.decimals)
		.toFixed(0);

		let tx;
		if (isNative) {
			const wrapper = new ethers.Contract(protocol._wrapper, getABI("WrappedTokenGateway", chain?.id!))
			let args = [market.inputToken.id, value, debtType, address];
			tx = send(wrapper, "repayETH", args, value);
		} else {
			let args = [market.inputToken.id, value, debtType, address];
			if(Big(approvedAmount).gt(0)){
				const {v, r, s} = ethers.utils.splitSignature(data!);
				args = args.concat([deadline, v, r, s]);
				tx = send(pool, "repayWithPermit", args);
			} else {
				tx = send(pool, "repay", args);
			}
		}
		
		tx.then(async (res: any) => {
			let response = await res.wait()
			updateFromTx(response)
			setAmount('0');
			setLoading(false);
			updatePositions();
			console.log(onClose);
			onClose();
			toast({
				title: "Repayment Successful!",
				description: <Box>
					<Text>
				{`You have repaid ${amount} ${market.inputToken.symbol}`}
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
			handleError(err);
			setLoading(false);
		});
	};

	const approveTx = async () => {
		setApproveLoading(true);
		const collateralContract = await getContract("MockToken", chain?.id ?? defaultChain.id, market.inputToken.id);
		send(
			collateralContract,
			"approve",
			[
				market.protocol._lendingPoolAddress,
				ethers.constants.MaxUint256
			]
		)
		.then(async (res: any) => {
			const response = await res.wait();
			updateFromTx(response);
			setApproveLoading(false);
			toast({
				title: "Approval Successful",
				description: <Box>
					<Text>
				{`You have approved ${market.inputToken.symbol}`}
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
			})
		}).catch((err: any) => {
			handleError(err);
			setApproveLoading(false);
		})
	}

	const approve = async () => {
		setApproveLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * 20).toFixed(0);
		const value = isMax ? ethers.constants.MaxUint256.toString() : Big(amount).times(10 ** market.inputToken.decimals).toFixed(0);
		signTypedDataAsync({
			domain: {
				name: market.inputToken.name,
				version: EIP712_VERSION(market.inputToken.id),
				chainId: chain?.id ?? defaultChain.id,
				verifyingContract: market.inputToken.id,
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
				spender: market.protocol._lendingPoolAddress,
				value: BigNumber.from(value),
				nonce: nonces[market.inputToken.id] ?? 0,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApprovedAmount(isMax ? ethers.constants.MaxUint256.toString() : Big(value).div(10 ** market.inputToken.decimals).toFixed(market.inputToken.decimals));
				setApproveLoading(false);
				toast({
					title: "Approval Signed",
					description: <Box>
						<Text>
							{`for ${market.inputToken.symbol}`}
						</Text>
					</Box>,
					status: "info",
					duration: 10000,
					isClosable: true,
					position: "top-right"
				})
			})
			.catch((err: any) => {
				handleError(err);
				setApproveLoading(false);
			});
	};

	const { isConnected } = useAccount();
	const { colorMode } = useColorMode();

	return (
		<Box px={5} pb={5} pt={0.5}>
			<Box mt={6}>
				<Flex align={'center'} justify={'space-between'} gap={'50'}>
					<Text color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>Interest Rate</Text>
					<Select borderColor={colorMode == 'dark' ? 'whiteAlpha.200':'blackAlpha.200'} maxW={'50%'} rounded={0} value={debtType} onChange={(e) => setDebtType(e.target.value) }>
					<option value='2'>Variable {(Number(market.rates.filter((rate: any) => rate.side == 'BORROWER' && rate.type == 'VARIABLE')[0]?.rate ?? 0)).toFixed(2)} %</option>
					<option value='1'>Stable {(Number(market.rates.filter((rate: any) => rate.side == 'BORROWER' && rate.type == 'STABLE')[0]?.rate ?? 0)).toFixed(2)} %</option>
					</Select>
				</Flex>
			</Box>
				<Box>
					<Box>
					<Text mt={6} fontSize={"sm"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} fontWeight={'bold'}>
						Transaction Overview
					</Text>
					<Box
						my={4}
						rounded={8}
					>
						<Flex justify="space-between">
							<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
								Health Factor
							</Text>
							<Text fontSize={"md"}>{Number(pos.debtLimit).toFixed(1)} % {"->"} {((Number(pos.debt) - (amount*prices[market.inputToken.id])) / Number(pos.collateral) * 100).toFixed(1)}%</Text>
						</Flex>
						<Divider my={2} />
						<Flex justify="space-between">
							<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
								Available to issue
							</Text>
							<Text fontSize={"md"}>{dollarFormatter.format(Number(pos.availableToIssue))} {"->"} {dollarFormatter.format(Number(pos.adjustedCollateral) + Number(amount*prices[market.inputToken.id] ?? 0) - Number(pos.debt))}</Text>
						</Flex>
					</Box>
				</Box>

				<Box mt={6}>
					{validate().stage <= 2 && <Box mt={2} className={(validate().stage != 1 || approveLoading) ? `${VARIANT}-${colorMode}-disabledPrimaryButton`:`${VARIANT}-${colorMode}-primaryButton`}><Button
						isDisabled={validate().stage != 1}
						isLoading={approveLoading}
						loadingText="Please sign the transaction"
						color='white'
						width="100%"
						onClick={market.inputToken.isPermit ? approve : approveTx}
						size="lg"
						rounded={0}
						bg={'transparent'}
						_hover={{ bg: "transparent" }}
					>
						{validate().message}
					</Button>
				</Box>}
					
				{validate().stage > 0 && <Box mt={2} className={(validate().stage < 2 || loading) ? `${VARIANT}-${colorMode}-disabledPrimaryButton` : `${VARIANT}-${colorMode}-primaryButton`} > <Button
					isDisabled={validate().stage < 2}
					isLoading={loading}
					loadingText="Please sign the transaction"
					width="100%"
					color="white"
					rounded={0}
					bg={'transparent'}
					onClick={repay}
					size="lg"
					_hover={{ bg: "transparent" }}
				>
					{isConnected && !chain?.unsupported ? (
						Big(amount).gt(max) ? (
							<>Insufficient Wallet Balance</>
						) : (
							<>Repay</>
						)
					) : (
						<>Please connect your wallet</>
					)}
				</Button></Box>}
			</Box>
		</Box>
		</Box>
	);
};

export default Repay;
