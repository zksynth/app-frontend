import { Flex, Heading, Text, useColorMode } from "@chakra-ui/react";
import React from "react";
import { useAppData } from "../context/AppDataProvider";
import { VARIANT } from "../../styles/theme";

export default function Paused() {
	const { pools, tradingPool } = useAppData();
	const { colorMode } = useColorMode();

	return (
		<>
			<Flex
				gap={3}
				rounded="0"
				flexDir={"column"}
				h="320px"
				w={"100%"}
				align="center"
				justify={"center"}
				className={`${VARIANT}-${colorMode}-containerBody`}
			>
				<Heading fontSize={"24px"}>Market Paused</Heading>
				<Text
					textAlign={"center"}
					color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
					maxW={"500px"}
					my={4}
				>
					Equity and ETF assets are traded only during 9:30AM to 4:00PM EDT Monday
					through Friday
				</Text>

				{/* <Text
					textAlign={"center"}
					color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
					maxW={"500px"}
					mt={0}
				>
					Forex markets are traded
					only from 5PM EDT on Sunday through 4PM EDT on Friday.
					Additionally, some currencies might trade only during local
					banking hours.
				</Text> */}
			</Flex>
		</>
	);
}
