export const isValidNS = (value: string|number) => {
    if(typeof value === 'number') value = value.toString(); 
    return !isNaN(Number(value));
};

export const isValidAndPositiveNS = (value: string|number) => {
    if(typeof value === 'number') return value > 0;
    else return !isNaN(Number(value)) && Number(value) > 0;
}