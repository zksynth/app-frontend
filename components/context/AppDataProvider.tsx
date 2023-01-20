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
		_address: string|null,
		chainId: number
	) => Promise<unknown> | undefined;
	tradingPool: number;
	setTradingPool: (_: number) => void;
	dataFetchError: string | null;
	dollarFormatter: any;
	tokenFormatter: any;
	tradingBalanceOf: (_: string) => number;
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
	block: number;
}

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

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

	const [safeCRatio, setSafeCRatio] = React.useState(2);

	const [chain, setChain] = React.useState(ChainID.ARB_GOERLI);

	const [refresh, setRefresh] = React.useState(0);
	const [block, setBlock] = React.useState(0);

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

	const fetchData = (_address: string|null, chainId: number) => {
		return new Promise((resolve, reject) => {
			setIsFetchingData(true);
			console.log(`Fetching data for ${_address} through ${Endpoints[chainId]}`)
			axios
				.post(Endpoints[chainId], {
					query: `{
								markets(orderBy: totalBorrowBalanceUSD, orderDirection: desc) {
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
									rewardTokens{
										token{
											id
											name
											symbol
											decimals
											lastPriceUSD
										}
									}
									rewardTokenEmissionsAmount
									rewardTokenEmissionsUSD
									_fee
									_issuerAlloc
									_capacity
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
					if(_address){
						const provider = new ethers.providers.Web3Provider(
							(window as any).ethereum!,
							"any"
						);
						const multicallContract = new ethers.Contract(
							getAddress("Multicall2", chainId),
							getABI("Multicall2"),
							provider.getSigner()
						);
						_setCollaterals(
							_collaterals,
							multicallContract,
							_address,
							chainId
						);
						_setPools(_pools, multicallContract, _address, chainId);
					} else {
						setCollaterals(_collaterals);
						setPools(_pools);
					}
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

	const _setCollaterals = (
		_collaterals: any[],
		helper: any,
		_address: string,
		_chain: number
	) => {
		return new Promise(async (resolve, reject) => {
			let calls = [];
			const itf = new ethers.utils.Interface(getABI("MockToken"));
			const synthexitf = new ethers.utils.Interface(getABI("SyntheX"));
			const synthex = await getContract("SyntheX", _chain);

			let _totalCollateral = Big(0);
			let _adjustedCollateral = Big(0);

			// for erc20Collaterals
			for (let i = 0; i < _collaterals.length; i++) {
				if(_collaterals[i].inputToken.id === "0x0000000000000000000000000000000000000000"){
					// getEthBalance
					calls.push([
						helper.address,
						helper.interface.encodeFunctionData("getEthBalance", [_address]),
					]);
					calls.push([
						helper.address,
						helper.interface.encodeFunctionData("getEthBalance", [_address]) 
					])
				} else {
					calls.push([
						_collaterals[i].id,
						itf.encodeFunctionData("balanceOf", [_address]),
					]);
					calls.push([
						_collaterals[i].id,
						itf.encodeFunctionData("allowance", [
							_address,
							getAddress("SyntheX", _chain),
						]),
					]);
				}

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
			
			const [res, safeCRatio] = await Promise.all([
				helper.callStatic.aggregate(calls), 
				synthex.safeCRatio()
			])
			
			setSafeCRatio(Number(ethers.utils.formatEther(safeCRatio)));
			setBlock(parseInt(res[0].toString()));
			for (let i = 0; i < res.returnData.length; i += 4) {
				_collaterals[i / 4].walletBalance = BigNumber.from(
					res.returnData[i]
				).toString();
				if(_collaterals[i / 4].inputToken.id === "0x0000000000000000000000000000000000000000"){
					_collaterals[i / 4].allowance = ethers.constants.MaxUint256.toString();
				} else {
					_collaterals[i / 4].allowance = BigNumber.from(
						res.returnData[i + 1]
						).toString();
					}
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
	};

	const _setPools = (
		_pools: any[],
		helper: any,
		_address: string,
		_chain: number
	) => {
		return new Promise((resolve, reject) => {
			let calls = [];
			const itf = new ethers.utils.Interface(getABI("MockToken"));
			const synthexitf = new ethers.utils.Interface(getABI("SyntheX"));
			const poolitf = new ethers.utils.Interface(getABI("DebtPool"));


			for (let i = 0; i < _pools.length; i++) {
				calls.push([
					_pools[i].id,
					poolitf.encodeFunctionData("getUserDebtUSD", [
						_address
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
				setBlock(parseInt(res[0].toString()));
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
							.div(Big(_pools[i / 2].maximumLTV))
							.times(100)
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
		block
	};

	return (
		<AppDataContext.Provider value={value}>
			{children}
		</AppDataContext.Provider>
	);
}

export { AppDataProvider, AppDataContext };
