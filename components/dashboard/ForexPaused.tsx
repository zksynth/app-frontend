import { Flex, Heading, Text, Box } from '@chakra-ui/react'
import React from 'react'

export default function ForexPaused() {
    const getTimeUntilNextSunday5PM = () => {
		const now: any = new Date();
		const dayOfWeek = now.getUTCDay();
		const targetDayOfWeek = 0; // Sunday
		let daysUntilNextSunday = targetDayOfWeek - dayOfWeek;
		if (daysUntilNextSunday <= 0) {
			daysUntilNextSunday += 7;
		}
		const nextSunday: any = new Date(
			now.getTime() + daysUntilNextSunday * 24 * 60 * 60 * 1000
		);
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
			seconds: seconds,
		};
	};
  return (
    <Flex
							gap={3}
							bg={"bg2"}
							rounded="16"
							flexDir={"column"}
							h="360px"
							w={"100%"}
							align="center"
							justify={"center"}
							border="2px"
							borderColor={"whiteAlpha.200"}
						>
							<Heading size={"lg"}>Market Paused</Heading>
							<Text
								textAlign={"center"}
								color="whiteAlpha.700"
								maxW={"400px"}
							>
								Forex (Foreign Exchange) markets are traded only
								from 5PM EDT on Sunday through 4PM EDT on Friday
							</Text>
							<Text mt={5}>Opening back in</Text>
							<Flex justify={"center"} gap={4}>
								<Box textAlign={"center"}>
									<Heading>
										{getTimeUntilNextSunday5PM().days}
									</Heading>
									<Text>Day</Text>
								</Box>
								<Heading>:</Heading>
								<Box textAlign={"center"}>
									<Heading>
										{getTimeUntilNextSunday5PM().hours}
									</Heading>
									<Text>Hour</Text>
								</Box>
								<Heading>:</Heading>
								<Box textAlign={"center"}>
									<Heading>
										{getTimeUntilNextSunday5PM().minutes}
									</Heading>
									<Text>Minute</Text>
								</Box>
							</Flex>
						</Flex>
  )
}
