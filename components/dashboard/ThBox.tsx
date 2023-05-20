import { Box, Th } from '@chakra-ui/react'
import React from 'react'

const tableHeaderStyle = {
	color: 'whiteAlpha.700',
	// borderBottom: '2px solid',
	// borderColor: 'whiteAlpha.300',
	borderColor: 'transparent',
	fontWeight: 'bold',
	fontFamily: 'General Sans',
	pt: '18px',
	pb: '16px',
}

export default function ThBox({children, alignBox, isNumeric}: any) {
  return (
    <Th {...tableHeaderStyle} pr={alignBox == 'right' ? 4 : 0} pl={alignBox == 'left' ? 4 : 0} isNumeric={isNumeric}>
    <Box color={'whiteAlpha.500'} pb={4} mb={-3} px={2} borderBottom={'2px'} borderColor='whiteAlpha.300'>
        {children}
    </Box>
    </Th>
  )
}