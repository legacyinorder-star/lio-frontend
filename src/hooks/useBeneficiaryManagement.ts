import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { useWill } from "@/context/WillContext";
import { useRelationships } from "@/hooks/useRelationships";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

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

interface ApiPersonResponse {
	id: string;
	first_name: string;
	last_name: string;
	relationship_id: string;
}

interface ApiCharityResponse {
	id: string;
	name: string;
	rc_number?: string;
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

export function useBeneficiaryManagement() {
	const [enhancedBeneficiaries, setEnhancedBeneficiaries] = useState<
		EnhancedBeneficiary[]
	>([]);
	const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false);
	const { activeWill } = useWill();
	const { relationships } = useRelationships();

	// Fetch beneficiaries when opening asset dialog
	const fetchBeneficiaries = async () => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		setIsLoadingBeneficiaries(true);
		try {
			const { data, error } = await apiClient<BeneficiaryResponse>(
				`/beneficiaries/${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error) {
				toast.error("Failed to fetch beneficiaries");
				return;
			}

			if (data) {
				const combinedBeneficiaries = [
					...data.charities.map((charity) => ({
						id: charity.id,
						firstName: charity.name,
						lastName: "",
						relationship: "Charity",
						type: "charity" as const,
						registrationNumber: charity.rc_number,
					})),
					...data.people.map((person) => ({
						id: person.id,
						firstName: person.first_name,
						lastName: person.last_name,
						relationship:
							getFormattedRelationshipNameById(
								relationships,
								person.relationship_id
							) || "Unknown Relationship",
						relationshipId: person.relationship_id,
						isMinor: person.is_minor,
						type: "person" as const,
					})),
				];
				setEnhancedBeneficiaries(combinedBeneficiaries);
			}
		} catch (err) {
			toast.error("Failed to fetch beneficiaries");
		} finally {
			setIsLoadingBeneficiaries(false);
		}
	};

	// Add new individual beneficiary
	const addIndividualBeneficiary = async (
		firstName: string,
		lastName: string,
		relationshipId: string
	) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return null;
		}

		try {
			// Send POST request to /people
			const { data: personData, error: personError } =
				await apiClient<ApiPersonResponse>("/people", {
					method: "POST",
					body: JSON.stringify({
						will_id: activeWill.id,
						relationship_id: relationshipId,
						first_name: firstName,
						last_name: lastName,
						is_minor: false, // New beneficiaries are not minors by default
					}),
				});

			if (personError || !personData) {
				toast.error("Failed to add individual beneficiary");
				return null;
			}

			// Get the relationship name for display
			const relationshipName =
				getFormattedRelationshipNameById(relationships, relationshipId) ||
				"Unknown Relationship";

			// Add to enhanced beneficiaries list
			const newEnhancedBeneficiary: EnhancedBeneficiary = {
				id: personData.id,
				firstName: firstName,
				lastName: lastName,
				relationship: relationshipName,
				relationshipId: relationshipId,
				type: "person",
			};

			setEnhancedBeneficiaries((prev) => [...prev, newEnhancedBeneficiary]);

			toast.success("Individual beneficiary added successfully");
			return newEnhancedBeneficiary;
		} catch (err) {
			toast.error("Failed to add individual beneficiary");
			return null;
		}
	};

	// Add new charity beneficiary
	const addCharityBeneficiary = async (
		charityName: string,
		registrationNumber?: string
	) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return null;
		}

		try {
			// Send POST request to /charities
			const { data: charityData, error: charityError } =
				await apiClient<ApiCharityResponse>("/charities", {
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

			// Add to enhanced beneficiaries list
			const newEnhancedBeneficiary: EnhancedBeneficiary = {
				id: charityData.id,
				firstName: charityName,
				lastName: "",
				relationship: "Charity",
				type: "charity",
				registrationNumber: registrationNumber,
			};

			setEnhancedBeneficiaries((prev) => [...prev, newEnhancedBeneficiary]);

			toast.success("Charity beneficiary added successfully");
			return newEnhancedBeneficiary;
		} catch (err) {
			toast.error("Failed to add charity beneficiary");
			return null;
		}
	};

	return {
		enhancedBeneficiaries,
		setEnhancedBeneficiaries,
		isLoadingBeneficiaries,
		fetchBeneficiaries,
		addIndividualBeneficiary,
		addCharityBeneficiary,
	};
}
