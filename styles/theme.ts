import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { switchTheme } from './switchTheme';

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

export const VARIANT: string = process.env.NEXT_PUBLIC_VARIANT ?? "rounded";
export const HEADING_FONT = VARIANT == "rounded" ? "General Sans" : "Chakra Petch";
export const BODY_FONT = VARIANT == "rounded" ? "Poppins" : "Rubik";

const components: any = {
	Heading: {
		baseStyle: {
			fontWeight: 'semibold'
		}
	}
};

if(VARIANT != "rounded"){
	components.Switch = switchTheme;
}

export const theme = extendTheme({
	components,
	fonts: {
		heading: `${HEADING_FONT}, sans-serif`,
		body: `${BODY_FONT}, sans-serif`,
	},
	// styles,
	config,
	breakpoints,
	colors: {
		warning: "#FF8A00",
		danger: "#FF0000",
		primary: VARIANT == 'edgy' ? {
			50:  '#FFE5BC',
			100: '#FFD89B',
			200: '#FFC871',
			300: '#FFBD54',
			400: '#FFAE2D',
			500: '#E49C28',
			600: '#CF8D23',
			700: '#BB7F20',
			800: '#9B6A1C',
			900: '#7D5617',
		} : {
			50:  '#fde9ef',
			100: '#f9bbcc',
			200: '#f69bb3',
			300: '#f26d90',
			400: '#f0517b',
			500: '#ec255a',
			600: '#d72252',
			700: '#a81a40',
			800: '#821432',
			900: '#631026',
		},
		secondary: VARIANT == 'edgy' ? {
			50:  '#FFB593',
			100: '#FF9B6D',
			200: '#FF8B55',
			300: '#FF7333',
			400: '#ff631b',
			500: '#DF581A',
			600: '#CE5117',
			700: '#AE4616',
			800: '#933D15',
			900: '#783212',
		} : {
			50:  '#FD5D5D',
			100: '#FD5D5D',
			200: '#FD5D5D',
			300: '#FD5D5D',
			400: '#FD5D5D',
			500: '#FD5D5D',
			600: '#FD5D5D',
			700: '#FD5D5D',
			800: '#FD5D5D',
			900: '#FD5D5D',
		},
		darkBg: {
			200: '#343B48',
			400: '#252B36',
			600: '#191D25',
		},
		lightBg: {
			200: '#C1C1C1',
			400: '#E8E8E8',
			600: '#f0f0f0',
		},
		skyblue: "#92CAFF",
	},
});