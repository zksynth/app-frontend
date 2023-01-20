import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import * as React from "react";
import { getContract } from "../../src/contract";
import SYN from "../SYN/index";

const TokenContext = React.createContext<TokenValue>({} as TokenValue);

interface StakingPosition {
	staked: string;
	earned: string;
	rewardRate: string;
    allowance: string;
	totalSupply: string;
}

interface SYN {
	balance: string;
	sealedBalance: string;
}

interface UnlockData {
	amount: string;
	requestTime: string;
	claimed: string;
}

interface UnlockPosition {
	unlocking: number;
	allowance: string;
	lockupPeriod: string;
	unlockPeriod: string;
	pendingUnlocks: UnlockData[];
	percUnlockAtRelease: string;
	remainingQuota: string;
}

function TokenContextProvider({ children }: any) {
	const [syn, setSyn] = React.useState<SYN>({} as SYN);
	const [tokenUnlocks, setTokenUnlocks] = React.useState<UnlockPosition>(
		{} as UnlockPosition
	);
	const [staking, setStaking] = React.useState<StakingPosition>(
		{} as StakingPosition
	);

	const [refresh, setRefresh] = React.useState(0);

	const fetchData = async (address: string, chain: number) => {
		// token unlocks
		const unlocker = await getContract("TokenUnlocker", chain);
		const tokenUnlocks = BigNumber.from(
			await unlocker.unlockRequestCount(address)
		).toNumber();

		const multicall = await getContract("Multicall2", chain);
		let calls = [];

		for (let i = 0; i < tokenUnlocks; i++) {
			calls.push({
				target: unlocker.address,
				callData: unlocker.interface.encodeFunctionData(
					"unlockRequests",
					[
						ethers.utils.solidityKeccak256(
							["address", "uint256"],
							[address, i]
						),
					]
				),
			});
		}

		const result = await multicall.callStatic.aggregate(calls);
		const decoded = result.returnData.map((data: any) =>
			unlocker.interface.decodeFunctionResult("unlockRequests", data)
		);

		const unlockData = decoded.map((data: any) => {
			return {
				amount: Number(ethers.utils.formatEther(data.amount)),
				requestTime: Number(data.requestTime),
				claimed: Number(ethers.utils.formatEther(data.claimed)),
			};
		});

		console.log(unlockData);

		// sealed syn balance
		const sealedSYN = await getContract("SealedSYN", chain);
		const sealedSYNBalance = BigNumber.from(
			await sealedSYN.balanceOf(address)
		).toString();

		const syn = await getContract("SyntheXToken", chain);
		const synBalance = BigNumber.from(
			await syn.balanceOf(address)
		).toString();

		setSyn({
			balance: (ethers.utils.formatEther(synBalance)),
			sealedBalance: (ethers.utils.formatEther(sealedSYNBalance)),
		});

		calls = [];
		// lockPeriod
		calls.push({
			target: unlocker.address,
			callData: unlocker.interface.encodeFunctionData("lockPeriod"),
		});
		// unlockPeriod
		calls.push({
			target: unlocker.address,
			callData: unlocker.interface.encodeFunctionData("unlockPeriod"),
		});
		// percUnlockAtRelease
		calls.push({
			target: unlocker.address,
			callData: unlocker.interface.encodeFunctionData(
				"percUnlockAtRelease"
			),
		});
		calls.push({
			target: unlocker.address,
			callData: unlocker.interface.encodeFunctionData(
				"remainingQuota"
			),
		});

		// allowance
		calls.push({
			target: sealedSYN.address,
			callData: sealedSYN.interface.encodeFunctionData("allowance", [
				address,
				unlocker.address,
			]),
		});

		const unlockerResult = await multicall.callStatic.aggregate(calls);

		setTokenUnlocks({
			unlocking: tokenUnlocks,
			lockupPeriod: (unlockerResult.returnData[0]),
			unlockPeriod: (unlockerResult.returnData[1]),
			percUnlockAtRelease: (
				ethers.utils.formatEther(unlockerResult.returnData[2])
			),
			pendingUnlocks: unlockData,
			remainingQuota: ethers.utils.formatEther(unlockerResult.returnData[3]),
			allowance: BigNumber.from(unlockerResult.returnData[4]).toString(),
		});

		// staking data
		const staking = await getContract("StakingRewards", chain);
		calls = [];
		// rewardRate
		calls.push({
			target: staking.address,
			callData: staking.interface.encodeFunctionData("rewardRate"),
		});
		// earned
		calls.push({
			target: staking.address,
			callData: staking.interface.encodeFunctionData("earned", [address]),
		});
		// balanceOf
		calls.push({
			target: staking.address,
			callData: staking.interface.encodeFunctionData("balanceOf", [
				address,
			]),
		});
        // allowance
        calls.push({
            target: sealedSYN.address,
            callData: sealedSYN.interface.encodeFunctionData("allowance", [
                address,
                staking.address,
            ]),
        });
		// totalSupply
		calls.push({
			target: staking.address,
			callData: staking.interface.encodeFunctionData("totalSupply"),
		});

		const stakingResult = await multicall.callStatic.aggregate(calls);

		setStaking({
			rewardRate: (
				ethers.utils.formatEther(stakingResult.returnData[0])
			),
			earned: (
				ethers.utils.formatEther(stakingResult.returnData[1])
			),
			staked: (
				ethers.utils.formatEther(stakingResult.returnData[2])
			),
            allowance: BigNumber.from(stakingResult.returnData[3]).toString(),
			totalSupply: (
				ethers.utils.formatEther(stakingResult.returnData[4])
			),
		});

		setRefresh(Math.random());
	};

	const increaseStakingAllowance = async (amount: string) => {
		const _staking = staking;
		_staking.allowance = Big(_staking.allowance).add(amount).toString();
		setStaking(_staking);
		setRefresh(Math.random());
	}

	const increaseUnlockAllowance = async (amount: string) => {
		const _unlock = tokenUnlocks;
		_unlock.allowance = Big(_unlock.allowance).add(amount).toString();
		setTokenUnlocks(_unlock);
		setRefresh(Math.random());
	}

	const staked = async (amount: string) => {
		const _staking = staking;
		const _syn = syn;
		_staking.staked = Big(_staking.staked).add(amount).toString();
		_syn.sealedBalance = Big(_syn.sealedBalance).sub(amount).toString();
		setStaking(_staking);
		setRefresh(Math.random());
	}

	const addedToUnlock = async (amount: string) => {
		const _unlock = tokenUnlocks;
		const _syn = syn;
		_unlock.unlocking += 1;
		_unlock.pendingUnlocks.push({
			amount: amount,
			requestTime: (Date.now() / 1000).toString(),
			claimed: '0'
		})
		_syn.sealedBalance = Big(_syn.sealedBalance).sub(amount).toString();
		setTokenUnlocks(_unlock);
		setRefresh(Math.random());
	}

	const value: TokenValue = {
		fetchData,
		tokenUnlocks,
		syn,
		staking,
		increaseUnlockAllowance,
		increaseStakingAllowance,
		staked,
		addedToUnlock
	};

	return (
		<TokenContext.Provider value={value}>{children}</TokenContext.Provider>
	);
}

interface TokenValue {
	fetchData: (address: string, chain: number) => void;
	tokenUnlocks: UnlockPosition;
	syn: SYN;
	staking: StakingPosition;
	staked: (amount: string) => void;
	increaseUnlockAllowance: (amount: string) => void;
	increaseStakingAllowance: (amount: string) => void;
	addedToUnlock: (amount: string) => void;
}

export { TokenContextProvider, TokenContext };
