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
	components: {
		Heading: {
			baseStyle: {
				fontWeight: 'semibold'
			}
		}
	},
	fonts: {
		heading: `'clash display', sans-serif`,
		body: `'Rubik', sans-serif`,
	},
	// styles,
	config,
	breakpoints,
	colors: {
		warning: "#FF8A00",
		danger: "#FF0000",
		primary: {
			50: '#E6FFFA',
			100: '#B0FFF1',
			200: '#8AFFEA',
			300: '#54FFE0',
			400: '#33FFDA',
			500: '#00FFD1',
			600: '#00E8BE',
			700: '#00B594',
			800: '#008C73',
			900: '#006B58',
		},
		secondary: {
			50: '#E9EBF8',
			100: '#C3CCFB',
			200: '#A6B3F9',
			300: '#7D90F6',
			400: '#647BF4',
			500: '#3D5AF1',
			600: '#3852DB',
			700: '#2B40AB',
			800: '#223285',
			900: '#1A2665',
		},
		bg1: "#071325",
		bg2: "#0A1931"
	},
});