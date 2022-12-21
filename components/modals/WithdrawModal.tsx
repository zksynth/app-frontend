import React, { useContext, useState } from 'react';
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
    Input,
    IconButton,
	InputRightElement,
	InputGroup,Spinner,Link, Alert, AlertIcon
} from '@chakra-ui/react';

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from '@chakra-ui/react';

import { BiMinusCircle } from 'react-icons/bi';

import { AiOutlineInfoCircle } from 'react-icons/ai';
import { getContract, send } from '../../src/contract';
import { WalletContext } from '../context/WalletContextProvider';
import { AppDataContext } from '../context/AppDataProvider';
const { Big } = require("big.js");
import axios from 'axios';
import { ChainID } from '../../src/chains';
import { useAccount } from 'wagmi';

const WithdrawModal = ({ asset, handleWithdraw }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [amount, setAmount] = React.useState(0);
	
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);

	const { isConnected, tronWeb } = useContext(WalletContext)
	const { safeCRatio, totalCollateral, totalDebt, chain, explorer } = useContext(AppDataContext)
	const {address: evmAddress, isConnected: isEvmConnected, isConnecting: isEvmConnecting} = useAccount();

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setAmount(0);
		onClose();
	}

	const max = () => {
		return (0.999 * (totalCollateral * 100 / safeCRatio) - totalDebt)/asset.price;
	} 

	const changeAmount = (event: any) =>{
		setAmount(event.target.value);
	}

	const setMax = () =>{
		setAmount(max());
	}

	const withdraw = async () => {
		if(!amount) return
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse('');
		let synthex = await getContract("SyntheX", chain);
		let value = Big(amount).mul(Big(10).pow(Number(asset.inputToken.decimals))).toFixed(0);
		send(synthex, 'withdraw', [asset.id, value], chain)
		.then(async (res: any) => {
			setLoading(false);
			setResponse('Transaction sent! Waiting for confirmation...');
			if (chain == ChainID.NILE) {
				setHash(res);
				checkResponse(res);
			} else {
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleWithdraw(asset.id, value)
				setResponse('Transaction Successful!');
			}
		})
		.catch((err: any) => {
			setLoading(false);
			setConfirmed(true);
			setResponse('Transaction failed. Please try again!');
		});
	}

	const checkResponse = (tx_id: string, retryCount = 0) => {
		axios
			.get(
				'https://nile.trongrid.io/wallet/gettransactionbyid?value=' +
					tx_id
			)
			.then((res) => {
				console.log(res);
				if (!res.data.ret) {
					setTimeout(() => {
						checkResponse(tx_id);
					}, 2000);
				} else {
					setConfirmed(true);
					if (res.data.ret[0].contractRet == 'SUCCESS') {
						setResponse('Transaction Successful!');
						handleWithdraw(asset['coll_address'], Big(amount).mul(Big(10).pow(Number(asset['decimal']))).toFixed(0))
					} else {
						if (retryCount < 3)
							setTimeout(() => {
								checkResponse(tx_id, retryCount + 1);
							}, 2000);
						else {
							setResponse(
								'Transaction Failed. Please try again.'
							);
						}
					}
				}
			});
	};
	return (
		<Box>
			<IconButton 
			// disabled={!isConnected} 
			variant="ghost" onClick={onOpen} icon={<BiMinusCircle size={37} color="gray" />} aria-label={''} isRound={true}>
			</IconButton>
			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg='blackAlpha.100'
                    backdropFilter='blur(30px)' />
				<ModalContent width={'30rem'}>
					<ModalCloseButton />
                    <ModalHeader>Withdraw {asset['symbol']}</ModalHeader>
					<ModalBody>
					<InputGroup size='md'>
						<Input
							type="number"
							placeholder='Enter amount'
							onChange={changeAmount}
							value={amount}
						/>
						<InputRightElement width='4.5rem'>
							<Button h='1.75rem' size='sm' mr={1} onClick={setMax}>
								Set Max
							</Button>
						</InputRightElement>
						</InputGroup>
                        <Flex mt={4} justify="space-between">
						<Text fontSize={"xs"} color="gray.400" >1 {asset['symbol']} = {(asset['price'])} USD</Text>
                        </Flex>
                        <Button 
							disabled={loading || !(isConnected || isEvmConnected) || !amount || amount == 0 || amount > max()}
							loadingText='Please sign the transaction'
							isLoading={loading}
							colorScheme={"red"} width="100%" mt={4} onClick={withdraw}

						>
							{(isConnected || isEvmConnected)? (amount > max()) ? <>Insufficient Collateral</> : (!amount || amount == 0) ?  <>Enter amount</> : <>Withdraw</> : <>Please connect your wallet</>} 
						</Button>
					
						{response && (
							<Box width={'100%'} my={2} color="black">
								<Alert
									status={
										response.includes('confirm')
											? 'info'
											: confirmed &&
											  response.includes('Success')
											? 'success'
											: 'error'
									}
									variant="subtle"
									rounded={6}>
									<AlertIcon />
									<Box>
										<Text fontSize="md" mb={0}>
											{response}
										</Text>
										{hash && (
											<Link
												href={
													explorer() +
													hash
												}
												target="_blank">
												{' '}
												<Text fontSize={'sm'}>
													View on explorer
												</Text>
											</Link>
										)}
									</Box>
								</Alert>
							</Box>
						)}
					</ModalBody>
                    <ModalFooter>

                            <AiOutlineInfoCircle size={20} />
                        <Text ml="2"> 
                            More Info
                            </Text>
                        </ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
};


export default WithdrawModal;
