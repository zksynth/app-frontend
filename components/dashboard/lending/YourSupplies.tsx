import React from "react";
import { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableContainer,
	Box,
	Skeleton,
	Heading,
	Text,
	Flex,
	useColorMode
} from "@chakra-ui/react";

import ThBox from "./../ThBox";
import { useLendingData } from "../../context/LendingDataProvider";
import { useBalanceData } from "../../context/BalanceProvider";
import YourSupply from "../../modals/supply/YourSupply";
import { usePriceData } from "../../context/PriceContext";
import Big from "big.js";
import { VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";

export default function YourSupplies() {
	const { pools } = useLendingData();
	const { walletBalances } = useBalanceData();
	const router = useRouter();
	const markets = pools[Number(router.query.market) || 0] ?? [];

	const suppliedMarkets = markets.filter((market: any) => {
		return Big(walletBalances[market.outputToken.id] ?? 0).gt(0);
	});

	const { colorMode } = useColorMode();

	return (
		<Flex flexDir={'column'} justify={'start'} h={'100%'}>
			<Box className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={5}>
				<Heading fontSize={'18px'} color={'primary.400'}>Your Supplies</Heading>
			</Box>

			{markets.length > 0 ? ( <>
					{suppliedMarkets.length > 0 ? <TableContainer pb={4}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<ThBox alignBox='left'>
										Asset
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										Earning APY
									</Text>
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										My Balance
									</Text>
									</ThBox>
									<ThBox alignBox='right' isNumeric>
										Collateral
									</ThBox>
								</Tr>
							</Thead>
							<Tbody>
								{suppliedMarkets.map(
									(market: any, index: number) => {
										return <YourSupply
											key={index}
											market={market}
											index={index}
										/>
									}
								)}
							</Tbody>
						</Table>
					</TableContainer> : <Flex flexDir={'column'} justify={'center'} h='100%' py={5}>
						<Text textAlign={'center'} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>You have no supplied assets.</Text>
						</Flex>}
					</>
			) : (
				<Box pt={0.5}>
					<Skeleton height="50px" m={6} mt={8} rounded={12} />
				</Box>
			)}
		</Flex>
	);
}
