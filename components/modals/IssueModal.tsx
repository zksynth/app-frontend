import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Link,
	Alert,
	AlertIcon,
	Select,
} from "@chakra-ui/react";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { getContract, send } from "../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { dollarFormatter, tokenFormatter } from '../../src/const';
import Big from "big.js";
import InputWithSlider from '../inputs/InputWithSlider';
import { MdOutlineAddCircle } from "react-icons/md";
import Response from "./utils/Response";
import InfoFooter from "./utils/InfoFooter";

const ROUNDING = 0.98;

const IssueModal = ({ asset, handleIssue }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState('');

	const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

	const [amount, setAmount] = React.useState(0);

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setMessage('');
		setAmount(0);
		onClose();
	};

	const { chain, togglePoolEnabled, adjustedCollateral, adjustedDebt, safeCRatio } =
		useContext(AppDataContext);

	const max = () => {
		if(!Number(safeCRatio)) return 0;
		if(!Number(asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD)) return NaN;
		// MAX = ((Ac/safeC) - Ad)*Vr
		return Big(asset.maximumLTV/100).times(Big(adjustedCollateral).div(safeCRatio).minus(adjustedDebt)).div(asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD).toNumber();
	};

	const issue = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse('');
		setMessage('');

		let synthex = await getContract("SyntheX", chain);
		let value = Big(amount).times(10 ** asset.inputToken.decimals).toFixed(0);
		console.log(value)
		send(synthex, 'issue', [asset.id, asset._mintedTokens[selectedAssetIndex].id, value], chain)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				handleIssue(asset._mintedTokens[selectedAssetIndex].id, value);
				if (!asset.isEnabled) togglePoolEnabled(asset.id);
				setResponse("Transaction Successful!");
				setMessage(`You have successfully issued ${tokenFormatter.format(amount)} ${asset._mintedTokens[selectedAssetIndex].symbol}`)
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
				setMessage(JSON.stringify(err));
			});
	};

	const { isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();

	return (
		<Box>
			<Button
				onClick={onOpen}
				variant={"ghost"}
				size="md"
				bgColor={"secondary"}
				rounded={100}
				color="white"
				my={1}
				_hover={{ opacity: 0.6 }}
			>
				<MdOutlineAddCircle /> <Text ml={1}>Mint</Text>
			</Button>
			<Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay bg="blackAlpha.100" backdropFilter="blur(30px)" />
				<ModalContent width={"30rem"} bgColor="">
					<ModalCloseButton />
					<ModalHeader>Issue</ModalHeader>
					<ModalBody>
						<Flex justify={'space-between'}>
							<Text fontSize='xs'>Price: {dollarFormatter.format(asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD)}</Text>
							<Text fontSize='xs'>Available to borrow: {dollarFormatter.format(asset._mintedTokens[selectedAssetIndex]?.lastPriceUSD * max())}</Text>
						</Flex>
						<Select my={2} placeholder="Select asset to issue" value={selectedAssetIndex} onChange={(e) => setSelectedAssetIndex(parseInt(e.target.value))}>
							{asset._mintedTokens.map((token: any, index: number) => (
								<option value={index} key={index}>
									{token.symbol}
								</option>
							))}
						</Select>
						<InputWithSlider 
						asset={asset._mintedTokens[selectedAssetIndex]} 
						max={max()} 
						softMax={ROUNDING * max()}
						min={0}
						onUpdate={(_value: any) => {
							setAmount(_value);
						}}
						color='secondary'
						/>
						<Flex mt={2} justify="space-between">
							{/* <Text fontSize={"xs"} color="gray.400">
								1 {asset._mintedTokens[selectedAssetIndex].symbol} = {asset._mintedTokens[selectedAssetIndex].lastPriceUSD}{" "}
								USD
							</Text> */}
							<Text fontSize={"xs"} color="gray.400">
								Market LTV ={" "}
								{parseFloat(asset.maximumLTV)} %
							</Text>
						</Flex>
						<Button
							disabled={
								loading ||
								!(isConnected) || 
								activeChain?.unsupported ||
								!amount ||
								amount == 0 ||
								amount > max()
							}
							isLoading={loading}
							loadingText="Please sign the transaction"
							bgColor="secondary"
							width="100%"
							mt={4}
							onClick={issue}
						>
							{isConnected && !activeChain?.unsupported ? (
								amount > max() ? (
									<>Insufficient Collateral</>
								) : !amount || amount == 0 ? (
									<>Enter amount</>
								) : (
									<>Issue</>
								)
							) : (
								<>Please connect your wallet</>
							)}
						</Button>
				
						<Response response={response} message={message} hash={hash} confirmed={confirmed} />
					</ModalBody>
					<InfoFooter message='
						You can issue a new asset against your collateral. Debt is dynamic and depends on total debt of the pool.
					'/>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default IssueModal;
