import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BarChartProps {
	title: string;
	description?: string;
	data: Array<{
		label: string;
		value: number;
		color?: string;
	}>;
	className?: string;
	height?: number;
}

export function BarChart({
	title,
	description,
	data,
	className,
	height = 350,
}: BarChartProps) {
	const maxValue = Math.max(...data.map((item) => item.value));

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div className="space-y-4" style={{ height }}>
					{data.map((item, index) => (
						<div key={index} className="relative">
							<div className="flex items-center">
								<div className="w-24 text-sm font-medium">{item.label}</div>
								<div className="flex-1">
									<div className="overflow-hidden rounded-full bg-primary/10">
										<div
											className={cn(
												"h-2 rounded-full",
												item.color ? item.color : "bg-primary"
											)}
											style={{
												width: `${(item.value / maxValue) * 100}%`,
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
	);
}
