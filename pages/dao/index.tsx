import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import Head from 'next/head'
import Link from 'next/link';
import React from 'react'
import { AiOutlineRight } from 'react-icons/ai'


function SubSection({path, title, subtitle}: any) {
    return <>
        <Link href={path}>
            <Box my={5} p={5} bg='gray.800' rounded={10} maxW='300px' >
                <Heading size={'md'}>{title}</Heading>
                <Text fontSize={'sm'} mt={5}>{subtitle}</Text>
                <Flex align={'center'} gap={1} mt={8} color='gray.400'>
                    <Text fontSize={'sm'}>Get Started</Text>
                    <AiOutlineRight/>
                </Flex>
            </Box>
        </Link>
    </>
}
export default function DAO() {
  return (
    <>
    <Head>
				<title>DAO | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Box maxW={'1200px'} mt='100px'>
                <Heading>SyntheX DAO</Heading>
                <Text>Empowering next generation of derivatives on-chain</Text>
                <Flex gap={5} mt={10}>
                <SubSection path='/dao/launch' title='Crowdsale' subtitle={"Lead protocol's direction by creating proposals, ideas and vote on them to benefit the community"}/>
                <SubSection path='/dao/SYX' title='SYX' subtitle={"Lead protocol's direction by creating proposals, ideas and vote on them to benefit the community"}/>
                <SubSection path='/dao/governance' title='Governance' subtitle={"Lead protocol's direction by creating proposals, ideas and vote on them to benefit the community"}/>
                <SubSection path='/dao/escrow' title='Escrow' subtitle={"Lead protocol's direction by creating proposals, ideas and vote on them to benefit the community"}/>
                </Flex>
			</Box>
            </>
  )
}
