import { Box, Flex, Skeleton } from '@chakra-ui/react'
import React from 'react'

export default function SwapSkeleton() {
  return (
    <Box height={"382px"} shadow='2xl'>
					<Flex
						h={"40%"}
						bg="whiteAlpha.500"
						align={"center"}
						px={5}
						roundedTop="8"
						justify="space-between"
					>
						<Skeleton
							color={"black"}
							bgColor={"black"}
							height={"50px"}
							width={"250px"}
							rounded={"8"}
						></Skeleton>

						<Box>
							<Skeleton
								mt={4}
								color={"black"}
								bgColor={"black"}
								height={"30px"}
								width={"150px"}
								rounded={"8"}
							></Skeleton>

							<Skeleton
								mt={4}
								color={"black"}
								bgColor={"black"}
								height={"20px"}
								width={"150px"}
								rounded={"8"}
							></Skeleton>
						</Box>
					</Flex>
					<Flex
						flexDir={"column"}
						justify="space-evenly"
						px={5}
						h={"60%"}
						bg="blackAlpha.100"
						roundedBottom="8"
					>
						<Flex justify="space-between" align={"center"}>
							<Skeleton
								color={"black"}
								bgColor={"black"}
								height={"50px"}
								width={"250px"}
								rounded={"8"}
							></Skeleton>

							<Box>
								<Skeleton
									mt={4}
									color={"black"}
									bgColor={"black"}
									height={"30px"}
									width={"150px"}
									rounded={"8"}
								></Skeleton>

								<Skeleton
									mt={4}
									color={"black"}
									bgColor={"black"}
									height={"20px"}
									width={"150px"}
									rounded={"8"}
								></Skeleton>
							</Box>
						</Flex>

						<Skeleton
							color={"black"}
							bgColor={"black"}
							height={"60px"}
							width={"100%"}
							rounded={"8"}
						></Skeleton>
					</Flex>
				</Box>
  )
}
