import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ChevronDown, Edit, Search, Shield, Power } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	_role?: {
		id: string;
		created_at: string;
		role: string;
	};
	role?: string;
	created_at: string;
	last_login_at?: string;
	is_active: boolean;
}

type FilterType = "all" | "admin" | "user" | "active" | "inactive";

export default function ManageUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState<FilterType>("all");
	const { user } = useAuth();

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(getApiUrl("/user"), {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch users");
			}

			const data = await response.json();
			setUsers(data || []);
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Failed to load users");
			setUsers([]);
		} finally {
			setIsLoading(false);
		}
	};

	const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
		try {
			const response = await fetch(getApiUrl(`/user/${userId}`), {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user?.token}`,
				},
				body: JSON.stringify({
					is_active: !currentStatus,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update user status");
			}

			// Update local state
			setUsers(
				users.map((u) =>
					u.id === userId ? { ...u, is_active: !currentStatus } : u
				)
			);

			toast.success(
				`User ${!currentStatus ? "activated" : "deactivated"} successfully`
			);
		} catch (error) {
			console.error("Error updating user status:", error);
			toast.error("Failed to update user status");
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "Never";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getUserRole = (user: User): string => {
		return user._role?.role || user.role || "user";
	};

	const filterUsers = (users: User[]): User[] => {
		switch (filter) {
			case "admin":
				return users.filter((user) => getUserRole(user) === "admin");
			case "user":
				return users.filter((user) => getUserRole(user) === "user");
			case "active":
				return users.filter((user) => user.is_active);
			case "inactive":
				return users.filter((user) => !user.is_active);
			default:
				return users;
		}
	};

	const filteredUsers = filterUsers(users).filter(
		(user) =>
			user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Users</h1>
					<p className="text-muted-foreground">
						Manage user accounts and permissions
					</p>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle>User Management</CardTitle>
					<CardDescription>
						View and manage all users in the system
					</CardDescription>
					<div className="flex items-center mt-4">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search users..."
								className="pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="ml-2">
									{filter === "all" && "All Users"}
									{filter === "admin" && "Admins"}
									{filter === "user" && "Regular Users"}
									{filter === "active" && "Active Users"}
									{filter === "inactive" && "Inactive Users"}
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => setFilter("all")}>
									All Users
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setFilter("admin")}>
									Admins
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setFilter("user")}>
									Regular Users
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setFilter("active")}>
									Active Users
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setFilter("inactive")}>
									Inactive Users
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent>
					<div className="border rounded-md overflow-hidden w-full">
						<table className="w-full caption-bottom text-sm">
							<thead className="border-b bg-muted/50">
								<tr>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
										Name
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
										Email
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
										Role
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
										Status
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
										Created
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
										Last Login
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{isLoading ? (
									<tr>
										<td colSpan={7} className="text-center p-6">
											Loading users...
										</td>
									</tr>
								) : filteredUsers.length === 0 ? (
									<tr>
										<td colSpan={7} className="text-center p-6">
											No users found matching your search
										</td>
									</tr>
								) : (
									filteredUsers.map((user) => {
										const role = getUserRole(user);
										return (
											<tr
												key={user.id}
												className="border-b hover:bg-muted/50 transition-colors"
											>
												<td className="p-4">
													{user.first_name} {user.last_name}
												</td>
												<td className="p-4">{user.email}</td>
												<td className="p-4">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															role === "admin"
																? "bg-purple-100 text-purple-800"
																: "bg-gray-100 text-gray-800"
														}`}
													>
														{role === "admin" && (
															<Shield className="mr-1 h-3 w-3" />
														)}
														{role}
													</span>
												</td>
												<td className="p-4">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															user.is_active
																? "bg-green-100 text-green-800"
																: "bg-red-100 text-red-800"
														}`}
													>
														{user.is_active ? "Active" : "Inactive"}
													</span>
												</td>
												<td className="p-4">{formatDate(user.created_at)}</td>
												<td className="p-4">
													{formatDate(user.last_login_at)}
												</td>
												<td className="p-4 flex gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => toast.info(`Edit user ${user.id}`)}
														className="flex items-center"
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															toggleUserStatus(user.id, user.is_active)
														}
														className={`flex items-center ${
															user.is_active
																? "text-red-600 hover:text-red-700"
																: "text-green-600 hover:text-green-700"
														}`}
													>
														<Power className="h-4 w-4" />
													</Button>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
