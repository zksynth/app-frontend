import { Box, Button, Flex, Heading, useToast, Text, Tooltip, IconButton, Image, useColorMode } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import { useLendingData } from '../../context/LendingDataProvider'
import { defaultChain, dollarFormatter } from '../../../src/const';
import PoolSelector from './PoolSelector';
import { TokenContext } from '../../context/TokenContext';
import { useAccount, useNetwork } from 'wagmi';
import { getABI, getAddress, getContract, send } from '../../../src/contract';
import Big from 'big.js';
import { ethers } from 'ethers';
import { HEADING_FONT, VARIANT } from '../../../styles/theme';
import { useRouter } from 'next/router';

export default function LendingMarket() {
    const {pools, protocols} = useLendingData();
	const {query} = useRouter();
	const selectedPool = Number(query.market);
	const protocol = protocols[selectedPool];

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);
	const { chain: connectedChain } = useNetwork();
	const { address, isConnected } = useAccount();

	const { claimed } = useContext(TokenContext);
	const toast = useToast();

	useEffect(() => {
		if (connectedChain && pools[selectedPool]) {
			if (
				isConnected &&
				!(connectedChain as any).unsupported &&
				pools.length > 0 &&
				protocol._rewardsController
			) {
				let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
				let controller = new ethers.Contract(protocol._rewardsController, getABI("RewardsController", defaultChain.id), provider);
				let assets: string[] = pools[selectedPool].map((market: any) => market.outputToken.id).concat(pools[selectedPool].map((market: any) => market._vToken.id));
				controller.getUserRewards(assets, address, getAddress(process.env.NEXT_PUBLIC_VESTED_TOKEN_NAME!, defaultChain.id))
						.then((result: any) => {
							console.log(result.toString());
							setSynAccrued(result.toString());
						})
						.catch((err: any) => {
							console.log("Failed to getRewardsAccrued", err);
						})
			}
			
		}
	}, [connectedChain, synAccrued, isConnected, pools, address, selectedPool]);


	const claim = () => {
		setClaiming(true);
		let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		let controller = new ethers.Contract(protocol._rewardsController, getABI("RewardsController", defaultChain.id), provider);
		let assets: string[] = pools[selectedPool].map((market: any) => market.outputToken.id).concat(pools[selectedPool].map((market: any) => market._vToken.id));
		send(controller, "claimAllRewards", [
				assets,
				address
			])
			.then(async (result: any) => {
				let response = await result.wait();
				console.log(response);
				setClaiming(false);
				setSynAccrued("0");
				claimed((synAccrued / 1e18).toString());
				toast({
					title: "Claimed!",
					description: "Your rewards have been claimed.",
					status: "success",
					duration: 10000,
					isClosable: true,
					position: "top-right",
				});
			})
			.catch((err: any) => {
				console.log(err);
				setClaiming(false);
				toast({
					title: "Error",
					description: "There was an error claiming your rewards.",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right",
				});
			});
	}

	const addToMetamask = async () => {
        (window as any).ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', // Initially only supports ERC20, but eventually more!
              options: {
                address: getAddress(process.env.NEXT_PUBLIC_VESTED_TOKEN_NAME!, defaultChain.id), // The address that the token is at.
                symbol: process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL!, // A ticker symbol or shorthand, up to 5 chars.
                decimals: 18, // The number of decimals in the token
                image: process.env.NEXT_PUBLIC_VERCEL_URL + `/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL!}.svg`, // A string url of the token logo
              },
            }
        });
    }

	const { colorMode } = useColorMode();

  return (
    <>
        <Box
            w="100%"
            display={{ sm: "block", md: "flex" }}
            justifyContent={"space-between"}
            alignContent={"start"}
        >
            <Box>
					{pools.length > 1 ? <PoolSelector /> : <Heading fontWeight={HEADING_FONT == 'Chakra Petch' ? 'bold' : 'semibold'} fontSize={{sm: '3xl', md: "3xl", lg: '32px'}}>{protocol?.name}</Heading>}
					<Flex mt={7} mb={4} gap={10}>
						<Flex gap={2}>
							<Heading size={"sm"} color={"primary.400"}>
								Total Supplied
							</Heading>
							<Heading size={"sm"}>{dollarFormatter.format(protocol?.totalDepositBalanceUSD ?? 0)}</Heading>
						</Flex>

						<Flex gap={2}>
							<Heading size={"sm"} color={"secondary.400"}>
								Total Borrowed
							</Heading>
							<Heading size={"sm"}>{dollarFormatter.format(protocol?.totalBorrowBalanceUSD ?? 0)}</Heading>
						</Flex>
					</Flex>
				</Box>

				{
					(pools[selectedPool] && synAccrued > 0) 
					&&
					<Box textAlign={"right"}>
					<Flex justify={'end'} align={'center'} gap={1}>
						<Heading size={"sm"} color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}>
							Rewards
						</Heading>
						<Tooltip label='Add to Metamask'>
						<IconButton
							icon={
								<Image
									src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png"
									w={"20px"}
									alt=""
								/>
							}
							onClick={addToMetamask}
							size={"xs"}
							rounded="full"
							aria-label={""}
						/>
						</Tooltip>
					</Flex>
					<Box gap={20} mt={2}>
						<Flex justify={"end"} align={"center"} gap={2}>
							<Text fontSize={"2xl"}>{synAccrued ? Big(synAccrued).div(10**18).toFixed(2) : '-'} </Text>
							<Text fontSize={"2xl"} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>
								{process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}
							</Text>
						</Flex>
						<Box mt={2} w={'100%'} className={`${VARIANT}-${colorMode}-outlinedButton`}>
						<Button
							onClick={claim}
							bg={'transparent'}
							w="100%"
							rounded={0}
							size={"sm"}
                            isLoading={claiming}
                            loadingText={"Claiming"}
                            isDisabled={synAccrued == null || Number(synAccrued) == 0}
							_hover={{ bg: "transparent" }}
						>
							Claim
						</Button>
						</Box>
					</Box>
				</Box>}
        </Box>
    </>
  )
}
