import React from 'react'
import TradingViewWidget from './TradingViewWidget'
import { useRouter } from 'next/router';
import { useLendingData } from '../context/LendingDataProvider';
import { Heading } from '@chakra-ui/react';
import { PERP_CATEGORIES } from '../../src/const';

export default function Perps({category}: any) {
    const router = useRouter();
    const { asset } = router.query;
    const { markets } = useLendingData();
    
    if(!PERP_CATEGORIES[category]) router.push(`/perps/${Object.keys(PERP_CATEGORIES)[0]}`)

    const categoryMarkets = markets.filter((market: any) => market.eModeCategory?.id == category);
    if(categoryMarkets.length == 0) return <></> 
    if(!asset) {
        router.push(`/perps/${category}?asset=${categoryMarkets[0].inputToken.symbol}`);
        return <></>
    }

    // remove lowercase chars from asset
    let parsedAsset = (asset as string).replace(/[^A-Z]/g, '');

    return (
        <>
            {asset && <TradingViewWidget asset={parsedAsset}/>}
        </>
    )
}
