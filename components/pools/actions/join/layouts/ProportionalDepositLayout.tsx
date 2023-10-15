import React from "react";
import { usePriceData } from "../../../../context/PriceContext";
import {
	Box,
	Button,
	Divider,
	Flex,
	Image,
	InputGroup,
	Select,
	Text,
  useColorMode
} from "@chakra-ui/react";
import { NATIVE, WETH_ADDRESS, W_NATIVE, defaultChain, dollarFormatter, tokenFormatter } from "../../../../../src/const";
import { EditIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import { useBalanceData } from "../../../../context/BalanceProvider";
import Big from "big.js";
import {
    NumberInput,
    NumberInputField
} from '@chakra-ui/react'
import { formatInput, parseInput } from "../../../../utils/number";
import { AiOutlineWallet } from "react-icons/ai";
import ValuesTable from "../../others/ValuesTable";
import { VARIANT } from "../../../../../styles/theme";

export default function ProportionalDepositLayout({
  pool, 
  amounts, 
  setAmount, 
  isNative, 
  setIsNative, 
  bptOut, 
  loading, 
  validate, 
  values, 
  maxSlippage, 
  setMaxSlippage, 
  setMax, 
  tokenToApprove, 
  approve, 
  deposit
}: any) {
  
  const {chain} = useNetwork();
  const {prices} = usePriceData();
  const {walletBalances} = useBalanceData();
  const poolTokens = pool.tokens.filter((token: any) => token.token.id !== pool.address);
  const { colorMode } = useColorMode();
  
  return (
    <>
    <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 
    <Box bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'} pt={'1px'}>
    {amounts.map((amount: any, i: number) => {
      const _isNativeToken = poolTokens[i].token.id == WETH_ADDRESS(chain?.id!) && isNative;
      return (
        <Box key={i}>
          <Box px={4} >
            <InputGroup
              mt={5}
              variant={"unstyled"}
              display="flex"
              placeholder="Enter amount"
            >
              <NumberInput
                w={"100%"}
                value={formatInput(amount)}
                onChange={(valueString) => setAmount(valueString, i)}
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
                    {dollarFormatter.format(
                      (prices[poolTokens[i].token.id] ?? 0) *
                        (Number(amount) || 0)
                    )}
                  </Text>
                </Box>
                <Box>
                  <Flex className={`${VARIANT}-${colorMode}-outlinedBox`} p={2} py={1.5} pl={8} justify={'end'} align={'center'} gap={2} mt={i==0? 4:0}>
                    <Image rounded={'full'} src={`/icons/${_isNativeToken ? NATIVE : poolTokens[i].token.symbol}.svg`} alt="" width={"30px"} />
                    {poolTokens[i].token.id == WETH_ADDRESS(chain?.id ?? defaultChain.id) ? <><Select mr={-2} w={'110px'} value={isNative ? 'ETH' : 'WETH'} variant={'unstyled'} onChange={(e) => e.target.value == 'ETH' ? setIsNative(true) : setIsNative(false)}>
                      <option value="ETH">{NATIVE}</option>
                      <option value="WETH">{W_NATIVE}</option>
                    </Select></> : <Text mr={2}>{poolTokens[i].token.symbol}</Text>}
                  </Flex>
                  {i == 0 && <Flex justify={'right'} gap={0} mr={2}>
                    <Button
                      variant={"unstyled"}
                      fontSize="sm"
                      fontWeight={"normal"}
                      textDecor={'underline'}
                      textDecorationStyle="dashed"
                      onClick={() => setMax(0.5)}
                      textAlign={'right'}
                      m={0}
                    >
                      50%
                    </Button>
                    <Button
                      variant={"unstyled"}
                      fontSize="sm"
                      fontWeight={"normal"}
                      textDecor={'underline'}
                      textDecorationStyle="dashed"
                      onClick={() => setMax(1)}
                      textAlign={'right'}
                      m={0}
                    >
                      Max
                    </Button>
                  </Flex>}
                </Box>
              </NumberInput>
            </InputGroup>

            {(i !== (amounts.length - 1)) && <Flex my={5} align={'center'}>
              <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
              <PlusSquareIcon color={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
              <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
            </Flex>}
          </Box>
        </Box>
      );
    })}
    <Divider mt={8}/>
    </Box>

    <Box pt={4} pb={'1px'}>

    <ValuesTable values={values} pool={pool} bptOut={bptOut} />
    <Box className={(validate().valid && !loading) ? `${VARIANT}-${colorMode}-primaryButton` : `${VARIANT}-${colorMode}-disabledPrimaryButton`} m={4}>
    <Button  size={'lg'} isLoading={loading} loadingText='Loading' isDisabled={!validate().valid} bg={'transparent'} _hover={{bg: 'transparent'}} _disabled={{color: 'whiteAlpha.700'}} rounded={0} w={'100%'} onClick={tokenToApprove() >= 0 ? approve : deposit}>
      {validate().message}
    </Button>
    </Box>

    </Box>
      </>
  )
}
