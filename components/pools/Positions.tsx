import React from 'react'
import { useDexData } from '../context/DexDataProvider'
import {
    Table,
    Thead,
    Tbody,
    Tr,
    TableContainer,
    Box,
    Heading,
    Text,
    Flex,
    useColorMode
  } from '@chakra-ui/react'
import ThBox from '../dashboard/ThBox';
import { useBalanceData } from '../context/BalanceProvider';
import YourPoolPosition from './YourPoolPosition';
import Big from 'big.js';
import { VARIANT } from '../../styles/theme';
import { usePriceData } from '../context/PriceContext';
import { DOLLAR_PRECISION } from '../../src/const';

export default function Positions() {
    const {walletBalances} = useBalanceData();
    const { pools: dexPools } = useDexData();
    const { prices } = usePriceData();

    const yourBalance = (pool: any) => {
      const totalShares = pool.totalShares;
      const yourShares = walletBalances[pool.address];
      const liquidity = pool.tokens.reduce((acc: any, token: any) => {
        return acc + (token.balance ?? 0) * (prices[token.token.id] ?? 0);
      }, 0);
      return (yourShares / totalShares) * liquidity / 1e18;
    }
  
    const stakedBalance = (pool: any) => {
      const totalShares = pool.totalShares;
      const yourShares = pool.stakedBalance;
      const liquidity = pool.tokens.reduce((acc: any, token: any) => {
        return acc + (token.balance ?? 0) * (prices[token.token.id] ?? 0);
      }, 0);
      return (yourShares / totalShares) * liquidity / 1e18;
    }
    
    const yourPositions = dexPools.filter((pool: any) => {
      return (yourBalance(pool) + stakedBalance(pool)) > DOLLAR_PRECISION;
    });

    if(yourPositions.length == 0) return <></>;
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {colorMode} = useColorMode();

    return (
    <>
    <Box className={`${VARIANT}-${colorMode}-containerBody`}>
      <Box className={`${VARIANT}-${colorMode}-containerHeader`}>
        <Flex align={'center'} p={4} px={5} gap={4}>
          <Heading fontSize={'18px'} color={'primary.400'}>Your Balances</Heading>
        </Flex>
      </Box>
      {yourPositions.length > 0 ? <TableContainer px={4} pb={4}>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <ThBox>Assets</ThBox>
              <ThBox alignBox='center'>Composition</ThBox>
              <ThBox alignBox='center'>
                <Flex w={'100%'} justify={'center'}>
                  My Balance
                </Flex>
              </ThBox>
              <ThBox alignBox='center'>
                <Flex w={'100%'} justify={'center'}>
                  Staked
                </Flex>
              </ThBox>
              <ThBox isNumeric></ThBox>
            </Tr>
          </Thead>
          <Tbody>
          {yourPositions.map((pool: any, index: number) => {
            return (
                <YourPoolPosition key={index} pool={pool} index={index} />
            )
          })}
          </Tbody>
        </Table>
        </TableContainer> : <><Text color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} p={6}>No Active Positions</Text></>}
    </Box>
    </>
  )
}
