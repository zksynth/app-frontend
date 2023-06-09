import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getContract } from "../../src/contract";
import { ADDRESS_ZERO, dollarFormatter, Endpoints, WETH_ADDRESS, query, tokenFormatter, query_leaderboard, query_referrals, PYTH_ENDPOINT, defaultChain } from '../../src/const';
import { ChainID, chainMapping } from "../../src/chains";
import { BigNumber, ethers } from "ethers";
import { useEffect } from 'react';
import { useAccount, useNetwork } from "wagmi";
import { Interface } from "ethers/lib/utils.js";
const { Big } = require("big.js");
import chains from 'wagmi'
import { __chains } from "../../pages/_app";

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
	// Synthetics {time, balances, price, name, symbol} in desc time order
	const [portfolio, setPortfolio] = React.useState<any[]>([]);
	const [tradingPool, setTradingPool] = React.useState(0);
	const [leaderboard, setLeaderboard] = React.useState([]);

	useEffect(() => {
		if(localStorage){
			const _tradingPool = localStorage.getItem("tradingPool");
			if(_tradingPool && pools.length > parseInt(_tradingPool)){
				setTradingPool(parseInt(_tradingPool));
			}
		}
	}, [tradingPool, pools])

	const [refresh, setRefresh] = React.useState<number[]>([]);
	const [block, setBlock] = React.useState(0);
	const [random, setRandom] = React.useState(0);

	const [referrals, setReferrals] = React.useState<any[]>([]);

	useEffect(() => {
		if (refresh.length == 0 && pools.length > 0) {
			// set new interval
			const timer = setInterval(refreshData, 5000);
			setRefresh([Number(timer.toString())]);
			setRandom(Math.random());
		}
	}, [refresh, pools, random]); 

	const fetchData = (_address: string | null): Promise<number> => {
		let chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) chainId = defaultChain.id;
		console.log("fetching for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus("fetching");
			const endpoint = Endpoints(chainId)
			console.log("endpoint", endpoint);
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
							// reverse pool.collaterals
							pool.collaterals = pool.collaterals.reverse();
							pools[i] = pool;
						}
						
						if (_address) {
							_setPools(pools, userPoolData.accounts[0], _address)
							.then((_) => {
								resolve(0)
							})
							.catch(err => {
								console.log("error setting pools", err);
								reject(err);
							})
						} else {
							setPools(pools);
							refreshData(pools);
							setStatus("ready");
							resolve(0);
						}
					}
				})
				.catch((err) => {
					setStatus("error");
					setMessage(
						"Failed to fetch data. Please refresh the page and try again later."
					);
				});
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

	const refreshData = async (_pools = pools) => {
		return new Promise(async (resolve, reject) => {
			const chainId = chain?.id ?? defaultChain.id;
			const reqs: any[] = [];
			if(_pools.length == 0) {
				console.log("No pools found", _pools);
				return;
			}
			let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			
			const helper = new ethers.Contract(
				getAddress("Multicall2", chainId),
				getABI("Multicall2", chainId),
				provider
			);
			const pool = new ethers.Contract(_pools[0].id, getABI("Pool", chainId), helper.provider);
			const priceOracle = new ethers.Contract(_pools[0].oracle, getABI("PriceOracle", chainId), helper.provider);
			for(let i in _pools) {
				for(let j in _pools[i].collaterals) {
					if(address) reqs.push([
						_pools[i].id,
						pool.interface.encodeFunctionData("accountCollateralBalance", [address, _pools[i].collaterals[j].token.id])
					]);
					if(_pools[i].collaterals[j].feed == ethers.constants.HashZero.toLowerCase()){
						reqs.push([
							_pools[i].oracle,
							priceOracle.interface.encodeFunctionData("getAssetPrice", [_pools[i].collaterals[j].token.id])
						])
					} else if (_pools[i].collaterals[j].feed.startsWith('0x0000000000000000000000')){
						reqs.push([
							_pools[i].oracle,
							priceOracle.interface.encodeFunctionData("getAssetPrice", [_pools[i].collaterals[j].token.id])
						])
					}
				}
				for(let j in _pools[i].synths) {
					const synth = _pools[i].synths[j];
					reqs.push([
						synth.token.id,
						pool.interface.encodeFunctionData("totalSupply", [])
					]);
					if(_pools[i].synths[j].feed == ethers.constants.HashZero.toLowerCase()){
						reqs.push([
							_pools[i].oracle,
							priceOracle.interface.encodeFunctionData("getAssetPrice", [_pools[i].synths[j].token.id])
						])
					} else if (_pools[i].synths[j].feed.startsWith('0x0000000000000000000000')){
						reqs.push([
							_pools[i].oracle,
							priceOracle.interface.encodeFunctionData("getAssetPrice", [_pools[i].synths[j].token.id])
						])
					}
				}
				reqs.push([
					_pools[i].id,
					pool.interface.encodeFunctionData("totalSupply", [])
				]);
				if(address) reqs.push([
					_pools[i].id,
					pool.interface.encodeFunctionData("balanceOf", [address])
				])
			}

			// Set prices from pyth feeds
			try{
				await _setPythAssetPrices(_pools);
			} catch (err){
				console.log("Error setting asset prices", err);
			}

			for (let i = 0; i < _pools.length; i++) {
				const pool = _pools[i];
				// average burn and revenue
				let averageDailyBurn = Big(0);
				let averageDailyRevenue = Big(0);
				for(let k = 0; k < pool.synths.length; k++) {
					for(let l = 0; l <pool.synths[k].synthDayData.length; l++) {
						let synthDayData = pool.synths[k].synthDayData[l];
						// synthDayData.dailyMinted / 1e18 * pool.synths[k].mintFee / 10000 * pool.synths[k].priceUSD
						let totalFee = Big(synthDayData.dailyMinted).div(1e18).mul(pool.synths[k].mintFee).div(10000).mul(pool.synths[k].priceUSD);
						// add burn fee
						totalFee = totalFee.plus(Big(synthDayData.dailyBurned).div(1e18).mul(pool.synths[k].burnFee).div(10000).mul(pool.synths[k].priceUSD));

						// add to average
						averageDailyBurn = averageDailyBurn.plus(
							totalFee.mul(pool.issuerAlloc).div(10000)
						);
						averageDailyRevenue = averageDailyRevenue.plus(
							totalFee.mul(10000 - pool.issuerAlloc).div(10000)
						);
					}
				}
				pool.averageDailyBurn = averageDailyBurn.div(7).toString();
				pool.averageDailyRevenue = averageDailyRevenue.div(7).toString();
				_pools[i] = pool;
			}

			helper.callStatic.aggregate(reqs).then(async (res: any) => {
				if(res.returnData.length > 0){
					let reqCount = 0;
					for(let i = 0; i < _pools.length; i++) {
						for(let j in _pools[i].collaterals) {
							if(address) {
								_pools[i].collaterals[j].balance = Big(pool.interface.decodeFunctionResult("accountCollateralBalance", res.returnData[reqCount])[0].toString()).toString();
								reqCount += 1;
							}
							if(_pools[i].collaterals[j].feed == ethers.constants.HashZero.toLowerCase()){
								_pools[i].collaterals[j].priceUSD = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
								reqCount += 1;
							} else if (_pools[i].collaterals[j].feed.startsWith('0x0000000000000000000000')){
								// update price from feed
								_pools[i].collaterals[j].priceUSD = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
								reqCount += 1;
							}
						}
						
						// calculate total debt usd
						_pools[i].totalDebtUSD = "0";
						for(let j in _pools[i].synths) {
							_pools[i].synths[j].totalSupply = pool.interface.decodeFunctionResult("totalSupply", res.returnData[reqCount])[0].toString();
							reqCount += 1;
							if(_pools[i].synths[j].feed == ethers.constants.HashZero.toLowerCase()){
								_pools[i].synths[j].priceUSD = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
								reqCount += 1;
							} else if (_pools[i].synths[j].feed.startsWith('0x0000000000000000000000')){
								// update price from feed
								_pools[i].synths[j].priceUSD = Big(BigNumber.from(res.returnData[reqCount]).toString()).div(1e8).toString();
								reqCount += 1;
							}
							_pools[i].totalDebtUSD = Big(_pools[i].totalDebtUSD).plus(Big(_pools[i].synths[j].totalSupply).div(1e18).times(Big(_pools[i].synths[j].priceUSD))).toString();
						}
						
						_pools[i].totalSupply = pool.interface.decodeFunctionResult("totalSupply", res.returnData[reqCount])[0].toString();
						reqCount += 1;
						if(address) {
							_pools[i].balance = pool.interface.decodeFunctionResult("balanceOf", res.returnData[reqCount])[0].toString();
							reqCount += 1;
						}

						// sort pool.synths
						_pools[i].synths.sort((a: any, b: any) => {
							return (
								parseFloat(b.totalSupply) *
								parseFloat(b.priceUSD)
							) -
								
								(parseFloat(a.totalSupply) *
									parseFloat(a.priceUSD));
						});
						
						updateUserParams(_pools[i]);
					}
					setPools(_pools);
					setRandom(Math.random());
					resolve("Refreshed pools");
				} else {
					console.log("No return data");
					reject("No return data")
				}
			})
			.catch(err => {
				console.log("Failed multicall", err);
				reject(err);
			})
		})
	}

	const _setPythAssetPrices = async (_pools: any[]) => {
		return new Promise(async (resolve, reject) => {
		const pythFeeds = [];
		
		for(let i in _pools){
			for(let j in _pools[i].collaterals){
				if(_pools[i].collaterals[j].feed && !_pools[i].collaterals[j].feed.startsWith('0x0000000000000000000000')){
					pythFeeds.push(_pools[i].collaterals[j].feed);
				}
			}
			for(let j in _pools[i].synths){
				if(_pools[i].synths[j].feed && !_pools[i].synths[j].feed.startsWith('0x0000000000000000000000')){
					pythFeeds.push(_pools[i].synths[j].feed);
				}
			}
		}

		if(pythFeeds.length == 0) {
			resolve(1)
			return;
		};

		Promise.all([
			axios.get(PYTH_ENDPOINT + '/api/latest_price_feeds?ids[]=' + pythFeeds.join('&ids[]='))
		])
		.then((res: any) => {
			let pythIndex = 0;
			for(let i in _pools){
				for(let j in _pools[i].collaterals){
					if(_pools[i].collaterals[j].feed !== ethers.constants.HashZero.toLowerCase()){
						// update price from pyth feed
						_pools[i].collaterals[j].priceUSD = Big(res[0].data[pythIndex].price.price).mul(10**res[0].data[pythIndex].price.expo).toString();
						pythIndex += 1;
					}
				}
				for(let j in _pools[i].synths){
					if(_pools[i].synths[j].feed !== ethers.constants.HashZero.toLowerCase()){
						// update price from pyth feed
						_pools[i].synths[j].priceUSD = Big(res[0].data[pythIndex].price.price).mul(10**res[0].data[pythIndex].price.expo).toString();
						pythIndex += 1;
					}
				}
			}
			resolve(1);
		})
		.catch(err => {
			console.log("Error fetching prices", err);
			reject(err)
		})
	})
	}

	const _setPools = (
		_pools: any[],
		_account: any,
		_address: string,
		nTries: number = 0
	): Promise<number> => {
		const chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) return Promise.resolve(1);
		const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		const helper = new ethers.Contract(
			getAddress("Multicall2", chainId),
			getABI("Multicall2", chainId),
			provider
		);
		return new Promise(async (resolve, reject) => {
			let calls: any[] = [];
			const itf = new ethers.utils.Interface(getABI("MockToken", chainId));

			for (let i = 0; i < _pools.length; i++) {
				for(let j = 0; j < _pools[i].collaterals.length; j++) {
					const collateral = _pools[i].collaterals[j];
					if(collateral.token.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
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
					try{
						const _token = await getContract("MockToken", chainId, collateral.token.id);
						let _nonce = (await _token.nonces(_address)).toString();
						_pools[i].collaterals[j].nonce = _nonce;
					} catch (err) {}
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
						if(_pools[i].collaterals[j].token.id == WETH_ADDRESS(chainId)?.toLowerCase()) {
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
					console.log(_account);
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

				await refreshData(_pools);

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
				console.log("Failed to get balances and allowances", err, calls);
				setStatus("error");
				setMessage(
					"Failed to fetch data. Please refresh the page or try again later."
				);
				// reject(err)
				if(nTries > 5) {
					reject(err);
					return;
				}
				else {
					// try again in 5 seconds
					setTimeout(() => {
						_setPools(_pools, _account, _address, nTries + 1)
					}, 1000)
				}	
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

export const useAppData = () => {
	return React.useContext(AppDataContext);
}

export { AppDataProvider, AppDataContext };
