import React, { createContext, useContext } from "react";
import { RELATIONSHIPS, type Relationship } from "@/utils/relationships";

interface RelationshipsContextType {
	relationships: Relationship[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

const RelationshipsContext = createContext<RelationshipsContextType>({
	relationships: RELATIONSHIPS,
	isLoading: false,
	error: null,
	refetch: async () => {},
});

export const RelationshipsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<RelationshipsContext.Provider
			value={{
				relationships: RELATIONSHIPS,
				isLoading: false,
				error: null,
				refetch: async () => {}, // No-op since data is static
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
