import { Box, Flex, Divider, Text, useColorMode, NumberInput, NumberInputField } from '@chakra-ui/react'
import React from 'react'
import { dollarFormatter, tokenFormatter } from '../../../../src/const'

export default function ValuesTable({values, bptIn, pool, maxSlippage, setMaxSlippage}: any) {
    if(!values) {
        values = {slippage: 0, inputUSD: 0, outputUSD: 0}
        bptIn = 0;
    }
    const { colorMode } = useColorMode();
  return (
    <>
    {values && <Box fontSize={'sm'} mx={4} p={2} border={'1px'} borderColor={colorMode == 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'} bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}>
        <Flex flexDir={'column'}>
            
            <Flex fontSize={'md'} gap={2}>
                <Flex minW={'120px'}>
                    <Text>Total:</Text>
                </Flex>
                <Divider orientation="vertical" h='20px' borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
                <Flex>
                    <Text >{dollarFormatter.format(values.inputUSD)}</Text>
                </Flex>
            </Flex>
            <Divider my={2} borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
            <Flex fontSize={'sm'} align={'center'} color={Number(values.slippage) >= 0 ? 'green.400' : 'red.400'} gap={2}>
                <Flex minW={'120px'}>
                    <Text>{Number(values.slippage) >= 0 ? 'Slippage Bonus' : 'Price Impact'}:</Text>
                </Flex>
                <Divider orientation="vertical" h='20px' borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
                <Flex gap={1}>
                    <Text>{Number(values.slippage).toFixed(2)}</Text>
                    <Text>%</Text>
                </Flex>
            </Flex>
            <Divider my={2} borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
            <Flex fontSize={'md'} gap={2}>
                <Flex minW={'120px'} align={'center'}>
                    <Text fontSize={'sm'}>Max Slippage</Text>
                </Flex>
                <Divider orientation="vertical" h='20px' borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
                <Flex>
                <NumberInput value={maxSlippage} onChange={(e) => setMaxSlippage(e)} size={'xs'}>
                    <Flex align={'center'} gap={2}>
                    <NumberInputField borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} fontSize={'sm'} />
                    <Text>%</Text>
                    </Flex>
                </NumberInput>
                </Flex>
            </Flex>
        </Flex>
    </Box>}
    </>
  )
}
