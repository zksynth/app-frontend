import { Box, Flex, Td, useColorMode } from '@chakra-ui/react'
import React from 'react'

const borderStyle = {
	borderColor: "transparent",
	p: 0
};

export default function TdBox({isFirst = false, children, isNumeric = false, alignBox}: any) {
  const { colorMode } = useColorMode();

  return (
    <Td {...borderStyle} pt={isFirst ? '30px' : '16px'} h='80px' isNumeric>
    <Flex color={colorMode == 'dark' ? 'whiteAlpha.700' : 'blackAlpha.700'} mb={'-2px'} align={'center'} justify={isNumeric ? 'end' : 'start'} px={2} h='100%' ml={alignBox == 'left' ? 4 : 0} mr={alignBox == 'right' ? 4 : 0} borderBottom={'1px solid'} borderColor={colorMode == 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'} borderStyle={'outset'}>
        {children}
    </Flex>
    </Td>
  )
}
