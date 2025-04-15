import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Users, BookText, LayoutDashboard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AdminLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, setUser } = useAuth();

	// useEffect(() => {
	// 	if (!user) {
	// 		navigate("/login");
	// 		return;
	// 	}

	// 	// Check if user has admin role - this is a simple example
	// 	// In a real app, you'd have proper role checking
	// 	if (!user.isAdmin) {
	// 		navigate("/app/dashboard");
	// 	}
	// }, [user, navigate]);

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const handleLogout = () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("userDetails");
		setUser(null);
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
			title: "Purchases",
			icon: <BookText className="h-5 w-5" />,
			href: "/admin/settings",
		},
		{
			title: "Permissions",
			icon: <Shield className="h-5 w-5" />,
			href: "/admin/permissions",
		},
	];

	if (!user) {
		return null; // Loading state
	}

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
							<AvatarFallback
								initials={getInitials(user.first_name + " " + user.last_name)}
							/>
						</Avatar>
						<div className="space-y-0.5">
							<p className="text-sm font-medium leading-none">
								{user.first_name + " " + user.last_name}
							</p>
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
