import { Box, Divider, Flex, Text, Image } from '@chakra-ui/react';
import React, { useContext, useState } from 'react';
import { useAccount } from 'wagmi';
import { AppDataContext } from '../context/AppDataProvider';
import DepositModal from '../modals/DepositModal';
import WithdrawModal from '../modals/WithdrawModal';
import { WalletContext } from '../context/WalletContextProvider';
import { dollarFormatter, tokenFormatter } from '../../src/const';

export default function Collateral({ handleChange }: any) {
	const [nullValue, setNullValue] = useState(false);

	const {
		totalCollateral,
		collaterals,
		updateCollateralWalletBalance,
		updateCollateralAmount,
	} = useContext(AppDataContext);

	const { isConnected, tronWeb } = useContext(WalletContext);

	
	const handleWithdraw = (collateral: string, value: string) => {
		updateCollateralWalletBalance(collateral, value, false);
		updateCollateralAmount(collateral, value, true);
		setNullValue(!nullValue);
		handleChange();
	};

	const handleDeposit = (collateral: string, value: string) => {
		updateCollateralWalletBalance(collateral, value, true)
		updateCollateralAmount(collateral, value, false)
		setNullValue(!nullValue);
		handleChange()
	}

	const {address: evmAddress, isConnected: isEvmConnected, isConnecting: isEvmConnecting} = useAccount();

	return (
		<Box pb={4} height='100%'>
			<Flex
				flexDir={'column'}
				justify="space-between"
				height={'200px'}
				bgColor="gray.200"
				width={'100%'}
				color="black"
				p={'12px'}
				rounded={10}>
				<Box>
					<Text fontSize='md' color='gray.600'>
						Balance
					</Text>
					<Text fontSize={'3xl'} mt={-1} fontWeight="bold">
						{dollarFormatter?.format(totalCollateral)}
					</Text>
				</Box>
				<Box>
					<DepositModal handleDeposit={handleDeposit}/>
				</Box>
			</Flex>

			<Box>
			{collaterals.map((collateral, index) => (
				<>
				<Flex
					key={index}
					justify="space-between"
					p={'12px'}
					mt="12px"
					>
					<Flex>
						<Image
							src={`https://raw.githubusercontent.com/synthe-x/assets/main/${collateral.inputToken.symbol?.toUpperCase()}.png`}
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
								{(isConnected || isEvmConnected)
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
				{(index != (collaterals.length - 1)) && <Divider width={'90%'} mx='auto' borderColor={'#3C3C3C'} />}
				</>
			))}
			</Box>

		</Box>
	);
}
