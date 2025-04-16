import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { cn } from "@/lib/utils";

interface LineChartProps {
	title: string;
	description?: string;
	data: Array<{
		id: string | number;
		data: Array<{ x: string | number; y: number }>;
	}>;
	className?: string;
	height?: number;
	yAxisLabel?: string;
	hideGrid?: boolean;
}

export function LineChart({
	title,
	description,
	data,
	className,
	height = 350,
	yAxisLabel,
	hideGrid = false,
}: LineChartProps) {
	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div style={{ height }}>
					<ResponsiveLine
						data={data}
						margin={{ top: 20, right: 20, bottom: 60, left: 55 }}
						xScale={{ type: "point" }}
						yScale={{
							type: "linear",
							min: "auto",
							max: "auto",
							stacked: false,
							reverse: false,
						}}
						curve="monotoneX"
						axisTop={null}
						axisRight={null}
						axisBottom={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: -45,
							legend: "Time",
							legendOffset: 50,
							legendPosition: "middle",
						}}
						axisLeft={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: 0,
							legend: yAxisLabel || "",
							legendOffset: -45,
							legendPosition: "middle",
						}}
						colors={{ scheme: "category10" }}
						enableGridX={!hideGrid}
						enableGridY={!hideGrid}
						pointSize={10}
						pointColor={{ theme: "background" }}
						pointBorderWidth={2}
						pointBorderColor={{ from: "serieColor" }}
						pointLabelYOffset={-12}
						useMesh={true}
						legends={[
							{
								anchor: "bottom",
								direction: "row",
								justify: false,
								translateX: 0,
								translateY: 50,
								itemsSpacing: 0,
								itemDirection: "left-to-right",
								itemWidth: 80,
								itemHeight: 20,
								itemOpacity: 0.75,
								symbolSize: 12,
								symbolShape: "circle",
								symbolBorderColor: "rgba(0, 0, 0, .5)",
							},
						]}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
