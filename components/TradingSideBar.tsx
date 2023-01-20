import {
	Box,
	Text,
	Flex,
	Select,
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
import { AppDataContext } from "./context/AppDataProvider";
import { tokenFormatter } from '../src/const';

function ExchangeSideBar({}) {

	const {
		tradingPool,
		setTradingPool,
		pools
	} = useContext(AppDataContext);

	const updatePoolIndex = (e: any) => {
		setTradingPool(e.target.value);
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
				<Table variant="simple" size="sm" >
					<Thead>
						<Tr>
							<Th color="gray.400" borderColor={"gray.700"} px={2}>
								Asset
							</Th>
							<Th color="gray.400" borderColor={"gray.700"} px={2} isNumeric>
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
												<Td borderColor={"gray.700"} py={1} px={2}>
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
															height={'30'}
															width={'30'}
															style={{minWidth: '30px', minHeight: '30px'}}
															alt={_synth.symbol}
														/>
														{_synth.name}
													</Flex>
												</Td>
												<Td borderColor={"gray.700"} px={2} isNumeric>
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
