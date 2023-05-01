import { Box, Heading, Text, Flex } from '@chakra-ui/react'
import React, { useContext } from 'react'
import { useAccount } from 'wagmi';
import { dollarFormatter } from '../../src/const';
import { AppDataContext } from '../context/AppDataProvider';

export default function Title() {
    const { referrals, account } = useContext(AppDataContext);
    const { address } = useAccount();

  return (
    <>
    <Box pt="100px">
				<Heading size={"lg"}>
					{/* {address?.slice(0, 8) + "..." + address?.slice(38)} */}
					Your Account
				</Heading>
				<Text mt={1} color='whiteAlpha.700'>{address}</Text>

				
			</Box>
    </>
  )
}
