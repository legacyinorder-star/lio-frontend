import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRateLimitStatus, clearRateLimit } from "@/utils/apiClient";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";

interface RateLimitMonitorProps {
	className?: string;
	autoRefresh?: boolean;
	refreshInterval?: number;
}

export function RateLimitMonitor({
	className = "",
	autoRefresh = true,
	refreshInterval = 1000,
}: RateLimitMonitorProps) {
	const [status, setStatus] = useState(getRateLimitStatus());
	const [lastUpdated, setLastUpdated] = useState(new Date());

	const refreshStatus = () => {
		setStatus(getRateLimitStatus());
		setLastUpdated(new Date());
	};

	const handleClearRateLimit = () => {
		clearRateLimit();
		refreshStatus();
	};

	useEffect(() => {
		if (!autoRefresh) return;

		const interval = setInterval(refreshStatus, refreshInterval);
		return () => clearInterval(interval);
	}, [autoRefresh, refreshInterval]);

	const getStatusColor = () => {
		if (status.isLimited) return "destructive";
		if (status.requestCount >= status.maxRequests * 0.8) return "secondary";
		return "default";
	};

	const getStatusIcon = () => {
		if (status.isLimited) return <AlertCircle className="h-4 w-4" />;
		if (status.requestCount >= status.maxRequests * 0.8)
			return <Clock className="h-4 w-4" />;
		return <CheckCircle className="h-4 w-4" />;
	};

	const formatTime = (ms: number) => {
		if (ms < 1000) return `${ms}ms`;
		return `${Math.ceil(ms / 1000)}s`;
	};

	return (
		<Card className={`w-full max-w-md ${className}`}>
			<CardHeader className="pb-3">
				<CardTitle className="text-sm font-medium flex items-center gap-2">
					<RefreshCw className="h-4 w-4" />
					Rate Limit Monitor
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Status Badge */}
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Status:</span>
					<Badge variant={getStatusColor()} className="flex items-center gap-1">
						{getStatusIcon()}
						{status.isLimited ? "Limited" : "Active"}
					</Badge>
				</div>

				{/* Request Count */}
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Requests:</span>
					<span className="text-sm font-mono">
						{status.requestCount}/{status.maxRequests}
					</span>
				</div>

				{/* Queue Length */}
				{status.queueLength > 0 && (
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Queued:</span>
						<Badge variant="outline">{status.queueLength}</Badge>
					</div>
				)}

				{/* Reset Time */}
				{status.isLimited && status.timeUntilReset > 0 && (
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Reset in:</span>
						<span className="text-sm font-mono text-orange-600">
							{formatTime(status.timeUntilReset)}
						</span>
					</div>
				)}

				{/* Progress Bar */}
				<div className="space-y-1">
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Usage</span>
						<span>
							{Math.round((status.requestCount / status.maxRequests) * 100)}%
						</span>
					</div>
					<div className="w-full bg-secondary rounded-full h-2">
						<div
							className={`h-2 rounded-full transition-all duration-300 ${
								status.isLimited
									? "bg-destructive"
									: status.requestCount >= status.maxRequests * 0.8
									? "bg-yellow-500"
									: "bg-green-500"
							}`}
							style={{
								width: `${Math.min(
									(status.requestCount / status.maxRequests) * 100,
									100
								)}%`,
							}}
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2 pt-2">
					<Button
						variant="outline"
						size="sm"
						onClick={refreshStatus}
						className="flex-1"
					>
						<RefreshCw className="h-3 w-3 mr-1" />
						Refresh
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleClearRateLimit}
						className="flex-1"
						disabled={!status.isLimited && status.requestCount === 0}
					>
						Clear
					</Button>
				</div>

				{/* Last Updated */}
				<div className="text-xs text-muted-foreground text-center pt-1">
					Last updated: {lastUpdated.toLocaleTimeString()}
				</div>
			</CardContent>
		</Card>
	);
}
