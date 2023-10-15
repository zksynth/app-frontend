import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import Perps from '../../components/perps'
import { useRouter } from 'next/router';

export default function PerpsPair() {
  // get pair id from url
  const router = useRouter()
  const { category } = router.query;

  return (
    <>
      <Flex opacity={'0.8'} flexDir={'column'} align={'center'}>
        <Box mt={'22vh'} className='comingSoonText'>
        <Heading px={10} fontSize={'60px'} fontWeight={'bold'}>Coming Soon</Heading>
        </Box>
      </Flex>
      {/* <Perps category={category}/> */}
    </>
  )
}
