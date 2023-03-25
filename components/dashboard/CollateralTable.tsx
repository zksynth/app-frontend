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
	TableContainer,
	Box,
	Skeleton,
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";

import CollateralModal from "../modals/collateral";

export default function CollateralTable() {
	const { pools, tradingPool } = useContext(AppDataContext);

	return (
		<>
			{pools[tradingPool]?.collaterals.length > 0 ? (
					<TableContainer rounded={10} pt={1}>
						<Table variant="simple">
							<Thead>
								<Tr>
									<Th color={"whiteAlpha.800"}>Collateral</Th>
									<Th color={"whiteAlpha.800"} isNumeric>
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
					<Skeleton height="50px" m={6} mt={8} rounded={12} />
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
