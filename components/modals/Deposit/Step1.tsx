import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Select,
	Flex,
	Input,
	Progress,
	IconButton,
} from "@chakra-ui/react";

const Big = require("big.js");
import Image from "next/image";
import { useEffect, useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { compactTokenFormatter, tokenFormatter } from "../../../src/const";
import { MdOpenInNew } from "react-icons/md";
import Link from "next/link";

const SelectAsset = ({ setAmount, setSelectedAsset }: any) => {
	const { collaterals } = useContext(AppDataContext);

	const [lidoCollaterals, setLidoCollaterals] = useState<any>([]);
	const [aaveCollaterals, setAaveCollaterals] = useState<any>([]);
	const [nativeCollaterals, setNativeCollaterals] = useState<any>([]);

	useEffect(() => {
		// filter name containing "Lido" or "Aave"; also include original index in collaterals array
		const _lidoCollaterals = [];
		const _aaveCollaterals = [];
		const _nativeCollaterals = [];
		for (let i in collaterals) {
			const collateral = collaterals[i];
			if (collateral.inputToken.name.includes("Lido")) {
				_lidoCollaterals.push({ ...collateral, index: i });
			} else if (collateral.inputToken.name.includes("Aave")) {
				_aaveCollaterals.push({ ...collateral, index: i });
			} else {
				_nativeCollaterals.push({ ...collateral, index: i });
			}
		}
		setLidoCollaterals(_lidoCollaterals);
		setAaveCollaterals(_aaveCollaterals);
		setNativeCollaterals(_nativeCollaterals);
	}, [collaterals]);

	const updateAsset = (e: number) => {
		setSelectedAsset(e);
		setAmount(0);
	};

	return (
		<Box>
			{nativeCollaterals.map((collateral: any, index: number) => {
				return (
					<CollateralDetails
						collateral={collateral}
						key={index}
						updateAsset={() => updateAsset(collateral.index)}
					/>
				);
			})}

			<Flex
				h={"22px"}
				align="center"
				justify={"space-between"}
				gap={1}
				mx={-6}
				px={6}
			>
				<Text
					bgGradient="linear(to-r, blue.500, pink.500)"
					px={2}
					rounded={10}
					color={"gray.200"}
					fontWeight="medium"
					fontSize={"xs"}
					mr={2}
				>
					AAVE
				</Text>
				<Flex>
					<Link href={"https://aave.com"} target="_blank">
						{" "}
						<MdOpenInNew size={'14'} />{" "}
					</Link>
				</Flex>
			</Flex>
			{aaveCollaterals.map((collateral: any, index: number) => {
				return (
					<CollateralDetails
						collateral={collateral}
						key={index}
						updateAsset={() => updateAsset(collateral.index)}
					/>
				);
			})}

			<Flex
				h={"22px"}
				align="center"
				justify={"space-between"}
				gap={1}
				mx={-6}
				px={6}
			>
				<Text
					bgGradient="linear(to-r, yellow.500, blue.500)"
					px={2}
					rounded={10}
					color={"gray.200"}
					fontWeight="medium"
					fontSize={"xs"}
					mr={2}
				>
					Lido.fi
				</Text>

				<Link href={"https://lido.fi"} target="_blank">
					{" "}
					<MdOpenInNew size={'14'} />{" "}
				</Link>
			</Flex>
			{lidoCollaterals.map((collateral: any, index: number) => {
				return (
					<CollateralDetails
						collateral={collateral}
						key={index}
						updateAsset={() => updateAsset(collateral.index)}
					/>
				);
			})}
		</Box>
	);
};

const CollateralDetails = ({ collateral, updateAsset }: any) => (
	<Box
		_hover={{
			bg: "#353F51",
			cursor: "pointer",
		}}
		mx={-6}
		px={6}
		py={3}
		bg="gray.700"
		my={"2px"}
		onClick={updateAsset}
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
						<Text>{collateral.inputToken.name}</Text>

						<Text color={"gray.500"} fontSize={"sm"}>
							{collateral.inputToken.symbol}
						</Text>
					</Box>
				</Flex>
			</Box>

			<Box borderColor={"gray.700"} px={0} textAlign="right">
				<Text color={"gray.500"} fontSize={"xs"}>
					Balance
				</Text>
				<Text fontSize={"xs"}>
					{tokenFormatter.format(
						Big(collateral.walletBalance ?? 0)
							.div(1e18)
							.toNumber()
					)}{" "}
					{collateral.inputToken.symbol}
				</Text>

				<Text color={"gray.500"} fontSize={"xs"}>
					Max:{" "}
					{collateral.inputTokenPriceUSD > 0
						? compactTokenFormatter.format(
								Big(collateral._capacity)
									.div(
										10 **
											(collateral.inputToken.decimals ??
												18)
									)
									.sub(
										Big(collateral.totalValueLockedUSD).div(
											collateral.inputTokenPriceUSD
										)
									)
									.toFixed(0)
						  )
						: "-"}{" "}
					{collateral.inputToken.symbol}
				</Text>
			</Box>
		</Flex>
	</Box>
);
export default SelectAsset;
