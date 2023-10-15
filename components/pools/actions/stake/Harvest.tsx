import React, { useEffect, useState } from "react";
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
    useColorMode,
    useToast,
} from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { formatInput } from "../../../utils/number";
import { defaultChain, dollarFormatter, tokenFormatter } from "../../../../src/const";
import { AiOutlineWallet } from "react-icons/ai";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { useDexData } from "../../../context/DexDataProvider";
import useHandleError, { PlatformType } from "../../../utils/useHandleError";
import { getABI, send } from "../../../../src/contract";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { VARIANT } from "../../../../styles/theme";

export default function Harvest({ pool }: any) {
    // const [amount, setAmount] = useState('');
    const { walletBalances, nonces, allowances, updateFromTx, addNonce } = useBalanceData();
    const [loading, setLoading] = useState(false);
	const { chain } = useNetwork();
	const { address, isConnected } = useAccount();

    const { dex } = useDexData();

    const [rewardAccrued, setRewardAccrued] = useState(null);

    useEffect(() => {
        if(dex.miniChef && rewardAccrued == null){
            updateRewards();
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
        if(rewardAccrued == null){
            return {
                valid: false,
                message: 'Loading'
            }
        } else if(Number(rewardAccrued) == 0){
            return {
                valid: false,
                message: 'No Pending Rewards'
            }
        } else {
            return {
                valid: true,
                message: 'Harvest'
            }
        }
    }

    const harvest = () => {
        setLoading(true);
        const miniChef = new ethers.Contract(dex.miniChef, getABI('MiniChef', chain?.id!));
        let calls = [];
        calls.push(
            miniChef.interface.encodeFunctionData("harvest", [pool.pid, address])
        )
        send(miniChef, "multicall", [calls])
        .then(async (res: any) => {
            let response = await res.wait();
            updateFromTx(response);
            setLoading(false);
            updateRewards();
            toast({
                title: 'Transaction submitted',
                description: <Box>
                    <Text>
                        {`You have withdrawn ${tokenFormatter.format(Number(rewardAccrued)/1e18)} ${pool.symbol}`}
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
                <Button size={'lg'} isLoading={loading} loadingText='Loading' isDisabled={!validate().valid} bg={'transparent'} _hover={{bg: 'transparent'}} rounded={0} w={'100%'} onClick={harvest}>
                    {validate().message}
                </Button>
            </Box>
        </>
	);
}
