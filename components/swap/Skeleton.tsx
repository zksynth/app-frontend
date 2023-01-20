import { Box, Flex, Skeleton } from '@chakra-ui/react'
import React from 'react'

export default function SwapSkeleton() {
  return (
    <Box height={"382px"}>
					<Flex
						h={"40%"}
						bg="gray.700"
						align={"center"}
						px={10}
						roundedTop="15"
						justify="space-between"
					>
						<Skeleton
							color={"black"}
							bgColor={"black"}
							height={"50px"}
							width={"250px"}
							rounded={"10"}
						></Skeleton>

						<Box>
							<Skeleton
								mt={4}
								color={"black"}
								bgColor={"black"}
								height={"30px"}
								width={"150px"}
								rounded={"10"}
							></Skeleton>

							<Skeleton
								mt={4}
								color={"black"}
								bgColor={"black"}
								height={"20px"}
								width={"150px"}
								rounded={"10"}
							></Skeleton>
						</Box>
					</Flex>
					<Flex
						flexDir={"column"}
						justify="space-evenly"
						px={10}
						h={"60%"}
						bg="gray.800"
						roundedBottom="15"
					>
						<Flex justify="space-between" align={"center"}>
							<Skeleton
								color={"black"}
								bgColor={"black"}
								height={"50px"}
								width={"250px"}
								rounded={"10"}
							></Skeleton>

							<Box>
								<Skeleton
									mt={4}
									color={"black"}
									bgColor={"black"}
									height={"30px"}
									width={"150px"}
									rounded={"10"}
								></Skeleton>

								<Skeleton
									mt={4}
									color={"black"}
									bgColor={"black"}
									height={"20px"}
									width={"150px"}
									rounded={"10"}
								></Skeleton>
							</Box>
						</Flex>

						<Skeleton
							color={"black"}
							bgColor={"black"}
							height={"60px"}
							width={"100%"}
							rounded={"10"}
						></Skeleton>
					</Flex>
				</Box>
  )
}
