export interface MarketType {
    id: string;
    name: string;
    _mintedTokens: [];
}

export interface Token {
    id: string;
    name: string;
    symbol: string;
    decimals: number
}