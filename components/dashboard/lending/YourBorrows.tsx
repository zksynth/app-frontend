import React from "react";
import {
	Table,
	Thead,
	Tbody,
	Tr,
	TableContainer,
	Box,
	Skeleton,
	Heading,
	Flex,
	Text,
	useColorMode
} from "@chakra-ui/react";
import ThBox from "../ThBox";
import { useLendingData } from "../../context/LendingDataProvider";
import { useBalanceData } from "../../context/BalanceProvider";
import YourBorrow from "../../modals/borrow/YourBorrow";
import { usePriceData } from "../../context/PriceContext";
import Big from "big.js";
import { VARIANT } from "../../../styles/theme";
import EModeMenu from "./EModeMenu";
import { useRouter } from "next/router";

export default function YourBorrows() {
	const { pools, protocols } = useLendingData();	
	const { walletBalances } = useBalanceData();
	const { colorMode } = useColorMode();

	const router = useRouter();
	const markets = pools[Number(router.query.market) || 0] ?? [];
	
	const borrowedMarkets = markets.filter((market: any) => {
		return Big(walletBalances[market._vToken.id] ?? 0).gt(0) || Big(walletBalances[market._sToken.id] ?? 0).gt(0);
	});

	return (
		<Flex flexDir={'column'} justify={'start'} h={'100%'} minH={'150px'}>
			<Flex className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={3} align={'center'} justify={'space-between'}>
				<Heading fontSize={'18px'} color={'secondary.400'} py={2}>Your Borrows</Heading>
				{protocols[Number(router.query.market) || 0]?.eModes?.length > 0 && <EModeMenu />}
			</Flex>

			{markets.length > 0 ? ( <>
					{borrowedMarkets.length > 0 ? <TableContainer h='100%' pb={4}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<ThBox alignBox='left'>
										Asset
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										Interest APY
									</Text>
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										My Balance
									</Text>
									</ThBox>
									<ThBox alignBox='right' isNumeric>
										Type
									</ThBox>
								</Tr>
							</Thead>
							<Tbody>
								{borrowedMarkets.map(
									(market: any, index: number) => ( <>
										{walletBalances[market._vToken.id] > 0 && <YourBorrow
											key={index}
											market={market}
											index={index}
											type='VARIABLE'
										/>}

										{walletBalances[market._sToken.id] > 0 && <YourBorrow
											key={index}
											market={market}
											index={index}
											type='STABLE'
										/>}
										</>
									)
								)}
							</Tbody>
						</Table>
					</TableContainer>
					: <Flex flexDir={'column'} justify={'center'} h='100%' py={5}>
					<Text textAlign={'center'} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>You have no borrowed assets.</Text>
					</Flex>
					}
				</>
			) : (
				<Box pt={0.5}>
					<Skeleton height="50px" m={6} mt={8} rounded={12} />
				</Box>
			)}
		</Flex>
	);
}
