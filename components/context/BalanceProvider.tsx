import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { getABI, getAddress, getContract } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { ADDRESS_ZERO, WETH_ADDRESS, defaultChain } from "../../src/const";
import { useAppData } from "./AppDataProvider";
import { Status } from "../utils/status";

const BalanceContext = React.createContext<BalanceValue>({} as BalanceValue);

interface BalanceValue {
    walletBalances: any;
    allowances: any;
    nonces: any;
    tokens: any[];
    status: Status;
    updateBalance: (asset: string, value: string, isMinus?: boolean) => void;
    addAllowance: (asset: string, spender: string, value: string) => void;
    addNonce: (asset: string, value: string) => void;
    updateFromTx: (tx: any) => void;
    setBalance: (asset: string, value: string) => void;
}

function BalanceContextProvider({ children }: any) {
    const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [walletBalances, setWalletBalances] = React.useState<any>({});
    const [allowances, setAllowances] = React.useState<any>({});
    const [nonces, setNonces] = React.useState<any>({});
    const [tokens, setTokens] = React.useState<any>([]);
	const { chain } = useNetwork();

    // const { pools: lendingPools, markets: selectedLendingMarket, protocols: lendingProtocols } = useLendingData();
    const { pools } = useAppData();
    const { address } = useAccount();
    const { pools: dexPools, vault, dex } = {pools: [] as any[], vault: {address: '', abi: ''}, dex: {miniChef: ''}};
    const { pools: lendingPools, markets: selectedLendingMarket, protocols: lendingProtocols } = {pools: [] as any[], markets: [] as any[], protocols: [] as any[]};

    React.useEffect(() => {
        if(status == Status.NOT_FETCHING && pools.length > 0) {
            fetchBalances(address);
        }
    }, [pools.length, address, status])

	const fetchBalances = async (_address?: string) => {
        console.log("Fetching balances for:", _address);
        // _address = "0xC841f46D199f4DC14FC62881E18c56d1Dc1d2D69".toLowerCase();
        setStatus(Status.FETCHING);
        const chainId = defaultChain.id;
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
        // const routerAddress = getAddress("Router", chainId);
        // const vTokenInterface = new ethers.utils.Interface(getABI("VToken", chainId));
        const itf = new ethers.utils.Interface(getABI("MockToken", chainId));
        
        // Get tokens: synths, synth collaterals, dex tokens, lending input tokens
        let _tokens: any[] = [];
        for(let i = 0; i < pools.length; i++) {
            for(let j = 0; j < pools[i].collaterals.length; j++) {
                const collateral = pools[i].collaterals[j];
                if(!_tokens.find((token: any) => token.id == collateral.token.id)) {
                    _tokens.push(collateral.token);
                }
            }
            for(let j = 0; j < pools[i].synths.length; j++) {
                const synth = pools[i].synths[j];
                if(!_tokens.find((token: any) => token.id == synth.token.id)) {
                    _tokens.push(synth.token);
                }
            }
        }
        for(let j = 0; j< lendingPools.length; j++){
            let markets = lendingPools[j];
            for(let i = 0; i < markets.length; i++) {
                const market = markets[i];
                if(!_tokens.find((token: any) => token.id == market.inputToken.id)) {
                    _tokens.push(market.inputToken);
                }
            }
        }

        for(let i = 0; i < dexPools.length; i++) {
            const dexPool = dexPools[i];
            for(let j = 0; j < dexPool.tokens.length; j++) {
                const token = dexPool.tokens[j];
                if(!_tokens.find((token: any) => token.id == token.id)) {
                    _tokens.push(token);
                }
            }
        }
        setTokens(_tokens);
        if(!_address){
            setStatus(Status.NOT_FETCHING);
            return;
        }

        let calls: any[] = [];
        // ETH balance
        calls.push([
            helper.address,
            helper.interface.encodeFunctionData("getEthBalance", [
                _address,
            ]),
        ]);
        // Get tokens balances, allowance to router, nonces for each token
        for(let i = 0; i < _tokens.length; i++) {
            const token = _tokens[i];
            calls.push([
                token.id,
                itf.encodeFunctionData("balanceOf", [_address]),
            ]);
            // calls.push([
            //     token.id,
            //     itf.encodeFunctionData("allowance", [
            //         _address,
            //         routerAddress,
            //     ]),
            // ]);
            if(token.isPermit){
                calls.push([
                    token.id,
                    itf.encodeFunctionData("nonces", [_address]),
                ])
            }
        }

        // for synthetic pools, get collaterals allowance to pool
        for (let i = 0; i < pools.length; i++) {
            for(let j = 0; j < pools[i].collaterals.length; j++) {
                const collateral = pools[i].collaterals[j];
                calls.push([
                    collateral.token.id,
                    itf.encodeFunctionData("allowance", [
                        _address,
                        pools[i].id,
                    ]),
                ]);
            }
        }
        // For lending input tokens, get allowance to lending protocol
        // If wrapped token, get allowance to wrapper and borrow allowace
        // Get balance and totalSupplies of output token, debt tokens
        // for(let j = 0; j < lendingPools.length; j++){
        //     let markets = lendingPools[j];
        //     const wrapperAddress = lendingProtocols[j]._wrapper;
        //     for(let i = 0; i < markets.length; i++) {
        //         const market = markets[i];
        //         // allowance to market
        //         calls.push([
        //             market.inputToken.id,
        //             itf.encodeFunctionData("allowance", [
        //                 _address,
        //                 market.protocol._lendingPoolAddress
        //             ]),
        //         ]);
        //         calls.push([
        //             market.outputToken.id,
        //             itf.encodeFunctionData("nonces", [_address]),
        //         ]);
        //         // if aweth, check allowance for wrapper
        //         if(market.inputToken.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
        //             calls.push([
        //                 market.outputToken.id,
        //                 itf.encodeFunctionData("allowance", [
        //                     _address,
        //                     wrapperAddress
        //                 ]),
        //             ]);
        //             calls.push([
        //                 market._vToken.id,
        //                 vTokenInterface.encodeFunctionData("borrowAllowance", [_address, wrapperAddress]),
        //             ])
        //         };

        //         calls.push([
        //             market.outputToken.id,
        //             itf.encodeFunctionData("balanceOf", [_address]),
        //         ]);
        //         // debt
        //         calls.push([
        //             market._vToken.id,
        //             itf.encodeFunctionData("balanceOf", [_address]),
        //         ]);
        //         calls.push([
        //             market._sToken.id,
        //             itf.encodeFunctionData("balanceOf", [_address]),
        //         ]);
        //     };
        // }

        // check balance for lp tokens and allowance to vault
        // for(let i = 0; i < dexPools.length; i++) {
        //     const dexPool = dexPools[i];
        //     // lp balance
        //     calls.push([
        //         dexPool.address,
        //         itf.encodeFunctionData("balanceOf", [_address]),
        //     ]);
        //     // check approval for staking to minichef
        //     calls.push([
        //         dexPool.address,
        //         itf.encodeFunctionData("allowance", [
        //             _address,
        //             dex.miniChef
        //         ]),
        //     ]);
        //     calls.push([
        //         dexPool.address,
        //         itf.encodeFunctionData("nonces", [_address]),
        //     ]);
        //     for(let j = 0; j < dexPool.tokens.length; j++) {
        //         const token = dexPool.tokens[j].token;
        //         calls.push([
        //             token.id,
        //             itf.encodeFunctionData("allowance", [
        //                 _address,
        //                 vault.address
        //             ]),
        //         ]);
        //     }
        // }

        helper.callStatic.aggregate(calls).then(async (res: any) => {
            const newBalances: any = {};
            const newAllowances: any = {};
            const newNonces: any = {};
            // const newTotalSupplies: any = {};
            res = res.returnData;
            let index = 0;
            // update eth balance
            newBalances[ADDRESS_ZERO] = BigNumber.from(res[index]).toString();
            index++;
            // update tokens
            for(let i = 0; i < _tokens.length; i++) {
                const token = _tokens[i];
                newBalances[token.id] = BigNumber.from(res[index]).toString();
                index++;
                // if(!newAllowances[token.id]) newAllowances[token.id] = {};
                // newAllowances[token.id][routerAddress] = BigNumber.from(res[index]).toString();
                // index++;
                if(token.isPermit){
                    newNonces[token.id] = BigNumber.from(res[index]).toString();
                    index++;
                }
            }
            for (let i = 0; i < pools.length; i++) {
                for(let j = 0; j < pools[i].collaterals.length; j++) {
                    const collateral = pools[i].collaterals[j];
                    if(!newAllowances[collateral.token.id]) newAllowances[collateral.token.id] = {};
                    newAllowances[collateral.token.id][pools[i].id] = BigNumber.from(res[index]).toString();
                    index++;
                }
            }
            // for(let j = 0; j < lendingPools.length; j++){
            //     let markets = lendingPools[j];
            //     const wrapperAddress = lendingProtocols[j]._wrapper;
            //     for(let i = 0; i < markets.length; i++) {
            //         const market = markets[i];
            //         if(!newAllowances[market.inputToken.id]) newAllowances[market.inputToken.id] = {};
            //         newAllowances[market.inputToken.id][market.protocol._lendingPoolAddress] = BigNumber.from(res[index]).toString();
            //         index++;
            //         newNonces[market.outputToken.id] = BigNumber.from(res[index]).toString();
            //         index++;
            //         if(market.inputToken.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
            //             if(!newAllowances[market.outputToken.id]) newAllowances[market.outputToken.id] = {};
            //             newAllowances[market.outputToken.id][wrapperAddress] = BigNumber.from(res[index]).toString();
            //             index++;
            //             if(!newAllowances[market._vToken.id]) newAllowances[market._vToken.id] = {};
            //             newAllowances[market._vToken.id][wrapperAddress] = BigNumber.from(res[index]).toString();
            //             index++;
            //         }
            //         newBalances[market.outputToken.id] = BigNumber.from(res[index]).toString();
            //         index++;
            //         newBalances[market._vToken.id] = BigNumber.from(res[index]).toString();
            //         index++;
            //         newBalances[market._sToken.id] = BigNumber.from(res[index]).toString();
            //         index++;
            //     }
            // }
            // for(let i = 0; i < dexPools.length; i++) {
            //     const dexPool = dexPools[i];
            //     newBalances[dexPool.address] = BigNumber.from(res[index]).toString();
            //     index++;
            //     if(!newAllowances[dexPool.address]) newAllowances[dexPool.address] = {};
            //     newAllowances[dexPool.address][dex.miniChef] = BigNumber.from(res[index]).toString();
            //     index++;
            //     newNonces[dexPool.address] = BigNumber.from(res[index]).toString();
            //     index++;
            //     for(let j = 0; j < dexPool.tokens.length; j++) {
            //         const token = dexPool.tokens[j].token;
            //         if(!newAllowances[token.id]) newAllowances[token.id] = {};
            //         newAllowances[token.id][vault.address] = BigNumber.from(res[index]).toString();
            //         index++;
            //     }
            // }
            setStatus(Status.SUCCESS);
            setWalletBalances(newBalances);
            setAllowances(newAllowances);
            setNonces(newNonces);
        })
        .catch((err: any) => {
            console.log("Failed to fetch balances", err);
            setStatus(Status.ERROR);
        })
	};

    /**
     * Parse Transfers (in and out) and Approvals from tx
     * @param tx confirmed tx
     */
    const updateFromTx = async (tx: any) => {
        let tokenItf = new ethers.utils.Interface(["event Transfer(address indexed from, address indexed to, uint256 value)", "event Approval(address indexed owner, address indexed spender, uint256 value)"]);
        // Transfer events
        let events = tx.events.filter((event: any) => event.topics[0] == tokenItf.getEventTopic("Transfer"));
        // Decode events
        let decodedEvents = events.map((event: any) => {return {token: event.address.toLowerCase(), args: tokenItf.decodeEventLog("Transfer", event.data, event.topics)}});
        console.log("transfers", decodedEvents);
        const newBalances = {...walletBalances};
        for(let i in decodedEvents){
            let isOut = decodedEvents[i].args[0].toLowerCase() == address?.toLowerCase();
            let isIn = decodedEvents[i].args[1].toLowerCase() == address?.toLowerCase();
            if(isIn || isOut){
                console.log("Updating balance from", newBalances[decodedEvents[i].token], isOut ? '-' : '+', decodedEvents[i].args[2].toString());
                newBalances[decodedEvents[i].token] = Big(walletBalances[decodedEvents[i].token] ?? 0)[isOut ? 'minus' : 'add'](decodedEvents[i].args[2].toString()).toFixed(0);
                if(Big(newBalances[decodedEvents[i].token]).lt(0)) newBalances[decodedEvents[i].token] = "0";
            }
        }
        // Wrap and Unwrap Events from WETH
        let wethItf = new ethers.utils.Interface(getABI("WETH9", chain?.id!));
        events = tx.events.filter((event: any) => event.topics[0] == wethItf.getEventTopic("Deposit"));
        let depositEvents = events.map((event: any) => (event.address.toLowerCase() == WETH_ADDRESS(chain?.id!)) && {token: event.address.toLowerCase(), args: wethItf.decodeEventLog("Deposit", event.data, event.topics)});
        events = tx.events.filter((event: any) => event.topics[0] == wethItf.getEventTopic("Withdrawal"));
        let withdrawalEvents = events.map((event: any) => (event.address.toLowerCase() == WETH_ADDRESS(chain?.id!)) && {token: event.address.toLowerCase(), args: wethItf.decodeEventLog("Withdrawal", event.data, event.topics)});
        for(let i in depositEvents){
            if(depositEvents[i] && depositEvents[i].args[0].toLowerCase() == address?.toLowerCase()){
                newBalances[ADDRESS_ZERO] = Big(walletBalances[ADDRESS_ZERO] ?? 0).sub(depositEvents[i].args[1].toString()).toFixed(0);
                newBalances[WETH_ADDRESS(chain?.id!)] = Big(walletBalances[WETH_ADDRESS(chain?.id!)] ?? 0).add(depositEvents[i].args[1].toString()).toFixed(0);
            }
        }
        for(let i in withdrawalEvents){
            if(withdrawalEvents[i] && withdrawalEvents[i].args[0].toLowerCase() == address?.toLowerCase()){
                newBalances[ADDRESS_ZERO] = Big(walletBalances[ADDRESS_ZERO] ?? 0).add(withdrawalEvents[i].args[1].toString()).toFixed(0);
                newBalances[WETH_ADDRESS(chain?.id!)] = Big(walletBalances[WETH_ADDRESS(chain?.id!)] ?? 0).sub(withdrawalEvents[i].args[1].toString()).toFixed(0);
            }
        }
        setWalletBalances(newBalances);
        // Approve events
        events = tx.events.filter((event: any) => event.topics[0] == tokenItf.getEventTopic("Approval"));
        // Decode events
        decodedEvents = events.map((event: any) => {return {token: event.address.toLowerCase(), args: tokenItf.decodeEventLog("Approval", event.data, event.topics)}});
        let newAllowances = {...allowances};
        console.log("approvals", decodedEvents);
        for(let i in decodedEvents){
            if(decodedEvents[i].args[0].toLowerCase() == address?.toLowerCase()){
                if(!newAllowances[decodedEvents[i].token]) newAllowances[decodedEvents[i].token] = {};
                newAllowances[decodedEvents[i].token][decodedEvents[i].args[1].toLowerCase()] = decodedEvents[i].args[2].toString();
            }
        }
        // // BorrowAllowanceDelegated events
        // const vTokenItf = new ethers.utils.Interface(getABI("VToken", chain?.id ?? defaultChain.id));
        // events = tx.events.filter((event: any) => event.topics[0] == vTokenItf.getEventTopic("BorrowAllowanceDelegated"));
        // // Decode events
        // decodedEvents = events.map((event: any) => {return {token: event.address.toLowerCase(), args: vTokenItf.decodeEventLog("BorrowAllowanceDelegated", event.data, event.topics)}});
        // for(let i in decodedEvents){
        //     if(!newAllowances[decodedEvents[i].args[2].toLowerCase()]) newAllowances[decodedEvents[i].args[2].toLowerCase()] = {};
        //     newAllowances[decodedEvents[i].token.toLowerCase()][decodedEvents[i].args[1].toLowerCase()] = decodedEvents[i].args[3].toString();
        // }
        setAllowances(newAllowances);
        fetchBalances(address);
    }

    const updateETHBalance = async (_walletBalances = walletBalances) => {
        if(!address) return;
        let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
        const balance = (await provider.getBalance(address)).toString();
        setWalletBalances({..._walletBalances, [ADDRESS_ZERO]: balance});
    }

    const updateBalance = async (asset: string, value: string, isMinus: boolean = false) => {
        const newBalances = {...walletBalances};
        if (isMinus) {
            newBalances[asset] = Big(walletBalances[asset] ?? 0).minus(value).toFixed(0);
        } else {
            newBalances[asset] = Big(walletBalances[asset] ?? 0).plus(value).toFixed(0);
        }
        setWalletBalances(newBalances);
    }

    const setBalance = async (asset: string, value: string) => {
        const newBalances = {...walletBalances};
        newBalances[asset] = value;
        setWalletBalances(newBalances);
    }

    const addAllowance = async (asset: string, spender: string, value: string) => {
        const newAllowances = {...allowances};
        // add allowance value
        if(!newAllowances[asset]) newAllowances[asset] = {};
        newAllowances[asset][spender] = Big(allowances[asset][spender] ?? 0).plus(value).toString();
        setAllowances(newAllowances);
    }

    const addNonce = async (asset: string, value: string) => {
        const newNonces = {...nonces};
        // add nonce value
        newNonces[asset] = Big(nonces[asset]).plus(value).toString();
        setNonces(newNonces);
    }

    const value: BalanceValue = {
		walletBalances,
        allowances,
        nonces,
        status,
        updateBalance,
        addAllowance,
        addNonce,
        tokens,
        updateFromTx,
        setBalance
	};

	return (
		<BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
	);
}

const useBalanceData = () => {
    const context = React.useContext(BalanceContext);
    if (context === undefined) {
        throw new Error("useBalanceData must be used within a BalanceProvider");
    }
    return context;
}


export { BalanceContextProvider, BalanceContext, useBalanceData };
