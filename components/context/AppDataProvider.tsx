import * as React from "react";
import axios from "axios";
import { getAddress, getABI } from "../../src/contract";
import { ADDRESS_ZERO, dollarFormatter, Endpoints, WETH_ADDRESS, query, tokenFormatter, query_leaderboard, query_referrals } from '../../src/const';
import { ChainID, chainMapping } from "../../src/chains";
import { BigNumber, ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
const { Big } = require("big.js");

interface AppDataValue {
	status: "not-fetching" | "fetching" | "ready" | "error";
	message: string;
	pools: any[];
	fetchData: (
		_address: string | null
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
	addCollateralAllowance(collateralAddress: string, poolAddress: string, value: string): void;
	block: number;
	updatePoolBalance: (poolAddress: string, value: string, amountUSD: string, minus: boolean) => void;
	refreshData: () => void;
	leaderboard: any[];
	account: any,
	setRefresh: (_: number[]) => void;
	refresh: number[];
	referrals: any[];
	incrementNonce: (collateral: string) => void;
}

// pool.userDebt
// pool.userCollateral
// pool.adjustedCollateral

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>("not-fetching");
	const [message, setMessage] = React.useState<AppDataValue['message']>("");
	const { chain } = useNetwork();
	const { isConnected, address } = useAccount();

	const [account, setAccount] = React.useState<any|null>(null);

	const [pools, setPools] = React.useState<any[]>([]);
	const [tradingPool, setTradingPool] = React.useState(1);
	const [leaderboard, setLeaderboard] = React.useState([]);

	useEffect(() => {
		if(localStorage){
			const _tradingPool = localStorage.getItem("tradingPool");
			if(_tradingPool){
				setTradingPool(parseInt(_tradingPool));
			}
		}
	}, [tradingPool])

	const [refresh, setRefresh] = React.useState<number[]>([]);
	const [block, setBlock] = React.useState(0);
	const [random, setRandom] = React.useState(0);

	const [referrals, setReferrals] = React.useState<any[]>([]);

	useEffect(() => {
		if (refresh.length == 0 && pools.length > 0 && isConnected && !chain?.unsupported) {
			// set new interval
			const timer = setInterval(refreshData, 5000);
			setRefresh([Number(timer.toString())]);
			setRandom(Math.random());
		}
	}, [refresh, pools, random]);

	const fetchData = (_address: string | null): Promise<number> => {
		console.log("fetching for chain", chain?.id!);
		return new Promise((resolve, reject) => {
			setStatus("fetching");
			const endpoint = Endpoints(chain?.id!)
			Promise.all([
				axios.post(endpoint, {
					query: query(_address?.toLowerCase() ?? ADDRESS_ZERO),
					variables: {},
				}), 
				axios.post(endpoint, {
					query: query_leaderboard,
					variables: {},
				}),
				axios.post(endpoint, {
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
						setReferrals(_refs);
						setLeaderboard(leaderboardData);
						const pools = userPoolData.pools;
						// sort pool.synths by liquidity in USD (totalsupply*price)
						for (let i = 0; i < pools.length; i++) {
							const pool = pools[i];
							pool.synths.sort((a: any, b: any) => {
								return (
									parseFloat(b.totalSupply) *
									parseFloat(b.priceUSD)
								) -
									(parseFloat(a.totalSupply) *
										parseFloat(a.priceUSD));
							});

							// average burn and revenue
							let averageDailyBurn = Big(0);
							let averageDailyRevenue = Big(0);
							for(let j = 0; j < pool.poolDayData.length; j++) {
								averageDailyBurn = averageDailyBurn.plus(pool.poolDayData[j].dailyBurnUSD);
								averageDailyRevenue = averageDailyRevenue.plus(pool.poolDayData[j].dailyRevenueUSD);
							}
							pool.averageDailyBurn = pool.poolDayData.length > 0 ? averageDailyBurn.div(pool.poolDayData.length).toString() : '0';
							pool.averageDailyRevenue = pool.poolDayData.length > 0 ? averageDailyRevenue.div(pool.poolDayData.length).toString() : '0';
							pools[i] = pool;
						}
						
						if (_address && !chain?.unsupported) {
							_setPools(pools, userPoolData.accounts[0], _address)
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
				});
		});
	};

	const _setPools = (
		_pools: any[],
		_account: any,
		_address: string
	): Promise<number> => {
		const provider = new ethers.providers.Web3Provider(
			(window as any).ethereum!,
			"any"
		);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chain?.id!),
			getABI("Multicall2", chain?.id!),
			provider.getSigner()
		);
		return new Promise((resolve, reject) => {
			let calls: any[] = [];
			const itf = new ethers.utils.Interface(getABI("MockToken", chain?.id!));

			for (let i = 0; i < _pools.length; i++) {
				for(let j = 0; j < _pools[i].collaterals.length; j++) {
					const collateral = _pools[i].collaterals[j];
					if(collateral.token.id == WETH_ADDRESS(chain?.id!).toLowerCase()) {
						calls.push([
							helper.address,
							helper.interface.encodeFunctionData("getEthBalance", [
								_address,
							]),
						]);
					} 
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
					// nonces
					calls.push([
						collateral.token.id,
						itf.encodeFunctionData("nonces", [_address]),
					]);
				}
				for(let j = 0; j < _pools[i].synths.length; j++) {
					const synth = _pools[i].synths[j];
					calls.push([
						synth.token.id,
						itf.encodeFunctionData("balanceOf", [_address]),
					]);
				}
			}

			helper.callStatic.aggregate(calls).then(async (res: any) => {
				setBlock(parseInt(res[0].toString()));
				let index = 0;
				// setting wallet balance and allowance
				for (let i = 0; i < _pools.length; i++) {
					for(let j = 0; j < _pools[i].collaterals.length; j++) {
						if(_pools[i].collaterals[j].token.id == WETH_ADDRESS(chain?.id!).toLowerCase()) {
							_pools[i].collaterals[j].nativeBalance = BigNumber.from(
								res.returnData[index]
							).toString();
							index++;
						}
						_pools[i].collaterals[j].walletBalance = BigNumber.from(
							res.returnData[index]
						).toString();
						index++;
						_pools[i].collaterals[j].allowance = BigNumber.from(
							res.returnData[index]
						).toString();
						index++;
						_pools[i].collaterals[j].nonce = BigNumber.from(
							res.returnData[index] == '0x' ? '0' : res.returnData[index]
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

				// sort collaterals by collateral.walletBalance * collateral.priceUSD
				for(let i = 0; i < _pools.length; i++){
					_pools[i].collaterals.sort((a: any, b: any) => {
						return (Big(a.walletBalance).add(a.nativeBalance ?? 0).div(10**a.token.decimals).mul(a.priceUSD)) < (Big(b.walletBalance).add(b.nativeBalance ?? 0).div(10**b.token.decimals).mul(b.priceUSD)) ? 1 : -1;
					})
				}

				for(let j = 0; j < _pools.length; j++){
					updateUserParams(_pools[j])
				}

				setStatus("ready");
				setPools(_pools);
				resolve(0);
			})
			.catch(err => {
				console.log("Failed to get balances and allowances", err);
				setStatus("error");
				setMessage(
					"Failed to fetch data. Please refresh the page or try again later."
				);
				reject(err)
			})
		});
	};

	const incrementNonce = async (_collateral: any) => {
		let _pools = [...pools];
		for (let i = 0; i < _pools.length; i++) {
			for (let j = 0; j < _pools[i].collaterals.length; j++) {
				if (_pools[i].collaterals[j].token.id == _collateral) {
					_pools[i].collaterals[j].nonce = Big(_pools[i].collaterals[j].nonce).plus(1).toString();
				}
			}
		}
		setPools(_pools);
		setRandom(Math.random());
	}

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
		_pool.userCollateral = (_totalCollateral.sub('100').toNumber());
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

				updateUserParams(_pools[i]);
				setPools(_pools);
				setRandom(Math.random());
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
		setRandom(Math.random());
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
					console.log(_pools[i].collaterals[j].token.id, collateralAddress);
					if (_pools[i].collaterals[j].token.id == collateralAddress) {
						_pools[i].collaterals[j].balance = Big(_pools[i].collaterals[j].balance ?? 0)[isMinus?'minus':'add'](value).toString();
						_pools[i].userAdjustedCollateral = Big(_pools[i].userAdjustedCollateral ?? 0)[isMinus?'minus':'add'](Big(value).div(10**_pools[i].collaterals[j].token.decimals).mul(_pools[i].collaterals[j].priceUSD).mul(_pools[i].collaterals[j].baseLTV).div(10000)).toNumber();
						_pools[i].userCollateral = Big(_pools[i].userCollateral ?? 0)[isMinus?'minus':'add'](Big(value).div(10**_pools[i].collaterals[j].token.decimals).mul(_pools[i].collaterals[j].priceUSD)).toNumber();
						updateUserParams(_pools[i]);
					}
				}
			}
		}
		setPools(_pools);
		setRandom(Math.random());
	};

	const addCollateralAllowance = (
		collateralAddress: string,
		poolAddress: string,
		value: string
	) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress){
				for (let j in _pools[i].collaterals) {
					if (_pools[i].collaterals[j].token.id == collateralAddress) {
						_pools[i].collaterals[j].allowance = Big(
							_pools[i].collaterals[j].allowance ?? 0
						).plus(value).toString();
					}
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
		if(!isConnected) return;
		console.log("Refreshing data", address);
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
			getAddress("Multicall2", chain?.id!),
			getABI("Multicall2", chain?.id!),
			provider.getSigner()
		);
		const pool = new ethers.Contract(_pools[0].id, getABI("Pool", chain?.id!), helper.provider);
		const priceOracle = new ethers.Contract(_pools[0].oracle, getABI("PriceOracle", chain?.id!), helper.provider);
		for(let i in _pools) {
			reqs.push([
				_pools[i].oracle,
				priceOracle.interface.encodeFunctionData("getAssetsPrices", 
					[_pools[i].collaterals.map((c: any) => c.token.id).concat(_pools[i].synths.map((s: any) => s.token.id))]
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
				pool.interface.encodeFunctionData("balanceOf", [address])
			])
		}
		helper.callStatic.aggregate(reqs).then((res: any) => {
			if(res.returnData.length > 0){
				let reqCount = 4;
				// if(account?.id) reqCount = 4;
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
		addCollateralAllowance,
		block,
		refreshData,
		setRefresh,
		refresh,
		referrals,
		incrementNonce
	};

	return (
		<AppDataContext.Provider value={value}>
			{children}
		</AppDataContext.Provider>
	);
}

export { AppDataProvider, AppDataContext };
