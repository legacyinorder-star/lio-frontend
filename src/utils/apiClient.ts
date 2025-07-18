import { getApiUrl } from "@/config/api";
import { getAuthToken, isTokenExpired } from "./auth";
import { toast } from "sonner";
import { handleAuthError, AUTH_ERROR_CODES } from "./authErrorHandler";

interface ApiOptions extends RequestInit {
	authenticated?: boolean;
	retryCount?: number;
	skipRateLimit?: boolean;
}

interface ApiResponse<T> {
	data: T | null;
	error: string | null;
	status: number;
}

// Remove RateLimitManager, rate limit config, and all related logic
// Simplify apiClient to just make the request directly

export async function apiClient<T = unknown>(
	endpoint: string,
	options: ApiOptions = {}
): Promise<ApiResponse<T>> {
	const { authenticated = true, ...fetchOptions } = options;

	// Prepare headers
	const headers = new Headers(fetchOptions.headers);
	headers.set("Content-Type", "application/json");

	// Add authentication token if required
	if (authenticated) {
		const token = getAuthToken();
		if (token) {
			// Check if token is expired before making the request
			// Skip client-side expiration check for JWE tokens (they're encrypted)
			const parts = token.split(".");
			const isJWE = parts.length === 5;
			if (!isJWE && isTokenExpired(token)) {
				handleAuthError(AUTH_ERROR_CODES.TOKEN_EXPIRED);
				return {
					data: null,
					error: "Token expired",
					status: 401,
				};
			}
			headers.set("Authorization", `Bearer ${token}`);
		} else {
			handleAuthError(AUTH_ERROR_CODES.UNAUTHORIZED);
			return {
				data: null,
				error: "Authentication required",
				status: 401,
			};
		}
	}

	const url = getApiUrl(endpoint);
	try {
		const response = await fetch(url, {
			...fetchOptions,
			headers,
		});
		let data: T | null = null;
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			data = await response.json();
		}
		if (!response.ok) {
			const message =
				typeof data === "object" && data !== null && "message" in data
					? String((data as any).message)
					: `Request failed with status ${response.status}`;
			if (response.status === 401) {
				handleAuthError(AUTH_ERROR_CODES.UNAUTHORIZED);
				return {
					data: null,
					error: "Authentication required",
					status: 401,
				};
			} else if (response.status === 403) {
				handleAuthError(AUTH_ERROR_CODES.FORBIDDEN);
			} else if (response.status >= 500) {
				handleAuthError(AUTH_ERROR_CODES.SERVER_ERROR);
			} else if (response.status >= 400) {
				toast.error(message);
			}
			return {
				data: null,
				error: message,
				status: response.status,
			};
		}
		return {
			data,
			error: null,
			status: response.status,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Network error";
		return {
			data: null,
			error: message,
			status: 0,
		};
	}
}
