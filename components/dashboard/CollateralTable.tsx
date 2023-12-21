import React from "react";
import { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	TableContainer,
	Box,
	Skeleton,
	Heading,
	Divider,
	useColorMode,
	Flex,
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";

import CollateralModal from "../modals/collateral";
import ThBox from "./ThBox";
import { VARIANT } from "../../styles/theme";

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

const pageSize = 5;

export default function CollateralTable() {
	const { pools, tradingPool } = useContext(AppDataContext);
	const { colorMode } = useColorMode();

	const { currentPage, setCurrentPage, pagesCount, pages } =
		usePagination({
			pagesCount: Math.ceil((pools[tradingPool]?.collaterals?.length ?? 1) / pageSize) ?? 1,
			initialState: { currentPage: 1 }
		}
	);	

	return (
		<>
			<Box className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={5}>
				<Heading fontSize={'18px'} color={'primary.400'}>Add Collateral</Heading>
			</Box>

			{pools[tradingPool]?.collaterals.length > 0 ? (
					<TableContainer>
						<Table variant="simple">
							<Thead>
								<Tr>
									<ThBox alignBox='left'>
										Asset
									</ThBox>
									<ThBox alignBox='right' isNumeric>
										Balance
									</ThBox>
								</Tr>
							</Thead>
							<Tbody>
								{pools[tradingPool]?.collaterals.map(
									(collateral: any, index: number) => (
										<CollateralModal
											key={index}
											collateral={collateral}
											tradingPool={tradingPool}
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
		</>
	);
}
