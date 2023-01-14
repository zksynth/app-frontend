import { ethers } from "ethers";
import { ChainID } from "./chains";



export const DUMMY_ADDRESS = {
	[ChainID.NILE]: "TU6nPbkDzMfhtg13nUnTMbuVFFMpLSs3P3",
	[ChainID.AURORA]: ethers.constants.AddressZero,
};

export const Endpoints: any = {
	[ChainID.NILE]: "https://api.synthex.finance/",
	[ChainID.AURORA]: "https://aurora.api.synthex.finance/", // 'http://localhost:3030/',
	[ChainID.ARB_GOERLI]: process.env.NODE_ENV == 'development' ? "https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex-dev" : "https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex"
};

export const dollarFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumSignificantDigits: 6
});

export const tokenFormatter = new Intl.NumberFormat("en-US", {
	maximumSignificantDigits: 8,
});


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
