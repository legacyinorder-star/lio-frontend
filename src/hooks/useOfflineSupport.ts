import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface OfflineQueueItem {
	id: string;
	url: string;
	options: RequestInit;
	timestamp: number;
	retries: number;
}

interface OfflineSupportConfig {
	maxRetries?: number;
	retryDelay?: number;
	showOfflineToast?: boolean;
	enableQueueing?: boolean;
}

export function useOfflineSupport(config: OfflineSupportConfig = {}) {
	const {
		maxRetries = 3,
		retryDelay = 2000,
		showOfflineToast = true,
		enableQueueing = true,
	} = config;

	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
	const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);

	// Handle online status changes
	const handleOnline = useCallback(() => {
		setIsOnline(true);
		setHasShownOfflineToast(false);

		if (showOfflineToast) {
			toast.success("Connection restored! Syncing data...", {
				duration: 3000,
			});
		}

		// Process offline queue when coming back online
		if (enableQueueing && offlineQueue.length > 0) {
			processOfflineQueue();
		}
	}, [showOfflineToast, enableQueueing, offlineQueue.length]);

	const handleOffline = useCallback(() => {
		setIsOnline(false);

		if (showOfflineToast && !hasShownOfflineToast) {
			toast.warning(
				"You're offline. Some features may not work until connection is restored.",
				{
					duration: 8000,
				}
			);
			setHasShownOfflineToast(true);
		}
	}, [showOfflineToast, hasShownOfflineToast]);

	// Set up event listeners
	useEffect(() => {
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [handleOnline, handleOffline]);

	// Process queued requests when coming back online
	const processOfflineQueue = useCallback(async () => {
		if (offlineQueue.length === 0) return;

		const itemsToProcess = [...offlineQueue];
		setOfflineQueue([]);

		for (const item of itemsToProcess) {
			try {
				await fetch(item.url, item.options);
				console.log(`Successfully processed queued request: ${item.id}`);
			} catch (error) {
				console.error(`Failed to process queued request ${item.id}:`, error);

				// Re-queue if under retry limit
				if (item.retries < maxRetries) {
					setTimeout(() => {
						setOfflineQueue((prev) => [
							...prev,
							{
								...item,
								retries: item.retries + 1,
							},
						]);
					}, retryDelay * (item.retries + 1));
				} else {
					toast.error(`Failed to sync some data. Please try again manually.`);
				}
			}
		}
	}, [offlineQueue, maxRetries, retryDelay]);

	// Add request to offline queue
	const queueRequest = useCallback(
		(url: string, options: RequestInit) => {
			if (!enableQueueing) return;

			const queueItem: OfflineQueueItem = {
				id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				url,
				options,
				timestamp: Date.now(),
				retries: 0,
			};

			setOfflineQueue((prev) => [...prev, queueItem]);

			toast.info("Request queued for when connection is restored.", {
				duration: 4000,
			});
		},
		[enableQueueing]
	);

	// Enhanced fetch with offline support
	const offlineAwareFetch = useCallback(
		async (url: string, options: RequestInit = {}): Promise<Response> => {
			if (!isOnline) {
				// Queue non-GET requests for later
				if (options.method && options.method !== "GET") {
					queueRequest(url, options);
					throw new Error("Offline: Request queued for later processing");
				}

				// For GET requests, try to return cached data or throw
				throw new Error("Offline: No cached data available");
			}

			try {
				const response = await fetch(url, options);

				// If request fails due to network, queue it if offline
				if (!response.ok && !navigator.onLine) {
					queueRequest(url, options);
					throw new Error("Network error: Request queued for later processing");
				}

				return response;
			} catch (error) {
				// If fetch fails and we're offline, queue the request
				if (!navigator.onLine && options.method && options.method !== "GET") {
					queueRequest(url, options);
					throw new Error("Offline: Request queued for later processing");
				}

				throw error;
			}
		},
		[isOnline, queueRequest]
	);

	// Get cached auth data for offline use
	const getCachedAuthData = useCallback(() => {
		try {
			const token = localStorage.getItem("authToken");
			const userDetails = localStorage.getItem("userDetails");

			return {
				token,
				userDetails: userDetails ? JSON.parse(userDetails) : null,
				isAvailable: !!(token && userDetails),
			};
		} catch (error) {
			console.error("Error accessing cached auth data:", error);
			return {
				token: null,
				userDetails: null,
				isAvailable: false,
			};
		}
	}, []);

	// Check if feature is available offline
	const isFeatureAvailableOffline = useCallback((feature: string) => {
		const offlineFeatures = [
			"view-profile",
			"view-cached-data",
			"draft-will", // If we implement local drafts
		];

		return offlineFeatures.includes(feature);
	}, []);

	// Clear offline queue (useful for cleanup)
	const clearOfflineQueue = useCallback(() => {
		setOfflineQueue([]);
	}, []);

	return {
		isOnline,
		offlineQueue,
		queuedRequestsCount: offlineQueue.length,
		offlineAwareFetch,
		getCachedAuthData,
		isFeatureAvailableOffline,
		clearOfflineQueue,
		processOfflineQueue,
	};
}
