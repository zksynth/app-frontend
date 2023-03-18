import React from 'react'
import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react'
import Head from 'next/head'

export default function escrow() {
  return (
    <>
    <Head>
				<title>esSYX | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
      <Box pt='100px'>
        <Flex gap={4} mb={20} align='center'>
          <Image src='/esSYX.svg' w={20} alt='SYX Token Logo'/>
          <Box>
            <Heading size={"lg"}>Vest</Heading>  
            <Text mt={2} color='gray.400'>
              Escrow SYX to esSYX to earn a share of protocol revenue in WETH 
            </Text>
          </Box>
        </Flex>

        <Flex bg={"#0A1931"} border='2px' borderColor={'whiteAlpha.100'} mt='10' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>Claim WETH</Heading>
          <Flex align={'center'} gap={2}>
          <Box h='2' w='2' bg={'yellow'} rounded='full'></Box>
          <Text>Coming soon</Text>
          </Flex>
        </Flex>


        <Flex bg={"#0A1931"} border='2px' borderColor={'whiteAlpha.100'} mt='5' p={5} rounded='16' align={'center'} justify='space-between'>
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
