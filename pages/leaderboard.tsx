import { Box, Button, Divider, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import { useContext } from 'react';

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Text
} from '@chakra-ui/react'
import { AppDataContext } from '../components/context/AppDataProvider';
import { tokenFormatter, dollarFormatter } from '../src/const';
import { AddIcon } from '@chakra-ui/icons';
import { FaBurn } from 'react-icons/fa';
import { FaMagic } from 'react-icons/fa';
import { RiMagicFill } from 'react-icons/ri';
import Head from 'next/head';
import { useAccount } from 'wagmi';

export default function Leaderboard() {

  const {leaderboard: leaderboardData, account} = useContext(AppDataContext);
  const { address } = useAccount()

  return (
    <>
    <Head>
				<title>Rewards | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
    <Box pt={'110px'}>

      <Heading size={"lg"}>Trade-to-earn</Heading>
      <Text mt={2} pb={5} color='gray.400'>
					Earn rewards by trading on SyntheX
				</Text>

        <Divider my={5}/>

        <Flex gap={10}>
      <Box py={5} pt={5}>
      <Heading size={'md'}>Total Earned</Heading>
      <Text fontSize={'3xl'} my={5}>{tokenFormatter.format(account?.totalPoint ?? 0)}</Text>
      </Box>

      <Divider orientation='vertical' h='120px'/>

      <Box pb={10} pt={5}>
      <Heading size={'md'}>24h Volume</Heading>

      <Flex gap={20}>
        <Flex rounded={'10'} my={5} align={'center'} gap={5}>
          <RiMagicFill size={'22px'}/>
          <Box minW={'100px'}>
            <Heading size={'sm'} color={'whiteAlpha.700'}>Points Earned</Heading>
            <Text fontSize={'xl'}>{account?.accountDayData ? tokenFormatter.format(account.accountDayData[0].dailyPoint) : '-'}</Text>
          </Box>
        </Flex>

        <Flex rounded={'10'} my={5} align={'center'} gap={5}>
          <FaMagic/>
          <Box minW={'100px'}>
            <Heading size={'sm'} color={'whiteAlpha.700'}>Mints</Heading>
            <Text fontSize={'xl'}>{account?.accountDayData ? dollarFormatter.format(account.accountDayData[0].dailyMintedUSD): '-'}</Text>
          </Box>
        </Flex>

        <Flex rounded={'10'} my={5} align={'center'} gap={5}>
          <FaBurn/>
          <Box minW={'100px'}>
            <Heading size={'sm'} color={'whiteAlpha.700'}>Burns</Heading>
            <Text fontSize={'xl'}>{account?.accountDayData ? dollarFormatter.format(account.accountDayData[0].dailyBurnedUSD): '-'}</Text>
          </Box>
        </Flex>
      </Flex>
      </Box>
      </Flex>
    </Box>
    <Box bg={'#0A1931'} mb={20} rounded={16} border={'2px'} pt={1} borderColor='whiteAlpha.50'>

      <TableContainer >
  <Table variant='simple'>
    <Thead>
      <Tr>
        <Th>Account</Th>
        <Th>24hr Points</Th>
        <Th>24hr Minted</Th>
        <Th>24hr Burned</Th>

        <Th isNumeric>Total Points</Th>
      </Tr>
    </Thead>
    <Tbody>
      {leaderboardData?.map((account, index): any => {

      return <Tr key={index} bg={address!.toLowerCase() == account.id ? 'whiteAlpha.200' : 'transparent'}>
        <Td borderColor={'whiteAlpha.50'}>{(address!.toLowerCase() == account.id ? `You (${account.id.slice(0,8)})` :  account.id.slice(0, 8) + '...' + account.id.slice(36))}</Td>
        <Td borderColor={'whiteAlpha.50'}>{tokenFormatter.format(account.accountDayData[0]?.dailyPoint ?? 0)}</Td>
        <Td borderColor={'whiteAlpha.50'}>{dollarFormatter.format(account.accountDayData[0]?.dailyMintedUSD ?? 0)}</Td>
        <Td borderColor={'whiteAlpha.50'}>{dollarFormatter.format(account.accountDayData[0]?.dailyBurnedUSD ?? 0)}</Td>
        <Td borderColor={'whiteAlpha.50'} isNumeric>{tokenFormatter.format(account.totalPoint)}</Td>
      </Tr>
      })}

    </Tbody>
  </Table>
</TableContainer>
</Box>
    </>
  )
}
