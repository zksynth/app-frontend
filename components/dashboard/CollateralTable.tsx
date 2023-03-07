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
	Skeleton,
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";
import { preciseTokenFormatter, tokenFormatter } from "../../src/const";
import Big from "big.js";
import { motion } from "framer-motion";

import CollateralModal from "../modals/collateral";

export default function CollateralTable() {
	const { pools, tradingPool } = useContext(AppDataContext);

	return (
		<>
			{pools[tradingPool]?.collaterals.length > 0 ? (
					<TableContainer bg={"gray.800"} rounded={10} pt={1}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<Th color={"gray.500"}>Collateral</Th>
									<Th color={"gray.500"} isNumeric>
										Balance
									</Th>
								</Tr>
							</Thead>
							<Tbody>
								{pools[tradingPool]?.collaterals.map(
									(collateral: any, index: number) => (
										<CollateralModal
											key={index}
											collateral={collateral}
											tradingPool={tradingPool}
										/>
									)
								)}
							</Tbody>
						</Table>
					</TableContainer>
			) : (
				<Box pt={0.5}>
					<Skeleton height="50px" m={6} mt={10} rounded={12} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
				</Box>
			)}
		</>
	);
}
