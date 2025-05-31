import { Relationship } from "@/hooks/useRelationships";

/**
 * Gets a relationship name by its ID from a list of relationships
 * @param relationships - Array of relationship objects
 * @param relationshipId - The ID of the relationship to find
 * @returns The name of the relationship if found, or undefined if not found
 */
export function getRelationshipNameById(
	relationships: Relationship[],
	relationshipId: string
): string | undefined {
	const relationship = relationships.find((r) => r.id === relationshipId);
	return relationship?.name;
}

/**
 * Gets a relationship name by its ID and formats it with proper capitalization
 * @param relationships - Array of relationship objects
 * @param relationshipId - The ID of the relationship to find
 * @returns The formatted name of the relationship if found, or undefined if not found
 */
export function getFormattedRelationshipNameById(
	relationships: Relationship[],
	relationshipId: string
): string | undefined {
	const name = getRelationshipNameById(relationships, relationshipId);
	if (!name) return undefined;

	return name
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}
