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

export default function CollateralTable() {
	const { pools, tradingPool } = useContext(AppDataContext);

	const { currentPage, setCurrentPage, pagesCount, pages, pageSize } =
		usePagination({
			pagesCount: 1,
			initialState: { currentPage: 1 },
		});

	return (
		<>
				{pools[tradingPool]?.synths.length > 0 ? (
					<TableContainer pt={1}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<Th color={"whiteAlpha.800"}>Synthetic Asset</Th>
									<Th color={"whiteAlpha.800"}>Price</Th>
									<Th color={"whiteAlpha.800"}>Volume 24h</Th>
									<Th color={"whiteAlpha.800"} isNumeric>
										Liquidity
									</Th>
								</Tr>
							</Thead>
							<Tbody>
								{pools[tradingPool]?.synths.map(
									(synth: any, index: number) => (
										<Debt synth={synth} key={index} />
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
										bgColor={
											page === currentPage
												? "whiteAlpha.200"
												: "whiteAlpha.100"
										}
										_hover={{ bgColor: "whiteAlpha.300" }}
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
		</>
	);
}
