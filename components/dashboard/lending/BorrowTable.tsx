import React from "react";
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
import Borrow from "../../modals/borrow";
import ThBox from "../ThBox";
import { useLendingData } from "../../context/LendingDataProvider";
import { VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";

const pageSize = 9;

export default function CollateralTable() {
	const { pools, protocols } = useLendingData();
	const router = useRouter();
	const markets = pools[Number(router.query.market) || 0] ?? [];

	const { currentPage, setCurrentPage, pagesCount, pages } =
		usePagination({
			pagesCount: Math.ceil((markets?.length ?? 1) / pageSize) ?? 1,
			initialState: { currentPage: 1 }
		}
	);
	
	const { colorMode } = useColorMode();

	const _markets = protocols[Number(router.query.market) || 0]?.eModeCategory?.assets ? protocols[Number(router.query.market) || 0]?.eModeCategory?.assets : markets;
	return (
		<Box>
			<Box className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={5}>
				<Heading fontSize={'18px'} color={'secondary.300'}>Assets to Borrow</Heading>			
			</Box>
			{_markets.length > 0 ? (
				<TableContainer>
					<Table variant="simple">
						<Thead>
							<Tr >
								<ThBox alignBox='left'>Asset</ThBox>
								<ThBox >
								<Text w={'100%'} textAlign={'center'}>
										Available
									</Text>
								</ThBox>
								<ThBox >
								<Text w={'100%'} textAlign={'center'}>
										Stable APR
									</Text>
								</ThBox>
								<ThBox alignBox='right' isNumeric>
									Variable APR
								</ThBox>
							</Tr>
						</Thead>
						<Tbody>
							{_markets.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(
								(market: any, index: number) => (
									<Borrow market={market} key={index} index={index} />
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
