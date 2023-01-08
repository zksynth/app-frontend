import React, { useContext, useState } from "react";
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Button,
	TableContainer,
	Box,
	Text,
	Flex,
	useDisclosure,
	useColorMode,
	Skeleton,
	AvatarGroup,
	Avatar,
} from "@chakra-ui/react";

import Image from "next/image";
import IssueModel from "./modals/IssueModal";
import RepayModel from "./modals/RepayModal";
import { WalletContext } from "./context/WalletContextProvider";
import {
	MdArrowBackIos,
	MdNavigateBefore,
	MdNavigateNext,
} from "react-icons/md";

import {
	Pagination,
	usePagination,
	PaginationNext,
	PaginationPage,
	PaginationPrevious,
	PaginationContainer,
	PaginationPageGroup,
} from "@ajna/pagination";
import { AppDataContext } from "./context/AppDataProvider";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { TOKEN_COLORS } from "../src/const";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

const LIMIT = 6;
const IssuanceTable = ({ handleChange }: any) => {
	const [nullValue, setNullValue] = useState(false);
	const { currentPage, setCurrentPage, pagesCount, pages, pageSize } =
		usePagination({
			pagesCount: 1,
			initialState: { currentPage: 1 },
		});
	const [extraTokens, setExtraTokens] = useState<any>([]);

	const [expandedRows, setExpandedRows] = useState<any>({});

	const { isConnected } = useContext(WalletContext);

	const {
		address: evmAddress,
		isConnected: isEvmConnected,
		isConnecting: isEvmConnecting,
	} = useAccount();

	const {
		synths: debts,
		tokenFormatter,
		dollarFormatter,
		isDataReady,
		updateSynthBalance,
		pools,
		chain,
	} = useContext(AppDataContext);

	const handleIssue = (synthId: string, value: string) => {
		updateSynthBalance(synthId, value, false);
		setNullValue(!nullValue);
		handleChange();
	};

	const handleRepay = (synthId: string, value: string) => {
		updateSynthBalance(synthId, value, true);
		setNullValue(!nullValue);
		handleChange();
	};

	const expandRow = (index: number) => {
		const _expandedRows = { ...expandedRows };
		if (!_expandedRows[index]) _expandedRows[index] = true;
		else _expandedRows[index] = !_expandedRows[index];
		setExpandedRows(_expandedRows);
	};

	useEffect(() => {
		if (pools.length > 0 && extraTokens.length == 0) {
			// tokens with less than 10 % of total liquidity => add as extra tokens
			let _extraTokens: number[] = [];
			for (let i in pools) {
				_extraTokens[i] = 0;
				for (let j in pools[i]._mintedTokens) {
					if (
						pools[i]._mintedTokens[j]._totalSupplyUSD /
							pools[i].totalBorrowBalanceUSD <
						0.05
					) {
						_extraTokens[i] += 1;
					}
				}
			}
			setExtraTokens(_extraTokens);
		}
	}, [pools, extraTokens.length]);

	const rowStyle = (poolIndex: number) => {
		return {
			borderColor: "gray.700",
			// backgroundColor: expandedRows[poolIndex] ? 'gray.700' : 'transparent',
		};
	};

	const rowHeadStyle = {
		fontSize: "xs",
		fontFamily: "Poppins",
		color: "gray.500",
		borderColor: "gray.600",
	};

	return (
		<Box>
			{pools.length > 0 ? (
				<>
					{" "}
					<TableContainer>
						<Table overflow={"auto"} variant="simple">
							<Thead>
								<Tr>
									<Th {...rowHeadStyle}>Pool</Th>

									<Th {...rowHeadStyle}>Protocol Debt</Th>
									<Th {...rowHeadStyle}>Liquidity</Th>
									<Th {...rowHeadStyle}>APY ($SYN)</Th>
									<Th {...rowHeadStyle}></Th>
								</Tr>
							</Thead>
							<Tbody>
								{[...pools]
									.slice(
										(currentPage - 1) * 8,
										currentPage * 8
									)
									.map((pool: any, poolIndex: number) => {
										return (
											<Tr key={poolIndex}>
												<Td
													{...rowStyle(poolIndex)}
													// {...expandOnClick(poolIndex)}
													mt={
														poolIndex == 0
															? 20
															: 0
													}
												>
													<Flex
														align={"center"}
														gap={2}
													>
														<Box>
															<Text
																fontSize="lg"
																fontWeight="bold"
																textAlign="left"
															>
																{pool.name}
															</Text>
															<Text
																fontSize="xs"
																fontWeight="light"
																textAlign="left"
																mt={1}
															>
																{
																	pool
																		.inputToken
																		.symbol
																}
															</Text>
														</Box>
													</Flex>
													<AvatarGroup
														size="md"
														max={7}
														mt={5}
														colorScheme="pink"
														fontSize={"sm"}
													>
														{pool._mintedTokens.map(
															(
																token: any,
																index: number
															) => (
																<Avatar
																	bg={
																		"gray.600"
																	}
																	borderColor={
																		"transparent"
																	}
																	key={
																		index
																	}
																	name={
																		token.name
																	}
																	src={`https://raw.githubusercontent.com/synthe-x/assets/main/${token.symbol?.toUpperCase()}.png`}
																/>
															)
														)}
													</AvatarGroup>
												</Td>
												<Td
													{...rowStyle(poolIndex)}
													// {...expandOnClick(poolIndex)}
												>
													<Box>
														<Text
															fontSize="sm"
															textAlign={
																"left"
															}
														>
															{isConnected ||
															isEvmConnected
																? dollarFormatter.format(
																		pool.balance /
																			1e18
																	)
																: "-"}{" "}
															{pool["symbol"]}
														</Text>
													</Box>
												</Td>
												<Td
													{...rowStyle(poolIndex)}
													// {...expandOnClick(poolIndex)}
												>
													<Text fontSize={"sm"}>
														{dollarFormatter.format(
															pool.totalBorrowBalanceUSD
														)}
													</Text>
												</Td>
												<Td
													{...rowStyle(poolIndex)}
													// {...expandOnClick(poolIndex)}
												>
													<Text
														fontSize="sm"
														// fontWeight="bold"
														textAlign={"left"}
													>
														{tokenFormatter.format(
															(100 *
																((0.01 *
																	3600 *
																	24 *
																	365 *
																	pool._rewardSpeed) /
																	1e18)) /
																pool.totalBorrowBalanceUSD
														)}{" "}
														%
													</Text>
												</Td>
												<Td
													isNumeric
													{...rowStyle(poolIndex)}
												>
													<Flex
														alignItems={"end"}
														justify="end"
														gap={2}
													>
														<IssueModel
															asset={pool}
															handleIssue={
																handleIssue
															}
														/>
														<RepayModel
															asset={pool}
															handleRepay={
																handleRepay
															}
														/>
													</Flex>
												</Td>
											</Tr>
										);
									})}
							</Tbody>
						</Table>
					</TableContainer>
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
													? "black"
													: "#171717"
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
				</>
			) : (
				<Skeleton
					color={"gray"}
					bgColor={"gray"}
					rounded={"10"}
				></Skeleton>
			)}
		</Box>
	);
};

export default IssuanceTable;
