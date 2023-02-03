import { ChainID } from './chains';
import { ethers } from 'ethers';

export const config = require('../deployments/config.json');
export const deployments = require('../deployments/deployments.json');

export function getABI(contractName: string) {
  const contractBuild = deployments.sources[contractName];
  return contractBuild;
}

export function getAddress(contractName: string, chain: number = ChainID.ARB_GOERLI) {
  return deployments.contracts[contractName].address;
}

export async function getContract(contractName: string, chain: number, address: string|null = null) {
  address = address ?? getAddress(contractName, chain);
  if(!(window as any).ethereum) return
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  await provider.send('eth_requestAccounts', []);
  let contract = new ethers.Contract(address!, getABI(contractName), provider.getSigner());
  return contract;
}

export function call(contract: any, method: string, params: any[], chain: number) {
  return contract[method](...params);
}

export function send(contract: any, method: string, params: any[], chain: number, value = '0') {
  return contract[method](...params, {value: value, gasPrice: ethers.utils.parseUnits('1.6', 'gwei')});
}

export function estimateGas(contract: any, method: string, params: any[], chain: number, value = '0') {
  return contract.estimateGas[method](...params, {value: value, gasPrice: ethers.utils.parseUnits('1.6', 'gwei')});
}