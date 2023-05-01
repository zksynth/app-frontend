import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import {
	RainbowKitProvider,
	connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
	coinbaseWallet,
	metaMaskWallet,
	phantomWallet,
	rainbowWallet,
	trustWallet,
	walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient, WagmiConfig, Chain } from "wagmi";
import { arbitrumGoerli, arbitrum, zkSyncTestnet } from "wagmi/chains";
// import { chains } from '../src/chains';
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import Index from "./_index";

import { AppDataProvider } from "../components/context/AppDataProvider";
import { theme } from "../styles/theme";
import rainbowTheme from "../styles/rainbowTheme";
import { TokenContextProvider } from "../components/context/TokenContext";
import { rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { PROJECT_ID, APP_NAME } from "../src/const";

const _chains = []

if(process.env.NEXT_PUBLIC_NETWORK == 'testnet'){
	_chains.push(arbitrumGoerli);
	_chains.push(zkSyncTestnet);
} else {
	_chains.push(arbitrum);
}

const { chains, provider } = configureChains(
	_chains,
	[
		alchemyProvider({ apiKey: "HyNaane88yHFsK8Yrn4gf2OOzHkd6GAJ" }),
		publicProvider(),
	]
);

const connectors = connectorsForWallets([
	{
		groupName: "Recommended",
		wallets: [
			metaMaskWallet({ chains }),
			walletConnectWallet({ projectId: PROJECT_ID, chains }),
		],
	},
	{
		groupName: "All Wallets",
		wallets: [
			rainbowWallet({ projectId: PROJECT_ID, chains }),
			trustWallet({ projectId: PROJECT_ID, chains }),
			phantomWallet({ chains }),
			coinbaseWallet({ appName: APP_NAME, chains }),
			rabbyWallet({ chains }),
		],
	},
]);

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={theme}>
			<WagmiConfig client={wagmiClient}>
				<RainbowKitProvider chains={chains} theme={rainbowTheme}>
					<AppDataProvider>
						<TokenContextProvider>
							<Index>
								<Component {...pageProps} />
							</Index>
						</TokenContextProvider>
					</AppDataProvider>
				</RainbowKitProvider>
			</WagmiConfig>
		</ChakraProvider>
	);
}

export default MyApp;
