import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useRef,
} from "react";
import { apiClient } from "@/utils/apiClient";
import { useAuth } from "@/hooks/useAuth";

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

// Cache configuration - DISABLED
// const CACHE_KEY = "relationships_cache";
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
	const { user, isLoading: authLoading } = useAuth();
	const hasFetchedRef = useRef(false);

	// Generate unique instance ID for debugging
	const instanceId = Math.random().toString(36).substr(2, 9);
	//console.log(`RelationshipsProvider instance ${instanceId} created`);

	const fetchRelationships = useCallback(async (_useCache: boolean = true) => {
		console.log(
			`RelationshipsProvider ${instanceId} - fetchRelationships called`
		);

		// Prevent multiple fetches
		if (hasFetchedRef.current) {
			console.log(
				`RelationshipsProvider ${instanceId} - Already fetched relationships, skipping`
			);
			return;
		}

		// Wait for authentication to be ready
		if (authLoading) {
			console.log(
				`RelationshipsProvider ${instanceId} - Waiting for authentication to load`
			);
			return;
		}

		// Check if user is authenticated
		if (!user) {
			console.log(
				`RelationshipsProvider ${instanceId} - User not authenticated, using fallback relationships`
			);
			const fallbackRelationships: Relationship[] = [
				{ id: "842e72ff-7175-4461-8580-15f27777d97c", name: "Spouse" },
				{ id: "e4625b80-7608-4ce6-b573-ca533d8a81fb", name: "Child" },
				{ id: "34b0dd83-96e6-42c2-bbfe-55b84b05971c", name: "Parent" },
				{ id: "faccb17f-ebed-4b80-bd4c-3c4b12df4ec9", name: "Sibling" },
				{ id: "7c0dad85-1f75-451d-9b9c-afa073e5f503", name: "Friend" },
				//{ id: "charity", name: "Charity" },
			];
			setRelationships(fallbackRelationships);
			setIsLoading(false);
			hasFetchedRef.current = true;
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			// Caching is completely disabled - always fetch from API
			console.log(
				`RelationshipsProvider ${instanceId} - Fetching relationships from API (caching disabled)`
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

			// Always make authenticated request - no cache, no fallback
			const { data, error: apiError } = await apiClient<Relationship[]>(
				"/relationships",
				{ authenticated: true } // Explicitly ensure authentication
			);

			if (apiError) {
				console.error(
					`RelationshipsProvider ${instanceId} - API Error fetching relationships:`,
					apiError
				);

				// Only use fallback for authentication issues
				if (
					apiError.includes("Authentication required") ||
					apiError.includes("Unauthorized")
				) {
					console.log(
						`RelationshipsProvider ${instanceId} - Using fallback relationships due to authentication issue`
					);
					const fallbackRelationships: Relationship[] = [
						{ id: "842e72ff-7175-4461-8580-15f27777d97c", name: "Spouse" },
						{ id: "e4625b80-7608-4ce6-b573-ca533d8a81fb", name: "Child" },
						{ id: "34b0dd83-96e6-42c2-bbfe-55b84b05971c", name: "Parent" },
						{ id: "faccb17f-ebed-4b80-bd4c-3c4b12df4ec9", name: "Sibling" },
						{ id: "7c0dad85-1f75-451d-9b9c-afa073e5f503", name: "Friend" },
						//{ id: "charity", name: "Charity" },
					];
					setRelationships(fallbackRelationships);
					hasFetchedRef.current = true;
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
				// No caching - data is not stored
			} else {
				console.error(
					`RelationshipsProvider ${instanceId} - No data received from relationships API`
				);
			}

			hasFetchedRef.current = true;
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch relationships"
			);
		} finally {
			setIsLoading(false);
		}
	}, []); // No dependencies to prevent infinite loops

	useEffect(() => {
		// Caching is disabled - no need to clear cache
		console.log(
			`RelationshipsProvider ${instanceId} - Initializing (caching disabled)`
		);

		fetchRelationships();
	}, []); // Only run once on mount

	// Separate effect for authentication changes
	useEffect(() => {
		if (!authLoading) {
			// Reset the fetch flag when auth state changes
			hasFetchedRef.current = false;
			fetchRelationships();
		}
	}, [user, authLoading]); // Trigger when user or auth loading state changes

	const refetch = async () => {
		// Force refetch bypasses cache and fetch prevention
		console.log(
			`RelationshipsProvider ${instanceId} - Force refetch requested`
		);
		hasFetchedRef.current = false;
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
