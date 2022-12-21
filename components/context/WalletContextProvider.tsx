import * as React from 'react'
import { ChainID } from '../../src/chains';
const {Big} = require('big.js');

const WalletContext = React.createContext<WalletValue>({} as WalletValue);

const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const node = "https://nile.trongrid.io";
const fullNode = new HttpProvider(node);
const solidityNode = new HttpProvider(node);
const eventServer = new HttpProvider(node);
const privateKey = '52641f54dc5e1951657523c8e7a1c44ac76229a4b14db076dce6a6ce9ae9293d';
const tronWebObject = new TronWeb(fullNode,solidityNode,eventServer,privateKey);

function WalletContextProvider({children}: any) {
    const [address, setAddress] = React.useState<string|null>(null);
    const [tronWeb, setTronWeb] = React.useState({});
    const [isConnected, setIsConnected] = React.useState(false);
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [isDisconnected, setIsDisconnected] = React.useState(true);
	const [connectionError, setConnectionError] = React.useState<null|string>(null);
    const [chain, setChain] = React.useState(null);

    const connect = (callback: (address: string|null, err: string|null) => void = (__: string|null, _: string|null) => {}, options: {errRetryCount: number} = {errRetryCount: 0}) => {
		setIsConnecting(true);
        console.log("connecting", options.errRetryCount);
        if((window as any).tronWeb){
            setTronWeb((window as any).tronWeb);
            (window as any).tronWeb.trx.getAccount((window as any).tronWeb.defaultAddress.base58).then((account: any) => {
                let _addr = '';
				if(!account.address){
					_addr = (window as any).tronWeb.address.fromHex(account.__payload__.address);
				} else {
					_addr = (window as any).tronWeb.address.fromHex(account.address);
				}
				if((window as any).tronWeb.fullNode.host != 'https://api.nileex.io'){
                    setConnectionError('Please connect to Nile Testnet');
                    callback(null, 'ERROR: Not connected to Nile Testnet')
				} 
                console.log('Connected to TronWeb', _addr);
                setAddress(_addr)
                setChain((window as any).tronWeb.fullNode.host)
                callback(_addr, null)
                setIsConnected(true);
                setIsDisconnected(false);
                setIsConnecting(false);
				localStorage.setItem("address", _addr)
                localStorage.setItem("chain", ChainID.NILE.toString())
            })
			.catch((err: any) => {
				if(options.errRetryCount >= 5){
					setConnectionError('Unlock your TronLink wallet to connect');
					setIsConnecting(false);
					let __tronWeb = (window as any).tronWeb
					if(!__tronWeb){
						setTronWeb(tronWebObject)
					}
					callback(null, 'ERROR: TronLink wallet is locked');
				} else {
					setTimeout(() => {connect(callback, {errRetryCount: options.errRetryCount + 1})}, 1000);
				}
			})
        } else {
			if(typeof window !== 'undefined'){
				if(options.errRetryCount >= 5){
					setConnectionError('Please install TronLink wallet extension');
					setIsConnecting(false);
					let __tronWeb = (window as any).tronWeb
					if(!__tronWeb){
						setTronWeb(tronWebObject)
					}
					callback(null, 'ERROR: TronLink wallet is not installed');
				} else  {
					setTimeout(() => {connect(callback, {errRetryCount: options.errRetryCount + 1})}, 1000);
				}
			}
		}
    }

    const disconnect = () => {
        setAddress(null);
        setConnectionError('');
        setChain(null);
        setIsConnected(false);
        setIsConnecting(false);
        localStorage.removeItem("address");
    }

    const value: WalletValue = {
        address, tronWeb, isConnected, isConnecting, isDisconnected, chain, 
        connect,
        connectionError,
        disconnect
    };

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

interface WalletValue {
    address: string|null;
    tronWeb: {};
    isConnected: boolean;
    isConnecting: boolean;
    isDisconnected: boolean;
    chain: null;
    connect: (callback: any, options?: any) => void;
    disconnect: () => void;
	connectionError: string|null;
}

export {WalletContextProvider, WalletContext}