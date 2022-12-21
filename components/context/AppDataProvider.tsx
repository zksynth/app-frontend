import * as React from "react";
import axios from "axios";
import { getContract, call, getAddress, getABI } from "../../src/contract";
import { dollarFormatter, Endpoints, tokenFormatter } from "../../src/const";
import { ChainID, chainMapping } from "../../src/chains";
import { BigNumber, ethers } from "ethers";
const { Big } = require("big.js");

interface AppDataValue {
	isDataReady: boolean;
	collaterals: any[];
	totalCollateral: number;
	synths: any[];
	totalDebt: number;
	pools: any[];
	fetchData: (
		_address: string,
		chainId: number
	) => Promise<unknown> | undefined;
	tradingPool: number;
	setTradingPool: (_: number) => void;
	dataFetchError: string | null;
	dollarFormatter: any;
	tokenFormatter: any;
	tradingBalanceOf: (_: string) => number;
	minCRatio: number;
	safeCRatio: number;
	availableToBorrow: () => number;
	cRatio: () => number;
	isFetchingData: boolean;
	updateCollateralWalletBalance: (
		_: string,
		__: string,
		___: boolean
	) => void;
	updateCollateralAmount: (_: string, ___: string, ____: boolean) => void;
	updateSynthBalance: (_: string, __: string, ___: boolean) => void;
	chain: number;
	setChain: (_: number) => void;
	explorer: () => string;
	addCollateralAllowance(collateralAddress: string, value: string): void;
	toggleCollateralEnabled(collateralAddress: string): void;
	togglePoolEnabled(poolAddress: string): void;
	adjustedDebt: number;
	adjustedCollateral: number;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);
const collateralsConfig = require("../../artifacts/collaterals.json");
const synthsConfig = require("../../artifacts/synths.json");
const tradingPoolsConfig = require("../../artifacts/tradingPools.json");

const DUMMY_ADDRESS = "TU6nPbkDzMfhtg13nUnTMbuVFFMpLSs3P3";

function AppDataProvider({ children }: any) {
	const [isDataReady, setIsDataReady] = React.useState(false);
	const [isFetchingData, setIsFetchingData] = React.useState(false);
	const [dataFetchError, setDataFetchError] = React.useState<string | null>(
		null
	);

	const [collaterals, setCollaterals] = React.useState<any[]>([]);
	const [totalCollateral, setTotalCollateral] = React.useState(0);
	const [adjustedCollateral, setAdjustedCollateral] = React.useState(0);
	const [synths, setSynths] = React.useState<any[]>([]);
	const [totalDebt, setTotalDebt] = React.useState(0);
	const [adjustedDebt, setAdjustedDebt] = React.useState(0);

	const [pools, setPools] = React.useState<any[]>([]);
	const [tradingPool, setTradingPool] = React.useState(0);

	const [minCRatio, setMinCRatio] = React.useState(130);
	const [safeCRatio, setSafeCRatio] = React.useState(200);

	const [chain, setChain] = React.useState(ChainID.ARB_GOERLI);

	const [refresh, setRefresh] = React.useState(0);

	React.useEffect(() => {
		// fetchData(DUMMY_ADDRESS, ChainID.NILE);
	}, []);

	const explorer = () => {
		return chain === ChainID.NILE
			? "https://nile.explorer.org/#/transaction/"
			: chainMapping[chain]?.blockExplorers.default.url + "tx/";
	};

	const tradingBalanceOf = (_s: string) => {
		for (let i in synths) {
			if (synths[i].synth_id == _s) {
				if (!synths[i].amount) return 0;
				return synths[i].amount[tradingPool];
			}
		}
	};

	// const fetchTronData = (_address: string | null, chainId: number) => {
	// 	return new Promise((resolve, reject) => {
	// 		setIsFetchingData(true);
	// 		console.log("Fetching data...", Endpoints[chainId]);
	// 		Promise.all([
	// 			axios.get(Endpoints[chainId] + "assets/synths"),
	// 			axios.get(Endpoints[chainId] + "assets/collaterals"),
	// 			axios.get(Endpoints[chainId] + "pool/all"),
	// 			axios.get(Endpoints[chainId] + "system"),
	// 		])
	// 			.then(async (res) => {
	// 				let contract = await getContract("Helper", chainId);
	// 				Promise.all([
	// 					_setSynths(
	// 						res[2].data.data,
	// 						res[0].data.data,
	// 						contract,
	// 						_address,
	// 						chainId
	// 					),
	// 					_setCollaterals(
	// 						res[1].data.data,
	// 						contract,
	// 						_address,
	// 						chainId
	// 					),
	// 				])
	// 					.then((_) => {
	// 						setMinCRatio(res[3].data.data.minCollateralRatio);
	// 						setSafeCRatio(res[3].data.data.safeCollateralRatio);
	// 						resolve(null);
	// 					})
	// 					.catch((err) => {
	// 						console.log("Error", err);
	// 						reject(err);
	// 					});
	// 			})
	// 			.catch((err) => {
	// 				console.log("error", err);
	// 				setDataFetchError(
	// 					"Failed to fetch data. Please refresh the page."
	// 				);
	// 				reject(err);
	// 			});
	// 	});
	// };

	const fetchData = (_address: string, chainId: number) => {
		return new Promise((resolve, reject) => {
			setIsFetchingData(true);
			console.log("Fetching data...", Endpoints[chainId]);
			axios
				.post(Endpoints[chainId], {
					query: `{
								markets(first: 5, orderBy: totalBorrowBalanceUSD, orderDirection: desc) {
									id
									name
									canBorrowFrom
									inputToken{
										id
										name
										symbol
										decimals
									}
									canUseAsCollateral
									totalBorrowBalanceUSD
									inputTokenPriceUSD
									maximumLTV
									_rewardSpeed
									_mintedTokens (orderBy: _totalSupplyUSD, orderDirection: desc) {
										id
										name
										symbol
										decimals
										lastPriceUSD
										_totalSupplyUSD
									}
								}
							}`,
					variables: {},
				})
				.then(async (res) => {
					if(res.data.errors){
						setDataFetchError(
							"Failed to fetch data. Please refresh the page."
						);
						reject(res.data.errors);
						return;
					}
					const markets = res.data.data.markets;
					let _collaterals = [];
					let _pools = [];
					for (let i = 0; i < markets.length; i++) {
						if (markets[i].canBorrowFrom) {
							_pools.push(markets[i]);
						} else if (markets[i].canUseAsCollateral) {
							_collaterals.push(markets[i]);
						}
					}
					const provider = new ethers.providers.Web3Provider(
						(window as any).ethereum!,
						"any"
					);
					const multicallContract = new ethers.Contract(
						getAddress("Multicall", chainId),
						getABI("Multicall"),
						provider.getSigner()
					);
					_setCollaterals(
						_collaterals,
						multicallContract,
						_address,
						chainId
					);
					_setPools(_pools, multicallContract, _address, chainId);
				})
				.catch((err) => {
					console.log("error", err);
					setDataFetchError(
						"Failed to fetch data. Please refresh the page."
					);
					reject(err);
				});
		});
	};

	// const _setTronCollaterals = (
	// 	_collaterals: any,
	// 	helper: any,
	// 	_address: string | null,
	// 	_chain: number
	// ) => {
	// 	return new Promise((resolve, reject) => {
	// 		let tokens = [];
	// 		for (let i in _collaterals) {
	// 			tokens.push(_collaterals[i].coll_address);
	// 			tokens.push(_collaterals[i].cAsset);
	// 		}

	// 		if (_address)
	// 			call(helper, "balanceOf", [tokens, _address], _chain)
	// 				.then((res: any) => {
	// 					let collateralBalance = 0;
	// 					for (let i = 0; i < res.length; i += 2) {
	// 						_collaterals[i / 2]["walletBalance"] =
	// 							res[i].toString();
	// 						_collaterals[i / 2]["amount"] =
	// 							res[i + 1].toString();
	// 						collateralBalance +=
	// 							(res[i + 1].toString() *
	// 								_collaterals[i / 2].price) /
	// 							10 ** _collaterals[i / 2].decimal;
	// 					}
	// 					setCollaterals(_collaterals);
	// 					setTotalCollateral(collateralBalance);
	// 					resolve(null);
	// 				})
	// 				.catch((err: any) => {
	// 					console.log("Error:", err);
	// 					reject(err);
	// 				});
	// 		else {
	// 			setCollaterals(_collaterals);
	// 		}
	// 	});
	// };

	const _setCollaterals = (
		_collaterals: any[],
		helper: any,
		_address: string,
		_chain: number
	) => {
		return new Promise((resolve, reject) => {
			let calls = [];
			const itf = new ethers.utils.Interface(getABI("ERC20"));
			const synthexitf = new ethers.utils.Interface(getABI("SyntheX"));

			for (let i = 0; i < _collaterals.length; i++) {
				calls.push([
					_collaterals[i].id,
					itf.encodeFunctionData("balanceOf", [_address]),
				]);
				console.log(_collaterals[i].id, _address);
				calls.push([
					_collaterals[i].id,
					itf.encodeFunctionData("allowance", [
						_address,
						getAddress("SyntheX", _chain),
					]),
				]);
				calls.push([
					getAddress("SyntheX", _chain),
					synthexitf.encodeFunctionData("accountCollateralBalance", [
						_address,
						_collaterals[i].id,
					]),
				]);
				calls.push([
					getAddress("SyntheX", _chain),
					synthexitf.encodeFunctionData("collateralMembership", [
						_collaterals[i].id,
						_address,
					]),
				]);
			}
			let _totalCollateral = Big(0);
			let _adjustedCollateral = Big(0);
			helper.callStatic.aggregate(calls).then((res: any) => {
				for (let i = 0; i < res.returnData.length; i += 4) {
					_collaterals[i / 4].walletBalance = BigNumber.from(
						res.returnData[i]
					).toString();
					_collaterals[i / 4].allowance = BigNumber.from(
						res.returnData[i + 1]
					).toString();
					_collaterals[i / 4].balance = BigNumber.from(
						res.returnData[i + 2]
					).toString();
					_totalCollateral = _totalCollateral.plus(
						Big(_collaterals[i / 4].balance)
							.times(Big(_collaterals[i / 4].inputTokenPriceUSD))
							.div(
								Big(10).pow(
									_collaterals[i / 4].inputToken.decimals
								)
							)
					);
					_adjustedCollateral = _adjustedCollateral.plus(
						Big(_collaterals[i / 4].balance)
							.times(Big(_collaterals[i / 4].inputTokenPriceUSD))
							.div(
								Big(10).pow(
									_collaterals[i / 4].inputToken.decimals
								)
							)
							.times(Big(_collaterals[i / 4].maximumLTV))
							.div(100)
					);
					_collaterals[i / 4].isEnabled = Boolean(
						BigNumber.from(res.returnData[i + 3]).toNumber()
					);
				}
				setAdjustedCollateral(_adjustedCollateral.toNumber());
				setTotalCollateral(_totalCollateral.toNumber());
				setCollaterals(_collaterals);
			});
		});
	};

	const _setPools = (
		_pools: any[],
		helper: any,
		_address: string,
		_chain: number
	) => {
		return new Promise((resolve, reject) => {
			let calls = [];
			const itf = new ethers.utils.Interface(getABI("ERC20"));
			const synthexitf = new ethers.utils.Interface(getABI("SyntheX"));

			for (let i = 0; i < _pools.length; i++) {
				calls.push([
					getAddress("SyntheX", _chain),
					synthexitf.encodeFunctionData("getUserPoolDebtUSD", [
						_address,
						_pools[i].id,
					]),
				]);
				calls.push([
					getAddress("SyntheX", _chain),
					synthexitf.encodeFunctionData("tradingPoolMembership", [
						_pools[i].id,
						_address,
					]),
				]);
			}

			let _totalDebt = Big(0);
			let _adjustedDebt = Big(0);
			helper.callStatic.aggregate(calls).then(async (res: any) => {
				for (let i = 0; i < res.returnData.length; i += 2) {
					_pools[i / 2].balance = BigNumber.from(
						res.returnData[i]
					).toString();
					_totalDebt = _totalDebt.plus(
						Big(_pools[i / 2].balance).div(
							Big(10).pow(_pools[i / 2].inputToken.decimals)
						)
					);
					_adjustedDebt = _adjustedDebt.plus(
						Big(_pools[i / 2].balance)
							.div(Big(10).pow(_pools[i / 2].inputToken.decimals))
							.times(Big(_pools[i / 2].maximumLTV))
							.div(100)
					);
					_pools[i / 2].isEnabled = Boolean(
						BigNumber.from(res.returnData[i + 1]).toNumber()
					);

					const synths = _pools[i / 2]._mintedTokens;
					let calls = [];
					for (let j = 0; j < synths.length; j++) {
						calls.push([
							synths[j].id,
							itf.encodeFunctionData("balanceOf", [_address]),
						]);
					}
					const balances = await helper.callStatic.aggregate(calls);
					for (let j = 0; j < synths.length; j++) {
						synths[j].balance = BigNumber.from(
							balances.returnData[j]
						).toString();
					}
					_pools[i / 2]._mintedTokens = synths;
				}
				setAdjustedDebt(_adjustedDebt.toNumber());
				setTotalDebt(_totalDebt.toNumber());
				setPools(_pools);
			});
		});
	};

	const updateCollateralWalletBalance = (
		collateralAddress: string,
		value: string,
		isMinus: boolean = false
	) => {
		let _collaterals = collaterals;
		console.log(collaterals, collateralAddress, value);
		for (let i in _collaterals) {
			if (_collaterals[i].id == collateralAddress) {
				_collaterals[i].walletBalance = (
					isMinus
						? Big(_collaterals[i].walletBalance).minus(Big(value))
						: Big(_collaterals[i].walletBalance).plus(value)
				).toString();
			}
		}
		setRefresh(Math.random());
		setCollaterals(_collaterals);
	};

	const updateCollateralAmount = (
		collateralAddress: string,
		value: string,
		isMinus: boolean = false
	) => {
		let _collaterals = collaterals;
		for (let i in _collaterals) {
			if (_collaterals[i].id == collateralAddress) {
				_collaterals[i].balance = (
					isMinus
						? Big(_collaterals[i].balance).minus(value)
						: Big(_collaterals[i].balance).plus(value)
				).toString();

				const amountUSD = Big(value)
					.times(_collaterals[i].inputTokenPriceUSD)
					.div(10 ** _collaterals[i].inputToken.decimals);

				// update total collateral
				setRefresh(Math.random());
				if (isMinus) {
					setTotalCollateral(
						Big(totalCollateral).minus(amountUSD).toString()
					);
					setAdjustedCollateral(
						Big(adjustedCollateral).minus(
							amountUSD.times(_collaterals[i].maximumLTV).div(100)
						)
					);
				} else {
					setTotalCollateral(
						Big(totalCollateral).plus(amountUSD).toString()
					);
					setAdjustedCollateral(
						Big(adjustedCollateral).plus(
							amountUSD.times(_collaterals[i].maximumLTV).div(100)
						)
					);
				}
			}
		}
		setRefresh(Math.random());
		setCollaterals(_collaterals);
	};

	const addCollateralAllowance = (
		collateralAddress: string,
		value: string
	) => {
		let _collaterals = collaterals;
		for (let i in _collaterals) {
			if (_collaterals[i].id == collateralAddress) {
				_collaterals[i].allowance = Big(_collaterals[i].allowance)
					.plus(value)
					.toString();
			}
		}
		setCollaterals(_collaterals);
	};

	const toggleCollateralEnabled = (collateralAddress: string) => {
		let _collaterals = collaterals;
		for (let i in _collaterals) {
			if (_collaterals[i].id == collateralAddress) {
				_collaterals[i].isEnabled = !_collaterals[i].isEnabled;
			}
		}
		console.log("settin", _collaterals);
		setCollaterals(_collaterals);
	};

	const togglePoolEnabled = (poolAddress: string) => {
		let _pools = pools;
		for (let i in _pools) {
			if (_pools[i].id == poolAddress) {
				_pools[i].isEnabled = !_pools[i].isEnabled;
			}
		}
		console.log("settin", _pools);
		setPools(_pools);
	};

	const _setTronSynths = (
		_tradingPools: any,
		_synths: any,
		helper: any,
		_address: string | null,
		_chain: number
	) => {
		return new Promise((resolve, reject) => {
			let tokens: string[] = [];
			for (let i in _synths) {
				tokens.push(_synths[i].synth_id);
			}

			if (_address) {
				Promise.all([
					call(helper, "balanceOf", [tokens, _address], _chain),
					call(helper, "debtBalanceOf", [tokens, _address], _chain),
				])
					.then((res: any) => {
						let walletBalances = res[0];
						let debtBalances = res[1];

						let totalDebt = 0;

						for (let i = 0; i < walletBalances.length; i++) {
							_synths[i]["walletBalance"] =
								walletBalances[i].toString();
						}

						for (let i = 0; i < debtBalances.length; i++) {
							_synths[i]["amount"] = [debtBalances[i].toString()];
							totalDebt +=
								Number(debtBalances[i] / 1e18) *
								_synths[i].price;
						}

						let tradingPoolAddresses: string[] = [];
						for (let i in _tradingPools) {
							tradingPoolAddresses.push(
								_tradingPools[i].pool_address
							);
						}

						_tradingPools.splice(0, 0, {
							pool_address:
								"0x0000000000000000000000000000000000000000",
							name: "My Wallet",
							symbol: "USER",
						});

						setPools(_tradingPools);

						let poolUserDataRequests: any = [];
						for (let i in tradingPoolAddresses) {
							poolUserDataRequests.push(
								call(
									helper,
									"tradingBalanceOf",
									[tradingPoolAddresses[i], tokens, _address],
									_chain
								)
							);
						}

						Promise.all(poolUserDataRequests)
							.then((res: any) => {
								for (let i in res) {
									for (let j = 0; j < res[i].length; j++) {
										if (!_synths[j].amount)
											_synths[j]["amount"] = [];
										_synths[j]["amount"].push(
											res[i][j].toString()
										);
										totalDebt +=
											Number(res[i][j] / 1e18) *
											_synths[j].price;
									}
								}
								setTotalDebt(totalDebt);
								setSynths(_synths);
								setIsDataReady(true);
								setIsFetchingData(false);
								resolve(null);
							})
							.catch((err: any) => {
								console.log("Error:", err);
								reject(err);
							});
					})
					.catch((err: any) => {
						console.log("Error:", err);
						reject(err);
					});
			} else {
				setSynths(_synths);
				_tradingPools.splice(0, 0, {
					pool_address: "0x0000000000000000000000000000000000000000",
					name: "My Wallet",
					symbol: "USER",
				});
				setPools(_tradingPools);
			}
		});
	};

	// const _setSynths = ()

	const updateSynthBalance = (
		synthAddress: string,
		amount: string,
		isMinus: boolean = false
	) => {
		let _pools = pools;
		for (let i in _pools) {
			let _synths = _pools[i]._mintedTokens;
			for (let j = 0; j < _synths.length; j++) {
				if (_synths[j].id == synthAddress) {
					_synths[j].balance = (
						isMinus
							? Big(_synths[j].balance).minus(amount)
							: Big(_synths[j].balance).plus(amount)
					).toString();
					_pools[i].totalBorrowBalanceUSD = (
						isMinus
							? Big(_pools[i].totalBorrowBalanceUSD).minus(
									Big(amount)
									.times(_synths[j].lastPriceUSD)
									.div(10 ** _synths[j].decimals)
							  )
							: Big(_pools[i].totalBorrowBalanceUSD).plus(
									Big(amount)
									.times(_synths[j].lastPriceUSD)
									.div(10 ** _synths[j].decimals)
							  )
					).toString();
					_pools[i].balance = (
						isMinus
							? Big(_pools[i].balance).minus(
									Big(amount)
									.times(_synths[j].lastPriceUSD)
							  )
							: Big(_pools[i].balance).plus(
									Big(amount)
									.times(_synths[j].lastPriceUSD)
							  )
					).toString();
				}
			}
			_pools[i]._mintedTokens = _synths;
			setRefresh(Math.random());
			setPools(_pools);
		}
	};

	const availableToBorrow = () => {
		return (100 * totalCollateral) / safeCRatio - totalDebt > 0
			? (100 * totalCollateral) / safeCRatio - totalDebt
			: 0;
	};

	const cRatio = () => {
		return totalCollateral / totalDebt;
	};

	const value: AppDataValue = {
		isDataReady,
		collaterals,
		totalCollateral,
		synths,
		totalDebt,
		pools,
		tradingPool,
		setTradingPool,
		fetchData,
		dataFetchError,
		dollarFormatter,
		tokenFormatter,
		tradingBalanceOf,
		minCRatio,
		safeCRatio,
		availableToBorrow,
		cRatio,
		isFetchingData,
		updateCollateralWalletBalance,
		updateCollateralAmount,
		updateSynthBalance,
		chain,
		setChain,
		explorer,
		addCollateralAllowance,
		toggleCollateralEnabled,
		togglePoolEnabled,
		adjustedDebt,
		adjustedCollateral,
	};

	return (
		<AppDataContext.Provider value={value}>
			{children}
		</AppDataContext.Provider>
	);
}

export { AppDataProvider, AppDataContext };
