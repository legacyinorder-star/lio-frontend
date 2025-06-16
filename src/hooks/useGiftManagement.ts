import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { useWill, WillGift } from "@/context/WillContext";
import { Gift, GiftType } from "@/components/will-wizard/types/will.types";
import { EnhancedBeneficiary } from "@/hooks/useBeneficiaryManagement";
import { useRelationships } from "../context/RelationshipsContext";

interface ApiGiftResponse {
	id: string;
	will_id: string;
	type: string;
	description: string;
	currency?: string;
	value?: number;
	people_id?: string;
	charities_id?: string;
	created_at: string;
	updated_at: string;
	person?: {
		id: string;
		user_id: string;
		will_id: string;
		relationship_id: string;
		first_name: string;
		last_name: string;
		is_minor: boolean;
		created_at: string;
		is_witness: boolean;
	};
	charity?: {
		id: string;
		created_at: string;
		will_id: string;
		name: string;
		user_id: string;
		rc_number?: string;
	};
}

export function useGiftManagement(
	initialGifts: Gift[] = [],
	beneficiaries: EnhancedBeneficiary[] = []
) {
	const [gifts, setGifts] = useState<Gift[]>(initialGifts);
	const [isLoadingGifts, setIsLoadingGifts] = useState(false);
	const { activeWill, setActiveWill } = useWill();
	const hasLoadedInitialGifts = useRef(false);
	const { relationships } = useRelationships();

	// Use provided beneficiaries parameter
	const availableBeneficiaries = beneficiaries;

	// Load gifts from activeWill context
	useEffect(() => {
		const loadGiftsFromContext = async () => {
			if (activeWill?.gifts && activeWill.gifts.length > 0) {
				// Convert WillGift format to Gift format
				const convertedGifts: Gift[] = activeWill.gifts.map(
					(willGift: WillGift) => ({
						id: willGift.id,
						type: willGift.type as GiftType,
						description: willGift.description,
						value: willGift.value,
						currency: willGift.currency,
						peopleId: willGift.peopleId,
						charitiesId: willGift.charitiesId,
					})
				);
				setGifts(convertedGifts);
			} else if (initialGifts.length > 0 && !hasLoadedInitialGifts.current) {
				setGifts(initialGifts);
				hasLoadedInitialGifts.current = true;
			}
		};

		loadGiftsFromContext();
	}, [activeWill]);

	// Function to update gift relationships using relationships context
	const updateGiftRelationships = (willGifts: WillGift[]) => {
		return willGifts.map((willGift) => {
			if (willGift.person && willGift.person.relationshipId) {
				const relationship = relationships.find(
					(r: { id: string; name: string }) =>
						r.id === willGift.person!.relationshipId
				);
				if (relationship) {
					willGift.person!.relationship = relationship.name;
				}
			}
			return willGift;
		});
	};

	// Function to load gifts from API and update will context
	const loadGiftsFromAPI = async () => {
		if (!activeWill?.id) return;

		setIsLoadingGifts(true);
		try {
			// Fetch gifts from API
			const { data: giftsData, error } = await apiClient<ApiGiftResponse[]>(
				`/gifts?will_id=${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error || !giftsData) {
				toast.error("Failed to fetch gifts");
				return;
			}

			// Process each gift
			const processedGifts = giftsData.map((giftData) => {
				// Create Gift format for local state
				const gift: Gift = {
					id: giftData.id,
					type: giftData.type as GiftType,
					description: giftData.description,
					value: giftData.value,
					currency: giftData.currency,
					peopleId: giftData.people_id,
					charitiesId: giftData.charities_id,
				};

				// Create WillGift format for context with person/charity objects
				const willGift = {
					id: giftData.id,
					type: giftData.type as GiftType,
					description: giftData.description,
					value: giftData.value,
					currency: giftData.currency,
					peopleId: giftData.people_id,
					charitiesId: giftData.charities_id,
					person: giftData.person
						? {
								id: giftData.person.id,
								firstName: giftData.person.first_name,
								lastName: giftData.person.last_name,
								relationship: "Unknown Relationship", // Will be updated with relationships context
								relationshipId: giftData.person.relationship_id,
								isMinor: giftData.person.is_minor,
						  }
						: undefined,
					charity: giftData.charity
						? {
								id: giftData.charity.id,
								name: giftData.charity.name,
								registrationNumber: giftData.charity.rc_number,
						  }
						: undefined,
				};

				return { gift, willGift };
			});

			// Update local state
			setGifts(processedGifts.map((p) => p.gift));

			// Update will context with proper relationship names
			const willGifts = processedGifts.map((p) => p.willGift);
			const updatedWillGifts = updateGiftRelationships(willGifts);

			setActiveWill({
				...activeWill,
				gifts: updatedWillGifts,
			});
		} catch (err) {
			toast.error("Failed to load gifts from API");
		} finally {
			setIsLoadingGifts(false);
		}
	};

	// Save gift to API
	const saveGift = async (
		giftForm: Omit<Gift, "id">,
		editingGiftId?: string
	) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return null;
		}

		try {
			// Determine beneficiary type and ID
			const beneficiaryId = giftForm.peopleId || giftForm.charitiesId;

			const beneficiaryDetails = availableBeneficiaries.find(
				(b) => b.id === beneficiaryId
			);

			if (!beneficiaryDetails) {
				toast.error("Selected beneficiary not found");
				return null;
			}

			const requestBody: {
				will_id: string;
				type: string;
				description: string;
				currency?: string;
				value?: number;
				people_id?: string;
				charities_id?: string;
			} = {
				will_id: activeWill.id,
				type: giftForm.type,
				description: giftForm.description,
			};

			// Add optional fields if they exist
			if (giftForm.currency) {
				requestBody.currency = giftForm.currency;
			}
			if (giftForm.value) {
				requestBody.value = giftForm.value;
			}

			// Set beneficiary ID based on type
			if (beneficiaryDetails.type === "charity") {
				requestBody.charities_id = giftForm.charitiesId;
			} else {
				requestBody.people_id = giftForm.peopleId;
			}

			// Send POST request to /gifts
			const { data: giftData, error: giftError } =
				await apiClient<ApiGiftResponse>("/gifts", {
					method: "POST",
					body: JSON.stringify(requestBody),
				});

			if (giftError || !giftData) {
				toast.error("Failed to save gift");
				return null;
			}

			// Update local state with the gift from API response
			const newGift: Gift = {
				id: giftData.id,
				type: giftData.type as GiftType,
				description: giftData.description,
				value: giftData.value,
				currency: giftData.currency,
				peopleId: giftData.people_id,
				charitiesId: giftData.charities_id,
			};

			if (editingGiftId) {
				const updatedGifts = gifts.map((gift) =>
					gift.id === editingGiftId ? newGift : gift
				);
				setGifts(updatedGifts);

				// Update will context with person/charity objects
				const updatedWillGifts = activeWill.gifts.map((willGift) =>
					willGift.id === editingGiftId
						? {
								...willGift,
								type: newGift.type,
								description: newGift.description,
								value: newGift.value,
								currency: newGift.currency,
								peopleId: newGift.peopleId,
								charitiesId: newGift.charitiesId,
								person: giftData.person
									? {
											id: giftData.person.id,
											firstName: giftData.person.first_name,
											lastName: giftData.person.last_name,
											relationship: "Unknown Relationship", // Will be updated with relationships context
											relationshipId: giftData.person.relationship_id,
											isMinor: giftData.person.is_minor,
									  }
									: undefined,
								charity: giftData.charity
									? {
											id: giftData.charity.id,
											name: giftData.charity.name,
											registrationNumber: giftData.charity.rc_number,
									  }
									: undefined,
						  }
						: willGift
				);

				// Update relationships in the updated gifts
				const updatedWillGiftsWithRelationships =
					updateGiftRelationships(updatedWillGifts);

				setActiveWill({
					...activeWill,
					gifts: updatedWillGiftsWithRelationships,
				});
			} else {
				const updatedGifts = [...gifts, newGift];
				setGifts(updatedGifts);

				// Add new gift to will context with person/charity objects
				const newWillGift = {
					id: giftData.id,
					type: giftData.type as GiftType,
					description: giftData.description,
					value: giftData.value,
					currency: giftData.currency,
					peopleId: giftData.people_id,
					charitiesId: giftData.charities_id,
					person: giftData.person
						? {
								id: giftData.person.id,
								firstName: giftData.person.first_name,
								lastName: giftData.person.last_name,
								relationship: "Unknown Relationship", // Will be updated with relationships context
								relationshipId: giftData.person.relationship_id,
								isMinor: giftData.person.is_minor,
						  }
						: undefined,
					charity: giftData.charity
						? {
								id: giftData.charity.id,
								name: giftData.charity.name,
								registrationNumber: giftData.charity.rc_number,
						  }
						: undefined,
				};

				// Update relationships in the new gift
				const newWillGiftWithRelationships = updateGiftRelationships([
					newWillGift,
				])[0];

				setActiveWill({
					...activeWill,
					gifts: [...activeWill.gifts, newWillGiftWithRelationships],
				});
			}

			toast.success(
				editingGiftId ? "Gift updated successfully" : "Gift added successfully"
			);

			return newGift;
		} catch (err) {
			toast.error("Failed to save gift");
			return null;
		}
	};

	// Remove gift
	const removeGift = (giftId: string) => {
		const updatedGifts = gifts.filter((gift) => gift.id !== giftId);
		setGifts(updatedGifts);

		// Update will context by removing the gift
		if (activeWill) {
			const updatedWillGifts = activeWill.gifts.filter(
				(willGift) => willGift.id !== giftId
			);
			setActiveWill({
				...activeWill,
				gifts: updatedWillGifts,
			});
		}
	};

	return {
		gifts,
		setGifts,
		isLoadingGifts,
		loadGiftsFromAPI,
		saveGift,
		removeGift,
	};
}
