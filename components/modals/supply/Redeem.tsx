import React, { useState } from "react";

import {
	Flex,
	Text,
	Box,
	Button,
	Divider,
    Tooltip,
	useToast,
	useColorMode,
} from "@chakra-ui/react";
import Big from "big.js";
import Response from "../_utils/Response";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { getABI, getAddress, getContract, send } from "../../../src/contract";
import { EIP712_VERSION, defaultChain, dollarFormatter, tokenFormatter } from "../../../src/const";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import useUpdateData from "../../utils/useUpdateData";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { BigNumber, ethers } from "ethers";
import { useBalanceData } from "../../context/BalanceProvider";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import { useLendingData } from "../../context/LendingDataProvider";
import { VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";

export default function Redeem({ market, amount, setAmount, isNative, max, isMax, onClose }: any) {
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	const {prices} = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const router = useRouter();
	const selectedMarket = Number(router.query.market) || 0;
	const pos = lendingPosition(selectedMarket);

	const {getUpdateData} = useUpdateData();
	const handleError = useHandleError(PlatformType.LENDING);

	const { address, isConnected } = useAccount();
	const { chain } = useNetwork();
	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveLoading, setApproveLoading] = useState(false);
	const { nonces, allowances, updateFromTx } = useBalanceData();
	const { pools, protocol, updatePositions } = useLendingData();

	const withdraw = async () => {
		setLoading(true);
		const priceFeedUpdateData = await getUpdateData(pools[selectedMarket].map((m: any) => m.inputToken.id));
		const _amount = isMax ? ethers.constants.MaxUint256.toString() : Big(amount).mul(10**market.inputToken.decimals).toFixed(0);

		let tx: any;
		if(isNative){
			if(Big(approvedAmount).gt(0)){
				const wrapper = new ethers.Contract(protocol._wrapper, getABI("WrappedTokenGateway", chain?.id!))
				const {v, r, s} = ethers.utils.splitSignature(data!);
				let args = [market.inputToken.id, _amount, address, deadline, v, r, s, priceFeedUpdateData];
				console.log(args);
				tx = send(wrapper, "withdrawETHWithPermit", args);
			} else {
				const wrapper = new ethers.Contract(protocol._wrapper, getABI("WrappedTokenGateway", chain?.id!))
				let args = [market.inputToken.id, _amount, address, priceFeedUpdateData];
				tx = send(wrapper, "withdrawETH", args);
			}
		} else {
			const pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);
			let args = [
				market.inputToken.id,
				_amount,
				address,
				priceFeedUpdateData
			];
			tx = send(pool, "withdraw", args)
		}
		tx.then(async (res: any) => {
			let response = await res.wait();
			updateFromTx(response);
			setAmount('0');
			setApprovedAmount('0')
			setLoading(false);
			updatePositions();
			onClose();
			toast({
				title: "Withdrawal Successful",
				description: <Box>
					<Text>
						{`You have withdrawn ${tokenFormatter.format(amount)} ${market.inputToken.symbol}`}
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
				position: 'top-right'
			})
		}).catch((err: any) => {
			handleError(err);
			setLoading(false);
		});
	};

	const approve = async () => {
		setApproveLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * 20).toFixed(0);
		const _amount = Big(amount).toFixed(market.inputToken.decimals, 0);
		const value = isMax ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(_amount, market.inputToken.decimals);
		const wrapperAddress = protocol._wrapper;

		signTypedDataAsync({
			domain: {
				name: market.outputToken.name,
				version: EIP712_VERSION(market.outputToken.id),
				chainId: chain?.id ?? defaultChain.id,
				verifyingContract: market.outputToken.id,
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
				spender: wrapperAddress,
				value,
				nonce: nonces[market.outputToken.id] ?? 0,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApprovedAmount(isMax ? ethers.constants.MaxUint256.toString() : _amount);
				setApproveLoading(false);
				toast({
					title: "Approval Signed",
					description: <Box>
						<Text>
							{`for ${_amount} ${market.outputToken.symbol}`}
						</Text>
						<Text>
							Please deposit to continue
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

	const shouldApprove = () => {
		if(!isNative) return false;
		const wrapperAddress = protocol._wrapper;
		const _allowance = allowances[market.outputToken.id]?.[wrapperAddress] ?? 0;
		if(Big(_allowance).add(Big(approvedAmount).mul(10 ** (market.inputToken.decimals ?? 18))).lte(
			Big(amount).mul(10 ** (market.inputToken.decimals))
		)) {
			return true;
		} else if(!isMax && Number(approvedAmount) > 0 && !Big(approvedAmount).eq(amount)){ 
			return true
		}
		return false;
	}

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
		} else if(loading) {return {stage: 0, message: "Loading..."}}
		else if(Number(amount) == 0 || isNaN(Number(amount))){
			return {
				stage: 0,
				message: "Enter Amount"
			}
		} else if (Big(amount).gt(Big(max).toFixed(market.inputToken.decimals))) {
			return {
				stage: 0,
				message: "Amount Exceeds Balance"
			}
		} else if (shouldApprove()) {
			return {
				stage: 1,
				message: "Approve Use Of aW"+market.outputToken.symbol
			}
		} else {
			return {
				stage: 3,
				message: "Withdraw"
			}
		}
	}

	const { colorMode } = useColorMode();

	return (
		<>
			<Box px={5} py={5}>
				<Box mt={2}>
					<Flex justify="space-between">
							<Flex gap={1}>
						<Tooltip label='Minimum Loan to Value Ratio'>

						<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Base LTV
						</Text>
						</Tooltip>
						<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
						/ 
						</Text>
						<Tooltip label='Account would be liquidated if LTV reaches this threshold' >

						<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Liq Threshold
						</Text>
						</Tooltip>
							</Flex>

						<Text fontSize={"md"}>
							{parseFloat(market.maximumLTV)} % /{" "}
							{parseFloat(market.liquidationThreshold)} %
						</Text>
					</Flex>
				</Box>
				
                <Box mt={6} mb={6}>
					<Text fontSize={"sm"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} fontWeight={'bold'}>
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
							<Text fontSize={"md"}>
								{Number(pos.debtLimit).toFixed(2)} % {"->"} {Number(pos.collateral) - amount*prices[market.inputToken.id] > 0 ? (Number(pos.debt)/(Number(pos.collateral) - (amount*prices[market.inputToken.id])) * 100).toFixed(1) : '0'} %
							</Text>
						</Flex>
						<Divider my={2} />
						<Flex justify="space-between">
							<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
								Available to issue
							</Text>
							<Text fontSize={"md"}>
								{dollarFormatter.format(Number(pos.availableToIssue))} {"->"} {dollarFormatter.format(Number(pos.adjustedCollateral) - amount*prices[market.inputToken.id]*market.maximumLTV/100 - Number(pos.debt))}
							</Text>
						</Flex>
					</Box>
				</Box>

				<Box mt={6}>
					{validate().stage <= 2 && <Box mt={2} className={(validate().stage != 1 || approveLoading) ? `${VARIANT}-${colorMode}-disabledPrimaryButton` : `${VARIANT}-${colorMode}-primaryButton`}><Button
						isDisabled={validate().stage != 1}
						isLoading={approveLoading}
						loadingText="Please sign the transaction"
						color='white'
						width="100%"
						onClick={approve}
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
						onClick={withdraw}
						size="lg"
						_hover={{ bg: "transparent" }}
					>
						{isConnected && !chain?.unsupported ? (
							Big(amount).gt(max) ? (
								<>Insufficient Wallet Balance</>
							) : (
								<>Withdraw</>
							)
						) : (
							<>Please connect your wallet</>
						)}
					</Button></Box>}
				</Box>
			</Box>
		</>
	);
}
