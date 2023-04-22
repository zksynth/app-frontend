import { Flex } from "@chakra-ui/react";

export default function IconBox({ children }: any) {
	return (
		<Flex
			align={"center"}
			justify="center"
			h={"40px"}
			w={"40px"}
			bg="whiteAlpha.50"
			border={"2px"}
			borderColor="whiteAlpha.300"
			rounded={10}
		>
			{children}
		</Flex>
	);
}