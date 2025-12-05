import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CardMetric } from "@/components/ui/card-metric";
import { PieChart } from "@/components/charts/pie-chart";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, FileText, CheckCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { getApiUrl } from "@/config/api";
import { addDataSourceHeader } from "@/utils/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { toTitleCase } from "@/utils/format";

// Define types - matching ManageUsersPage
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

interface Order {
	id: number;
	customer: string;
	product: string;
	amount: number;
	status: string;
	date: string;
}

// Type for row object used in DataTable
interface DataTableRow {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getValue: (key: string) => any; // Using any here is necessary for compatibility
	getIsSelected: () => boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	original: any; // Full row data from TanStack Table
}

// Helper function to format dates (matching ManageUsersPage)
const formatDate = (dateString?: string) => {
	if (!dateString) return "Never";
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

// Helper function to get user role (matching ManageUsersPage)
const getUserRole = (user: User): string => {
	return user.role || "user";
};

const recentOrders: Order[] = [
	{
		id: 101,
		customer: "John Doe",
		product: "Will Creation",
		amount: 199.99,
		status: "completed",
		date: "2023-08-10",
	},
	{
		id: 102,
		customer: "Jane Smith",
		product: "Power of Attorney",
		amount: 149.99,
		status: "pending",
		date: "2023-08-09",
	},
	{
		id: 103,
		customer: "Bob Johnson",
		product: "Estate Planning",
		amount: 299.99,
		status: "processing",
		date: "2023-08-08",
	},
	{
		id: 104,
		customer: "Sarah Williams",
		product: "Will Creation",
		amount: 199.99,
		status: "completed",
		date: "2023-08-07",
	},
	{
		id: 105,
		customer: "Mike Brown",
		product: "Trust Document",
		amount: 249.99,
		status: "pending",
		date: "2023-08-06",
	},
];

// Helper function to convert period (YYYYMM) to month name
const periodToMonthName = (period: number): string => {
	const monthNumber = period % 100; // Get last two digits
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	return monthNames[monthNumber - 1] || "Unknown";
};

// Color mapping for will statuses
const getStatusColor = (status: string): string => {
	const colorMap: Record<string, string> = {
		"not started": "#9ca3af", // gray
		"in progress": "#3b82f6", // blue
		draft: "#8b5cf6", // purple
		submitted: "#f59e0b", // amber
		"under review": "#f97316", // orange
		completed: "#10b981", // green
		rejected: "#ef4444", // red
		cancelled: "#6b7280", // gray
	};
	return colorMap[status.toLowerCase()] || "#6366f1"; // default indigo
};

interface AdminStatsResponse {
	users?: {
		total?: number;
		by_role?: Record<string, number>;
	};
	wills?: {
		total?: number;
		completed?: number;
		others?: number;
	};
}

interface UserCountByMonthResponse {
	period: number;
	count: number;
}

interface WillStatusCountResponse {
	status: string;
	count: number;
}

interface WillTypeCountResponse {
	type: string;
	count: number;
}

// Table columns - using type-only imports to avoid TS error with the full module
type ColumnDef<_TData> = {
	accessorKey: string;
	header: string;
	cell?: ({ row }: { row: DataTableRow }) => React.ReactNode;
};

const userColumns: ColumnDef<User>[] = [
	{
		accessorKey: "first_name",
		header: "Name",
		cell: ({ row }) => {
			const user = row.original;
			return `${user.first_name} ${user.last_name}`;
		},
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			const role = getUserRole(row.original);
			return (
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
						<Users className="mr-1 h-3 w-3" />
					)}
					{role.charAt(0).toUpperCase() + role.slice(1)}
				</span>
			);
		},
	},
	{
		accessorKey: "is_active",
		header: "Status",
		cell: ({ row }) => {
			const isActive = row.getValue("is_active") as boolean;
			return (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-xs font-medium ${
						isActive
							? "bg-[#E5FC99] text-[#3F7F03]"
							: "bg-[#FFCACA] text-[#FF0000]"
					}`}
				>
					<span
						className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
							isActive ? "bg-[#3F7F03]" : "bg-[#FF0000]"
						}`}
					/>
					{isActive ? "Active" : "Inactive"}
				</span>
			);
		},
	},
	{
		accessorKey: "created_at",
		header: "Created",
		cell: ({ row }) => {
			return formatDate(row.getValue("created_at"));
		},
	},
	{
		accessorKey: "last_login_at",
		header: "Last Login",
		cell: ({ row }) => {
			return formatDate(row.getValue("last_login_at"));
		},
	},
];

const orderColumns: ColumnDef<Order>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "customer",
		header: "Customer",
	},
	{
		accessorKey: "product",
		header: "Product",
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("amount"));
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount);
			return formatted;
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					className={
						status === "completed"
							? "bg-green-500"
							: status === "processing"
							? "bg-blue-500"
							: "bg-yellow-500"
					}
				>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "date",
		header: "Date",
	},
];

export default function AdminDashboardPage() {
	const navigate = useNavigate();
	const { user: authUser } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalWills: 0,
		activeWills: 0,
		completedWills: 0,
	});
	const [userGrowthData, setUserGrowthData] = useState<
		Array<{ label: string; value: number }>
	>([]);
	const [willDistributionData, setWillDistributionData] = useState<
		Array<{ label: string; value: number; color: string }>
	>([]);
	const [willTypesData, setWillTypesData] = useState<
		Array<{ label: string; value: number }>
	>([]);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [
					statsResponse,
					userGrowthResponse,
					willStatusResponse,
					willTypesResponse,
				] = await Promise.all([
					apiClient<AdminStatsResponse>("/admin/stats/users-wills-count"),
					apiClient<UserCountByMonthResponse[]>(
						"/admin/stats/user-count-by-month"
					),
					apiClient<WillStatusCountResponse[]>("/admin/stats/wills-by-status"),
					apiClient<WillTypeCountResponse[]>("/admin/stats/wills-by-type"),
				]);

				// Handle stats data
				if (statsResponse.error || !statsResponse.data) {
					throw new Error(statsResponse.error || "Failed to load stats");
				}

				const usersData = statsResponse.data.users || {};
				const willsData = statsResponse.data.wills || {};

				setStats({
					totalUsers: usersData.total || 0,
					totalWills: willsData.total || 0,
					activeWills: willsData.others || 0,
					completedWills: willsData.completed || 0,
				});

				// Handle user growth data
				if (userGrowthResponse.error || !userGrowthResponse.data) {
					console.error(
						"Error fetching user growth data:",
						userGrowthResponse.error
					);
					setUserGrowthData([]);
				} else {
					// Sort by period in descending order and transform to chart format
					const sortedData = [...userGrowthResponse.data]
						.sort((a, b) => b.period - a.period)
						.map((item) => ({
							label: periodToMonthName(item.period),
							value: item.count,
						}));

					setUserGrowthData(sortedData);
				}

				// Handle will distribution data
				if (willStatusResponse.error || !willStatusResponse.data) {
					console.error(
						"Error fetching will distribution data:",
						willStatusResponse.error
					);
					setWillDistributionData([]);
				} else {
					// Transform to pie chart format with title case labels and colors
					const distributionData = willStatusResponse.data.map((item) => ({
						label: toTitleCase(item.status),
						value: item.count,
						color: getStatusColor(item.status),
					}));

					setWillDistributionData(distributionData);
				}

				// Handle will types data
				if (willTypesResponse.error || !willTypesResponse.data) {
					console.error(
						"Error fetching will types data:",
						willTypesResponse.error
					);
					setWillTypesData([]);
				} else {
					// Transform to chart format, handling empty type as "Not Set"
					const typesData = willTypesResponse.data.map((item) => ({
						label: item.type === "" ? "Not Set" : item.type.toUpperCase(),
						value: item.count,
					}));

					setWillTypesData(typesData);
				}
			} catch (err) {
				console.error("Error fetching admin stats:", err);
				toast.error("Unable to load latest stats");
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, []);

	// Fetch users for User Management tab
	useEffect(() => {
		const fetchUsers = async () => {
			if (!authUser?.token) return;

			setIsLoadingUsers(true);
			try {
				const headers = addDataSourceHeader({
					Authorization: `Bearer ${authUser.token}`,
				});

				const response = await fetch(getApiUrl("/user"), {
					headers,
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
				setIsLoadingUsers(false);
			}
		};

		fetchUsers();
	}, [authUser?.token]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-medium tracking-tight">Admin Dashboard</h2>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card
					className="shadow-md border-[#F2F2F2] cursor-pointer hover:shadow-lg transition-shadow"
					onClick={() => navigate("/admin/users")}
				>
					<CardContent className="p-6">
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
								<Users className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<h3 className="font-semibold text-lg">Manage Users</h3>
								<p className="text-sm text-muted-foreground">User management</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card
					className="shadow-md border-[#F2F2F2] cursor-pointer hover:shadow-lg transition-shadow"
					onClick={() => navigate("/admin/wills-under-review")}
				>
					<CardContent className="p-6">
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
								<FileText className="w-6 h-6 text-purple-600" />
							</div>
							<div>
								<h3 className="font-semibold text-lg">Review Wills</h3>
								<p className="text-sm text-muted-foreground">
									Wills under review
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Key metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<CardMetric
					title="Total Users"
					value={stats.totalUsers.toLocaleString()}
					icon={<Users className="h-4 w-4" />}
					className="shadow-md border-[#F2F2F2]"
				/>
				<CardMetric
					title="Total Wills"
					value={stats.totalWills.toLocaleString()}
					icon={<FileText className="h-4 w-4" />}
					className="shadow-md border-[#F2F2F2]"
				/>
				<CardMetric
					title="Wills In Progress"
					value={stats.activeWills.toLocaleString()}
					icon={<Clock className="h-4 w-4" />}
					className="shadow-md border-[#F2F2F2]"
				/>
				<CardMetric
					title="Completed Wills"
					value={stats.completedWills.toLocaleString()}
					icon={<CheckCircle className="h-4 w-4" />}
					className="shadow-md border-[#F2F2F2]"
				/>
			</div>

			{/* Main content tabs */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview" className="cursor-pointer">
						Overview
					</TabsTrigger>
					<TabsTrigger value="users" className="cursor-pointer">
						Users
					</TabsTrigger>
					<TabsTrigger value="orders" className="cursor-pointer">
						Transactions
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<Card className="lg:col-span-4 shadow-md border-[#F2F2F2]">
							<CardHeader>
								<CardTitle>User Growth</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4" style={{ height: 300 }}>
									{userGrowthData.map((item, index) => (
										<div key={index} className="relative">
											<div className="flex items-center">
												<div className="w-20 text-sm font-medium">
													{item.label}
												</div>
												<div className="flex-1">
													<div className="overflow-hidden rounded-[4px] bg-[#F2F2F2]">
														<div
															className="h-8 rounded-[4px]"
															style={{
																width: `${
																	(item.value /
																		Math.max(
																			...userGrowthData.map((d) => d.value)
																		)) *
																	100
																}%`,
																backgroundColor: "#0D4705",
															}}
														/>
													</div>
												</div>
												<div className="ml-2 w-10 text-right text-sm tabular-nums">
													{item.value}
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
						<Card className="lg:col-span-3 shadow-md border-[#F2F2F2]">
							<CardHeader>
								<CardTitle>Will Distribution</CardTitle>
							</CardHeader>
							<CardContent>
								<PieChart title="" data={willDistributionData} height={300} />
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<Card className="lg:col-span-3 shadow-md border-[#F2F2F2]">
							<CardHeader>
								<CardTitle>Will Types Created</CardTitle>
							</CardHeader>
							<CardContent className="pt-6">
								<div className="h-[300px] relative">
									{willTypesData.length > 0 ? (
										<>
											{/* Graph lines */}
											<div className="absolute inset-0 flex flex-col justify-between">
												{[100, 75, 50, 25, 0].map((percent, index) => (
													<div key={index} className="relative w-full">
														<div className="absolute inset-x-0 border-t border-[#F2F2F2]" />
														<div className="absolute -left-8 text-xs text-muted-foreground">
															{Math.round(
																(Math.max(
																	...willTypesData.map((d) => d.value)
																) *
																	percent) /
																	100
															)}
														</div>
													</div>
												))}
											</div>
											{/* Bars */}
											<div className="absolute inset-0 flex items-end justify-between gap-8 px-8 pb-8">
												{willTypesData.map((item, index) => (
													<div
														key={index}
														className="flex flex-col items-center flex-1 h-full"
													>
														<div className="flex-1 w-full flex items-end">
															<div
																className="w-2 mx-auto rounded-[4px] bg-[#0D4705]"
																style={{
																	height: `${
																		(item.value /
																			Math.max(
																				...willTypesData.map((d) => d.value)
																			)) *
																		100
																	}%`,
																}}
															/>
														</div>
														<div className="mt-2 text-sm font-medium text-center">
															{item.label}
														</div>
														<div className="text-sm text-muted-foreground">
															{item.value}
														</div>
													</div>
												))}
											</div>
										</>
									) : (
										<div className="flex items-center justify-center h-full text-muted-foreground">
											No data available
										</div>
									)}
								</div>
							</CardContent>
						</Card>
						<Card className="lg:col-span-4 shadow-md border-[#F2F2F2]">
							<CardHeader>
								<CardTitle>Recent Transactions</CardTitle>
							</CardHeader>
							<CardContent>
								<DataTable columns={orderColumns} data={recentOrders} />
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="users" className="space-y-4">
					<Card className="shadow-md border-[#F2F2F2]">
						<CardHeader>
							<CardTitle>User Management</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoadingUsers ? (
								<div className="flex items-center justify-center p-8">
									<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
								</div>
							) : users.length === 0 ? (
								<div className="text-center p-8 text-muted-foreground">
									No users found
								</div>
							) : (
								<DataTable columns={userColumns} data={users} />
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="orders" className="space-y-4">
					<Card className="shadow-md border-[#F2F2F2]">
						<CardHeader>
							<CardTitle>Transactions</CardTitle>
						</CardHeader>
						<CardContent>
							<DataTable columns={orderColumns} data={recentOrders} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
