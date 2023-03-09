import { Box, Flex, Progress, Text, useBreakpointValue } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useEffect } from 'react';
import { AppDataContext } from '../components/context/AppDataProvider';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function _index({ children }: any) {

	// check chakra device size
	const isMobile = useBreakpointValue({
		base: true,
		lg: false,
	});

	const backgroundStyle = {
		// backgroundColor: '#0E1015'
		bgGradient: 'radial(#0E1015, gray.900)',
		// bgGradient: 'radial(gray.900, #12131B)',
	};

	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	if(!hydrated) return <></>;

	return (
		<Box>
			<Box bgColor="gray.800" color={'gray.400'}>
			{/* {connectionError && (
				<Text
					textAlign={'center'}
					width="100%"
					fontSize={'md'}
					fontWeight="bold"
					p={2}>
					{connectionError}
				</Text>
			)} */}
			{isMobile && (
				<Text
					textAlign={'center'}
					width="100%"
					fontSize={'md'}
					fontWeight="bold"
					p={2}
					>
					SyntheX is not optimised for mobile yet
				</Text>
			)}
			</Box>
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
	);
}
