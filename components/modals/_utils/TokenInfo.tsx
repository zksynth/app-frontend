import { Flex, Image, Box, Text, useColorMode } from "@chakra-ui/react";
import React from "react";
import { ADDRESS_ZERO, WETH_ADDRESS, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import { useBalanceData } from "../../context/BalanceProvider";
import { useNetwork } from "wagmi";
import { BsStars } from "react-icons/bs";
import { VARIANT } from "../../../styles/theme";

export default function TokenInfo({ token, color = 'primary.400', isNew = false }: any) {
	const { walletBalances } = useBalanceData();
	const { chain } = useNetwork();
	const { colorMode } = useColorMode();

	color = (token.id == WETH_ADDRESS(chain?.id!)?.toLowerCase() ? Big(walletBalances[token.id] ?? 0).add(walletBalances[ADDRESS_ZERO] ?? 0) : Big(walletBalances[token.id] ?? 0))
	.div(10 ** token.decimals)
	.toNumber() > 0 ? color : colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600";

	return (
		<>
			<Flex gap={2.5} ml={"-2px"} textAlign="left">
				<Image
					src={`/icons/${token.symbol}.svg`}
					width="32px"
					alt=""
				/>
				<Box>
					<Flex align={'center'}>
					<Text color={colorMode == 'dark' ? "white" : "black"}>{token.symbol}</Text>
					{isNew && <>
						<Flex align={'center'} gap={0.5} ml={2} px={2} mb={1} py={0.5} color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.600"} className={`${VARIANT}-${colorMode}-outlinedBox`}>
							<Box color="primary.400">
							<BsStars size={'12px'}  />
							</Box>
							<Text fontSize={'xs'} fontWeight={'light'}>New</Text>
						</Flex>
					</>}
					</Flex>
					<Flex color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} fontSize={"sm"} gap={1}>
						<Text color={color}>
							{tokenFormatter.format(
								(token.id == WETH_ADDRESS(chain?.id!)?.toLowerCase() ? Big(walletBalances[token.id] ?? 0).add(walletBalances[ADDRESS_ZERO] ?? 0) : Big(walletBalances[token.id] ?? 0))
									.div(10 ** token.decimals)
									.toNumber()
							)}{" "}
							in wallet
						</Text>
					</Flex>
				</Box>
			</Flex>
		</>
	);
}
