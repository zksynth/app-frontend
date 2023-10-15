import React, { useEffect } from "react";
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
	Divider,
	Flex,
	Text,
	useColorMode
} from "@chakra-ui/react";
import SupplyModal from "../../modals/supply";
import ThBox from "./../ThBox";
import { useLendingData } from "../../context/LendingDataProvider";

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
import { VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";
const pageSize = 9;

export default function CollateralTable() {
	const { pools } = useLendingData();

	const router = useRouter();
	const markets = pools[Number(router.query.market) ?? 0] ?? [];

	const { currentPage, setCurrentPage, pagesCount, pages } =
		usePagination({
			pagesCount: Math.ceil((markets?.length ?? 1) / pageSize) ?? 1,
			initialState: { currentPage: 1 }
		}
	);

	const { colorMode } = useColorMode();

	return (
		<Box >
			<Box className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={5}>
				<Heading fontSize={'18px'} color={'primary.400'}>Assets to Supply</Heading>
			</Box>

			{markets.length > 0 ? (
					<TableContainer>
						<Table variant="simple">
							<Thead>
								<Tr>
									<ThBox alignBox='left'>
										Asset
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										APY %
									</Text>
									</ThBox>
									<ThBox alignBox='center'>
									<Text w={'100%'} textAlign={'center'}>
										Collateral
									</Text>
									</ThBox>
									<ThBox alignBox='right' isNumeric>
										Total / Liquidity
									</ThBox>
								</Tr>
							</Thead>
							<Tbody>
								{markets.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(
									(market: any, index: number) => (
										<SupplyModal
											key={index}
											market={market}
											index={index}
										/>
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
										page === currentPage ? 'primary.400' : 'white'
									}
									_hover={{ bgColor: "whiteAlpha.200" }}
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
