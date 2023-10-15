import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	Divider,
	useToast,
	Link,
	Select,
	useColorMode,
} from "@chakra-ui/react";
import { getABI, getAddress, getContract, send } from "../../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { WETH_ADDRESS, defaultChain, dollarFormatter, numOrZero, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import { ethers } from "ethers";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceProvider";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { usePriceData } from "../../context/PriceContext";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import { useLendingData } from "../../context/LendingDataProvider";
import { VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";

const Borrow = ({ market, amount, setAmount, isNative, debtType, setDebtType, max, onClose }: any) => {
	const [loading, setLoading] = useState(false);
	const { isConnected, address } = useAccount();
	const { chain } = useNetwork();
	const {getUpdateData} = useUpdateData();
	const {updateFromTx, walletBalances, allowances} = useBalanceData();
	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
    const router = useRouter();
	const selectedMarket = Number(router.query.market) || 0;
	const pos = lendingPosition(selectedMarket);


	const {pools, protocol, updatePositions} = useLendingData();
	const toast = useToast();
	const handleError = useHandleError(PlatformType.LENDING);
	const [approveLoading, setApproveLoading] = useState(false);

	const borrow = async () => {
		if (!amount) return;
		setLoading(true);

		let value = Big(amount)
			.times(10 ** market.inputToken.decimals)
			.toFixed(0);
		
		const priceFeedUpdateData = await getUpdateData(pools[selectedMarket].map((m: any) => m.inputToken.id));

		let tx;
		if(isNative){
			const wrapper = new ethers.Contract(protocol._wrapper, getABI("WrappedTokenGateway", chain?.id!))
			let args = [market.inputToken.id, value, debtType, 0, priceFeedUpdateData];
			tx = send(wrapper, "borrowETH", args);
		} else {
			let pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);			
			let args = [
				market.inputToken.id, 
				value, 
				debtType,
				0,
				address,
				priceFeedUpdateData
			];
			tx = send(pool, "borrow", args);
		}

		tx.then(async (res: any) => {
			let response = await res.wait();
			updateFromTx(response);
			setAmount("0");
			setLoading(false);
			updatePositions();
			onClose();
			toast({
				title: "Borrow Successful",
				description: <Box>
					<Text>
						{`You have borrowed ${tokenFormatter.format(amount)} ${market.inputToken.symbol}`}
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
		})
		.catch((err: any) => {
			handleError(err)
			setLoading(false);
		});
	};

	const shouldApprove = () => {
		if(!isNative) return false;
		const wrapperAddress = protocol._wrapper;
		const _allowance = allowances[market._vToken.id]?.[wrapperAddress] ?? 0;
		if (Big(_allowance).eq(0) || Big(_allowance).lt(
			Big(amount).mul(10 ** (market.inputToken.decimals ?? 18))
		)) {
			return true
		}
		return false;
	}

	const approveTx = async () => {
		setApproveLoading(true);
		const contract = await getContract("VToken", chain?.id ?? defaultChain.id, market._vToken.id);
		const wrapperAddress = protocol._wrapper;
		send(
			contract,
			"approveDelegation",
			[
				wrapperAddress,
				ethers.constants.MaxUint256
			]
		)
		.then(async (res: any) => {
			let response = await res.wait();
			updateFromTx(response);
			setApproveLoading(false);
			toast({
				title: "Approval Successful",
				description: <Box>
					<Text>
				{`You have approved borrow for ${market.inputToken.symbol}`}
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
		}
		else if(Number(amount) == 0 || isNaN(Number(amount))){
			return {
				stage: 0,
				message: "Enter Amount"
			}
		} else if (Big(amount).gt(max)) {
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
				message: "Borrow"
			}
		}
	}

	const { colorMode } = useColorMode();

	return (
		<Box px={5} pb={5} pt={0.5} >
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
				<Text
					mt={6}
					fontSize={"sm"}
					color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}
					fontWeight={"bold"}
				>
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
							{(Big(pos.collateral).gt(0) ? 
								Big(100).mul(pos.debt ?? 0).div(pos.collateral ?? 0).toNumber() : 0).toFixed(1)}{" "}
							% {"->"}{" "}
							{numOrZero(
								(Big(pos.collateral ?? 0).gt(0) ? Big(pos.debt ?? 0).add(Big(amount || 0).mul(prices[market.inputToken.id] ?? 0)).div(pos.collateral)
									.toNumber() * 100 : 0)
							).toFixed(1)}
							%
						</Text>
					</Flex>
					<Divider my={2} />
					<Flex justify="space-between">
						<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
							Available to issue
						</Text>
						<Text fontSize={"md"}>
							{dollarFormatter.format(
								Big(pos.adjustedCollateral ?? 0).sub(pos.debt ?? 0).toNumber()
							)}{" "}
							{"->"}{" "}
							{dollarFormatter.format(
								Big(pos.adjustedCollateral ?? 0).sub(Big(amount || 0).mul(prices[market.inputToken.id] ?? 0)).sub(pos.debt ?? 0).toNumber()
							)}
						</Text>
					</Flex>
				</Box>
			</Box>

			<Box mt={6}>
					{validate().stage <= 2 && <Box mt={2} className={(validate().stage != 1 || approveLoading) ? `${VARIANT}-${colorMode}-disabledSecondaryButton`: `${VARIANT}-${colorMode}-secondaryButton`}><Button
						isDisabled={validate().stage != 1}
						isLoading={approveLoading}
						loadingText="Please sign the transaction"
						color='white'
						width="100%"
						onClick={approveTx}
						size="lg"
						rounded={0}
						bg={'transparent'}
						_hover={{ bg: "transparent" }}
					>
						{validate().message}
					</Button>
					</Box>}
						
					{validate().stage > 0 && <Box mt={2} className={(validate().stage < 2 || loading) ? `${VARIANT}-${colorMode}-disabledSecondaryButton`:`${VARIANT}-${colorMode}-secondaryButton`} > <Button
						isDisabled={validate().stage < 2}
						isLoading={loading}
						loadingText="Please sign the transaction"
						width="100%"
						color="white"
						rounded={0}
						bg={'transparent'}
						onClick={borrow}
						size="lg"
						_hover={{ bg: "transparent" }}
					>
						{isConnected && !chain?.unsupported ? (
							Big(amount).gt(max) ? (
								<>Insufficient Wallet Balance</>
							) : (
								<>Borrow</>
							)
						) : (
							<>Please connect your wallet</>
						)}
					</Button></Box>}
				</Box>
		</Box>
	);
};

export default Borrow;
