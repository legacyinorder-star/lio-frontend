import { useEffect, useCallback, useState, useRef } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface SessionActivityOptions {
	warningThresholdMinutes?: number;
	timeoutMinutes?: number;
	checkIntervalMinutes?: number;
	enableWarnings?: boolean;
}

interface SessionActivityStatus {
	isActive: boolean;
	lastActivity: Date | null;
	timeUntilWarning: number;
	timeUntilTimeout: number;
	sessionDuration: number;
}

export function useSessionActivity(options: SessionActivityOptions = {}) {
	const {
		warningThresholdMinutes = 25,
		timeoutMinutes = 30,
		checkIntervalMinutes = 1,
		enableWarnings = true,
	} = options;

	const { user, logout, lastActivity } = useAuth();
	const [sessionStatus, setSessionStatus] = useState<SessionActivityStatus>({
		isActive: false,
		lastActivity: null,
		timeUntilWarning: 0,
		timeUntilTimeout: 0,
		sessionDuration: 0,
	});

	const warningShownRef = useRef(false);
	const sessionStartTimeRef = useRef<Date | null>(null);

	// Check if we're on an auth page
	const isOnAuthPage =
		typeof window !== "undefined" &&
		[
			"/login",
			"/signup",
			"/verify-otp",
			"/request-password-reset",
			"/reset-password",
		].includes(window.location.pathname);

	const shouldTrackActivity = user && !isOnAuthPage;

	// Reset warning flag when user becomes active again
	useEffect(() => {
		if (shouldTrackActivity && lastActivity) {
			warningShownRef.current = false;
		}
	}, [shouldTrackActivity, lastActivity]);

	// Track session start time
	useEffect(() => {
		if (shouldTrackActivity && !sessionStartTimeRef.current) {
			sessionStartTimeRef.current = new Date();
		} else if (!shouldTrackActivity) {
			sessionStartTimeRef.current = null;
			warningShownRef.current = false;
		}
	}, [shouldTrackActivity]);

	// Update session status
	const updateSessionStatus = useCallback(() => {
		if (!shouldTrackActivity || !lastActivity) {
			setSessionStatus({
				isActive: false,
				lastActivity: null,
				timeUntilWarning: 0,
				timeUntilTimeout: 0,
				sessionDuration: 0,
			});
			return;
		}

		const now = Date.now();
		const lastActivityTime = lastActivity.getTime();
		const timeSinceActivity = now - lastActivityTime;
		const sessionStartTime = sessionStartTimeRef.current?.getTime() || now;
		const sessionDuration = now - sessionStartTime;

		const warningThresholdMs = warningThresholdMinutes * 60 * 1000;
		const timeoutThresholdMs = timeoutMinutes * 60 * 1000;

		const timeUntilWarning = Math.max(
			0,
			warningThresholdMs - timeSinceActivity
		);
		const timeUntilTimeout = Math.max(
			0,
			timeoutThresholdMs - timeSinceActivity
		);
		const isActive = timeSinceActivity < timeoutThresholdMs;

		setSessionStatus({
			isActive,
			lastActivity,
			timeUntilWarning: Math.floor(timeUntilWarning / 1000), // Convert to seconds
			timeUntilTimeout: Math.floor(timeUntilTimeout / 1000), // Convert to seconds
			sessionDuration: Math.floor(sessionDuration / 1000), // Convert to seconds
		});

		// Show warning if enabled and threshold reached
		if (
			enableWarnings &&
			!warningShownRef.current &&
			timeSinceActivity >= warningThresholdMs &&
			timeSinceActivity < timeoutThresholdMs
		) {
			warningShownRef.current = true;
			const minutesLeft = Math.ceil(timeUntilTimeout / 60);

			toast.warning(
				`Your session will expire in ${minutesLeft} minute${
					minutesLeft !== 1 ? "s" : ""
				} due to inactivity. Please interact with the page to stay logged in.`,
				{
					duration: 15000,
					action: {
						label: "Stay Active",
						onClick: () => {
							// Trigger activity by dispatching a custom event
							document.dispatchEvent(new Event("mousedown"));
						},
					},
				}
			);
		}

		// Auto-logout if timeout reached
		if (timeSinceActivity >= timeoutThresholdMs) {
			toast.error("Session expired due to inactivity.");
			logout();
			window.location.href = "/login";
		}
	}, [
		shouldTrackActivity,
		lastActivity,
		warningThresholdMinutes,
		timeoutMinutes,
		enableWarnings,
		logout,
	]);

	// Set up periodic status updates
	useEffect(() => {
		if (shouldTrackActivity) {
			// Update immediately
			updateSessionStatus();

			// Then update every check interval
			const interval = setInterval(
				updateSessionStatus,
				checkIntervalMinutes * 60 * 1000
			);

			return () => clearInterval(interval);
		}
	}, [shouldTrackActivity, updateSessionStatus, checkIntervalMinutes]);

	// Format time helpers
	const formatTime = useCallback((seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		if (minutes > 0) {
			return `${minutes}m ${remainingSeconds}s`;
		}
		return `${remainingSeconds}s`;
	}, []);

	const formatDuration = useCallback((seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else if (minutes > 0) {
			return `${minutes}m`;
		}
		return "Less than 1m";
	}, []);

	// Force activity update (useful for manual session extension)
	const extendSession = useCallback(() => {
		if (shouldTrackActivity) {
			document.dispatchEvent(new Event("mousedown"));
			warningShownRef.current = false;
		}
	}, [shouldTrackActivity]);

	return {
		sessionStatus,
		formatTime,
		formatDuration,
		extendSession,
		isSessionActive: sessionStatus.isActive,
		minutesUntilWarning: Math.ceil(sessionStatus.timeUntilWarning / 60),
		minutesUntilTimeout: Math.ceil(sessionStatus.timeUntilTimeout / 60),
		sessionDurationFormatted: formatDuration(sessionStatus.sessionDuration),
	};
}
