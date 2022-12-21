import React from 'react'
// import dynamic from 'next/dynamic';
// import SymbolOverview from 'react-tradingview-embed/dist/components/SymbolOverview';

import dynamic from "next/dynamic";
import { Box, Flex, Text } from '@chakra-ui/react';
import { MdWarning } from 'react-icons/md';

const Graph = dynamic(() => import("./Graph"), {
  ssr: false
});

export default function TradingChart({input, output}: any) {
    return (
        <>
        <Box mb={10} height='400px'>
            {/* <SymbolOverview chartOnly={true}/> */}
            <Flex position={'absolute'} zIndex={10} color={'gray.600'} gap={1} align='center'><Text fontSize='sm'> ERROR: Chart not found</Text></Flex>
            <Graph/>
        </Box>
        </>
    )
}
