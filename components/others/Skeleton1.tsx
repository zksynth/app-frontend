import { Box, Flex, Skeleton, Stack, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { VARIANT } from '../../styles/theme'

export default function Skeleton1({isLoaded}: any) {
  const {colorMode} = useColorMode();
  return (
    <Flex gap={4}>
      <Box shadow={'md'} className={`${VARIANT}-${colorMode}-halfButton2`} w={'400px'}>
        <Stack padding={4} py={6} spacing={1} >
          <Skeleton height='40px'/>
          <Skeleton height='40px'/>
          <Skeleton height='40px'/>
        </Stack>
      </Box>
    </Flex>
  )
}
