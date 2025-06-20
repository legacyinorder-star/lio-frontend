import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";

export interface Relationship {
	id: string;
	name: string;
}

interface RelationshipsContextType {
	relationships: Relationship[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

// Cache configuration
const CACHE_KEY = "relationships_cache";
// const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// interface CachedRelationships {
// 	data: Relationship[];
// 	timestamp: number;
// }

// Cache utility functions
// const _getCachedRelationships = (): Relationship[] | null => {
// 	console.log("_getCachedRelationships called at:", new Date().toISOString());
// 	try {
// 		const cached = localStorage.getItem(CACHE_KEY);
// 		if (!cached) {
// 			console.log("No cached relationships found");
// 			return null;
// 		}

// 		const parsedCache: CachedRelationships = JSON.parse(cached);
// 		const now = Date.now();

// 		// Check if cache is still valid
// 		if (now - parsedCache.timestamp < CACHE_DURATION) {
// 			console.log(
// 				"Using cached relationships data at",
// 				new Date().toISOString() + ":",
// 				parsedCache.data
// 			);
// 			return parsedCache.data;
// 		} else {
// 			// Cache expired, remove it
// 			localStorage.removeItem(CACHE_KEY);
// 			console.log("Relationships cache expired, removing");
// 			return null;
// 		}
// 	} catch (error) {
// 		console.error("Error reading relationships cache:", error);
// 		localStorage.removeItem(CACHE_KEY);
// 		return null;
// 	}
// };

// const _setCachedRelationships = (relationships: Relationship[]): void => {
// 	try {
// 		const cacheData: CachedRelationships = {
// 			data: relationships,
// 			timestamp: Date.now(),
// 		};
// 		localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
// 		console.log("Cached relationships data");
// 	} catch (error) {
// 		console.error("Error caching relationships:", error);
// 	}
// };

const RelationshipsContext = createContext<RelationshipsContextType>({
	relationships: [],
	isLoading: true,
	error: null,
	refetch: async () => {},
});

export const RelationshipsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [relationships, setRelationships] = useState<Relationship[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Generate unique instance ID for debugging
	const instanceId = Math.random().toString(36).substr(2, 9);
	console.log(`RelationshipsProvider instance ${instanceId} created`);

	const fetchRelationships = async (_useCache: boolean = true) => {
		console.log(
			`RelationshipsProvider ${instanceId} - fetchRelationships called`
		);
		try {
			setIsLoading(true);
			setError(null);

			// Temporarily disable caching for testing
			// Try to get from cache first if useCache is true
			/*
			if (useCache) {
				const cachedData = getCachedRelationships();
				if (cachedData) {
					setRelationships(cachedData);
					setIsLoading(false);
					return;
				}
			}
			*/

			console.log(
				`RelationshipsProvider ${instanceId} - Fetching relationships from API`
			);

			// Debug authentication status
			const token = localStorage.getItem("authToken");
			console.log(
				`RelationshipsProvider ${instanceId} - Auth token exists:`,
				!!token
			);
			if (token) {
				console.log(
					`RelationshipsProvider ${instanceId} - Token length:`,
					token.length
				);
				console.log(
					`RelationshipsProvider ${instanceId} - Token starts with:`,
					token.substring(0, 20) + "..."
				);
			}

			const { data, error: apiError } = await apiClient<Relationship[]>(
				"/relationships"
			);

			if (apiError) {
				console.error(
					`RelationshipsProvider ${instanceId} - API Error fetching relationships:`,
					apiError
				);

				// Fallback to common relationship types if API fails
				if (
					apiError.includes("Authentication required") ||
					apiError.includes("Unauthorized")
				) {
					console.log(
						`RelationshipsProvider ${instanceId} - Using fallback relationships due to authentication issue`
					);
					const fallbackRelationships: Relationship[] = [
						{ id: "spouse", name: "Spouse" },
						{ id: "child", name: "Child" },
						{ id: "parent", name: "Parent" },
						{ id: "sibling", name: "Sibling" },
						{ id: "friend", name: "Friend" },
						{ id: "charity", name: "Charity" },
					];
					setRelationships(fallbackRelationships);
					// Temporarily disable caching
					// setCachedRelationships(fallbackRelationships);
					return;
				}

				setError(apiError);
				return;
			}

			if (data) {
				console.log(
					`RelationshipsProvider ${instanceId} - Fetched relationships from API:`,
					data
				);
				setRelationships(data);
				// Temporarily disable caching
				// setCachedRelationships(data);
			} else {
				console.error(
					`RelationshipsProvider ${instanceId} - No data received from relationships API`
				);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch relationships"
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// Clear any existing cache to force fresh API calls
		localStorage.removeItem(CACHE_KEY);
		console.log(
			`RelationshipsProvider ${instanceId} - Cleared relationships cache from localStorage`
		);

		fetchRelationships();
	}, []); // Empty dependency array means this runs once on mount

	const refetch = async () => {
		// Force refetch bypasses cache
		await fetchRelationships(false);
	};

	return (
		<RelationshipsContext.Provider
			value={{
				relationships,
				isLoading,
				error,
				refetch,
			}}
		>
			{children}
		</RelationshipsContext.Provider>
	);
};

export const useRelationships = () => {
	const context = useContext(RelationshipsContext);
	if (!context) {
		throw new Error(
			"useRelationships must be used within a RelationshipsProvider"
		);
	}
	return context;
};
