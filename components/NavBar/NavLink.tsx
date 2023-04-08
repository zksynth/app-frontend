import { Box, Flex, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function NavLink({
	path,
	title,
	target = "_parent",
	newTab = false,
	children,
	bg = "whiteAlpha.50",

}: any) {
	const [isPath, setIsPath] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// search path
		setIsPath(path == router.pathname);
	}, [setIsPath, router.pathname, path]);

	return (
		<Flex align={"center"}>
			<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<Flex
					align={"center"}
					h={"38px"}
					px={4}
					cursor="pointer"
					rounded={100}
					bgColor={isPath ? "whiteAlpha.100" : bg}
					_hover={{
						bgColor: !isPath ? "whiteAlpha.200" : "whiteAlpha.100",
						shadow: "md",
					}}
					shadow={isPath ? "md" : "none"}
					border="2px"
					borderColor={"whiteAlpha.50"}
				>
					<Box
						color={isPath ? "primary.400" : "gray.100"}
						fontFamily="Roboto"
						fontWeight={"bold"}
						fontSize="sm"
					>
						<Flex align={"center"} gap={2}>
							{children}
							<Heading size={"xs"}>{title}</Heading>
						</Flex>
					</Box>
				</Flex>
			</motion.div>
		</Flex>
	);
};