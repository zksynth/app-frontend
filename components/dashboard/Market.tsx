import React, { useContext, useEffect, useState } from "react";
import Info from "../infos/Info";
import { Flex, Text, Box, Heading, Button, useToast, Divider, Tooltip, IconButton, Image, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IoMdAnalytics, IoMdCash } from "react-icons/io";
import IconBox from "./IconBox";
import { TbReportMoney } from "react-icons/tb";
import Big from "big.js";
import { useAppData } from "../context/AppDataProvider";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { ESYX_PRICE, defaultChain, dollarFormatter } from "../../src/const";
import PoolSelector from "./PoolSelector";
import APRInfo from "../infos/APRInfo";
import { TokenContext } from "../context/TokenContext";
import { useAccount, useNetwork } from "wagmi";
import { getAddress, getContract, send } from "../../src/contract";
import { usePriceData } from "../context/PriceContext";
import { useSyntheticsData } from "../context/SyntheticsPosition";
import { BsStars } from "react-icons/bs";
import { HEADING_FONT, VARIANT } from "../../styles/theme";

export default function Market() {
	const { pools, tradingPool, account } = useAppData();
	const { poolDebt, position } = useSyntheticsData();
    const [totalDebt, setTotalDebt] = useState<any>('0.00');
    const [totalCollateral, setTotalCollateral] = useState<any>('0.00');
	const { prices } = usePriceData();

    useEffect(() => {
        if(!pools?.[tradingPool]) return;
        let _totalDebt = Big(0);
        for(let i in pools[tradingPool].synths){
            _totalDebt = _totalDebt.plus(Big(pools[tradingPool].synths[i].totalSupply).div(10**18).mul(prices[pools[tradingPool].synths[i].token.id] ?? 0));
        }
        setTotalDebt(_totalDebt.toFixed(2));

        let _totalCollateral = Big(0);
        for(let i in pools[tradingPool].collaterals){
            _totalCollateral = _totalCollateral.plus(Big(pools[tradingPool].collaterals[i].totalDeposits).div(10**pools[tradingPool].collaterals[i].token.decimals).mul(prices[pools[tradingPool].collaterals[i].token.id] ?? 0));
        }
        setTotalCollateral(_totalCollateral.toFixed(2));
    }, [pools, tradingPool, prices])

	const esSyxApr = () => {
		if (!pools[tradingPool]) return "0";
		const totalDebt = poolDebt();
		if (Big(totalDebt).eq(0)) return "0";
		return Big(pools[tradingPool]?.rewardSpeeds[0] ?? 0)
			.div(1e18)
			.mul(365 * 24 * 60 * 60 * ESYX_PRICE)
			.div(totalDebt)
			.mul(100)
			.toFixed(2);
	};


	const debtBurnApr = () => {
		const pool = pools[tradingPool];
		if (!pool) return "0";
		const totalDebt = poolDebt();
		if (Big(totalDebt).eq(0)) return "0";
		// average burn and revenue
		let averageDailyBurn = Big(0);
		let averageDailyRevenue = Big(0);
		for(let k = 0; k < pool.synths.length; k++) {
			for(let l = 0; l <pool.synths[k].synthDayData.length; l++) {
				let synthDayData = pool.synths[k].synthDayData[l];
				// synthDayData.dailyMinted / 1e18 * pool.synths[k].mintFee / 10000 * pool.synths[k].priceUSD
				let totalFee = Big(synthDayData.dailyMinted).div(1e18).mul(pool.synths[k].mintFee).div(10000).mul(prices[pool.synths[k].token.id]);
				// add burn fee
				totalFee = totalFee.plus(Big(synthDayData.dailyBurned).div(1e18).mul(pool.synths[k].burnFee).div(10000).mul(prices[pool.synths[k].token.id]));

				// add to average
				averageDailyBurn = averageDailyBurn.plus(
					totalFee.mul(pool.issuerAlloc).div(10000)
				);
				averageDailyRevenue = averageDailyRevenue.plus(
					totalFee.mul(10000 - pool.issuerAlloc).div(10000)
				);
			}
		}
		// pool.averageDailyBurn = averageDailyBurn.div(7).toString();
		// pool.averageDailyRevenue = averageDailyRevenue.div(7).toString();
		return averageDailyBurn
			.div(7)
			.mul(365)
			.div(totalDebt)
			.mul(100)
			.toFixed(2);
	};

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);
	const { chain: connectedChain } = useNetwork();
	const { address, isConnected } = useAccount();

	const { claimed } = useContext(TokenContext);
	const toast = useToast();

	useEffect(() => {
		if (connectedChain && pools[tradingPool] && pools[0].rewardTokens[0]) {
			if (
				isConnected &&
				!(connectedChain as any).unsupported &&
				pools.length > 0
			) {
				getContract("SyntheX", connectedChain!.id).then((synthex) => {
					synthex.callStatic
						.getRewardsAccrued(
							[pools[0].rewardTokens[0].id],
							address,
							[pools[tradingPool].id]
						)
						.then((result) => {
							setSynAccrued(result[0].toString());
						})
						.catch((err) => {
							console.log("Failed to getRewardsAccrued", err);
						})
				});
			}
		}
	}, [connectedChain, synAccrued, isConnected, pools, address, tradingPool]);

	const claim = async () => {
		setClaiming(true);
		const synthex = await getContract("SyntheX", connectedChain!.id);
		send(synthex, "claimReward", [
			[pools[0].rewardTokens[0].id],
			address,
			pools.map((pool: any) => pool.id)]
		)
			.then(async (result: any) => {
				await result.wait(1);
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
	};

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
				<Flex w='100%' my={2} justify={'space-between'} align={'center'}>
					{pools.length > 1 ? <PoolSelector /> : <Heading fontSize={{sm: '3xl', md: "3xl", lg: '32px'}}>{pools[0]?.name}</Heading>}
					<Flex gap={10} wrap={'wrap'}>
						<Flex gap={2}>
							<Heading size={"sm"} color={"primary.400"}>
								Total Collateral
							</Heading>
							<Heading size={"sm"}>{dollarFormatter.format(totalCollateral ?? 0)}</Heading>
						</Flex>

						<Flex gap={2}>
							<Heading size={"sm"} color={"secondary.400"}>
								Total Debt
							</Heading>
							<Heading size={"sm"}>{dollarFormatter.format(totalDebt ?? 0)}</Heading>
						</Flex>

						<Flex gap={2}>
							<Heading size={"sm"} color={"secondary.400"}>
								APR
							</Heading>
							<APRInfo
								debtBurnApr={debtBurnApr()}
								esSyxApr={esSyxApr()}
							>
								<Flex gap={1} align={'center'} cursor={"help"}>
									<Heading size={"sm"}>
										{(
											Number(debtBurnApr())
											+ Number(esSyxApr())
										).toFixed(2)}
										%
									</Heading>
									<BsStars />
								</Flex>
							</APRInfo>
						</Flex>
					</Flex>
				</Flex>

				{
					(pools[tradingPool]
					?.userDebt > 0 || synAccrued > 0) &&
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
									w={"16px"}
									alt=""
								/>
							}
							onClick={addToMetamask}
							size={"xs"}
							rounded="full"
							aria-label={""}
							p={1}
						/>
						</Tooltip>
					</Flex>
					<Box gap={20} mt={2}>
						<Flex justify={"end"} align={"center"} gap={2}>
							<Text fontSize={"2xl"}>{synAccrued ? Big(synAccrued).div(10**18).toFixed(2) : '-'} </Text>
							<Text fontSize={"2xl"} color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'}>
								{process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL!}
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
	);
}