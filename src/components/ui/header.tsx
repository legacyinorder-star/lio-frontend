import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
	return (
		<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center justify-between">
				<div className="mr-4 flex">
					<Link to="/" className="flex items-center">
						<span className="text-xl font-semibold">Legacy In Order</span>
					</Link>
				</div>
				<nav className="hidden md:flex items-center gap-6">
					<Link
						to="#features"
						className="text-sm font-medium hover:underline underline-offset-4"
					>
						Features
					</Link>
					<Link
						to="#pricing"
						className="text-sm font-medium hover:underline underline-offset-4"
					>
						Pricing
					</Link>
					<Link
						to="#about"
						className="text-sm font-medium hover:underline underline-offset-4"
					>
						About
					</Link>
				</nav>
				<div className="flex items-center gap-4">
					<Button asChild variant="ghost" size="sm">
						<Link to="/login">Log In</Link>
					</Button>
					<Button asChild size="sm">
						<Link to="/signup">Sign Up</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
