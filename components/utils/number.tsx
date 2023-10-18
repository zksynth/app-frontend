import { tokenFormatter } from "../../src/const";

export const isValidNS = (value: string|number) => {
    if(typeof value === 'number') value = value.toString(); 
    return !isNaN(Number(value));
};

export const isValidAndPositiveNS = (value: string|number) => {
    if(typeof value === 'number') return value > 0;
    else return !isNaN(Number(value)) && Number(value) > 0;
}

export const formatInput = (amount: string) => {
    // if more than 1 decimal, remove all decimals after the first
    if(amount.split('.').length > 2) {
        amount = amount.split('.')[0] + '.' + amount.split('.')[1];
    }
    // if value is NaN, 0, or has a decimal, return the value as is, otherwise format it
    return (isNaN(Number(amount)) || Number(amount) == 0 || amount.indexOf('.') == amount.length - 1) ? amount : tokenFormatter.format(Number(amount));
}

export const parseInput = (amount: string) => {
    // remove invalid characters
    amount = amount.replace(/[^0-9.]/g, '');
    // if more than 1 decimal, remove all decimals after the first
    if(amount.split('.').length > 2) {
        amount = amount.split('.')[0] + '.' + amount.split('.')[1];
    }
    return amount.replace(/,/g, '');
}