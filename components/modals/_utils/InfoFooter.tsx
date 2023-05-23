import { Box, ModalFooter, Text, Flex } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

export default function InfoFooter({message}: any) {
	return (
		<ModalFooter mb={-4} mx={-4} color='gray.400'>
			<Flex flexDir={'column'} align='center' width={10} mr={2}>
				{/* <Text fontSize={'10px'} mb={"1px"}>Note</Text> */}
				<AiOutlineInfoCircle size={18} />
			</Flex>
			<Box>
				<Text fontSize={"11px"}>
					{message} 
					{/* <Link href={'https://docs.synthex.finance/synthex/concepts'} target='_blank' style={{textDecoration: 'underline'}}>Read More</Link> */}
				</Text>
			</Box>
		</ModalFooter>
	);
}
