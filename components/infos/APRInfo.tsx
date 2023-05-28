import { Box, Divider, Flex, Text, Image, Tooltip } from "@chakra-ui/react";
import React, { useState } from "react";
import { FaBurn } from "react-icons/fa";

export default function APRInfo({ debtBurnApr, esSyxApr, children }: any) {
	const [isLabelOpen, setIsLabelOpen] = useState(false);

	return (
		<>
			<Tooltip
				bg={"secondary.700"}
				p={0}
				rounded={8}
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
	return (
		<>
			<Box
				rounded={8}
				bg={"white"}
				border="2px"
				borderColor={"blackAlpha.300"}
			>
				<Box px={3} py={2} color={'black'}>
					<Text color={"blackAlpha.700"}>Total APY</Text>
					<Text fontSize={"lg"}>
						{(Number(debtBurnApr) + Number(esSyxApr)).toFixed(2)} %
					</Text>
				</Box>

				<Divider />
				<Box px={3} py={1} bg="blackAlpha.100" roundedBottom={8}>
					<Flex align={"center"} gap={2} mb={2} mt={2} color={'black'}>
						<FaBurn size={"20px"} />
						<Flex gap={2}>
							<Text>{debtBurnApr} %</Text>
							<Text color={"blackAlpha.700"}>Debt Burn</Text>
						</Flex>
					</Flex>
					<Flex align={"center"} gap={2} mb={2} color={'black'}>
						<Image src="/veZS.png" w={5} alt={"veZS"} />
						<Flex gap={2}>
							<Text>{esSyxApr} %</Text>
							<Text color={"blackAlpha.700"}>veZS</Text>
						</Flex>
					</Flex>
				</Box>
			</Box>
		</>
	);
}
