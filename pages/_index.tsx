import { Box, Flex, Progress, Text } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { WalletContext } from '../components/context/WalletContextProvider';
import { useEffect } from 'react';
import { id } from 'ethers/lib/utils';
import { useRouter } from 'next/router';
import { AppDataContext } from '../components/context/AppDataProvider';
import { useState } from 'react';
import { ChainID, chainIndex } from '../src/chains';
import { useAccount, useConnect } from 'wagmi';
import { DUMMY_ADDRESS } from '../src/const';

export default function _index({ children }: any) {

	const {
		isConnected,
		isConnecting,
		address,
		tronWeb,
		connect,
		connectionError,
	} = useContext(WalletContext);

	const {
		collaterals,
		synths,
		totalCollateral,
		totalDebt,
		isDataReady,
		availableToBorrow,
		fetchData,
		isFetchingData,
		setChain
	} = useContext(AppDataContext);
	const [init, setInit] = useState(false);

	const backgroundStyle = {
		// backgroundColor: 'gray.800'
		// bgGradient: 'radial(#12131B, gray.900)',
		bgGradient: 'radial(gray.900, #12131B)',
	};

	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, [isDataReady]);

	if(!hydrated) return <></>;

	return (
		<Box>
			{connectionError && (
				<Text
					textAlign={'center'}
					width="100%"
					fontSize={'md'}
					fontWeight="bold"
					p={2}
					bgColor="gray.50">
					{connectionError}
				</Text>
			)}
			<Box {...backgroundStyle}>
				<Flex
					justify={'center'}
					flexDirection={{ sm: 'column', md: 'row' }}
					minH="94vh">
					<Box maxWidth={'1300px'} 
                    minW={{sm: '0', md: '0', lg: '1200px'}}
					px={{sm: '4', md: '0'}}
                    >
						<Navbar />
						{children}
					</Box>
				</Flex>
				<Footer />
			</Box>
		</Box>
	);
}
