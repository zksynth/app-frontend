import { extendTheme, ThemeConfig } from "@chakra-ui/react";


const config: ThemeConfig = {
	initialColorMode: 'dark',
	useSystemColorMode: false,
};


const breakpoints = {
	sm: '360px',
	md: '768px',
	lg: '1024px',
	xl: '1440px',
	'2xl': '1680px',
};
export const theme = extendTheme({
	//components,
	// styles,
	config,
	breakpoints,
	colors: {
		primary: '#3EE6C4',
		secondary: '#5677FB'
	},
});