import React, { useState } from "react";
import {
	Modal,
	ModalOverlay,
	Tr,
	Flex,
	Image,
	Text,
	useDisclosure,
	useColorMode,
} from "@chakra-ui/react";
import {
	ESYX_PRICE,
	tokenFormatter
} from "../../../src/const";
import Big from "big.js";
import TdBox from "../../dashboard/TdBox";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import BorrowModal from "./BorrowModal";
import MarketInfo from "../_utils/TokenInfo";
import { useRouter } from "next/router";

export default function Debt({ market, index }: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [amount, setAmount] = React.useState("");
	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const router = useRouter();
	const pos = lendingPosition(Number(router.query.market) || 0);

	const _onClose = () => {
		setAmount("");
		onClose();
	};

	const rewardAPY = (type = "VARIABLE") => {
		let index = market.rewardTokens.map((token: any) => (token.id.split('-')[0] == "BORROW" && token.id.split('-')[1] == type)).indexOf(true);
		if(index == -1) return '0';
		if(Number(market.totalBorrowBalanceUSD) == 0) return 'Infinity';
		return Big(market.rewardTokenEmissionsAmount[index])
			.div(1e18)
			.mul(365 * ESYX_PRICE)
			.div(market.totalBorrowBalanceUSD)
			.mul(100)
			.toFixed(2);
	}

	const available = () => {
		if(!pos || !prices[market.inputToken.id]) return Big(0)
		const v1 = Big(pos?.availableToIssue ?? 0).div(prices[market.inputToken.id]);
		const v2 = Big(market.totalDepositBalanceUSD).sub(market.totalBorrowBalanceUSD).div(prices[market.inputToken.id]);
		let min = v1.lt(v2) ? v1 : v2;
		if(min.lt(0)) min = Big(0);
		return min;
	}

	const { colorMode } = useColorMode();

	return (
		<>
			<Tr
				cursor="pointer"
				onClick={onOpen}
				_hover={{ bg: colorMode == 'dark' ? "darkBg.400" : "whiteAlpha.600" }}
			>
				<TdBox isFirst={index == 0} alignBox='left'>
					<MarketInfo token={market.inputToken} color={colorMode == 'dark' ? "secondary.200" : "secondary.600"} />
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='center'>
					<Text textAlign={'center'} w={'100%'}>
						{tokenFormatter.format(available().toNumber())}
					</Text>
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='center'>
				<Flex flexDir={'column'} align={'center'} w={'100%'} textAlign={'center'}>
						<Text color={colorMode == 'dark' ? "secondary.200" : "secondary.600"}>
							-{Number(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'STABLE')[0]?.rate ?? 0).toFixed(2)} %
						</Text>
						{Number(rewardAPY("STABLE")) > 0 && <Flex gap={1} mt={0} align={'center'}>
						<Text fontSize={'xs'}>
							+{rewardAPY("STABLE")} %
						</Text>
						<Image src={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`} rounded={'full'} w={'15px'} h={'15px'} />
						</Flex>}
					</Flex>
				</TdBox>
				<TdBox isFirst={index == 0} alignBox='right' isNumeric>
					<Flex flexDir={'column'} align={'right'} w={'100%'} textAlign={'right'}>
						<Text color={colorMode == 'dark' ? "secondary.200" : "secondary.600"}>
							-{Number(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'VARIABLE')[0]?.rate ?? 0).toFixed(2)} %
						</Text>
						{Number(rewardAPY("VARIABLE")) > 0 && <Flex gap={1} mt={0} justify={'end'} align={'center'}>
						<Text fontSize={'xs'}>
							+{rewardAPY("VARIABLE")} %
						</Text>
						<Image src={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`} rounded={'full'} w={'15px'} h={'15px'} />
						</Flex>}
					</Flex>
				</TdBox>
			</Tr>

			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
				<BorrowModal market={market} amount={amount} setAmount={setAmount} onClose={_onClose} />
			</Modal>
		</>
	);
}
