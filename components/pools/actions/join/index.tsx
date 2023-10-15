import React from "react";
import {
	Box,
	Divider,
	Flex,
	Heading,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	useColorMode,
} from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import ProportionalJoin from "./Proportional";
import SingleTokenJoin from "./SingleToken";
import { VARIANT } from "../../../../styles/theme";

export default function Join({ pool, isOpen, onClose }: any) {
	
	const { colorMode } = useColorMode();

	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose}>
			<ModalOverlay bg='blackAlpha.800' backdropFilter='blur(10px)' />
			<ModalContent w={"30rem"} bgColor="transparent" shadow={0} rounded={0} mx={2}>
				<Box className={`${VARIANT}-${colorMode}-containerBody2`}>
				<ModalCloseButton rounded={"0"} mt={1} />
				<ModalHeader>
					<Flex justify={"start"} px={3} gap={2} pt={1} align={"center"}>
						<Flex ml={-2}>
							{pool.tokens.map((token: any, index: number) => {
								return (
									pool.address !== token.token.id && (
										<Flex
											ml={"-2"}
											key={index}
											align="center"
											gap={2}
										>
											<Image
												rounded={"full"}
												src={`/icons/${token.token.symbol}.svg`}
												alt=""
												width={"30px"}
											/>
										</Flex>
									)
								);
							})}
						</Flex>
						<Heading fontSize={'22px'} fontWeight={'bold'}>{pool.symbol}</Heading>
					</Flex>
				</ModalHeader>
				<ModalBody p={0} m={0}>
					<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 
					<Tabs variant={'enclosed'} size={"sm"} isFitted colorScheme="secondary">
						<TabList>
							<Tab border={0} py={2}>Single Token</Tab>
							<Divider orientation="vertical" h={'44px'} borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
							<Tab border={0} py={2}>Pool Tokens</Tab>
						</TabList>

						<TabPanels>
							<TabPanel p={0}>
								<SingleTokenJoin pool={pool} onClose={onClose} />
							</TabPanel>
							<TabPanel p={0}>
								<ProportionalJoin pool={pool} onClose={onClose} />
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>
				</Box>
			</ModalContent>
		</Modal>
	);
}
