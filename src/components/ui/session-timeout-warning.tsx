import { useState, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";
import { Clock, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SessionTimeoutWarningProps {
	isVisible: boolean;
	timeRemaining: number; // in seconds
	onExtendSession: () => void;
	onLogout: () => void;
	warningThreshold?: number; // when to show warning (seconds)
}

export function SessionTimeoutWarning({
	isVisible,
	timeRemaining,
	onExtendSession,
	onLogout,
	warningThreshold = 300, // 5 minutes default
}: SessionTimeoutWarningProps) {
	const [countdown, setCountdown] = useState(timeRemaining);
	const [isExtending, setIsExtending] = useState(false);

	// Update countdown when timeRemaining changes
	useEffect(() => {
		setCountdown(timeRemaining);
	}, [timeRemaining]);

	// Countdown timer
	useEffect(() => {
		if (!isVisible || countdown <= 0) return;

		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					// Auto-logout when countdown reaches 0
					onLogout();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isVisible, countdown, onLogout]);

	const handleExtendSession = useCallback(async () => {
		setIsExtending(true);
		try {
			await onExtendSession();
			toast.success("Session extended successfully!");
		} catch (error) {
			toast.error("Failed to extend session. Please log in again.");
		} finally {
			setIsExtending(false);
		}
	}, [onExtendSession]);

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const getProgressValue = (): number => {
		return ((warningThreshold - countdown) / warningThreshold) * 100;
	};

	const getUrgencyLevel = (): "low" | "medium" | "high" => {
		if (countdown <= 60) return "high"; // Last minute
		if (countdown <= 180) return "medium"; // Last 3 minutes
		return "low";
	};

	const urgencyLevel = getUrgencyLevel();

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<Card
				className={`w-full max-w-md ${
					urgencyLevel === "high"
						? "border-red-500 shadow-red-500/20"
						: urgencyLevel === "medium"
						? "border-orange-500 shadow-orange-500/20"
						: "border-yellow-500 shadow-yellow-500/20"
				} shadow-2xl`}
			>
				<CardHeader className="text-center">
					<div className="flex items-center justify-center mb-2">
						<Clock
							className={`h-8 w-8 ${
								urgencyLevel === "high"
									? "text-red-500"
									: urgencyLevel === "medium"
									? "text-orange-500"
									: "text-yellow-500"
							}`}
						/>
					</div>
					<CardTitle className="text-xl">
						{urgencyLevel === "high"
							? "Session Expiring Soon!"
							: "Session Timeout Warning"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center">
						<p className="text-muted-foreground mb-2">
							Your session will expire in:
						</p>
						<div
							className={`text-3xl font-bold ${
								urgencyLevel === "high"
									? "text-red-500"
									: urgencyLevel === "medium"
									? "text-orange-500"
									: "text-yellow-500"
							}`}
						>
							{formatTime(countdown)}
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>Time remaining</span>
							<span>{Math.round((countdown / warningThreshold) * 100)}%</span>
						</div>
						<Progress
							value={getProgressValue()}
							className={`h-2 ${
								urgencyLevel === "high"
									? "[&>div]:bg-red-500"
									: urgencyLevel === "medium"
									? "[&>div]:bg-orange-500"
									: "[&>div]:bg-yellow-500"
							}`}
						/>
					</div>

					<div className="bg-muted/50 p-3 rounded-lg">
						<div className="flex items-start gap-2">
							<Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
							<div className="text-sm text-muted-foreground">
								<p className="font-medium mb-1">For your security:</p>
								<p>
									We automatically log you out after periods of inactivity to
									protect your sensitive information.
								</p>
							</div>
						</div>
					</div>

					<div className="flex gap-3">
						<Button variant="outline" onClick={onLogout} className="flex-1">
							Log Out Now
						</Button>
						<Button
							onClick={handleExtendSession}
							disabled={isExtending}
							className="flex-1"
						>
							{isExtending ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									Extending...
								</>
							) : (
								"Stay Logged In"
							)}
						</Button>
					</div>

					<div className="text-xs text-center text-muted-foreground">
						Click anywhere on the page to reset your activity timer
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Hook for managing session timeout warnings
export function useSessionTimeoutWarning(
	sessionTimeoutMs: number = 30 * 60 * 1000, // 30 minutes
	warningTimeMs: number = 5 * 60 * 1000 // 5 minutes before timeout
) {
	const [isWarningVisible, setIsWarningVisible] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [lastActivity, setLastActivity] = useState(Date.now());

	const showWarning = useCallback((remainingTime: number) => {
		setTimeRemaining(Math.floor(remainingTime / 1000));
		setIsWarningVisible(true);
	}, []);

	const hideWarning = useCallback(() => {
		setIsWarningVisible(false);
		setTimeRemaining(0);
	}, []);

	const updateActivity = useCallback(() => {
		setLastActivity(Date.now());
		hideWarning();
	}, [hideWarning]);

	// Check for timeout warning
	useEffect(() => {
		const checkTimeout = () => {
			const now = Date.now();
			const timeSinceActivity = now - lastActivity;
			const timeUntilTimeout = sessionTimeoutMs - timeSinceActivity;

			if (timeUntilTimeout <= warningTimeMs && timeUntilTimeout > 0) {
				showWarning(timeUntilTimeout);
			} else if (timeUntilTimeout <= 0) {
				// Session has expired
				return false;
			}

			return true;
		};

		const interval = setInterval(checkTimeout, 1000);
		return () => clearInterval(interval);
	}, [lastActivity, sessionTimeoutMs, warningTimeMs, showWarning]);

	return {
		isWarningVisible,
		timeRemaining,
		showWarning,
		hideWarning,
		updateActivity,
	};
}
