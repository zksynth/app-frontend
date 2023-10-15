import React, { useEffect } from 'react'
import {
	Box,
	Text,
	Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  useRadioGroup,
  useRadio,
  Radio,
  useColorMode,
  Divider,
  Image,
  Heading,
  CircularProgress,
  Button
} from "@chakra-ui/react";
import { VARIANT } from '../../../styles/theme';
import { useLendingData } from '../../context/LendingDataProvider';
import { MdBolt } from 'react-icons/md';
import { getContract, send } from '../../../src/contract';
import { useNetwork } from 'wagmi';
import useHandleError, { PlatformType } from '../../utils/useHandleError';
import useUpdateData from '../../utils/useUpdateData';
import { useSyntheticsData } from '../../context/SyntheticsPosition';
import { useRouter } from 'next/router';


export default function EModeMenu({}: any) {
	const { colorMode } = useColorMode();
  const { protocols, updatePositions, pools, setUserEMode } = useLendingData();
  const [loading, setLoading] = React.useState(false);
  const { chain } = useNetwork();
  const { lendingPosition } = useSyntheticsData();

  const handleError = useHandleError(PlatformType.LENDING);
  const {getUpdateData} = useUpdateData();

  const router = useRouter();

  const protocol = protocols[Number(router.query.market) || 0] ?? [];
  const markets = pools[Number(router.query.market) || 0] ?? [];

  const setEMode = async (eMode: any) => {
    if(eMode === protocol.eModeCategory?.id) return;
    setLoading(true);
    let pool = await getContract('LendingPool', chain?.id!, protocol._lendingPoolAddress);
    let tx;
    let position = lendingPosition(Number(router.query.market));
    let data: string[] = [] 
    if(Number(position.debt) > 0){
      data = await getUpdateData(markets.map((m: any) => m.inputToken.id));
    }
    send(pool, "setUserEMode(uint8,bytes[])", [eMode, data]).then(async (res: any) => {
      res = await res.wait();
      setUserEMode(eMode);
      updatePositions();
      setLoading(false);
    })
    .catch((err: any) => {
      handleError(err);
      setLoading(false);
    })
  }

  return (
    <>
        <Menu flip={false}>
          <Box as={MenuButton}>
            <Flex 
              align={'center'}
              h={'100%'}
              px={3} 
              py={2}
              gap={1} 
              color={'whiteAlpha.700'} 
              className={`${VARIANT}-${colorMode}-outlinedBox`}
            >
                <MdBolt color='orange' />
                <Text color={colorMode == 'dark' ? 'white' : 'black'} fontSize={'sm'}>E-Mode: </Text>
                {loading ? <CircularProgress isIndeterminate size={'16px'} color='secondary.400' /> : protocol.eModeCategory ? <Heading size={'xs'} color={'secondary.300'}>{protocol.eModeCategory.label}</Heading> : <Heading size={'xs'} color={colorMode == 'dark' ? 'white' : 'black'}>Disabled</Heading>}
            </Flex>
            </Box>
            <MenuList p={0} m={0} border={0} rounded={0} bg={'transparent'} shadow={'none'}>
                <Box className={`${VARIANT}-${colorMode}-outlinedBox`} pt={4} pb={2}>
                {protocol.eModes.map((eMode: any, index: number) => <>
                  <MenuDivider m={0} borderColor={'whiteAlpha.400'} />
                  <Box>
                    <Box _hover={{bg: 'whiteAlpha.100'}} py={4} cursor={'pointer'} onClick={() => setEMode(eMode.id)}>
                      <Flex gap={1} mx={4} mb={3}>
                        <Flex mr={2}>
                        {eMode.assets.map((asset: any) => <Image mr={-2} src={`/icons/${asset.inputToken.symbol}.svg`} w={'20px'} alt='' key={asset.inputToken.symbol} />)}
                        </Flex>
                        <Heading size={'sm'}>{eMode.label}</Heading>
                        <Radio ml={1} colorScheme='secondary' isChecked={protocol.eModeCategory?.id == eMode.id} isDisabled={loading} />
                      </Flex>
                        <Flex gap={3} mx={4}>
                          <Box>
                            <Text fontSize={'xs'}>LTV</Text>
                            <Text>{eMode.ltv/100} %</Text>
                          </Box>
                          <Divider orientation="vertical" height={'40px'} />
                          <Box>
                            <Text fontSize={'xs'}>Liquidation</Text>
                            <Text>{eMode.liquidationThreshold/100} %</Text>
                          </Box>
                          <Divider orientation="vertical" height={'40px'} />
                          <Flex flexDir={'column'} gap={1}>
                            {eMode.assets.map((asset: any, index: number) => <Flex key={index} gap={1}> 
                              <Image src={`/icons/${asset.inputToken.symbol}.svg`} w={'20px'} alt='' key={asset.inputToken.symbol} /> 
                              <Text fontSize={'sm'}>{asset.inputToken.symbol}</Text>
                            </Flex>)}
                          </Flex>
                        </Flex>
                      </Box>
                    </Box>
                  <MenuDivider m={0} borderColor={'whiteAlpha.400'} />
                </>) }
                  <Box className={`${VARIANT}-${colorMode}-${protocol.eModeCategory ? 'p' : 'disabledP'}rimaryButton`} mx={4} mt={3} mb={1}>
                    <Button bg={'transparent'} _hover={{bg: 'transparent'}} size={'md'} w='100%' onClick={() => setEMode(0)} isDisabled={!protocol.eModeCategory}>Disable E-Mode</Button>
                  </Box>
                </Box>
            </MenuList>
        </Menu>
    </>
  )
}

// 1. Create a component that consumes the `useRadio` hook
function RadioCard(props: any) {
    const { getInputProps, getRadioProps } = useRadio(props)
  
    const input = getInputProps()
    const checkbox = getRadioProps()
  
    return (
      <Box as='label'>
        <input {...input} />
        <Box
          {...checkbox}
          cursor='pointer'
        //   borderWidth='1px'
          bg={'whiteAlpha.100'}
          _checked={{
            bg: props.isOption ? 'secondary.600' : 'whiteAlpha.100',
            color: 'white'
          }}
          px={3}
          py={1.5}
          fontSize={'sm'}
        >
          {props.children}
        </Box>
      </Box>
    )
  }
