import { Box, ModalFooter, Text, Flex } from "@chakra-ui/react";
import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

export default function InfoFooter({message}: any) {
	return (
		<ModalFooter mt={-1} mb={2} color='gray.400'>
			<Flex flexDir={'column'} align='center' width={10} mr={2}>
				<Text fontSize={'10px'} mb={"1px"}>Note</Text>
				<AiOutlineInfoCircle size={18} />
			</Flex>
			<Box>
				<Text fontSize={"11px"}>
					{message}
				</Text>
			</Box>
		</ModalFooter>
	);
}
