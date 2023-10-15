import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { getABI, getAddress, getContract } from "../../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { ADDRESS_ZERO, PYTH_ENDPOINT, REPLACED_FEEDS, WETH_ADDRESS, defaultChain } from "../../src/const";
import { useAppData } from "./AppDataProvider";
import { Status, SubStatus } from "../utils/status";
import axios from 'axios';
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

const PriceContext = React.createContext<PriceValue>({} as PriceValue);

interface PriceValue {
    prices: any;
    status: Status;
}

function PriceContextProvider({ children }: any) {
    const [status, setStatus] = React.useState<Status>(Status.NOT_FETCHING);
	const [prices, setPrices] = React.useState<any>({});
    const [refresh, setRefresh] = React.useState(0);

	const { chain } = useNetwork();

    // const { markets: selectedLendingMarket, pools: lendingPools } = useLendingData();
    const { markets: selectedLendingMarket, pools: lendingPools } = {markets: [] as any, pools: [] as any};
    const { pools } = useAppData();
    const { address } = useAccount();

    React.useEffect(() => {
        if(status == Status.NOT_FETCHING && pools.length > 0) {
            if(pools[0].synths[0].feed){
                updatePrices();
            }
        }
    }, [selectedLendingMarket, pools, address, status]);

	const updatePrices = async () => {
        setStatus(Status.FETCHING);
        console.log("Fetching prices");
        const chainId = defaultChain.id;
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
        let reqs: any[] = [];
        const pythFeeds: any[] = [];
        let _feedToAsset: any = {};
        const _prices = {...prices};
        
        for (let i = 0; i < pools.length; i++) {
            const priceOracle = new ethers.Contract(pools[i].oracle, getABI("PriceOracle", chainId), helper.provider);
            for(let j in pools[i].collaterals) {
                let collateral = pools[i].collaterals[j];
                if(collateral.feed == ethers.constants.HashZero.toLowerCase() || collateral.feed.startsWith('0x0000000000000000000000')){
                    reqs.push([
                        pools[i].oracle,
                        priceOracle.interface.encodeFunctionData("getAssetPrice", [pools[i].collaterals[j].token.id])
                    ])
                } else {
                    if(REPLACED_FEEDS[collateral.feed]) collateral.feed = REPLACED_FEEDS[collateral.feed];
                    pythFeeds.push(collateral.feed);
                    if(!_feedToAsset[collateral.feed]) _feedToAsset[collateral.feed] = [];
                    _feedToAsset[collateral.feed].push(collateral.token.id);
                }
            }
            for(let j in pools[i].synths) {
                const synth = pools[i].synths[j];
                if(synth.feed == ethers.constants.HashZero.toLowerCase() || synth.feed.startsWith('0x0000000000000000000000')){
                    reqs.push([
                        pools[i].oracle,
                        priceOracle.interface.encodeFunctionData("getAssetPrice", [synth.token.id])
                    ])
                } else {
                    if(REPLACED_FEEDS[synth.feed]) synth.feed = REPLACED_FEEDS[synth.feed];
                    pythFeeds.push(synth.feed);
                    if(!_feedToAsset[synth.feed]) _feedToAsset[synth.feed] = [];
                    _feedToAsset[synth.feed].push(synth.token.id);
                }
            }
        }
        // for(let j = 0; j< lendingPools.length; j++){
        //     let markets = lendingPools[j];
        //     for(let i = 0; i < markets.length; i++) {
        //         const market = markets[i];
        //         const priceOracle = new ethers.Contract(market.protocol._priceOracle, getABI("PriceOracle", chainId), helper.provider);
        //         if(market.feed == ethers.constants.HashZero.toLowerCase() || market.feed.startsWith('0x0000000000000000000000')){
        //             reqs.push([
        //                 market.protocol._priceOracle,
        //                 priceOracle.interface.encodeFunctionData("getAssetPrice", [market.inputToken.id])
        //             ])
        //         } else {
        //             if(REPLACED_FEEDS[market.feed]) market.feed = REPLACED_FEEDS[market.feed];
        //             pythFeeds.push(market.feed);
        //             if(!_feedToAsset[market.feed]) _feedToAsset[market.feed] = []
        //             _feedToAsset[market.feed].push(market.inputToken.id);
        //         }
        //     }
        // }

        const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
        const allReqs = [helper.callStatic.aggregate(reqs)];
        if(pythFeeds.length > 0) {
            allReqs.push(
                pythPriceService.getLatestPriceFeeds(pythFeeds)
            );
        }

        Promise.all(allReqs).then(async ([res, pythRes]: any) => {
            let pythIndex = 0;
            let reqCount = 0;
            for(let i = 0; i < pools.length; i++) {
                for(let j in pools[i].collaterals) {
                    if(pools[i].collaterals[j].feed == ethers.constants.HashZero.toLowerCase() || pools[i].collaterals[j].feed.startsWith('0x0000000000000000000000')){
                        // update price from feed
                        _prices[pools[i].collaterals[j].token.id] = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
                        reqCount += 1;
                    } else {
                        // update price from pyth feed
                        _prices[pools[i].collaterals[j].token.id] = Big(pythRes[pythIndex].price.price).mul(10**pythRes[pythIndex].price.expo).toString();
                        pythIndex += 1;
                    }
                }
                
                for(let j in pools[i].synths) {
                    if(pools[i].synths[j].feed == ethers.constants.HashZero.toLowerCase() || pools[i].synths[j].feed.startsWith('0x0000000000000000000000')){
                        // update price from feed
                        _prices[pools[i].synths[j].token.id] = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
                        reqCount += 1;
                    } else {
                        // update price from pyth feed
                        _prices[pools[i].synths[j].token.id] = Big(pythRes[pythIndex].price.price).mul(10**pythRes[pythIndex].price.expo).toString();
                        pythIndex += 1;
                    }
                }
            }
            // for(let j = 0; j< lendingPools.length; j++){
            //     let markets = lendingPools[j];
            //     for(let i = 0; i < markets.length; i++) {
            //         const market = markets[i];
            //         if(market.feed == ethers.constants.HashZero.toLowerCase() || market.feed.startsWith('0x0000000000000000000000')){
            //             _prices[market.inputToken.id] = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
            //             reqCount += 1;
            //         } else {
            //             // update price from pyth feed
            //             _prices[market.inputToken.id] = Big(pythRes[pythIndex].price.price).mul(10**pythRes[pythIndex].price.expo).toString();
            //             pythIndex += 1;
            //         }
            //     }
            // }
            if(pythFeeds.length > 0) {
                await pythPriceService.subscribePriceFeedUpdates(pythFeeds, (feed: any) => updatePythPrices(feed, _feedToAsset, _prices))
            }
            setStatus(Status.SUCCESS);
            _prices[ADDRESS_ZERO] = _prices[WETH_ADDRESS(chainId)];
            setPrices(_prices);
        })
        .catch((err: any) => {
            // console.log("Error fetching prices", err);
            // Try again
            setTimeout(() => {
                updatePrices();
            }, 10000)
        })
    }
    
    const updatePythPrices = (res: any, feedToAsset: any, _prices: any) => {
        for (let i in feedToAsset["0x"+res.id]){
            _prices[feedToAsset["0x"+res.id][i]] = Big(res.price.price).mul(10**res.price.expo).toString();
            if(feedToAsset["0x"+res.id][i] == WETH_ADDRESS(defaultChain.id)){
                _prices[ADDRESS_ZERO] = _prices[WETH_ADDRESS(defaultChain.id)];
            }
        }
        setPrices(_prices);
        setRefresh(Math.random());
    }

    const value: PriceValue = {
		prices,
        status
	};
    

	return (
		<PriceContext.Provider value={value}>{children}</PriceContext.Provider>
	);
}


const usePriceData = () => {
    const context = React.useContext(PriceContext);
    if (context === undefined) {
        throw new Error("usePriceData must be used within a PriceProvider");
    }
    return context;
};

export { PriceContextProvider, PriceContext, usePriceData };