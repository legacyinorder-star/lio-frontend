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

	// Don't set Content-Type for FormData - let the browser set it with boundary
	if (!(fetchOptions.body instanceof FormData)) {
		headers.set("Content-Type", "application/json");
	}

	// Add X-Data-Source header for non-production environments
	const env = import.meta.env.VITE_ENV;
	if (env && env !== "prod") {
		headers.set("X-Data-Source", "dev");
	}

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

	// Debug logging for FormData requests
	if (fetchOptions.body instanceof FormData) {
		console.log("🔄 Making FormData request to:", url);
		console.log("📋 FormData entries:");
		for (const [key, value] of fetchOptions.body.entries()) {
			if (value instanceof File) {
				console.log(
					`  ${key}:`,
					value.name || "unnamed",
					`(${value.size} bytes, ${value.type})`
				);
			} else if (
				typeof value === "object" &&
				value !== null &&
				"size" in value &&
				"type" in value
			) {
				console.log(
					`  ${key}:`,
					"blob",
					`(${(value as Blob).size} bytes, ${(value as Blob).type})`
				);
			} else {
				console.log(`  ${key}:`, value);
			}
		}
	}

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
			console.error(`❌ HTTP ${response.status} error for ${url}`);
			console.error(
				"Response headers:",
				Object.fromEntries(response.headers.entries())
			);
			console.error("Response data:", data);

			const message =
				typeof data === "object" && data !== null && "message" in data
					? String((data as { message: string }).message)
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
