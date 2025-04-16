import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import React from "react";
import { cn } from "@/lib/utils";

interface PieChartProps {
	title: string;
	description?: string;
	data: Array<{
		label: string;
		value: number;
		color: string;
	}>;
	className?: string;
	height?: number;
}

export function PieChart({
	title,
	description,
	data,
	className,
	height = 350,
}: PieChartProps) {
	const total = data.reduce((acc, item) => acc + item.value, 0);

	// Calculate the path for each slice
	const createSlice = (
		percentage: number,
		startAngle: number,
		color: string
	) => {
		const deg = 360 * percentage;
		const rad = (Math.PI / 180) * deg;
		const x = Math.cos(rad);
		const y = Math.sin(rad);

		const largeArcFlag = percentage > 0.5 ? 1 : 0;

		return {
			path: `M 0 0 L ${Math.cos(startAngle)} ${Math.sin(
				startAngle
			)} A 1 1 0 ${largeArcFlag} 1 ${x} ${y} Z`,
			color,
		};
	};

	const slices: Array<{ path: string; color: string }> = [];
	let startAngle = 0;

	data.forEach((item) => {
		const percentage = item.value / total;
		const slice = createSlice(percentage, startAngle, item.color);
		slices.push(slice);
		startAngle += Math.PI * 2 * percentage;
	});

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center" style={{ height }}>
					<div className="relative" style={{ width: "200px", height: "200px" }}>
						<svg viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)" }}>
							{slices.map((slice, index) => (
								<path
									key={index}
									d={slice.path}
									fill={slice.color}
									stroke="white"
									strokeWidth="0.01"
								/>
							))}
						</svg>
					</div>
					<div className="mt-4 flex flex-wrap justify-center gap-4">
						{data.map((item, index) => (
							<div key={index} className="flex items-center">
								<div
									className="mr-2 h-3 w-3 rounded-full"
									style={{ backgroundColor: item.color }}
								/>
								<span className="text-sm">
									{item.label}: {Math.round((item.value / total) * 100)}%
								</span>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
