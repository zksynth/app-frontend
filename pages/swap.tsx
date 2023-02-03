import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import Swap from "../components/swap/index";


export default function swap() {
	return (
		<>
			<Flex justify={"center"} align="center" h={"100%"}>
				<Box
					w={"42%"}
					minW="400px"
					bgColor={"gray.800"}
					mt={"-40"}
					rounded={15}
				>
					<Swap />
				</Box>
			</Flex>
		</>
	);
}
