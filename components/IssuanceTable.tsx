import React, { useContext, useState } from "react";
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Box,
	Text,
	Flex,
	Skeleton,
	AvatarGroup,
	Avatar,
	Tooltip,
} from "@chakra-ui/react";

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
import { useAccount, useNetwork } from "wagmi";
import { useEffect } from "react";

const IssuanceTable = ({ handleChange }: any) => {
	const [nullValue, setNullValue] = useState(false);
	const { currentPage, setCurrentPage, pagesCount, pages, pageSize } =
		usePagination({
			pagesCount: 1,
			initialState: { currentPage: 1 },
		});
	const [extraTokens, setExtraTokens] = useState<any>([]);

	const { isConnected } = useContext(WalletContext);
	const { chain: activeChain } = useNetwork();

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
			borderColor: "gray.800",
			borderBottom: "4px",
			bg: "gray.700",
			px: "7",
			py: "8",
		};
	};

	const rowHeadStyle = {
		fontSize: "xs",
		fontFamily: "Poppins",
		color: "gray.500",
		borderColor: "transparent",
		px: "7",
	};

	return (
		<Box mx={-4}>
			{pools.length > 0 ? (
				<>
					{" "}
					<TableContainer>
						<Table overflow={"auto"} variant="simple">
							<Thead>
								<Tr>
									<Th {...rowHeadStyle}>Debt Pool</Th>
									<Th {...rowHeadStyle}>Protocol Debt</Th>
									<Th {...rowHeadStyle}>Liquidity</Th>
									<Th {...rowHeadStyle}>% APY</Th>
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
												<Td {...rowStyle(poolIndex)}>
													<Flex
														align={"center"}
														gap={2}
													>
														<Box>
															<Text
																fontSize="xl"
																fontWeight="bold"
																textAlign="left"
															>
																{pool.name}
															</Text>
															<Text
																fontSize="xs"
																fontWeight="light"
																textAlign="left"
																mt={2}
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
																	key={index}
																	name={
																		token.name
																	}
																	src={`/icons/${token.symbol?.toUpperCase()}.png`}
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
															textAlign={"left"}
														>
															{isEvmConnected &&
															!activeChain?.unsupported
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
													{pool.rewardTokens.map(
														(
															token: any,
															index: number
														) => (
															<>
																<Text
																	fontSize="sm"
																	textAlign={
																		"left"
																	}
																>

																	{(pool.rewardTokenEmissionsUSD * 365 /pool.totalBorrowBalanceUSD).toFixed(2)} % {token.token.symbol}
																</Text>
															</>
														)
													)}
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
													? "gray.700"
													: "gray.800"
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
				<Box h={"422px"} px={4}>
					<Flex justify={"space-between"} mt={2}>
						<Skeleton
							height={"30px"}
							width={"25%"}
							rounded={"10"}
						></Skeleton>

						<Skeleton
							height={"30px"}
							width={"25%"}
							rounded={"10"}
						></Skeleton>

						<Skeleton
							color={"gray"}
							bgColor={"gray"}
							height={"30px"}
							width={"25%"}
							rounded={"10"}
						></Skeleton>
					</Flex>

					<Skeleton
						mt={10}
						color={"gray"}
						bgColor={"gray"}
						height={"60px"}
						width={"100%"}
						rounded={"10"}
					></Skeleton>

					<Skeleton
						mt={10}
						color={"gray"}
						bgColor={"gray"}
						height={"60px"}
						width={"100%"}
						rounded={"10"}
					></Skeleton>

					<Skeleton
						mt={10}
						color={"gray"}
						bgColor={"gray"}
						height={"60px"}
						width={"100%"}
						rounded={"10"}
					></Skeleton>

					<Skeleton
						mt={10}
						color={"gray"}
						bgColor={"gray"}
						height={"30px"}
						width={"100%"}
						rounded={"10"}
					></Skeleton>
				</Box>
			)}
		</Box>
	);
};

export default IssuanceTable;
