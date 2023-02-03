import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Select,
	Flex,
	Input,
	Progress,
} from "@chakra-ui/react";

const Big = require("big.js");
import Image from "next/image";
import { useEffect, useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { SearchIcon } from "@chakra-ui/icons";
import { tokenFormatter, dollarFormatter } from '../../../src/const';

const SelectAsset = ({ setAmount, setSelectedAsset }: any) => {
	const { collaterals } = useContext(AppDataContext);

	const updateAsset = (e: number) => {
		setSelectedAsset(e);
		setAmount(0);
	};

	const [filtered, setFiltered] = useState(false);
	const [filteredCollaterals, setFilteredCollaterals] = useState<any>([]);

	useEffect(() => {
		// filter collaterals whose balance is 0
		if(!filtered){
			if(collaterals.length === 0) return;
			if(collaterals[0].balance === undefined) return;
			// sort collaterals by balance
			const _collaterals = collaterals.sort((a: any, b: any) => {
				return b.balance * b.inputTokenPriceUSD - a.balance * a.inputTokenPriceUSD;
			});
			setFilteredCollaterals(_collaterals);
			setFiltered(true);
		}
	})

	return (
		<Box>
			{filtered && (filteredCollaterals.length === 0 ? <>No collateral deposited</> : filteredCollaterals.map((collateral: any, index: number) => {
				return (
					<Box
						key={index}
						_hover={{
							bg: "gray.600",
							cursor: "pointer",
						}}
						mx={-6}
						px={6}
						py={4}
						bg="gray.700"
						my={'2px'}
						onClick={() => updateAsset(index)}
					>
						<Flex justify="space-between" align={"center"}>
							<Box borderColor={"gray.700"}>
								<Flex align={"center"} gap={"2"} ml={-1}>
									<Image
										src={
											"/icons/" +
											collateral.inputToken.symbol.toUpperCase() +
											".svg"
										}
										height={35}
										width={35}
										alt={collateral.inputToken.symbol}
									/>

									<Box>
										<Text>
											{collateral.inputToken.symbol}
										</Text>

										<Text
											color={"gray.500"}
											fontSize={"sm"}
										>
											{collateral.name}
										</Text>
									</Box>
								</Flex>
							</Box>

							<Box
								borderColor={"gray.700"}
								px={2}
								textAlign="right"
							>
								<Text color={'gray.500'} fontSize={"xs"}>Balance</Text>
								<Text fontSize={"xs"}>
									{tokenFormatter.format(Big(collateral.balance ?? 0).div(1e18).toNumber())} {collateral.inputToken.symbol}{" "}({dollarFormatter.format(Big(collateral.balance * collateral.inputTokenPriceUSD).div(1e18).toNumber())})
								</Text>
								
							</Box>
						</Flex>
					</Box>
				);
			}))}

		</Box>
	);
};

export default SelectAsset;
