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
	Heading,
	Divider,
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";

import CollateralModal from "../modals/collateral";
import ThBox from "./ThBox";


export default function CollateralTable() {
	const { pools, tradingPool } = useContext(AppDataContext);

	return (
		<Box>
			<Box bg={'blackAlpha.50'} roundedTop={12} px={5} pt={6} pb={6}>
			<Heading size={'md'} color={'primary.400'}>Collaterals</Heading>
			</Box>

			{pools[tradingPool]?.collaterals.length > 0 ? (
					<TableContainer>
						<Table variant="simple">
							<Thead>
								<Tr>
									<ThBox alignBox='left'>
										Asset
									</ThBox>
									<ThBox alignBox='right' isNumeric>
										Balance
									</ThBox>
								</Tr>
							</Thead>
							<Tbody>
								{pools[tradingPool]?.collaterals.map(
									(collateral: any, index: number) => (
										<CollateralModal
											key={index}
											collateral={collateral}
											tradingPool={tradingPool}
											index={index}
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
		</Box>
	);
}
