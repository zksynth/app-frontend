import { Alert, AlertIcon, Box, Text } from "@chakra-ui/react";
import Link from "next/link";
import React, { useContext } from "react";
import { chainMapping } from "../../../src/chains";
import { AppDataContext } from "../../context/AppDataProvider";

export default function Response({response, message, hash, confirmed}: any) {

    const { chain } = useContext(AppDataContext);

	return (
		<>
			{response && (
				<Link href={chainMapping[chain]?.blockExplorers.default.url + "tx/" + hash} target="_blank">
				<Box width={"100%"} mt={4} mb={0}>
					<Alert
						status={
							message.includes("Confirm")
								? "info"
								: confirmed && message.includes("Success")
								? "success"
								: "error"
						}
						variant="top-accent"
						rounded={16}
						
					>
						<AlertIcon />
						<Box>
							<Text fontSize="md" mb={0.5}>
								{response}
							</Text>
							<Text fontSize="xs" mt={0}>
								{message.slice(0, 100)}
							</Text>
						</Box>
					</Alert>
				</Box>
				</Link>
			)}
		</>
	);
}
