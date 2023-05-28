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
        const pythFeeds = pools[tradingPool].collaterals.concat(pools[tradingPool].synths).filter((c: any) => c.feed.slice(0, 20) != ethers.constants.HashZero.slice(0, 20)).map((c: any) => c.feed);
        const pythPriceService = new EvmPriceServiceConnection(PYTH_ENDPOINT);
        const priceFeedUpdateData = pythFeeds.length > 0 ? await pythPriceService.getPriceFeedsUpdateData(pythFeeds) : [];

        return priceFeedUpdateData;
    }

    return {
        getUpdateData
    }
}
