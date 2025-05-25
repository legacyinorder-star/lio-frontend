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
	X,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { type UserDetails } from "@/utils/auth";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { useWill } from "@/context/WillContext";

export function DashboardLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showWillDialog, setShowWillDialog] = useState(false);
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
			description: "Create a will",
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

	const checkActiveWill = async () => {
		try {
			setIsLoadingWill(true);
			const response = await axios.get("/wills/get-user-active-will");
			// Handle both array and single object responses
			const willData = Array.isArray(response.data)
				? response.data[0]
				: response.data;
			if (willData) {
				setActiveWill(willData); // Set in context
				setShowWillDialog(true);
			} else {
				// If no will data found, proceed to create new will
				navigate("/app/create-will");
			}
		} catch (error) {
			console.error("Error checking active will:", error);
			// If there's an error, just proceed to create new will
			navigate("/app/create-will");
		} finally {
			setIsLoadingWill(false);
		}
	};

	const handleCreateWill = () => {
		setShowWillDialog(false);
		setActiveWill(null);
		navigate("/app/create-will");
	};

	const handleContinueWill = () => {
		setShowWillDialog(false);
		if (activeWill?.id) {
			navigate(`/app/edit-will/${activeWill.id}`);
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
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="default"
										className="bg-light-green hover:bg-light-green/90 text-black"
										onClick={(e) => {
											e.preventDefault();
											checkActiveWill();
										}}
										disabled={isLoadingWill}
									>
										{isLoadingWill ? (
											<>
												<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2"></div>
												Loading...
											</>
										) : (
											<>
												<Plus className="mr-2 h-4 w-4" />
												Create
											</>
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-56 bg-white border border-[#ECECEC] shadow-md"
									align="start"
								>
									<DropdownMenuLabel className="font-medium">
										Create New Document
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{documentTypes.map((doc) => (
										<DropdownMenuItem
											key={doc.href}
											asChild
											className="cursor-pointer hover:bg-[#F5F5F5]"
										>
											<Link
												to={doc.href}
												className="flex items-center"
												onClick={(e) => {
													if (doc.title === "Will") {
														e.preventDefault();
														checkActiveWill();
													}
												}}
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

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="flex items-center space-x-2 px-2 hover:bg-transparent"
									>
										<Avatar className="h-4 w-4 bg-black/10">
											<User className="h-4 w-4 text-black" />
										</Avatar>
										<span className="text-sm font-[400]">
											{userDetails.first_name + " " + userDetails.last_name}
										</span>
										<ChevronDown className="h-4 w-4 text-muted-foreground" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-56 bg-white border border-[#ECECEC] shadow-md"
									align="end"
									forceMount
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

				{/* Will Creation Dialog */}
				<AlertDialog open={showWillDialog} onOpenChange={setShowWillDialog}>
					<AlertDialogContent className="bg-white">
						<button
							onClick={() => setShowWillDialog(false)}
							className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</button>
						<AlertDialogHeader>
							<AlertDialogTitle>Active Will Found</AlertDialogTitle>
							<AlertDialogDescription>
								{activeWill ? (
									<>
										You already have an active will that was last updated on{" "}
										{new Date(activeWill.updatedAt).toLocaleDateString()}. Would
										you like to continue editing your existing will or create a
										new one?
									</>
								) : (
									"Would you like to create a new will?"
								)}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							{activeWill && (
								<AlertDialogAction
									onClick={handleContinueWill}
									className="bg-light-green hover:bg-light-green/90 text-black cursor-pointer"
								>
									Continue Existing Will
								</AlertDialogAction>
							)}
							<AlertDialogAction
								onClick={handleCreateWill}
								className="bg-primary hover:bg-primary/90 cursor-pointer"
							>
								Create New Will
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
