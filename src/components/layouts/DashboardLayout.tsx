import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	LogOut,
	Settings,
	UserCog,
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
import { mapWillDataFromAPI } from "../../utils/dataTransform";
import { useWillWizard } from "@/context/WillWizardContext";
import { WillWizardSidebar } from "@/components/ui/will-wizard-sidebar";
// import { SessionStatus } from "@/components/ui/session-status";

export function DashboardLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, isLoading } = useAuth();
	const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
	const [isLoadingWill, setIsLoadingWill] = useState(false);
	const { activeWill, setActiveWill } = useWill();
	const { isInWillWizard, currentStep, getStepInfo } = useWillWizard();

	useEffect(() => {
		// Only check auth once loading is complete
		if (!isLoading) {
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
		}
	}, [user, isLoading, navigate, location]);

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
				return;
			}

			// Handle both array and single object responses
			const willData = Array.isArray(data) ? data[0] : data;
			if (willData) {
				// Transform API data to camelCase format
				const transformedWillData = mapWillDataFromAPI(willData);
				setActiveWill(transformedWillData);
			}
		} catch (error) {
			console.error("Error loading active will:", error);
		} finally {
			setIsLoadingWill(false);
		}
	};

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
		<div className="min-h-screen flex flex-col px-0 sm:px-4">
			{/* Header */}
			<header className="sticky top-0 z-40 border-b bg-background">
				<div className="flex h-16 items-center justify-between px-4 sm:px-7">
					<div className="flex items-center space-x-4 sm:space-x-8 lg:space-x-20">
						{/* Logo */}
						<Link to="/" className="flex items-center flex-shrink-0">
							<img
								src="/logos/Original.svg"
								alt="Legacy In Order"
								className="h-8 sm:h-10"
							/>
						</Link>

						{/* Navigation Links - Hidden on mobile */}
						<nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
							<Link
								to="/app/dashboard"
								className={cn(
									"flex items-center space-x-2 text-sm font-[500] transition-colors",
									location.pathname === "/app/dashboard"
										? "text-primary"
										: "text-muted-foreground hover:text-primary"
								)}
							>
								<img
									src="/svgs/dashboard_icons/home.svg"
									alt="Home"
									className="h-4 w-4"
								/>
								<span className="pt-1">Home</span>
							</Link>
							<Link
								to="/app/documents"
								className={cn(
									"flex items-center space-x-2 text-sm font-[500] transition-colors",
									location.pathname === "/app/documents"
										? "text-primary"
										: "text-muted-foreground hover:text-primary"
								)}
							>
								<img
									src="/svgs/dashboard_icons/documents.svg"
									alt="Documents"
									className="h-4 w-4"
								/>
								<span className="pt-1">Documents</span>
							</Link>
							<Link
								to="/app/vault"
								className={cn(
									"flex items-center space-x-2 text-sm font-[500] transition-colors",
									location.pathname === "/app/vault"
										? "text-primary"
										: "text-muted-foreground hover:text-primary"
								)}
							>
								<img
									src="/svgs/dashboard_icons/vault.svg"
									alt="Vault"
									className="h-4 w-4"
								/>
								<span className="pt-1">My Vault</span>
							</Link>
						</nav>
					</div>

					<div className="flex items-center space-x-2 sm:space-x-4">
						{/* {userDetails.role === "admin" && (
							<SessionStatus showInDropdown compact />
						)} */}
						{/* Help & Notifications - Hidden on small mobile, visible on sm+ */}
						<div className="hidden sm:flex items-center space-x-2">
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
						</div>
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
								className="bg-primary hover:bg-primary/90 text-white cursor-pointer text-sm px-3 sm:px-4"
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
										<span className="hidden sm:inline">Loading...</span>
									</>
								) : (
									<>
										{activeWill ? (
											<>
												<Edit className="mr-1 sm:mr-2 h-4 w-4" />
												<span className="hidden sm:inline">Continue Will</span>
												<span className="sm:hidden">Continue</span>
											</>
										) : (
											<>
												<Plus className="mr-1 sm:mr-2 h-4 w-4" />
												<span className="hidden sm:inline">Create Will</span>
												<span className="sm:hidden">Create</span>
											</>
										)}
									</>
								)}
							</Button>
							<DropdownMenuContent
								id="create-document-menu"
								className="w-48 sm:w-56 bg-white border border-[#ECECEC] shadow-md max-w-[calc(100vw-2rem)]"
								align="end"
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
								className="flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2 hover:bg-transparent"
								data-user-menu-trigger
								aria-haspopup="menu"
							>
								<Avatar className="h-4 w-4 bg-black/10">
									<User className="h-4 w-4 text-black" />
								</Avatar>
								<span className="text-sm font-[400] hidden sm:inline">
									{userDetails.first_name + " " + userDetails.last_name}
								</span>
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							</Button>
							<DropdownMenuContent
								id="user-menu"
								className="w-48 sm:w-56 bg-white border border-[#ECECEC] shadow-md max-w-[calc(100vw-2rem)] absolute right-0"
								align="end"
							>
								{/* Mobile Navigation Links - Only visible on mobile */}
								<div className="md:hidden">
									<DropdownMenuLabel className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
										Navigation
									</DropdownMenuLabel>
									<DropdownMenuItem
										asChild
										className="cursor-pointer hover:bg-[#F5F5F5]"
									>
										<Link to="/app/dashboard" className="flex items-center">
											<img
												src="/svgs/dashboard_icons/home.svg"
												alt="Home"
												className="mr-2 h-4 w-4"
											/>
											<span>Home</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem
										asChild
										className="cursor-pointer hover:bg-[#F5F5F5]"
									>
										<Link to="/app/documents" className="flex items-center">
											<img
												src="/svgs/dashboard_icons/documents.svg"
												alt="Documents"
												className="mr-2 h-4 w-4"
											/>
											<span>Documents</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem
										asChild
										className="cursor-pointer hover:bg-[#F5F5F5]"
									>
										<Link to="/app/vault" className="flex items-center">
											<img
												src="/svgs/dashboard_icons/vault.svg"
												alt="Vault"
												className="mr-2 h-4 w-4"
											/>
											<span>My Vault</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
								</div>

								{/* <DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{userDetails.first_name + " " + userDetails.last_name}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											{userDetails.email}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator /> */}
								{userDetails.role === "admin" && (
									<>
										<DropdownMenuItem
											asChild
											className="cursor-pointer hover:bg-[#F5F5F5]"
										>
											<Link to="/admin/dashboard" className="flex items-center">
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

			{/* HR Separator */}
			<hr className="border-gray-200" />

			{/* Will Wizard Step Indicator */}
			{isInWillWizard && currentStep && (
				<div
					className="w-full max-w-[2000px] mt-[0.15rem] py-4 sm:py-6 px-4 text-left text-xs sm:text-sm font-medium text-[#173C37]"
					style={{ backgroundColor: "#DFF2EB" }}
				>
					{(() => {
						const stepInfo = getStepInfo(currentStep);
						return (
							<>
								<span className="hidden sm:inline">
									Section {stepInfo.number} of 13: {stepInfo.name}
								</span>
								<span className="sm:hidden">
									{stepInfo.number}/13: {stepInfo.name}
								</span>
							</>
						);
					})()}
				</div>
			)}

			{/* Page Content */}
			{isInWillWizard ? (
				<div className="flex-1 flex overflow-hidden">
					<div className="hidden lg:block">
						<WillWizardSidebar />
					</div>
					<main className="flex-1 p-4 sm:p-6 overflow-auto">
						<Outlet />
					</main>
				</div>
			) : (
				<main className="flex-1 p-4 sm:p-6 overflow-auto">
					<Outlet />
				</main>
			)}
		</div>
	);
}
