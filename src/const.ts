import { ethers } from "ethers";
import { ChainID } from "./chains";
export const DUMMY_ADDRESS = {
	[ChainID.NILE]: "TU6nPbkDzMfhtg13nUnTMbuVFFMpLSs3P3",
	[ChainID.AURORA]: ethers.constants.AddressZero,
};

export const HELPER = "";
export const EXCHANGE = "";
export const VAULT = "";
export const SYSTEM = "";

export const ADDRESSES: any = {
	[ChainID.NILE]: {
		Helper: "TY7KLZkopABnjy4x8SSbsaK9viV9bqxCvE",
		System: "TJiPUzzt3yQySg8qJ6xPXpuPn1yHjHNJxm",
		WTRX: "TJE8C3ZhnxrQAL69D5C6C5fQFNitrTKqZD",
	},
	[ChainID.AURORA]: {
		Helper: "0x36A0A236C0125240cB15629959bdFf74fC1F3290",
		System: "0xFac2F4ce393Bc7253d3795D6f415d792ee4eca3A",
		WTRX: "0x6CF5B73CC04D54418686dc9FE389fc7b90ad0e89",
	},
	[ChainID.ARB_GOERLI]: {
		SyntheX: "0x241691dE5EDC2dfC16E93ff8A0445c2f8d3ec779",
		Multicall: "0x511f64296fa72526231E5A55615d8e4eE5a2d4cF",
	},
};

export const Endpoints: any = {
	[ChainID.NILE]: "https://api.synthex.finance/",
	[ChainID.AURORA]: "https://aurora.api.synthex.finance/", // 'http://localhost:3030/',
	[ChainID.ARB_GOERLI]:
		"https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex",
};

export const dollarFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumSignificantDigits: 8,
});

export const tokenFormatter = new Intl.NumberFormat("en-US", {
	maximumSignificantDigits: 8,
});

export const TOKEN_COLORS: any = {
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
