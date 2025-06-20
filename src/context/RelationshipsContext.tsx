import React, { createContext, useContext, useState, useEffect } from "react";

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

// Fallback relationships array - the only source of relationship data
const FALLBACK_RELATIONSHIPS: Relationship[] = [
	{ id: "842e72ff-7175-4461-8580-15f27777d97c", name: "Spouse" },
	{ id: "e4625b80-7608-4ce6-b573-ca533d8a81fb", name: "Child" },
	{ id: "34b0dd83-96e6-42c2-bbfe-55b84b05971c", name: "Parent" },
	{ id: "faccb17f-ebed-4b80-bd4c-3c4b12df4ec9", name: "Sibling" },
	{ id: "7c0dad85-1f75-451d-9b9c-afa073e5f503", name: "Friend" },
	{ id: "7d463e12-2cfa-4f49-809e-ac4bcb5c42a6", name: "Relative" },
];

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

	// Initialize with fallback relationships immediately
	useEffect(() => {
		console.log("RelationshipsProvider - Using fallback relationships only");
		setRelationships(FALLBACK_RELATIONSHIPS);
		setIsLoading(false);
		setError(null);
	}, []);

	const refetch = async () => {
		// Refetch just returns the same fallback data
		console.log(
			"RelationshipsProvider - Refetch requested, returning fallback relationships"
		);
		setRelationships(FALLBACK_RELATIONSHIPS);
		setIsLoading(false);
		setError(null);
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
