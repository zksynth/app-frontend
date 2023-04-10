import { Box, Flex, Progress, Text, useBreakpointValue } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/NavBar/Navbar';
import { useEffect } from 'react';
import { AppDataContext } from '../components/context/AppDataProvider';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useNetwork } from 'wagmi';

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

	if(!hydrated) return <></>;

	return (
		<Box>
			{(status == 'fetching' || loading) && <Progress bg={'gray.900'} colorScheme='primary' size='xs' isIndeterminate />}
			{(chain?.testnet) && <Box bgColor="gray.700" color={'gray.400'}>
				<Text
					textAlign={'center'}
					width="100%"
					fontSize={'md'}
					fontWeight="medium"
					p={2}>
					This is a testnet. Please do not send real assets to these addresses.
				</Text>
			</Box>}

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
			<Box w='100%' h={'100%'} bgGradient={'radial(bg2, bg2)'}>
			<Box w='100%' h={'100%'} bgGradient={'radial(blackAlpha.400, rgba(10,25,49,1) 100%)'}>
				<Flex
					justify={'center'}
					flexDirection={{ sm: 'column', md: 'row' }}
					minH="94vh">
					<Box maxWidth={'1300px'} 
                    minW={{sm: '0', md: '0', lg: '1200px'}}
					px={{sm: '4', md: '0'}}
                    >
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
				<Footer />
			</Box>
			</Box>
		</Box>
	);
}
