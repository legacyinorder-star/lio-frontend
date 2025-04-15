import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
import {
	ChevronDown,
	Edit,
	MoreHorizontal,
	Search,
	Shield,
} from "lucide-react";
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
	role: string;
	created_at: string;
	last_login?: string;
}

export default function ManageUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
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
			setUsers(data.users || []);
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Failed to load users");
			// For demo purposes, let's add some mock data
			setUsers([
				{
					id: "1",
					email: "john.doe@example.com",
					first_name: "John",
					last_name: "Doe",
					role: "admin",
					created_at: "2023-10-15T14:48:00",
					last_login: "2023-11-28T09:15:00",
				},
				{
					id: "2",
					email: "jane.smith@example.com",
					first_name: "Jane",
					last_name: "Smith",
					role: "user",
					created_at: "2023-10-20T10:30:00",
					last_login: "2023-11-25T16:20:00",
				},
				{
					id: "3",
					email: "bob.johnson@example.com",
					first_name: "Bob",
					last_name: "Johnson",
					role: "user",
					created_at: "2023-11-05T08:15:00",
				},
			]);
		} finally {
			setIsLoading(false);
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

	const filteredUsers = users.filter(
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
				{/* <Button>
					<Plus className="mr-2 h-4 w-4" />
					Add User
				</Button> */}
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
									Filter
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem>All Users</DropdownMenuItem>
								<DropdownMenuItem>Admins</DropdownMenuItem>
								<DropdownMenuItem>Regular Users</DropdownMenuItem>
								<DropdownMenuItem>Recently Added</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Last Login</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-6">
										Loading users...
									</TableCell>
								</TableRow>
							) : filteredUsers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-6">
										No users found matching your search
									</TableCell>
								</TableRow>
							) : (
								filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											{user.first_name} {user.last_name}
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													user.role === "admin"
														? "bg-purple-100 text-purple-800"
														: "bg-gray-100 text-gray-800"
												}`}
											>
												{user.role === "admin" && (
													<Shield className="mr-1 h-3 w-3" />
												)}
												{user.role}
											</span>
										</TableCell>
										<TableCell>{formatDate(user.created_at)}</TableCell>
										<TableCell>{formatDate(user.last_login)}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>
														<Edit className="mr-2 h-4 w-4" />
														Edit
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
