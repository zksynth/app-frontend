import {
	Box,
	Text,
	Flex,
	Select,
	useDisclosure,
	Button,
	Input,
	Tooltip,
	Divider,
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
import { InfoOutlineIcon, SearchIcon } from "@chakra-ui/icons";
import InfoFooter from "../modals/_utils/InfoFooter";

function TokenSelector({
	onTokenSelected,
	onPoolChange,
	isOpen,
	onOpen,
	onClose,
}: any) {
	const { tradingPool, setTradingPool, pools } = useContext(AppDataContext);

	const [searchPools, setSearchPools] = useState<any[]>([]);

	const selectToken = (tokenIndex: number) => {
		onTokenSelected(tokenIndex);
	};

	const searchToken = (searchTerm: string) => {
		// search token from all pool _mintedTokens
		const _pools = [...pools];
		const _searchedTokens = [];
		for (let i in _pools) {
			const _mintedTokens = _pools[i]._mintedTokens;
			const _seachedPool: any = { ..._pools[i] };
			_seachedPool._mintedTokens = [];
			for (let j in _mintedTokens) {
				const _token = _mintedTokens[j];
				if (
					_token.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					_token.symbol
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
				) {
					_seachedPool._mintedTokens.push({
						..._token,
						poolIndex: i,
						tokenIndex: j,
					});
				}
			}
			_searchedTokens.push(_seachedPool);
		}
		setSearchPools(_searchedTokens);
	};

	useEffect(() => {
		if (pools.length > 0 && searchPools.length == 0) {
			searchToken("");
		}
	}, [searchToken]);

	if(!pools[tradingPool]) return <></>

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				scrollBehavior={"inside"}
				isCentered
				
			>
				<ModalOverlay backdropFilter="blur(30px)" />
				<ModalContent maxH={"500px"} bg='gray.700' rounded={16}>
					<ModalHeader>Select a token</ModalHeader>
					<Box mx={5} mb={5}>
					<Select rounded={'full'} placeholder="Select debt pool" value={tradingPool} onChange={(e) => setTradingPool(parseInt(e.target.value))} bg='gray.800' variant={'filled'}  _focus={{bg: 'gray.800'}} focusBorderColor='transparent'>
							{pools.map((pool: any, index: number) => (
								<option value={index} key={pool.id}>
									{pool.name}
								</option>
							))}
						</Select>
						</Box>
						{/* <Divider/> */}
					<ModalCloseButton rounded={'full'} mt={1} />
					<ModalBody  bg='gray.800'>

						{/* Token List */}
						<Box mx={-6} >
						{pools[tradingPool]._mintedTokens.map(
							(_synth: any, tokenIndex: number) => (
								<Flex
									key={tokenIndex}
									justify="space-between"
									align={"center"}
									py={2}
									px={6}
									_hover={{
										bg: "gray.700",
										cursor: "pointer",
									}}
									onClick={() =>
										selectToken(
											tokenIndex
										)
									}
								>
									<Box
										borderColor={"gray.700"}
									>
										<Flex
											align={"center"}
											gap={"1"}
											ml={-1}
										>
											<Image
												src={
													"/icons/" +
													_synth.symbol +
													".svg"
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
										<Text fontSize={'xs'} color={"gray.500"}>Balance</Text>
										<Text
											
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
					</ModalBody>
					<Flex rounded={16} bg='gray.700' color={'gray.400'} align={'center'} px={6} gap={2} my={2}>
						<InfoOutlineIcon width={3}/>
						<Text fontSize={'xs'}>Atomic (or) Cross-pool asset swaps are not yet supported</Text>
					</Flex>
				</ModalContent>
			</Modal>
		</>
	);
}

export default TokenSelector;
