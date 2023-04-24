import { Box, Button, Divider, Flex, Heading, IconButton } from '@chakra-ui/react'
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
import { FaBurn, FaMedal } from 'react-icons/fa';
import { FaMagic } from 'react-icons/fa';
import { RiMagicFill } from 'react-icons/ri';
import Head from 'next/head';
import { MdRefresh } from 'react-icons/md';
import { useAccount } from 'wagmi';

export default function Leaderboard() {
  const [refreshing, setRefreshing] = React.useState(false);

  const {leaderboard: leaderboardData, account, fetchData } = useContext(AppDataContext);

  const {address} = useAccount();

  const refresh = async () => {
    setRefreshing(true);
    fetchData(address || null)
    .then(res => {
      setRefreshing(false);
    })
    .catch(err => {
      console.log(err);
      setRefreshing(false);
    })
  }

  const dailyPointsEarned = (__account : any) => {
    if(!__account) return '-';
    if(!__account.accountDayData) return '-';
    return tokenFormatter.format(__account.accountDayData[0].dayId == Math.floor(Date.now()/(24*3600000)) ? __account.accountDayData[0].dailyPoint : 0);
  }

  const dailyVolume = (__account : any) => {
    if(!__account) return '-';
    if(!__account.accountDayData) return '-';
    return tokenFormatter.format(__account.accountDayData[0].dayId == Math.floor(Date.now()/(24*3600000)) ? __account.accountDayData[0].dailyMintedUSD : 0);
  }

  return (
    <>
    <Head>
				<title>Rewards | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
    <Box pt={'100px'}>

      <Heading size={"lg"}>Trade-To-Earn</Heading>
      <Text mt={2} pb={5} color='whiteAlpha.700'>
        The more you trade, the more you earn. Earn points by trading on SyntheX and redeem them for SYX tokens.
      </Text>

        <Divider my={5}/>

        <Flex gap={10}>
      <Box py={5} pt={5}>
      <Heading size={'md'}>Total Earned</Heading>
      <Text fontSize={'3xl'} my={5}>{tokenFormatter.format(account?.totalPoint ?? 0)}</Text>
      </Box>

      <Divider orientation='vertical' h='120px'/>

      <Box pb={10} pt={5}>
        <Flex>
      <Heading size={'md'}>24h Volume</Heading>
      <IconButton icon={<MdRefresh />} onClick={refresh} aria-label={''} variant='unstyled' p={0} mt={-2} ml={2} isLoading={refreshing}/>
        </Flex>

      <Flex gap={20}>
        <Flex rounded={'10'} my={5} align={'center'} gap={5}>
          <RiMagicFill size={'22px'}/>
          <Box minW={'100px'}>
            <Heading size={'sm'} color={'whiteAlpha.700'}>Points Earned</Heading>
            <Text fontSize={'xl'}>{dailyPointsEarned(account)}</Text>
          </Box>
        </Flex>

        <Flex rounded={'10'} my={5} align={'center'} gap={5}>
          <FaMagic/>
          <Box minW={'100px'}>
            <Heading size={'sm'} color={'whiteAlpha.700'}>Volume (USD)</Heading>
            <Text fontSize={'xl'}>{dailyVolume(account)}</Text>
          </Box>
        </Flex>

      </Flex>
      </Box>
      </Flex>
    </Box>
    <Box bg={'bg2'} mb={20} rounded={16} border={'2px'} pt={1} borderColor='whiteAlpha.50'>

      <TableContainer >
  <Table variant='simple'>
    <Thead>
      <Tr>
        <Th>
          <Flex>
          Rank
          </Flex>
          </Th>
        <Th>Account</Th>
        <Th>24hr Points</Th>
        <Th>24hr Volume (USD)</Th>

        <Th isNumeric>Total Points</Th>
      </Tr>
    </Thead>
    <Tbody>
      {leaderboardData?.map((_account, index): any => {

      return <Tr key={index} bg={account?.id.toLowerCase() == _account.id ? 'whiteAlpha.100' : 'transparent'}>
        <Td borderColor={'whiteAlpha.50'}>
          <Flex gap={2} align='center'>
            <Text>
          {index + 1}
            </Text>
          { index < 10 && <FaMedal color='orange'/> } 
          { index >= 10 && index < 25 && <FaMedal color='gray'/> } 
          </Flex>
          </Td>
        <Td borderColor={'whiteAlpha.50'}>{(account?.id.toLowerCase() == _account.id ? `You (${_account.id.slice(0,8)})` :  _account.id.slice(0, 8) + '...' + _account.id.slice(36))}</Td>
        <Td borderColor={'whiteAlpha.50'}>{dailyPointsEarned(_account)}</Td>
        <Td borderColor={'whiteAlpha.50'}>{dailyVolume(_account)}</Td>
       
        <Td borderColor={'whiteAlpha.50'} isNumeric>{tokenFormatter.format(_account.totalPoint)}</Td>
      </Tr>
      })}

    </Tbody>
  </Table>
</TableContainer>
</Box>
    </>
  )
}
