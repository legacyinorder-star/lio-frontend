import { useCallback } from "react";
import { useWill } from "@/context/WillContext";
import { useWillOwnerData } from "@/hooks/useWillOwnerData";
import { useRelationships } from "@/hooks/useRelationships";
import { useWillData } from "@/hooks/useWillData";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";

interface SpouseData {
	firstName: string;
	lastName: string;
	id?: string;
}

interface PersonResponse {
	id: string;
	first_name: string;
	last_name: string;
}

export function useSpouseManagement() {
	const { activeWill, setActiveWill } = useWill();
	const { willOwnerData, spouseData, saveWillOwnerData, loadWillOwnerData } =
		useWillOwnerData();
	const { relationships } = useRelationships();
	const { refetch } = useWillData();

	const saveSpouseData = useCallback(
		async (data: SpouseData): Promise<boolean> => {
			console.log("🔍 useSpouseManagement: saveSpouseData called with:", data);
			console.log("🔍 useSpouseManagement: activeWill:", activeWill);
			console.log("🔍 useSpouseManagement: willOwnerData:", willOwnerData);
			console.log("🔍 useSpouseManagement: relationships:", relationships);

			if (!activeWill?.id) {
				console.error("❌ useSpouseManagement: No activeWill.id");
				toast.error(
					"Will information not found. Please start from the beginning."
				);
				return false;
			}

			// ✅ FIXED: Handle case where willOwnerData is still loading
			let currentWillOwnerData = willOwnerData;
			if (!currentWillOwnerData?.id) {
				// Try to load willOwnerData first
				console.log("WillOwnerData not loaded yet, loading now...");
				await loadWillOwnerData(activeWill.id);

				// Wait a moment for the state to update, then check again
				// Note: This is a workaround for the async state update issue
				await new Promise((resolve) => setTimeout(resolve, 100));

				// If still no willOwnerData, we'll proceed without it for spouse creation
				// The API call will handle creating the will owner if needed
				console.log(
					"Proceeding with spouse creation even without willOwnerData"
				);
			}

			// Check if relationships are loaded
			if (!relationships || relationships.length === 0) {
				toast.error(
					"Relationships are still loading. Please wait a moment and try again."
				);
				return false;
			}

			try {
				// Find the spouse relationship ID
				const spouseRelationship = relationships.find((rel) => {
					const name = rel.name.toLowerCase();
					return (
						name === "spouse" ||
						name === "husband" ||
						name === "wife" ||
						name === "partner" ||
						name === "civil partner" ||
						name === "spouse/partner"
					);
				});

				if (!spouseRelationship) {
					console.error(
						"Spouse relationship not found. Available relationships:",
						relationships.map((r) => ({ id: r.id, name: r.name }))
					);
					toast.error("Spouse relationship type not found. Please try again.");
					return false;
				}

				// Check if we're editing an existing spouse or creating a new one
				const isEditing = !!data.id;

				if (isEditing) {
					// Update existing spouse record
					const updateData = {
						first_name: data.firstName,
						last_name: data.lastName,
					};

					const { error: updateError } = await apiClient<PersonResponse>(
						`/people/${data.id}`,
						{
							method: "PATCH",
							body: JSON.stringify(updateData),
						}
					);

					if (updateError) {
						console.error("Error updating spouse record:", updateError);
						return false;
					}

					// Update activeWill context with updated spouse information
					if (activeWill) {
						setActiveWill({
							...activeWill,
							spouse: {
								id: data.id,
								firstName: data.firstName,
								lastName: data.lastName,
							},
						});
					}
				} else {
					// Step 1: Update marital status to "married" (only for new spouses)
					// ✅ FIXED: Only update marital status if we have willOwnerData
					if (currentWillOwnerData?.id) {
						const success = await saveWillOwnerData({
							maritalStatus: "married",
						});
						if (!success) {
							console.warn(
								"Failed to update marital status, but continuing with spouse creation"
							);
						}
					} else {
						console.log(
							"No willOwnerData available, skipping marital status update"
						);
					}

					// Step 2: Create new spouse record
					const spouseRequestData = {
						first_name: data.firstName,
						last_name: data.lastName,
						relationship_id: spouseRelationship.id,
						will_id: activeWill.id,
					};

					const { data: personResponse, error: personError } =
						await apiClient<PersonResponse>("/people", {
							method: "POST",
							body: JSON.stringify(spouseRequestData),
						});

					if (personError) {
						console.error("Error creating spouse record:", personError);
						return false;
					}

					// Update activeWill with new spouse information
					if (activeWill && personResponse) {
						setActiveWill({
							...activeWill,
							spouse: {
								id: personResponse.id,
								firstName: data.firstName,
								lastName: data.lastName,
							},
						});
					}
				}

				// After saving, always reload the latest will owner data (which includes spouse)
				await loadWillOwnerData(activeWill.id);
				await refetch();
				return true;
			} catch (error) {
				console.error("Error in saveSpouseData:", error);
				return false;
			}
		},
		[
			activeWill,
			willOwnerData,
			relationships,
			setActiveWill,
			saveWillOwnerData,
			loadWillOwnerData,
			refetch,
		]
	);

	return {
		saveSpouseData,
		spouseData,
		willOwnerData,
		isLoading: !relationships || relationships.length === 0,
	};
}
