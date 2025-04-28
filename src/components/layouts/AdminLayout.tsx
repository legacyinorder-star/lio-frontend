import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	LogOut,
	Users,
	BookText,
	LayoutDashboard,
	ShoppingCart,
	ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AdminLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Set a small delay to ensure auth state is properly loaded
		const checkAuthTimer = setTimeout(() => {
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

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const navItems = [
		{
			title: "Dashboard",
			icon: <LayoutDashboard className="h-5 w-5" />,
			href: "/admin/dashboard",
		},
		{
			title: "Users",
			icon: <Users className="h-5 w-5" />,
			href: "/admin/users",
		},
		{
			title: "Orders",
			icon: <ShoppingCart className="h-5 w-5" />,
			href: "/admin/orders",
		},
		{
			title: "Transactions",
			icon: <BookText className="h-5 w-5" />,
			href: "/admin/transactions",
		},
		{
			title: "Back to User View",
			icon: <ArrowLeft className="h-5 w-5" />,
			href: "/app/dashboard",
		},
	];

	// Show loading state instead of null
	if (isLoading || !user) {
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
			<aside className="w-64 border-r bg-card">
				<div className="flex h-16 items-center border-b px-6">
					<Link to="/admin/dashboard" className="flex items-center space-x-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6"
						>
							<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
						</svg>
						<span className="font-semibold">Admin Panel</span>
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex flex-col gap-1 p-4">
					{navItems.map((item) => (
						<Link
							key={item.href}
							to={item.href}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
								location.pathname === item.href
									? "bg-accent text-accent-foreground"
									: "text-muted-foreground"
							)}
						>
							{item.icon}
							{item.title}
						</Link>
					))}
				</nav>

				{/* User profile & logout */}
				<div className="mt-auto p-4 border-t">
					<div className="flex items-center gap-3 mb-4">
						<Avatar className="h-9 w-9">
							<AvatarFallback initials={getInitials(fullName)} />
						</Avatar>
						<div className="space-y-0.5">
							<p className="text-sm font-medium leading-none">{fullName}</p>
							<p className="text-xs text-muted-foreground">Admin</p>
						</div>
					</div>
					<Button
						variant="outline"
						className="w-full justify-start"
						onClick={handleLogout}
					>
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>
			</aside>

			{/* Main content */}
			<main className="flex-1 overflow-auto">
				<div className="p-6">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
