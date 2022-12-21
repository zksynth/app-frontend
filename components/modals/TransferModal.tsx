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
	InputGroup,
	Spinner,
	Link,
	Select,
	Alert,
	AlertIcon,
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

import { BsArrowDown } from 'react-icons/bs';
import { AiOutlineInfoCircle, AiOutlineSwap } from 'react-icons/ai';
import { getAddress, getContract, send } from '../../src/contract';
import { useEffect } from 'react';
import { WalletContext } from '../context/WalletContextProvider';
import { AppDataContext } from '../context/AppDataProvider';
import axios from 'axios';
import { ChainID } from '../../src/chains';
import { useAccount } from 'wagmi';

const TransferModal = ({ asset, handleUpdate }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [amount, setAmount] = React.useState(0);
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);

	const [inputPoolIndex, setInputPoolIndex] = React.useState(0);
	const [outputPoolIndex, setOutputPoolIndex] = React.useState(1);

	const { isConnected } = useContext(WalletContext);
 
	const { chain, pools, explorer } = useContext(AppDataContext);

	const changeAmount = (event: any) => {
		setAmount(event.target.value);
	};
	const setMax = () => {
		setAmount(max());
	};

	const max = () => {
		return (0.999 * asset.amount[inputPoolIndex]) / 10 ** asset.decimal;
	};

	const transfer = async () => {
		if (!amount) return;
		let system = await getContract('System', chain);
		let value = BigInt(amount * 10 ** (asset['decimal'] ?? 18)).toString();

		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse('');

		let tx =
			inputPoolIndex == 0
				? send(system, 'enterPool', [outputPoolIndex, asset['synth_id'], value], chain)
				: send(system, 'exitPool', [inputPoolIndex, asset['synth_id'], value], chain);

		tx.then(async (res: any) => { 
			setLoading(false);
			setResponse('Transaction sent! Waiting for confirmation...');
			if (chain == ChainID.NILE) {
				setHash(res);
				checkResponse(res);
			} else {
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				setResponse('Transaction Successful!');
			}
		})
		.catch((err: any) => {
			setLoading(false);
			setConfirmed(true);
			setResponse('Transaction failed. Please try again!');
		});
	};

	const inputPoolChange = (event: any) => {
		if (outputPoolIndex == event.target.value) {
			setOutputPoolIndex(inputPoolIndex);
		}
		if (outputPoolIndex != 0 && event.target.value != 0) {
			setOutputPoolIndex(0);
		}
		setInputPoolIndex(event.target.value);
	};

	const outputPoolChange = (event: any) => {
		if (inputPoolIndex == event.target.value) {
			setInputPoolIndex(outputPoolIndex);
		}
		if (inputPoolIndex != 0 && event.target.value != 0) {
			setInputPoolIndex(0);
		}
		setOutputPoolIndex(event.target.value);
	};

	const checkResponse = (tx_id: string, retryCount = 0) => {
		axios
			.get(
				'https://nile.trongrid.io/wallet/gettransactionbyid?value=' +
					tx_id
			)
			.then((res: any) => {
				console.log(res);
				if (!res.data.ret) {
					setTimeout(() => {
						checkResponse(tx_id);
					}, 2000);
				} else {
					setConfirmed(true);
					if (res.data.ret[0].contractRet == 'SUCCESS') {
						setResponse('Transaction Successful!');
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
	const {address: evmAddress, isConnected: isEvmConnected, isConnecting: isEvmConnecting} = useAccount();

	return (
		<Box>
			<IconButton
				disabled={!(isConnected || isEvmConnected)}
				variant="ghost"
				onClick={onOpen}
				icon={<AiOutlineSwap color="gray.100" />}
				_hover={{ bg: 'none' }}
				aria-label={''}
				isRound={true}
				mr={-3}
				height={'24px'}></IconButton>
			<Modal isCentered isOpen={isOpen} onClose={onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={'30rem'}>
					<ModalCloseButton />
					<ModalHeader>Transfer {asset?.symbol}</ModalHeader>
					<ModalBody>
						<Select
							value={inputPoolIndex}
							onChange={inputPoolChange}
							disabled={!isConnected}>
							{pools.map((pool: any, index) => {
								return (
									<option key={index} value={index}>
										{pool.name}
									</option>
								);
							})}
						</Select>
						<InputGroup size="md">
							<Input
								disabled={!(isConnected || isEvmConnected)}
								type="number"
								placeholder={`Enter ${asset?.symbol} amount`}
								onChange={changeAmount}
								value={amount}
							/>

							<InputRightElement width="4.5rem">
								<Button
									disabled={!(isConnected || isEvmConnected)}
									h="1.75rem"
									size="sm"
									mr={1}
									onClick={setMax}>
									Set Max
								</Button>
							</InputRightElement>
						</InputGroup>

						<Box my={5}>
							<BsArrowDown />
						</Box>

						<Select
							disabled={!(isConnected || isEvmConnected)}
							value={outputPoolIndex}
							onChange={outputPoolChange}>
							{pools.map((pool: any, index) => {
								return (
									<option key={index} value={index}>
										{pool.name}
									</option>
								);
							})}
						</Select>

						<Flex mt={4} justify="space-between">
							<Text fontSize={'xs'} color="gray.400">
								1 {asset?.symbol} = {asset?.price} USD
							</Text>
						</Flex>

						<Button
							disabled={
								loading ||
								!(isConnected || isEvmConnected) ||
								!amount ||
								amount == 0 ||
								amount > max()
							}
							loadingText="Please sign the transaction"
							isLoading={loading}
							bgColor="#3EE6C4"
							width="100%"
							mt={4}
							onClick={transfer}>
							{(isConnected || isEvmConnected) ? (
								amount > max() ? (
									<>Insufficient Collateral</>
								) : !amount || amount == 0 ? (
									<>Enter amount</>
								) : (
									<>
										Transfer
										<AiOutlineSwap />
									</>
								)
							) : (
								<>Please connect your wallet</>
							)}
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
						<Text ml="2">More Info</Text>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default TransferModal;
