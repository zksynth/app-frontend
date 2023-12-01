import "../styles/globals.css";
import "../styles/edgy-dark.css";
import "../styles/edgy-light.css";
import "../styles/rounded-dark.css";
import "../styles/rounded-light.css";

import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import {
	RainbowKitProvider, getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import Index from "./_index";

import { AppDataProvider } from "../components/context/AppDataProvider";
import { theme } from "../styles/theme";
import rainbowTheme from "../styles/rainbowTheme";
import { TokenContextProvider } from "../components/context/TokenContext";
import { BalanceContext, BalanceContextProvider } from "../components/context/BalanceProvider";
import { PriceContextProvider } from "../components/context/PriceContext";
import { SyntheticsPositionProvider } from "../components/context/SyntheticsPosition";

import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public';
import { defaultChain } from "../src/const";
 
const { chains, publicClient } = configureChains(
[defaultChain],
[
	publicProvider()
]
);

const { connectors } = getDefaultWallets({
	appName: process.env.NEXT_PUBLIC_TOKEN_SYMBOL ?? "WAGMI",
	projectId: 'YOUR_PROJECT_ID',
	chains
});

const wagmiConfig = createConfig({
autoConnect: true,
connectors,
publicClient
})

function MyApp({ Component, pageProps }: AppProps) {

	return (
		<ChakraProvider theme={theme}>
			<WagmiConfig config={wagmiConfig}>
				<RainbowKitProvider chains={chains} modalSize="compact" theme={rainbowTheme}>
					<AppDataProvider>
							<BalanceContextProvider>
								<PriceContextProvider>
									<TokenContextProvider>
									<SyntheticsPositionProvider>
										<Index>
											<Component {...pageProps} />
										</Index>
									</SyntheticsPositionProvider>
									</TokenContextProvider>
								</PriceContextProvider>
							</BalanceContextProvider>
					</AppDataProvider>
				</RainbowKitProvider>
			</WagmiConfig>
		</ChakraProvider>
	);
}

export default MyApp;
