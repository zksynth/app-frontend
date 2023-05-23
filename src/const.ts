import { ethers } from "ethers";
import { ChainID, chains } from "./chains";
import { zkSyncTestnet } from 'wagmi/chains';

export const ADDRESS_ZERO = ethers.constants.AddressZero;
const _WETH_ADDRESS: any = {
	[ChainID.ARB_GOERLI]: "0x7964Bcc63335E101F23da13583CEaD61d75f863b",
	[ChainID.ARB]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
	280: "0x5e4ccda7f92283d51144db6198877512662dec5c"
};
export const ESYX_PRICE = 0.005;

export const PROJECT_ID = '9635a0d9de95bced3f125a11f3ace2b5';
export const APP_NAME = 'Synthex';

const _Endpoints: any = {
	[ChainID.ARB]: process.env.NEXT_PUBLIC_GRAPH_URL_42161,
	[ChainID.ARB_GOERLI]: process.env.NEXT_PUBLIC_GRAPH_URL_421613,
	[280]: process.env.NEXT_PUBLIC_GRAPH_URL_280,
}

export const PARTNER_ASSETS: any = {
	"Lodestar": ["lUSDC"]
}

export const PARTNER_ASSET_LOGOS: any = {
	"Lodestar": "/icons/lodestar.svg"
}

export const PARTNER_ASSET_COLOR_GRADIENTS: any = {
	"Lodestar": ["#162421", "#162421"]
}

export const PARTNER_ASSET_COLOR: any = {
	"Lodestar": "#E5D540"
}

export const Endpoints = (chainId: number) => _Endpoints[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _Endpoints[ChainID.ARB_GOERLI] : _Endpoints[ChainID.ARB]); 
export const WETH_ADDRESS = (chainId: number) => _WETH_ADDRESS[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _WETH_ADDRESS[ChainID.ARB_GOERLI] : _WETH_ADDRESS[ChainID.ARB]);

export const PYTH_ENDPOINT = process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? 'https://xc-testnet.pyth.network' : 'https://xc-mainnet.pyth.network';
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

export const PARTNER_WARNINGS: any = {
	"Lodestar": "If you are borrowing on Lodestar, depositing you lAsset here will lower your collateralization ratio. Please be careful."
}

export const query = (address: string) => (
	`{
		pools {
		  id
		  name
		  symbol
		  totalSupply
		  totalDebtUSD
		  oracle
		  paused
		  issuerAlloc
		  rewardTokens {
			id
		  }
		  rewardSpeeds
		  synths {
			token {
			  id
			  name
			  symbol
			  decimals
			}
			cumulativeMinted
			cumulativeBurned
			priceUSD
			mintFee
			burnFee
			totalSupply
			synthDayData(first:7, orderBy: dayId, orderDirection: desc){
				dayId
				dailyMinted
				dailyBurned
			}
			feed
			fallbackFeed
		  }
		  collaterals {
			token {
			  id
			  name
			  symbol
			  decimals
			}
			priceUSD
			cap
			baseLTV
			liqThreshold
			totalDeposits
			feed
			fallbackFeed
		  }
		}
		accounts(where: {id: "${address}"}){
		  id
		  createdAt
		  referredBy
		  accountDayData(orderBy: dayId, orderDirection: desc){
			dayId
			dailySynthsMinted{
				synth{
					id
					pool{
						id
					}
				}
				amount
			}
		  }
		  positions{
			pool{
			  id
			}
			balance
			collateralBalances{
			  balance
			  collateral{
				token{
					id
				}
			  }
			}
		  }
		}
	  }`
)

export const query_leaderboard = `
	{
		accounts{
			id
			accountDayData(orderBy: dayId, orderDirection: desc){
				dayId
				dailySynthsMinted{
					synth{
						id
						pool{
							id
						}
					}
					amount
				}
			}
		}
	}
`;

export const query_referrals = (address: string) => (`
	{
		accounts(where: {referredBy: "${address}"}){
			id
			accountDayData(first:1, orderBy: dayId, orderDirection: desc){
				dayId
				dailySynthsMinted{
					synth{
						id
						pool{
							id
						}
					}
					amount
				}
			}
		}
	}
`);

const COLORS_GREEN = [
	"#154F43",
	"#043D31",
	"#002E24",
	"#194038"
]

const COLORS_BLUE = [
	"#243B95",
	"#5677FB",
	"#C3CFFF",
	"#5B6CAE",
	"#7B8FDD",
	"#9DB1FF",
	"#3D54AF",
	"#1A275C",
]

// return a random color from COLORS
export const TOKEN_COLORS = () => {
	return COLORS_GREEN[Math.floor(Math.random() * COLORS_GREEN.length)];
}

export const TOKEN_COLORS2: any = {
	BTCx: "#F5B300",
	ETHx: "#8C8C8C",
	BNBx: "#FFC53E",
	ADAx: "#006CC3",
	AAVEx: "#3FACC1",
	LINKx: "#008DFF",
	UNIx: "#F60DC9",
	DOGEx: "#F8BF1A",
	DOTx: "#E6007A",
	APPLx: "#767676",
	TSLAx: "#C70B01",
	AMZNx: "#FF9A00",
	FBx: "#1877F2",
	MSFTx: "#4CAF50",
	'^GSPCx': "#DC241F",
	NFLXx: "#F44336",
	NVDAx: "#4CAF50",
	GOOGLx: "#4285F4",
	AMDx: "#00B100",
	AAPLx: "#6B6B6B",
	USDcx: "#5677FB",
	USDsx: "#5677FB",
	USDfx: "#5677FB",
	EURx: "#FF8C00",
	JPYx: "#3EE6C4",
	GBPx: "#EF4255",
	CHFx: "#00C0A9",
	CADx: "#CF0089",
	AUDx: "#DCC54C",
	WONx: "#DC4C4C",
	AEDx: "#167866",
	INRx: "#463EA9",
};
