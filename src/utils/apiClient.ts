import { getApiUrl } from "@/config/api";
import { getAuthToken, removeAuthData, isTokenExpired } from "./auth";
import { toast } from "sonner";

interface ApiOptions extends RequestInit {
	authenticated?: boolean;
}

interface ApiResponse<T> {
	data: T | null;
	error: string | null;
	status: number;
}

/**
 * API client for making authenticated and non-authenticated requests
 */
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
			if (isTokenExpired(token)) {
				toast.error("Your session has expired. Please log in again.");
				removeAuthData();
				// Force redirect to login
				window.location.href = "/login";
				return {
					data: null,
					error: "Token expired",
					status: 401,
				};
			}

			headers.set("Authorization", `Bearer ${token}`);
		} else {
			// If authentication is required but no token is available
			removeAuthData(); // Clean up any stale auth data
			toast.error("Authentication required. Please log in.");
			// Force redirect to login
			window.location.href = "/login";
			return {
				data: null,
				error: "Authentication required",
				status: 401,
			};
		}
	}

	// Prepare the request
	const url = getApiUrl(endpoint);

	try {
		const response = await fetch(url, {
			...fetchOptions,
			headers,
		});

		// Parse the response
		let data: T | null = null;
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			data = await response.json();
		}

		// Handle error responses
		if (!response.ok) {
			const message =
				typeof data === "object" && data !== null && "message" in data
					? String(data.message)
					: `Request failed with status ${response.status}`;

			// Handle different error codes
			if (response.status === 401) {
				toast.error("Session expired. Please log in again.");
				removeAuthData(); // Clear auth data
				// Force redirect to login immediately
				window.location.href = "/login";

				return {
					data: null,
					error: "Authentication required",
					status: 401,
				};
			} else if (response.status === 403) {
				toast.error("You don't have permission to perform this action.");
			} else if (response.status >= 500) {
				toast.error("Server error. Please try again later.");
			} else if (response.status === 429) {
				toast.error("Too many requests. Please wait a moment and try again.");
			} else if (response.status >= 400) {
				// Show the specific error message for client errors
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
		console.error("API request failed:", error);
		const message = error instanceof Error ? error.message : "Network error";

		// Don't show network error toasts for every failed request
		// Let components handle this based on context
		if (error instanceof TypeError && error.message.includes("fetch")) {
			// Network connectivity issue
			return {
				data: null,
				error: "Network error: Unable to connect to server",
				status: 0,
			};
		}

		toast.error("Connection error. Please check your internet connection.");

		return {
			data: null,
			error: message,
			status: 0, // 0 indicates a network error
		};
	}
}
