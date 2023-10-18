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
import { useAccount, useBalance, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { getContract, send } from "../../../src/contract";
import { AppDataContext, useAppData } from "../../context/AppDataProvider";
import { PYTH_ENDPOINT, compactTokenFormatter, dollarFormatter, numOrZero } from "../../../src/const";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import { VARIANT } from "../../../styles/theme";

export default function Withdraw({ collateral, amount, setAmount, isNative, onClose }: any) {
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const toast = useToast();
	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position();
	const { pools, tradingPool, updateFromTx: updateFromSynthTx } = useAppData();

	const {updateFromTx} = useBalanceData();
	const {getUpdateData} = useUpdateData();
	const { address, isConnected } = useAccount();
	const { chain } = useNetwork();

	// adjustedDebt - pools[tradingPool]?.userDebt = assetAmount*assetPrice*ltv
	const max = () => {
		const v1 = prices[collateral.token.id] > 0 ? Big(pos.adjustedCollateral)
							.sub(pos.debt)
							.div(prices[collateral.token.id])
							.div(collateral.baseLTV)
							.mul(1e4)
					: Big(0);
		const v2 = Big(collateral.balance ?? 0).div(10 ** collateral.token.decimals);
		// min(v1, v2)
		return (v1.gt(v2) ? v2 : v1).toString();
	};

	const handleError = useHandleError(PlatformType.SYNTHETICS);

	const withdraw = async () => {
		setLoading(true);
		setMessage("")
		setConfirmed(false);
		setResponse(null);
		setHash(null);
		const poolId = pools[tradingPool].id;
		const pool = await getContract("Pool", chain?.id!, poolId);
		const _amount = Big(amount).mul(10**collateral.token.decimals).toFixed(0);

		let args = [collateral.token.id, _amount, isNative];
		
		const priceFeedUpdateData = await getUpdateData()
		if(priceFeedUpdateData.length > 0) args.push(priceFeedUpdateData);
		
		send(pool, "withdraw", args).then(async (res: any) => {
			const response = await res.wait();
			updateFromTx(response);
			updateFromSynthTx(response);
			setAmount('0');
			setLoading(false);
			onClose();
			toast({
				title: "Withdrawal Successful",
				description: <Box>
					<Text>
						{`You have withdrawn ${amount} ${collateral.token.symbol}`}
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
			handleError(err)
			setLoading(false);
		});
	};

	const validate = () => {
		if(!isConnected || chain?.unsupported){
			return { valid: false, message: 'Please connect your wallet' }
		} else if (Number(amount) == 0 || isNaN(Number(amount))){
			return { valid: false, message: 'Enter Amount'}
		} else if(Big(amount).gt(max())){
			return { valid: false, message: 'Amount exceeds balance'}
		} else if (loading) {
			return { valid: false, message: 'Loading'}
		} else {
			return { valid: true, message: 'Withdraw'}
		}
	}

	const { colorMode } = useColorMode();

	return (
		<>
			<Box px={5} py={5}>
				<Box>
					<Flex justify="space-between">
						<Tooltip label='Max capacity to have this asset as collateral'>
						<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Capacity
						</Text>
						</Tooltip>

						<Text fontSize={"md"}>
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
							{parseFloat(collateral.baseLTV) / 100} % /{" "}
							{parseFloat(collateral.liqThreshold) / 100} %
						</Text>
					</Flex>
				</Box>

				
                <Box>
						<Text mt={8} fontSize={"sm"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} fontWeight={'bold'}>
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
								{Number(pos.debtLimit).toFixed(2)} % {"->"} {Number(pos.collateral) - amount*prices[collateral.token.id] > 0 ? (Number(pos.debt)/(Number(pos.collateral) - (amount*prices[collateral.token.id])) * 100).toFixed(1) : '0'} %
								</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
									Available to issue
								</Text>
								<Text fontSize={"md"}>
								{dollarFormatter.format(Number(pos.availableToIssue))} {"->"} {dollarFormatter.format(Number(pos.adjustedCollateral) - amount*prices[collateral.token.id]*collateral.baseLTV/10000 - Number(pos.debt))}
								</Text>
							</Flex>
						</Box>
					</Box>
            
				<Box mt={6} className={!validate().valid ? `${VARIANT}-${colorMode}-disabledPrimaryButton` : `${VARIANT}-${colorMode}-primaryButton`}>
                <Button
                    isDisabled={!validate().valid}
                    isLoading={loading}
                    loadingText="Loading"
                    bgColor="transparent"
                    width="100%"
                    color="white"
                    onClick={withdraw}
                    size="lg"
                    rounded={0}
                    _hover={{
                        bg: "transparent",
                    }}
                >
                    {validate().message}
                </Button>
				</Box>

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
