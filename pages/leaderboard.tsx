import { Box, Button, Divider, Flex, Heading, IconButton } from '@chakra-ui/react'
import React, { useEffect } from 'react'
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
import Big from 'big.js';

export default function Leaderboard() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [formattedLeaderboard, setFormattedLeaderboard] = React.useState<any[]>([]);

  const {leaderboard: leaderboardData, account, fetchData, pools } = useContext(AppDataContext);

  useEffect(() => {
    if(!leaderboardData) return;
    for(let i = 0; i < leaderboardData.length; i++){
      const data = accountPoints(leaderboardData[i]);
      leaderboardData[i].today = data.today;
      leaderboardData[i].total = data.total;
    }
    // sort by total points
    leaderboardData.sort((a: any, b: any) => {
      return Big(b.total).minus(a.total).toNumber();
    });
    setFormattedLeaderboard(leaderboardData);
  }, [leaderboardData, pools]);


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

  const accountPoints = (__account : any) => {
    if(!__account) return {today: '-', total: '-'};
    if(!__account.accountDayData) return {today: '-', total: '-'};
    let today = Big(0);
    let total = Big(0);
    for(let i = 0; i < __account.accountDayData.length; i++){
      let dailyPoint = Big(0);
      if(!__account.accountDayData[i].dailySynthsMinted) continue;
      for(let j = 0; j < __account.accountDayData[i].dailySynthsMinted.length; j++){
        const pool = pools.find((pool: any) => pool.id == __account.accountDayData[i].dailySynthsMinted[j].synth.pool.id);
        if(!pool) continue;
        const synth = pool.synths.find(
          (synth: any) => synth.token.id == __account.accountDayData[i].dailySynthsMinted[j].synth.id
        );
        if(!synth) continue;
        dailyPoint = dailyPoint.plus(
          Big(__account.accountDayData[i].dailySynthsMinted[j].amount)
          .mul(synth.priceUSD)
        );
      }
      total = total.plus(dailyPoint);
      if(__account.accountDayData[i]?.dayId == Math.floor(Date.now()/(24*3600000))){
        today = dailyPoint;
      }
    }
    return {today: today.toNumber(), total: total.toNumber()};
  }

  const totalPoints = () => {
    let total = Big(0);
    let daily = Big(0);
    for(let i = 0; i < pools.length; i++){
      for(let j = 0; j < pools[i].synths.length; j++){
        // cumulativeMinted, cumulativeBurned
        total = total.plus(
          Big(pools[i].synths[j].cumulativeMinted)
          .plus(pools[i].synths[j].cumulativeBurned)
          .mul(pools[i].synths[j].priceUSD)
        );

        // synthDayData[0]
        if(pools[i].synths[j].synthDayData.length > 0 && pools[i].synths[j].synthDayData[0].dayId == Math.floor(Date.now()/(24*3600000))){
          daily = daily.plus(
            Big(pools[i].synths[j].synthDayData[0].dailyMinted)
            .plus(pools[i].synths[j].synthDayData[0].dailyBurned)
            .div(1e18)
            .mul(pools[i].synths[j].priceUSD)
          );
        }
      }
    }
    return {total: dollarFormatter.format(total.toNumber()), daily: dollarFormatter.format(daily.toNumber())};

  }

  return (
    <>
    <Head>
				<title>Rewards | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
    <Box pt={'100px'}>

      <Heading size={"lg"}>Leaderboard</Heading>
      <Text mt={2} pb={5} color='whiteAlpha.700'>
        The more you trade, the higher you climb
      </Text>

        <Divider my={5}/>

        <Flex gap={10}>
        
      <Box py={5} pt={5}>
      <Heading size={'md'}>Total Volume</Heading>

      <Text fontSize={'3xl'} my={5}>{totalPoints().total}</Text>
      </Box>

      <Divider orientation='vertical' h='120px'/>

      <Box >
        {/* <Flex>
      <Heading size={'md'}>24h Volume</Heading>
      <IconButton icon={<MdRefresh />} onClick={refresh} aria-label={''} variant='unstyled' p={0} mt={-2} ml={2} isLoading={refreshing}/>
        </Flex> */}

      <Flex gap={20}>
        {/* <Flex rounded={'10'} my={5} align={'center'} gap={5}>
          <RiMagicFill size={'22px'}/>
          <Box minW={'100px'}>
            <Heading size={'sm'} color={'whiteAlpha.700'}>Points Earned</Heading>
            <Text fontSize={'xl'}>{accountPoints(account).today}</Text>
          </Box>
        </Flex> */}

<Box py={5} pt={5}>
  <Flex>
      <Heading size={'md'}>24hr Volume</Heading>
      <IconButton icon={<MdRefresh />} onClick={refresh} aria-label={''} variant='unstyled' p={0} mt={-2} ml={2} isLoading={refreshing}/>
  </Flex>

      <Text fontSize={'3xl'} my={3}>{totalPoints().daily}</Text>
      </Box>

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
        <Th>24hr Volume (USD)</Th>

        <Th isNumeric>Total Volume</Th>
      </Tr>
    </Thead>
    <Tbody>
      {formattedLeaderboard?.map((_account, index): any => {
      return <Tr key={index} bg={account?.id.toLowerCase() == _account.id ? 'whiteAlpha.100' : 'transparent'}>
        <Td borderColor={'whiteAlpha.50'}>
          <Flex gap={2} align='center'>
            <Text>
          {index + 1}
            </Text>
          { index == 0 && <FaMedal color='yellow'/> } 
          { index == 1 && <FaMedal color='gray'/> } 
          { index == 2 && <FaMedal color='orange'/> }
          </Flex>
          </Td>
        <Td borderColor={'whiteAlpha.50'}>{(account?.id.toLowerCase() == _account.id ? `You (${_account.id.slice(0,8)})` :  _account.id.slice(0, 8) + '...' + _account.id.slice(36))}</Td>
        <Td borderColor={'whiteAlpha.50'}>{dollarFormatter.format(_account.today)}</Td>
        <Td borderColor={'whiteAlpha.50'} isNumeric>{dollarFormatter.format(_account.total)}</Td>
      </Tr>
      })}

    </Tbody>
  </Table>
</TableContainer>
</Box>
    </>
  )
}
