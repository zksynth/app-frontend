import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import {
	RainbowKitProvider,
	getDefaultWallets,
	darkTheme,
} from '@rainbow-me/rainbowkit';
import {
	chain,
	configureChains,
	createClient,
	WagmiConfig,
	defaultChains,
	Chain,
} from 'wagmi';
// import { chains } from '../src/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { Box, ChakraProvider, Flex } from '@chakra-ui/react';
import { WalletContextProvider } from '../components/context/WalletContextProvider';
import Index from './_index';

import { useEffect } from 'react';
import { AppDataProvider } from '../components/context/AppDataProvider';
import { theme } from '../src/theme';

const { chains, provider } = configureChains(
	[{
	  ...chain.arbitrumGoerli,
	  iconUrl: 'https://arbitrum.io/wp-content/uploads/2021/01/Arbitrum_Symbol-Full-color-White-background.png'
	} as Chain,
	// chain.goerli
  ],
	[
	  alchemyProvider({ apiKey: 'HyNaane88yHFsK8Yrn4gf2OOzHkd6GAJ' }),
	  publicProvider()
	]
  );
  
  const { connectors } = getDefaultWallets({
	appName: 'SyntheX',
	chains
  });
  
  const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider
  })

function MyApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		localStorage.setItem('chakra-ui-color-mode', 'light');
	});

	return (
		<ChakraProvider theme={theme}>
			<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider chains={chains} theme={darkTheme()}>
				<WalletContextProvider>
					<AppDataProvider>
						<Index>
							<Component {...pageProps} />
						</Index>
					</AppDataProvider>
				</WalletContextProvider>
				</RainbowKitProvider>
			</WagmiConfig>
		</ChakraProvider>
	);
}

export default MyApp;
