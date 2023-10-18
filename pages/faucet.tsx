import { Box, Button, Flex, Heading, IconButton, useColorMode, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tr,
	TableContainer,
    Text,
    Image
} from "@chakra-ui/react";
import { AppDataContext } from "../components/context/AppDataProvider";

const nonMintable = ["MNT", "WETH", 'WMNT'];
const startWithNonMintable = ["a", "s"]

const mintAmounts: any = {
    "USDT": "1000",
	"DAI": "1000",
	"EUROC": "1000",
	"WETH": "1",
    "AAVE": "10",
    "LINK": "10",
    "Link": "10",
    "wstETH": "10",
    "ARB": '10', 
    // in use
	"USDC": "1000",
    "WBTC": "0.1",
    "ETH": "1",
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
import { useBalanceData } from "../components/context/BalanceProvider";
import Big from "big.js";
import ThBox from "../components/dashboard/ThBox";
import TdBox from "../components/dashboard/TdBox";
import { VARIANT } from "../styles/theme";

export default function Faucet() {
	const { pools } = useContext(AppDataContext);
    const { updateFromTx } = useBalanceData();
    const [loading, setLoading] = React.useState<any>(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [openedCollateral, setOpenedCollateral] = React.useState<any>(null);

    const {address, isConnected}  = useAccount();
    const {chain} = useNetwork();

    const { tokens, walletBalances } = useBalanceData();

    const _onOpen = (collateral: any) => {
        setOpenedCollateral(collateral);
        onOpen();
    }

    const _onClose = () => {
        setOpenedCollateral(null);
        setLoading(false);

        onClose();
    }

    const toast = useToast();

    const mint = async () => {
        setLoading(true);
        const token = await getContract("MockToken", chain?.id!, openedCollateral.id);
        send(token, "mint(address)", [address])
            .then(async(res: any) => {
                let response = await res.wait();
                updateFromTx(response);
                setLoading(false);
                toast({
                    title: `Minted ${openedCollateral.symbol}`,
                    description: `${mintAmounts[openedCollateral.symbol]} ${openedCollateral.symbol} minted to your wallet.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right'
                })
                onClose();
            })
            .catch((err: any) => {
                console.log(err);
                setLoading(false);
            });
    };

    const addToMetamask = async (token: any) => {
        (window as any).ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', // Initially only supports ERC20, but eventually more!
              options: {
                address: token.id, // The address that the token is at.
                symbol: token.symbol, // A ticker symbol or shorthand, up to 5 chars.
                decimals: token.decimals, // The number of decimals in the token
                image: process.env.NEXT_PUBLIC_VERCEL_URL + '/icons/'+token.symbol+'.svg', // A string url of the token logo
              },
            }
        });
    }

    const validate = () => {
        if(!isConnected) return {valid: false, message: "Please connect your wallet."}
        else if(chain?.unsupported) return {valid: false, message: "Unsupported network"}
        else return {valid: true, message: "Mint"}
    }

	const { colorMode } = useColorMode();

	return (
		<>
        <Head>
				<title>Test Faucet | {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}</title>
				<link rel="icon" type="image/x-icon" href={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}.svg`}></link>
			</Head>
			<Heading mt={'80px'} fontSize={"3xl"}>Faucet</Heading>
            <Text color={colorMode == 'dark' ? 'whiteAlpha.500' : 'blackAlpha.500'} mt={2} mb={10}>
                Note: This is a testnet faucet. These tokens are not real and have no value.
            </Text>

			<TableContainer px={4} pb={4} className={`${VARIANT}-${colorMode}-containerBody`} rounded={12}>
				<Table variant="simple">
					<Thead>
						<Tr>
							<ThBox>Asset</ThBox>
							<ThBox>Mint Amount</ThBox>
							<ThBox isNumeric></ThBox>
						</Tr>
					</Thead>
					<Tbody>
                        {tokens.map((token: any, index: number) => {
                            if(nonMintable.includes(token.symbol) || token.symbol.startsWith(startWithNonMintable[0]) || token.symbol.startsWith(startWithNonMintable[1])) return;
                            return <Tr key={index}>
                                <TdBox style={index == token.length - 1 ? {border: 0} : {}}>
                                    <Flex gap={2}>
                                    <Image src={`/icons/${token.symbol}.svg`} w='34px'/>
                                        <Box>
                                            <Flex align={'center'} gap={2}>
                                                <Text>{token.symbol}</Text>
                                                <IconButton
                                                    icon={
                                                        <Image
                                                            src="https://cdn.consensys.net/uploads/metamask-1.svg"
                                                            w={"20px"}
                                                            alt=""
                                                        />
                                                    }
                                                    onClick={() => addToMetamask(token)}
                                                    size={"xs"}
                                                    rounded="full"
                                                    aria-label={""}
                                                />
                                            </Flex>
                                            <Text textAlign={'left'} fontSize={'sm'} color='gray.500'>
                                            {Big(walletBalances[token.id] ?? 0).div(10**token.decimals).toNumber()} in wallet
                                            </Text>
                                        </Box>
                                    </Flex>
                                </TdBox>
                                <TdBox style={index == tokens.length - 1 ? {border: 0} : {}}>{mintAmounts[token.symbol]}</TdBox>
                                <TdBox style={index == tokens.length - 1 ? {border: 0} : {}} isNumeric>
                                <Flex justify={'end'}>
                                    <Box className={`${VARIANT}-${colorMode}-primaryButton`}>
                                        <Button
                                            onClick={() => _onOpen(token)}
                                            color={"white"}
                                            size={"md"} 
                                            bg={'transparent'} 
                                            _hover={{bg: 'transparent'}}
                                        >
                                            Mint
                                        </Button>
                                    </Box>
                                </Flex>
                            </TdBox>
                            </Tr>
                        })}
					</Tbody>
				</Table>
			</TableContainer>

            {openedCollateral && <Modal isOpen={isOpen} onClose={_onClose} isCentered>
                <ModalOverlay />
                <ModalContent rounded={0} bg={'transparent'} shadow={0} width={'400px'}>
                    <Box className={`${VARIANT}-${colorMode}-containerBody2`}>
                <ModalHeader>{openedCollateral.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody >
                    <Flex gap={4}>
                    <Image alt={openedCollateral.symbol} src={`/icons/${openedCollateral.symbol}.svg`} w='44px' mb={2}/>
                    <Box  mb={2}>
                        <Text color={'blackAlpha.600'}>
                            You are about to mint {mintAmounts[openedCollateral.symbol]} {openedCollateral.symbol} tokens.
                        </Text>
                    </Box>
                    </Flex>
                </ModalBody>

            <ModalFooter justifyContent={'center'}>
            <Box w={'100%'} className={`${VARIANT}-${colorMode}-primaryButton`}>

                <Button w={'100%'} isDisabled={!validate().valid} color={"white"} size={"lg"} bg={'transparent'} 
					_hover={{bg: 'transparent'}} loadingText="Minting" isLoading={loading} mb={0} rounded={0} onClick={mint}
                >
                    {validate().message}
                </Button>
                </Box>
            </ModalFooter>
            </Box>
            </ModalContent>
        </Modal>}

		</>
	);
}
