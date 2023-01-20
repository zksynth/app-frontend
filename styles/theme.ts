import { extendTheme, ThemeConfig } from "@chakra-ui/react";

import { StepsTheme as Steps } from 'chakra-ui-steps';

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
	components: {
		Steps
	},
	// styles,
	config,
	breakpoints,
	colors: {
		primary: '#3EE6C4',
		primarySchema: {
			50: '#F0FEFF',
			100: '#D6FCFF',
			200: '#A9F8FF',
			300: '#7CF5FF',
			400: '#4EF1FF',
			500: '#3EE6C4',
			600: '#3ED9A8',
			700: '#3ECB8C',
			800: '#3EBD70',
			900: '#3EAF54',
		},
		secondary: '#5677FB',
		secondarySchema: {
			50: '#F4F6FF',
			100: '#E6E9FF',
			200: '#C2CFFF',
			300: '#9EB5FF',
			400: '#7A9CFF',
			500: '#5677FB',
			600: '#4E6EEB',
			700: '#455FDB',
			800: '#3D50CB',
			900: '#3442BB',
		}
	},
});