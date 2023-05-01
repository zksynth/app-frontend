import {
	Box,
	Button,
	Flex,
	Heading,
	Text,
	useClipboard,
} from "@chakra-ui/react";
import { base58 } from "ethers/lib/utils.js";
import Head from "next/head";
import { useAccount, useBalance } from "wagmi";
import { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import { dollarFormatter } from "../src/const";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Title from "../components/account/title";
import Referral from "../components/account/referral";
import ConnectBox from "../components/account/connect";
import Portfolio from "../components/account/portfolio";

export default function Account() {
	const { address } = useAccount();

	

	const { referrals, account } = useContext(AppDataContext);

	return (
		<>
			<Head>
				<title>Account | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>

			{address ? <>
				<Title/>
				<Portfolio/>
				{/* {account && <Referral/>} */}
			 </>: <>
				<ConnectBox/>
			</>}
			
		</>
	);
}
