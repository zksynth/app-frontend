import React from "react";
import { Box, Divider, Flex, Text, Image, Tooltip, useColorMode } from "@chakra-ui/react";
import {useState} from 'react';
import { VARIANT } from "../../styles/theme";

export default function Info({ title, message, children }: any) {
		const [isLabelOpen, setIsLabelOpen] = useState(false);

	return (
		<>
			<Tooltip
				bg="transparent"
				p={0}
				rounded={0}
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
	const { colorMode } = useColorMode();
	return (
		<>
			<Box
				className={`${VARIANT}-${colorMode}-containerBody`}
				shadow={'2xl'}
			>
				<Box px={3} py={2} className={`${VARIANT}-${colorMode}-containerHeader`}>
					<Text fontSize={"lg"} color={colorMode == 'dark' ? "white" : "black"}>
						{title}
					</Text>
				</Box>

				{VARIANT == 'edgy' && <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> }
				<Box px={3} py={1}>
					<Flex align={"center"} gap={2} mb={2} mt={2}>
						<Flex gap={2}>
							<Text color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}>{message}</Text>
						</Flex>
					</Flex>
				</Box>
			</Box>
		</>
	);
}
