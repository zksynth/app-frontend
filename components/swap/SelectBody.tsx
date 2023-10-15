import { Box, Flex, Image, Text, useColorMode } from '@chakra-ui/react';
import React from 'react'
import { RiArrowDropDownLine } from 'react-icons/ri';
import { VARIANT } from '../../styles/theme';

export default function SelectBody({ asset, onOpen }: any) {
	const { colorMode } = useColorMode();
	return (
		<Box cursor="pointer" onClick={onOpen}>
			<Flex
				className={`${VARIANT}-${colorMode}-selectButton`}
				justify={"space-between"}
				align={"center"}
				px={2}
				py={2}
				pr={1}
				gap={1.5}
			>
				<Image
					src={"/icons/" + asset?.symbol + ".svg"}
					height={26}
					style={{margin: "4px"}}
					width={26}
					alt={asset?.symbol}
				/>

				<Text fontSize="lg" color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}>
					{asset?.symbol}
				</Text>
				<Box>
					<RiArrowDropDownLine size={20} />
				</Box>
			</Flex>
		</Box>
	);
}