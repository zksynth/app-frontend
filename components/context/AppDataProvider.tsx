import * as React from "react";
import axios from "axios";
import { getContract, call, getAddress, getABI } from "../../src/contract";
import { ADDRESS_ZERO, dollarFormatter, Endpoints, ETH_ADDRESS, query, tokenFormatter, query_leaderboard, query_referrals } from '../../src/const';
import { ChainID, chainMapping } from "../../src/chains";
import { BigNumber, ethers } from "ethers";
import { useEffect } from 'react';
const { Big } = require("big.js");

interface AppDataValue {
	status: "not-fetching" | "fetching" | "ready" | "error";
	message: string;
	pools: any[];
	fetchData: (
		_address: string | null,
		chainId: number
	) => Promise<number>;
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
	updatePoolBalance: (poolAddress: string, value: string, amountUSD: string, minus: boolean) => void;
	refreshData: () => void;
	leaderboard: any[];
	account: any,
	setRefresh: (_: number) => void;
	refresh: number;
	lastRefresh: number;
	setLastRefresh: (_: number) => void;
	referrals: any[];
}

// pool.userDebt
// pool.userCollateral
// pool.adjustedCollateral

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>("not-fetching");
	const [message, setMessage] = React.useState<AppDataValue['message']>("");

	const [account, setAccount] = React.useState<any|null>(null);

	const [pools, setPools] = React.useState<any[]>([]);
	const [tradingPool, setTradingPool] = React.useState(0);
	const [leaderboard, setLeaderboard] = React.useState([]);

	useEffect(() => {
		if(localStorage){
			const _tradingPool = localStorage.getItem("tradingPool");
			if(_tradingPool){
				setTradingPool(parseInt(_tradingPool));
			}
		}
	}, [tradingPool])

	const [chain, setChain] = React.useState(ChainID.ARB_GOERLI);

	const [lastRefresh, setLastRefresh] = React.useState<number>(0);
	const [refresh, setRefresh] = React.useState<number>(0);
	const [block, setBlock] = React.useState(0);
	const [random, setRandom] = React.useState(0);

	const [referrals, setReferrals] = React.useState<any[]>([]);

	useEffect(() => {
		if (refresh == 0 && pools.length > 0) {
			// set new interval
			const timer = setInterval(refreshData, 5000);
			setRefresh(Number(timer.toString()));
			setRandom(Math.random());
		}
	}, [refresh, pools]);

	const fetchData = (_address: string | null, chainId: number): Promise<number> => {
		console.log("fetching");
		return new Promise((resolve, reject) => {
			setStatus("fetching");
			Promise.all([
				axios.post(Endpoints[chainId], {
					query: query(_address?.toLowerCase() ?? ADDRESS_ZERO),
					variables: {},
				}), 
				axios.post(Endpoints[chainId], {
					query: query_leaderboard,
					variables: {},
				}),
				axios.post(Endpoints[chainId], {
					query: query_referrals(_address?.toLowerCase() ?? ADDRESS_ZERO),
					variables: {},
				})
			])
				.then(async (res) => {
					if (res[0].data.errors || res[1].data.errors || res[2].data.errors) {
						setStatus("error");
						setMessage("Network Error. Please refresh the page or try again later.");
						reject(res[0].data.errors || res[1].data.errors || res[2].data.errors);
					} else {
						const userPoolData = res[0].data.data;
						const leaderboardData = res[1].data.data.accounts;
						const _refs = res[2].data.data.accounts;
						console.log("referrals", _refs);
						setReferrals(_refs);
						setLeaderboard(leaderboardData);
						const pools = userPoolData.pools;
						if (_address) {
							_setPools(pools, userPoolData.accounts[0], _address, chainId)
							.then((_) => {
								resolve(0)
							})
						} else {
							setPools(pools);
							setStatus("ready");
							resolve(0);
						}
					}
				})
				.catch((err) => {
					setStatus("error");
					setMessage(
						"Failed to fetch data. Please refresh the page or try again later."
					);
					reject(err);
				});
		});
	};

	const _setPools = (
		_pools: any[],
		_account: any,
		_address: string,
		_chain: number
	): Promise<number> => {
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
				for(let j = 0; j < _pools[i].poolDayData.length; j++) {
					averageDailyBurn = averageDailyBurn.plus(_pools[i].poolDayData[j].dailyBurnUSD);
					averageDailyRevenue = averageDailyRevenue.plus(_pools[i].poolDayData[j].dailyRevenueUSD);
				}
				_pools[i].averageDailyBurn = _pools[i].poolDayData.length > 0 ? averageDailyBurn.div(_pools[i].poolDayData.length).toString() : '0';
				_pools[i].averageDailyRevenue = _pools[i].poolDayData.length > 0 ? averageDailyRevenue.div(_pools[i].poolDayData.length).toString() : '0';
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
						setAccount(_account);
					}
				}

				for(let j = 0; j < _pools.length; j++){
					updateUserParams(_pools[j])
				}

				setStatus("ready");
				setPools(_pools);
				resolve(0);
			})
			.catch(err => {
				reject(err)
			})
		});
	};

	const updateUserParams = (_pool: any) => {
		let _totalCollateral = Big(0);
		let _adjustedCollateral = Big(0);
		let _totalDebt = Big(0);

		for (let i = 0; i < _pool.collaterals.length; i++) {
			_totalCollateral = _totalCollateral.plus(
				Big(_pool.collaterals[i].balance ?? 0)
					.div(10 ** _pool.collaterals[i].token.decimals)
					.mul(_pool.collaterals[i].priceUSD)
			);
			_adjustedCollateral = _adjustedCollateral.plus(
				Big(_pool.collaterals[i].balance ?? 0)
					.div(10 ** _pool.collaterals[i].token.decimals)
					.mul(_pool.collaterals[i].priceUSD)
					.mul(_pool.collaterals[i].baseLTV)
					.div(10000)
			);
		}

		if(Big(_pool.totalSupply).gt(0)) _totalDebt = Big(_pool.balance ?? 0).div(_pool.totalSupply).mul(_pool.totalDebtUSD);

		_pool.adjustedCollateral = (_adjustedCollateral.toNumber());
		_pool.userCollateral = (_totalCollateral.toNumber());
		_pool.userDebt = (_totalDebt.toNumber());
	}

	const updatePoolBalance = (poolAddress: string, value: string, amountUSD: string, isMinus: boolean = false) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress) {
				// update pool params
				_pools[i].balance = Big(_pools[i].balance ?? 0)[isMinus?'minus' : 'add'](value).toString();
				_pools[i].totalSupply = Big(_pools[i].totalSupply ?? 0)[isMinus?'minus' : 'add'](value).toString();
				_pools[i].totalDebtUSD = Big(_pools[i].totalDebtUSD ?? 0)[isMinus?'minus' : 'add'](amountUSD).toString();
				// update total debt
				_pools[i].totalDebt = Big(_pools[i].totalDebt ?? 0)[isMinus?'minus' : 'add'](amountUSD).toNumber();

				setPools(_pools);
				return;
			}
		}
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
						_pools[i].userAdjustedCollateral = Big(_pools[i].userAdjustedCollateral ?? 0)[isMinus?'minus':'add'](Big(value).div(10**_pools[i].collaterals[j].token.decimals).mul(_pools[i].collaterals[j].priceUSD).mul(_pools[i].collaterals[j].baseLTV).div(10000)).toNumber();
						_pools[i].userCollateral = Big(_pools[i].userCollateral ?? 0)[isMinus?'minus':'add'](Big(value).div(10**_pools[i].collaterals[j].token.decimals).mul(_pools[i].collaterals[j].priceUSD)).toNumber();
					}
				}
			}
		}
		setPools(_pools);
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
						_pools[i].collaterals[j].allowance ?? 0
					).plus(value).toString();
				}
			}
		}
		setPools(_pools);
		setRandom(Math.random());
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
	};

	const refreshData = async () => {
		if(!account?.id) return;
		console.log("Refreshing data", account?.id);
		const reqs: any[] = [];
		const _pools = pools;
		if(_pools.length == 0) {
			console.log("No pools found", _pools);
			return
		}
		const provider = new ethers.providers.Web3Provider(
			(window as any).ethereum!,
			"any"
		);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chain),
			getABI("Multicall2"),
			provider.getSigner()
		);
		const pool = new ethers.Contract(_pools[0].id, getABI("Pool"), helper.provider);
		const priceOracle = new ethers.Contract(_pools[0].oracle, getABI("PriceOracle"), helper.provider);
		for(let i in pools) {
			reqs.push([
				_pools[i].oracle,
				priceOracle.interface.encodeFunctionData("getAssetsPrices", 
					[pools[i].collaterals.map((c: any) => c.token.id).concat(pools[i].synths.map((s: any) => s.token.id))]
				)
			]);
			reqs.push([
				_pools[i].id,
				pool.interface.encodeFunctionData("getTotalDebtUSD", [])
			]);
			reqs.push([
				_pools[i].id,
				pool.interface.encodeFunctionData("totalSupply", [])
			]);
			reqs.push([
				_pools[i].id,
				pool.interface.encodeFunctionData("balanceOf", [account.id])
			])
		}
		helper.callStatic.aggregate(reqs).then((res: any) => {
			if(res.returnData.length > 0){
				let reqCount = 3;
				if(account?.id) reqCount = 4;
				for(let i = 0; i < _pools.length; i++) {
					const _prices = priceOracle.interface.decodeFunctionResult("getAssetsPrices", res.returnData[i*reqCount])[0];
					for(let j in _pools[i].collaterals) {
						_pools[i].collaterals[j].priceUSD = Big(_prices[j].toString()).div(1e8).toString();
					}
					for(let j in _pools[i].synths) {
						_pools[i].synths[j].priceUSD = Big(_prices[Number(j)+_pools[i].collaterals.length].toString()).div(1e8).toString();
					}
					_pools[i].totalDebtUSD = Big(pool.interface.decodeFunctionResult("getTotalDebtUSD", res.returnData[i*reqCount+1])[0].toString()).div(1e18).toString();
					_pools[i].totalSupply = pool.interface.decodeFunctionResult("totalSupply", res.returnData[i*reqCount+2])[0].toString();
					_pools[i].balance = pool.interface.decodeFunctionResult("balanceOf", res.returnData[i*reqCount+3])[0].toString();
					updateUserParams(_pools[i]);
				}
				setPools(_pools);
				setRandom(Math.random());
			} else {
				console.log("No return data");
			}
		})
		.catch(err => {
			console.log("Failed multicall", err);
		})
	}

	const value: AppDataValue = {
		account,
		leaderboard,
		status,
		message,
		pools,
		tradingPool,
		setTradingPool,
		updatePoolBalance,
		fetchData,
		updateSynthWalletBalance,
		updateCollateralWalletBalance,
		updateCollateralAmount,
		chain,
		setChain,
		addCollateralAllowance,
		block,
		refreshData,
		setRefresh,
		refresh,
		lastRefresh,
		setLastRefresh,
		referrals,
	};

	return (
		<AppDataContext.Provider value={value}>
			{children}
		</AppDataContext.Provider>
	);
}

export { AppDataProvider, AppDataContext };
