import { Chain } from 'wagmi';


export enum ChainID {
    AURORA = 1313161555,
	HARMONY = 1666700000,
	ARB_GOERLI = 421613,
	ARB = 42161,
}

const aurora: Chain = {
	/** ID in number form */
	id: ChainID.AURORA,
	/** Human-readable name */
	name: 'Aurora Testnet',
	/** Internal network name */
	network: 'Aurora',
	/** Currency used by chain */
	nativeCurrency: {
		name: 'Ethereum',
		symbol: 'ETH',
		decimals: 18,
	},
	/** Collection of RPC endpoints */
	rpcUrls: {
		public: 'https://testnet.aurora.dev',
		default: 'https://testnet.aurora.dev',
	},
	/** Collection of block explorers */
	blockExplorers: {
		etherscan: {
			name: 'AuroraScan',
			url: 'https://testnet.aurorascan.dev/',
		},
		default: {
			name: 'AuroraScan',
			url: 'https://testnet.aurorascan.dev/',
		},
	},

	/**
	 * Chain [multicall3 contract](https://github.com/mds1/multicall)
	 */
	// multicall?: {
	//     address: Address;
	//     blockCreated: number;
	// };
	/** Flag for test networks */
	// testnet: true,
};

const arbitrum: Chain = {
	/** ID in number form */
	id: ChainID.ARB_GOERLI,
	/** Human-readable name */
	name: 'Bittorent Donau',
	/** Internal network name */
	network: 'Bittorent Donau',
	/** Currency used by chain */
	nativeCurrency: {
		name: 'Bittorrent',
		symbol: 'BTT',
		decimals: 18,
	},
	/** Collection of RPC endpoints */
	rpcUrls: {
		public: 'https://goerli.arbiscan.io/',
		default: 'https://goerli.arbiscan.io/',
	},
	/** Collection of block explorers */
	blockExplorers: {
		etherscan: {
			name: 'Arbiscan',
			url: 'https://goerli.arbiscan.io/',
		},
		default: {
			name: 'Arbiscan',
			url: 'https://goerli.arbiscan.io/',
		},
	},

	/**
	 * Chain [multicall3 contract](https://github.com/mds1/multicall)
	 */
	// multicall?: {
	//     address: Address;
	//     blockCreated: number;
	// };
	/** Flag for test networks */
	// testnet: true,
};

const harmony: Chain = {
	/** ID in number form */
	id: ChainID.HARMONY,
	/** Human-readable name */
	name: 'Harmony Testnet',
	/** Internal network name */
	network: 'Harmony Testnet',
	/** Currency used by chain */
	nativeCurrency: {
		name: 'Harmony ONE',
		symbol: 'ONE',
		decimals: 18,
	},
	/** Collection of RPC endpoints */
	rpcUrls: {
		public: 'https://api.s0.b.hmny.io/',
		default: 'https://api.s0.b.hmny.io/',
	},
	/** Collection of block explorers */
	blockExplorers: {
		etherscan: {
			name: 'Harmony Explorer',
			url: 'https://explorer.testnet.harmony.one/',
		},
		default: {
			name: 'Harmony Explorer',
			url: 'https://explorer.testnet.harmony.one/',
		},
	},

	/**
	 * Chain [multicall3 contract](https://github.com/mds1/multicall)
	 */
	// multicall?: {
	//     address: Address;
	//     blockCreated: number;
	// };
	/** Flag for test networks */
	// testnet: true,
};

export const chains: Chain[] = [
    aurora, 
	harmony,
	arbitrum
];

export const chainMapping: any = {
	[ChainID.AURORA]: aurora,
	[ChainID.HARMONY]: harmony,
	[ChainID.ARB_GOERLI]: arbitrum
}

export const chainIndex: any = {
	[ChainID.AURORA]: 0,
	[ChainID.HARMONY]: 1,
	[ChainID.ARB_GOERLI]: 2
}