import { Box, ModalFooter, Text } from "@chakra-ui/react";
import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

export default function InfoFooter({message}: any) {
	return (
		<ModalFooter mt={-1}>
			<Box width={10} mr={2}>
				<AiOutlineInfoCircle size={20} />
			</Box>
			<Box>
				<Text fontSize={"11px"}>
					{message}
				</Text>
			</Box>
		</ModalFooter>
	);
}
