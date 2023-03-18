import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react'
import Head from 'next/head'
import React from 'react'

export default function syx() {
  return (
    <>
    <Head>
				<title>SYX | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
      <Box pt='100px'>
        <Flex gap={4} align='center'>
          <Image src='/SYX.svg' w={20} alt='SYX Token Logo'/>
          <Box>
            <Heading size={"lg"}>SyntheX Token</Heading>  
            <Text mt={2} color='gray.400'>
              SYX is the protocol token for SyntheX. Earn protocol fees, participate in governance, be a part of SyntheX
            </Text>
          </Box>
        </Flex>

        <Flex my={16} justify='space-around'>
          <Box textAlign={'center'}>
            <Heading size={'sm'} color='primary.400'>Circulating Supply</Heading>
            <Text fontSize={'3xl'} mt={2}>-</Text>
          </Box>

          <Box textAlign={'center'}>
            <Heading size={'sm'} color='primary.400'>Price</Heading>
            <Text fontSize={'3xl'} mt={2}>-</Text>
          </Box>

          <Box textAlign={'center'}>
            <Heading size={'sm'} color='primary.400'>Market Cap</Heading>
            <Text fontSize={'3xl'} mt={2}>-</Text>
          </Box>
        </Flex>

        <Flex bg={"#0A1931"} border='2px' borderColor={'whiteAlpha.100'}  mt='10' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>Crowdsale</Heading>
          <Flex align={'center'} gap={2}>
          <Box h='2' w='2' bg={'yellow'} rounded='full'></Box>
          <Text>Coming soon</Text>
          </Flex>
        </Flex>

        <Flex bg={"#0A1931"} border='2px' borderColor={'whiteAlpha.100'} mt='5' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>Liquidity Bootstrap</Heading>
          <Flex align={'center'} gap={2}>
          <Box h='2' w='2' bg={'yellow'} rounded='full'></Box>
          <Text>Coming soon</Text>
          </Flex>
        </Flex>
        
        <Flex bg={"#0A1931"} border='2px' borderColor={'whiteAlpha.100'} mt='5' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>LP Rewards</Heading>
          <Flex align={'center'} gap={2}>
          <Box h='2' w='2' bg={'yellow'} rounded='full'></Box>
          <Text>Coming soon</Text>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}
