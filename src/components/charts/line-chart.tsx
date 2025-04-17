import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	LineChart as RechartsLineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";

interface LineChartProps {
	title: string;
	description?: string;
	data: Array<{
		label: string;
		value?: number;
		[key: string]: string | number | boolean | undefined;
	}>;
	lines?: Array<{
		dataKey: string;
		stroke?: string;
		name?: string;
	}>;
	className?: string;
	height?: number;
	xAxisKey?: string;
}

export function LineChart({
	title,
	description,
	data,
	lines = [{ dataKey: "value", stroke: "#4f46e5", name: "Value" }],
	className,
	height = 350,
	xAxisKey = "label",
}: LineChartProps) {
	// Transform data if needed for recharts format
	const chartData = data.map((item) => ({
		...item,
		[xAxisKey]: item.label,
	}));

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div style={{ height, width: "100%" }}>
					<ResponsiveContainer width="100%" height="100%">
						<RechartsLineChart
							data={chartData}
							margin={{
								top: 5,
								right: 30,
								left: 20,
								bottom: 5,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
							<XAxis
								dataKey={xAxisKey}
								tick={{ fontSize: 12 }}
								tickLine={{ stroke: "#888" }}
								axisLine={{ stroke: "#888" }}
							/>
							<YAxis
								tick={{ fontSize: 12 }}
								tickLine={{ stroke: "#888" }}
								axisLine={{ stroke: "#888" }}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "white",
									borderRadius: "6px",
									boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
									border: "1px solid #f0f0f0",
								}}
							/>
							<Legend />
							{lines.map((lineConfig, index) => (
								<Line
									key={index}
									type="monotone"
									dataKey={lineConfig.dataKey}
									stroke={lineConfig.stroke || "#4f46e5"}
									name={lineConfig.name || lineConfig.dataKey}
									activeDot={{ r: 6 }}
									strokeWidth={2}
								/>
							))}
						</RechartsLineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
