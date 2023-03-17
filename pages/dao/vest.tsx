import React from 'react'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'

export default function escrow() {
  return (
    <>
      <Box pt='100px'>
        <Heading size={"lg"}>Vest</Heading>  
        <Text mt={2} color='gray.400'>
          Escrow SYX to esSYX to earn a share of protocol revenue in WETH 
        </Text>

        <Flex bg={'whiteAlpha.200'} mt='10' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>Claim WETH</Heading>
          <Flex align={'center'} gap={2}>
          <Box h='2' w='2' bg={'yellow'} rounded='full'></Box>
          <Text>Coming soon</Text>
          </Flex>
        </Flex>


        <Flex bg={'whiteAlpha.200'} mt='5' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>Escrow</Heading>
          <Flex align={'center'} gap={2}>
          <Box h='2' w='2' bg={'yellow'} rounded='full'></Box>
          <Text>Coming soon</Text>
          </Flex>
        </Flex>

        
      </Box>
    </>
  )
}
