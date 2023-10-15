import React from "react";
import { useContext, useState } from "react";
import {
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Flex,
	Image,
	Text,
	Box,
	InputGroup,
	NumberInput,
	NumberInputField,
	Button,
	Divider,
	useColorMode,
} from "@chakra-ui/react";
import {
	ADDRESS_ZERO,
	NATIVE,
	WETH_ADDRESS,
	W_NATIVE,
	dollarFormatter,
} from "../../../src/const";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Big from "big.js";
import { useAccount, useNetwork } from "wagmi";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import Repay from "./Repay";
import Borrow from "./Borrow";
import { formatInput, parseInput } from "../../utils/number";
import { VARIANT } from "../../../styles/theme";
import { useRouter } from "next/router";

export default function BorrowModal(props: any) {
	const {market, amount, setAmount, onClose} = props;
	const { chain } = useNetwork();
	const [tabSelected, setTabSelected] = useState(0);
	let [debtType, setDebtType] = useState("2");
	const [isNative, setIsNative] = useState(false);
	const [isMax, setIsMax] = useState(false);

	const { address } = useAccount();
	const { walletBalances } = useBalanceData();
	const { prices } = usePriceData();
	const { lendingPosition } = useSyntheticsData();
	const router = useRouter();
	const pos = lendingPosition(Number(router.query.market) || 0);

	const _setAmount = (e: string) => {
		e = parseInput(e);
		if(tabSelected == 1){
			const debtBalance =
				debtType == "2"
					? Big(walletBalances[market._vToken.id]).div(
							10 ** market._vToken.decimals
					  )
					: Big(walletBalances[market._sToken.id]).div(
							10 ** market._sToken.decimals
					  );
			if(Number(e) > 0 && Big(e).eq(debtBalance)){
				setIsMax(true)
			} else {
				setIsMax(false)
			}
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
		if (!address) return "0";
		if (tabSelected == 0) {
			if (!prices[market.inputToken.id] || prices[market.inputToken.id] == 0){return "0"}
			let v1 = Big(pos.adjustedCollateral).sub(pos.debt).div(prices[market.inputToken.id]).mul(0.999);
            let v2 = Big(market.totalDepositBalanceUSD).sub(market.totalBorrowBalanceUSD).div(prices[market.inputToken.id]).mul(0.99);
            let min = v1.lt(v2) ? v1 : v2;
			if(min.lt(0)) min = Big(0);
			return min.toFixed(market.inputToken.decimals);
		} else {
			if (!Big(prices[market.inputToken.id] ?? 0).gt(0)) return "0";
			const v1 =
				debtType == "2"
					? Big(walletBalances[market._vToken.id]).div(
							10 ** market._vToken.decimals
					  )
					: Big(walletBalances[market._sToken.id]).div(
							10 ** market._sToken.decimals
					  );
			const v2 = Big(walletBalances[isNative ? ADDRESS_ZERO : market.inputToken.id] ?? 0).div(
				10 ** market.inputToken.decimals
			);
			let min = v1.lt(v2) ? v1 : v2;
			if(min.lt(0)) min = Big(0);
			return min.toFixed(market.inputToken.decimals);
		}
	};

	const { colorMode } = useColorMode();

	return (
		<>
			<ModalContent width={"30rem"} bg={'transparent'} shadow={'none'} rounded={0} mx={2}>
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
					<Box bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'}>
					<Box pb={12} pt={6} px={8}>
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
											(prices[market.inputToken.id] ??
												0) * Number(amount)
										)}
									</Text>
								</Box>
								<Flex flexDir={'column'} justify={'center'} >
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
										fontSize="xs"
										fontWeight={"bold"}
										onClick={() =>
											_setAmount(Big(max()).mul(0.9999).toFixed(market.inputToken.decimals))
										}
										my={-1}
									>
										{tabSelected == 1 && isMax ? 'CLOSE' : 'MAX'}
									</Button>
									</Box>
								</Flex>
							</NumberInput>
						</InputGroup>
					</Box>
					</Box>
					<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.300'}/>
					<Tabs variant={'enclosed'} onChange={selectTab} index={tabSelected}>
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
								Borrow
							</Tab>
							<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.300'} orientation="vertical" h={'44px'} />
							<Tab
								w={"50%"}
								borderX={0}
								borderColor={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.200'}
								_selected={{
									color: "secondary.400",
								}}
								rounded={0}
							>
								Repay
							</Tab>
						</TabList>

						<TabPanels>
							<TabPanel m={0} p={0}>
								<Borrow
									market={market}
									amount={amount}
									setAmount={_setAmount}
									isNative={isNative}
									debtType={debtType}
									setDebtType={setDebtType}
									max={max()}
									onClose={onClose}
								/>
							</TabPanel>
							<TabPanel m={0} p={0}>
								<Repay
									market={market}
									amount={amount}
									setAmount={_setAmount}
									isNative={isNative}
									debtType={debtType}
									setDebtType={setDebtType}
									max={max()}
									isMax={isMax}
									onClose={onClose}
								/>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>
				</Box>
			</ModalContent>
		</>
	);
}
