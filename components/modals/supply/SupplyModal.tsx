import React, { useState } from "react";

import {
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Tr,
	Td,
	Flex,
	Image,
	Text,
	Box,
	Button,
	InputGroup,
	NumberInput,
	NumberInputField,
	Divider,
	useColorMode,
} from "@chakra-ui/react";
import {
	ADDRESS_ZERO,
	NATIVE,
	W_NATIVE,
	dollarFormatter,
} from "../../../src/const";
import Big from "big.js";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { WETH_ADDRESS } from "../../../src/const";
import { useNetwork } from "wagmi";
import { formatInput, parseInput } from "../../utils/number";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import Redeem from "./Redeem";
import Supply from "./Supply";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import { VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";

export default function SupplyModal({
	market,
	amount,
	setAmount,
	onClose
}: any) {
	const [isNative, setIsNative] = useState(false);
	const { chain } = useNetwork();
	const { walletBalances } = useBalanceData();
	const [tabSelected, setTabSelected] = useState(0);
	const [isMax, setIsMax] = useState(false);

	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	
	const router = useRouter();
	const pos = lendingPosition(Number(router.query.market) || 0);

	const _setAmount = (e: string) => {
		e = parseInput(e);
		if(tabSelected == 1){
			const balance = Big(walletBalances[market.outputToken.id] ?? 0).div(10 ** market.outputToken.decimals);
			if(Number(e) > 0 && Big(e).eq(balance)){setIsMax(true)}
			else {setIsMax(false)}
		}
		else {setIsMax(false)}
		setAmount(e);
	};

	const selectTab = (index: number) => {
		_setAmount("0");
		setIsMax(false);
		setTabSelected(index);
	};

	const max = () => {
		if (tabSelected == 0) {
			return Big(
				(isNative
					? walletBalances[ADDRESS_ZERO]
					: walletBalances[market.inputToken.id]) ?? 0
			)
				.div(10 ** market.inputToken.decimals)
				.toFixed(market.inputToken.decimals);
		} else {
            if(!prices[market.inputToken.id]) return "0";
			
			// values in market.inputToken
			const v1 = Big(pos.availableToIssue).div(prices[market.inputToken.id]).mul(100).div(market.maximumLTV);
			const v2 = Big(walletBalances[market.outputToken.id] ?? 0).div(10 ** market.outputToken.decimals);
			// Available to withdraw from pool
			// const v3 = Big(market.totalDepositBalanceUSD).sub(market.totalBorrowBalanceUSD).div(prices[market.inputToken.id]);

			// If not collateral, return all balance
			if(!market.isCollateral){
				return v2.toString();
			}
			// find minimum of (v1, v2, v3)
			let min = v1;
			if(v2.lt(min)) min = v2;
			// if(v3.lt(min)) min = v3;
			if(min.lt(0)) min = Big(0);

			return min.toString();
		}
	};
    
	const { colorMode } = useColorMode();
	
	return (
		<>
			<ModalContent width={"30rem"} bgColor="transparent" shadow={'none'} rounded={0} mx={2}>
			<Box className={`${VARIANT}-${colorMode}-containerBody2`}>
				<ModalCloseButton rounded={"full"} mt={1} />
				<ModalHeader>
					<Flex justify={"center"} gap={2} pt={1} align={"center"}>
						<Image
							src={`/icons/${market.inputToken.symbol}.svg`}
							alt=""
							width={"32px"}
						/>
						<Text>{market.inputToken.symbol}</Text>
					</Flex>
				</ModalHeader>
				<ModalBody m={0} p={0}>
					<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.200'}/>
					<Box bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'} pb={12} pt={4} px={8}>
						{market.inputToken.id ==
							WETH_ADDRESS(chain?.id!)?.toLowerCase() && (
							<>
								<Flex justify={"center"} mb={5}>
									<Tabs
										variant="unstyled"
										onChange={(index) =>
											index == 1
												? setIsNative(false)
												: setIsNative(true)
										}
										index={isNative ? 0 : 1}
										size="sm"
									>
										<TabList>
											<Box className={VARIANT + '-' + colorMode + '-' + (isNative ? `${tabSelected == 0 ? 'secondary' : 'primary'}TabLeftSelected` : `${tabSelected == 0 ? 'secondary' : 'primary'}TabLeft`)}>
											<Tab>
												{NATIVE}
											</Tab>
											</Box>
											<Box className={VARIANT + '-' + colorMode + '-' + (!isNative ? `${tabSelected == 0 ? 'secondary' : 'primary'}TabRightSelected` : `${tabSelected == 0 ? 'secondary' : 'primary'}TabRight`)}>
											<Tab>
												{W_NATIVE}
											</Tab>
											</Box>
										</TabList>
									</Tabs>
								</Flex>
							</>
						)}
						<InputGroup
							mt={5}
							variant={"unstyled"}
							display="flex"
							placeholder="Enter amount"
						>
							<NumberInput
								w={"100%"}
								value={formatInput(amount)}
								onChange={_setAmount}
								min={0}
								step={0.01}
								display="flex"
								alignItems="center"
								justifyContent={"center"}
							>
								<Box ml={10}>
									<NumberInputField
										textAlign={"center"}
										pr={0}
										fontSize={"5xl"}
										placeholder="0"
									/>

									<Text
										fontSize="sm"
										textAlign={"center"}
										color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}
									>
										{dollarFormatter.format(
											prices[market.inputToken.id] *
												Number(amount)
										)}
									</Text>
								</Box>

								<Flex flexDir={'column'} justify={'center'}>
									<Button
										variant={"unstyled"}
										fontSize="sm"
										fontWeight={"bold"}
										onClick={() =>
											_setAmount(
												Big(max()).div(2).toFixed(market.inputToken.decimals)
											)
										}
										py={-2}
									>
										50%
									</Button>
									<Box className={isMax ? `${VARIANT}-${colorMode}-primaryButton` : "-"} px={2}>
									<Button
										variant={"unstyled"}
										fontSize="sm"
										fontWeight={"bold"}
										onClick={() => _setAmount(Big(max()).toFixed(market.inputToken.decimals))}
										my={-1}
									>
										{tabSelected == 1 && isMax ? 'CLOSE' : 'MAX'}
									</Button>
									</Box>
								</Flex>
							</NumberInput>
						</InputGroup>
					</Box>
					<Box className={`${VARIANT}-${colorMode}-containerFooter`}>
					<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.300'}/>
					<Tabs variant={'enclosed'} onChange={selectTab}>
						<TabList>
							<Tab
								w={"50%"}
								borderX={0}
								borderColor={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.200'}
								_selected={{
									color: "primary.400",
								}}
								rounded={0}
							>
								Supply
							</Tab>
							<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.300'} orientation="vertical" h={'44px'} />
							<Tab
								w={"50%"}
								borderX={0}
								borderColor={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.200'}
								_selected={{
									color: "secondary.400"
								}}
								rounded={0}
							>
								Withdraw
							</Tab>
						</TabList>

						<TabPanels>
							<TabPanel m={0} p={0}>
								<Supply
									market={market}
									amount={amount}
									setAmount={_setAmount}
									isNative={isNative}
                                    max={max()}
									onClose={onClose}
								/>
							</TabPanel>
							<TabPanel m={0} p={0}>
								<Redeem
									market={market}
									amount={amount}
									setAmount={_setAmount}
									isNative={isNative}
                                    max={max()}
									isMax={isMax}
									onClose={onClose}
								/>
							</TabPanel>
						</TabPanels>
					</Tabs>
					</Box>
				</ModalBody>
				</Box>
			</ModalContent>
		</>
	);
}
