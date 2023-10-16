import { Box, Divider, Flex, Heading, Image, Text, Tooltip, useColorMode } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BsArrowRight, BsArrowRightShort, BsStars } from "react-icons/bs";
import { ESYX_PRICE, POOL_COLORS, dollarFormatter, tokenFormatter } from "../src/const";
import ThBox from "../components/dashboard/ThBox";
import { HEADING_FONT, VARIANT } from "../styles/theme";
import TdBox from "../components/dashboard/TdBox";
import { useRouter } from "next/router";
import { useAppData } from "../components/context/AppDataProvider";
import Big from "big.js";
import { usePriceData } from "../components/context/PriceContext";
import { Status } from "../components/utils/status";
import APRInfo from "../components/infos/APRInfo";
import Skeleton1 from "../components/others/Skeleton1";
import { useSyntheticsData } from "../components/context/SyntheticsPosition";
import Head from "next/head";

export default function Synth() {
	const { pools: allPools } = useAppData();
	const { colorMode } = useColorMode();
    const router = useRouter();
    const {prices, status} = usePriceData();
    const {position} = useSyntheticsData();

    const [pools, setPools] = useState<any>([]);

    useEffect(() => {
        if(pools.length > 0) return;
        if(!allPools[0]) return;
        // if(status != Status.SUCCESS) return;
        // clone allPools
        let allPoolsClone = JSON.parse(JSON.stringify(allPools));
        // Set pool total debt
        for(let i in allPoolsClone){
            console.log(allPoolsClone);
            // Total Debt
            allPoolsClone[i].totalDebt = Big(0);
            for(let j in allPoolsClone[i].synths){
                allPoolsClone[i].totalDebt = allPoolsClone[i].totalDebt.plus(Big(allPoolsClone[i].synths[j].totalSupply).div(10**18).mul(prices[allPoolsClone[i].synths[j].token.id] ?? 0));
            }
            allPoolsClone[i].totalDebt = allPoolsClone[i].totalDebt.toFixed(2);
            // Total Collateral
            allPoolsClone[i].totalCollateral = Big(0);
            for(let j in allPoolsClone[i].collaterals){
                allPoolsClone[i].totalCollateral = allPoolsClone[i].totalCollateral.plus(Big(allPoolsClone[i].collaterals[j].totalDeposits).div(10**allPoolsClone[i].collaterals[j].token.decimals).mul(prices[allPoolsClone[i].collaterals[j].token.id] ?? 0));
            }
            allPoolsClone[i].totalCollateral = allPoolsClone[i].totalCollateral.toFixed(2);
            // Debt Burn APR
            let averageDailyBurn = Big(0);
            for(let k = 0; k < allPoolsClone[i].synths.length; k++) {
                for(let l = 0; l <allPoolsClone[i].synths[k].synthDayData.length; l++) {
                    let synthDayData = allPoolsClone[i].synths[k].synthDayData[l];
                    // synthDayData.dailyMinted / 1e18 * pool.synths[k].mintFee / 10000 * pool.synths[k].priceUSD
                    let totalFee = Big(synthDayData.dailyMinted).div(1e18).mul(allPoolsClone[i].synths[k].mintFee).div(10000).mul(prices[allPoolsClone[i].synths[k].token.id] ?? 0);
                    // add burn fee
                    totalFee = totalFee.plus(Big(synthDayData.dailyBurned).div(1e18).mul(allPoolsClone[i].synths[k].burnFee).div(10000).mul(prices[allPoolsClone[i].synths[k].token.id] ?? 0));

                    // add to average
                    averageDailyBurn = averageDailyBurn.plus(
                        totalFee.mul(allPoolsClone[i].issuerAlloc).div(10000)
                    );
                }
            }
            if(Number(allPoolsClone[i].totalDebt) == 0) {
                allPoolsClone[i].debtBurnApr = 0;
                allPoolsClone[i].rewardAPY = 0;
                continue;
            }
            allPoolsClone[i].debtBurnApr = averageDailyBurn
                .div(7)
                .mul(365)
                .div(allPoolsClone[i].totalDebt)
                .mul(100)
                .toFixed(2);
            allPoolsClone[i].rewardAPY = Big(allPoolsClone[i]?.rewardSpeeds[0] ?? 0)
                .div(1e18)
                .mul(365 * 24 * 60 * 60 * ESYX_PRICE)
                .div(allPoolsClone[i].totalDebt ?? 0)
                .mul(100)
                .toFixed(2);
            console.log(allPoolsClone);

        }
        let sortedPools = allPoolsClone.sort((a: any, b: any) => {
            return Big(b.totalDebt).minus(a.totalDebt);
        });
        setPools(sortedPools);
    }, [allPools, status, prices, pools.length]);


	return (<>
        <Head>
            <title>{process.env.NEXT_PUBLIC_TOKEN_SYMBOL} | Synthetics</title>
            <link rel="icon" type="image/x-icon" href={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}.svg`}></link>
        </Head>
		<Box mt={"80px"}>
            <Flex flexDir={'column'} align={'start'} gap={6} mb={10}>
            <Heading fontWeight={HEADING_FONT == 'Chakra Petch' ? 'bold' : 'semibold'} fontSize={'32px'}>
                Synthetic Pools
            </Heading>
            <Text color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'}>
                Enabling the creation of trustless synthetic assets
            </Text>
            </Flex>
            {pools.length > 0 ? 
                pools.map((pool: any, index: number) => (
			    <Box maxW={'400px'} key={index} className={`${VARIANT}-${colorMode}-halfButton2`} cursor={'pointer'} onClick={() => router.push('/'+index)}>
                    <Box className={`${VARIANT}-${colorMode}-halfContainerBody2`} >
                        <Flex py={4} px={5} align={'center'} justify={'space-between'} gap={4} >
                            <Heading fontSize={'22px'} fontWeight={'bold'}>{pool.name}</Heading>
                            <Flex>
                                {pool.synths.slice(0, 5).map((synth: any, index: number) => (<Box key={index} ml={-3} border={'1.5px white solid'} rounded={'full'}>
                                    <Tooltip label={synth.token.symbol} placement={'top'}>
                                        <Image src={`/icons/${synth.token.symbol}.svg`} w={'32px'} key={index} />
                                    </Tooltip>
                                </Box>))}
                            </Flex>
                        </Flex>
                    </Box>
                        <Box pt={4} >
                        <Flex mx={4} >
                            <Box>
                                <Text fontSize={'sm'} color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'}>TVL</Text>
                                <Flex gap={1.5}>
                                <Text fontSize={'lg'}>{dollarFormatter.format(Number(pool.totalCollateral))}</Text>
                                <Flex ml={1}>
                                {pool.collaterals.map((collateral: any, index: number) => (<Box key={index} ml={-1}>
                                    <Tooltip label={collateral.token.symbol} placement={'top'}>
                                        <Image src={`/icons/${collateral.token.symbol}.svg`} w={'22px'} key={index} />
                                    </Tooltip>
                                </Box>))}
                                </Flex>
                                </Flex>
                            </Box>
                        </Flex>
                        
                        {/* <Box border={'1px white dotted'} borderColor={'whiteAlpha.400'} bg='darkBg.400' borderRadius={6} p={2} mx={4} mt={4}>
                            <Flex justify={'space-between'}>
                                <Flex gap={1} align={'end'}>
                                    <Text fontSize={'sm'} color={'whiteAlpha.600'}>Your Collateral:</Text>
                                    <Text>{dollarFormatter.format(Number(position(index).collateral))}</Text>
                                </Flex>

                                <Flex gap={1} align={'end'}>
                                    <Text fontSize={'sm'} color={'whiteAlpha.600'}>Debt:</Text>
                                    <Text>{dollarFormatter.format(Number(position(index).debt))}</Text>
                                </Flex>

                                <Flex gap={1} align={'end'}>
                                    <Text fontSize={'sm'} color={'whiteAlpha.600'}>Health:</Text>
                                    <Text>{(Number(position(index).debtLimit)).toFixed(2)}</Text>
                                </Flex>
                            </Flex>
                        </Box> */}
                        <Flex justify={'space-between'} align={'end'} mx={4} mt={4} pb={6}>
                            <Box>
                                <Text fontSize={'sm'}  color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'}>APR</Text>
                                <Box maxW={'100px'}>
                                <APRInfo
                                    debtBurnApr={pool.debtBurnApr}
                                    esSyxApr={pool.rewardAPY}
                                >
                                    <Flex gap={1} align={'center'} cursor={"help"} color={'primary.400'}>
                                        <Heading size={"md"} >
                                            {(
                                                Number(pool.debtBurnApr)
                                                + Number(pool.rewardAPY)
                                            ).toFixed(2)}
                                            %
                                        </Heading>
                                        <BsStars />
                                    </Flex>
                                </APRInfo>
                                </Box>
                            </Box>
                            <Flex align={'center'} color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'}>
                                <Text>Enter Now</Text>
                                <BsArrowRightShort />
                            </Flex>
                        </Flex>
                    </Box>
			</Box>
            )): <Skeleton1 />}
		</Box>
    </>
	);
}
