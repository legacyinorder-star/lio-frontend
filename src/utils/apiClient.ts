import { getApiUrl } from "@/config/api";
import { getAuthToken, isTokenExpired } from "./auth";
import { toast } from "sonner";
import { handleAuthError, AUTH_ERROR_CODES } from "./authErrorHandler";

/**
 * Adds X-Data-Source header to headers for non-production environments
 * This can be used with direct fetch calls that bypass apiClient
 */
export const addDataSourceHeader = (
	headers: Headers | Record<string, string> | HeadersInit
): Headers => {
	const env = import.meta.env.VITE_ENV;
	const headerObj = headers instanceof Headers ? headers : new Headers(headers);

	if (env && env !== "prod" && env !== "production") {
		headerObj.set("X-Data-Source", "dev");
	}

	return headerObj;
};

interface ApiOptions extends RequestInit {
	authenticated?: boolean;
	retryCount?: number;
	skipRateLimit?: boolean;
	baseUrlOverride?: string;
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
	const { authenticated = true, baseUrlOverride, ...fetchOptions } = options;

	// Prepare headers
	const baseHeaders = new Headers(fetchOptions.headers);

	// Don't set Content-Type for FormData - let the browser set it with boundary
	if (!(fetchOptions.body instanceof FormData)) {
		baseHeaders.set("Content-Type", "application/json");
	}

	// Add X-Data-Source header for non-production environments
	const headers = addDataSourceHeader(baseHeaders);

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

	const resolveUrl = () => {
		if (baseUrlOverride) {
			if (endpoint.startsWith("http")) {
				return endpoint;
			}
			return `${baseUrlOverride}${endpoint}`;
		}
		return getApiUrl(endpoint);
	};

	const url = resolveUrl();

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
