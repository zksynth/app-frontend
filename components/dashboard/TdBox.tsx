import { Box, Flex, Td } from '@chakra-ui/react'
import React from 'react'

const borderStyle = {
	borderColor: "transparent",
	p: 0
};

export default function TdBox({isFirst = false, children, isNumeric = false, alignBox}: any) {
  return (
    <Td {...borderStyle} pt={isFirst ? '30px' : '16px'} h='80px' isNumeric>
    <Flex align={'center'} justify={isNumeric ? 'end' : 'start'} px={2} h='100%' ml={alignBox == 'left' ? 4 : 0} mr={alignBox == 'right' ? 4 : 0} borderBottom={'1px solid'} borderColor='whiteAlpha.200'>
        {children}
    </Flex>
    </Td>
  )
}
