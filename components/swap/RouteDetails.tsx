import React from 'react'
import { useDexData } from '../context/DexDataProvider'
import { useBalanceData } from '../context/BalanceProvider';
import { Box, Divider, Flex, Image, Text } from '@chakra-ui/react';

export default function RouteDetails({swapData}: any) {
  const { pools } = useDexData();
  const { tokens } = useBalanceData();

  const decodeAssetsFromSwap = (swap: any) => {
    if(swap.isBalancerPool){
      for(let i in swap.swap){
        let poolId = swap.swap[i].poolId.toLowerCase();
        for(let i in pools){
          if(pools[i].id == poolId){
            return pools[i].tokens.map((token: any) => token.token.id !== pools[i].address && token.token.symbol).filter((token: any) => token);
          }
        }
      }
    } else {
        return swap.assets.map((asset: string) => tokens.find((token: any) => token.id == asset)?.symbol); 
    }
  }

  return (
    <Flex w='100%' pt={1} pb={0.5} justify={'space-between'} align={'center'}>
      <Text>Route</Text>
    <Flex w={'100%'} justify={'end'} mr={1}>
      {swapData.swaps.map((swap: any, index: number) => {
        return (
          <Flex key={index} align={'center'}>
            {decodeAssetsFromSwap(swap).map((token: any, i: number) => {
              return (
                <Box key={i}>
                  <Image src={`/icons/${token}.svg`} minW="22px" h={"22px"} mr={-1} alt='s' />
                </Box>
              )
            })}
            {index !== swapData.swaps.length - 1 && <Divider w={'25px'} />}
          </Flex>
        )
      })}
    </Flex>
    </Flex>
  )
}
