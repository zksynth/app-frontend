import { Box, Heading, Text, Flex } from '@chakra-ui/react'
import React from 'react'
import {
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList,
  } from '@chakra-ui/react'
import { MdCheckCircle, MdSettings } from 'react-icons/md'
import Head from 'next/head'

export default function Info() {
  return <> 
  <Head>
				<title>Info | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
    <Box mt={'100px'} maxW='1200px'>
      <Heading>Start here!</Heading>
      <Text>Learn how SyntheX works and get started!</Text>

      <Flex flexDir='column' gap={10} my={10}>
          <FAQ q={`1) What`} a={`Synthex enables you to create synthetic assets. These synthetic assets mirror the price behavior of real-world assets, such as stocks, commodities, or indices. By creating synthetic assets, users can speculate on the price movements of these assets without actually owning them.`} />
          <FAQ q={`How to use?`} a={`You can mint synthetic assets by depositing collateral into that specific market pool (Crypto, Forex Market, etc.). When you want to withdraw their collateral, simply burn the synthetic assets, and then you'll be able to get your collateral back to your wallet.`}>
            <Flex mt={8} gap={5}>
                <TaskList index={'1.'} title={'Select Market'} description={
                    'Select a market from which you want to mint Synthetic Assets'
                    } 
                    text2={'For example, if you want fEURO select Forex Pool, if you want cETH select Crypto Pool'}
                    />
                <TaskList index={'2.'} title={'Mint Synthetics'} description={'Deposit collateral of your choice that is supported in that pool (USDC or ETH or USDT) and then you"ll be able to mint synthetic assets'} />
                <TaskList index={'3.'} title={'Be a Degen'} description={'Make your own strategies to generate as much profit with your Synthetic Assets'} text2={'LONG/SHORT them (or) Supply in LP pools to earn fees (or) Lend to others to earn APY'} />
            </Flex>
          </FAQ>
          <FAQ q={`Warning, Debt is Variable!`} a={`
            At the time of minting synthetic asset, you are allocated a share of the pool's total debt. As the pool's total debt increases or decrease your debt will increase or decrease accordingly. This is a feature of synthetic assets that makes them so powerful.
          `}>

            <Text>Note: Keep a watch on your debt in violent market times. If your debt increases, you have to burn synths to repay it.</Text>
          </FAQ>
      </Flex>
    </Box>
  </>
}

function FAQ ({q, a, children}: any) {
    return (
        <Box >
            <Heading fontSize={'2xl'}>{q}</Heading>
            <Text mt={2}>{a}</Text>
            {children}
        </Box>
    )
}

function TaskList({ index, title, description, text2 }: any) {
    return (
        <Box 
        bgGradient={'linear(to-r, whiteAlpha.100, whiteAlpha.200)'}
        p={4} px={4} rounded={8} border='2px' borderColor={'whiteAlpha.200'}>
        <Heading size={'2xl'}>{index}</Heading>
        <Heading size={'md'} mt={2} mb={4}>{title}</Heading>
        <Text>{description}</Text>
        {text2 && <Text mt={2}>{text2}</Text>}
        </Box>
    )
    }