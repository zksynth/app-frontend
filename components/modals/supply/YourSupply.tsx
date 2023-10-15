import React, { useState } from "react";
import {
	Modal,
	ModalOverlay,
	Tr,
	Td,
	Flex,
	Text,
	Box,
	useDisclosure,
	Switch,
	useToast,
	Image,
	useColorMode
} from "@chakra-ui/react";
import { ESYX_PRICE, dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import { useNetwork } from 'wagmi';
import TdBox from "../../dashboard/TdBox";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { getContract, send } from "../../../src/contract";
import { useLendingData } from "../../context/LendingDataProvider";
import SupplyModal from "./SupplyModal";
import MarketInfo from "../_utils/TokenInfo";
import useHandleError, { PlatformType } from "../../utils/useHandleError";

export default function YourSupply({ market, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [amount, setAmount] = React.useState("");
	const [amountNumber, setAmountNumber] = useState(0);
	const [isNative, setIsNative] = useState(false);
	const { chain } = useNetwork();
	const { walletBalances } = useBalanceData();
	const [loading, setLoading] = useState(false);

	const _onClose = () => {
		setAmount("0");
		setAmountNumber(0);
		onClose();
		setIsNative(false);
	};

	const { prices } = usePriceData();
	const { toggleIsCollateral } = useLendingData();

	const _onOpen = (e: any) => {
		// we have a switch (with classname isCollateralSwitch) in this row, so we need to prevent the modal from opening
		if (e.target.className.includes("chakra-switch")) return;
		onOpen();
	}

	const toast = useToast();
	const handleError = useHandleError(PlatformType.LENDING);

	const _switchIsCollateral = async () => {
		setLoading(true);
		// call setUserUseReserveAsCollateral
		const pool = await getContract("LendingPool", chain?.id!, market.protocol._lendingPoolAddress);
		send(pool, "setUserUseReserveAsCollateral", [market.inputToken.id, !market.isCollateral])
		.then(async (res: any) => {
			await res.wait();
			toggleIsCollateral(market.id);
			toast({
				title: `${!market.isCollateral ? 'Disabled' : 'Enabled'} ${market.inputToken.symbol} as collateral`,
				description: `You have ${!market.isCollateral ? 'disabled' : 'enabled'} ${market.inputToken.symbol} as collateral`,
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "top-right"
			});
			setLoading(false);
		})
		.catch((err: any) => {
			setLoading(false);
			handleError(err);
		})
	}

	const rewardAPY = () => {
		let index = market.rewardTokens.map((token: any) => token.id.split('-')[0] == "DEPOSIT").indexOf(true);
		if(index == -1) return '0';
		if(Number(market.totalDepositBalanceUSD) == 0) return 'Infinity';
		return Big(market.rewardTokenEmissionsAmount[index])
			.div(1e18)
			.mul(365 * ESYX_PRICE)
			.div(market.totalDepositBalanceUSD)
			.mul(100)
			.toFixed(2);
	}

	const { colorMode } = useColorMode();

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={_onOpen}
				_hover={{ bg: colorMode == 'dark' ? "darkBg.400" : "whiteAlpha.600" }}
			>
				<TdBox
					isFirst={index == 0}
					alignBox='left'
				>
					<MarketInfo token={market.inputToken} color={colorMode == 'dark' ? "primary.200" : "primary.600"} />
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='center'
				>
					<Flex flexDir={'column'} align={'center'} w={'100%'} textAlign={'center'}>
						<Text color={colorMode == 'dark' ? "primary.200" : "primary.600"}>
						{Number(market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0).toFixed(2)} %
						</Text>
						{Number(rewardAPY()) > 0 && <Flex gap={1} mt={0} align={'center'}>
						<Text fontSize={'xs'}>
							+{rewardAPY()} %
						</Text>
						<Image src={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`} rounded={'full'} w={'15px'} h={'15px'} />
						</Flex>}
					</Flex>
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='center'
				>
					<Box w={'100%'} textAlign={'center'}>
					<Text >
					{tokenFormatter.format(Big(walletBalances[market.outputToken.id] ?? 0).div(10**(market.outputToken.decimals ?? 18)).toNumber())}
					</Text>
					<Text fontSize={'xs'} mt={0.5}>
					{dollarFormatter.format(Big(walletBalances[market.outputToken.id] ?? 0).mul(prices[market.inputToken.id] ?? 0).div(10**(market.outputToken.decimals ?? 18)).toNumber())}
					</Text>
					</Box>
				</TdBox>
				<TdBox
					isFirst={index == 0}
					alignBox='right'
					isNumeric
				>
					<Flex gap={2}>
						<Switch variant={'boxy'} rounded={0} size="sm" isDisabled={loading} className="isCollateralSwitch" colorScheme="secondary" isChecked={market.isCollateral} onChange={_switchIsCollateral} />
					</Flex>
				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<SupplyModal market={market}
					amountNumber={amountNumber}
					setAmountNumber={setAmountNumber}
					amount={amount}
					setAmount={setAmount}
					onClose={_onClose}
				/>
			</Modal>
		</>
	);
}
