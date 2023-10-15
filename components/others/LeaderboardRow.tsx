import { Flex, Td, Tr, Text } from '@chakra-ui/react';
import React from 'react'
import { useAccount, useEnsName } from 'wagmi'
import { defaultChain, dollarFormatter, tokenFormatter } from '../../src/const';
import { IoMdOpen } from 'react-icons/io';
import { FaMedal } from 'react-icons/fa';

export default function LeaderboardRow({index, _account}: any) {
    const {address} = useAccount();
    
    return (
        <>
        <Tr bg={address && address.toLowerCase() == _account.address ? 'whiteAlpha.100' : 'transparent'}>
            <Td borderColor={'whiteAlpha.50'}>
            <Flex gap={2} align='center'>
                <Text>
                {index} 
                </Text>
                {index <= 3 && <FaMedal color={index == 1 ? '#FFD700' : index == 2 ? '#C0C0C0' : '#CD7F32'} />}
            </Flex>
            </Td>
            <Td borderColor={'whiteAlpha.50'} _hover={{cursor: 'pointer'}} onClick={() => window.open(defaultChain.blockExplorers.default.url + '/address/' + _account.address)}>
                <Flex align={'center'} gap={3}>
                    <Text>
                        {(address && address.toLowerCase() == _account?.address ? `You (${_account?.address?.slice(0,8)})` : _account?.address?.slice(0, 8) + '...' + _account?.address?.slice(36))}
                    </Text>
                    <IoMdOpen />
                </Flex>
            </Td>
            <Td borderColor={'whiteAlpha.50'}>{tokenFormatter.format(_account.totalPoints ?? 0)}</Td>
            <Td borderColor={'whiteAlpha.50'}>{dollarFormatter.format(_account.totalVolumeUSD ?? 0)}</Td>

            <Td borderColor={'whiteAlpha.50'} isNumeric>
                {index <= 10 ? <Text fontWeight={'bold'} color={'secondary.400'}>2x</Text> : index <= 25 ? <Text fontWeight={'bold'} color={'primary.400'}>1.5x</Text> : '1x'}
            </Td>
        </Tr>
        </>
    )
}
