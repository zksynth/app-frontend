import React from "react";
import { useAppData } from "./AppDataProvider";
import { usePriceData } from "./PriceContext";
import Big from "big.js";
import { useBalanceData } from "./BalanceProvider";
import { ESYX_PRICE } from "../../src/const";

interface Position {
    collateral: string;
    debt: string;
    adjustedCollateral: string;
    availableToIssue: string;
    debtLimit: string;
    ltv: string;
    liqLtv: string;
}

interface SyntheticsPositionValue {
    poolDebt: () => string;
    position: (_tradingPool?: number) => Position;
}

const SyntheticsPositionContext = React.createContext<SyntheticsPositionValue>({} as SyntheticsPositionValue);

function SyntheticsPositionProvider({ children }: any) {
    const { pools, tradingPool } = useAppData();
    const { prices } = usePriceData();
    const { walletBalances } = useBalanceData();

    const poolDebt = () => {
        if(pools.length == 0) return "0.00";
        if(!prices) return "0.00";
        let res = Big(0);
        for(let i in pools[tradingPool].synths){
            res = res.plus(
                Big(pools[tradingPool].synths[i].totalSupply)
                .div(10**pools[tradingPool].synths[i].token.decimals)
                .mul(prices[pools[tradingPool].synths[i].token.id] ?? 0)
            );
        }
        return res.toString();
    }

    const position = (_tradingPool = tradingPool): Position => {
		let _totalCollateral = Big(0);
		let _adjustedCollateral = Big(0);
        let _liqCollateral = Big(0);
		let _totalDebt = Big(0);
        const _pool = pools[_tradingPool];
        if(!_pool) return {collateral: '0', debt: '0', adjustedCollateral: '0', availableToIssue: '0', debtLimit: '0', liqLtv: '0', ltv: '0'};
		for (let i = 0; i < _pool.collaterals.length; i++) {
			const usdValue = Big(_pool.collaterals[i].balance ?? 0)
            .div(10 ** _pool.collaterals[i].token.decimals)
            .mul(prices[_pool.collaterals[i].token.id] ?? 0);
            _totalCollateral = _totalCollateral.plus(usdValue);
			_adjustedCollateral = _adjustedCollateral.plus(usdValue.mul(_pool.collaterals[i].baseLTV).div(10000));
            // _liqCollateral = _liqCollateral.plus(usdValue.mul(_pool.collaterals[i].liquidationThreshold).div(10000));
		}
		if(Big(_pool.totalSupply).gt(0)) _totalDebt = Big(_pool.balance ?? 0).div(_pool.totalSupply).mul(poolDebt());

        let availableToIssue = '0'
        if(_adjustedCollateral.sub(_totalDebt).gt(0)){
            availableToIssue = _adjustedCollateral.sub(_totalDebt).toString();
        }

        let debtLimit = Big(0);
        if(_totalCollateral.gt(0)){
            debtLimit = _totalDebt.mul(100).div(_totalCollateral);
        }
        return {
            collateral: _totalCollateral.toString(),
            debt: _totalDebt.toString(),
            adjustedCollateral: _adjustedCollateral.toString(),
            availableToIssue,
            debtLimit: debtLimit.toString(),
            ltv: _totalCollateral.gt(0) ? _adjustedCollateral.div(_totalCollateral).mul(10000).toString() : 'Infinity',
            liqLtv: '9000'
        }
    }

    const rewardAPY = (market: any, side = "DEPOSIT", type = "VARIABLE") => {
		let index = market.rewardTokens.map((token: any) => token.id.split('-')[0] == side && token.id.split('-')[1] == type).indexOf(true);
		if(index == -1) return '0';
        let total = Number(side == "DEPOSIT" ? market.totalDepositBalanceUSD : market.totalBorrowBalanceUSD);
		if(total == 0) return '0';
		return Big(market.rewardTokenEmissionsAmount[index])
			.div(1e18)
			.mul(365 * ESYX_PRICE)
			.div(total)
			.mul(100)
			.toFixed(2);
	}

    return (
        <SyntheticsPositionContext.Provider value={{ poolDebt, position }}>
            {children}
        </SyntheticsPositionContext.Provider>
    );
}

export const useSyntheticsData = () => {
	return React.useContext(SyntheticsPositionContext);
}

export { SyntheticsPositionContext, SyntheticsPositionProvider };
