// SESSION TIMEOUT FUNCTIONALITY DISABLED
// This component is no longer used as we only rely on API-based session validation

/*
import { useSessionActivity } from "@/hooks/useSessionActivity";
import { Button } from "./button";
import { Badge } from "./badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { Activity, Clock, RefreshCw, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SessionStatusProps {
	compact?: boolean;
	showInDropdown?: boolean;
	className?: string;
}

export function SessionStatus({
	compact = false,
	showInDropdown = false,
	className,
}: SessionStatusProps) {
	const {
		isSessionActive,
		minutesUntilTimeout,
		minutesUntilWarning,
		sessionDurationFormatted,
		extendSession,
	} = useSessionActivity();

	const [isExtending, setIsExtending] = useState(false);

	const handleExtendSession = async () => {
		setIsExtending(true);
		extendSession();

		// Visual feedback
		setTimeout(() => {
			setIsExtending(false);
		}, 1000);
	};

	const getStatusColor = ():
		| "default"
		| "destructive"
		| "secondary"
		| "outline"
		| null
		| undefined => {
		if (!isSessionActive) return "destructive";
		if (minutesUntilWarning <= 0) return "destructive";
		if (minutesUntilWarning <= 5) return "secondary";
		return "default";
	};

	const getStatusText = () => {
		if (!isSessionActive) return "Expired";
		if (minutesUntilWarning <= 0) return `${minutesUntilTimeout}m left`;
		return "Active";
	};

	const StatusContent = () => (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Shield className="h-4 w-4" />
				<span className="font-medium">Session Status</span>
				<Badge variant={getStatusColor()} className="ml-auto">
					{getStatusText()}
				</Badge>
			</div>

			{!compact && (
				<>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Activity className="h-3 w-3" />
						<span>Duration: {sessionDurationFormatted}</span>
					</div>

					{isSessionActive && minutesUntilWarning <= 10 && (
						<div className="flex items-center gap-2 text-sm text-amber-600">
							<Clock className="h-3 w-3" />
							<span>
								{minutesUntilWarning > 0
									? `Warning in ${minutesUntilWarning}m`
									: `Expires in ${minutesUntilTimeout}m`}
							</span>
						</div>
					)}

					{isSessionActive && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleExtendSession}
							disabled={isExtending}
							className="w-full"
						>
							{isExtending ? (
								<RefreshCw className="h-3 w-3 mr-2 animate-spin" />
							) : (
								<Activity className="h-3 w-3 mr-2" />
							)}
							{isExtending ? "Extending..." : "Extend Session"}
						</Button>
					)}
				</>
			)}
		</div>
	);

	if (showInDropdown) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className={cn("gap-2", className)}>
						<Shield className="h-4 w-4" />
						<Badge variant={getStatusColor()}>{getStatusText()}</Badge>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-64">
					<DropdownMenuLabel>Session Information</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<div className="p-2">
						<StatusContent />
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<div className={cn("p-4 border rounded-lg bg-card", className)}>
			<StatusContent />
		</div>
	);
}

export default SessionStatus;
*/
