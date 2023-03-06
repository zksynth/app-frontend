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
	TableCaption,
	TableContainer,
	Flex,
	Image,
	Text,
	Box,
	IconButton,
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";
import {
	preciseTokenFormatter,
	tokenFormatter,
	compactTokenFormatter,
	dollarFormatter,
} from "../../src/const";
import { BiPlus, BiMinusCircle, BiMinus } from "react-icons/bi";
import { motion } from "framer-motion";
import Mint from "../modals/debt/mint";
import Burn from "../modals/debt/burn";

import Big from "big.js";
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
			<motion.div
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 15 }}
				transition={{ duration: 0.5 }}
				key={tradingPool}
			>
				{pools[tradingPool]?.synths.length > 0 ? (
					<TableContainer pt={2}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<Th color={"gray.500"}>Synth</Th>
									<Th color={"gray.500"}>Price</Th>
									<Th color={"gray.500"}>Volume 24h</Th>
									<Th color={"gray.500"} isNumeric>
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
					<>
						<Skeleton height="50px" m={6} mt={10} rounded={12} />
						<Skeleton height="50px" rounded={12} m={6} />
						<Skeleton height="50px" rounded={12} m={6} />
						<Skeleton height="50px" rounded={12} m={6} />
						<Skeleton height="50px" rounded={12} m={6} />
						<Skeleton height="50px" rounded={12} m={6} />
					</>
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
												? "gray.800"
												: "gray.700"
										}
										_hover={{ bgColor: "gray.700" }}
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
			</motion.div>
		</>
	);
}
