import { Box, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { useContext } from "react";
import {
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	StatGroup,
	Text,
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";
import { dollarFormatter } from "../../src/const";
import Big from "big.js";

export default function Portfolio() {
	const { account, pools } = useContext(AppDataContext);

	const accountPoints = (__account : any = account) => {
		if(!__account) return {today: '-', total: '-'};
		if(!__account.accountDayData) return {today: '-', total: '-'};
		let today = Big(0);
		let total = Big(0);
		for(let i = 0; i < __account.accountDayData.length; i++){
		  let dailyPoint = Big(0);
		  if(!__account.accountDayData[i].dailySynthsMinted) continue;
		  for(let j = 0; j < __account.accountDayData[i].dailySynthsMinted.length; j++){
			const pool = pools.find((pool: any) => pool.id == __account.accountDayData[i].dailySynthsMinted[j].synth.pool.id);
			if(!pool) continue;
			const synth = pool.synths.find(
			  (synth: any) => synth.token.id == __account.accountDayData[i].dailySynthsMinted[j].synth.id
			);
			if(!synth) continue;
			dailyPoint = dailyPoint.plus(
			  Big(__account.accountDayData[i].dailySynthsMinted[j].amount)
			  .mul(synth.priceUSD)
			);
		  }
		  total = total.plus(dailyPoint);
		  if(__account.accountDayData[i]?.dayId == Math.floor(Date.now()/(24*3600000))){
			today = dailyPoint;
		  }
		}
		return {today: dollarFormatter.format(today.toNumber()), total: dollarFormatter.format(total.toNumber())};
	  }

	return (
		<Box my={10}>
			{/* <Stat>
				<StatLabel>Total</StatLabel>
				<StatNumber>345,670</StatNumber>
				<StatHelpText>
					<StatArrow type="increase" />
					23.36%
				</StatHelpText>
			</Stat> */}

			<Flex my={10} gap={20}>
				<Box>
					<Heading size={"sm"} color="blackAlpha.700">
						Active Since
					</Heading>
					<Text mt={0.5} fontSize={"2xl"}>
						{account
							? new Date(account.createdAt * 1000)
									.toDateString()
									.slice(4)
							: "-"}
					</Text>
				</Box>

				<Box>
					<Heading size={"sm"} color="blackAlpha.700">
						24h Volume
					</Heading>
					<Text mt={0.5} fontSize={"2xl"}>
						{account
							? accountPoints().today
							: "-"}
					</Text>
				</Box>

				<Box>
					<Heading size={"sm"} color="blackAlpha.700">
						Total Volume
					</Heading>
					<Text mt={0.5} fontSize={"2xl"}>
						{account
							? accountPoints().total
							: "-"}
					</Text>
				</Box>
			</Flex>
		</Box>
	);
}
