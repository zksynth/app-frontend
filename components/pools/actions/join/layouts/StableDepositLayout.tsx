import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../../context/PriceContext";
import {
	Box,
	Button,
	Divider,
	Flex,
	IconButton,
	Image,
	InputGroup,
	NumberInput,
	NumberInputField,
	Select,
	Text,
    useColorMode,
    useToast,
} from "@chakra-ui/react";
import { NATIVE, WETH_ADDRESS, defaultChain, dollarFormatter, tokenFormatter } from "../../../../../src/const";
import { ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import { useBalanceData } from "../../../../context/BalanceProvider";
import { formatInput, parseInput } from "../../../../utils/number";
import { AiOutlineWallet } from "react-icons/ai";
import { MdRefresh } from "react-icons/md";
import ValuesTable2 from "../../others/ValuesTable2";
import { VARIANT } from "../../../../../styles/theme";

export default function StableDepositLayout({
  pool, 
  amount, 
  setAmount, 
  onSelectUpdate,
  isNative, 
  values, 
  bptOut, 
  loading, 
  validate, 
  maxSlippage, 
  setMaxSlippage, 
  setMax, 
  shouldApprove, 
  approve, 
  deposit,
  tokenSelectedIndex
}: any) {

    const { prices } = usePriceData();
    const { walletBalances } = useBalanceData();
    const { chain } = useNetwork();

    const _isNativeToken = pool.tokens[tokenSelectedIndex].token.id == WETH_ADDRESS(chain?.id!) && isNative;
    const { colorMode } = useColorMode();

    return (
    <>	
        <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 
        <Box bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'} px={4}>
            <InputGroup
                pt={7}
                pb={7}
                variant={"unstyled"}
                display="flex"
                placeholder="Enter amount"
            >
                <NumberInput
                    w={"100%"}
                    value={formatInput(amount)}
                    onChange={(valueString) => setAmount(valueString)}
                    min={0}
                    step={0.01}
                    display="flex"
                    alignItems="center"
                    justifyContent={"center"}
                >
                    <Box ml={0}>
                        <NumberInputField
                            textAlign={"left"}
                            pr={0}
                            fontSize={"4xl"}
                            placeholder="0"
                            fontFamily={'Chakra Petch'}
                        />
                        <Text
                            fontSize="sm"
                            textAlign={"left"}
                            color={colorMode == 'dark' ? "whiteAlpha.600" : "blackAlpha.600"}
                        >
                            {dollarFormatter.format(((prices[pool.tokens[tokenSelectedIndex].token.id] ?? 0) * (Number(amount) || 0 )) ?? 0)}
                        </Text>
                    </Box>

                    <Flex flexDir={'column'} align={'end'}>
                    <Flex cursor={'pointer'} className={`${VARIANT}-${colorMode}-outlinedBox`} w={'125px'} p={2} py={2} pl={3} justify={'end'} align={'center'} gap={2} mt={2}>
                        <Image rounded={'full'} src={`/icons/${_isNativeToken ? NATIVE : pool.tokens[tokenSelectedIndex].token.symbol}.svg`} alt="" width={"30px"} />
                        <Select mr={-2} w={'110px'} value={tokenSelectedIndex + '-' + (isNative ? 'ETH' : pool.tokens[tokenSelectedIndex].token.symbol)} variant={'unstyled'} onChange={onSelectUpdate}>
                            {pool.tokens.map((token: any, i: number) => {
                                if(token.token.id == pool.address) return <></>
                                return ( <>
                                    <option key={i} value={i + '-' + token.token.symbol}>{token.token.symbol}</option>
                                    {token.token.id == WETH_ADDRESS(chain?.id!) && 
                                        <option key={i+100} value={i + '-' + NATIVE}>{NATIVE}</option>
                                    }
                                    </>
                                )
                            }
                            )}
                        </Select>
                    </Flex>
                    <Flex mt={0} align={'center'} gap={1}>
                    <AiOutlineWallet />
                    <Button
                        variant={"unstyled"}
                        fontSize="sm"
                        fontWeight={"normal"}
                        textDecor={'underline'}
                        textDecorationStyle="dashed"
                        onClick={setMax}
                    >
                        {tokenFormatter.format(walletBalances[_isNativeToken ? ethers.constants.AddressZero : pool.tokens[tokenSelectedIndex].token.id] / (10**pool.tokens[tokenSelectedIndex].token.decimals) ?? 0)}
                    </Button>
                    </Flex>
                    </Flex>
                    
                </NumberInput>
            </InputGroup>
        </Box>
        <Divider mb={4}/>
        
        <ValuesTable2 values={values} pool={pool} bptOut={bptOut} maxSlippage={maxSlippage} setMaxSlippage={setMaxSlippage} />
        <Box className={validate().valid ? `${VARIANT}-${colorMode}-primaryButton` : `${VARIANT}-${colorMode}-disabledPrimaryButton`} m={4}>
        <Button size={'lg'} isLoading={loading} loadingText='Loading' isDisabled={!validate().valid} bg={'transparent'} _hover={{bg: 'transparent'}} rounded={0} w={'100%'} onClick={shouldApprove() ? approve : deposit}>
            {validate().message}
        </Button>
        </Box>
        </>
  )
}
