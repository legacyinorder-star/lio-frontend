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
				<div className="flex items-center justify-between">
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					<div className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary">
						{icon}
					</div>
				</div>
				<div className="mt-3">
					<div className="flex items-baseline">
						<h2 className="text-3xl font-bold">{value}</h2>
						{trend !== undefined && (
							<span
								className={cn(
									"ml-2 text-sm font-medium",
									isTrendPositive && "text-green-600",
									isTrendNegative && "text-red-600"
								)}
							>
								<span className="inline-flex items-center">
									{isTrendPositive && <ArrowUpIcon className="mr-1 h-3 w-3" />}
									{isTrendNegative && (
										<ArrowDownIcon className="mr-1 h-3 w-3" />
									)}
									{trendValue}%
								</span>
							</span>
						)}
					</div>
					{description && (
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					)}
					{trendLabel && (
						<p className="mt-1 text-xs text-muted-foreground">{trendLabel}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
