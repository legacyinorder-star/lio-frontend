import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	LogOut,
	Settings,
	CircleUser,
	UserCog,
	Home,
	FileText,
	HelpCircle,
	MessageCircleQuestion,
	Bell,
	Plus,
	Scroll,
	Shield,
	BookText,
	ChevronDown,
	User,
	Edit,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/custom-dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { type UserDetails } from "@/utils/auth";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { useWill } from "@/context/WillContext";

export function DashboardLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingWill, setIsLoadingWill] = useState(false);
	const { activeWill, setActiveWill } = useWill();

	useEffect(() => {
		// Set a small delay to ensure auth state is properly loaded
		const checkAuthTimer = setTimeout(() => {
			if (!user) {
				toast.error("Please log in to access this page");
				navigate("/login", { state: { from: location } });
				return;
			}

			setUserDetails({
				id: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
				role: user.role,
			});

			setIsLoading(false);
		}, 500); // Short delay to ensure auth context is fully loaded

		return () => clearTimeout(checkAuthTimer);
	}, [user, navigate, location]);

	// Load active will on component mount
	useEffect(() => {
		if (userDetails && !activeWill) {
			loadActiveWill();
		}
	}, [userDetails, activeWill]);

	const loadActiveWill = async () => {
		try {
			setIsLoadingWill(true);
			const { data, error } = await apiClient("/wills/get-user-active-will");

			if (error) {
				console.error("Error loading active will:", error);
				// Don't show error toast for this, just silently fail
				return;
			}

			// Handle both array and single object responses
			const willData = Array.isArray(data) ? data[0] : data;
			if (willData) {
				setActiveWill(willData);
			}
		} catch (error) {
			console.error("Error loading active will:", error);
		} finally {
			setIsLoadingWill(false);
		}
	};

	const sidebarLinks = [
		{
			title: "Home",
			href: "/app/dashboard",
			icon: Home,
		},
		{
			title: "Documents",
			href: "/app/documents",
			icon: FileText,
		},
		{
			title: "My Account",
			href: "/app/manage-profile",
			icon: CircleUser,
		},
		{
			title: "Help & Resources",
			href: "/app/help",
			icon: HelpCircle,
		},
		{
			title: "Logout",
			href: "/logout",
			icon: LogOut,
		},
	];

	const documentTypes = [
		{
			title: "Will",
			href: "/app/create-will",
			icon: Scroll,
			description: activeWill ? "Continue your will" : "Create a will",
		},
		{
			title: "Power of Attorney",
			href: "/app/policies",
			icon: Shield,
			description: "Create a power of attorney",
		},
		{
			title: "Letters of Wishes",
			href: "/app/transaction-history",
			icon: BookText,
			description: "Create a letter of wishes",
		},
	];

	const handleWillAction = () => {
		console.log(activeWill);
		if (activeWill?.id) {
			// Continue existing will
			navigate("/app/create-will");
		} else {
			// Create new will
			navigate("/app/create-will");
		}
	};

	// Show loading state instead of null
	if (isLoading || !userDetails) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
					<p className="text-muted-foreground">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex">
			{/* Sidebar */}
			<aside className="w-64 bg-background border-r border-[#ECECEC] h-screen sticky top-0">
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="p-6 border-b flex justify-center">
						<Link to="/app/dashboard" className="flex items-center">
							<img
								src="/logos/LIO_Logo_Black.svg"
								alt="Legacy In Order"
								className="h-12"
							/>
						</Link>
					</div>

					{/* Navigation Links */}
					<nav className="flex-1 p-4 space-y-1">
						{sidebarLinks.map((link) => (
							<div key={link.href}>
								<Link
									to={link.href}
									className={cn(
										"flex items-center px-4 py-2 text-sm font-[500] rounded-md transition-colors",
										location.pathname === link.href
											? "bg-primary/10 text-[#353A44]"
											: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									)}
								>
									<link.icon className="mr-3 h-5 w-5" />
									{link.title}
								</Link>
							</div>
						))}
					</nav>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<header className="sticky top-0 z-40 border-b bg-background">
					<div className="flex h-16 items-center justify-between px-6">
						<div className="flex items-center space-x-4"></div>

						<div className="flex items-center space-x-4">
							<Button
								variant="ghost"
								size="icon"
								className="relative"
								aria-label="Help & Support"
							>
								<MessageCircleQuestion className="h-5 w-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="relative"
								aria-label="Notifications"
							>
								<Bell className="h-5 w-5" />
								<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
							</Button>
							<DropdownMenu
								onOpenChange={(open) => {
									if (!open) {
										const triggerButton = document.querySelector(
											"[data-create-button]"
										);
										if (triggerButton instanceof HTMLElement) {
											triggerButton.focus();
										}
									}
								}}
							>
								<Button
									variant="default"
									className="bg-light-green hover:bg-light-green/90 text-black cursor-pointer"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										if (!e.currentTarget.getAttribute("data-state")) {
											handleWillAction();
										}
									}}
									disabled={isLoadingWill}
									data-create-button
									aria-expanded={false}
									aria-haspopup="menu"
									aria-controls="create-document-menu"
								>
									{isLoadingWill ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
											Loading...
										</>
									) : (
										<>
											{activeWill ? (
												<>
													<Edit className="mr-2 h-4 w-4" />
													Continue Will
												</>
											) : (
												<>
													<Plus className="mr-2 h-4 w-4" />
													Create Will
												</>
											)}
										</>
									)}
								</Button>
								<DropdownMenuContent
									id="create-document-menu"
									className="w-56 bg-white border border-[#ECECEC] shadow-md"
								>
									<DropdownMenuLabel className="font-medium">
										Create New Document
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{documentTypes.map((doc, index) => (
										<DropdownMenuItem
											key={doc.href}
											asChild
											className="cursor-pointer hover:bg-[#F5F5F5]"
											onSelect={(e) => {
												e.preventDefault();
												e.stopPropagation();
												if (doc.title === "Will") {
													// Close the dropdown first
													const trigger = document.querySelector(
														"[data-create-button]"
													);
													if (trigger instanceof HTMLElement) {
														trigger.click();
													}
													// Then handle will action after a small delay
													setTimeout(() => {
														handleWillAction();
													}, 0);
												} else {
													navigate(doc.href);
												}
											}}
										>
											<Link
												to={doc.href}
												className="flex items-center cursor-pointer"
												role="menuitem"
												tabIndex={0}
												id={`menu-item-${index}`}
											>
												<doc.icon className="mr-2 h-4 w-4" />
												<div className="flex flex-col">
													<span>{doc.title}</span>
													<span className="text-xs text-muted-foreground">
														{doc.description}
													</span>
												</div>
											</Link>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu
								align="end"
								onOpenChange={(open) => {
									if (!open) {
										const triggerButton = document.querySelector(
											"[data-user-menu-trigger]"
										);
										if (triggerButton instanceof HTMLElement) {
											triggerButton.focus();
										}
									}
								}}
							>
								<Button
									variant="ghost"
									className="flex items-center space-x-2 px-2 hover:bg-transparent"
									data-user-menu-trigger
									aria-haspopup="menu"
								>
									<Avatar className="h-4 w-4 bg-black/10">
										<User className="h-4 w-4 text-black" />
									</Avatar>
									<span className="text-sm font-[400]">
										{userDetails.first_name + " " + userDetails.last_name}
									</span>
									<ChevronDown className="h-4 w-4 text-muted-foreground" />
								</Button>
								<DropdownMenuContent
									id="user-menu"
									className="w-56 bg-white border border-[#ECECEC] shadow-md"
								>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">
												{userDetails.first_name + " " + userDetails.last_name}
											</p>
											<p className="text-xs leading-none text-muted-foreground">
												{userDetails.email}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{userDetails.role === "admin" && (
										<>
											<DropdownMenuItem
												asChild
												className="cursor-pointer hover:bg-[#F5F5F5]"
											>
												<Link
													to="/admin/dashboard"
													className="flex items-center"
												>
													<UserCog className="mr-2 h-4 w-4" />
													<span>Admin Dashboard</span>
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
										</>
									)}
									<DropdownMenuItem
										asChild
										className="cursor-pointer hover:bg-[#F5F5F5]"
									>
										<Link to="/app/settings" className="flex items-center">
											<Settings className="mr-2 h-4 w-4" />
											<span>Settings</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem
										asChild
										className="cursor-pointer hover:bg-[#F5F5F5]"
									>
										<Link to="/logout" className="flex items-center">
											<LogOut className="mr-2 h-4 w-4" />
											<span>Logout</span>
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 p-6 overflow-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
