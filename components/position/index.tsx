import {
	Box,
	Flex,
} from '@chakra-ui/react';

import MainPanel from './MainPanel';
import Head from 'next/head';
import { useState } from 'react';
import IssuanceTable from '../IssuanceTable';

function Index() {
	const [nullValue, setNullValue] = useState(false);

	const handleChange = () => {
		setNullValue(!nullValue);
	};

	const TableStyle = {
		px: '1rem',
		pt: '1rem',
		mb: { sm: '1rem', md: '0' },
		width: { sm: '100%', md: '100%', lg: '50%' },
		flex: '1',
		minH: '200px',		
		color: '#fff',
		boxShadow: 'lg',
	};

	return (
		<>
			<Head>
				<title>Dashboard | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			{
				<Flex flexDir={'column'} mt={10} mb={10} gap={12}>
					<Flex
						flexDirection={{
							sm: 'column',
							md: 'column',
							lg: 'row',
						}}
						color={'#fff'}
						align="stretch" 
                        
						>
                            <Box width={'100%'} bg='transparent' roundedTop={15}>
                                <MainPanel handleChange={handleChange} />
                            </Box>
					</Flex>

					<Flex
						flexDirection={{
							sm: 'column',
							md: 'column',
							lg: 'row',
						}}
						justifyContent="space-between"
						flexWrap="wrap">
						<Box {...TableStyle} bg='gray.800' rounded={15}>
							<IssuanceTable handleChange={handleChange} />
						</Box>
					</Flex>
				</Flex>
			}
		</>
	);
}

export default Index;
