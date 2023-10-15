import { Flex, Text, Image, ModalOverlay, ModalCloseButton, Modal, ModalBody, ModalContent, ModalHeader, Box, Heading, Divider, IconButton, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { defaultChain, dollarFormatter, tokenFormatter } from '../../../src/const';
import Big from 'big.js';
import { usePriceData } from '../../context/PriceContext';
import { VARIANT } from '../../../styles/theme';
import { MdOpenInNew } from 'react-icons/md';

export default function Details({pool, isOpen, onClose}: any) {
	
	const { prices } = usePriceData();

	const liquidity = pool.tokens.reduce((acc: any, token: any) => {
		return acc + Big(token.balance ?? 0).mul(prices[token.token.id] ?? 0).toNumber()
	}, 0)

	const calcApy = () => {
		let totalFees = fees7Days() / 2;
		const dailyFee = totalFees / pool.snapshots.length;
		if(liquidity == 0) return (dailyFee * 365);
		const dailyApy = ((1 + dailyFee / liquidity) ** 365) - 1;
		return dailyApy * 100;
	}

	const fees7Days = () => {
		let totalFees = 0;
		if(pool.snapshots.length > 1){
			totalFees = Number(pool.snapshots[0].swapFees) - Number(pool.snapshots[pool.snapshots.length-1].swapFees);
		}
		return totalFees;
	}

	const fees24hrs = () => {
		let totalFees = 0;
		// pool.snapshots[-1].swapFees - pool.snapshots[-2].swapFees
		if(pool.snapshots.length > 1){
			totalFees = Number(pool.snapshots[0].swapFees) - Number(pool.snapshots[1].swapFees);
		}
		return totalFees;
	}

    const {colorMode} = useColorMode();

  	return (<>
    <Modal
		isCentered
		isOpen={isOpen}
		onClose={onClose}
	>
		<ModalOverlay bg='blackAlpha.800' backdropFilter='blur(10px)' />
		<ModalContent width={"30rem"} bgColor="transparent" shadow={0} rounded={0} mx={2}>
			<ModalCloseButton variant={'ghost'} rounded={"0"} mt={1} />
			<Box className={`${VARIANT}-${colorMode}-containerBody2`}>
			<ModalHeader>
				<Flex justify={'space-between'}>
				<Flex
					justify={"start"}
					gap={2}
					pt={1}
					px={4}
					align={"center"}
				>
					<Flex ml={-4}>
						{pool.tokens.map(
							(token: any, index: number) => {
								return (
									pool.address !== token.token.id && (
										<Flex
											ml={"-2"}
											key={index}
											align="center"
											gap={2}
										>
											<Image
												rounded={"full"}
												src={`/icons/${token.token.symbol}.svg`}
												alt=""
												width={"30px"}
											/>
										</Flex>
									)
								);
							}
						)}
					</Flex>
					<Text>{pool.name}</Text>
				</Flex>
				</Flex>
			</ModalHeader>
			<ModalBody p={0}>
				<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 
				<Flex bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'} px={4} py={3} align={'center'} gap={1} _hover={{cursor: 'pointer'}} onClick={() => window.open(defaultChain.blockExplorers.default.url + '/address/' + pool.address)}>
					<Text fontSize={'sm'}>{pool.address}</Text>
					<MdOpenInNew size={'14px'}/>
				</Flex>
				<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 

				<Box bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'}>
				<Flex>
				<Box mx={4} my={4}>
					<Text mt={2} mb={2}>Total Value Locked</Text>
					<Flex gap={2} flexDir={'column'}>
						<Heading size={'md'}>
					{dollarFormatter.format(liquidity)}
					</Heading>
					</Flex>
				</Box>

				<Divider orientation="vertical" h={'110px'} />

				<Box mx={4} my={4}>
					<Text mt={2} mb={2}>Total Swap Volume</Text>
					<Flex gap={2} flexDir={'column'}>
						<Heading size={'md'}>
						{dollarFormatter.format(pool.totalSwapVolume)}
						</Heading>
					</Flex>
				</Box>

				</Flex>

				<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 

				<Flex>
				<Box mx={4} my={4}>
					<Text mt={2} mb={2}>Fees Generated</Text>
					<Flex gap={8}>
						<Box>
							<Text color={'whiteAlpha.700'} fontSize={'xs'} mb={1}>24hr</Text>
							<Heading size={'md'}>
							{dollarFormatter.format(fees24hrs())}
							</Heading>
						</Box>

						<Box>
							<Text color={'whiteAlpha.700'} fontSize={'xs'} mb={1}>7 Days</Text>
							<Heading size={'md'}>
							{dollarFormatter.format(fees7Days())}
							</Heading>
						</Box>

						<Box>
							<Text color={'whiteAlpha.700'} fontSize={'xs'} mb={1}>Total</Text>
							<Heading size={'md'}>
							{dollarFormatter.format(pool.totalSwapFee)}
							</Heading>
						</Box>
					</Flex>
				</Box>

				<Divider orientation="vertical" h={'130px'} />

				<Box mx={4} my={4}>
					<Text mt={2} mb={2}>APR</Text>
					<Box>
						<Text color={'whiteAlpha.700'} fontSize={'xs'} mb={1}>7d Annualized</Text>
						<Heading size={'md'}>
						{(calcApy()).toFixed(2)} %
						</Heading>
					</Box>
				</Box>
				</Flex>

				<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 

				<Box mx={4} my={0}>
					<Heading size={'md'} mt={2} mb={4}>Pool Composition</Heading>
					<Flex gap={2} flexDir={'column'}>
					{pool.tokens.map((token: any, index: number) => {
						if(token.token.id == pool.address) return <></>
						return <Flex key={index} justify={'space-between'} >
							<Flex gap={2}>
							<Image
								rounded={"full"}
								src={`/icons/${token.token.symbol}.svg`}
								alt=""
								width={"30px"}
							/>
							<Text>{token.token.symbol}</Text>
							<Text>({liquidity > 0 && Big(token.balance ?? 0).mul(prices[token.token.id] ?? 0).div(liquidity).mul(100).toFixed(2)}%)</Text>
							</Flex>
							<Text size={'md'}>{tokenFormatter.format(token.balance)} ({dollarFormatter.format(Big(token.balance ?? 0).mul(prices[token.token.id] ?? 0).toNumber())})</Text>
						</Flex>
					})}
					</Flex>
				</Box>
				</Box>
				<Box className={`${VARIANT}-${colorMode}-containerFooter2`} h={6}></Box>
			</ModalBody>
		</Box>
		</ModalContent>
    </Modal>
    </>
  )
}
