import { Alert, AlertIcon, Box, Text } from "@chakra-ui/react";
import Link from "next/link";
import React, { useContext } from "react";
import { useNetwork } from 'wagmi';

const FAILED_MESSAGES: any = {
	"max fee per gas less than block base fee": "Insufficient gas fee. Please try again with a higher gas fee.",
}

const parseMessage = (message: string) => {
	const failedMessage = Object.keys(FAILED_MESSAGES).find((key) => message.includes(key))
	return failedMessage ? FAILED_MESSAGES[failedMessage] : message.slice(0, 100)
}

export default function Response({response, message, hash, confirmed}: any) {

    const { chain } = useNetwork();

	const status = () => {
		return message.includes("Confirm")
		? "info"
		: confirmed && message.includes("Success")
		? "success"
		: "error"
	}

	return (
		<>
			{response && (
				<Link href={chain?.blockExplorers?.default.url + "/tx/" + hash} target="_blank">
				<Box width={"100%"} mt={4} mb={0}>
					<Alert
						status={status()}
						variant="top-accent"
						rounded={16}
						
					>
						<AlertIcon />
						<Box>
							<Text fontSize="md" mb={0.5}>
								{response}
							</Text>
							<Text fontSize="xs" mt={0}>
								{parseMessage(message)}
							</Text>
						</Box>
					</Alert>
				</Box>
				</Link>
			)}
		</>
	);
}
