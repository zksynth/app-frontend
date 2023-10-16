import { Box, Flex, Heading, IconButton } from "@chakra-ui/react";
import React from "react";
import { useContext } from "react";
import {
	Text,
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";
import { dollarFormatter } from "../../src/const";
import Big from "big.js";
import { useAccount } from "wagmi";
import { MdRefresh } from "react-icons/md";
import { usePriceData } from "../context/PriceContext";
import MinimalSynthPosition from "../dashboard/MinimalSynthPosition";

export default function Portfolio() {
	const { account, pools, fetchData } = useContext(AppDataContext);
	const [refreshing, setRefreshing] = React.useState(false);
	const { address } = useAccount();
	const { prices } = usePriceData();

	return (
		<Box my={10}>
			<Heading size={'md'} mb={4}>Synthetics Positions</Heading>
			<Flex gap={4} wrap={'wrap'}>
			{pools.map((pool: any, index: number) => <>
				<MinimalSynthPosition poolIndex={index} />
			</>)}
			</Flex>

			<Heading size={'md'} mt={14} mb={4}>Lending Positions</Heading>

		</Box>
	);
}
