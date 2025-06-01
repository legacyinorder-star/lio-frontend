import { useState, useEffect } from "react";
import { CardMetric } from "@/components/ui/card-metric";
import { PieChart } from "@/components/charts/pie-chart";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
	Users,
	DollarSign,
	Clock,
	ShoppingCart,
	Plus,
	ChevronDown,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define types
interface User {
	id: number;
	name: string;
	email: string;
	createdAt: string;
	status: string;
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
}

// Mock data
const recentUsers: User[] = [
	{
		id: 1,
		name: "John Doe",
		email: "john@example.com",
		createdAt: "2023-08-10",
		status: "active",
	},
	{
		id: 2,
		name: "Jane Smith",
		email: "jane@example.com",
		createdAt: "2023-08-09",
		status: "active",
	},
	{
		id: 3,
		name: "Bob Johnson",
		email: "bob@example.com",
		createdAt: "2023-08-08",
		status: "inactive",
	},
	{
		id: 4,
		name: "Sarah Williams",
		email: "sarah@example.com",
		createdAt: "2023-08-07",
		status: "active",
	},
	{
		id: 5,
		name: "Mike Brown",
		email: "mike@example.com",
		createdAt: "2023-08-06",
		status: "pending",
	},
];

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

// Chart data
const userGrowthData = [
	{ label: "Jan", value: 78 },
	{ label: "Feb", value: 85 },
	{ label: "Mar", value: 102 },
	{ label: "Apr", value: 95 },
	{ label: "May", value: 110 },
	{ label: "Jun", value: 135 },
	{ label: "Jul", value: 126 },
	{ label: "Aug", value: 152 },
];

const documentCreationData = [
	{ label: "Will", value: 45, color: "#0D4705" },
	{ label: "Power of Attorney", value: 35, color: "#0D4705" },
	{ label: "Trust", value: 28, color: "#0D4705" },
	{ label: "Living Will", value: 18, color: "#0D4705" },
	{ label: "Estate Plan", value: 24, color: "#0D4705" },
];

const revenueSourceData = [
	{ label: "Will Creation", value: 45, color: "#4f46e5" },
	{ label: "Power of Attorney", value: 25, color: "#8b5cf6" },
	{ label: "Estate Planning", value: 20, color: "#ec4899" },
	{ label: "Trust Documents", value: 10, color: "#f43f5e" },
];

// Table columns - using type-only imports to avoid TS error with the full module
type ColumnDef<_TData> = {
	accessorKey: string;
	header: string;
	cell?: ({ row }: { row: DataTableRow }) => React.ReactNode;
};

const userColumns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "createdAt",
		header: "Joined",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					className={
						status === "active"
							? "bg-green-500"
							: status === "inactive"
							? "bg-gray-500"
							: "bg-yellow-500"
					}
				>
					{status}
				</Badge>
			);
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
	const [isLoading, setIsLoading] = useState(true);
	const [timeRange, setTimeRange] = useState("Last 7 Days");
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalOrders: 0,
		pendingOrders: 0,
		revenue: 0,
	});

	useEffect(() => {
		// Simulate loading data
		setTimeout(() => {
			setStats({
				totalUsers: 1456,
				totalOrders: 832,
				pendingOrders: 52,
				revenue: 187654.32,
			});
			setIsLoading(false);
		}, 1000);
	}, []);

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
				<h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
				<div className="flex gap-3">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="flex items-center gap-2 rounded-[4px]"
							>
								{timeRange}
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setTimeRange("Last 7 Days")}>
								Last 7 Days
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTimeRange("Last 30 Days")}>
								Last 30 Days
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTimeRange("Last 90 Days")}>
								Last 90 Days
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTimeRange("This Year")}>
								This Year
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTimeRange("Custom Range")}>
								Custom Range
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button className="flex items-center gap-2 rounded-[4px] bg-[#C6F91F] hover:bg-[#C6F91F]/90 text-black">
						<Plus className="h-4 w-4" />
						Generate Report
					</Button>
				</div>
			</div>

			{/* Key metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<CardMetric
					title="Total Users"
					value={stats.totalUsers.toLocaleString()}
					icon={<Users className="h-4 w-4" />}
					trend={12.5}
					className="shadow-md border-[#F2F2F2]"
				/>
				<CardMetric
					title="Total Orders"
					value={stats.totalOrders.toLocaleString()}
					icon={<ShoppingCart className="h-4 w-4" />}
					trend={8.2}
					className="shadow-md border-[#F2F2F2]"
				/>
				<CardMetric
					title="Pending Orders"
					value={stats.pendingOrders.toLocaleString()}
					icon={<Clock className="h-4 w-4" />}
					trend={-4.5}
					className="shadow-md border-[#F2F2F2]"
				/>
				<CardMetric
					title="Total Revenue"
					value={`$${stats.revenue.toLocaleString()}`}
					icon={<DollarSign className="h-4 w-4" />}
					trend={15.3}
					className="shadow-md border-[#F2F2F2]"
				/>
			</div>

			{/* Main content tabs */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="users">Users</TabsTrigger>
					<TabsTrigger value="orders">Orders</TabsTrigger>
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
								<CardTitle>Revenue Sources</CardTitle>
							</CardHeader>
							<CardContent>
								<PieChart title="" data={revenueSourceData} height={300} />
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<Card className="lg:col-span-3 shadow-md border-[#F2F2F2]">
							<CardHeader>
								<CardTitle>Document Types Created</CardTitle>
							</CardHeader>
							<CardContent className="pt-6">
								<div className="h-[300px] relative">
									{/* Graph lines */}
									<div className="absolute inset-0 flex flex-col justify-between">
										{[100, 75, 50, 25, 0].map((percent, index) => (
											<div key={index} className="relative w-full">
												<div className="absolute inset-x-0 border-t border-[#F2F2F2]" />
												<div className="absolute -left-8 text-xs text-muted-foreground">
													{Math.round(
														(Math.max(
															...documentCreationData.map((d) => d.value)
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
										{documentCreationData.map((item, index) => (
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
																		...documentCreationData.map((d) => d.value)
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
								</div>
							</CardContent>
						</Card>
						<Card className="lg:col-span-4 shadow-md border-[#F2F2F2]">
							<CardHeader>
								<CardTitle>Recent Orders</CardTitle>
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
							<DataTable columns={userColumns} data={recentUsers} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="orders" className="space-y-4">
					<Card className="shadow-md border-[#F2F2F2]">
						<CardHeader>
							<CardTitle>Order Management</CardTitle>
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
