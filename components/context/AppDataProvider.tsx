import * as React from "react";
import axios from "axios";
import { getContract, call, getAddress, getABI } from "../../src/contract";
import { ADDRESS_ZERO, dollarFormatter, Endpoints, ETH_ADDRESS, tokenFormatter } from "../../src/const";
import { ChainID, chainMapping } from "../../src/chains";
import { BigNumber, ethers } from "ethers";
import { useEffect } from 'react';
const { Big } = require("big.js");

interface AppDataValue {
	status: "not-fetching" | "fetching" | "ready" | "error";
	message: string;
	totalCollateral: number;
	totalDebt: number;
	adjustedCollateral: number;

	pools: any[];
	fetchData: (
		_address: string | null,
		chainId: number
	) => Promise<unknown> | undefined;
	tradingPool: number;
	setTradingPool: (_: number, pools?: any[]) => void;
	
	updateCollateralWalletBalance: (
		collateralAddress: string,
		poolAddress: string,
		value: string,
		minus: boolean
	) => void;
	updateCollateralAmount: (collateralAddress: string, poolAddress: string, amount: string, minus: boolean) => void;
	updateSynthWalletBalance: (synthAddress: string, poolAddress: string, amount: string, minus: boolean) => void;
	chain: number;
	setChain: (_: number) => void;
	addCollateralAllowance(collateralAddress: string, value: string): void;
	block: number;
	updatePoolBalance: (poolAddress: string, value: string, minus: boolean) => void;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>("not-fetching");
	const [message, setMessage] = React.useState<AppDataValue['message']>("");

	const [totalCollateral, setTotalCollateral] = React.useState(0);
	const [adjustedCollateral, setAdjustedCollateral] = React.useState(0);
	const [totalDebt, setTotalDebt] = React.useState(0);

	const [pools, setPools] = React.useState<any[]>([]);
	const [tradingPool, setTradingPool] = React.useState(0);

	useEffect(() => {
		if(localStorage){
			const _tradingPool = localStorage.getItem("tradingPool");
			if(_tradingPool){
				setTradingPool(parseInt(_tradingPool));
			}
		}
	}, [])

	const [chain, setChain] = React.useState(ChainID.ARB_GOERLI);

	const [refresh, setRefresh] = React.useState(0);
	const [block, setBlock] = React.useState(0);


	const fetchData = (_address: string | null, chainId: number) => {
		return new Promise((resolve, reject) => {
			setStatus("fetching");
			axios
				.post(Endpoints[chainId], {
					query: `
					{
						pools {
						  id
						  name
						  symbol
						  totalSupply
						  totalDebtUSD
						  rewardTokens {
							id
						  }
						  dayDatas(first:7, orderBy: dayId, orderDirection: desc){
							dailyDebtIssuedUSD
							dailyDebtBurnedUSD
							dailyRevenueUSD
							dailyBurnUSD
						  }
						  rewardSpeeds
						  synths {
							token {
							  id
							  name
							  symbol
							  decimals
							}
							priceUSD
							mintFee
							burnFee
							totalSupply
							dayDatas(first:1, orderBy: dayId, orderDirection: desc){
								dailyMinted
								dailyBurned
							}
						  }
						  collaterals {
							token {
							  id
							  name
							  symbol
							  decimals
							}
							priceUSD
							cap
							baseLTV
							liqThreshold
							liqBonus
							totalDeposits
						  }
						}
						accounts(where: {id: "${_address?.toLowerCase() ?? ADDRESS_ZERO}"}){
						  id
						  positions{
							pool{
							  id
							}
							balance
							collateralBalances{
							  balance
							  collateral{
								token{
									id
								}
							  }
							}
						  }
						}
					  }`,
					variables: {},
				})
				.then(async (res) => {
					if (res.data.errors) {
						setStatus("error");
						setMessage("Failed to fetch data. Please refresh the page or try again later.");
						reject(res.data.errors);
						return;
					}
					console.log(res.data.data);
					const pools = res.data.data.pools;
					if (_address) {
						_setPools(pools, res.data.data.accounts[0], _address, chainId);
					} else {
						setPools(pools);
					}
				})
				.catch((err) => {
					setStatus("error");
					setMessage(
						"Failed to fetch data. Please refresh the page or try again later."
					);
					reject(err);
					return;
				});
		});
	};

	const _setPools = (
		_pools: any[],
		_account: any,
		_address: string,
		_chain: number
	) => {
		const provider = new ethers.providers.Web3Provider(
			(window as any).ethereum!,
			"any"
		);
		const helper = new ethers.Contract(
			getAddress("Multicall2", _chain),
			getABI("Multicall2"),
			provider.getSigner()
		);
		return new Promise((resolve, reject) => {
			let calls: any[] = [];
			const itf = new ethers.utils.Interface(getABI("MockToken"));

			for (let i = 0; i < _pools.length; i++) {
				for(let j = 0; j < _pools[i].collaterals.length; j++) {
					const collateral = _pools[i].collaterals[j];
					if(collateral.token.id == ETH_ADDRESS.toLowerCase()) {
						calls.push([
							helper.address,
							helper.interface.encodeFunctionData("getEthBalance", [
								_address,
							]),
						]);
						calls.push([
							helper.address,
							helper.interface.encodeFunctionData("getEthBalance", [
								_address,
							]),
						]);
					} else {
						calls.push([
							collateral.token.id,
							itf.encodeFunctionData("balanceOf", [_address]),
						]);
						calls.push([
							collateral.token.id,
							itf.encodeFunctionData("allowance", [
								_address,
								_pools[i].id,
							]),
						]);
					}
				}
				for(let j = 0; j < _pools[i].synths.length; j++) {
					const synth = _pools[i].synths[j];
					calls.push([
						synth.token.id,
						itf.encodeFunctionData("balanceOf", [_address]),
					]);
				}

				let averageDailyBurn = Big(0);
				let averageDailyRevenue = Big(0);
				for(let j = 0; j < _pools[i].dayDatas.length; j++) {
					averageDailyBurn = averageDailyBurn.plus(_pools[i].dayDatas[j].dailyBurnUSD);
					averageDailyRevenue = averageDailyRevenue.plus(_pools[i].dayDatas[j].dailyRevenueUSD);
				}
				_pools[i].averageDailyBurn = _pools[i].dayDatas.length > 0 ? averageDailyBurn.div(_pools[i].dayDatas.length).toString() : '0';
				_pools[i].averageDailyRevenue = _pools[i].dayDatas.length > 0 ? averageDailyRevenue.div(_pools[i].dayDatas.length).toString() : '0';
			}


			helper.callStatic.aggregate(calls).then(async (res: any) => {
				setBlock(parseInt(res[0].toString()));
				let index = 0;
				// setting wallet balance and allowance
				for (let i = 0; i < _pools.length; i++) {
					for(let j = 0; j < _pools[i].collaterals.length; j++) {
						_pools[i].collaterals[j].walletBalance = BigNumber.from(
							res.returnData[index]
						).toString();
						index++;
						_pools[i].collaterals[j].allowance = BigNumber.from(
							res.returnData[index]
						).toString();
						index++;
					}
					for(let j = 0; j < _pools[i].synths.length; j++) {
						_pools[i].synths[j].walletBalance = BigNumber.from(
							res.returnData[index]
						).toString();
						index++;
					}
				}
				// setting total collateral, adjusted collateral and total debt
				
				if(_account){
					for(let i = 0; i < _account.positions.length; i++){
						let pos = _account.positions[i];
						let poolId = pos.pool.id;
						for(let j = 0; j < _pools.length; j++){
							if(_pools[j].id == poolId){
								_pools[j].balance = pos.balance;
								// finding collateral
								for(let k = 0; k < pos.collateralBalances.length; k++){
									for(let l = 0; l < _pools[j].collaterals.length; l++){
										if(pos.collateralBalances[k].collateral.token.id == _pools[j].collaterals[l].token.id){
											_pools[j].collaterals[l].balance = pos.collateralBalances[k].balance;
										}
									}
								}
							}
						}
					}
				}
				_setTradingPool(tradingPool, _pools);
				setPools(_pools);
			});
		});
	};

	const _setTradingPool = (poolIndex: number, _pools: any[] = pools) => {
		localStorage.setItem("tradingPool", poolIndex.toString());
		setTradingPool(poolIndex);
		let _totalCollateral = Big(0);
		let _adjustedCollateral = Big(0);
		let _totalDebt = Big(0);

		for (let i = 0; i < _pools[poolIndex].collaterals.length; i++) {
			_totalCollateral = _totalCollateral.plus(
				Big(_pools[poolIndex].collaterals[i].balance ?? 0)
					.div(10 ** _pools[poolIndex].collaterals[i].token.decimals)
					.mul(_pools[poolIndex].collaterals[i].priceUSD)
			);
			_adjustedCollateral = _adjustedCollateral.plus(
				Big(_pools[poolIndex].collaterals[i].balance ?? 0)
					.div(10 ** _pools[poolIndex].collaterals[i].token.decimals)
					.mul(_pools[poolIndex].collaterals[i].priceUSD)
					.mul(_pools[poolIndex].collaterals[i].baseLTV)
					.div(10000)
			);
		}

		if(Big(_pools[poolIndex].totalSupply).gt(0)) _totalDebt = Big(_pools[poolIndex].balance ?? 0).div(_pools[poolIndex].totalSupply).mul(_pools[poolIndex].totalDebtUSD);

		setAdjustedCollateral(_adjustedCollateral.toNumber());
		setTotalCollateral(_totalCollateral.toNumber());
		setTotalDebt(_totalDebt.toNumber());
	}

	const updatePoolBalance = (poolAddress: string, value: string, isMinus: boolean = false) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress) {
				_pools[i].balance = Big(_pools[i].balance ?? 0)[isMinus?'minus' : 'add'](value).toString();
				_pools[i].totalSupply = Big(_pools[i].totalSupply ?? 0)[isMinus?'minus' : 'add'](value).toString();
				if(Big(_pools[i].totalSupply).gt(0)) setTotalDebt(Big(_pools[i].balance ?? 0).div(_pools[i].totalSupply).mul(_pools[i].totalDebtUSD));
			}
		}
		setPools(_pools);
		setRefresh(Math.random());
	};

	const updateCollateralWalletBalance = (
		collateralAddress: string,
		poolAddress: string,
		value: string,
		isMinus: boolean = false
	) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress) {
				for (let j in _pools[i].collaterals) {
					if (_pools[i].collaterals[j].token.id == collateralAddress) {
						_pools[i].collaterals[j].walletBalance = Big(_pools[i].collaterals[j].walletBalance ?? 0)[isMinus?'minus' : 'add'](value).toString();
					}
				}
			}
		}
		setPools(_pools);
		setRefresh(Math.random());
	};

	const updateCollateralAmount = (
		collateralAddress: string,
		poolAddress: string,
		value: string,
		isMinus: boolean = false
	) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress) {
				for (let j in _pools[i].collaterals) {
					if (_pools[i].collaterals[j].token.id == collateralAddress) {
						_pools[i].collaterals[j].balance = Big(_pools[i].collaterals[j].balance ?? 0)[isMinus?'minus':'add'](value).toString();
						setAdjustedCollateral(Big(adjustedCollateral)[isMinus?'minus':'add'](Big(value).div(10**_pools[i].collaterals[j].token.decimals).mul(_pools[i].collaterals[j].priceUSD).mul(_pools[i].collaterals[j].baseLTV).div(10000)));
						setTotalCollateral(Big(totalCollateral)[isMinus?'minus':'add'](Big(value).div(10**_pools[i].collaterals[j].token.decimals).mul(_pools[i].collaterals[j].priceUSD)));
					}
				}
			}
		}
		setPools(_pools);
		setRefresh(Math.random());
	};

	const addCollateralAllowance = (
		collateralAddress: string,
		value: string
	) => {
		let _pools = pools;
		for (let i in _pools) {
			for (let j in _pools[i].collaterals) {
				if (_pools[i].collaterals[j].token.id == collateralAddress) {
					_pools[i].collaterals[j].allowance = Big(
						_pools[i].collaterals[j].allowance
					).plus(value).toString();
				}
			}
		}
		setPools(_pools);
		setRefresh(Math.random());
	};

	const updateSynthWalletBalance = (
		synthAddress: string,
		poolAddress: string,
		amount: string,
		isMinus: boolean = false
	) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress) {
				for (let j in _pools[i].synths) {
					if (_pools[i].synths[j].token.id == synthAddress) {
						_pools[i].synths[j].walletBalance = (Big(_pools[i].synths[j].walletBalance ?? 0)[isMinus?'minus':'add'](amount)).toFixed();
					}
				}
			}
		}
		setPools(_pools);
		setRefresh(Math.random());
	};

	const value: AppDataValue = {
		status,
		message,
		totalCollateral,
		totalDebt,
		pools,
		tradingPool,
		setTradingPool: _setTradingPool,
		updatePoolBalance,
		fetchData,
		updateSynthWalletBalance,
		updateCollateralWalletBalance,
		updateCollateralAmount,
		chain,
		setChain,
		addCollateralAllowance,
		adjustedCollateral,
		block,
	};

	return (
		<AppDataContext.Provider value={value}>
			{children}
		</AppDataContext.Provider>
	);
}

export { AppDataProvider, AppDataContext };
