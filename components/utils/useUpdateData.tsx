import React, { useContext } from 'react'
import { AppDataContext } from '../context/AppDataProvider';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { PYTH_ENDPOINT } from '../../src/const';
import { ethers } from 'ethers';

export default function useUpdateData() {
    const {
		pools,
		tradingPool
	} = useContext(AppDataContext);
    
    const getUpdateData = async () => {
        const pythFeeds = pools[tradingPool].collaterals.concat(pools[tradingPool].synths).filter((c: any) => c.feed.slice(0, 12) != ethers.constants.HashZero.slice(0, 12)).map((c: any) => c.feed);
        // remove duplicates
        let uniquePythFeeds: any[] = [];
        for (let i = 0; i < pythFeeds.length; i++) {
            if (!uniquePythFeeds.includes(pythFeeds[i])) {
                uniquePythFeeds.push(pythFeeds[i]);
            }
        }

        const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
        const priceFeedUpdateData = uniquePythFeeds.length > 0 ? await pythPriceService.getPriceFeedsUpdateData(uniquePythFeeds) : [];

        return priceFeedUpdateData;
    }

    return {
        getUpdateData
    }
}
