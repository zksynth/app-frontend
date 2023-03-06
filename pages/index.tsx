import { Box, Flex, Image, Text, Heading, Progress } from "@chakra-ui/react";
import React, { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import CollateralTable from "../components/dashboard/CollateralTable";
import PoolSelector from "../components/dashboard/PoolSelector";
import { dollarFormatter, tokenFormatter } from '../src/const';
import IssuanceTable from "../components/dashboard/IssuanceTable";
import { motion } from "framer-motion";
import Head from 'next/head';
export default function TempPage() {
	const {
		pools,
		tradingPool,
		totalCollateral,
		totalDebt,
		adjustedCollateral,
	} = useContext(AppDataContext);

	const [hydrated, setHydrated] = React.useState(false);

	React.useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return <></>;

	return (
		<>
		<Head>
				<title>xSYN | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Flex pt="100px" justify={"space-between"}>
				<Box>
					<Box mb={4}>
						<PoolSelector />
					</Box>
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.45 }}
						key={tradingPool}
					>
						<Flex gap={16}>
							<Flex mt={4} gap={3} align="start">
								<Image
									h={"35px"}
									minH="35px"
									src="/icon1.svg"
								/>
								<Box mt={-1}>
									<Text fontSize={"sm"} color="gray.500">
										Collateral
									</Text>
									<Heading fontSize={"xl"}>
										{dollarFormatter.format(
											totalCollateral
										)}
									</Heading>
								</Box>
							</Flex>

							<Flex mt={4} gap={3} align="start">
								<Image
									h={"35px"}
									minH="35px"
									src="/icon2.svg"
								/>
								<Box mt={-1}>
									<Text fontSize={"sm"} color="gray.500">
										Rewards
									</Text>
									<Heading fontSize={"xl"}>
										{tokenFormatter.format(0)} %
									</Heading>
									<Flex gap={0.5} mt={0.5}>
										<Image src="/esSYX.svg" />
										<Text fontSize={"sm"} color="gray.400">
											{(pools[tradingPool]?.rewardSpeeds[0] + 1)**365 - 1} %
										</Text>
									</Flex>
								</Box>
							</Flex>

							<Flex mt={4} gap={3} align="start">
								<Image
									h={"35px"}
									minH="35px"
									src="/icon3.svg"
								/>
								<Box mt={-1}>
									<Text fontSize={"sm"} color="gray.500">
										Issued Debt
									</Text>
									<Heading fontSize={"xl"}>
										{dollarFormatter.format(totalDebt)}
									</Heading>
								</Box>
							</Flex>
						</Flex>
					</motion.div>
				</Box>
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.45 }}
					key={tradingPool}
				>
					<Box textAlign={"right"} alignSelf="end">
						<Text fontSize={"sm"} mb={0.5} color="gray.400">
							Debt Limit
						</Text>
						<Heading fontSize={"3xl"} mb={2} color='primary'>
						{(totalCollateral > 0
								? 100*totalDebt / totalCollateral
								: totalCollateral).toFixed(1)}{" "}
							%
						</Heading>
						<Progress
							my={2}
							mt={4}
							value={
								totalCollateral > 0
								? 100*totalDebt / totalCollateral
								: totalCollateral
							}
							size="sm"
							width={"300px"}
							bg="gray.800"
							rounded="full"
						>
						</Progress>
						<Flex justify={"end"} gap={1}>
							<Text fontSize={"sm"} color="gray.400">
								Available to Issue
							</Text>
							<Text fontSize={"sm"} fontWeight="medium">
								{dollarFormatter.format(adjustedCollateral - totalDebt < 0 ? 0 : adjustedCollateral - totalDebt)}
							</Text>
						</Flex>
					</Box>
				</motion.div>
			</Flex>

			<Flex gap={8} pb={'100px'} mt={"80px"} >
				<Box w={"33%"} bg={"gray.800"} rounded='10'>
					<CollateralTable />
				</Box>
				<Box w={"67%"} bg={"gray.800"} rounded='10'>
					<IssuanceTable />
				</Box>
			</Flex>
		</>
	);
}
