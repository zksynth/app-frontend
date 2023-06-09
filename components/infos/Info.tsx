import React from "react";
import { Box, Divider, Flex, Text, Image, Tooltip } from "@chakra-ui/react";
import {useState} from 'react';

export default function Info({ title, message, children }: any) {
		const [isLabelOpen, setIsLabelOpen] = useState(false);

	return (
		<>
			<Tooltip
				bg="bg2"
				p={0}
				rounded={8}
				label={<InfoBox title={title} message={message} />}
				isOpen={isLabelOpen}
			>
				<Box onMouseEnter={() => setIsLabelOpen(true)}
					onMouseLeave={() => setIsLabelOpen(false)}
					onClick={() => setIsLabelOpen(true)}>

				{children}
				</Box>
			</Tooltip>
		</>
	);
}

function InfoBox({ title, message }: any) {
	return (
		<>
			<Box
				rounded={8}
				bg={"white"}
				border="2px"
				borderColor={"blackAlpha.300"}
			>
				<Box px={3} py={2}>
					<Text fontSize={"lg"} color={"black"}>
						{title}
					</Text>
				</Box>

				<Divider />
				<Box px={3} py={1} bg="blackAlpha.100" roundedBottom={8}>
					<Flex align={"center"} gap={2} mb={2} mt={2} color="white">
						<Flex gap={2}>
							<Text color={"blackAlpha.700"}>{message}</Text>
						</Flex>
					</Flex>
				</Box>
			</Box>
		</>
	);
}
