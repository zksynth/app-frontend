import { Box } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import NavLink from "./NavLink";

export default function NavLocalLink ({
	path,
	title,
	children,
	lighten,
	bg = "whiteAlpha.50",
}: any) {
	const router = useRouter();
	return (
		<Link href={{ pathname: path }} >
			<Box>
				<NavLink
					path={path}
					title={title}
					lighten={lighten}
					bg={bg}
				>
					{" "}
					{children}{" "}
				</NavLink>
			</Box>
		</Link>
	);
};