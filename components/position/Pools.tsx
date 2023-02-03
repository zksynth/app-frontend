import { Box, Divider, Flex, Text, Image, Skeleton, Button } from '@chakra-ui/react';
import React, { useContext, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { AppDataContext } from '../context/AppDataProvider';
import WithdrawModal from '../modals/Withdraw';
import { dollarFormatter, tokenFormatter } from '../../src/const';
import { BsFillCaretDownFill, BsFillCaretUpFill } from 'react-icons/bs';

export default function Collateral({ handleChange }: any) {
	const [nullValue, setNullValue] = useState(false);
	const [displayLimit, setDisplayLimit] = useState(2);

	const {
		collaterals,
		updateCollateralWalletBalance,
		updateCollateralAmount,
	} = useContext(AppDataContext);
	
	const handleWithdraw = (collateral: string, value: string) => {
		updateCollateralWalletBalance(collateral, value, false);
		updateCollateralAmount(collateral, value, true);
		setNullValue(!nullValue);
		handleChange();
	};	

	const {isConnected} = useAccount();
	const {chain: activeChain} = useNetwork();

	return (
		<Box height='100%'>
			

			{ collaterals.length > 0 ? <Box>
			{collaterals.slice(0, displayLimit).map((collateral, index) => (
				<>
				<Flex
					key={index}
					justify="space-between"
					p={'12px'}
					my={1}
					mt={index == 0 ? 3 : 1}
					>
					<Flex>
						<Image
							src={`/icons/${collateral.inputToken.symbol}.svg`}
							width={35}
							height={35}
							alt="logo"
						/>
						<Box ml={2}>
							<Text
								fontSize="sm"
								fontWeight="bold"
								textAlign={'left'}>
								{collateral['name']}
							</Text>
							<Text
								fontSize="xs"
								fontWeight="light"
								textAlign={'left'} color='primary'>
								{(isConnected && !activeChain?.unsupported)
									? tokenFormatter.format(
											collateral.balance /
												10 ** collateral.inputToken.decimals
									  )
									: '-'}{' '}
								{collateral.inputToken.symbol}
							</Text>
							
						</Box>
					</Flex>

					<WithdrawModal
						asset={collateral}
						handleWithdraw={handleWithdraw}
					/>
				</Flex>
				<Divider width={'90%'} mx='auto' borderColor={'gray.600'} />
				</>
			))}

			<Flex justify='center' my={1}>
			<Button size={'xs'} variant='unstyled' color={'gray.400'} display='flex' gap={1} onClick={() => setDisplayLimit( displayLimit == 2 ? collaterals.length : 2)}>View { displayLimit == 2 ? <>More <BsFillCaretDownFill/> </> : <>Less <BsFillCaretUpFill/> </>} </Button>
			</Flex>
			</Box> : <>
			
			<Skeleton
					color={"gray"}
					bgColor={"gray"}
					height={"20px"}
					my={5}
					mx={5}
					rounded={"10"}
				></Skeleton>
			</>}

		</Box>
	);
}
