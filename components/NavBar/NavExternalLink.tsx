import Link from "next/link";
import { useEffect, useState } from "react";
import NavLink from "./NavLink";

export default function NavExternalLink ({ path, title, pathname, children, lighten }: any) {
	const [isPath, setIsPath] = useState(false);

	useEffect(() => {
		setIsPath(pathname == path);
	}, [setIsPath, pathname, path]);

	return (
		<Link
			href={`${path}`}
			as={`${path}`}
			target={"_blank"}
			rel="noreferrer"
		>
			<NavLink
				path={path}
				title={title}
				pathname={pathname}
				lighten={lighten}
			>
				{" "}
				{children}{" "}
			</NavLink>
		</Link>
	);
};