import { Box, Divider, Flex, Text, Image, Tooltip, useColorMode } from "@chakra-ui/react";
import React, { useState } from "react";
import { FcPlus } from "react-icons/fc";
import { TbMoneybag } from "react-icons/tb";
import { VARIANT } from "../../styles/theme";
import { InfoIcon } from "@chakra-ui/icons";

export default function APRInfo({ debtBurnApr, esSyxApr, children }: any) {
	const [isLabelOpen, setIsLabelOpen] = useState(false);

	return (
		<>
			<Tooltip
				bg={"transparent"}
				p={0}
				label={
					<APRInfoBox debtBurnApr={debtBurnApr} esSyxApr={esSyxApr} />
				}
				isOpen={isLabelOpen}
			>
				<Box
					onMouseEnter={() => setIsLabelOpen(true)}
					onMouseLeave={() => setIsLabelOpen(false)}
					onClick={() => setIsLabelOpen(true)}
				>
					{children}
				</Box>
			</Tooltip>
		</>
	);
}

function APRInfoBox({ debtBurnApr, esSyxApr }: any) {
	const { colorMode } = useColorMode();
	return (
		<>
			<Box
				className={`${VARIANT}-${colorMode}-containerBody`}
				shadow={'2xl'}
			>
				<Box px={3} py={2} className={`${VARIANT}-${colorMode}-containerHeader`}>
					<Text color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}>Total APY</Text>
					<Text color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"} fontSize={"lg"}>
						{(Number(debtBurnApr)
						 + Number(esSyxApr)
						 ).toFixed(2)} %
					</Text>
				</Box>

				{VARIANT == 'edgy' && <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> }
				<Box px={3} py={1}>
					<Flex align={"center"} gap={2} mb={2} mt={2}>
						<Flex gap={2}>
							<Text color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}>{debtBurnApr} %</Text>
							<Text color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}>Burn</Text>
						</Flex>
					</Flex>
					{/* <Flex align={"center"} gap={2} my={2}>
						<Image src={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`} w={5} alt={process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL} />
						<Flex gap={2}>
							<Text color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}>{esSyxApr} %</Text>
							<Text color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}>{process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}</Text>
						</Flex>
					</Flex> */}
				</Box>
				
				<Divider />
				<Flex className={`${VARIANT}-${colorMode}-containerFooter2`} px={2.5} py={1} align={'center'} gap={1}>
					<InfoIcon color={colorMode == 'dark' ? 'whiteAlpha.600' : 'black'} />
					<Text color={colorMode == 'dark' ? 'whiteAlpha.600' : 'black'}>
						Earned on Debt
					</Text>
				</Flex>
			</Box>
		</>
	);
}
