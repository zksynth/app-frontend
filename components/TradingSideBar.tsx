import {
	Box,
	Text,
	Flex,
	Divider,
	useColorMode,
	Progress,
	Input,
	Select,
	Button,
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
import { useContext, useState } from "react";
import { WalletContext } from "./context/WalletContextProvider";
import { AppDataContext } from "./context/AppDataProvider";
import { tokenFormatter } from '../src/const';
import { theme } from '../styles/theme';

function ExchangeSideBar({}) {
	const [nullValue, setNullValue] = useState(false);

	const { isConnected, isConnecting, address, connect } =
		useContext(WalletContext);

	const {
		synths,
		totalDebt,
		isDataReady,
		tradingPool,
		setTradingPool,
		pools,
		tradingBalanceOf,
	} = useContext(AppDataContext);

	const updatePoolIndex = (e: any) => {
		setTradingPool(e.target.value);
	};

	const getSynth = (address: string) => {
		return synths.find((s: any) => s.id === address);
	};

	const handleUpdate = () => {
		setNullValue(!nullValue);
	};

	return (
		<>
			<Text
				mb={2}
				mt={6}
				fontSize={"xs"}
				fontWeight="bold"
				ml={1}
			>
				CHOOSE A POOL
			</Text>
			<Select mb={10} onChange={updatePoolIndex} value={tradingPool}>
				{pools.map((pool: any, index: number) => {
					return (
						<option key={pool?.symbol} value={index} >
							<Text>{pool?.name}</Text>
						</option>
					);
				})}
			</Select>

			<TableContainer rounded={6} color={"white"}>
				<Table variant="simple" size="sm">
					<Thead>
						<Tr>
							<Th color="gray.400" borderColor={"gray.700"}>
								Asset
							</Th>
							<Th color="gray.400" borderColor={"gray.700"} isNumeric>
								Balance
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{pools[tradingPool] && (
							<>
								{pools[tradingPool]._mintedTokens.map(
									(_synth: any, index: number) => {
										return (
											<Tr key={index}>
												<Td borderColor={"gray.700"} py={1}>
													<Flex
														align={"center"}
														gap={"1"}
														ml={-1}
													>
														<Image
															src={
																"/icons/" +
																_synth.symbol?.toUpperCase() +
																".png"
															}
															height={'30px'}
															width={'30px'}
															style={{minWidth: '30px', minHeight: '30px'}}
															alt={_synth.symbol}
														/>
														{_synth.name}
													</Flex>
												</Td>
												<Td borderColor={"gray.700"} isNumeric>
													{_synth.balance ? tokenFormatter.format(
														
															_synth.balance
														 /
														10 **
															(_synth.decimal ??
																18)
													) : '-'}{" "}
													{_synth.symbol}
												</Td>
												
											</Tr>
										);
									}
								)}
							</>
						)}
					</Tbody>
				</Table>
			</TableContainer>
		</>
	);
}

export default ExchangeSideBar;
