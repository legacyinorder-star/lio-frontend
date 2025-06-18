import { Relationship } from "@/hooks/useRelationships";

/**
 * Optimized relationship resolver with O(1) lookups
 */
export class RelationshipResolver {
	private relationshipMap: Map<string, string> = new Map();
	private formattedRelationshipMap: Map<string, string> = new Map();

	constructor(relationships: Relationship[]) {
		this.buildMaps(relationships);
	}

	private buildMaps(relationships: Relationship[]) {
		this.relationshipMap.clear();
		this.formattedRelationshipMap.clear();

		relationships.forEach((relationship) => {
			this.relationshipMap.set(relationship.id, relationship.name);
			this.formattedRelationshipMap.set(
				relationship.id,
				this.formatRelationshipName(relationship.name)
			);
		});
	}

	private formatRelationshipName(name: string): string {
		return name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	}

	/**
	 * Get relationship name by ID (O(1) lookup)
	 */
	getRelationshipName(id: string): string | undefined {
		return this.relationshipMap.get(id);
	}

	/**
	 * Get formatted relationship name by ID (O(1) lookup)
	 */
	getFormattedRelationshipName(id: string): string | undefined {
		return this.formattedRelationshipMap.get(id);
	}

	/**
	 * Check if relationships are loaded
	 */
	isReady(): boolean {
		return this.relationshipMap.size > 0;
	}

	/**
	 * Get all relationship IDs
	 */
	getAllIds(): string[] {
		return Array.from(this.relationshipMap.keys());
	}

	/**
	 * Update the resolver with new relationships
	 */
	updateRelationships(relationships: Relationship[]) {
		this.buildMaps(relationships);
	}

	/**
	 * Get relationship stats for debugging
	 */
	getStats() {
		return {
			totalRelationships: this.relationshipMap.size,
			relationships: Array.from(this.relationshipMap.entries()),
		};
	}
}

/**
 * Create a relationship resolver instance
 */
export function createRelationshipResolver(
	relationships: Relationship[]
): RelationshipResolver {
	return new RelationshipResolver(relationships);
}

/**
 * Backward compatibility function for existing code
 */
export function getFormattedRelationshipNameById(
	relationships: Relationship[],
	relationshipId: string
): string | undefined {
	const resolver = new RelationshipResolver(relationships);
	return resolver.getFormattedRelationshipName(relationshipId);
}
