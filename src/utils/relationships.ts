export interface Relationship {
	id: string;
	name: string;
}

// Static relationship data - single source of truth
export const RELATIONSHIPS: Relationship[] = [
	{ id: "842e72ff-7175-4461-8580-15f27777d97c", name: "Spouse" },
	{ id: "e4625b80-7608-4ce6-b573-ca533d8a81fb", name: "Child" },
	{ id: "34b0dd83-96e6-42c2-bbfe-55b84b05971c", name: "Parent" },
	{ id: "faccb17f-ebed-4b80-bd4c-3c4b12df4ec9", name: "Sibling" },
	{ id: "7c0dad85-1f75-451d-9b9c-afa073e5f503", name: "Friend" },
	{ id: "7d463e12-2cfa-4f49-809e-ac4bcb5c42a6", name: "Relative" },
];

// Simple lookup functions
export function getRelationshipById(id: string): Relationship | undefined {
	return RELATIONSHIPS.find((r) => r.id === id);
}

export function getRelationshipNameById(id: string): string | undefined {
	return getRelationshipById(id)?.name;
}

export function getFormattedRelationshipNameById(id: string): string {
	const name = getRelationshipNameById(id);
	if (!name) return "Unknown Relationship";

	return name
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

// Get all relationships
export function getAllRelationships(): Relationship[] {
	return [...RELATIONSHIPS];
}

// Find relationship by name (case-insensitive)
export function findRelationshipByName(name: string): Relationship | undefined {
	const searchName = name.toLowerCase();
	return RELATIONSHIPS.find((r) => r.name.toLowerCase() === searchName);
}

// Get spouse relationship specifically
export function getSpouseRelationship(): Relationship | undefined {
	return findRelationshipByName("spouse");
}

// Get spouse relationship ID
export function getSpouseRelationshipId(): string | undefined {
	return getSpouseRelationship()?.id;
}
