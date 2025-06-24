import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
	{ label: "About Us", to: "/about" },
	{ label: "Our Services", to: "/services" },
	{ label: "Guides & Checklist", to: "/guides" },
	{ label: "Pricing", to: "/pricing" },
	{ label: "Vault", to: "/vault" },
];

export default function Navbar() {
	const { isAuthenticated } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();

	return (
		<nav className="w-full bg-white border-b border-gray-light sticky top-0 z-30 font-sans">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
				{/* Logo */}
				<Link to="/" className="flex items-center gap-2 min-w-[160px]">
					<img
						src="/logos/LIO_Logo_Color.svg"
						alt="Legacy In Order Logo"
						className="h-10 w-auto"
						style={{ fontFamily: "TMT Limkin" }}
					/>
				</Link>

				{/* Desktop Nav Links */}
				<div className="hidden md:flex items-center gap-6">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={`text-secondary hover:text-primary transition-colors font-medium px-2 py-1 rounded ${
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
						className="bg-primary text-white px-4 py-2 rounded font-semibold shadow hover:bg-primary/90 transition-colors"
						style={{ fontFamily: "TMT Limkin" }}
					>
						Schedule a Call
					</a>
					{isAuthenticated ? (
						<Link
							to="/dashboard"
							className="bg-secondary text-white px-4 py-2 rounded font-semibold hover:bg-secondary/90 transition-colors"
							style={{ fontFamily: "TMT Limkin" }}
						>
							Dashboard
						</Link>
					) : (
						<Link
							to="/login"
							className="bg-white border border-primary text-primary px-4 py-2 rounded font-semibold hover:bg-primary hover:text-white transition-colors"
							style={{ fontFamily: "TMT Limkin" }}
						>
							Sign In
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
				<div className="md:hidden bg-white border-t border-gray-light px-4 pb-4 pt-2 space-y-2 shadow-lg">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={`block text-secondary hover:text-primary font-medium py-2 ${
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
						className="block bg-primary text-white px-4 py-2 rounded font-semibold mt-2 text-center"
						style={{ fontFamily: "TMT Limkin" }}
					>
						Schedule a Call
					</a>
					{isAuthenticated ? (
						<Link
							to="/dashboard"
							className="block bg-secondary text-white px-4 py-2 rounded font-semibold mt-2 text-center"
							onClick={() => setMobileOpen(false)}
							style={{ fontFamily: "TMT Limkin" }}
						>
							Dashboard
						</Link>
					) : (
						<Link
							to="/login"
							className="block bg-white border border-primary text-primary px-4 py-2 rounded font-semibold mt-2 text-center"
							onClick={() => setMobileOpen(false)}
							style={{ fontFamily: "TMT Limkin" }}
						>
							Sign In
						</Link>
					)}
				</div>
			)}
		</nav>
	);
}
