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

	const fetchRelationships = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const { data, error: apiError } = await apiClient<Relationship[]>(
				"/relationships"
			);

			if (apiError) {
				setError(apiError);
				return;
			}

			if (data) {
				setRelationships(data);
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
		await fetchRelationships();
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
