import {
	Box,
	Flex,
	Image,
	Text,
	Heading,
	Progress,
	Tooltip,
	Divider,
	Link,
	Tag,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import CollateralTable from "../components/dashboard/CollateralTable";
import PoolSelector from "../components/dashboard/PoolSelector";
import { dollarFormatter, ESYX_PRICE, tokenFormatter } from "../src/const";
import IssuanceTable from "../components/dashboard/IssuanceTable";
import { motion } from "framer-motion";
import Head from "next/head";
import { ArrowRightIcon, InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import Big from "big.js";
import { BsLightningChargeFill, BsStars } from "react-icons/bs";
import { MdOutlineTrackChanges } from "react-icons/md";
import APRInfo from "../components/infos/APRInfo";
import Info from "../components/infos/Info"

export default function TempPage() {
	const {
		pools,
		tradingPool,
		account
	} = useContext(AppDataContext);

	const [hydrated, setHydrated] = React.useState(false);

	React.useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return <></>;

	const esSyxApr = () => {
		if (!pools[tradingPool]) return "0";
		if(Big(pools[tradingPool]?.totalDebtUSD).eq(0)) return "0";
		return Big(pools[tradingPool]?.rewardSpeeds[0])
			.div(1e18)
			.mul(365 * 24 * 60 * 60 * ESYX_PRICE)
			.div(pools[tradingPool]?.totalDebtUSD)
			.mul(100)
			.toFixed(2);
	};

	const debtBurnApr = () => {
		if (!pools[tradingPool]) return "0";
		if(Big(pools[tradingPool]?.totalDebtUSD).eq(0)) return "0"
		return Big(pools[tradingPool]?.averageDailyBurn ?? 0)
			.mul(365)
			.div(pools[tradingPool]?.totalDebtUSD)
			.mul(100)
			.toFixed(2);
	};

	const getTimeUntilNextSunday5PM = () => {
		const now: any = new Date();
		const dayOfWeek = now.getUTCDay();
		const targetDayOfWeek = 0; // Sunday
		let daysUntilNextSunday = targetDayOfWeek - dayOfWeek;
		if (daysUntilNextSunday <= 0) {
			daysUntilNextSunday += 7;
		}
		const nextSunday: any = new Date(now.getTime() + daysUntilNextSunday * 24 * 60 * 60 * 1000);
		nextSunday.setUTCHours(21); // 5 PM EDT in UTC
		nextSunday.setUTCMinutes(0);
		nextSunday.setUTCSeconds(0);
		nextSunday.setUTCMilliseconds(0);
		let duration = nextSunday - now;
		let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        days = Math.floor(duration / (1000 * 60 * 60 * 24));

		return {
			days: days,
			hours: hours,
			minutes: minutes,
			seconds: seconds
		};
	}

	const debtLimit = () => (100 * pools[tradingPool]?.userDebt) / pools[tradingPool]?.userCollateral;

	return (
		<>
			<Head>
				<title>SyntheX | Dashboard</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Box
				display={{ sm: "block", md: "flex" }}
				pt="100px"
				justifyContent={"space-between"}
				alignContent={"center"}
				// maxW='100px'
			>
				<Flex flexDir={'column'} justify='center'>
					<Box mb={4}>
						<PoolSelector />
					</Box>
					<motion.div
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.25 }}
						key={tradingPool}
					>
						<Flex
							flexDir={{ sm: "column", md: "row" }}
							gap={{ sm: 10, md: 16 }}
							zIndex={1}
						>
							<Flex mt={4} gap={3} align="start">
								<IconBox>
								<Image
									h={"18px"}
									src="/icon1.svg"
									alt="icon1"
									ml={0.5}
								/>
								</IconBox>

								<Box>
									<Heading
										size={"sm"}
										color="whiteAlpha.700"
										mb={0.5}
									>
										Collateral
									</Heading>
									<Flex fontWeight={"semibold"}
										fontSize={"xl"} gap={1}>
									<Text color={'whiteAlpha.800'} fontWeight={"normal"}>$</Text>
									<Text>
										{(
											pools[tradingPool]?.userCollateral ?? 0
										).toFixed(2)}
									</Text>
									</Flex>

								</Box>
							</Flex>

							<Flex mt={4} gap={3} align="start">
								<IconBox>
								<Image
									h={"20px"}
									src="/icon2.svg"
									alt={"icon2"}
								/>
								</IconBox>
								<APRInfo debtBurnApr={debtBurnApr()} esSyxApr={esSyxApr()}>

								<Box cursor={"help"}>
									<Flex gap={2} align='center'>

									<Heading
										fontSize={"sm"}
										color="whiteAlpha.700"
									>
										APY
									</Heading>
									{/* <Tag mb={'1'} gap={1} size={'sm'} fontSize='xs'>
										Boosted
										</Tag> */}
										<Box mb={'4px'}>
									<BsStars color={"gray.400"} size='12' />
										</Box>
									</Flex>

										<Flex mb={0.5} gap={1.5} align="center" >
											<Text
												fontSize={"xl"}
												fontWeight={"semibold"}
											> {(Number(debtBurnApr()) + Number(esSyxApr())).toFixed(2)} %
											</Text>

										</Flex>
								</Box>
										</APRInfo>
							</Flex>

							<Flex mt={4} gap={3} align="start">
								<IconBox>
									<Image
										h={"17px"}
										src="/icon3.svg"
										alt={"icon3"}
									/>
								</IconBox>
								
									<Info message={`When you issue synths, you are allocated a share of pool's total debt. As the pool's total value changes, your debt changes as well`} title={'Debt is variable'}>
										<Box cursor={"help"}>
										<Heading
										mb={0.5}
											size={"sm"}
											color="whiteAlpha.700"
										>
											Debt
										</Heading>
										<Flex gap={2} align="center">
										<Flex fontWeight={"semibold"}
										fontSize={"xl"} gap={1}>
									<Text color={'whiteAlpha.800'} fontWeight={"normal"}>$</Text>
									<Text>
										{(
											pools[tradingPool]?.userDebt ?? 0
										).toFixed(2)}
									</Text>
									</Flex>
										{/* <MdOutlineTrackChanges
											color={"gray.400"}
										/> */}
										</Flex>
									</Box>
								</Info>
							</Flex>
						</Flex>
					</motion.div>
				</Flex>
				<motion.div
					initial={{ opacity: 0, y: 0 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					key={tradingPool}
				>
					<Box
						textAlign={{ sm: "left", md: "right" }}
						mt={{ sm: 16, md: 3 }}
					>
						<Info message={`Your Debt Limit depends on your LTV %. Account would be liquidated if LTV is greater than your Collateral's Liquidation Threshold`} title={'Loan to Value (LTV) Ratio'}>
						<Flex
							justify={{ sm: "start", md: "end" }}
							align="center"
							gap={1}
							cursor={"help"}
						>
							
							<Heading size={"sm"} mb={1} color="whiteAlpha.700">
								Borrow Limit
							</Heading>

							<Box mb={2}>
								<InfoOutlineIcon
									color={"gray.400"}
									h={3}
									/>
									</Box>
						</Flex>
						</Info>
						<Text
							fontWeight={"semibold"}
							fontSize={"3xl"}
							mb={2}
							color={
								pools[tradingPool]?.userCollateral > 0
									? debtLimit() < 80
										? "primary.400"
										: debtLimit() < 90
										? "yellow.400"
										: "red.400"
									: "primary.400"
							}
						>
							{(pools[tradingPool]?.userCollateral > 0
								? debtLimit()
								: pools[tradingPool]?.userCollateral ?? 0
							).toFixed(1)}{" "}
							%
						</Text>
						<Box
							my={2}
							mt={4}
							h={2}
							width={"300px"}
							rounded="full"
							bg="whiteAlpha.200"
						>
							<Box
								h={2}
								rounded="full"
								bg={
									pools[tradingPool]?.userCollateral > 0
										? debtLimit() <
										  80
											? "primary.400"
											: debtLimit() <
											  90
											? "yellow.400"
											: "red.400"
										: "primary.400"
								}
								width={
									(pools[tradingPool]?.userCollateral > 0
										? debtLimit()
										: '0') + "%"
								}
							></Box>
						</Box>
						<Info message={`You can issue debt till you reach Collateral's Base LTV`} title={'Borrow Capacity'}>
						<Flex
							justify={{ sm: "start", md: "end" }}
							align="center"
							gap={1}
							cursor={"help"}
						>
							<Text fontSize={"sm"} color="gray.400">
								Available to Issue
							</Text>
							<Text fontSize={"sm"} mr={0.5} fontWeight="medium">
								{ dollarFormatter.format(
									pools[tradingPool]?.adjustedCollateral ? 
									(pools[tradingPool]?.adjustedCollateral - pools[tradingPool]?.userDebt < 0 ? 0 : pools[tradingPool]?.adjustedCollateral - pools[tradingPool]?.userDebt)
										: 0) 
										}
							</Text>
							<Box mb={1}>

							<InfoOutlineIcon
									color={"gray.400"}
									h={3}
									/>
									</Box>
						</Flex>
						</Info>
					</Box>
				</motion.div>
			</Box>

			<Box pb={"100px"}
				mt={"80px"}>

			{!pools[tradingPool]?.paused ? <Flex
				flexDir={{ sm: "column", md: "row" }}
				align={"stretch"}
				gap={8}
				zIndex={1}
			>
				<Box w={{ sm: "100%", md: "33%" }} alignSelf="stretch">
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.25 }}
						key={tradingPool}
						style={{
							height: "100%",
						}}
					>
						<Box
							// bg={"bg2"}
							bgGradient={'linear(to-b, rgba(5, 104, 204, 0.2), rgba(5, 119, 230, 0.1))'}
							rounded={10}
							h={"100%"}
							border="1px"
							borderColor={"whiteAlpha.50"}
							shadow='xl'
						>
							<CollateralTable />
						</Box>
					</motion.div>
				</Box>
				<Box w={{ sm: "100%", md: "67%" }}>
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.25 }}
						key={tradingPool + 2}
					>
						<Box
							// bg={"bg2"}
							bgGradient={'linear(to-b, rgba(5, 104, 204, 0.2), rgba(5, 119, 230, 0.1))'}
							rounded={10}
							h={"100%"}
							border="1px"
							borderColor={"whiteAlpha.50"}
							shadow='xl'
						>
							<IssuanceTable />
						</Box>
					</motion.div>
				</Box>
			</Flex> : 
			tradingPool == 0 ?
			<Flex gap={3} bg={'bg2'} rounded='16' flexDir={'column'} h='360px' w={'100%'} align='center' justify={'center'} border='2px' borderColor={'whiteAlpha.200'}>
				<Heading size={'lg'}>Market Paused</Heading>
				<Text textAlign={'center'} color='whiteAlpha.700' maxW={'400px'}>Forex (Foreign Exchange) markets are traded only from 5PM EDT on Sunday through 4PM EDT on Friday</Text>
				<Text mt={5}>
					Opening back in
				</Text>
				<Flex justify={'center'} gap={4}>
					<Box textAlign={'center'}>
						<Heading>{getTimeUntilNextSunday5PM().days}</Heading>
						<Text>Day</Text>
					</Box>
					<Heading>:</Heading>
					<Box textAlign={'center'}>
						<Heading>{getTimeUntilNextSunday5PM().hours}</Heading>
						<Text>Hour</Text>
					</Box>
					<Heading>:</Heading>
					<Box textAlign={'center'}>
						<Heading>{getTimeUntilNextSunday5PM().minutes}</Heading>
						<Text>Minute</Text>
					</Box>
				</Flex>
			</Flex>
			:
			<Flex gap={3} bg={'bg2'} rounded='16' flexDir={'column'} h='360px' w={'100%'} align='center' justify={'center'} border='2px' borderColor={'whiteAlpha.200'}>
				<Heading size={'lg'}>Market Paused</Heading>
				<Text textAlign={'center'} color='whiteAlpha.700' maxW={'400px'}>Market is paused</Text>
				<Text mt={5}>
					Will be back soon
				</Text>
			</Flex>
			}


			{/* {!account && (
				<Link href='/info'>
				<Box bgGradient={'linear(whiteAlpha.100, whiteAlpha.300)'} mt={10} p={4} border='2px' borderColor={'whiteAlpha.100'} rounded={10}>
					<Heading size={'md'}>
					New here?	
					</Heading>

					<Flex align={'center'}>
					<Text mt={1}>Read our guide to get started</Text>
					<ArrowRightIcon ml={1} mt={1} />
					</Flex>

					
				</Box>
				</Link>
			)} */}

			</Box>
		</>
	);
}

function IconBox ({children}: any) {
	return <Flex align={'center'} justify='center' h={'40px'} w={'40px'} bg='whiteAlpha.50' border={'2px'} borderColor='whiteAlpha.100' rounded={10}>
	{children}
</Flex>
}