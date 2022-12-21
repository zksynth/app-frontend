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
import { getContract, call } from "../src/contract";

const IssuanceTable = ({ handleChange }: any) => {
	const [nullValue, setNullValue] = useState(false);
	const { currentPage, setCurrentPage, pagesCount, pages, pageSize } =
		usePagination({
			pagesCount: 2,
			initialState: { currentPage: 1 },
		});
	const [extraTokens, setExtraTokens] = useState<any>([]);
	const [synAccrued, setSynAccrued] = useState<any>(null);

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

	return (
		<Box minH="575px">
			{pools.length > 0 ? (
				<>
					{" "}
					<TableContainer>
						<Table overflow={"auto"} variant="simple">
							<Thead>
								<Tr>
									<Th
										fontSize={"xs"}
										fontFamily="Poppins"
										color={"gray.500"}
										borderColor={"#3C3C3C"}
									>
										Pool
									</Th>

									<Th
										fontSize={"xs"}
										fontFamily="Poppins"
										color={"gray.500"}
										borderColor={"#3C3C3C"}
									>
										Protocol Debt
									</Th>
									<Th
										fontSize={"xs"}
										fontFamily="Poppins"
										color={"gray.500"}
										borderColor={"#3C3C3C"}
									>
										Liquidity
									</Th>
									<Th
										fontSize={"xs"}
										fontFamily="Poppins"
										color={"gray.500"}
										borderColor={"#3C3C3C"}
									>
										Rewards
									</Th>
									<Th
										borderColor={"#3C3C3C"}
										isNumeric
										fontSize={"xs"}
										fontFamily="Poppins"
										color={"gray.500"}
									></Th>
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
											<>
												<Tr >
													<Td
														borderColor={
															"transparent"
														}
													>
														<Flex
															align={"center"}
															gap={2}
														>
															{/* <Image
												src={`/${debt.symbol}.png`}
												width={35}
												height={35}
												// style={tknholdingImg}
												alt="..."
											/> */}
															<Box>
																<Text
																	fontSize="lg"
																	fontWeight="bold"
																	textAlign={
																		"left"
																	}
																>
																	{
																		pool[
																			"name"
																		]
																	}
																</Text>
																<Text
																	fontSize="xs"
																	fontWeight="light"
																	textAlign={
																		"left"
																	}
																>
																	{
																		pool[
																			"symbol"
																		]
																	}
																</Text>
															</Box>
														</Flex>
													</Td>

													<Td
														maxW={"110px"}
														borderColor={
															"transparent"
														}
													>
														<Box>
															<Text
																fontSize="sm"
																// fontWeight="bold"
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
														borderColor={
															"transparent"
														}
													>
														<Text fontSize={"sm"}>
															{dollarFormatter.format(
																pool.totalBorrowBalanceUSD
															)}
														</Text>
													</Td>
													<Td
														borderColor={
															"transparent"
														}
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
														borderColor={
															"transparent"
														}
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

												<Tr >
													<Td pb={6}
														borderColor={"#3C3C3C"}
														colSpan={5}
													>
														<Flex align="center">
															{pool._mintedTokens.map(
																(
																	token: any,
																	index: number
																) => (
																	<>
																		<Box
																			w={
																				(token._totalSupplyUSD /
																					pool.totalBorrowBalanceUSD) *
																					100 +
																				"%"
																			}
																		>
																			<Box minH="40px" mb={2}>
																				<Flex
																					align={
																						"center"
																					}
																					gap={
																						1
																					}
																					display={
																						token._totalSupplyUSD /
																							pool.totalBorrowBalanceUSD >
																						0.05
																							? "flex"
																							: "none"
																					}
																				>
																					{
																						<Image
																							src={`/icons/${token.symbol}.png`}
																							height={
																								"40px"
																							}
																							width={
																								"40px"
																							}
																							alt=""
																						/>
																					}

																					<Text
																						fontSize={
																							"xs"
																						}
																						my={
																							1
																						}
																					>
																						{
																							token.symbol
																						}
																					</Text>
																				</Flex>
																			</Box>
																			<Box
																				h={
																					"8px"
																				}
																				bgColor={
																					TOKEN_COLORS[
																						token
																							.symbol
																					]
																				}
																				mt={
																					"0px"
																				}
																			></Box>
																		</Box>
																	</>
																)
															)}
															<Text
																fontSize={"sm"}
																ml={6}
															>
																+{" "}
																{
																	extraTokens[
																		poolIndex
																	]
																}{" "}
																more...
															</Text>
														</Flex>
													</Td>
												</Tr>
											</>
										);
									})}
							</Tbody>
						</Table>
					</TableContainer>
					{/* <Flex justify={'center'}>
			<Pagination
				pagesCount={pagesCount}
				currentPage={currentPage}
				onPageChange={setCurrentPage}>
				<PaginationContainer my={4}>
					<PaginationPrevious variant={'none'}>
						<MdNavigateBefore />
					</PaginationPrevious>
					<PaginationPageGroup>
						{pages.map((page: number) => (
							<PaginationPage
								key={`pagination_page_${page}`}
								page={page}
								width={10}
								rounded={'full'}
								bgColor={page === currentPage ? 'black' : '#171717'}
								_hover={{bgColor: 'gray.700'}}
							/>
						))}
					</PaginationPageGroup>
					<PaginationNext variant={'none'}>
						{' '}
						<MdNavigateNext />{' '}
					</PaginationNext>
				</PaginationContainer>
			</Pagination>
		</Flex>  */}
				</>
			) : (
				<Skeleton
					colorScheme={"whiteAlpha"}
					minH="530px"
					rounded={"10"}
				></Skeleton>
			)}
		</Box>
	);
};

export default IssuanceTable;
