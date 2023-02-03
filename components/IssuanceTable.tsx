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
	Button,
} from "@chakra-ui/react";

import IssueModel from "./modals/Issue";
import RepayModel from "./modals/Repay";
import {
	MdNavigateBefore,
	MdNavigateNext,
} from "react-icons/md";

import {
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	PopoverAnchor,
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
import { AppDataContext } from "./context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { useEffect } from "react";
import { InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { dollarFormatter } from "../src/const";

const IssuanceTable = ({ handleChange }: any) => {
	const [nullValue, setNullValue] = useState(false);
	const { currentPage, setCurrentPage, pagesCount, pages, pageSize } =
		usePagination({
			pagesCount: 1,
			initialState: { currentPage: 1 },
		});
	const [extraTokens, setExtraTokens] = useState<any>([]);
	const { chain: activeChain } = useNetwork();

	const {
		address: evmAddress,
		isConnected: isEvmConnected,
		isConnecting: isEvmConnecting,
	} = useAccount();

	const {
		synths: debts,
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
			// borderColor: "transparent",
			// borderBottom: "4px",
			// mb: "20px",
			// bg: "gray.700",
			py: "7",
			px: "7",

		};
	};

	const rowHeadStyle = {
		fontSize: "11px",
		fontFamily: "Poppins",
		color: "gray.400",
		// borderColor: "transparent",
		borderColor: "gray.700",
		px: "7"
	};

	return (
		<Box >
			{pools.length > 0 ? (
				<>
					<TableContainer mt={2}>
						<Table overflow={"auto"}>
							<Thead>
								<Tr>
									<Th {...rowHeadStyle}>Debt Pool</Th>
									<Th {...rowHeadStyle}>Protocol Debt</Th>
									<Th {...rowHeadStyle}>Liquidity</Th>
									<Th {...rowHeadStyle} isNumeric>APY</Th>
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
										let totalAPY = 0;
										for (let i in pool.rewardTokens) {
											totalAPY += Number(
												pool.rewardTokenEmissionsUSD[i]
											);
										}
										totalAPY += Number(
											pool.avgDailySupplySideRevenueUSD ?? 0
										);
										totalAPY =
											(totalAPY /
												pool.totalBorrowBalanceUSD) *
											365 *
											100;
										return (
											<Tr key={poolIndex}>
												<Td {...rowStyle(poolIndex)} roundedLeft={'xl'}>
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
																{pool.name} ({pool.inputToken.symbol})
															</Text>
															{/* <Text
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
															</Text> */}
														</Box>
													</Flex>
													<AvatarGroup
														size="lg"
														// max={10}
														mt={5}
														spacing={-5}
														variant='unstyled'
														colorScheme='primarySchema'
														bg={'transparent'}
													>
														{pool._mintedTokens.map(
															(
																token: any,
																index: number
															) => (
																
																<TooltipAvatar
																	bg={'transparent'}
																	key={index}
																	name={
																		token.name.split(" ").splice(2).join(" ")+ " (" + token.symbol+")"
																	}
																	src={`/icons/${token.symbol}.svg`}
																	borderColor='transparent'
																	iconLabel="aa"
																	mx={-2}
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
													<Flex gap={2} justify='end' align={'center'}>
														<Text fontSize='sm'>
															{" "}
															{totalAPY.toFixed(
																2
															)}
															%{" "}
														</Text>

														<Popover trigger="hover" >
															<PopoverTrigger >
																<InfoOutlineIcon color={'gray.400'} cursor={'help'}/>
															</PopoverTrigger>
															<PopoverContent shadow={'2xl'} maxW={'200px'} borderColor='transparent'>
																<PopoverArrow />
																<PopoverHeader
																	bg={
																		"gray.600"
																	}
																	roundedTop={5}
																>
																	<Text
																		fontSize={
																			"xs"
																		}
																	>
																		Total
																		APR
																	</Text>
																	<Text fontWeight={'medium'}>
																		{totalAPY.toFixed(
																			2
																		)}{" "}
																		%
																	</Text>
																</PopoverHeader>
																<PopoverBody bg={"gray.700"} roundedBottom={5}>
																	<Flex
																		gap={1}
																		align="center"
																	>
																		<Text
																			fontSize="sm"
																			textAlign={
																				"left"
																			}
																		>
																			{(
																				(100 *
																					(pool.avgDailySupplySideRevenueUSD *
																						365)) /
																				pool.totalBorrowBalanceUSD
																			).toFixed(
																				2
																			)}{" "}
																			%{" "}
																		</Text>
																		<Text
																			fontSize={
																				"xs"
																			}
																			color="gray.400"
																		>
																			Swap
																			/
																			Mint
																			Fees
																		</Text>
																	</Flex>
																	{pool.rewardTokens.map(
																		(
																			token: any,
																			index: number
																		) => (
																			<Flex
																				key={
																					index
																				}
																				gap={
																					1
																				}
																				align="center"
																				my={
																					1
																				}
																			>
																				<Text
																					fontSize="sm"
																					textAlign={
																						"left"
																					}
																				>
																					{(
																						(100 *
																							(pool
																								.rewardTokenEmissionsUSD[
																								index
																							] *
																								365)) /
																						pool.totalBorrowBalanceUSD
																					).toFixed(
																						2
																					)}{" "}
																					%{" "}
																				</Text>
																				<Text
																					fontSize={
																						"xs"
																					}
																					color="gray.400"
																				>
																					{
																						token
																							.token
																							.symbol
																					}{" "}
																					Rewards
																				</Text>
																			</Flex>
																		)
																	)}
																</PopoverBody>
															</PopoverContent>
														</Popover>
													</Flex>
												</Td>
												<Td
													isNumeric
													{...rowStyle(poolIndex)}
													roundedRight="xl"
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

const TooltipAvatar: typeof Avatar = (props: any) => (
	<Tooltip label={props.name} >
	  <Avatar {...props} cursor='help'/>
	</Tooltip>
  );

export default IssuanceTable;
