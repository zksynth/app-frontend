import * as React from "react";
import axios from "axios";
import { getAddress, getABI, getContract } from "../../src/contract";
import { ADDRESS_ZERO, defaultChain } from '../../src/const';
import { ethers } from "ethers";
import { useEffect } from 'react';
import { useNetwork } from "wagmi";
import { __chains } from "../../pages/_app";
import { Status } from "../utils/status";
import { Endpoints, query } from "../../src/queries/synthetic";
import Big from "big.js";

interface AppDataValue {
	status: Status;
	message: string;
	pools: any[];
	fetchData: (
		_address?: string
	) => Promise<number>;
	tradingPool: number;
	setTradingPool: (_: number, pools?: any[]) => void;
	updateCollateralAmount: (collateralAddress: string, poolAddress: string, amount: string, minus: boolean) => void;
	block: number;
	leaderboard: any[];
	account: any,
	setRefresh: (_: number[]) => void; 
	refresh: number[];
	updateFromTx: (tx: any) => void;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<AppDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<AppDataValue['message']>("");
	const { chain } = useNetwork();
	const [account, setAccount] = React.useState<any|null>(null);
	const [pools, setPools] = React.useState<any[]>([]);
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

	const fetchData = (_address?: string): Promise<number> => {
		let chainId = defaultChain.id;
		console.log("Fetching data for chain", chainId);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			const endpoint = Endpoints(chainId)
			console.log("Endpoint", endpoint);
			if(!_address) _address = ADDRESS_ZERO;
			Promise.all([
				axios.post(endpoint, {
					query: query(_address?.toLowerCase()),
					variables: {},
				})
			])
				.then(async (res) => {
					if (res[0].data.errors) {
						setStatus(Status.ERROR);
						setMessage("Network Error. Please refresh the page or try again later.");
						reject(res[0].data.errors);
					} else {
						const userPoolData = res[0].data.data;
						const _pools = userPoolData.pools;
						const _account = userPoolData.accounts[0];

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

						setPools(_pools);
						setPoolFeeds(_pools)
							.then((_poolsWithFeeds) => {
								setStatus(Status.SUCCESS);
								resolve(0);
							})
							.catch((err) => {
								setStatus(Status.ERROR);
								setMessage(
									"Failed to fetch data. Please refresh the page and try again later."
								);
								reject(err);
							})
					}
				})
				.catch((err) => {
					setStatus(Status.ERROR);
					setMessage(
						"Failed to fetch data. Please refresh the page and try again later."
					);
				});
		});
	};

	const setPoolFeeds = (_pools: any[], nTries = 0) => {
		return new Promise<any>(async (resolve, reject) => {
			const chainId = defaultChain.id;
			const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			const helper = new ethers.Contract(
				getAddress("Multicall2", chainId),
				getABI("Multicall2", chainId),
				provider
			);
			let calls: any[] = [];
			for(let i in _pools){
				const pool = _pools[i];
				const oracle = new ethers.Contract(pool.oracle, getABI("PythOracle", chainId), provider);
				const fallbackOracle = await oracle.getFallbackOracle();
				for (let j = 0; j < pool.synths.length; j++) {
					calls.push([pool.oracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [pool.synths[j].token.id])]);
					if(fallbackOracle !== ADDRESS_ZERO){
						calls.push([fallbackOracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [pool.synths[j].token.id])]);
					}
				}
				for(let j = 0; j < pool.collaterals.length; j++){
					calls.push([pool.oracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [pool.collaterals[j].token.id])]);
					if(fallbackOracle !== ADDRESS_ZERO){
						calls.push([fallbackOracle, oracle.interface.encodeFunctionData("getSourceOfAsset", [pool.collaterals[j].token.id])]);
					}
				}
			}

			helper.callStatic.aggregate(calls).then(async (res: any) => {
				setBlock(parseInt(res[0].toString()));
				let index = 0;
				for(let i in _pools){
					const pool = _pools[i];
					const oracle = new ethers.Contract(pool.oracle, getABI("PythOracle", chainId), provider);
					const fallbackOracle = await oracle.getFallbackOracle();
					for (let j = 0; j < pool.synths.length; j++) {
						pool.synths[j].feed = res.returnData[index].toString();
						index += 1;
						if(fallbackOracle !== ADDRESS_ZERO){
							pool.synths[j].fallbackFeed = res.returnData[index + 1].toString();
							index += 1;
						}
					}
					for(let j = 0; j < pool.collaterals.length; j++){
						pool.collaterals[j].feed = res.returnData[index].toString();
						index += 1;
						if(fallbackOracle !== ADDRESS_ZERO){
							pool.collaterals[j].fallbackFeed = res.returnData[index + 1].toString();
							index += 1;
						}
					}
				}
				setPools(_pools);
				resolve(_pools);
			})
			.catch(err => {
				console.log("Failed to get price feeds", err, calls);
				setStatus(Status.ERROR);
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
						setPoolFeeds(_pools, nTries + 1);
					}, 1000)
				}	
			})
		});
	}

	const updateFromTx = async (tx: any) => {
		let poolItf = new ethers.utils.Interface(getABI("Pool", chain?.id ?? defaultChain.id));
		// Get Deposit Events
		let depositEvents = tx.logs.filter((log: any) => {
			return log.topics[0] == poolItf.getEventTopic("Deposit");
		});
		let decodedDepositEvents = depositEvents.map((log: any) => {
			return {address: log.address.toLowerCase(), args: poolItf.decodeEventLog("Deposit", log.data, log.topics)};
		});
		// Get Withdraw Events
		let withdrawEvents = tx.logs.filter((log: any) => {
			return log.topics[0] == poolItf.getEventTopic("Withdraw");
		});
		let decodedWithdrawEvents = withdrawEvents.map((log: any) => {
			return {address: log.address.toLowerCase(), args: poolItf.decodeEventLog("Withdraw", log.data, log.topics)};
		});
		// Get Transfer Events
		let transferEvents = tx.logs.filter((log: any) => {
			return log.topics[0] == poolItf.getEventTopic("Transfer");
		});
		let decodedTransferEvents = transferEvents.map((log: any) => {
			return {address: log.address.toLowerCase(), args: poolItf.decodeEventLog("Transfer", log.data, log.topics)};
		});

		for(let i in decodedDepositEvents) {
			updateCollateralAmount(decodedDepositEvents[i].args[1].toLowerCase(), pools[tradingPool].id, decodedDepositEvents[i].args[2].toString(), false);
		}
		for(let i in decodedWithdrawEvents) {
			updateCollateralAmount(decodedWithdrawEvents[i].args[1].toLowerCase(), pools[tradingPool].id, decodedWithdrawEvents[i].args[2].toString(), true);
		}
		let _pools = [...pools];
		for(let i in decodedTransferEvents) {
			if(decodedTransferEvents[i].address == pools[tradingPool].id){
				let amount = decodedTransferEvents[i].args[2].toString();
				let isMinus = true;
				// if minting debt tokens
				if(decodedTransferEvents[i].args[0] == ADDRESS_ZERO){
					isMinus = false;
				}
				_pools[tradingPool].totalSupply = Big(_pools[tradingPool].totalSupply ?? 0)[isMinus? 'minus' : 'add'](amount).toString();
				_pools[tradingPool].balance = Big(_pools[tradingPool].balance ?? 0)[isMinus? 'minus' : 'add'](amount).toString();
			}
		}

		setPools(_pools);
	}

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

	const value: AppDataValue = {
		account,
		leaderboard,
		status,
		message,
		pools,
		tradingPool,
		setTradingPool,
		fetchData,
		updateCollateralAmount,
		block,
		setRefresh,
		refresh,
		updateFromTx
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