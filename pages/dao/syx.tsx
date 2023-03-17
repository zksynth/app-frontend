import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import React from 'react'

export default function syx() {
  return (
    <>
      <Box pt='100px'>
        <Heading size={"lg"}>SyntheX Token</Heading>  
        <Text mt={2} color='gray.400'>
          SYX is the protocol token for SyntheX. Earn protocol fees, participate in governance, be a part of SyntheX
        </Text>

        <Flex my={16} justify='space-around'>
          <Box textAlign={'center'}>
            <Heading size={'sm'} color='primary'>Circulating Supply</Heading>
            <Text fontSize={'3xl'} mt={2}>-</Text>
          </Box>

          <Box textAlign={'center'}>
            <Heading size={'sm'} color='primary'>Price</Heading>
            <Text fontSize={'3xl'} mt={2}>-</Text>
          </Box>

          <Box textAlign={'center'}>
            <Heading size={'sm'} color='primary'>Market Cap</Heading>
            <Text fontSize={'3xl'} mt={2}>-</Text>
          </Box>
        </Flex>

        <Flex bg={'whiteAlpha.200'} mt='10' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>Crowdsale</Heading>
          <Flex align={'center'} gap={2}>
          <Box h='2' w='2' bg={'yellow'} rounded='full'></Box>
          <Text>Coming soon</Text>
          </Flex>
        </Flex>

        <Flex bg={'whiteAlpha.200'} mt='5' p={5} rounded='16' align={'center'} justify='space-between'>
          <Heading size={'md'}>Liquidity Bootstrap</Heading>
          <Flex align={'center'} gap={2}>
          <Box h='2' w='2' bg={'yellow'} rounded='full'></Box>
          <Text>Coming soon</Text>
          </Flex>
        </Flex>
        
        <Flex bg={'whiteAlpha.200'} mt='5' p={5} rounded='16' align={'center'} justify='space-between'>
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
