
export const mantleTestnet = {
    id: 5001,
    name: "Mantle Testnet",
    network: "mantle-testnet",
    nativeCurrency: {
        name: "Mantle",
        symbol: "MNT",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://mantle-testnet.rpc.thirdweb.com", "https://rpc.testnet.mantle.xyz"],
            // webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        },
        public: {
            http: ["https://rpc.testnet.mantle.xyz", "https://mantle-testnet.rpc.thirdweb.com"],
            // readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        }
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://explorer.testnet.mantle.xyz"
        }
    },
    testnet: true
};

export const mantleMainnet = {
    id: 5000,
    name: "Mantle",
    network: "mantle",
    nativeCurrency: {
        name: "Mantle",
        symbol: "MNT",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.mantle.xyz"],
            // webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        },
        public: {
            http: ["https://rpc.mantle.xyz"],
            // readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        }
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://explorer.mantle.xyz"
        }
    },
    testnet: false
};

export const lineaMainnet = {
    id: 59144,
    name: "Linea",
    network: "linea",
    nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://linea-mainnet.infura.io/v3"],
            // webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        },
        public: {
            http: ["https://linea-mainnet.infura.io/v3"],
            // readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        }
    },
    blockExplorers: {
        default: {
            name: "Etherscan",
            url: "https://lineascan.build/"
        }
    },
    testnet: false
};

export const lineaTestnet = {
    id: 59140,
    name: "Linea Testnet",
    network: "linea-testnet",
    nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.goerli.linea.build"],
            // webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        },
        public: {
            http: ["https://rpc.goerli.linea.build"],
            // readonly webSocket: readonly ["wss://alpha-rpc.scroll.io/l2/ws"];
        }
    },
    blockExplorers: {
        default: {
            name: "Etherscan",
            url: "https://goerli.lineascan.build/"
        }
    },
    testnet: true
};