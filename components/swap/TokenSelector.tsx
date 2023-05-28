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
	Image
} from "@chakra-ui/react";

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
				<ModalOverlay bg="blackAlpha.600" backdropFilter="blur(30px)" />
				<ModalContent maxH={"600px"} bgColor="white" rounded={16} border='2px' mx={2} borderColor={'whiteAlpha.500'}>
					<ModalHeader>Select a token</ModalHeader>
					<Box mx={5} mb={5}>
					<Select rounded={'full'} placeholder="Select debt pool" value={tradingPool} onChange={(e) => {
						if(e.target.value !== ''){
							setTradingPool(Number(e.target.value))
							localStorage.setItem("tradingPool", e.target.value);
						}}} bg='blackAlpha.200' variant={'filled'}  _focus={{bg: 'blackAlpha.300'}} focusBorderColor='transparent'>
							{pools.map((pool: any, index: number) => (
								<option value={index} key={pool.id}>
									{pool.name}
								</option>
							))}
						</Select>
						</Box>
						{/* <Divider/> */}
					<ModalCloseButton rounded={'full'} mt={1} />
					<ModalBody bgColor="whiteAlpha.400">

						{/* Token List */}
						<Box mx={-6} mt={-2}>
						{pools[tradingPool].synths.map(
							(_synth: any, tokenIndex: number) => (
								<Box key={tokenIndex}>
								<Divider/>
								<Flex
									
									justify="space-between"
									align={"center"}
									py={3}
									px={6}
									_hover={{
										bg: "blackAlpha.50",
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
											gap={"2"}
											ml={-1}
										>
											<Image
												src={
													"/icons/" +
													_synth.token.symbol +
													".svg"
												}
												height={'40px'}
												alt={_synth.token.symbol}
											/>

											<Box>
												<Text>
													{_synth.token.symbol}
												</Text>

												<Text
													color={
														"gray.500"
													}
													fontSize={"sm"}
												>
													{_synth.token.name.split(" ").slice(1, -2).join(" ")}
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
											fontSize={"md"}
										>
											{_synth.walletBalance
												? tokenFormatter.format(
														_synth.walletBalance /
															10 ** 18
													)
												: "-"}{" "}
										</Text>
									</Box>
								</Flex>
								</Box>
							)
						)}
						</Box>
					</ModalBody>
					{/* <Flex rounded={16} bg='gray.700' color={'gray.400'} align={'center'} px={6} gap={2} my={2}>
						<InfoOutlineIcon width={3}/>
						<Text fontSize={'xs'}>Atomic (or) Cross-pool asset swaps are not yet supported</Text>
					</Flex> */}
					<Flex roundedBottom={16} py={1} justify='space-between' px={4} fontSize='sm' >
						<Text>{pools[tradingPool].synths.length} Tokens</Text>
						<Text>SyntheX</Text>
						
					</Flex>
				</ModalContent>
			</Modal>
		</>
	);
}

export default TokenSelector;
