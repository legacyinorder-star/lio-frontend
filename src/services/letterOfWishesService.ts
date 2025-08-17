import { apiClient } from "@/utils/apiClient";

export interface LetterOfWishesResponse {
	id: string;
	will_id: string;
	created_at: string;
	updated_at: string;
	personal_notes?: {
		id: string;
		created_at: string;
		low_id: string;
		notes: string;
		user_id: string;
		guardian_reason: string;
		guardian_values: string;
	};
	// Add other fields as needed based on the actual API response
}

export interface CreateLetterOfWishesRequest {
	will_id: string;
}

export interface SubmitPersonalNotesRequest {
	id?: string;
	guardian_reason: string | null;
	notes: string | null;
	guardian_values: string | null;
}

export interface PersonalPossession {
	id: string;
	created_at: string;
	low_id: string;
	beneficiary: string;
	reason: string | null;
	item: string;
}

export interface CreatePersonalPossessionRequest {
	low_id: string;
	beneficiary: string;
	reason: string | null;
	item: string;
}

export interface UpdatePersonalPossessionRequest {
	beneficiary?: string;
	reason?: string | null;
	item?: string;
}

export interface DigitalAsset {
	id: string;
	created_at: string;
	low_id: string;
	platform: string;
	username: string;
	beneficiary: string | null;
	action: "delete" | "memorialize" | "transfer" | "archive";
	instructions: string | null;
}

export interface CreateDigitalAssetRequest {
	low_id: string;
	platform: string;
	username: string;
	beneficiary: string | null;
	action: "delete" | "memorialize" | "transfer" | "archive";
	instructions: string | null;
}

export interface UpdateDigitalAssetRequest {
	platform?: string;
	username?: string;
	beneficiary?: string | null;
	action?: "delete" | "memorialize" | "transfer" | "archive";
	instructions?: string | null;
}

export interface FuneralInstructions {
	id: string;
	created_at: string;
	low_id: string;
	location: string | null;
	service: "religious" | "non-religious" | "private" | "public" | null;
	additional_preferences: string | null;
}

export interface CreateFuneralInstructionsRequest {
	low_id: string;
	location?: string | null;
	service?: "religious" | "non-religious" | "private" | "public" | null;
	additional_preferences?: string | null;
}

export interface UpdateFuneralInstructionsRequest {
	location?: string | null;
	service?: "religious" | "non-religious" | "private" | "public" | null;
	additional_preferences?: string | null;
}

export interface PersonalNotes {
	id: string;
	created_at: string;
	low_id: string;
	notes: string | null;
	guardian_reason: string | null;
	guardian_values: string | null;
}

export interface Contact {
	id: string;
	created_at: string;
	low_id: string;
	full_name: string;
	email: string;
}

export interface CreateContactRequest {
	low_id: string;
	full_name: string;
	email: string;
}

export interface UpdateContactRequest {
	full_name?: string;
	email?: string;
}

export interface ProfessionalInstructions {
	id: string;
	low_id: string;
	professional_tattoos: string | null;
	professional_notes: string | null;
}

export interface CreateProfessionalInstructionsRequest {
	low_id: string;
	professional_tattoos?: string | null;
	professional_notes?: string | null;
}

export interface UpdateProfessionalInstructionsRequest {
	professional_tattoos?: string | null;
	professional_notes?: string | null;
}

export class LetterOfWishesService {
	/**
	 * Check if a Letter of Wishes already exists for a given will ID
	 */
	static async getByWillId(
		willId: string
	): Promise<LetterOfWishesResponse | null> {
		try {
			console.log(
				`🔍 Checking for existing Letter of Wishes for will ID: ${willId}`
			);

			const { data, error } = await apiClient<LetterOfWishesResponse>(
				`/letter-of-wishes/get-by-will/${willId}`,
				{
					method: "GET",
				}
			);

			if (error) {
				// If the error indicates no Letter of Wishes exists, return null
				if (error.includes("not found") || error.includes("404")) {
					console.log("📭 No existing Letter of Wishes found for this will");
					return null;
				}
				throw new Error(error);
			}

			console.log("✅ Found existing Letter of Wishes:", data);
			return data;
		} catch (error) {
			console.error("❌ Error checking for existing Letter of Wishes:", error);
			// If it's a 404 or "not found" error, return null instead of throwing
			if (
				error instanceof Error &&
				(error.message.includes("404") || error.message.includes("not found"))
			) {
				return null;
			}
			throw error;
		}
	}

	/**
	 * Create a new Letter of Wishes for a given will ID
	 */
	static async create(willId: string): Promise<LetterOfWishesResponse> {
		try {
			console.log(`📝 Creating new Letter of Wishes for will ID: ${willId}`);

			const requestBody: CreateLetterOfWishesRequest = {
				will_id: willId,
			};

			const { data, error } = await apiClient<LetterOfWishesResponse>(
				"/letter-of-wishes",
				{
					method: "POST",
					body: JSON.stringify(requestBody),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to create Letter of Wishes");
			}

			console.log("✅ Letter of Wishes created successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error creating Letter of Wishes:", error);
			throw error;
		}
	}

	/**
	 * Get or create a Letter of Wishes for a given will ID
	 * This is a convenience method that combines the check and create operations
	 */
	static async getOrCreate(willId: string): Promise<LetterOfWishesResponse> {
		try {
			// First, check if a Letter of Wishes already exists
			const existing = await this.getByWillId(willId);

			if (existing) {
				console.log("📋 Using existing Letter of Wishes");
				return existing;
			}

			// If no existing Letter of Wishes, create a new one
			console.log("📝 No existing Letter of Wishes found, creating new one");
			return await this.create(willId);
		} catch (error) {
			console.error("❌ Error in getOrCreate Letter of Wishes:", error);
			throw error;
		}
	}

	/**
	 * Submit personal notes for a Letter of Wishes
	 */
	static async submitPersonalNotes(
		letterId: string,
		personalNotesData: SubmitPersonalNotesRequest
	): Promise<LetterOfWishesResponse> {
		try {
			console.log(`📝 Submitting personal notes for letter ID: ${letterId}`);

			const { data, error } = await apiClient<LetterOfWishesResponse>(
				`/letter-of-wishes/${letterId}/personal-notes`,
				{
					method: "POST",
					body: JSON.stringify(personalNotesData),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to submit personal notes");
			}

			console.log("✅ Personal notes submitted successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error submitting personal notes:", error);
			throw error;
		}
	}

	/**
	 * Submit personal notes using will ID (alternative method)
	 * This method will get or create a Letter of Wishes and then submit the notes
	 */
	static async submitPersonalNotesByWillId(
		willId: string,
		personalNotesData: SubmitPersonalNotesRequest
	): Promise<LetterOfWishesResponse> {
		try {
			console.log(`📝 Submitting personal notes for will ID: ${willId}`);

			// First, get or create a Letter of Wishes
			const letterResponse = await this.getOrCreate(willId);

			// Then submit the personal notes
			const result = await this.submitPersonalNotes(
				letterResponse.id,
				personalNotesData
			);

			console.log("✅ Personal notes submitted successfully via will ID");
			return result;
		} catch (error) {
			console.error("❌ Error submitting personal notes via will ID:", error);
			throw error;
		}
	}

	/**
	 * Get personal possessions for a Letter of Wishes
	 */
	static async getPersonalPossessions(
		lowId: string
	): Promise<PersonalPossession[]> {
		try {
			if (!lowId) {
				throw new Error("Letter of Wishes ID is required");
			}

			console.log(
				`📋 Fetching personal possessions for Letter of Wishes ID: ${lowId}`
			);

			const { data, error } = await apiClient<PersonalPossession[]>(
				`/personal-possessions/get-by-low/${lowId}`,
				{
					method: "GET",
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to fetch personal possessions");
			}

			console.log("✅ Personal possessions fetched successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error fetching personal possessions:", error);
			throw error;
		}
	}

	/**
	 * Create a new personal possession
	 */
	static async createPersonalPossession(
		possessionData: CreatePersonalPossessionRequest
	): Promise<PersonalPossession> {
		try {
			if (
				!possessionData.low_id ||
				!possessionData.beneficiary ||
				!possessionData.item
			) {
				throw new Error("low_id, beneficiary, and item are required fields");
			}

			console.log(
				`📝 Creating new personal possession for Letter of Wishes ID: ${possessionData.low_id}`
			);

			const { data, error } = await apiClient<PersonalPossession>(
				`/personal-possessions`,
				{
					method: "POST",
					body: JSON.stringify(possessionData),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to create personal possession");
			}

			console.log("✅ Personal possession created successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error creating personal possession:", error);
			throw error;
		}
	}

	/**
	 * Update a personal possession
	 */
	static async updatePersonalPossession(
		possessionId: string,
		updateData: UpdatePersonalPossessionRequest
	): Promise<PersonalPossession> {
		try {
			if (!possessionId) {
				throw new Error("Personal possession ID is required");
			}

			if (Object.keys(updateData).length === 0) {
				throw new Error("At least one field must be provided for update");
			}

			console.log(`📝 Updating personal possession with ID: ${possessionId}`);

			const { data, error } = await apiClient<PersonalPossession>(
				`/personal-possessions/${possessionId}`,
				{
					method: "PATCH",
					body: JSON.stringify(updateData),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to update personal possession");
			}

			console.log("✅ Personal possession updated successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error updating personal possession:", error);
			throw error;
		}
	}

	/**
	 * Delete a personal possession
	 */
	static async deletePersonalPossession(possessionId: string): Promise<void> {
		try {
			if (!possessionId) {
				throw new Error("Personal possession ID is required");
			}

			console.log(`🗑️ Deleting personal possession with ID: ${possessionId}`);

			const { error } = await apiClient(
				`/personal-possessions/${possessionId}`,
				{
					method: "DELETE",
				}
			);

			if (error) {
				throw new Error(error);
			}

			console.log("✅ Personal possession deleted successfully");
		} catch (error) {
			console.error("❌ Error deleting personal possession:", error);
			throw error;
		}
	}

	/**
	 * Get digital assets for a Letter of Wishes
	 */
	static async getDigitalAssets(lowId: string): Promise<DigitalAsset[]> {
		try {
			if (!lowId) {
				throw new Error("Letter of Wishes ID is required");
			}

			console.log(
				`📋 Fetching digital assets for Letter of Wishes ID: ${lowId}`
			);

			const { data, error } = await apiClient<DigitalAsset[]>(
				`/low-digital-assets/get-by-low/${lowId}`,
				{
					method: "GET",
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to fetch digital assets");
			}

			console.log("✅ Digital assets fetched successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error fetching digital assets:", error);
			throw error;
		}
	}

	/**
	 * Create a new digital asset
	 */
	static async createDigitalAsset(
		assetData: CreateDigitalAssetRequest
	): Promise<DigitalAsset> {
		try {
			if (
				!assetData.low_id ||
				!assetData.platform ||
				!assetData.username ||
				!assetData.action
			) {
				throw new Error(
					"low_id, platform, username, and action are required fields"
				);
			}

			console.log(
				`📝 Creating new digital asset for Letter of Wishes ID: ${assetData.low_id}`
			);

			const { data, error } = await apiClient<DigitalAsset>(
				`/low-digital-assets`,
				{
					method: "POST",
					body: JSON.stringify(assetData),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to create digital asset");
			}

			console.log("✅ Digital asset created successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error creating digital asset:", error);
			throw error;
		}
	}

	/**
	 * Update a digital asset
	 */
	static async updateDigitalAsset(
		assetId: string,
		updateData: UpdateDigitalAssetRequest
	): Promise<DigitalAsset> {
		try {
			if (!assetId) {
				throw new Error("Digital asset ID is required");
			}

			if (Object.keys(updateData).length === 0) {
				throw new Error("At least one field must be provided for update");
			}

			console.log(`📝 Updating digital asset with ID: ${assetId}`);

			const { data, error } = await apiClient<DigitalAsset>(
				`/low-digital-assets/${assetId}`,
				{
					method: "PATCH",
					body: JSON.stringify(updateData),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to update digital asset");
			}

			console.log("✅ Digital asset updated successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error updating digital asset:", error);
			throw error;
		}
	}

	/**
	 * Delete a digital asset
	 */
	static async deleteDigitalAsset(assetId: string): Promise<void> {
		try {
			if (!assetId) {
				throw new Error("Digital asset ID is required");
			}

			console.log(`🗑️ Deleting digital asset with ID: ${assetId}`);

			const { error } = await apiClient(`/low-digital-assets/${assetId}`, {
				method: "DELETE",
			});

			if (error) {
				throw new Error(error);
			}

			console.log("✅ Digital asset deleted successfully");
		} catch (error) {
			console.error("❌ Error deleting digital asset:", error);
			throw error;
		}
	}

	/**
	 * Get funeral instructions for a Letter of Wishes
	 */
	static async getFuneralInstructions(
		lowId: string
	): Promise<FuneralInstructions | null> {
		try {
			if (!lowId) {
				throw new Error("Letter of Wishes ID is required");
			}

			console.log(
				`📋 Fetching funeral instructions for Letter of Wishes ID: ${lowId}`
			);

			const { data, error } = await apiClient<FuneralInstructions>(
				`/low-funeral-instructions/get-by-low/${lowId}`,
				{
					method: "GET",
				}
			);

			if (error) {
				// If the error indicates no funeral instructions exist, return null
				if (error.includes("not found") || error.includes("404")) {
					console.log(
						"📭 No existing funeral instructions found for this Letter of Wishes"
					);
					return null;
				}
				throw new Error(error);
			}

			console.log("✅ Funeral instructions fetched successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error fetching funeral instructions:", error);
			// If it's a 404 or "not found" error, return null instead of throwing
			if (
				error instanceof Error &&
				(error.message.includes("404") || error.message.includes("not found"))
			) {
				return null;
			}
			throw error;
		}
	}

	/**
	 * Create funeral instructions for a Letter of Wishes
	 */
	static async createFuneralInstructions(
		instructionsData: CreateFuneralInstructionsRequest
	): Promise<FuneralInstructions> {
		try {
			if (!instructionsData.low_id) {
				throw new Error("low_id is required");
			}

			console.log(
				`📝 Creating funeral instructions for Letter of Wishes ID: ${instructionsData.low_id}`
			);

			const { data, error } = await apiClient<FuneralInstructions>(
				`/low-funeral-instructions`,
				{
					method: "POST",
					body: JSON.stringify(instructionsData),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to create funeral instructions");
			}

			console.log("✅ Funeral instructions created successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error creating funeral instructions:", error);
			throw error;
		}
	}

	/**
	 * Update funeral instructions for a Letter of Wishes
	 */
	static async updateFuneralInstructions(
		instructionsId: string,
		updateData: UpdateFuneralInstructionsRequest
	): Promise<FuneralInstructions> {
		try {
			if (!instructionsId) {
				throw new Error("Funeral instructions ID is required");
			}

			if (Object.keys(updateData).length === 0) {
				throw new Error("At least one field must be provided for update");
			}

			console.log(
				`📝 Updating funeral instructions with ID: ${instructionsId}`
			);
			console.log("🔍 Update data being sent:", updateData);
			console.log(
				"🔍 API endpoint:",
				`/low-funeral-instructions/${instructionsId}`
			);

			const { data, error } = await apiClient<FuneralInstructions>(
				`/low-funeral-instructions/${instructionsId}`,
				{
					method: "PATCH",
					body: JSON.stringify(updateData),
				}
			);

			console.log("🔍 API response data:", data);
			console.log("🔍 API response error:", error);

			if (error || !data) {
				throw new Error(error || "Failed to update funeral instructions");
			}

			console.log("✅ Funeral instructions updated successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error updating funeral instructions:", error);
			throw error;
		}
	}

	/**
	 * Delete funeral instructions for a Letter of Wishes
	 */
	static async deleteFuneralInstructions(
		instructionsId: string
	): Promise<void> {
		try {
			if (!instructionsId) {
				throw new Error("Funeral instructions ID is required");
			}

			console.log(
				`🗑️ Deleting funeral instructions with ID: ${instructionsId}`
			);

			const { error } = await apiClient(
				`/low-funeral-instructions/${instructionsId}`,
				{
					method: "DELETE",
				}
			);

			if (error) {
				throw new Error(error);
			}

			console.log("✅ Funeral instructions deleted successfully");
		} catch (error) {
			console.error("❌ Error deleting funeral instructions:", error);
			throw error;
		}
	}

	/**
	 * Get personal notes for a Letter of Wishes
	 */
	static async getPersonalNotes(lowId: string): Promise<PersonalNotes | null> {
		try {
			if (!lowId) {
				throw new Error("Letter of Wishes ID is required");
			}

			console.log(
				`📋 Fetching personal notes for Letter of Wishes ID: ${lowId}`
			);

			const { data, error } = await apiClient<PersonalNotes>(
				`/low-personal-notes/get-by-low/${lowId}`,
				{
					method: "GET",
				}
			);

			if (error) {
				// If the error indicates no personal notes exist, return null
				if (error.includes("not found") || error.includes("404")) {
					console.log(
						"📭 No existing personal notes found for this Letter of Wishes"
					);
					return null;
				}
				throw new Error(error);
			}

			console.log("✅ Personal notes fetched successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error fetching personal notes:", error);
			// If it's a 404 or "not found" error, return null instead of throwing
			if (
				error instanceof Error &&
				(error.message.includes("404") || error.message.includes("not found"))
			) {
				return null;
			}
			throw error;
		}
	}

	/**
	 * Get contacts for a Letter of Wishes
	 */
	static async getContacts(lowId: string): Promise<Contact[]> {
		try {
			if (!lowId) {
				throw new Error("Letter of Wishes ID is required");
			}

			console.log(`📋 Fetching contacts for Letter of Wishes ID: ${lowId}`);

			const { data, error } = await apiClient<Contact[]>(
				`/low-contacts/get-by-low/${lowId}`,
				{
					method: "GET",
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to fetch contacts");
			}

			console.log("✅ Contacts fetched successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error fetching contacts:", error);
			throw error;
		}
	}

	/**
	 * Create a new contact
	 */
	static async createContact(
		contactData: CreateContactRequest
	): Promise<Contact> {
		try {
			if (!contactData.low_id || !contactData.full_name || !contactData.email) {
				throw new Error("low_id, full_name, and email are required fields");
			}

			console.log(
				`📝 Creating new contact for Letter of Wishes ID: ${contactData.low_id}`
			);

			const { data, error } = await apiClient<Contact>(`/low-contacts`, {
				method: "POST",
				body: JSON.stringify(contactData),
			});

			if (error || !data) {
				throw new Error(error || "Failed to create contact");
			}

			console.log("✅ Contact created successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error creating contact:", error);
			throw error;
		}
	}

	/**
	 * Update a contact
	 */
	static async updateContact(
		contactId: string,
		updateData: UpdateContactRequest
	): Promise<Contact> {
		try {
			if (!contactId) {
				throw new Error("Contact ID is required");
			}

			if (Object.keys(updateData).length === 0) {
				throw new Error("At least one field must be provided for update");
			}

			console.log(`📝 Updating contact with ID: ${contactId}`);

			const { data, error } = await apiClient<Contact>(
				`/low-contacts/${contactId}`,
				{
					method: "PATCH",
					body: JSON.stringify(updateData),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to update contact");
			}

			console.log("✅ Contact updated successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error updating contact:", error);
			throw error;
		}
	}

	/**
	 * Delete a contact
	 */
	static async deleteContact(contactId: string): Promise<void> {
		try {
			if (!contactId) {
				throw new Error("Contact ID is required");
			}

			console.log(`🗑️ Deleting contact with ID: ${contactId}`);

			const { error } = await apiClient(`/low-contacts/${contactId}`, {
				method: "DELETE",
			});

			if (error) {
				throw new Error(error);
			}

			console.log("✅ Contact deleted successfully");
		} catch (error) {
			console.error("❌ Error deleting contact:", error);
			throw error;
		}
	}

	/**
	 * Get professional instructions for a Letter of Wishes
	 */
	static async getProfessionalInstructions(
		lowId: string
	): Promise<ProfessionalInstructions | null> {
		try {
			if (!lowId) {
				throw new Error("Letter of Wishes ID is required");
			}

			console.log(
				`📋 Fetching professional instructions for Letter of Wishes ID: ${lowId}`
			);

			const { data, error } = await apiClient<ProfessionalInstructions>(
				`/low-instructions/${lowId}`,
				{
					method: "GET",
				}
			);

			if (error) {
				// If the error indicates no professional instructions exist, return null
				if (error.includes("not found") || error.includes("404")) {
					console.log(
						"📭 No existing professional instructions found for this Letter of Wishes"
					);
					return null;
				}
				throw new Error(error);
			}

			console.log("✅ Professional instructions fetched successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error fetching professional instructions:", error);
			// If it's a 404 or "not found" error, return null instead of throwing
			if (
				error instanceof Error &&
				(error.message.includes("404") || error.message.includes("not found"))
			) {
				return null;
			}
			throw error;
		}
	}

	/**
	 * Create or update professional instructions for a Letter of Wishes
	 * The API endpoint /low-instructions handles both operations
	 */
	static async saveProfessionalInstructions(instructionsData: {
		low_id: string;
		professional_notes: string | null;
	}): Promise<ProfessionalInstructions> {
		try {
			if (!instructionsData.low_id) {
				throw new Error("low_id is required");
			}

			console.log(
				`📝 Saving professional instructions for Letter of Wishes ID: ${instructionsData.low_id}`
			);

			const { data, error } = await apiClient<ProfessionalInstructions>(
				`/low-instructions`,
				{
					method: "POST",
					body: JSON.stringify(instructionsData),
				}
			);

			if (error || !data) {
				throw new Error(error || "Failed to save professional instructions");
			}

			console.log("✅ Professional instructions saved successfully:", data);
			return data;
		} catch (error) {
			console.error("❌ Error saving professional instructions:", error);
			throw error;
		}
	}
}
