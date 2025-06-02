import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
	Search,
	Shield,
	Power,
	User,
	ChevronDown,
	ChevronUp,
	MoreVertical,
	Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role?: string;
	created_at: string;
	last_login_at?: string;
	is_active: boolean;
}

type RoleFilter = "all" | "admin" | "user";
type StatusFilter = "all" | "active" | "inactive";

export default function ManageUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sortField, setSortField] = useState<keyof User>("created_at");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
	const { user } = useAuth();
	const navigate = useNavigate();

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
			const response = await fetch(getApiUrl(`/admin/users/${userId}/status`), {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user?.token}`,
				},
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
		return user.role || "user";
	};

	const filterUsers = (users: User[]): User[] => {
		return users.filter((user) => {
			const matchesRole =
				roleFilter === "all" ||
				(roleFilter === "admin" && getUserRole(user) === "admin") ||
				(roleFilter === "user" && getUserRole(user) === "user");

			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "active" && user.is_active) ||
				(statusFilter === "inactive" && !user.is_active);

			return matchesRole && matchesStatus;
		});
	};

	const filteredUsers = filterUsers(users).filter(
		(user) =>
			user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleSort = (field: keyof User) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const sortedAndFilteredUsers = [...filteredUsers].sort((a, b) => {
		const aValue = a[sortField];
		const bValue = b[sortField];

		if (typeof aValue === "string" && typeof bValue === "string") {
			return sortDirection === "asc"
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}

		if (aValue === undefined || bValue === undefined) {
			return 0;
		}

		// Handle boolean values (is_active)
		if (typeof aValue === "boolean" && typeof bValue === "boolean") {
			return sortDirection === "asc"
				? (aValue ? 1 : 0) - (bValue ? 1 : 0)
				: (bValue ? 1 : 0) - (aValue ? 1 : 0);
		}

		// Handle date strings (created_at, last_login_at)
		if (typeof aValue === "string" && typeof bValue === "string") {
			const dateA = new Date(aValue).getTime();
			const dateB = new Date(bValue).getTime();
			return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
		}

		return 0;
	});

	const handleViewUser = (userId: string) => {
		navigate(`/admin/users/${userId}`);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="text-left">
					<div className="flex items-center gap-2">
						<h2 className="text-3xl font-medium tracking-tight">Users</h2>
						<span className="text-[0.875rem] text-[#909090]">
							{sortedAndFilteredUsers.length}
						</span>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center gap-4 mb-12">
					<div className="relative flex-1">
						<div className="flex-1 max-w-2xl">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#929292]" />
								<Input
									type="search"
									placeholder="Search users..."
									className="pl-9 bg-[#F3F3F3] border-none focus-visible:ring-0 h-10"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between gap-3">
					<div className="flex gap-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="rounded-[12px] border-dashed border-[#909090] hover:bg-muted/50 text-[#545454]"
								>
									<img
										src="/svgs/sort.svg"
										alt="Sort"
										className="h-4 w-4 mr-2"
									/>
									Role:{" "}
									{roleFilter === "all"
										? "All"
										: roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="bg-white">
								<DropdownMenuItem onClick={() => setRoleFilter("all")}>
									All Roles
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setRoleFilter("admin")}>
									Admin
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setRoleFilter("user")}>
									User
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="rounded-[12px] border-dashed border-[#909090] hover:bg-muted/50 text-[#545454]"
								>
									<img
										src="/svgs/sort.svg"
										alt="Sort"
										className="h-4 w-4 mr-2"
									/>
									Status:{" "}
									{statusFilter === "all"
										? "All"
										: statusFilter.charAt(0).toUpperCase() +
										  statusFilter.slice(1)}
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="bg-white">
								<DropdownMenuItem onClick={() => setStatusFilter("all")}>
									All Status
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setStatusFilter("active")}>
									Active
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
									Inactive
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<Button
						variant="outline"
						className="rounded-[4px] border-solid border-[#DADADA] hover:bg-muted/50 text-[#545454]"
						onClick={() => {
							// TODO: Implement export functionality
							toast.info("Export functionality coming soon!");
						}}
					>
						<img
							src="/svgs/unarchive.svg"
							alt="Export"
							className="h-4 w-4 mr-2"
						/>
						Export
					</Button>
				</div>
			</div>

			<div className="border rounded-lg overflow-hidden mt-6">
				<div className="overflow-x-auto">
					<table className="w-full caption-bottom text-sm">
						<thead className="border-b bg-[#FAFAFA] border-[#E9EAEB] text-[#535862] font-['Inter']">
							<tr>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("first_name")}
								>
									<div className="flex items-center gap-2">
										Name
										{sortField === "first_name" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("email")}
								>
									<div className="flex items-center gap-2">
										Email
										{sortField === "email" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("role")}
								>
									<div className="flex items-center gap-2">
										Role
										{sortField === "role" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("is_active")}
								>
									<div className="flex items-center gap-2">
										Status
										{sortField === "is_active" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("created_at")}
								>
									<div className="flex items-center gap-2">
										Created
										{sortField === "created_at" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("last_login_at")}
								>
									<div className="flex items-center gap-2">
										Last Login
										{sortField === "last_login_at" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"></th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td
										colSpan={7}
										className="text-center p-6 border-b border-[#DADADA]"
									>
										Loading users...
									</td>
								</tr>
							) : sortedAndFilteredUsers.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="text-center p-6 border-b border-[#DADADA]"
									>
										No users found matching your search
									</td>
								</tr>
							) : (
								sortedAndFilteredUsers.map((user) => {
									const role = getUserRole(user);
									return (
										<tr
											key={user.id}
											className="border-b border-[#DADADA] hover:bg-muted/50 transition-colors"
										>
											<td className="p-4 text-left text-[#181D27] font-medium font-['Inter']">
												{user.first_name} {user.last_name}
											</td>
											<td className="p-4 text-left text-[#545454] font-['DMSans']">
												{user.email}
											</td>
											<td className="p-4 text-left">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														role === "admin"
															? "bg-purple-100 text-purple-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{role === "admin" ? (
														<Shield className="mr-1 h-3 w-3" />
													) : (
														<User className="mr-1 h-3 w-3" />
													)}
													{role.charAt(0).toUpperCase() + role.slice(1)}
												</span>
											</td>
											<td className="p-4 text-left">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-xs font-medium ${
														user.is_active
															? "bg-[#E5FC99] text-[#3F7F03]"
															: "bg-[#FFCACA] text-[#FF0000]"
													}`}
												>
													<span
														className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
															user.is_active ? "bg-[#3F7F03]" : "bg-[#FF0000]"
														}`}
													/>
													{user.is_active ? "Active" : "Inactive"}
												</span>
											</td>
											<td className="p-4 text-left">
												{formatDate(user.created_at)}
											</td>
											<td className="p-4 text-left">
												{formatDate(user.last_login_at)}
											</td>
											<td className="p-4 text-left">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 w-8 p-0 hover:bg-muted/50"
														>
															<MoreVertical className="h-4 w-4 text-[#545454]" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="bg-white">
														<DropdownMenuItem
															onClick={() => handleViewUser(user.id)}
															className="cursor-pointer"
														>
															<Eye className="mr-2 h-4 w-4" />
															View User
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() =>
																toggleUserStatus(user.id, user.is_active)
															}
															className={`cursor-pointer ${
																user.is_active
																	? "text-red-600 hover:text-red-700"
																	: "text-green-600 hover:text-green-700"
															}`}
														>
															<Power className="mr-2 h-4 w-4" />
															{user.is_active
																? "Deactivate User"
																: "Activate User"}
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
