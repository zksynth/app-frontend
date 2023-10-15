import { useToast } from "@chakra-ui/react"
import { formatBalError, formatLendingError, formatSynthError } from "../../src/errors";

export enum PlatformType {
    LENDING = "LENDING",
    DEX = "DEX",
    SYNTHETICS = "SYNTHETICS"
}

export default function useHandleError(type: PlatformType) {
    const toast = useToast();
    return (err: any) => {
        console.log(err);
        if(err?.reason == "user rejected transaction"){
            toast({
                title: "Transaction Rejected",
                description: "You have rejected the transaction",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        } else if(JSON.stringify(err).includes("header not found")){
            toast({
                title: "Network RPC Error",
                description: "Please try again",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        } else {
            if(formatLendingError(err) && type == PlatformType.LENDING){
                toast({
                    title: "Transaction Failed",
                    description: formatLendingError(err),
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right"
                })
            } else if(formatBalError(err) && type == PlatformType.DEX) {
                toast({
                    title: "Transaction Failed",
                    description: formatBalError(err),
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right"
                })
            } else if(formatSynthError(err) && type == PlatformType.SYNTHETICS) {
                toast({
                    title: "Transaction Failed",
                    description: formatSynthError(err),
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right"
                })
            } else {
                toast({
                    title: "Transaction Failed",
                    description: err?.data?.message || JSON.stringify(err?.message).slice(0, 150),
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right"
                })
            }
            
        } 
    }
}
