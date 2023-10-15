import { Box, Flex, Skeleton, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { VARIANT } from '../../styles/theme';

export default function SwapSkeleton() {
    const {colorMode} = useColorMode();
  	return (
    <Box className={`${VARIANT}-${colorMode}-containerBody`} height={"382px"} shadow='2xl'>
		<Flex
			h={"40%"}
			align={"center"}
			px={5}
			justify="space-between"
		>
			<Skeleton
				color={"black"}
				bgColor={"black"}
				height={"50px"}
				width={"250px"}
			></Skeleton>

			<Box>
				<Skeleton
					mt={4}
					color={"black"}
					bgColor={"black"}
					height={"30px"}
					width={"150px"}
				></Skeleton>

				<Skeleton
					mt={4}
					color={"black"}
					bgColor={"black"}
					height={"20px"}
					width={"150px"}
				></Skeleton>
			</Box>
		</Flex>
		<Flex
			flexDir={"column"}
			justify="space-evenly"
			px={5}
			h={"60%"}
			bg="blackAlpha.100"
		>
			<Flex justify="space-between" align={"center"}>
				<Skeleton
					color={"black"}
					bgColor={"black"}
					height={"50px"}
					width={"250px"}
				></Skeleton>

				<Box>
					<Skeleton
						mt={4}
						color={"black"}
						bgColor={"black"}
						height={"30px"}
						width={"150px"}
					></Skeleton>

					<Skeleton
						mt={4}
						color={"black"}
						bgColor={"black"}
						height={"20px"}
						width={"150px"}
					></Skeleton>
				</Box>
			</Flex>

			<Skeleton
				color={"black"}
				bgColor={"black"}
				height={"60px"}
				width={"100%"}
			></Skeleton>
		</Flex>
	</Box>
  )
}
