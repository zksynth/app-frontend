import { Flex, Heading, Text } from '@chakra-ui/react'
import React from 'react'

export default function Paused() {
  return (
    <>
    <Flex
							gap={3}
							bg={"bg2"}
							rounded="16"
							flexDir={"column"}
							h="360px"
							w={"100%"}
							align="center"
							justify={"center"}
							border="2px"
							borderColor={"whiteAlpha.200"}
						>
							<Heading size={"lg"}>Market Paused</Heading>
							<Text
								textAlign={"center"}
								color="whiteAlpha.700"
								maxW={"400px"}
							>
								Market is paused
							</Text>
							<Text mt={5}>Will be back soon</Text>
						</Flex>
    </>
  )
}
