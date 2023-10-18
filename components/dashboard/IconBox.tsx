import { Flex, useColorMode } from "@chakra-ui/react";

export default function IconBox({ children }: any) {
	const { colorMode } = useColorMode();
	return (
		<Flex
			align={"center"}
			justify="center"
			h={"30px"}
			w={"30px"}
			bg={colorMode == 'dark' ? "whiteAlpha.200" : "blackAlpha.200"}
			rounded={0}
		>
			{children}
		</Flex>
	);
}