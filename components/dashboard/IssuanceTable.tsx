import React from "react";
import { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	TableContainer,
	Flex,
	Box,
	Heading,
	Text,
	Tfoot,
	useColorMode
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";
import {
	Pagination,
	usePagination,
	PaginationNext,
	PaginationPage,
	PaginationPrevious,
	PaginationContainer,
	PaginationPageGroup,
} from "@ajna/pagination";

import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { Skeleton } from "@chakra-ui/react";
import Debt from "../modals/debt";
import ThBox from "./ThBox";
import { VARIANT } from "../../styles/theme";
import { useSyntheticsData } from "../context/SyntheticsPosition";
import APRInfo from "../infos/APRInfo";
import { usePriceData } from "../context/PriceContext";
import { BsStars } from "react-icons/bs";
import Big from "big.js";
import { ESYX_PRICE, defaultChain, dollarFormatter } from "../../src/const";

const pageSize = 5;

export default function IssuanceTable() {
	const { pools, tradingPool } = useContext(AppDataContext);

	const { currentPage, setCurrentPage, pagesCount, pages } =
		usePagination({
			pagesCount: Math.ceil((pools[tradingPool]?.synths?.length ?? 1) / pageSize) ?? 1,
			initialState: { currentPage: 1 }
		}
	);	

	// sort by synth.totalSupply * price
	pools[tradingPool]?.synths.sort((a: any, b: any) => {
		return (b.totalSupply * b.priceUSD) - (a.totalSupply * a.priceUSD);
	});

	const { colorMode } = useColorMode();
	const { poolDebt, position } = useSyntheticsData();
	const { prices } = usePriceData();

	const esSyxApr = () => {
		if (!pools[tradingPool]) return "0";
		const totalDebt = poolDebt();
		if (Big(totalDebt).eq(0)) return "0";
		return Big(pools[tradingPool]?.rewardSpeeds[0] ?? 0)
			.div(1e18)
			.mul(365 * 24 * 60 * 60 * ESYX_PRICE)
			.div(totalDebt)
			.mul(100)
			.toFixed(2);
	};


	const debtBurnApr = () => {
		const pool = pools[tradingPool];
		if (!pool) return "0";
		const totalDebt = poolDebt();
		if (Big(totalDebt).eq(0)) return "0";
		// average burn and revenue
		let averageDailyBurn = Big(0);
		let averageDailyRevenue = Big(0);
		for(let k = 0; k < pool.synths.length; k++) {
			for(let l = 0; l <pool.synths[k].synthDayData.length; l++) {
				let synthDayData = pool.synths[k].synthDayData[l];
				// synthDayData.dailyMinted / 1e18 * pool.synths[k].mintFee / 10000 * pool.synths[k].priceUSD
				let totalFee = Big(synthDayData.dailyMinted).div(1e18).mul(pool.synths[k].mintFee).div(10000).mul(prices[pool.synths[k].token.id]);
				// add burn fee
				totalFee = totalFee.plus(Big(synthDayData.dailyBurned).div(1e18).mul(pool.synths[k].burnFee).div(10000).mul(prices[pool.synths[k].token.id]));

				// add to average
				averageDailyBurn = averageDailyBurn.plus(
					totalFee.mul(pool.issuerAlloc).div(10000)
				);
				averageDailyRevenue = averageDailyRevenue.plus(
					totalFee.mul(10000 - pool.issuerAlloc).div(10000)
				);
			}
		}
		// pool.averageDailyBurn = averageDailyBurn.div(7).toString();
		// pool.averageDailyRevenue = averageDailyRevenue.div(7).toString();
		return averageDailyBurn
			.div(7)
			.mul(365)
			.div(totalDebt)
			.mul(100)
			.toFixed(2);
	};

	return (
		<Box >
			<Flex align={'center'} justify={'space-between'} className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={5}>
				<Heading fontSize={'18px'} color={'secondary.300'}>Mint Synthetic Assets</Heading>
				<Flex gap={2} align={'center'}>
					<Heading size={"xs"} color={"blackAlpha.600"}>
						Rewards APR
					</Heading>
					<APRInfo
						debtBurnApr={debtBurnApr()}
						esSyxApr={esSyxApr()}
					>
						<Flex color={"secondary.400"} gap={1} align={'center'} cursor={"help"}>
							<Heading size={"sm"}>
								{(
									Number(debtBurnApr())
									+ Number(esSyxApr())
								).toFixed(2)}
								%
							</Heading>
							<Box color={'secondary.400'}>
							<BsStars />
							</Box>
						</Flex>
					</APRInfo>
				</Flex>
			</Flex>
			{pools[tradingPool]?.synths.length > 0 ? (
				<TableContainer>
					<Table variant="simple">
						<Thead>
							<Tr >
								<ThBox alignBox='left'>Asset</ThBox>
								<ThBox >Price</ThBox>
								<ThBox >Volume 24h</ThBox>
								<ThBox alignBox='right' isNumeric>
									Liquidity
								</ThBox>
							</Tr>
						</Thead>
						<Tbody>
							{[...pools[tradingPool]?.synths.slice((currentPage - 1) * pageSize, currentPage * pageSize)].map(
								(synth: any, index: number) => (
									<Debt synth={synth} key={index} index={index} />
								)
							)}
						</Tbody>
					</Table>
				</TableContainer>
			) : (
				<Box pt={0.5}>
					<Skeleton height="50px" m={6} mt={8} rounded={12} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
				</Box>
			)}

			<Flex justify={"center"}>
				<Pagination
					pagesCount={pagesCount}
					currentPage={currentPage}
					onPageChange={setCurrentPage}
				>
					<PaginationContainer my={4}>
						<PaginationPrevious variant={"none"}>
							<MdNavigateBefore />
						</PaginationPrevious>
						<PaginationPageGroup>
							{pages.map((page: number) => (
								<PaginationPage
									key={`pagination_page_${page}`}
									page={page}
									width={10}
									rounded={"full"}
									bgColor={"transparent"
									}
									color={
										page === currentPage ? 'primary.400' : colorMode == 'dark' ? 'white' : 'blackAlpha.600'
									}
									_hover={{ bgColor: colorMode == 'dark' ? "whiteAlpha.200" : "blackAlpha.200" }}
								/>
							))}
						</PaginationPageGroup>
						<PaginationNext variant={"none"}>
							{" "}
							<MdNavigateNext />{" "}
						</PaginationNext>
					</PaginationContainer>
				</Pagination>
			</Flex>
		</Box>
	);
}
