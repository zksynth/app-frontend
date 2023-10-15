import { Flex, Heading, Image, Text, Box, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { VARIANT } from '../../../styles/theme';

export default function Success({synth, successData}: any) {
	const { colorMode } = useColorMode();

  return (
    <Flex px={8} flexDir={'column'} align={'center'} w={'100%'} textAlign={'center'}>
        <Heading mt={6} size={'md'}>You have {successData.type.toLowerCase()}ed</Heading>
        <Heading size={'lg'}>{successData.amount} {synth.token.symbol}!</Heading>
        <Image src={`/icons/${synth.token.symbol}.svg`} width='60px' my={2} />

        <Flex className={`${VARIANT}-${colorMode}-primaryButton`} align={'center'} textAlign={'center'} w={'100%'} p={4} mt={4} >
            <Box w={'100%'}>
            <Text>Lend your cUSD and</Text>
            <Text fontSize={'lg'} fontWeight={'bold'}>Earn upto 10% APR</Text>
            </Box>
        </Flex>

        <Flex className={`${VARIANT}-${colorMode}-secondaryButton`} align={'center'} textAlign={'center'} w={'100%'} p={4} my={4} >
            <Box w={'100%'}>
            <Text>Provide Liquidity and</Text>
            <Text fontSize={'lg'} fontWeight={'bold'}>Earn upto 10% APR</Text>
            </Box>
        </Flex>
    </Flex>
  )
}
