import { ADDRESSES } from './const';
import { ChainID } from './chains';
import { ethers } from 'ethers';

export function getABI(contractName: string) {
  const contractBuild = require('../abis/' + contractName + '.json');
  return contractBuild.abi;
}

export function getAddress(contractName: string, chain: number = ChainID.ARB_GOERLI) {
  return ADDRESSES[chain][contractName]
}

export async function getContract(contractName: string, chain: number, address: string|null = null) {
  address = address ?? getAddress(contractName, chain);
  if(chain == ChainID.NILE){
    let contract = await ((window as any).tronWeb).contract(getABI(contractName), address)
    return contract;
  } else {
    if(!(window as any).ethereum) return
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    let contract = new ethers.Contract(address!, getABI(contractName), provider.getSigner());
    return contract;
  }
}

export function call(contract: any, method: string, params: any[], chain: number) {
  if(chain == ChainID.NILE){
    return contract[method](...params).call();
  } else {
    return contract[method](...params);
  }
}

export function send(contract: any, method: string, params: any[], chain: number) {
  if(chain == ChainID.NILE){
    return contract[method](...params).send();
  } else {
    return contract[method](...params, {gasPrice: ethers.utils.parseUnits('1.6', 'gwei')});
  }
}