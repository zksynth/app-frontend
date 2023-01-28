import { Alert, AlertIcon, Box, Text, Link } from "@chakra-ui/react";
import React, { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";

export default function Response({response, message, hash, confirmed}: any) {

    const { chain, explorer } = useContext(AppDataContext);

	return (
		<>
			{response && (
				<Box width={"100%"} mt={2} mb={-2}>
					<Alert
						status={
							response.includes("confirm")
								? "info"
								: confirmed && response.includes("Success")
								? "success"
								: "error"
						}
						variant="top-accent"
						rounded={16}
						
					>
						<AlertIcon />
						<Box>
							<Text fontSize="md" mb={0}>
								{response}
							</Text>
							<Text fontSize="xs" mt={0}>
								{message.slice(0, 100)}
							</Text>
							{hash && (
								<Link href={explorer() + hash} target="_blank">
									{" "}
									<Text fontSize={"xs"}>
										View on explorer
									</Text>
								</Link>
							)}
						</Box>
					</Alert>
				</Box>
			)}
		</>
	);
}
