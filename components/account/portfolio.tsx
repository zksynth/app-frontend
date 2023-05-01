import { Box, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { useContext } from "react";
import {
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	StatGroup,
	Text,
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";
import { dollarFormatter } from "../../src/const";

export default function Portfolio() {
	const { account } = useContext(AppDataContext);

	return (
		<Box my={10}>
			{/* <Stat>
				<StatLabel>Total</StatLabel>
				<StatNumber>345,670</StatNumber>
				<StatHelpText>
					<StatArrow type="increase" />
					23.36%
				</StatHelpText>
			</Stat> */}

			<Flex my={10} gap={20}>
				<Box>
					<Heading size={"sm"} color="whiteAlpha.700">
						Active Since
					</Heading>
					<Text mt={0.5} fontSize={"2xl"}>
						{account
							? new Date(account.createdAt * 1000)
									.toDateString()
									.slice(4)
							: "-"}
					</Text>
				</Box>

				<Box>
					<Heading size={"sm"} color="whiteAlpha.700">
						Total Volume
					</Heading>
					<Text mt={0.5} fontSize={"2xl"}>
						{account
							? dollarFormatter.format(account?.totalMintUSD ?? 0)
							: "-"}
					</Text>
				</Box>
			</Flex>
		</Box>
	);
}
