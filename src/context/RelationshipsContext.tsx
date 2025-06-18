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
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedRelationships {
	data: Relationship[];
	timestamp: number;
}

// Cache utility functions
const getCachedRelationships = (): Relationship[] | null => {
	try {
		const cached = localStorage.getItem(CACHE_KEY);
		if (!cached) return null;

		const parsedCache: CachedRelationships = JSON.parse(cached);
		const now = Date.now();

		// Check if cache is still valid
		if (now - parsedCache.timestamp < CACHE_DURATION) {
			console.log("Using cached relationships data");
			return parsedCache.data;
		} else {
			// Cache expired, remove it
			localStorage.removeItem(CACHE_KEY);
			console.log("Relationships cache expired, removing");
			return null;
		}
	} catch (error) {
		console.error("Error reading relationships cache:", error);
		localStorage.removeItem(CACHE_KEY);
		return null;
	}
};

const setCachedRelationships = (relationships: Relationship[]): void => {
	try {
		const cacheData: CachedRelationships = {
			data: relationships,
			timestamp: Date.now(),
		};
		localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
		console.log("Cached relationships data");
	} catch (error) {
		console.error("Error caching relationships:", error);
	}
};

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

	const fetchRelationships = async (useCache: boolean = true) => {
		try {
			setIsLoading(true);
			setError(null);

			// Try to get from cache first if useCache is true
			if (useCache) {
				const cachedData = getCachedRelationships();
				if (cachedData) {
					setRelationships(cachedData);
					setIsLoading(false);
					return;
				}
			}

			console.log("Fetching relationships from API");
			const { data, error: apiError } = await apiClient<Relationship[]>(
				"/relationships"
			);

			if (apiError) {
				setError(apiError);
				return;
			}

			if (data) {
				setRelationships(data);
				// Cache the fetched data
				setCachedRelationships(data);
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
