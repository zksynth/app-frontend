import {
	Box,
	Flex,
	Text,
	Tooltip,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import Big from "big.js";
import DepositModal from "../modals/Deposit";
import WithdrawModal from "../modals/Withdraw";

export default function MainPanel({ handleChange }: any) {
	const {
		totalDebt,
		safeCRatio,
		adjustedCollateral,
		adjustedDebt,
		dollarFormatter,
	} = useContext(AppDataContext);

	const {
		totalCollateral,
		updateCollateralWalletBalance,
		updateCollateralAmount,
	} = useContext(AppDataContext);

	const handleDeposit = (collateral: string, value: string) => {
		updateCollateralWalletBalance(collateral, value, true);
		updateCollateralAmount(collateral, value, false);
		handleChange();
	};

	const handleWithdraw = (collateral: string, value: string) => {
		updateCollateralWalletBalance(collateral, value, false);
		updateCollateralAmount(collateral, value, true);
		handleChange();
	};

	return (
		<Flex justify="space-between" px={"30px"} py="22px" height={"100%"}>
			<Flex
				flexDir={"column"}
				justify={"center"}
				align='center'
				width={"33%"}
				textAlign="center"
			>
				<Box>
					<Text fontWeight={'bold'} fontSize="md" color="gray.400">
						Supply Balance
					</Text>
					<Text fontSize={"3xl"} fontWeight="bold">
						{dollarFormatter?.format(totalCollateral)}
					</Text>
				</Box>
				<Flex mt={2} justify='center' gap={2}>
					<DepositModal handleDeposit={handleDeposit} />
					<WithdrawModal handleWithdraw={handleWithdraw}/>
				</Flex>
			</Flex>

			<Flex
				w={"33%"}
				flexDir={"column"}
				justify="center"
				align={"center"}
				textAlign={"center"}
			>
				<Flex
					textAlign="center"
					flexDir={"column"}
					justify="center"
					align={"center"}
					border={"4px"}
					borderColor={ (adjustedCollateral / adjustedDebt > 3 || isNaN(adjustedCollateral / adjustedDebt)) ? "primary" : adjustedCollateral / adjustedDebt > 2 ? "orange.200" : "red.200"}
					shadow={(adjustedCollateral / adjustedDebt > 3 || isNaN(adjustedCollateral / adjustedDebt)) ? "0 0 8px 10px rgba(62, 230, 196, 0.1)" : adjustedCollateral / adjustedDebt > 2 ? "0 0 8px 10px rgba(200, 200, 0, 0.1)" : "0 0 8px 10px rgba(255, 0, 0, 0.1)"}
					_hover={{
						shadow: (adjustedCollateral / adjustedDebt > 3 || isNaN(adjustedCollateral / adjustedDebt)) ? "0 0 12px 12px rgba(62, 230, 196, 0.2)" : adjustedCollateral / adjustedDebt > 2 ? "0 0 12px 12px rgba(200, 200, 0, 0.2)" : "0 0 8px 10px rgba(255, 0, 0, 0.1)" // "0 0 12px 12px rgba(62, 230, 196, 0.2)",
					}}
					rounded="full"
					minH={"200px"}
					maxW={"200px"}
					w={"100%"}
				>
					<Box>
						<Text fontSize={"sm"} color="gray.400">
							Health
						</Text>
						<Text fontSize={"2xl"} fontWeight="bold">
							{
								adjustedCollateral > 0
									? (100 * adjustedCollateral / adjustedDebt).toFixed(0)
									: Infinity
							} %
						</Text>
					</Box>

					<Flex justify={"start"} align={"center"} mt={4}>
						<Tooltip
								fontSize={"xs"}
								label={
									<>
										{`You are allowed to issue only till your health factor reaches ${safeCRatio*100}% and will be liquidated if it falls below 100%`}
									</>
								}
							>
								
						<Box>
							<Text fontSize={"xs"} color="gray.400">
								Safe {">"} {safeCRatio*100}%
							</Text>
							<Text fontSize={"xs"} color="gray.400">
								Min 100%
							</Text>
						</Box>
						</Tooltip>

					</Flex>
				</Flex>
			</Flex>

			<Flex
				flexDir={"column"}
				justify={"center"}
				gap={10}
				width={"33%"}
				textAlign={"center"}
			>
				<Box>
					<Text fontWeight={'bold'} fontSize="md" color="gray.400">
						Borrow Balance
					</Text>
					<Text fontSize={"3xl"} fontWeight="bold">
						{dollarFormatter?.format(totalDebt)}
					</Text>

					<Text fontWeight={'medium'} mt={2} color="gray.400" fontSize={"sm"}>Available to Borrow</Text>
					<Text fontWeight={'medium'} color="gray.200" fontSize={"xl"}>
						{dollarFormatter?.format(
							Big(
								Big(adjustedCollateral)
									.div(safeCRatio)
									.minus(adjustedDebt)
							).toNumber()
						)}
					</Text>
				</Box>

			</Flex>
		</Flex>
	);
}
