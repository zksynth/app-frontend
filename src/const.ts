import { ethers } from "ethers";
import { lineaMainnet, lineaTestnet, mantleMainnet, mantleTestnet } from "./chains";
import { scrollSepolia } from "viem/chains";
export const ADDRESS_ZERO = ethers.constants.AddressZero;

const NETWORKS: any = {
	[scrollSepolia.id]: scrollSepolia,
}

export const defaultChain = NETWORKS[Number(process.env.NEXT_PUBLIC_CHAIN_ID)!] ?? scrollSepolia;

export const NATIVE = defaultChain.nativeCurrency.symbol;
export const W_NATIVE = `W${NATIVE}`;
export const ESYX_PRICE = 0.0075;
export const SUPPORTS_ROLLUP_GASFEES = false;

export const DOLLAR_PRECISION = 0.01;

const VERSIONS = {
	['0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9'.toLowerCase()]: '2'
}

export const EIP712_VERSION = (asset: string) => VERSIONS[asset.toLowerCase()] ?? '1';

const _WETH_ADDRESS: any = {
	[scrollSepolia.id]: "0x86e6dd832c9a692CA6ED2fD562c55FaB9Cd4B259".toLowerCase(),
};

export const PERP_CATEGORIES: any = {
    3: 'C',
    4: 'S'
}

export const POOL_COLORS: any = {
	0: 'linear(to-t, #002FFE, rgba(2,246,211))',
}

export const EPOCH_REWARDS: any = {
	1: 1_000_000,
	2: 250_000,
	3: 250_000,
	4: 100_000,
	5: 100_000,
	6: 100_000,
}

export const PROJECT_ID = '9635a0d9de95bced3f125a11f3ace2b5';
export const APP_NAME = process.env.NEXT_PUBLIC_TOKEN_SYMBOL;

export const WETH_ADDRESS = (chainId: number) => _WETH_ADDRESS[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _WETH_ADDRESS[mantleTestnet.id] : _WETH_ADDRESS[mantleMainnet.id]);

export const PYTH_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://xc-testnet.pyth.network' : 'https://xc-mainnet.pyth.network';
export const ROUTER_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://routes-api.reax.one' : 'https://mainnet.router-api.reax.one';
export const EPOCH_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://rewards-testnet-api.reax.one' : 'https://rewards-mainnet-api.reax.one';

export const REPLACED_FEEDS: any = {
	"0x0e9ec6a3f2fba0a3df73db71c84d736b8fc1970577639c9456a2fee0c8f66d93": "0xd45b6d47bf43faa700e6f6fec4f8989fcc80eabb2f2eff862d7258d60026d1b5"
}

export const dollarFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	roundingMode: "floor",
} as any);

export const tokenFormatter = new Intl.NumberFormat("en-US", {
	maximumSignificantDigits: 6,
	roundingMode: "floor",
} as any);

export const compactTokenFormatter = new Intl.NumberFormat("en-US", {
	maximumSignificantDigits: 4,
	// compact
	notation: "compact",
	roundingMode: "floor",
} as any);

export const numberFormatter = new Intl.NumberFormat("en-US", {
	maximumSignificantDigits: 8,
	roundingMode: "floor",
} as any);

export const numOrZero = (num: number) => {
	if (num === undefined || num === null || isNaN(num)) return 0;
	return num;
};