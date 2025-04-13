import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	LayoutDashboard,
	LogOut,
	Settings,
	Scroll,
	BookText,
	Shield,
	CircleUser,
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
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { getUserDetails, type UserDetails } from "@/utils/auth";
import { useEffect, useState } from "react";

export function DashboardLayout() {
	const navigate = useNavigate();
	const [user, setUser] = useState<UserDetails | null>(null);

	useEffect(() => {
		const userDetails = getUserDetails();
		if (!userDetails) {
			navigate("/login");
			return;
		}
		setUser(userDetails);
	}, [navigate]);

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
		navigate("/login");
	};

	if (!user) {
		return null; // TODO: Add a loading spinner
	}

	return (
		<div className="min-h-screen flex flex-col">
			{/* Header */}
			<header className="sticky top-0 z-40 border-b bg-background">
				<div className="flex h-16 items-center justify-between px-6">
					<div className="flex items-center space-x-8">
						<Link to="/app/dashboard" className="flex items-center space-x-2">
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
							<span className="font-semibold">Legacy In Order</span>
						</Link>
						<NavigationMenu>
							<NavigationMenuList>
								<NavigationMenuItem>
									<Link
										to="/app/dashboard"
										className={cn(
											"group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										)}
									>
										<LayoutDashboard className="mr-2 h-4 w-4" />
										Dashboard
									</Link>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<Link
										to="/app/create-will"
										className={cn(
											"group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										)}
									>
										<Scroll className="mr-2 h-4 w-4" />
										Will
									</Link>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<Link
										to="/app/policies"
										className={cn(
											"group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										)}
									>
										<Shield className="mr-2 h-4 w-4" />
										Power of Attorney
									</Link>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<Link
										to="/app/transaction-history"
										className={cn(
											"group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
										)}
									>
										<BookText className="mr-2 h-4 w-4" />
										Letters of Wishes
									</Link>
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative h-8 w-8 rounded-full hover:bg-primary/10"
							>
								<Avatar className="h-8 w-8">
									<AvatarFallback
										initials={getInitials(
											user.first_name + " " + user.last_name
										)}
									/>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">
										{user.first_name + " " + user.last_name}
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link to="/app/manage-profile" className="flex items-center">
									<CircleUser className="mr-2 h-4 w-4" />
									<span>Manage Profile</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/app/settings" className="flex items-center">
									<Settings className="mr-2 h-4 w-4" />
									<span>Settings</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleLogout}
								className="flex items-center"
							>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			{/* Page Content */}
			<main className="flex-1 p-6 overflow-auto">
				<Outlet />
			</main>
		</div>
	);
}
