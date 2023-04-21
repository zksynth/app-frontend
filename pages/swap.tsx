import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import Swap from "../components/swap/index";

export default function swap() {
	return (
		<>
			<Flex justify={"center"} align="center" h={"80vh"}>
				<Box w={"42%"} minW="400px">
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.45 }}
					>
						<Box
							animation={"fadeIn 0.5s ease-in-out"}
							// bgColor={"bg2"}
							border='1px'
							borderColor='whiteAlpha.50'
							bgGradient={'linear(to-b, rgba(5, 104, 204, 0.25), rgba(5, 119, 230, 0.1))'}
							
							rounded={15}
						>
							<Swap />
						</Box>
					</motion.div>
				</Box>
			</Flex>
		</>
	);
}
