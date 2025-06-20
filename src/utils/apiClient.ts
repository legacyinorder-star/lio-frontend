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

interface RateLimitInfo {
	requests: Date[];
	isLimited: boolean;
	resetTime: Date | null;
}

interface QueuedRequest {
	endpoint: string;
	options: ApiOptions;
	resolve: (value: ApiResponse<unknown>) => void;
	reject: (reason: Error) => void;
	timestamp: Date;
	retryCount: number;
}

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
	maxRequests: 10,
	windowMs: 20 * 1000, // 20 seconds
	retryDelay: 2000, // Initial retry delay (2 seconds)
	maxRetries: 3,
	backoffMultiplier: 2, // Exponential backoff multiplier
	maxDelay: 30000, // Maximum delay (30 seconds)
};

// Global rate limit state
class RateLimitManager {
	private static instance: RateLimitManager;
	private rateLimitInfo: RateLimitInfo = {
		requests: [],
		isLimited: false,
		resetTime: null,
	};
	private requestQueue: QueuedRequest[] = [];
	private isProcessingQueue = false;

	static getInstance(): RateLimitManager {
		if (!RateLimitManager.instance) {
			RateLimitManager.instance = new RateLimitManager();
		}
		return RateLimitManager.instance;
	}

	/**
	 * Clean up old requests from the tracking window
	 */
	private cleanupOldRequests(): void {
		const now = new Date();
		const windowStart = new Date(now.getTime() - RATE_LIMIT_CONFIG.windowMs);

		this.rateLimitInfo.requests = this.rateLimitInfo.requests.filter(
			(requestTime) => requestTime > windowStart
		);
	}

	/**
	 * Check if we're currently rate limited
	 */
	isRateLimited(): boolean {
		this.cleanupOldRequests();

		const now = new Date();

		// Check if we're in a rate limit cooldown period
		if (this.rateLimitInfo.resetTime && now < this.rateLimitInfo.resetTime) {
			return true;
		}

		// Check if we've exceeded the request limit
		if (this.rateLimitInfo.requests.length >= RATE_LIMIT_CONFIG.maxRequests) {
			// Set reset time to when the oldest request will expire
			const oldestRequest = this.rateLimitInfo.requests[0];
			this.rateLimitInfo.resetTime = new Date(
				oldestRequest.getTime() + RATE_LIMIT_CONFIG.windowMs
			);
			this.rateLimitInfo.isLimited = true;
			return true;
		}

		this.rateLimitInfo.isLimited = false;
		this.rateLimitInfo.resetTime = null;
		return false;
	}

	/**
	 * Record a successful request
	 */
	recordRequest(): void {
		this.rateLimitInfo.requests.push(new Date());
		this.cleanupOldRequests();
	}

	/**
	 * Calculate delay before next request attempt
	 */
	calculateDelay(retryCount: number): number {
		const baseDelay = RATE_LIMIT_CONFIG.retryDelay;
		const exponentialDelay =
			baseDelay * Math.pow(RATE_LIMIT_CONFIG.backoffMultiplier, retryCount);
		const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd

		return Math.min(exponentialDelay + jitter, RATE_LIMIT_CONFIG.maxDelay);
	}

	/**
	 * Get time until rate limit resets
	 */
	getTimeUntilReset(): number {
		if (!this.rateLimitInfo.resetTime) return 0;

		const now = new Date();
		return Math.max(0, this.rateLimitInfo.resetTime.getTime() - now.getTime());
	}

	/**
	 * Add request to queue
	 */
	queueRequest<T>(
		endpoint: string,
		options: ApiOptions,
		resolve: (value: ApiResponse<T>) => void,
		reject: (reason: Error) => void,
		retryCount: number = 0
	): void {
		this.requestQueue.push({
			endpoint,
			options,
			resolve: resolve as (value: ApiResponse<unknown>) => void,
			reject,
			timestamp: new Date(),
			retryCount,
		});

		this.processQueue();
	}

	/**
	 * Process queued requests
	 */
	private async processQueue(): Promise<void> {
		if (this.isProcessingQueue || this.requestQueue.length === 0) {
			return;
		}

		this.isProcessingQueue = true;

		while (this.requestQueue.length > 0) {
			if (this.isRateLimited()) {
				const delay = this.getTimeUntilReset();
				console.log(
					`Rate limited. Waiting ${delay}ms before processing queue.`
				);

				// Show user feedback for longer delays
				if (delay > 5000) {
					toast.info(
						`Rate limit reached. Retrying in ${Math.ceil(
							delay / 1000
						)} seconds...`,
						{
							duration: Math.min(delay, 10000),
						}
					);
				}

				await this.sleep(delay);
				continue;
			}

			const queuedRequest = this.requestQueue.shift()!;

			try {
				const response = await this.executeRequest(
					queuedRequest.endpoint,
					queuedRequest.options
				);
				queuedRequest.resolve(response);
			} catch (error) {
				const errorObj =
					error instanceof Error ? error : new Error(String(error));
				queuedRequest.reject(errorObj);
			}
		}

		this.isProcessingQueue = false;
	}

	/**
	 * Execute the actual HTTP request
	 */
	private async executeRequest<T>(
		endpoint: string,
		options: ApiOptions
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
				console.log(
					`Adding Authorization header for ${endpoint}: Bearer ${token.substring(
						0,
						20
					)}...`
				);
			} else {
				// If authentication is required but no token is available
				console.error(
					`No auth token available for authenticated request to ${endpoint}`
				);
				handleAuthError(AUTH_ERROR_CODES.UNAUTHORIZED);
				return {
					data: null,
					error: "Authentication required",
					status: 401,
				};
			}
		} else {
			console.log(`Skipping authentication for ${endpoint}`);
		}

		// Prepare the request
		const url = getApiUrl(endpoint);

		try {
			// Record the request attempt
			this.recordRequest();

			console.log(`Making request to: ${url}`);
			console.log(`Request headers:`, Object.fromEntries(headers.entries()));

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

				// Handle different error codes using centralized error handler
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
				} else if (response.status === 429) {
					// Handle rate limit response from server
					const retryAfter = response.headers.get("Retry-After");
					if (retryAfter) {
						const retryDelay = parseInt(retryAfter) * 1000; // Convert to ms
						this.rateLimitInfo.resetTime = new Date(Date.now() + retryDelay);
					}
					handleAuthError(AUTH_ERROR_CODES.RATE_LIMITED);
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

			return {
				data: null,
				error: message,
				status: 0, // 0 indicates a network error
			};
		}
	}

	/**
	 * Sleep utility function
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Get current rate limit status for debugging
	 */
	getStatus() {
		this.cleanupOldRequests();
		return {
			requestCount: this.rateLimitInfo.requests.length,
			maxRequests: RATE_LIMIT_CONFIG.maxRequests,
			isLimited: this.isRateLimited(),
			resetTime: this.rateLimitInfo.resetTime,
			queueLength: this.requestQueue.length,
			timeUntilReset: this.getTimeUntilReset(),
		};
	}
}

/**
 * API client for making authenticated and non-authenticated requests with rate limiting
 */
export async function apiClient<T = unknown>(
	endpoint: string,
	options: ApiOptions = {}
): Promise<ApiResponse<T>> {
	const rateLimitManager = RateLimitManager.getInstance();
	const { retryCount = 0, skipRateLimit = false } = options;

	// Skip rate limiting for certain critical requests if needed
	if (skipRateLimit) {
		return rateLimitManager["executeRequest"](endpoint, options);
	}

	// If we're rate limited, queue the request
	if (rateLimitManager.isRateLimited()) {
		return new Promise<ApiResponse<T>>((resolve, reject) => {
			rateLimitManager.queueRequest(
				endpoint,
				options,
				resolve,
				reject,
				retryCount
			);
		});
	}

	// Execute request immediately if not rate limited
	try {
		const response = await rateLimitManager["executeRequest"]<T>(
			endpoint,
			options
		);

		// Handle rate limit errors with retry logic
		if (response.status === 429 && retryCount < RATE_LIMIT_CONFIG.maxRetries) {
			const delay = rateLimitManager.calculateDelay(retryCount);

			console.log(
				`Rate limited. Retrying request to ${endpoint} in ${delay}ms (attempt ${
					retryCount + 1
				}/${RATE_LIMIT_CONFIG.maxRetries})`
			);

			return new Promise<ApiResponse<T>>((resolve, reject) => {
				setTimeout(() => {
					apiClient<T>(endpoint, { ...options, retryCount: retryCount + 1 })
						.then(resolve)
						.catch(reject);
				}, delay);
			});
		}

		return response;
	} catch (error) {
		// Handle network errors with retry logic
		if (retryCount < RATE_LIMIT_CONFIG.maxRetries) {
			const delay = rateLimitManager.calculateDelay(retryCount);

			console.log(
				`Network error. Retrying request to ${endpoint} in ${delay}ms (attempt ${
					retryCount + 1
				}/${RATE_LIMIT_CONFIG.maxRetries})`
			);

			return new Promise<ApiResponse<T>>((resolve, reject) => {
				setTimeout(() => {
					apiClient<T>(endpoint, { ...options, retryCount: retryCount + 1 })
						.then(resolve)
						.catch(reject);
				}, delay);
			});
		}

		// Max retries exceeded
		return {
			data: null,
			error: error instanceof Error ? error.message : "Network error",
			status: 0,
		};
	}
}

/**
 * Get current rate limit status for debugging and monitoring
 */
export function getRateLimitStatus() {
	return RateLimitManager.getInstance().getStatus();
}

/**
 * Force clear rate limit state (useful for testing or manual reset)
 */
export function clearRateLimit() {
	const manager = RateLimitManager.getInstance();
	manager["rateLimitInfo"] = {
		requests: [],
		isLimited: false,
		resetTime: null,
	};
	manager["requestQueue"] = [];
}
