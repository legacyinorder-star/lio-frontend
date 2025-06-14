import { useRelationships as useRelationshipsContext } from "@/context/RelationshipsContext";

export interface Relationship {
	id: string;
	name: string;
}

// Re-export the hook from context for backward compatibility
export function useRelationships() {
	return useRelationshipsContext();
}
