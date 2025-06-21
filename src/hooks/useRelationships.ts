import { useRelationships as useRelationshipsContext } from "@/context/RelationshipsContext";
import { type Relationship } from "@/utils/relationships";

// Re-export the hook from context for backward compatibility
export function useRelationships() {
	return useRelationshipsContext();
}

// Re-export the Relationship type for convenience
export type { Relationship };
