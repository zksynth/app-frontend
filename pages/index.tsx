import {
	Box,
	Flex,
} from '@chakra-ui/react';

import IssuanceTable from '../components/IssuanceTable';
import Collateral from '../components/app/Collateral';
import Borrow from '../components/app/Borrow';
import Head from 'next/head';
import { useState } from 'react';

function App() {
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
				<title>SyntheX | Dashboard</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			{
				<Flex flexDir={'column'} mt={10} mb={10} gap={3}>
					<Flex
						flexDirection={{
							sm: 'column',
							md: 'column',
							lg: 'row',
						}}
						color={'#fff'}
						align="stretch" 
						gap={3}
						>
						<Box width={{sm: '100%', md: '28%'}} bgColor='gray.700' border='1px' borderColor='rgba(255, 255, 255, 0.06)' rounded={15}>
							<Collateral handleChange={handleChange} />
						</Box>
						<Box width={{sm: '100%', md: '72%'}} bgColor='gray.700' border='1px' borderColor='rgba(255, 255, 255, 0.06)' rounded={15}>
							<Borrow />
						</Box>
					</Flex>

					<Flex
						flexDirection={{
							sm: 'column',
							md: 'column',
							lg: 'row',
						}}
						justifyContent="space-between"
						gap={10}
						flexWrap="wrap">
						<Box {...TableStyle} bg='gray.800' border='1px' borderColor='rgba(255, 255, 255, 0.03)' rounded={15}>
							<IssuanceTable handleChange={handleChange} />
						</Box>
					</Flex>
				</Flex>
			}
		</>
	);
}

export default App;
