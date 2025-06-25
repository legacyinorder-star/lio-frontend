import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
	{ label: "About Us", to: "/about" },
	{ label: "Our Services", to: "/services" },
	{ label: "Guides & Checklist", to: "/guides" },
	{ label: "Pricing", to: "/pricing" },
	{ label: "Vault", to: "/vault" },
];

export default function Navbar() {
	const { user } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();

	return (
		<nav className="w-full bg-white border-b border-gray-light sticky top-0 z-30 font-sans">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
				{/* Logo */}
				<Link to="/" className="flex items-center gap-2 min-w-[160px]">
					<img
						src="/logos/Original.svg"
						alt="Legacy In Order Logo"
						className="h-12 w-auto"
					/>
				</Link>

				{/* Desktop Nav Links */}
				<div className="hidden md:flex items-center gap-6">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={`text-[#173C37] hover:text-[#173C37] transition-colors font-semibold px-2 py-1 ${
								location.pathname === link.to
									? "underline underline-offset-4"
									: ""
							}`}
							style={{ fontFamily: "TMT Limkin" }}
						>
							{link.label}
						</Link>
					))}
				</div>

				{/* Right Side Buttons */}
				<div className="hidden md:flex items-center gap-3">
					<a
						href="https://calendly.com/" // TODO: Replace with actual scheduling link
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button
							variant="outline"
							className="mr-1 text-[#173C37] border border-[#173C37] font-semibold rounded hover:bg-[#173C37] hover:text-white"
						>
							Schedule a Call
						</Button>
					</a>
					{user ? (
						<Link to="/dashboard">
							<Button
								variant="default"
								className="text-[#173C37] bg-[#173C37] rounded border border-[#173C37] font-semibold"
							>
								Dashboard
							</Button>
						</Link>
					) : (
						<Link to="/login">
							<Button
								variant="default"
								className="text-white bg-[#173C37] rounded border border-[#173C37] font-semibold hover:text-[#173C37]"
							>
								Sign In
							</Button>
						</Link>
					)}
				</div>

				{/* Mobile Hamburger */}
				<button
					className="md:hidden flex items-center justify-center p-2 rounded hover:bg-gray-100 focus:outline-none"
					onClick={() => setMobileOpen((v) => !v)}
					aria-label="Toggle navigation menu"
				>
					{mobileOpen ? (
						<X className="h-6 w-6" />
					) : (
						<Menu className="h-6 w-6" />
					)}
				</button>
			</div>

			{/* Mobile Menu */}
			{mobileOpen && (
				<div className="md:hidden bg-white border-t border-gray-light px-4 pb-6 pt-4 space-y-3 shadow-lg">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={`block text-primary hover:text-primary font-medium py-2 ${
								location.pathname === link.to
									? "underline underline-offset-4"
									: ""
							}`}
							onClick={() => setMobileOpen(false)}
							style={{ fontFamily: "TMT Limkin" }}
						>
							{link.label}
						</Link>
					))}
					<a
						href="https://calendly.com/" // TODO: Replace with actual scheduling link
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button variant="outline" className="w-full mt-2">
							Schedule a Call
						</Button>
					</a>
					{user ? (
						<Link to="/dashboard" onClick={() => setMobileOpen(false)}>
							<Button
								variant="default"
								className="w-full mt-2 text-white bg-[#173C37] rounded border border-[#173C37] font-semibold"
							>
								Dashboard
							</Button>
						</Link>
					) : (
						<Link to="/login" onClick={() => setMobileOpen(false)}>
							<Button
								variant="default"
								className="w-full mt-2 text-white bg-[#173C37] rounded border border-[#173C37] font-semibold hover:text-[#173C37]"
							>
								Sign In
							</Button>
						</Link>
					)}
				</div>
			)}
		</nav>
	);
}
