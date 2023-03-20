import React from 'react'
import { Box, Divider, Flex, Text, Image } from "@chakra-ui/react";

export default function Info({title, message}: {title: string, message: string}) {
  return (
    <>
    <Box
				rounded={8}
				bg={"whiteAlpha.50"}
				border="2px"
				borderColor={"whiteAlpha.100"}
			>
				<Box px={3} py={2}>
					<Text fontSize={"lg"} color={"white"}>
						{title}
					</Text>
				</Box>

				<Divider />
				<Box px={3} py={1} bg="bg2" roundedBottom={8}>
					<Flex align={"center"} gap={2} mb={2} mt={2} color="white">
						<Flex gap={2}>
							<Text color={"whiteAlpha.700"}>{message}</Text>
						</Flex>
					</Flex>
				</Box>
			</Box>
    </>
  )
}
