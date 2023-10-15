import React, { useState } from "react";
import {
	Box,
	Button,
	Divider,
	Flex,
	Heading,
	Image,
	InputGroup,
	Link,
	Text,
    Tooltip,
    useColorMode,
    useToast,
} from "@chakra-ui/react";
import { EIP712_VERSION, defaultChain, dollarFormatter, tokenFormatter } from "../../../../src/const";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { useDexData } from "../../../context/DexDataProvider";
import useHandleError, { PlatformType } from "../../../utils/useHandleError";
import { getABI, send } from "../../../../src/contract";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { VARIANT } from "../../../../styles/theme";

export default function Deposit({ pool, isOpen, onClose, amount, setAmount }: any) {
    // const [amount, setAmount] = useState('');
    const { walletBalances, nonces, allowances, updateFromTx, addNonce } = useBalanceData();
    const [loading, setLoading] = useState(false);
	const { chain } = useNetwork();
	const { address, isConnected } = useAccount();

	const [deadline, setDeadline] = useState('0');
	const { signTypedDataAsync } = useSignTypedData();
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');

    const { dex, updateStakeBalance } = useDexData();

    const validate = () => {
        if(isNaN(Number(amount)) || Number(amount) == 0){
            return {
                valid: false,
                message: 'Enter Amount'
            }
        } else if(Big(amount).mul(10**18).gt(walletBalances[pool.address])){
            return {
                valid: false,
                message: 'Insufficient Balance'
            }

        } else if(shouldApprove()){
            return {
                valid: true,
                message: 'Sign Approval'
            }
        } else {
            return {
                valid: true,
                message: 'Stake'
            }
        }
    }

    const stake = () => {
        setLoading(true);
        const miniChef = new ethers.Contract(dex.miniChef, getABI('MiniChef', chain?.id!));
        const _amount = Big(amount).mul(10**18).toFixed(0)
        let calls = [];
        if(Number(approvedAmount) > 0){
            const _approvedAmount = Big(approvedAmount).mul(10**18).toFixed(0);
            const {v, r, s} = ethers.utils.splitSignature(data!);
            calls.push(
                miniChef.interface.encodeFunctionData("permit", [pool.address, _approvedAmount, deadline , v, r, s])
            )
        }
        calls.push(
            miniChef.interface.encodeFunctionData("deposit", [pool.pid, _amount, address])
        )
        send(miniChef, "multicall", [calls])
        .then(async (res: any) => {
            let response = await res.wait();
            updateFromTx(response);
            setLoading(false);
            toast({
                title: 'Transaction submitted',
                description: <Box>
                    <Text>
                        {`You have staked ${amount} ${pool.symbol}`}
                    </Text>
                    <Link href={chain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
                        <Flex align={'center'} gap={2}>
                        <ExternalLinkIcon />
                        <Text>View Transaction</Text>
                        </Flex>
                    </Link>
                </Box>,
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top-right'
            })
            setAmount('');
            updateStakeBalance(pool.address, _amount, false);
            if(Number(approvedAmount) > 0){
                addNonce(pool.address, '1')
                setApprovedAmount('0');
                setDeadline('0');
                setData(null);
            }
        })
        .catch((err: any) => {
            setLoading(false);
            handleError(err)
        })
    }

    const toast = useToast();
    const handleError = useHandleError(PlatformType.DEX);

    const approve = async () => {
		setLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * 20).toFixed(0);
		const value = ethers.utils.parseUnits(amount, 18);
		signTypedDataAsync({
			domain: {
				name: pool.name,
				version: EIP712_VERSION(pool.address),
				chainId: chain?.id ?? defaultChain.id,
				verifyingContract: pool.address,
			},
			types: {
				Permit: [
					{ name: "owner", type: "address" },
					{ name: "spender", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "nonce", type: "uint256" },
					{ name: "deadline", type: "uint256" },
				]
			},
			value: {
				owner: address!,
				spender: dex.miniChef,
				value,
				nonce: nonces[pool.address] ?? 0,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApprovedAmount(amount);
				setLoading(false);
				toast({
					title: "Approval Signed",
					description: <Box>
						<Text>
							{`for ${amount} ${pool.symbol}`}
						</Text>
						<Text>
							Please deposit to continue
						</Text>
					</Box>,
					status: "info",
					duration: 10000,
					isClosable: true,
					position: "top-right"
				})
			})
			.catch((err: any) => {
				handleError(err);
				setLoading(false);
			});
	};

    const shouldApprove = () => {
        if(Big(allowances[pool.address]?.[dex.miniChef] ?? 0).add(Number(approvedAmount) * 10 ** 18).lt(
            parseFloat(amount) * 10 ** 18 || 1
        )){
            return true;
        }
    }

    const { colorMode } = useColorMode();

	return (
		<>
        <Flex flexDir={'column'} gap={2} px={4} mt={6} mb={6}>
            <Flex justify="space-between">
                <Flex gap={1}>
                    <Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
                        Total Deposits
                    </Text>
                </Flex>
                <Flex gap={1.5} align={'center'}>
                <Text fontSize={"md"}>
                    {tokenFormatter.format(Big(pool.slpBalance).div(1e18).toNumber())}
                </Text>
                <Text fontSize={"sm"} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>
                    {pool.symbol}
                </Text>
                </Flex>
            </Flex>

            <Flex justify="space-between">
                <Flex gap={1}>
                    <Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
                        Pool Emissions
                    </Text>
                </Flex>

                <Flex gap={1.5} align={'center'}>
                <Text fontSize={"md"}>
                    {dex.totalAllocPoint > 0 && tokenFormatter.format(Big(pool.allocPoint).div(dex.totalAllocPoint).mul(dex.sushiPerSecond).div(1e18).toNumber())} 
                </Text>
                <Image src={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`} width={'20px'} />
                <Text color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} fontSize={'sm'}> / second</Text>
                </Flex>
            </Flex>
            </Flex>
            <Box className={validate().valid ? `${VARIANT}-${colorMode}-primaryButton` : `${VARIANT}-${colorMode}-disabledPrimaryButton`} m={4}>
                <Button size={'lg'} isLoading={loading} loadingText='Loading' isDisabled={!validate().valid} bg={'transparent'} _hover={{bg: 'transparent'}} rounded={0} w={'100%'} onClick={shouldApprove() ? approve : stake}>
                    {validate().message}
                </Button>
            </Box>
        </>
	);
}
