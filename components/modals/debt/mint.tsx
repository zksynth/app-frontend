import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	Divider,
	Tooltip,
	useToast,
	Link,
	useColorMode,
} from "@chakra-ui/react";
import { getContract, send } from "../../../src/contract";
import { useContext, useEffect } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { PYTH_ENDPOINT, dollarFormatter, numOrZero, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import { useRouter } from "next/router";
import { base58 } from "ethers/lib/utils.js";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import { VARIANT } from "../../../styles/theme";

const Issue = ({ asset, amount, setAmount, onClose }: any) => {
	const [loading, setLoading] = useState(false);

	const { isConnected, address } = useAccount();
	const { chain } = useNetwork();
	const {getUpdateData} = useUpdateData();
	const { updateFromTx } = useBalanceData();
	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position();
	
	const {
		pools,
		tradingPool,
		updateFromTx: updateFromSynthTx
	} = useContext(AppDataContext);

	const max = () => {
		if(!address) return '0';
		if(!prices[asset.token.id] || prices[asset.token.id] == 0) return '0';
		return (
			Big(pos.adjustedCollateral)
				.sub(pos.debt)
				.div(prices[asset.token.id] ?? 0)
				.gt(0)
				? Big(pos.adjustedCollateral)
						.sub(pos.debt)
						.div(prices[asset.token.id] ?? 0)
				: 0
		).toString();
	};

	const toast = useToast();
	const handleError = useHandleError(PlatformType.SYNTHETICS);

	const mint = async () => {
		if (!amount) return;
		setLoading(true);

		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		let value = Big(amount).times(10 ** 18).toFixed(0);
		
		let args = [asset.token.id, value, address];
		
		const priceFeedUpdateData = await getUpdateData();
		if(priceFeedUpdateData.length > 0) args.push(priceFeedUpdateData);

		send(pool, "mint", args)
		.then(async (res: any) => {
			let response = await res.wait()
			updateFromTx(response);
			updateFromSynthTx(response);
			setAmount("0");
			setLoading(false);
			onClose();
			toast({
				title: "Mint Successful",
				description: <Box>
					<Text>
						{`You have minted ${amount} ${asset.token.symbol}`}
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
			handleError(err);
			setLoading(false);
		});
	};

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
				message: "Mint",
			}
		}
	}

	const { colorMode } = useColorMode();

	return (
		<Box px={5} pb={5} pt={0.5} bg="transparent">
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
								(Big(pos.collateral ?? 0).gt(0) ? Big(pos.debt ?? 0).add(
										Big(amount || 0).mul(prices[asset.token.id] ?? 0)).div(pos.collateral)
									.toNumber() : 0) * 100
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
								Big(pos.adjustedCollateral ?? 0).sub(Big(amount || 0).mul(prices[asset.token.id] ?? 0)).sub(pos.debt ?? 0).toNumber()
							)}
						</Text>
					</Flex>
				</Box>
			</Box>

			<Box mt={6} className={!validate().valid ? `${VARIANT}-${colorMode}-disabledSecondaryButton` : `${VARIANT}-${colorMode}-secondaryButton`}>
				<Button
					isDisabled={!validate().valid}
					isLoading={loading}
					loadingText="Loading"
					bg="transparent"
					colorScheme="primary"
					width="100%"
					color="white"
					_hover={{ bg: "transparent" }}
					onClick={mint}
					size="lg"
					rounded={0}
				>
					{validate().message}
				</Button>
			</Box>
		</Box>
	);
};

export default Issue;
