import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Link,
	Image,
	Select,
	Alert,
	AlertIcon,
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

const Big = require("big.js");

import { getAddress, getContract, send, call } from "../../../src/contract";
import { useEffect, useContext } from "react";
import { BiPlusCircle } from "react-icons/bi";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { ethers } from "ethers";
import Response from "../_utils/Response";
import InfoFooter from "../_utils/InfoFooter";
import { Step, Steps, useSteps } from "chakra-ui-steps";

import Step1 from "./Step1";
import Step2 from "./Step2";

const DepositModal = ({ handleDeposit }: any) => {
	const [selectedAsset, setSelectedAsset] = React.useState<number|null>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		collaterals,
		chain,
		updateCollateralWalletBalance,
		addCollateralAllowance,
		explorer,
		toggleCollateralEnabled,
	} = useContext(AppDataContext);

	const [amount, setAmount] = React.useState(0);

	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		setHash(null);
		setConfirmed(false);
		setAmount(0);
		setSelectedAsset(null);
		onClose();
	};

	return (
		<Box>
			<Button
				variant={"outline"}
				size="lg"
				rounded={40}
				onClick={onOpen}
				color="primary"
				borderColor={"primary"}
				_hover={{ opacity: 0.6 }}
				gap={1}
			>
				Add <BiPlusCircle size={20} />
			</Button>

			{collaterals.length > 0 && <Modal isCentered isOpen={isOpen} onClose={_onClose}>
				<ModalOverlay backdropFilter="blur(30px)" />
				<ModalContent bg={"gray.800"}>
					<ModalCloseButton />
					<ModalHeader>
						{selectedAsset == null ? "Select asset to deposit" : `Deposit ${collaterals[selectedAsset].inputToken.symbol}`}
					</ModalHeader>
					<ModalBody>
						{selectedAsset == null ? (
							<Step1
								setSelectedAsset={setSelectedAsset}
								setAmount={setAmount}
							/>
						) : (
							<Step2
								handleDeposit={handleDeposit}
								asset={collaterals[selectedAsset]}
								setSelectedAsset={setSelectedAsset}
							/>
						)}

						<Response
							response={response}
							message={message}
							hash={hash}
							confirmed={confirmed}
						/>
					</ModalBody>
					<InfoFooter
						message="
						Adding collateral would increase your borrowing power, and lower your liquidation risk. You can withdraw your collateral at any time.
					"
					/>
				</ModalContent>
			</Modal>}
		</Box>
	);
};

export default DepositModal;
