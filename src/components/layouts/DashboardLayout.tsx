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
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { type UserDetails } from "@/utils/auth";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export function DashboardLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);

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

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
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
								className="h-8"
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
					<div className="flex h-16 items-center justify-end px-6">
						<div className="flex items-center space-x-2">
							{userDetails.role === "admin" && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link to="/admin/dashboard">
												<div className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center cursor-pointer">
													<UserCog className="h-4 w-4 text-primary" />
												</div>
											</Link>
										</TooltipTrigger>
										<TooltipContent>
											<p>Admin Dashboard</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full hover:bg-primary/10"
									>
										<Avatar className="h-8 w-8">
											<AvatarFallback
												initials={getInitials(
													userDetails.first_name + " " + userDetails.last_name
												)}
											/>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
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
											<DropdownMenuItem asChild>
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
									<DropdownMenuItem asChild>
										<Link to="/app/settings" className="flex items-center">
											<Settings className="mr-2 h-4 w-4" />
											<span>Settings</span>
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
