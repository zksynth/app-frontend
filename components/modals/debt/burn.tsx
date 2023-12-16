import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	Divider,
	Link,
	Tooltip,
	useColorMode,
} from "@chakra-ui/react";
import { getContract, send } from "../../../src/contract";
import { useAppData } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import {
	dollarFormatter,
	tokenFormatter,
} from "../../../src/const";
import Big from "big.js";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import { VARIANT } from "../../../styles/theme";

const Burn = ({ asset, amount, setAmount, amountNumber, onClose }: any) => {
	const [loading, setLoading] = useState(false);
	const { address } = useAccount();
	const { chain } = useNetwork();
	const toast = useToast();
	const { walletBalances, updateFromTx } = useBalanceData();
	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position();

	const max = () => {
		if (!address) return "0";
		if (!prices[asset.token.id] || prices[asset.token.id] == 0) return "0";
		// minimum of both
		const v1 = Big(pos.debt ?? 0).div(prices[asset.token.id] ?? 0);
		const v2 = Big(walletBalances[asset.token.id] ?? 0).div(10 ** 18);
		return (v1.gt(v2) ? v2 : v1).toString();
	};

	const { pools, tradingPool, updateFromTx: updateFromSynthTx } = useAppData();

	const { getUpdateData } = useUpdateData();
	const handleError = useHandleError(PlatformType.SYNTHETICS);

	const burn = async () => {
		if (!amount) return;
		setLoading(true);

		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		let value = Big(amount)
			.times(10 ** 18)
			.toFixed(0);

		const priceFeedUpdateData = await getUpdateData();
		let args = [asset.token.id, value, priceFeedUpdateData];

		send(pool, "burn", args)
		.then(async (res: any) => {
			const response = await res.wait();
			updateFromTx(response);
			updateFromSynthTx(response);
			setAmount("0");
			setLoading(false);
			onClose();
			toast({
				title: "Burn Successful!",
				description: (
					<Box>
						<Text>
							{`You have burned ${tokenFormatter.format(amount)} ${asset.token.symbol}`}
						</Text>
						<Link
							href={
								chain?.blockExplorers?.default.url +
								"/tx/" +
								res.hash
							}
							target="_blank"
						>
							<Flex align={"center"} gap={2}>
								<ExternalLinkIcon />
								<Text>View Transaction</Text>
							</Flex>
						</Link>
					</Box>
				),
				status: "success",
				duration: 10000,
				isClosable: true,
				position: "top-right",
			});
		})
		.catch((err: any) => {
			handleError(err);
			setLoading(false);
		});
	};

	const { isConnected } = useAccount();

	const validate = () => {
		if(!isConnected || chain?.unsupported){
			return {
				valid: false,
				message: "Connect your wallet",
			}
		} else if(!amount || amount == '0'){
			return {
				valid: false,
				message: "Enter amount",
			}
		} else if(Big(amount).gt(max())){
			return {
				valid: false,
				message: "Insufficient collateral",
			}
		} else if(loading) {
			return {
				valid: false,
				message: 'Loading'
			}
		} else {
			return {
				valid: true,
				message: "Burn",
			}
		}
	}

	const { colorMode } = useColorMode();

	return (
		<Box px={5} pb={5} pt={0.5}>
			{/* <Box mt={6} rounded={8}>
				<Tooltip
					label={`Fee for Minting and Burning ${asset.token.symbol}`}
				>
					<Flex justify="space-between">
						<Text
							fontSize={"md"}
							color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}
							textDecor={"underline"}
							cursor={"help"}
							style={{
								textUnderlineOffset: "2px",
								textDecorationStyle: "dotted",
							}}
						>
							Mint / Burn Fee
						</Text>

						<Text fontSize={"md"}>
							{tokenFormatter.format(Number(asset.mintFee / 100))}{" "}
							{"%"} /{" "}
							{tokenFormatter.format(Number(asset.burnFee / 100))}{" "}
							{"%"}
						</Text>
					</Flex>
				</Tooltip>
			</Box> */}
			<Box>
				<Box>
					<Text
						mt={6}
						fontSize={"sm"}
						color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}
						fontWeight={"bold"}
					>
						Transaction Overview
					</Text>
					<Box my={4} rounded={8}>
						<Flex justify="space-between">
							<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
								Health Factor
							</Text>
							{Number(pos.collateral) > 0 ? (
								<Text fontSize={"md"}>
									{Big(pos.debt)
										.div(pos.collateral)
										.mul(100)
										.toFixed(1)}{" "}
									% {"->"}{" "}
									{Big(pos.debt)
										.sub(amount * prices[asset.token.id])
										.div(pos.collateral)
										.mul(100)
										.toFixed(1)}
									%
								</Text>
							) : (
								<Text fontSize={"md"}>-</Text>
							)}
						</Flex>
						<Divider my={2} />
						<Flex justify="space-between">
							<Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
								Available to issue
							</Text>
							<Text fontSize={"md"}>
								{dollarFormatter.format(
									Number(pos.adjustedCollateral) -
										Number(pos.debt)
								)}{" "}
								{"->"}{" "}
								{dollarFormatter.format(
									Number(pos.adjustedCollateral) +
										amount * prices[asset.token.id] -
										Number(pos.debt)
								)}
							</Text>
						</Flex>
					</Box>
				</Box>

				<Box mt={6} className={!validate().valid? `${VARIANT}-${colorMode}-disabledPrimaryButton` : `${VARIANT}-${colorMode}-primaryButton`}>
				<Button
					isDisabled={!validate().valid}
					isLoading={loading}
					loadingText="Please sign the transaction"
					bgColor="transparent"
					width="100%"
					color="white"
					onClick={burn}
					size="lg"
					rounded={0}
					_hover={{
						bgColor: "transparent",
					}}
				>
					{validate().message}
				</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default Burn;
