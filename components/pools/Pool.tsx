import {
	Flex,
	Image,
	Text,
	Button,
	Tr,
	useDisclosure,
	Box,
	useColorMode,
} from "@chakra-ui/react";
import React from "react";
import TdBox from "../dashboard/TdBox";
import { ESYX_PRICE, dollarFormatter } from "../../src/const";
import Join from "./actions/join/index";
import Details from "./actions/Details";
import { usePriceData } from "../context/PriceContext";
import Big from "big.js";
import { useDexData } from "../context/DexDataProvider";
import { VARIANT } from "../../styles/theme";

export default function Pool({ pool, index }: any) {
	const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure();
	const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
	const { dex } = useDexData();

	const calcApy = () => {
		let totalFees = 0;
		if(pool.snapshots.length > 1){
			totalFees = (Number(pool.snapshots[0].swapFees) - Number(pool.snapshots[pool.snapshots.length-1].swapFees)) / 2;
		}
		const dailyFee = totalFees / pool.snapshots.length;
		if(liquidity == 0) return 0;
		const dailyApy = ((1 + dailyFee / liquidity) ** 365) - 1;
		return dailyApy * 100;
	}

	const { prices } = usePriceData();

	const liquidity = pool.tokens.reduce((acc: any, token: any) => {
		return acc + (token.balance ?? 0) * (prices[token.token.id] ?? 0);
	}, 0);

	const rewardsApy = (liquidity > 0 && dex.totalAllocPoint > 0) ? Big(pool.allocPoint ?? 0)
			.div(dex.totalAllocPoint)
			.mul(dex.sushiPerSecond)
			.div(1e18)
			.mul(365 * 24 * 60 * 60 * ESYX_PRICE)
			.div(liquidity ?? 1)
			.mul(100)
			.toFixed(2) : 0;

	const { colorMode } = useColorMode();

	return (
		<>
			<Tr>
				<TdBox isFirst={index == 0} alignBox="center">
					<Flex ml={4}>
						{pool.tokens.map((token: any, index: number) => {
							return (
								pool.address !== token.token.id && (
									<Flex
										ml={"-2"}
										key={index}
										align="center"
										gap={2}
									>
										<Image
											src={`/icons/${token.token.symbol}.svg`}
											alt=""
											width={"32px"}
										/>
									</Flex>
								)
							);
						})}
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox="center">
					<Flex gap={1}>
						{pool.tokens.map((token: any, index: number) => {
							return (
								pool.address !== token.token.id && (
									<Flex
										className={`${VARIANT}-${colorMode}-outlinedBox`}
										p={2}
										key={index}
										align="center"
										gap={2}
									>
										<Text>
											{token.token.symbol}
											
											{pool.totalWeight > 0
												? "(" +(100 * token.weight) /
														pool.totalWeight +
												  "%" + ")"
												: ""}
											
										</Text>
									</Flex>
								)
							);
						})}
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox="center">
					<Flex w={"100%"} justify={"center"}>
						{dollarFormatter.format(liquidity)}
					</Flex>
				</TdBox>

				<TdBox isFirst={index == 0} alignBox="center">
					<Flex flexDir={'column'} align={'center'} w={'100%'} textAlign={'center'}>
						<Text color={'primary.400'}>{calcApy().toFixed(2)}%</Text>
						{Number(rewardsApy) > 0 && <Flex gap={1.5} mt={1} align={'center'}>
						<Text color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'} fontSize={'xs'}>+{rewardsApy}%</Text>
						<Image src={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`} rounded={'full'} w={'15px'} h={'15px'} />
						</Flex>}
					</Flex>
				</TdBox>

				<TdBox isNumeric>
					<Flex gap={2}>
						<Box className={`${VARIANT}-${colorMode}-primaryButton`}>
							<Button
								onClick={onDepositOpen}
								color={"white"}
								size={"md"} 
								bg={'transparent'} 
								_hover={{bg: 'transparent'}}
							>
								Deposit
							</Button>
						</Box>
						<Box className={`${VARIANT}-${colorMode}-outlinedButton`}>
							<Button onClick={onDetailsOpen} size={"md"} bg={'transparent'} _hover={{bg: 'transparent'}}>
								View Details
							</Button>
						</Box>
					</Flex>
				</TdBox>
			</Tr>
			
			<Join pool={pool} isOpen={isDepositOpen} onClose={onDepositClose} />
			<Details pool={pool} isOpen={isDetailsOpen} onClose={onDetailsClose} />
		</>
	);
}
