import { useState } from "react";
import { LineChart } from "@/components/charts/line-chart";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

// Sample data
const singleLineData = [
	{ label: "Jan", value: 45 },
	{ label: "Feb", value: 52 },
	{ label: "Mar", value: 49 },
	{ label: "Apr", value: 63 },
	{ label: "May", value: 55 },
	{ label: "Jun", value: 71 },
	{ label: "Jul", value: 65 },
	{ label: "Aug", value: 80 },
	{ label: "Sep", value: 72 },
	{ label: "Oct", value: 85 },
	{ label: "Nov", value: 91 },
	{ label: "Dec", value: 95 },
];

const multiLineData = [
	{ label: "Jan", value: 0, revenue: 4500, users: 150, orders: 45 },
	{ label: "Feb", value: 0, revenue: 5200, users: 170, orders: 52 },
	{ label: "Mar", value: 0, revenue: 4900, users: 160, orders: 49 },
	{ label: "Apr", value: 0, revenue: 6300, users: 210, orders: 63 },
	{ label: "May", value: 0, revenue: 5500, users: 180, orders: 55 },
	{ label: "Jun", value: 0, revenue: 7100, users: 240, orders: 71 },
	{ label: "Jul", value: 0, revenue: 6500, users: 220, orders: 65 },
	{ label: "Aug", value: 0, revenue: 8000, users: 280, orders: 80 },
	{ label: "Sep", value: 0, revenue: 7200, users: 240, orders: 72 },
	{ label: "Oct", value: 0, revenue: 8500, users: 290, orders: 85 },
	{ label: "Nov", value: 0, revenue: 9100, users: 300, orders: 91 },
	{ label: "Dec", value: 0, revenue: 9500, users: 320, orders: 95 },
];

export default function LineChartExample() {
	const [selectedDataset, setSelectedDataset] = useState<"single" | "multi">(
		"single"
	);

	const multiLineConfig = [
		{ dataKey: "revenue", stroke: "#4f46e5", name: "Revenue ($100s)" },
		{ dataKey: "users", stroke: "#8b5cf6", name: "Users" },
		{ dataKey: "orders", stroke: "#ec4899", name: "Orders" },
	];

	return (
		<div className="container mx-auto p-6 space-y-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold">Line Chart Examples</h1>
					<p className="text-muted-foreground">
						Examples of line charts using Recharts library
					</p>
				</div>
				<div className="flex items-center gap-4">
					<button
						className={`px-4 py-2 rounded-md ${
							selectedDataset === "single"
								? "bg-primary text-white"
								: "bg-gray-200"
						}`}
						onClick={() => setSelectedDataset("single")}
					>
						Single Line
					</button>
					<button
						className={`px-4 py-2 rounded-md ${
							selectedDataset === "multi"
								? "bg-primary text-white"
								: "bg-gray-200"
						}`}
						onClick={() => setSelectedDataset("multi")}
					>
						Multiple Lines
					</button>
				</div>
			</div>

			<div className="grid gap-6">
				{selectedDataset === "single" ? (
					<Card>
						<CardHeader>
							<CardTitle>Single Line Chart</CardTitle>
							<CardDescription>
								A simple line chart showing monthly values
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LineChart
								title="Monthly Performance"
								description="Value trends over the past year"
								data={singleLineData}
								height={400}
							/>
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>Multi-Line Chart</CardTitle>
							<CardDescription>
								Compare multiple metrics in a single chart
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LineChart
								title="Business Performance"
								description="Overview of key metrics for the past year"
								data={multiLineData}
								lines={multiLineConfig}
								height={400}
							/>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
