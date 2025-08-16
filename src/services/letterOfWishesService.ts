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
}
