import { ethers } from 'ethers';
import { ChainID } from './chains';

export function getABI(contractName: string, chain: number) {
  const config = require(`../deployments/${chain}/config.json`);
  const deployments = require(`../deployments/${chain}/deployments.json`);
  let contractBuild = deployments.sources[contractName];
  if(typeof contractBuild == 'string') contractBuild = JSON.parse(contractBuild);
  if(!contractBuild) throw new Error("ABI not found: "+contractName)

  if(contractName == 'Pool'){
    // const PoolLogic = JSON.parse(deployments.sources['PoolLogic']);
    let CollateralLogic = deployments.sources['CollateralLogic'];
    if(typeof CollateralLogic == 'string') CollateralLogic = JSON.parse(CollateralLogic);
    let SynthLogic = deployments.sources['SynthLogic'];
    if(typeof SynthLogic == 'string') SynthLogic = JSON.parse(SynthLogic);
    contractBuild = contractBuild.concat(CollateralLogic, SynthLogic);
  }
  return contractBuild;
}

export function getAddress(contractName: string, chain: number) {
  const config = require(`../deployments/${chain}/config.json`);
  const deployments = require(`../deployments/${chain}/deployments.json`);
  if(!deployments.contracts[contractName]) throw new Error("Contract address not found: " + contractName)
  return deployments.contracts[contractName].address;
}

export async function getContract(contractName: string, chain: number, address: string|null = null) {
  address = address ?? getAddress(contractName, chain);
  if(!(window as any).ethereum) throw new Error("Wallet not connected");
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  await provider.send('eth_requestAccounts', []);
  let contract = new ethers.Contract(address!, getABI(contractName, chain), provider.getSigner());
  return contract;
}

export function call(contract: any, method: string, params: any[]) {
  return contract[method](...params);
}

export function send(contract: any, method: string, params: any[], value = '0') {
  return contract[method](...params, { value: value });
}

export function estimateGas(contract: any, method: string, params: any[], value = '0') {
  return contract.estimateGas[method](...params, {value: value});
}