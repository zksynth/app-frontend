import { Box, Flex, Heading } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'
import { useAccount } from 'wagmi';

export default function ConnectBox() {
    const {address} = useAccount();
  return (
    <>
    <Flex flexDir="column"  justify={'center'} align='center' h='80vh'>
				<Heading mb={5}>{address ? 'Your Account' : 'Connect Your Wallet'}</Heading>
				<Box>
					<ConnectButton/>
				</Box>
				</Flex>
    </>
  )
}
