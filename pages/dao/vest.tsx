import React from 'react'
import { Box, Flex, Heading, Text, Image, Tag } from '@chakra-ui/react'
import Head from 'next/head'
import { AiOutlineSwap } from 'react-icons/ai'

export default function escrow() {
  return (
    <>
    <Head>
				<title>esSYX | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
      <Box pt='90px'>
        <Flex gap={4} mb={20} align='center'>
          <Image src='/esSYX.svg' w={20} alt='SYX Token Logo'/>
          <Box>
            <Heading size={"lg"}>Vest</Heading>  
            <Text mt={2} color='whiteAlpha.700'>
              Escrow SYX to esSYX to earn a share of protocol revenue in WETH 
            </Text>
          </Box>
        </Flex>

        <Flex shadow='xl' bg={"bg3"} border='2px' borderColor={'whiteAlpha.100'} mt='10' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>Claim WETH</Heading>
          <Tag>Coming soon</Tag>
        </Flex>


        <Flex shadow='xl' bg={"bg3"} border='2px' borderColor={'whiteAlpha.100'} mt='5' p={5} rounded='16' align={'center'} justify='space-between'>
          <Flex align={'center'} gap={2}>
          <Heading size={'md'}>SYX</Heading>
          <AiOutlineSwap/>
          <Heading size={'md'}>esSYX</Heading>
          </Flex>

          <Tag>Coming soon</Tag>
        </Flex>

        
      </Box>
    </>
  )
}
