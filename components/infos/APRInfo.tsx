import { Box, Divider, Flex, Text, Image } from "@chakra-ui/react";
import React from "react";
import { FaBurn } from "react-icons/fa";

export default function APRInfo({
	debtBurnApr,
	esSyxApr,
}: {
	debtBurnApr: string;
	esSyxApr: string;
}) {
	return (
		<>
			<Box
				rounded={8}
				bg={"whiteAlpha.50"}
				border="2px"
				borderColor={"whiteAlpha.100"}
			>
				<Box px={3} py={2}>
					<Text color={"whiteAlpha.700"}>Total APR</Text>
					<Text fontSize={"lg"} color={"white"}>
						{(Number(debtBurnApr) + Number(esSyxApr)).toFixed(2)} %
					</Text>
				</Box>

				<Divider />
				<Box px={3} py={1} bg="bg2" roundedBottom={8}>
					<Flex align={"center"} gap={2} mb={2} mt={2} color="white">
						<FaBurn size={"20px"} />
						<Flex gap={2}>
							<Text>{debtBurnApr} %</Text>
							<Text color={"whiteAlpha.700"}>Debt Burn</Text>
						</Flex>
					</Flex>
					<Flex align={"center"} gap={2} mb={2} color="white">
						<Image src="/esSYX.svg" w={5} alt={"esSYN"} />
						<Flex gap={2}>
							<Text>{esSyxApr} %</Text>
							<Text color={"whiteAlpha.700"}>esSYX</Text>
						</Flex>
					</Flex>
				</Box>
			</Box>
		</>
	);
}
