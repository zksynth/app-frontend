import { Box, Button, Flex, Heading, useDisclosure } from "@chakra-ui/react";
import React, { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
    Text,
    Image
} from "@chakra-ui/react";
import { AppDataContext } from "../components/context/AppDataProvider";
import { useEffect } from "react";

const nonMintable = ["ETH", "waArbUSDC", "USDC"];

const mintAmounts: any = {
	"USDC": "10000",
	"USDT": "10000",
	"DAI": "10000",
	"EUROC": "10000",
	"WETH": "10",
    "AAVE": "100",
    "WBTC": "0.5",
    "LINK": "100",
    "wstETH": "10",
};

import Head from "next/head";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'
import { getContract, send } from "../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { ethers } from "ethers";

export default function Faucet() {
	const [collaterals, setCollaterals] = React.useState<any>([]);
	const { pools, updateCollateralWalletBalance } = useContext(AppDataContext);
    const [loading, setLoading] = React.useState<any>(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [openedCollateral, setOpenedCollateral] = React.useState<any>(null);

    const {address, isConnected}  = useAccount();
    const {chain} = useNetwork();

	useEffect(() => {
		if (collaterals.length == 0) {
			// filter out non-mintable assets from pool[].collaterals
			let _collaterals: string[] = [];
			for (let i = 0; i < pools.length; i++) {
				for (let j = 0; j < pools[i].collaterals.length; j++) {
					if (!nonMintable.includes(pools[i].collaterals[j].token.symbol)) {
						_collaterals.push(pools[i].collaterals[j]);
					}
				}
			}
			// delete duplicates
			_collaterals = _collaterals.filter(
				(item, index) => _collaterals.indexOf(item) === index
			);

			setCollaterals(_collaterals);
		}
	});

    const _onOpen = (collateral: any) => {
        setOpenedCollateral(collateral);
        onOpen();
    }

    const mint = async () => {
        setLoading(true);
        const token = await getContract("MockToken", chain?.id!, openedCollateral.token.id);
        const amount = ethers.utils.parseEther(mintAmounts[openedCollateral.token.symbol]);
        send(token, "mint", [address, amount])
            .then(async(res: any) => {
                setLoading(false);
                await res.wait(1);
                updateCollateralWalletBalance(openedCollateral.token.id, pools[0].id, amount.toString(), false);
                updateCollateralWalletBalance(openedCollateral.token.id, pools[1].id, amount.toString(), false);
                onClose();
            })
            .catch((err: any) => {
                console.log(err);
                setLoading(false);
            });
    };

	return (
		<>
        <Head>
				<title>Test Faucet | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Heading mt={'80px'} fontSize={"3xl"}>Faucet</Heading>
            <Text color={'gray.400'} mb={10}>
                Note: This is a testnet faucet. These tokens are not real and have no value.
            </Text>

			<TableContainer bg={'whiteAlpha.50'} border='2px' borderColor={'whiteAlpha.100'} rounded={8} pt={1}>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>Asset</Th>
							<Th>Mint Amount</Th>
							<Th isNumeric></Th>
						</Tr>
					</Thead>
					<Tbody>
                        {collaterals.map((collateral: any, index: number) => (
                            <Tr key={index}>
							<Td>
                                <Flex gap={2}>
                                <Image src={`/icons/${collateral.token.symbol}.svg`} w='34px'/>
                                    <Box>
                            <Text >
                                {collateral.token.name} 
                                
                            </Text>
                            <Text fontSize={'sm'} color='gray.400'>
                            {collateral.token.symbol}
                            </Text>
                                    </Box>
                                </Flex>
                                
                            </Td>
							<Td>{mintAmounts[collateral.token.symbol]}</Td>
							<Td isNumeric>
                                <Button fontSize={'md'} rounded='full' onClick={() => _onOpen(collateral)}>Mint</Button>
                            </Td>
						</Tr>
                        ))}
						
					</Tbody>
				</Table>
			</TableContainer>

            {openedCollateral && <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent width={'400px'}>
            <ModalHeader>{openedCollateral.token.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody >
                <Flex gap={4}>

                <Image alt={openedCollateral.token.symbol} src={`/icons/${openedCollateral.token.symbol}.svg`} w='44px' mb={2}/>
                <Box  mb={2}>

                <Text color={'gray.400'}>
                    You are about to mint {mintAmounts[openedCollateral.token.symbol]} {openedCollateral.token.symbol} tokens.
                </Text>
                </Box>
                </Flex>
                
            </ModalBody>

            <ModalFooter justifyContent={'center'}>
                <Button isDisabled={!isConnected} size={'md'} loadingText="Minting" isLoading={loading} bg='secondary.400' color={'white'} mb={0} rounded={16} onClick={mint} width='100%'>
                {isConnected ? 'Mint' : 'Please Connect Your Wallet'}
                </Button>
            </ModalFooter>
            </ModalContent>
        </Modal>}

		</>
	);
}
