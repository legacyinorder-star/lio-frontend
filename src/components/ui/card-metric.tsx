import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface CardMetricProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	description?: string;
	trend?: number; // Percentage change (positive or negative)
	trendLabel?: string;
	className?: string;
}

export function CardMetric({
	title,
	value,
	icon,
	description,
	trend,
	trendLabel,
	className,
}: CardMetricProps) {
	const isTrendPositive = trend && trend > 0;
	const isTrendNegative = trend && trend < 0;
	const trendValue = trend ? Math.abs(trend) : undefined;

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardContent className="p-6">
				<div className="flex flex-col items-start">
					<div className="h-8 w-8 rounded-full bg-[#F2F2F2] flex items-center justify-center mb-3">
						<div className="h-4 w-4">{icon}</div>
					</div>
					<div className="w-full">
						<p className="text-sm font-normal text-muted-foreground mt-3">
							{title}
						</p>
						<div className="flex items-center justify-between mt-1">
							<h2 className="text-3xl font-bold">{value}</h2>
							{trend !== undefined && (
								<div
									className={cn(
										"px-2 py-1 rounded-full text-xs font-medium",
										isTrendPositive && "bg-green-100 text-green-700",
										isTrendNegative && "bg-red-100 text-red-700"
									)}
								>
									<span className="inline-flex items-center">
										{isTrendPositive && (
											<ArrowUpIcon className="mr-1 h-3 w-3" />
										)}
										{isTrendNegative && (
											<ArrowDownIcon className="mr-1 h-3 w-3" />
										)}
										{trendValue}%
									</span>
								</div>
							)}
						</div>
						{description && (
							<p className="mt-1 text-sm text-muted-foreground">
								{description}
							</p>
						)}
						{trendLabel && (
							<p className="mt-1 text-xs text-muted-foreground">{trendLabel}</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
