import { Box, Button, Flex, Progress, Text, useBreakpointValue, useToast } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/NavBar/Navbar';
import { useEffect } from 'react';
import { AppDataContext } from '../components/context/AppDataProvider';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import Particles from '../components/utils/particles';

export default function _index({ children }: any) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const handleStart = (url: any) => {
			setLoading(true);
			setRefresh(Math.random());
		}
        const handleComplete = (url: any) => {
			setLoading(false);
			setRefresh(Math.random());
		}

        router.events.on('routeChangeStart', handleStart)
        router.events.on('routeChangeComplete', handleComplete)
        router.events.on('routeChangeError', handleComplete)

        return () => {
            router.events.off('routeChangeStart', handleStart)
            router.events.off('routeChangeComplete', handleComplete)
            router.events.off('routeChangeError', handleComplete)
        }
    }, [loading, refresh])

	const [hydrated, setHydrated] = useState(false);
	const { status, message } = useContext(AppDataContext);

	const {chain} = useNetwork();

	useEffect(() => {
		setHydrated(true);
	}, []);

	const { chains, error, isLoading, pendingChainId, switchNetworkAsync } = useSwitchNetwork();
	const toast = useToast();

	const switchNetwork = async (chainId: number) => {
		switchNetworkAsync!(chainId)
		.catch(err => {
			console.log("error", err);
			toast({
				title: 'Unable to switch network.',
				description: 'Please try switching networks from your wallet.',
				position: 'top-right',
				status: 'error',
				duration: 9000,
				isClosable: true,
			  })
		})
	}

	if(!hydrated) return <></>;

	return (
		<Box>
			{(chain?.testnet) && <Flex align={'center'} justify={'center'} bgColor="blackAlpha.100" color={'gray.400'}>
				<Text
					textAlign={'center'} 
					fontSize={'sm'}
					fontWeight="medium"
					p={3}>
					This is a testnet. Please do not send real assets to these addresses
				</Text>
				<Button size={'xs'} rounded='full' onClick={() => switchNetwork!(42161)}>Switch to Arbitrum Mainnet</Button>
			</Flex>}
			{(status == 'fetching' || loading) && <Progress bg={'gray.900'} colorScheme='primary' size='xs' isIndeterminate />}

			<Box bgColor="gray.800" color={'gray.400'}>
			{status == 'error' && (
				<Text
					textAlign={'center'}
					width="100%"
					fontSize={'md'}
					fontWeight="bold"
					p={2}>
					{message}
				</Text>
			)}
			</Box>
			<Box bgGradient={'linear(to-b, #001121, #001324)'} zIndex={0}>
				<Box bgImage="url('/bottom-glow.svg')" bgPos={"bottom"} bgRepeat='repeat-x'>

				<Flex
					justify={'center'}
					flexDirection={{ sm: 'column', md: 'row' }}
					minH="96vh"
					maxW={'100%'}
					>
					<Box position={'absolute'} bottom={0} width='100%' zIndex={1}>
					<Particles quantity={60} />
					</Box>
					<Box zIndex={2} minW={{sm: '0', md: '0', lg: '1200px'}} w={'100%'} px={{sm: '4', md: '0'}}>
						<Flex justify='center'>
							<Box minW={'0'} w='100%' maxW={'1200px'}>
						<Navbar />
						<motion.div 
							initial={{opacity: 0, y: 15}}
							animate={{opacity: 1, y: 0}}
							exit={{opacity: 0, y: 15}}
							transition={{duration: 0.25}}
						>
							{children}
						</motion.div>
						</Box>

						</Flex>

					</Box>
				</Flex>
						<Footer />
				<Box>
				</Box>
				</Box>

			</Box>
		</Box>
	);
}
