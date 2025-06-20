import { useState, useEffect, useCallback, useMemo } from "react";
import { useWill } from "@/context/WillContext";
import { useRelationships } from "@/hooks/useRelationships";
import { apiClient } from "@/utils/apiClient";
import { createRelationshipResolver } from "@/utils/relationshipResolver";
import { toast } from "sonner";

// Types for API responses
interface BeneficiaryResponse {
	charities: Array<{
		id: string;
		created_at: string;
		will_id: string;
		name: string;
		user_id: string;
		rc_number?: string;
	}>;
	people: Array<{
		id: string;
		user_id: string;
		will_id: string;
		relationship_id: string;
		first_name: string;
		last_name: string;
		is_minor: boolean;
		created_at: string;
		is_witness: boolean;
	}>;
}

export interface EnhancedBeneficiary {
	id: string;
	firstName: string;
	lastName: string;
	relationship: string;
	relationshipId?: string;
	isMinor?: boolean;
	type: "person" | "charity";
	registrationNumber?: string;
}

interface WillDataState {
	allBeneficiaries: EnhancedBeneficiary[];
	isLoading: boolean;
	isReady: boolean;
	error: string | null;
}

export function useWillData() {
	const [state, setState] = useState<WillDataState>({
		allBeneficiaries: [],
		isLoading: false,
		isReady: false,
		error: null,
	});

	const { activeWill } = useWill();
	const { relationships, isLoading: isLoadingRelationships } =
		useRelationships();

	// Create relationship resolver for optimized lookups
	const relationshipResolver = useMemo(() => {
		return createRelationshipResolver(relationships);
	}, [relationships]);

	// Check if all dependencies are ready
	const dependenciesReady = useMemo(() => {
		return (
			!isLoadingRelationships &&
			relationshipResolver.isReady() &&
			activeWill?.id
		);
	}, [isLoadingRelationships, relationshipResolver, activeWill?.id]);

	// Combine all beneficiary sources into a single array
	const combineAllBeneficiaries = useCallback(
		(
			apiData: BeneficiaryResponse,
			willData: typeof activeWill
		): EnhancedBeneficiary[] => {
			const combined: EnhancedBeneficiary[] = [];
			const usedIds = new Set<string>();

			// Add spouse if exists
			if (willData?.spouse?.id && !usedIds.has(willData.spouse.id)) {
				usedIds.add(willData.spouse.id);
				combined.push({
					id: willData.spouse.id,
					firstName: willData.spouse.firstName,
					lastName: willData.spouse.lastName,
					relationship: "Spouse",
					type: "person",
				});
			}

			// Add children if they exist
			if (willData?.children) {
				willData.children.forEach((child) => {
					if (child.id && !usedIds.has(child.id)) {
						usedIds.add(child.id);
						combined.push({
							id: child.id,
							firstName: child.firstName,
							lastName: child.lastName,
							relationship: "Child",
							isMinor: child.isMinor,
							type: "person",
						});
					}
				});
			}

			// Add guardians if they exist
			if (willData?.guardians) {
				willData.guardians.forEach((guardian) => {
					if (guardian.id && !usedIds.has(guardian.id)) {
						usedIds.add(guardian.id);
						combined.push({
							id: guardian.id,
							firstName: guardian.firstName,
							lastName: guardian.lastName,
							relationship: guardian.relationship || "Guardian",
							type: "person",
						});
					}
				});
			}

			// Add charities from API
			apiData.charities.forEach((charity) => {
				if (!usedIds.has(charity.id)) {
					usedIds.add(charity.id);
					combined.push({
						id: charity.id,
						firstName: charity.name,
						lastName: "",
						relationship: "Charity",
						type: "charity",
						registrationNumber: charity.rc_number,
					});
				}
			});

			// Add people from API with proper relationship resolution
			apiData.people.forEach((person) => {
				if (!usedIds.has(person.id)) {
					usedIds.add(person.id);

					// Resolve relationship name using the optimized resolver
					const relationshipName =
						relationshipResolver.getFormattedRelationshipName(
							person.relationship_id
						);

					combined.push({
						id: person.id,
						firstName: person.first_name,
						lastName: person.last_name,
						relationship: relationshipName || "Other",
						relationshipId: person.relationship_id,
						isMinor: person.is_minor,
						type: "person",
					});
				}
			});

			return combined;
		},
		[relationships]
	);

	// Load all beneficiary data
	const loadAllBeneficiaryData = useCallback(async () => {
		if (!activeWill?.id) {
			setState((prev) => ({ ...prev, error: "No active will found" }));
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			// Fetch beneficiaries from API
			const { data, error } = await apiClient<BeneficiaryResponse>(
				`/beneficiaries/${activeWill.id}`,
				{ method: "GET" }
			);

			if (error) {
				throw new Error(error);
			}

			if (data) {
				// Combine all beneficiary sources
				const allBeneficiaries = combineAllBeneficiaries(data, activeWill);

				setState((prev) => ({
					...prev,
					allBeneficiaries,
					isLoading: false,
					isReady: true,
					error: null,
				}));

				console.log("Successfully loaded all beneficiaries:", allBeneficiaries);
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to load beneficiary data";
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: errorMessage,
			}));
			toast.error(errorMessage);
		}
	}, [activeWill?.id, combineAllBeneficiaries]);

	// Load data when dependencies are ready
	useEffect(() => {
		if (dependenciesReady && !state.isReady && !state.isLoading) {
			console.log("Dependencies ready, loading beneficiary data...");
			loadAllBeneficiaryData();
		}
	}, [
		dependenciesReady,
		state.isReady,
		state.isLoading,
		loadAllBeneficiaryData,
	]);

	// Reset state when will changes
	useEffect(() => {
		setState((prev) => ({
			...prev,
			allBeneficiaries: [],
			isReady: false,
			error: null,
		}));
	}, [activeWill?.id]);

	// Provide methods for adding new beneficiaries
	const addIndividualBeneficiary = useCallback(
		async (firstName: string, lastName: string, relationshipId: string) => {
			if (!activeWill?.id) {
				toast.error("No active will found");
				return null;
			}

			try {
				const { data: personData, error: personError } = await apiClient<{
					id: string;
					first_name: string;
					last_name: string;
					relationship_id: string;
				}>("/people", {
					method: "POST",
					body: JSON.stringify({
						will_id: activeWill.id,
						relationship_id: relationshipId,
						first_name: firstName,
						last_name: lastName,
						is_minor: false,
					}),
				});

				if (personError || !personData) {
					toast.error("Failed to add individual beneficiary");
					return null;
				}

				// Get the relationship name for display using the fallback relationships directly
				const relationship = relationships.find((r) => r.id === relationshipId);
				const relationshipName = relationship ? relationship.name : "Other";

				console.log("Relationship resolution:", {
					relationshipId,
					foundRelationship: relationship,
					relationshipName,
					availableRelationships: relationships.map((r) => ({
						id: r.id,
						name: r.name,
					})),
				});

				// Create new beneficiary
				const newBeneficiary: EnhancedBeneficiary = {
					id: personData.id,
					firstName: firstName,
					lastName: lastName,
					relationship: relationshipName,
					relationshipId: relationshipId,
					type: "person",
				};

				// Add to state
				setState((prev) => ({
					...prev,
					allBeneficiaries: [...prev.allBeneficiaries, newBeneficiary],
				}));

				toast.success("Individual beneficiary added successfully");
				return newBeneficiary;
			} catch (err) {
				toast.error("Failed to add individual beneficiary");
				return null;
			}
		},
		[activeWill?.id, relationships]
	);

	const addCharityBeneficiary = useCallback(
		async (charityName: string, registrationNumber?: string) => {
			if (!activeWill?.id) {
				toast.error("No active will found");
				return null;
			}

			try {
				const { data: charityData, error: charityError } = await apiClient<{
					id: string;
					name: string;
					rc_number?: string;
				}>("/charities", {
					method: "POST",
					body: JSON.stringify({
						name: charityName,
						will_id: activeWill.id,
						rc_number: registrationNumber || null,
					}),
				});

				if (charityError || !charityData) {
					toast.error("Failed to add charity beneficiary");
					return null;
				}

				// Create new beneficiary
				const newBeneficiary: EnhancedBeneficiary = {
					id: charityData.id,
					firstName: charityName,
					lastName: "",
					relationship: "Charity",
					type: "charity",
					registrationNumber: registrationNumber,
				};

				// Add to state
				setState((prev) => ({
					...prev,
					allBeneficiaries: [...prev.allBeneficiaries, newBeneficiary],
				}));

				toast.success("Charity beneficiary added successfully");
				return newBeneficiary;
			} catch (err) {
				toast.error("Failed to add charity beneficiary");
				return null;
			}
		},
		[activeWill?.id]
	);

	return {
		// Data
		allBeneficiaries: state.allBeneficiaries,
		relationships,
		relationshipResolver,

		// Loading states
		isLoading: state.isLoading,
		isReady: state.isReady,
		dependenciesReady,

		// Error handling
		error: state.error,

		// Actions
		refetch: loadAllBeneficiaryData,
		addIndividualBeneficiary,
		addCharityBeneficiary,
	};
}
