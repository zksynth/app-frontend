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
	Text,
	useColorMode,
} from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import ProportionalWithdraw from "./Proportional";
import SingleTokenWithdraw from "./SingleToken";
import { VARIANT } from "../../../../styles/theme";

export default function Withdraw({ pool, isOpen, onClose }: any) {
	const { colorMode } = useColorMode();

	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose}>
			<ModalOverlay bg='blackAlpha.800' backdropFilter='blur(10px)' />
			<ModalContent width={"30rem"} bgColor="transparent" rounded={0} mx={2}>
			<Box className={`${VARIANT}-${colorMode}-containerBody2`}>
				<ModalCloseButton rounded={"0"} mt={1} />
				<ModalHeader>
					<Flex justify={"center"} gap={2} pt={1} align={"center"}>
						<Flex ml={-4}>
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
				<ModalBody p={0}>
					<Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 
					<Tabs variant={'enclosed'} size={"sm"} isFitted colorScheme="secondary">
						<TabList>
							<Tab border={0} py={2}>Single Token</Tab>
							<Divider orientation="vertical" h={'44px'} borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} />
							<Tab border={0} py={2}>Pool Tokens</Tab>
						</TabList>

						<TabPanels>
							<TabPanel p={0}>
								<SingleTokenWithdraw pool={pool} onClose={onClose} />
							</TabPanel>
							<TabPanel p={0}>
								<ProportionalWithdraw pool={pool} onClose={onClose} />
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>
			</Box>
			</ModalContent>
		</Modal>
	);
}
