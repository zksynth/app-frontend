import { Box, Heading, Text, Flex, useColorMode } from '@chakra-ui/react'
import React, { useContext } from 'react'
import { useAccount } from 'wagmi';
import { AppDataContext } from '../context/AppDataProvider';

export default function Title() {
    const { account } = useContext(AppDataContext);
    const { address } = useAccount();
	const { colorMode } = useColorMode();

  return (
    <Flex pt="100px" justify={'space-between'}>
    <Flex align={'end'} gap={2}>
		{/* <Box className='primaryButton' maxW={'120px'}>
					
		</Box> */}
		<Box>
		<Heading size={"lg"}>
			Your Account
		</Heading>
		<Heading fontSize={'md'} mt={1} color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}>
			{address}
		</Heading>
		</Box>
	</Flex>
	

      <Box textAlign={'right'}>
					<Heading size={"sm"} color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}>
						Minting Synths Since
					</Heading>
					<Text mt={0.5} fontSize={"2xl"}>
						{account
							? new Date(account.createdAt * 1000)
									.toDateString()
									.slice(4)
							: "-"}
					</Text>
				</Box>
    </Flex>
  )
}
