import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import Swap from "../components/swap/index";

export default function SwapPage() {
	return (
		<Flex >
				<Box bgImage='/center-glow.svg' bgRepeat={'no-repeat'} w='100%' h={'100%'} bgPos='50% 50%'>
			<Flex justify={"center"} align="center" h={"80vh"}>

				<Box w={"43%"} minW="400px">
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.45 }}
					>
						<Box
							animation={"fadeIn 0.5s ease-in-out"}
							bgColor={"bg3"}
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
