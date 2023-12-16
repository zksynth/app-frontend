import { Box, Button, Flex, useColorMode, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { VARIANT } from '../../styles/theme';


export const CustomConnectButton = () => {
	const { colorMode } = useColorMode();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');
        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                    <Box bg={'whiteAlpha.800'} rounded={'full'} _hover={{rounded: 'full'}} mr={-2}>
                  <Button size={'sm'} h={'36px'} fontSize={'13px'} color='black' onClick={openConnectModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }} rounded={'full'}>
                    Connect Wallet
                  </Button>
                  </Box>
                );
              }
              if (chain.unsupported) {
                return (
                  <Box className={`${VARIANT}-${colorMode}-errorButton`} rounded={'full'} _hover={{rounded: 'full'}} mr={-2}>
                  <Button size={'md'}  onClick={openChainModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }} rounded={'full'}>
                  Wrong network
                  </Button>
                  </Box>
                );
              }
              return (
                <Box >
                  <Button rounded={'full'} size={'sm'} py={'18px'} mr={-2} onClick={openAccountModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }} color={'whiteAlpha.800'}>
                    <Flex justify={'space-between'} align={'center'} mr={-2}>
                      <Text fontSize={'13px'}>
                        {account.displayName} 
                      </Text>
                      <RiArrowDropDownLine size={24} />
                    </Flex>
                  </Button>
                </Box>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};