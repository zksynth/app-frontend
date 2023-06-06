import { Box, Button, Flex, Heading, Progress, Text, useBreakpointValue, useToast } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/NavBar/Navbar';
import { useEffect } from 'react';
import { AppDataContext } from '../components/context/AppDataProvider';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useNetwork, useSwitchNetwork } from 'wagmi';

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
			
			{(status == 'fetching' || loading) && <Progress bg={'blackAlpha.200'} colorScheme='primary' size='xs' isIndeterminate />}

			<Box  bgColor="blackAlpha.500" color={'white'}>
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
			<Box bgGradient={'linear(to-b, gray.200, gray.400)'} zIndex={0}>
				<Flex
					justify={'center'}
					flexDirection={{ sm: 'column', md: 'row' }}
					minH="96vh"
					maxW={'100%'}
					
					>
					{/* large 100vw background1.svg image at bottom of screen, 0.1 opacity */}
					{/* <Box
						bgImage={'url(/background1.svg)'}
						bgRepeat={'no-repeat'}
						bgSize={'contain'}
						bgPosition={'bottom'}
						opacity={0.1}
						position={'absolute'}
						top={0}
						left={0}
						right={0}
						bottom={0}
						zIndex={1}
					></Box> */}

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
							{/* <Flex h={'70vh'} justify={'center'} align={'center'} flexDir={'column'}>
								<Heading size={'md'}>
									Under maintainance. Please check back later.
								</Heading>
								<Text my={2} color={'blackAlpha.600'}>
									We are currently working on some updates. Stay tuned to our Twitter and Discord for annoucements.
								</Text>
							</Flex> */}
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
	);
}
