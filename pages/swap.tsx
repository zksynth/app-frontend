import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import Swap from "../components/swap/index";

export default function SwapPage() {
	return (
		<Flex >
			<Box w='100%' h={'100%'} bgPos='50% 50%'>
			<Flex justify={"center"} align="center" h={"80vh"}>

				<Box w={"43%"} minW="400px" rounded={'16px'} shadow={'0'} border={'1px solid #e9e9e9'}>
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.45 }}
					>
						<Box
							animation={"fadeIn 0.5s ease-in-out"}
						>
							<Swap />
						</Box>
					</motion.div>
				</Box>

			</Flex>
				</Box>
		</Flex>
	);
}
