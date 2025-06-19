import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	LogOut,
	Users,
	BookText,
	FileText,
	ArrowLeft,
	Search,
	Bell,
	ChevronDown,
	House,
	BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout, isLoading } = useAuth();
	const [isAuthLoading, setIsAuthLoading] = useState(true);

	useEffect(() => {
		// Only check auth once loading is complete
		if (!isLoading) {
			if (!user) {
				toast.error("Please log in to access the admin area");
				navigate("/login", { state: { from: location } });
				return;
			}

			// Check if user has admin role
			if (user.role !== "admin") {
				toast.error("You need administrator privileges to access this area");
				navigate("/app/dashboard");
				return;
			}

			setIsAuthLoading(false);
		}
	}, [user, isLoading, navigate]);

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const navItems = [
		{
			title: "Home",
			icon: <House className="h-5 w-5" />,
			href: "/admin/dashboard",
		},
		{
			title: "Users",
			icon: <Users className="h-5 w-5" />,
			href: "/admin/users",
		},
		{
			title: "Documents",
			icon: <FileText className="h-5 w-5" />,
			href: "/admin/documents",
		},
		{
			title: "Transactions",
			icon: <BookText className="h-5 w-5" />,
			href: "/admin/transactions",
		},
		{
			title: "Reports & Analytics",
			icon: <BarChart3 className="h-5 w-5" />,
			href: "/admin/reports",
		},
		{
			title: "Back to User View",
			icon: <ArrowLeft className="h-5 w-5" />,
			href: "/app/dashboard",
		},
	];

	// Show loading state instead of null
	if (isAuthLoading || !user) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
					<p className="text-muted-foreground">Loading admin dashboard...</p>
				</div>
			</div>
		);
	}

	// At this point we know user exists and has admin role
	const userFirstName = user.first_name || "";
	const userLastName = user.last_name || "";
	const fullName = `${userFirstName} ${userLastName}`.trim();

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar */}
			<aside className="w-64 border-r bg-[#083402] pt-8">
				<div className="flex h-16 items-center justify-center px-6">
					<Link
						to="/admin/dashboard"
						className="flex items-center justify-center w-full"
					>
						<img
							src="/logos/LIO_Logo_White.svg"
							alt="Legacy In Order"
							className="h-12"
						/>
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex flex-col gap-1 p-4 pt-[40px]">
					{navItems.map((item) => (
						<Link
							key={item.href}
							to={item.href}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-[0.875rem] font-medium transition-colors hover:bg-white/10",
								location.pathname === item.href
									? "bg-white/10 text-white font-[500]"
									: "text-white/70 hover:text-white font-[500]"
							)}
						>
							{item.icon}
							{item.title}
						</Link>
					))}
				</nav>
			</aside>

			{/* Main content */}
			<div className="flex-1 flex flex-col pt-2">
				{/* Header */}
				<header className="h-16 border-b border-[#ECECEC] bg-white flex items-center px-6 justify-between pb-1.5">
					{/* Search */}
					<div className="flex-1 max-w-md">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#929292]" />
							<Input
								type="search"
								placeholder="Search..."
								className="pl-9 bg-[#F3F3F3] border-none focus-visible:ring-0 h-10"
							/>
						</div>
					</div>

					{/* Right side items */}
					<div className="flex items-center gap-4">
						{/* Notifications */}
						<Button
							variant="ghost"
							size="icon"
							className="relative"
							onClick={() => {
								// Handle notifications click
								toast.info("Notifications coming soon!");
							}}
						>
							<Bell className="h-5 w-5" />
							<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
						</Button>

						{/* User dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex items-center gap-2 border-none px-2 hover:bg-muted/50"
								>
									<Avatar className="h-8 w-8">
										<AvatarFallback
											className="bg-[#083402] text-white"
											initials={getInitials(fullName)}
										/>
									</Avatar>
									<div className="flex flex-col items-start">
										<span className="text-sm font-medium leading-none">
											{fullName}
										</span>
										<span className="text-xs text-muted-foreground">Admin</span>
									</div>
									<ChevronDown className="h-4 w-4 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56 bg-white" align="end">
								<DropdownMenuLabel>My Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => navigate("/admin/profile")}
									className="cursor-pointer"
								>
									Profile
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => navigate("/admin/settings")}
									className="cursor-pointer"
								>
									Settings
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="cursor-pointer text-red-600 focus:text-red-600"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>

				{/* Main content */}
				<main className="flex-1 overflow-auto">
					<div className="p-6 pt-6">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
