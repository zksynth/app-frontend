import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	Flex,
	Link,
	Text,
    useColorMode,
    useToast,
} from "@chakra-ui/react";
import { defaultChain, dollarFormatter, tokenFormatter } from "../../../../src/const";
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

    const { dex, updateStakeBalance } = useDexData();

    const [rewardAccrued, setRewardAccrued] = useState(null);

    useEffect(() => {
        if(dex.miniChef && rewardAccrued == null){
            updateRewards()
        }
    }, [dex])

    const updateRewards = () => {
        const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
        const miniChef = new ethers.Contract(dex.miniChef, getABI('MiniChef', chain?.id!), provider);
        miniChef.pendingSushi(pool.pid, address)
        .then((res: any) => {
            setRewardAccrued(res.toString());
        })
        .catch((err: any) => {
            console.log(err);
        })
    }

    const validate = () => {
        if(isNaN(Number(amount)) || Number(amount) == 0){
            return {
                valid: false,
                message: 'Enter Amount'
            }
        } else if(Big(amount).mul(10**18).gt(pool.stakedBalance)){
            return {
                valid: false,
                message: 'Insufficient Balance'
            }

        } else {
            return {
                valid: true,
                message: 'Withdraw and Harvest'
            }
        }
    }

    const withdrawAndHarvest = () => {
        setLoading(true);
        const miniChef = new ethers.Contract(dex.miniChef, getABI('MiniChef', chain?.id!));
        const _amount = Big(amount).mul(10**18).toFixed(0)
        let calls = [];
        calls.push(
            miniChef.interface.encodeFunctionData("withdrawAndHarvest", [pool.pid, _amount, address])
        )
        send(miniChef, "multicall", [calls])
        .then(async (res: any) => {
            let response = await res.wait();
            updateFromTx(response);
            setLoading(false);
            updateStakeBalance(pool.address, _amount, true);
            toast({
                title: 'Transaction submitted',
                description: <Box>
                    <Text>
                        {`You have withdrawn ${amount} ${pool.symbol}`}
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
            updateRewards();
        })
        .catch((err: any) => {
            setLoading(false);
            handleError(err)
        })
    }

    const toast = useToast();
    const handleError = useHandleError(PlatformType.DEX);
    const { colorMode } = useColorMode();

	return (
		<>
            <Flex flexDir={'column'} gap={2} px={4} mt={6} mb={6}>
                
            <Flex justify="space-between">
                <Flex gap={1}>
                    <Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
                        Your Staked Balance
                    </Text>
                </Flex>
                <Flex gap={1.5} align={'center'}>
                <Text fontSize={"md"}>
                    {tokenFormatter.format(Big(pool.stakedBalance).div(1e18).toNumber())}
                </Text>
                <Text fontSize={"sm"} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>
                    {pool.symbol}
                </Text>
                </Flex>
            </Flex>

            <Flex justify="space-between">
                <Flex gap={1}>
                    <Text fontSize={"md"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"} textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
                        Earned Rewards
                    </Text>
                </Flex>
                <Flex gap={1.5} align={'center'}>
                <Text fontSize={"md"}>
                    {tokenFormatter.format(Big(rewardAccrued ?? 0).div(1e18).toNumber())}
                </Text>
                <Text fontSize={"sm"} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>
                    {process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}
                </Text>
                </Flex>
            </Flex>
            </Flex>
            <Box className={validate().valid ? `${VARIANT}-${colorMode}-primaryButton` : `${VARIANT}-${colorMode}-disabledPrimaryButton`} m={4}>
                <Button size={'lg'} isLoading={loading} loadingText='Loading' isDisabled={!validate().valid} bg={'transparent'} _hover={{bg: 'transparent'}} rounded={0} w={'100%'} onClick={withdrawAndHarvest}>
                    {validate().message}
                </Button>
            </Box>
        </>
	);
}
