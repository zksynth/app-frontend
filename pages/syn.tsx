import {
	Box,
	CardHeader,
	Heading,
	Text,
	Flex,
	Button,
	Skeleton,
} from "@chakra-ui/react";
import Head from "next/head";
import React from "react";
import SYN from "../components/SYN";

export default function xsyn() {
	return (
		<>
			<Head>
				<title>xSYN | SyntheX</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Box maxW={'1200px'}>
				<SYN />
			</Box>
		</>
	);
}
