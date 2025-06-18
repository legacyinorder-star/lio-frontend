import { getAuthErrorMetrics } from "./authErrorHandler";
import { getAuthToken, getUserDetails } from "./auth";

export interface AuthFlowMetrics {
	loginAttempts: number;
	loginSuccesses: number;
	loginFailures: number;
	otpAttempts: number;
	otpSuccesses: number;
	otpFailures: number;
	sessionTimeouts: number;
	tokenRefreshes: number;
	averageSessionDuration: number;
	lastLoginTime?: number;
	lastLogoutTime?: number;
}

class AuthMetricsTracker {
	private static instance: AuthMetricsTracker;
	private metrics: AuthFlowMetrics = {
		loginAttempts: 0,
		loginSuccesses: 0,
		loginFailures: 0,
		otpAttempts: 0,
		otpSuccesses: 0,
		otpFailures: 0,
		sessionTimeouts: 0,
		tokenRefreshes: 0,
		averageSessionDuration: 0,
	};

	static getInstance(): AuthMetricsTracker {
		if (!AuthMetricsTracker.instance) {
			AuthMetricsTracker.instance = new AuthMetricsTracker();
		}
		return AuthMetricsTracker.instance;
	}

	// Track login attempt
	trackLoginAttempt(): void {
		this.metrics.loginAttempts++;
		this.saveMetrics();
	}

	// Track successful login
	trackLoginSuccess(): void {
		this.metrics.loginSuccesses++;
		this.metrics.lastLoginTime = Date.now();
		this.saveMetrics();
	}

	// Track failed login
	trackLoginFailure(): void {
		this.metrics.loginFailures++;
		this.saveMetrics();
	}

	// Track OTP attempt
	trackOtpAttempt(): void {
		this.metrics.otpAttempts++;
		this.saveMetrics();
	}

	// Track successful OTP
	trackOtpSuccess(): void {
		this.metrics.otpSuccesses++;
		this.saveMetrics();
	}

	// Track failed OTP
	trackOtpFailure(): void {
		this.metrics.otpFailures++;
		this.saveMetrics();
	}

	// Track session timeout
	trackSessionTimeout(): void {
		this.metrics.sessionTimeouts++;
		this.updateSessionDuration();
		this.saveMetrics();
	}

	// Track token refresh
	trackTokenRefresh(): void {
		this.metrics.tokenRefreshes++;
		this.saveMetrics();
	}

	// Track logout
	trackLogout(): void {
		this.metrics.lastLogoutTime = Date.now();
		this.updateSessionDuration();
		this.saveMetrics();
	}

	// Update average session duration
	private updateSessionDuration(): void {
		if (this.metrics.lastLoginTime && this.metrics.lastLogoutTime) {
			const sessionDuration =
				this.metrics.lastLogoutTime - this.metrics.lastLoginTime;
			const totalSessions = this.metrics.loginSuccesses;

			if (totalSessions > 0) {
				this.metrics.averageSessionDuration =
					(this.metrics.averageSessionDuration * (totalSessions - 1) +
						sessionDuration) /
					totalSessions;
			}
		}
	}

	// Get current metrics
	getMetrics(): AuthFlowMetrics {
		return { ...this.metrics };
	}

	// Get success rates
	getSuccessRates(): {
		loginSuccessRate: number;
		otpSuccessRate: number;
	} {
		const loginSuccessRate =
			this.metrics.loginAttempts > 0
				? (this.metrics.loginSuccesses / this.metrics.loginAttempts) * 100
				: 0;

		const otpSuccessRate =
			this.metrics.otpAttempts > 0
				? (this.metrics.otpSuccesses / this.metrics.otpAttempts) * 100
				: 0;

		return { loginSuccessRate, otpSuccessRate };
	}

	// Reset metrics
	resetMetrics(): void {
		this.metrics = {
			loginAttempts: 0,
			loginSuccesses: 0,
			loginFailures: 0,
			otpAttempts: 0,
			otpSuccesses: 0,
			otpFailures: 0,
			sessionTimeouts: 0,
			tokenRefreshes: 0,
			averageSessionDuration: 0,
		};
		this.saveMetrics();
	}

	// Save metrics to localStorage
	private saveMetrics(): void {
		try {
			localStorage.setItem("authMetrics", JSON.stringify(this.metrics));
		} catch (error) {
			console.warn("Failed to save auth metrics:", error);
		}
	}

	// Load metrics from localStorage
	loadMetrics(): void {
		try {
			const saved = localStorage.getItem("authMetrics");
			if (saved) {
				this.metrics = { ...this.metrics, ...JSON.parse(saved) };
			}
		} catch (error) {
			console.warn("Failed to load auth metrics:", error);
		}
	}
}

// Export singleton instance
export const authMetrics = AuthMetricsTracker.getInstance();

// Export convenience functions
export const trackLoginAttempt = () => authMetrics.trackLoginAttempt();
export const trackLoginSuccess = () => authMetrics.trackLoginSuccess();
export const trackLoginFailure = () => authMetrics.trackLoginFailure();
export const trackOtpAttempt = () => authMetrics.trackOtpAttempt();
export const trackOtpSuccess = () => authMetrics.trackOtpSuccess();
export const trackOtpFailure = () => authMetrics.trackOtpFailure();
export const trackSessionTimeout = () => authMetrics.trackSessionTimeout();
export const trackTokenRefresh = () => authMetrics.trackTokenRefresh();
export const trackLogout = () => authMetrics.trackLogout();

// Auth system health check
export function performAuthHealthCheck(): {
	isHealthy: boolean;
	issues: string[];
	recommendations: string[];
} {
	const issues: string[] = [];
	const recommendations: string[] = [];

	// Check if user has valid auth data
	const token = getAuthToken();
	const userDetails = getUserDetails();

	if (!token) {
		issues.push("No authentication token found");
		recommendations.push("User needs to log in");
	}

	if (!userDetails) {
		issues.push("No user details found");
		recommendations.push("User details may need to be refreshed");
	}

	// Check error metrics
	const errorMetrics = getAuthErrorMetrics();
	const totalErrors = Object.values(errorMetrics).reduce(
		(sum, count) => sum + count,
		0
	);

	if (totalErrors > 10) {
		issues.push(`High error count: ${totalErrors} auth errors`);
		recommendations.push("Check network connectivity and server status");
	}

	// Check success rates
	const { loginSuccessRate, otpSuccessRate } = authMetrics.getSuccessRates();

	if (loginSuccessRate < 80 && authMetrics.getMetrics().loginAttempts > 5) {
		issues.push(`Low login success rate: ${loginSuccessRate.toFixed(1)}%`);
		recommendations.push("Check credentials and network connectivity");
	}

	if (otpSuccessRate < 90 && authMetrics.getMetrics().otpAttempts > 3) {
		issues.push(`Low OTP success rate: ${otpSuccessRate.toFixed(1)}%`);
		recommendations.push("Check OTP delivery and user input");
	}

	return {
		isHealthy: issues.length === 0,
		issues,
		recommendations,
	};
}

// Get comprehensive auth status
export function getAuthStatus(): {
	isAuthenticated: boolean;
	tokenValid: boolean;
	userDetailsAvailable: boolean;
	metrics: AuthFlowMetrics;
	errorMetrics: Record<string, number>;
	healthCheck: ReturnType<typeof performAuthHealthCheck>;
} {
	const token = getAuthToken();
	const userDetails = getUserDetails();

	return {
		isAuthenticated: !!(token && userDetails),
		tokenValid: !!token,
		userDetailsAvailable: !!userDetails,
		metrics: authMetrics.getMetrics(),
		errorMetrics: getAuthErrorMetrics(),
		healthCheck: performAuthHealthCheck(),
	};
}

// Development helper to log auth status
export function logAuthStatus(): void {
	if (import.meta.env.DEV) {
		const status = getAuthStatus();
		console.group("🔐 Auth Status");
		console.log("Authenticated:", status.isAuthenticated);
		console.log("Token Valid:", status.tokenValid);
		console.log("User Details:", status.userDetailsAvailable);
		console.log("Metrics:", status.metrics);
		console.log("Error Metrics:", status.errorMetrics);
		console.log("Health Check:", status.healthCheck);
		console.groupEnd();
	}
}

// Initialize metrics tracking
authMetrics.loadMetrics();
