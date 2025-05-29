import { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";

export interface Relationship {
	id: string;
	name: string;
}

export function useRelationships() {
	const [relationships, setRelationships] = useState<Relationship[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchRelationships = async () => {
			try {
				const { data, error } = await apiClient<Relationship[]>(
					"/relationships"
				);

				if (error) {
					setError(error);
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

		fetchRelationships();
	}, []); // Empty dependency array means this runs once on mount

	return { relationships, isLoading, error };
}
