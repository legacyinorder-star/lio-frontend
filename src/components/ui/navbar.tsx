import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_LINKS = [
	{ label: "Home", to: "/", exists: true },
	{ label: "Wills", to: "/will-information", exists: true },
	{ label: "Letter of Wishes", to: "/letter-of-wishes", exists: true },
	{ label: "Pricing", to: "/pricing", exists: false },
	{ label: "About Us", to: "/about-us", exists: true },
	{ label: "Guides & Checklist", to: "#", exists: false },
	{ label: "Pricing", to: "#", exists: false },
];

export default function Navbar() {
	const { user } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();

	return (
		<TooltipProvider>
			<nav className="w-full bg-white border-b border-gray-light sticky top-0 z-30 font-sans">
				<div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2 min-w-[160px]">
						<img
							src="/logos/Logo_Colored.png"
							alt="Legacy In Order Logo"
							className="h-12 w-auto"
						/>
					</Link>

					{/* Desktop Nav Links */}
					<div className="hidden md:flex items-center gap-6">
						{/* Remaining Nav Links */}
						{NAV_LINKS.map((link) =>
							link.exists ? (
								<Link
									key={link.label}
									to={link.to}
									className={`text-[#173C37] hover:text-[#173C37] transition-colors font-semibold px-2 py-1 text-[0.875rem] font-[600] ${
										location.pathname === link.to
											? "underline underline-offset-4"
											: ""
									}`}
									style={{ fontFamily: "TMT Limkin" }}
								>
									{link.label}
								</Link>
							) : (
								""
							)
						)}
					</div>

					{/* Right Side Buttons */}
					<div className="hidden md:flex items-center gap-3">
						<a
							href="https://calendly.com/legacyinorder/new-meeting"
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
							<Link to="/app/dashboard">
								<Button
									variant="default"
									className="text-white bg-[#173C37] rounded border border-[#173C37] font-semibold hover:bg-[#173C37]/90"
								>
									Go to Dashboard
								</Button>
							</Link>
						) : (
							<Link to="/login">
								<Button
									variant="default"
									className="text-white bg-[#173C37] rounded border border-[#173C37] font-semibold hover:bg-[#173C37]/90"
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
						{/* Remaining Nav Links */}
						{NAV_LINKS.slice(1).map((link) =>
							link.exists ? (
								<Link
									key={link.label}
									to={link.to}
									className={`block text-primary hover:text-primary font-medium py-2 text-[0.875rem] font-[600] ${
										location.pathname === link.to
											? "underline underline-offset-4"
											: ""
									}`}
									onClick={() => setMobileOpen(false)}
									style={{ fontFamily: "TMT Limkin" }}
								>
									{link.label}
								</Link>
							) : (
								<Tooltip key={link.label}>
									<TooltipTrigger asChild>
										<span
											className="block text-primary hover:text-primary font-medium py-2 text-[0.875rem] font-[600] cursor-pointer"
											style={{ fontFamily: "TMT Limkin" }}
										>
											{link.label}
										</span>
									</TooltipTrigger>
									<TooltipContent className="bg-white border border-gray-200 shadow-md">
										<div className="flex items-center gap-2">
											<Wrench className="h-4 w-4 text-orange-500" />
											<p>Coming Soon</p>
										</div>
									</TooltipContent>
								</Tooltip>
							)
						)}
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
							<Link to="/app/dashboard" onClick={() => setMobileOpen(false)}>
								<Button
									variant="default"
									className="w-full mt-2 text-white bg-[#173C37] rounded border border-[#173C37] font-semibold hover:text-[#173C37]"
								>
									Go to Dashboard
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
		</TooltipProvider>
	);
}
