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

	const {address: evmAddress, isConnected: isEvmConnected, isConnecting: isEvmConnecting} = useAccount();
	const {connectAsync: connectEvm, connectors} = useConnect();

	// useEffect(() => {
	// 	if (typeof window !== 'undefined' && !init) {
	// 		setInit(true)
	// 		const _address = localStorage.getItem('address');
	// 		const _chain = localStorage.getItem('chain');
	// 		if(_address && _chain){
	// 			if(parseInt(_chain) == ChainID.NILE){
	// 				connect((_address: string | null, _err: string) => {
	// 					if (!isDataReady && !isFetchingData && _address) {
	// 						fetchData(_address, ChainID.NILE);
	// 						setChain(ChainID.NILE);
	// 					}
	// 				});
	// 			} else {
	// 				if(!isEvmConnected && !evmAddress){
	// 					connectEvm({chainId: parseInt(_chain), connector: connectors[chainIndex[parseInt(_chain)]]}).then((res: any) => {
	// 						if (!isDataReady && !isFetchingData && res.account) {
	// 							fetchData(res.account, ChainID.AURORA);
	// 							setChain(ChainID.AURORA);
	// 							localStorage.setItem("address", res.account)
	// 							localStorage.setItem("chain", ChainID.AURORA.toString());
	// 						}
	// 					})
	// 				} else {
	// 					fetchData(null, ChainID.AURORA);
	// 				}
	// 			}
	// 		} else {
	// 			fetchData(null, ChainID.AURORA);
	// 		}
	// 	}
	// }, [connect, connectEvm, connectors, fetchData, init, isDataReady, isFetchingData, setChain, setInit]);

	const router = useRouter();

	const backgroundStyle = {
		backgroundColor: '#0D0D0D'
	};

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
