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
		heading: `Clash Grotesk, sans-serif`,
		body: `'Rubik', sans-serif`,
	},
	// styles,
	config,
	breakpoints,
	colors: {
		warning: "#FF8A00",
		danger: "#FF0000",
		primary: {
			50: '#EC255A',
			100: '#EC255A',
			200: '#EC255A',
			300: '#EC255A',
			400: '#EC255A',
			500: '#EC255A',
			600: '#EC255A',
			700: '#EC255A',
			800: '#EC255A',
			900: '#EC255A',
		},
		secondary: {
			50: '#000000',
			100: '#000000',
			200: '#000000',
			300: '#000000',
			400: '#000000',
			500: '#000000',
			600: '#000000',
			700: '#000000',
			800: '#000000',
			900: '#000000',
		},
		bg1: "#071222",
		bg2: "#0C1E3C",
		bg3: '#001A31',
		skyblue: "#92CAFF",
	},
});