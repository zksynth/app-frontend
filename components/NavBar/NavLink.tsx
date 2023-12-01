import { Box, Flex, Heading, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { VARIANT } from "../../styles/theme";

export default function NavLink({
	path,
	title,
	target = "_parent",
	newTab = false,
	children,
	bg = "whiteAlpha.50"
}: any) {
	const [isPath, setIsPath] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Search path
		setIsPath(router.pathname.split("/")[1] == path.split("/")[1]);
	}, [setIsPath, router.pathname, path]);

	const { colorMode } = useColorMode();

	return ( <Flex flexDir={'column'} align='center'>
		<Flex 
			// mb={isPath ? '-2px' : 0} 
			align={"center"}
		>
			<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
				<Flex flexDir={'column'} align={'center'} w={'100%'}>
				<Flex
					align={"center"}
					h={"48px"}
					px={4}
					cursor="pointer"
					flex='stretch'
					color={isPath ? (colorMode == 'dark' ? 'secondary.400' : 'primary.400') : `${colorMode == 'dark' ? 'white' : 'black'}Alpha.600`}
					className={`${VARIANT}-${colorMode}-navLink${isPath ? 'Selected' : ''}`}
					{
						...isPath && {
							borderBottom: '2px',
							borderColor: colorMode == 'dark' ? 'secondary.400' : 'primary.400'
						}
					}
				>
					<Box>
						<Flex align={"center"} gap={2}>
							{children}
							<Heading size={"xs"} fontWeight={'semibold'}>{title}</Heading>
						</Flex>
					</Box>
				</Flex>
		</Flex>
			</motion.div>
		</Flex>
			{/* {isPath && <Box w='70%' h={'2px'} rounded='0' bg='secondary.400'></Box>} */}
		</Flex>
	);
};
