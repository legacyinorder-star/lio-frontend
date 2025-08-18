import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronDown, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/custom-dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_LINKS = [
	{ label: "About Us", to: "/about-us", exists: true },
	{ label: "Guides & Checklist", to: "#", exists: false },
	{ label: "Pricing", to: "#", exists: false },
	// { label: "Vault", to: "#", exists: false },
];

const SERVICES_LINKS = [
	{ label: "Wills", to: "/will-information", exists: true },
	{ label: "Power of Attorney", to: "/power-of-attorney", exists: true },
	{ label: "Letter of Wishes", to: "#", exists: false },
];

export default function Navbar() {
	const { user } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();

	return (
		<TooltipProvider>
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
						{/* About Us */}
						<Link
							to="/about-us"
							className={`text-[#173C37] hover:text-[#173C37] transition-colors font-semibold px-2 py-1 text-[0.875rem] font-[600] ${
								location.pathname === "/about-us"
									? "underline underline-offset-4"
									: ""
							}`}
							style={{ fontFamily: "TMT Limkin" }}
						>
							About Us
						</Link>

						{/* Our Services Dropdown */}
						<DropdownMenu>
							<Button
								variant="ghost"
								className="text-[#173C37] hover:text-[#173C37] transition-colors font-semibold px-2 py-1 text-[0.875rem] font-[600] h-auto p-0 hover:bg-transparent flex items-center gap-1"
								style={{ fontFamily: "TMT Limkin" }}
								aria-haspopup="menu"
							>
								Our Services
								<ChevronDown className="h-4 w-4" />
							</Button>
							<DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-md">
								{SERVICES_LINKS.map((service) =>
									service.exists ? (
										<DropdownMenuItem
											key={service.label}
											asChild
											className="cursor-pointer hover:bg-gray-50"
										>
											<Link
												to={service.to}
												className="flex items-center w-full px-2 py-2 text-sm text-[#173C37] font-medium"
												style={{ fontFamily: "TMT Limkin" }}
											>
												{service.label}
											</Link>
										</DropdownMenuItem>
									) : (
										<Tooltip key={service.label}>
											<TooltipTrigger asChild>
												<div className="cursor-pointer hover:bg-gray-50 px-2 py-2">
													<span
														className="flex items-center w-full text-sm text-[#173C37] font-medium"
														style={{ fontFamily: "TMT Limkin" }}
													>
														{service.label}
													</span>
												</div>
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
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Remaining Nav Links */}
						{NAV_LINKS.slice(1).map((link) =>
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
								<Tooltip key={link.label}>
									<TooltipTrigger asChild>
										<span
											className="text-[#173C37] hover:text-[#173C37] transition-colors font-semibold px-2 py-1 text-[0.875rem] font-[600] cursor-pointer"
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
						{/* About Us */}
						<Link
							to="/about-us"
							className={`block text-primary hover:text-primary font-medium py-2 text-[0.875rem] font-[600] ${
								location.pathname === "/about-us"
									? "underline underline-offset-4"
									: ""
							}`}
							onClick={() => setMobileOpen(false)}
							style={{ fontFamily: "TMT Limkin" }}
						>
							About Us
						</Link>

						{/* Our Services Section for Mobile */}
						<div>
							<div
								className="text-[#173C37] font-semibold text-[0.875rem] font-[600] py-2"
								style={{ fontFamily: "TMT Limkin" }}
							>
								Our Services
							</div>
							{SERVICES_LINKS.map((service) =>
								service.exists ? (
									<Link
										key={service.label}
										to={service.to}
										className="block text-[#173C37] hover:text-[#173C37] font-medium py-2 pl-4 text-[0.875rem] font-[500]"
										onClick={() => setMobileOpen(false)}
										style={{ fontFamily: "TMT Limkin" }}
									>
										{service.label}
									</Link>
								) : (
									<Tooltip key={service.label}>
										<TooltipTrigger asChild>
											<span
												className="block text-[#173C37] hover:text-[#173C37] font-medium py-2 pl-4 text-[0.875rem] font-[500] cursor-pointer"
												style={{ fontFamily: "TMT Limkin" }}
											>
												{service.label}
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
						</div>

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
