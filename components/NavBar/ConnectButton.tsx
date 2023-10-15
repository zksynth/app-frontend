import { Box, Button, useColorMode } from '@chakra-ui/react';
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
                    <Box className={`${VARIANT}-${colorMode}-primaryButton`} >
                  <Button size={'md'} onClick={openConnectModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
                    Connect Wallet
                  </Button>
                  </Box>
                );
              }
              if (chain.unsupported) {
                return (
                  <Box className={`${VARIANT}-${colorMode}-errorButton`} >
                  <Button size={'md'}  onClick={openChainModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
                  Wrong network
                  </Button>
                  </Box>
                );
              }
              return (
                <Box >
                  <Button rounded={0} size={'sm'} py={'18px'} onClick={openAccountModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
                    {account.displayName} <RiArrowDropDownLine size={24}/>
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