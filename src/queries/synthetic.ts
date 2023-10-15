export const scrollSepolia: any = {
	id: 534_351,
	name: 'Scroll Sepolia',
	network: 'scroll-sepolia',
	nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
	rpcUrls: {
	  default: {
		http: ['https://sepolia-rpc.scroll.io'],
		webSocket: ['wss://sepolia-rpc.scroll.io/ws'],
	  },
	  public: {
		http: ['https://sepolia-rpc.scroll.io'],
		webSocket: ['wss://sepolia-rpc.scroll.io/ws'],
	  },
	},
	blockExplorers: {
	  default: {
		name: 'Blockscout',
		url: 'https://sepolia-blockscout.scroll.io',
	  },
	},
	contracts: {
	  multicall3: {
		address: '0xca11bde05977b3631167028862be2a173976ca11',
		blockCreated: 9473,
	  },
	},
	testnet: true,
};const _Endpoints: any = {
	[scrollSepolia.id]: process.env.NEXT_PUBLIC_GRAPH_URL_534351,
}

export const Endpoints = (chainId: number) => _Endpoints[chainId] ?? (process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? _Endpoints[scrollSepolia.id] : _Endpoints[scrollSepolia.id]); 

export const query = (address: string) => (
	`{
		pools (orderBy: symbol) {
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
			  isPermit
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
			  isPermit
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
);