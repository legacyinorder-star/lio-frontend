import { toast } from "sonner";
import { removeAuthData } from "./auth";

export interface AuthError {
	code: string;
	message: string;
	action?: "logout" | "redirect" | "retry" | "none";
	redirectTo?: string;
}

export const AUTH_ERROR_CODES = {
	TOKEN_EXPIRED: "TOKEN_EXPIRED",
	INVALID_TOKEN: "INVALID_TOKEN",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	NETWORK_ERROR: "NETWORK_ERROR",
	SERVER_ERROR: "SERVER_ERROR",
	RATE_LIMITED: "RATE_LIMITED",
	SESSION_EXPIRED: "SESSION_EXPIRED",
	INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
	OTP_EXPIRED: "OTP_EXPIRED",
	OTP_INVALID: "OTP_INVALID",
} as const;

export type AuthErrorCode =
	(typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
	[AUTH_ERROR_CODES.TOKEN_EXPIRED]:
		"Your session has expired. Please log in again.",
	[AUTH_ERROR_CODES.INVALID_TOKEN]:
		"Invalid authentication token. Please log in again.",
	[AUTH_ERROR_CODES.UNAUTHORIZED]:
		"You are not authorized to access this resource.",
	[AUTH_ERROR_CODES.FORBIDDEN]:
		"You don't have permission to perform this action.",
	[AUTH_ERROR_CODES.NETWORK_ERROR]:
		"Network error. Please check your connection and try again.",
	[AUTH_ERROR_CODES.SERVER_ERROR]: "Server error. Please try again later.",
	[AUTH_ERROR_CODES.RATE_LIMITED]:
		"Too many requests. Please wait a moment and try again.",
	[AUTH_ERROR_CODES.SESSION_EXPIRED]:
		"Your session has expired due to inactivity.",
	[AUTH_ERROR_CODES.INVALID_CREDENTIALS]:
		"Invalid email or password. Please try again.",
	[AUTH_ERROR_CODES.OTP_EXPIRED]:
		"OTP code has expired. Please request a new one.",
	[AUTH_ERROR_CODES.OTP_INVALID]:
		"Invalid OTP code. Please check and try again.",
};

const AUTH_PAGES = [
	"/login",
	"/signup",
	"/verify-otp",
	"/request-password-reset",
	"/reset-password",
];

export class AuthErrorHandler {
	private static instance: AuthErrorHandler;
	private errorMetrics: Map<AuthErrorCode, number> = new Map();

	static getInstance(): AuthErrorHandler {
		if (!AuthErrorHandler.instance) {
			AuthErrorHandler.instance = new AuthErrorHandler();
		}
		return AuthErrorHandler.instance;
	}

	/**
	 * Handle authentication errors with consistent behavior
	 */
	handleError(error: AuthError | AuthErrorCode | Error | string): void {
		let authError: AuthError;

		// Normalize error to AuthError format
		if (typeof error === "string") {
			authError = this.createError(error as AuthErrorCode);
		} else if (error instanceof Error) {
			authError = this.mapErrorToAuthError(error);
		} else if (typeof error === "object" && "code" in error) {
			authError = error as AuthError;
		} else {
			authError = this.createError(AUTH_ERROR_CODES.SERVER_ERROR);
		}

		// Track error metrics
		this.trackError(authError.code as AuthErrorCode);

		// Show user-friendly message
		this.showErrorMessage(authError);

		// Perform required action
		this.performAction(authError);
	}

	/**
	 * Create standardized auth error
	 */
	createError(code: AuthErrorCode, customMessage?: string): AuthError {
		const message = customMessage || AUTH_ERROR_MESSAGES[code];
		let action: AuthError["action"] = "none";
		let redirectTo: string | undefined;

		// Determine action based on error code
		switch (code) {
			case AUTH_ERROR_CODES.TOKEN_EXPIRED:
			case AUTH_ERROR_CODES.INVALID_TOKEN:
			case AUTH_ERROR_CODES.SESSION_EXPIRED:
				action = "logout";
				redirectTo = "/login";
				break;
			case AUTH_ERROR_CODES.UNAUTHORIZED:
				action = "redirect";
				redirectTo = "/login";
				break;
			case AUTH_ERROR_CODES.FORBIDDEN:
				action = "redirect";
				redirectTo = "/app/dashboard";
				break;
			case AUTH_ERROR_CODES.RATE_LIMITED:
				action = "retry";
				break;
			default:
				action = "none";
		}

		return { code, message, action, redirectTo };
	}

	/**
	 * Map generic errors to auth errors
	 */
	private mapErrorToAuthError(error: Error): AuthError {
		const message = error.message.toLowerCase();

		if (message.includes("token") && message.includes("expired")) {
			return this.createError(AUTH_ERROR_CODES.TOKEN_EXPIRED);
		}
		if (message.includes("unauthorized") || message.includes("401")) {
			return this.createError(AUTH_ERROR_CODES.UNAUTHORIZED);
		}
		if (message.includes("forbidden") || message.includes("403")) {
			return this.createError(AUTH_ERROR_CODES.FORBIDDEN);
		}
		if (message.includes("network") || message.includes("fetch")) {
			return this.createError(AUTH_ERROR_CODES.NETWORK_ERROR);
		}
		if (message.includes("otp") && message.includes("invalid")) {
			return this.createError(AUTH_ERROR_CODES.OTP_INVALID);
		}
		if (message.includes("otp") && message.includes("expired")) {
			return this.createError(AUTH_ERROR_CODES.OTP_EXPIRED);
		}

		return this.createError(AUTH_ERROR_CODES.SERVER_ERROR, error.message);
	}

	/**
	 * Show appropriate error message to user
	 */
	private showErrorMessage(error: AuthError): void {
		switch (error.code) {
			case AUTH_ERROR_CODES.TOKEN_EXPIRED:
			case AUTH_ERROR_CODES.SESSION_EXPIRED:
			case AUTH_ERROR_CODES.UNAUTHORIZED:
				toast.error(error.message);
				break;
			case AUTH_ERROR_CODES.FORBIDDEN:
				toast.error(error.message);
				break;
			case AUTH_ERROR_CODES.NETWORK_ERROR:
				toast.error(error.message, { duration: 5000 });
				break;
			case AUTH_ERROR_CODES.RATE_LIMITED:
				toast.warning(error.message, { duration: 8000 });
				break;
			case AUTH_ERROR_CODES.SERVER_ERROR:
				toast.error(error.message);
				break;
			default:
				toast.error(error.message);
		}
	}

	/**
	 * Perform the required action based on error type
	 */
	private performAction(error: AuthError): void {
		const currentPath = window.location.pathname;
		const isOnAuthPage = AUTH_PAGES.includes(currentPath);

		switch (error.action) {
			case "logout":
				removeAuthData();
				// Clear all auth-related storage
				sessionStorage.clear();
				localStorage.removeItem("returnUrl");

				if (!isOnAuthPage && error.redirectTo) {
					// Store return URL for after login
					localStorage.setItem("returnUrl", currentPath);
					window.location.href = error.redirectTo;
				}
				break;

			case "redirect":
				if (!isOnAuthPage && error.redirectTo) {
					// Store return URL for after login
					if (error.redirectTo === "/login") {
						localStorage.setItem("returnUrl", currentPath);
					}
					window.location.href = error.redirectTo;
				}
				break;

			case "retry":
				// For rate limiting, we just show the message
				// The calling code can decide whether to retry
				break;

			case "none":
			default:
				// No action required
				break;
		}
	}

	/**
	 * Track error metrics for monitoring
	 */
	private trackError(code: AuthErrorCode): void {
		const currentCount = this.errorMetrics.get(code) || 0;
		this.errorMetrics.set(code, currentCount + 1);

		// Log for debugging/monitoring
		console.warn(`Auth Error: ${code} (count: ${currentCount + 1})`);

		// Could send to analytics service here
		// analytics.track('auth_error', { code, count: currentCount + 1 });
	}

	/**
	 * Get error metrics for monitoring
	 */
	getErrorMetrics(): Record<string, number> {
		const metrics: Record<string, number> = {};
		this.errorMetrics.forEach((count, code) => {
			metrics[code] = count;
		});
		return metrics;
	}

	/**
	 * Reset error metrics (useful for testing)
	 */
	resetMetrics(): void {
		this.errorMetrics.clear();
	}

	/**
	 * Handle HTTP response errors
	 */
	handleHttpError(response: Response, customMessage?: string): void {
		let errorCode: AuthErrorCode;

		switch (response.status) {
			case 401:
				errorCode = AUTH_ERROR_CODES.UNAUTHORIZED;
				break;
			case 403:
				errorCode = AUTH_ERROR_CODES.FORBIDDEN;
				break;
			case 429:
				errorCode = AUTH_ERROR_CODES.RATE_LIMITED;
				break;
			case 500:
			case 502:
			case 503:
			case 504:
				errorCode = AUTH_ERROR_CODES.SERVER_ERROR;
				break;
			default:
				errorCode = AUTH_ERROR_CODES.SERVER_ERROR;
		}

		const error = this.createError(errorCode, customMessage);
		this.handleError(error);
	}
}

// Export singleton instance
export const authErrorHandler = AuthErrorHandler.getInstance();

// Export convenience functions
export const handleAuthError = (
	error: AuthError | AuthErrorCode | Error | string
) => {
	authErrorHandler.handleError(error);
};

export const createAuthError = (
	code: AuthErrorCode,
	customMessage?: string
) => {
	return authErrorHandler.createError(code, customMessage);
};

export const getAuthErrorMetrics = () => {
	return authErrorHandler.getErrorMetrics();
};
