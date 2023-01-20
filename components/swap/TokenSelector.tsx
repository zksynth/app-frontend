import {
	Box,
	Text,
	Flex,
	Select,
	useDisclosure,
	Button,
	Input,
	Tooltip,
} from "@chakra-ui/react";
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
} from "@chakra-ui/react";
import Image from "next/image";
import { useContext, useState, useEffect } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { tokenFormatter } from "../../src/const";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

function TokenSelector({
	onTokenSelected,
	onPoolChange,
	isOpen,
	onOpen,
	onClose,
}: any) {
	const { tradingPool, setTradingPool, pools } = useContext(AppDataContext);

	const [searchPools, setSearchPools] = useState<any[]>([]);

	const selectToken = (tokenIndex: number, poolIndex: number) => {
		setTradingPool(poolIndex);
		onTokenSelected(tokenIndex);
	};

	useEffect(() => {
		if (pools.length > 0) {
			setSearchPools([...pools]);
		}
	}, [pools]);

	const searchToken = (searchTerm: string) => {
		// search token from all pool _mintedTokens
		console.log('---searchTerm---', searchTerm)
		const _pools = [...pools];
		const _searchedTokens = [];
		for(let i in _pools) {
			const _mintedTokens = _pools[i]._mintedTokens;
			const _seachedPool: any = {..._pools[i]};
			_seachedPool._mintedTokens = []
			for(let j in _mintedTokens){
				const _token = _mintedTokens[j];
				if(
					_token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					_token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
				){
					_seachedPool._mintedTokens.push(_token)
				}
			}
			_searchedTokens.push(_seachedPool)
		}

		setSearchPools(_searchedTokens);
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				scrollBehavior={"inside"}
				isCentered
			>
				<ModalOverlay />
				<ModalContent maxH={"500px"}>
					<ModalHeader>Select a token</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						{/* Search Input */}
						<Box
							borderColor={"gray.700"}
							px={2}
							py={1}
							mb={2}
							rounded={10}
						>
							<Flex align={"center"} gap={4}>
								<SearchIcon />
								<Input
									placeholder={"Search"}
									variant={"unstyled"}
									_focus={{
										outline: "none",
									}}
									onChange={(e) =>
										searchToken(e.target.value)
									}
								/>
							</Flex>
						</Box>

						{/* Token List */}
						{searchPools.map((_pool: any, index: number) => (

							
							<Box key={index} >
								<Flex
									align={"center"}
									bg={"whiteAlpha.200"}
									mx={-6}
									px={6}
									h={6}
									justify="space-between"
									
								>
									<Text fontSize={"sm"}>{_pool.name}</Text>

									<Text fontSize={"sm"}>{tradingPool == index ? <>(Selected)</> : <>(Switch pool)</>}</Text>									
								</Flex>


								<Box
									mx={-6}
									bg={
										tradingPool == index
											? "transparent"
											: "whiteAlpha.50"
									}
								>
									{_pool._mintedTokens.map(
										(_synth: any, tokenIndex: number) => (
											<Flex
												key={index}
												justify="space-between"
												align={"center"}
												py={1}
												px={6}
												_hover={{
													bg: "gray.600",
													cursor: "pointer",
												}}
												onClick={() =>
													selectToken(
														tokenIndex,
														index
													)
												}
											>
												<Box
													borderColor={"gray.700"}
													py={1}
												>
													<Flex
														align={"center"}
														gap={"1"}
														ml={-1}
													>
														<Image
															src={
																"/icons/" +
																_synth.symbol.toUpperCase() +
																".png"
															}
															height={40}
															width={40}
															alt={_synth.symbol}
														/>

														<Box>
															<Text>
																{_synth.symbol}
															</Text>

															<Text
																color={
																	"gray.500"
																}
																fontSize={"sm"}
															>
																{_synth.name}
															</Text>
														</Box>
													</Flex>
												</Box>

												<Box
													borderColor={"gray.700"}
													px={2}
													textAlign="right"
												>
													<Text
														color={"gray.500"}
														fontSize={"sm"}
													>
														{_synth.balance
															? tokenFormatter.format(
																	_synth.balance /
																		10 **
																			(_synth.decimal ??
																				18)
															  )
															: "-"}{" "}
													</Text>
												</Box>
											</Flex>
										)
									)}
								</Box>

							</Box>
						))}
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}

export default TokenSelector;
