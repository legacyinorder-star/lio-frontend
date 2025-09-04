import { apiClient } from "./apiClient";
import { showWillStatusError } from "@/hooks/useWillEditPermission";

/**
 * Enhanced API client specifically for will operations with built-in status validation
 */

interface WillApiResponse<T = any> {
	data: T | null;
	error: string | null;
	statusValid: boolean;
	willStatus?: string;
}

/**
 * Protected statuses that prevent editing
 */
const PROTECTED_STATUSES = [
	"under review",
	"completed",
	"submitted",
	"cancelled",
];

/**
 * Validates will status before allowing API operations
 */
async function validateWillStatus(
	willId: string,
	operation: string = "edit"
): Promise<{
	valid: boolean;
	status: string;
	error?: string;
}> {
	try {
		const { data, error } = await apiClient(`/wills/${willId}`);

		if (error || !data) {
			return {
				valid: false,
				status: "unknown",
				error: "Cannot verify will status",
			};
		}

		const willData = Array.isArray(data) ? data[0] : data;
		const status = willData.status;

		const isValid = !PROTECTED_STATUSES.includes(status);

		if (!isValid) {
			showWillStatusError(status, operation);
		}

		return { valid: isValid, status };
	} catch (err) {
		return {
			valid: false,
			status: "unknown",
			error: "Status validation failed",
		};
	}
}

/**
 * Makes an API call with will status validation
 */
export async function willApiCall<T = any>(
	endpoint: string,
	options: any = {},
	willId?: string,
	operation: string = "edit"
): Promise<WillApiResponse<T>> {
	// If willId is provided, validate status first
	if (willId) {
		const validation = await validateWillStatus(willId, operation);

		if (!validation.valid) {
			return {
				data: null,
				error:
					validation.error ||
					`Operation '${operation}' not allowed for will status: ${validation.status}`,
				statusValid: false,
				willStatus: validation.status,
			};
		}
	}

	// Proceed with API call if validation passes
	try {
		const { data, error } = await apiClient<T>(endpoint, options);

		return {
			data,
			error,
			statusValid: true,
			willStatus: willId
				? (await validateWillStatus(willId)).status
				: undefined,
		};
	} catch (err) {
		return {
			data: null,
			error: err instanceof Error ? err.message : "API call failed",
			statusValid: true, // Status was valid, but API call failed
		};
	}
}

/**
 * Specific methods for different will operations
 */
export const willApi = {
	/**
	 * Update will data with status validation
	 */
	async updateWill<T = any>(
		willId: string,
		data: any
	): Promise<WillApiResponse<T>> {
		return willApiCall<T>(
			`/wills/${willId}`,
			{
				method: "PATCH",
				body: JSON.stringify(data),
			},
			willId,
			"edit"
		);
	},

	/**
	 * Update will progress with status validation
	 */
	async updateProgress<T = any>(
		willId: string,
		progressData: any
	): Promise<WillApiResponse<T>> {
		return willApiCall<T>(
			`/wills/${willId}/progress`,
			{
				method: "PUT",
				body: JSON.stringify(progressData),
			},
			willId,
			"edit"
		);
	},

	/**
	 * Add/update assets with status validation
	 */
	async updateAssets<T = any>(
		willId: string,
		assetData: any
	): Promise<WillApiResponse<T>> {
		return willApiCall<T>(
			`/assets/will/${willId}`,
			{
				method: "POST",
				body: JSON.stringify(assetData),
			},
			willId,
			"edit"
		);
	},

	/**
	 * Add/update beneficiaries with status validation
	 */
	async updateBeneficiaries<T = any>(
		willId: string,
		beneficiaryData: any
	): Promise<WillApiResponse<T>> {
		return willApiCall<T>(
			`/beneficiaries/${willId}`,
			{
				method: "POST",
				body: JSON.stringify(beneficiaryData),
			},
			willId,
			"edit"
		);
	},

	/**
	 * Submit will for review (only allowed for draft status)
	 */
	async submitWill<T = any>(willId: string): Promise<WillApiResponse<T>> {
		// First check if will is in draft status and paid
		const { data: willData, error } = await apiClient(`/wills/${willId}`);

		if (error || !willData) {
			return {
				data: null,
				error: "Cannot verify will status for submission",
				statusValid: false,
			};
		}

		const will = Array.isArray(willData) ? willData[0] : willData;

		if (will.status !== "draft") {
			showWillStatusError(will.status, "submit");
			return {
				data: null,
				error: `Cannot submit: Will status is '${will.status}', must be 'draft'`,
				statusValid: false,
				willStatus: will.status,
			};
		}

		if (will.payment_status !== "paid") {
			return {
				data: null,
				error: "Cannot submit: Payment required before submission",
				statusValid: false,
				willStatus: will.status,
			};
		}

		return willApiCall<T>(
			`/wills/${willId}/submit`,
			{
				method: "POST",
			},
			willId,
			"submit"
		);
	},

	/**
	 * Get will data (read-only, no status validation needed)
	 */
	async getWill<T = any>(willId: string): Promise<WillApiResponse<T>> {
		return willApiCall<T>(`/wills/${willId}`, {}, undefined, "read");
	},
};

/**
 * Utility to check if a will status allows editing
 */
export function canEditWillStatus(status: string): boolean {
	return !PROTECTED_STATUSES.includes(status);
}

/**
 * Utility to get user-friendly status message
 */
export function getStatusMessage(status: string): string {
	const messages = {
		"in progress": "Your will is being created and can be edited",
		draft: "Your will is complete and ready for submission",
		"under review": "Your will is being reviewed by our legal team",
		completed: "Your will has been finalized and is ready for download",
		submitted: "Your will has been submitted for processing",
		cancelled: "Your will has been cancelled",
		rejected: "Your will was rejected and needs revision",
	};

	return messages[status as keyof typeof messages] || `Will status: ${status}`;
}
