import { Box, Th, useColorMode, Text } from '@chakra-ui/react'
import React from 'react'

const tableHeaderStyle = {
	// color: 'whiteAlpha.700',
	// borderBottom: '2px solid',
	// borderColor: 'whiteAlpha.300',
	borderColor: 'transparent',
	fontWeight: 'bold',
	fontFamily: 'General Sans',
	pt: '18px',
	pb: '11px',
}

export default function ThBox({children, alignBox, isNumeric}: any) {
	const { colorMode } = useColorMode();
  return (
    <Th {...tableHeaderStyle} pr={alignBox == 'right' ? 4 : 0} pl={alignBox == 'left' ? 4 : 0} isNumeric={isNumeric}>
    <Box minH={'34px'} color={colorMode == 'dark' ? 'whiteAlpha.500' : 'blackAlpha.500'} pb={0} mb={-3} px={2} borderBottom={'2px'} borderColor={colorMode == 'dark' ? 'whiteAlpha.300' : 'blackAlpha.100'}>
        {children}
    </Box>
    </Th>
  )
}