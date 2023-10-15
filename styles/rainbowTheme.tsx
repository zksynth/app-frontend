import { RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { VARIANT } from './theme';

const myCustomTheme: Theme = {
  blurs: {
    modalOverlay: '...',
  },
  colors: {
    accentColor: '#F64E00',
    accentColorForeground: '#ffffff',
    connectButtonBackground: '#F64E00',
    modalBackground: 'white',
    actionButtonBorder: "rgba(0, 0, 0, 0.1)",
    actionButtonBorderMobile: "rgba(0, 0, 0, 0.08)",
    actionButtonSecondaryBackground: "rgba(0, 0, 0, 0.25)",
    closeButton: "rgba(0, 0, 0, 0.6)",
    closeButtonBackground: "rgba(0, 0, 0, 0.08)",
    connectButtonBackgroundError: "#FF494A",
    connectButtonInnerBackground: "#ffffff",
    connectButtonText: "#fff",
    connectButtonTextError: "#000",
    connectionIndicator: "#30E000",
    downloadBottomCardBackground: "linear-gradient(126deg, rgba(0, 0, 0, 0) 9.49%, rgba(120, 120, 120, 0.2) 71.04%), #1A1B1F",
    downloadTopCardBackground: "linear-gradient(126deg, rgba(120, 120, 120, 0.2) 9.49%, rgba(0, 0, 0, 0) 71.04%), #1A1B1F",
    error: "#FF494A",
    generalBorder: "rgba(0, 0, 0, 0)",
    generalBorderDim: "rgba(0, 0, 0, 0.04)",
    menuItemBackground: "rgba(0, 0, 0, 0.1)",
    modalBackdrop: "rgba(0, 0, 0, 0.5)",
    // modalBackground: "#1A1B1F",
    modalBorder: "rgba(255, 255, 255, 0.08)",
    modalText: "#000",
    modalTextDim: "rgba(0, 0, 0, 0.3)",
    modalTextSecondary: "rgba(0, 0, 0, 0.6)",
    profileAction: "rgba(0, 0, 0, 0.07)",
    profileActionHover: "rgba(0, 0, 0, 0.1)",
    profileForeground: "rgba(0, 0, 0, 0.05)",
    selectedOptionBorder: "rgba(0, 0, 0, 0.1)",
    standby: "#FFD641"
  },
  fonts: {
    body: '12px',
  },
  radii: VARIANT == 'edgy' ? {
    actionButton: '0px',
    connectButton: '0px',
    menuButton: '0px',
    modal: '0px',
    modalMobile: '0px',
  }: {
    actionButton: '10px',
    connectButton: '10px',
    menuButton: '10px',
    modal: '20px',
    modalMobile: '0px',
  },
  shadows: {
    connectButton: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    dialog: "0px 8px 32px rgba(0, 0, 0, 0.32)",
    profileDetailsAction: "0px 2px 6px rgba(37, 41, 46, 0.04)",
    selectedOption: "0px 2px 6px rgba(0, 0, 0, 0.24)",
    selectedWallet: "0px 2px 6px rgba(0, 0, 0, 0.24)",
    walletLogo: "0px 2px 16px rgba(0, 0, 0, 0.16)"
  },
};

export default myCustomTheme;
