import React, { useEffect } from 'react'
import {
	Box,
	Text,
	Flex,
    NumberInput,
    NumberInputField,
    IconButton,
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
} from "@chakra-ui/react";
import { SettingsIcon } from '@chakra-ui/icons';
import { VARIANT } from '../../styles/theme';

const OptionNames: any = {
    '0.1': 'Low (0.1%)',
    '0.5': 'Default (0.5%)',
    '3': 'High (3%)',
}

export default function Settings({maxSlippage, setMaxSlippage, deadline, setDeadline}: any) {
    const [isOption, setIsOption] = React.useState(true);

    const options = ['0.1', '0.5', '3']

    const setOption = (option: string) => {
        setIsOption(true)
        setMaxSlippage(option);
    }

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'framework',
        defaultValue: 'react',
        onChange: setOption,
        isDisabled: isOption,
        value: maxSlippage.toString()
    });

    const group = getRootProps();

    useEffect(() => {
        if (maxSlippage == '') {
            setMaxSlippage(0)
        }
        if(deadline == ''){
            setDeadline(0)
        }
    })

	const { colorMode } = useColorMode();

    return (
    <>
        <Menu flip={false}>
            <Flex align={'center'} gap={0}>
            {maxSlippage >= 1 && <Flex h={'100%'} px={3} pr={5} mr={-2} align={'center'} color={'whiteAlpha.700'} bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'} fontSize={'sm'}>
                <Text >Max Slippage: {maxSlippage}%</Text>
            </Flex>}
            <Box >
                <MenuButton h={6} p={1} as={IconButton} aria-label={""} icon={<SettingsIcon />} bg={'transparent'} _hover={{bg: 'transparent'}}></MenuButton>
            </Box>
            </Flex>
            <MenuList p={0} m={0} border={0} rounded={0} bg={'transparent'} shadow={'none'}>
                <Box className={`${VARIANT}-${colorMode}-containerBody2`} pt={1.5} pb={4}>
                <MenuGroup title="Slippage Tolerance">
                        <Flex mx={4} align={'center'} justify={'space-between'}>
                        {options.map((value) => {
                            const radio = getRadioProps({ value })
                            return (
                            <RadioCard isOption={isOption} key={value} {...radio}>
                                {OptionNames[value]}
                            </RadioCard>
                            )
                        })}
                        </Flex>
                        <Flex w={'200px'} pt={4} pb={2} mx={4} gap={2} align={'center'} justify={'space-between'}>
                            <Radio value="custom" colorScheme='secondary' isChecked={!isOption} onChange={() => setIsOption(false)}>Custom:</Radio>
                            <NumberInput isDisabled={isOption} value={isOption ? 0 : maxSlippage} onChange={(e) => setMaxSlippage(e)} size={'sm'}>
                                <Flex align={'center'} gap={2}>
                                <NumberInputField fontSize={'md'} />
                                <Text>%</Text>
                                </Flex>
                            </NumberInput>
                        </Flex>
                </MenuGroup>
                <MenuDivider borderColor={'whiteAlpha.400'} />
                <MenuGroup title="Transaction Deadline">
                    <>
                        <Flex w={'100px'} mx={4} align={'center'} justify={'start'}>
                            <NumberInput value={deadline} onChange={(e) => setDeadline(e)} size={'sm'}>
                                <Flex align={'center'} gap={2}>
                                <NumberInputField fontSize={'md'} />
                                <Text>min</Text>
                                </Flex>
                            </NumberInput>
                        </Flex>
                    </>
                </MenuGroup>
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
