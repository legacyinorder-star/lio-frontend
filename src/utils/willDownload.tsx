import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import WillPDF from "@/components/will-wizard/WillPDF";
import { type WillData } from "@/context/WillContext";
import { apiClient } from "@/utils/apiClient";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

interface SavedWill {
	id: string;
	createdAt: string;
	updatedAt: string;
	data: {
		personal: {
			fullName: string;
			dateOfBirth: string;
			address: string;
			phone: string;
			maritalStatus: string;
		};
		assets: Array<{
			type: string;
			description: string;
			distributionType?: "equal" | "percentage";
			beneficiaries?: Array<{
				id?: string;
				percentage?: number;
			}>;
		}>;
		beneficiaries: Array<{
			id?: string;
			fullName: string;
			relationship: string;
			email?: string;
			phone?: string;
			allocation: number;
			dateOfBirth?: string;
			requiresGuardian?: boolean;
		}>;
		executors: Array<{
			fullName?: string;
			companyName?: string;
			relationship?: string;
			email?: string;
			phone?: string;
			address: string;
			isPrimary: boolean;
			type: "individual" | "corporate";
			contactPerson?: string;
			registrationNumber?: string;
		}>;
		witnesses: Array<{
			fullName: string;
			address: string;
		}>;
		guardians?: Array<{
			fullName: string;
			relationship: string;
			isPrimary: boolean;
			address?: string;
		}>;
		gifts?: Array<{
			type: string;
			description: string;
			value?: string;
			beneficiaryId: string;
			beneficiaryName: string;
		}>;
		residuaryBeneficiaries?: Array<{
			id: string;
			beneficiaryId: string;
			percentage: number;
		}>;
		// additionalInstructions?: string;
	};
	status: string;
}

interface DownloadWillOptions {
	activeWill?: WillData | null;
	willId?: string;
	searchParams?: URLSearchParams;
}

// Define AssetApiResponse and BeneficiaryApiResponse types for asset fetching
interface AssetApiBeneficiary {
	id: string;
	percentage: number;
	people_id?: string;
	charities_id?: string;
	person?: {
		id: string;
		first_name: string;
		last_name: string;
		relationship_id: string;
	};
	charity?: {
		id: string;
		name: string;
		rc_number?: string;
	};
}
interface AssetApiResponse {
	id: string;
	will_id: string;
	asset_type: string;
	description: string;
	distribution_type: "equal" | "percentage";
	beneficiaries: AssetApiBeneficiary[];
}

/**
 * Transform activeWill data to the format expected by WillPDF component
 */
export const transformActiveWillToPDFData = (will: WillData) => {
	return {
		personal: {
			fullName: `${will.owner.firstName} ${will.owner.lastName}`,
			dateOfBirth: "", // Not available in WillPersonalData
			address: `${will.owner.address}, ${will.owner.city}, ${
				will.owner.state
			} ${will.owner.postCode || ""}, ${will.owner.country}`,
			phone: "", // Not available in WillPersonalData
			maritalStatus: will.owner.maritalStatus || "",
		},
		assets: (will.assets || []).map((asset) => ({
			type: asset.assetType,
			description: asset.description,
			distributionType: asset.distributionType,
			beneficiaries: asset.beneficiaries.map((b) => ({
				id: b.id,
				percentage: b.percentage,
			})),
		})),
		beneficiaries: (will.beneficiaries || []).map((beneficiary) => ({
			id: "", // Not available in WillBeneficiary
			fullName: `${beneficiary.firstName} ${beneficiary.lastName}`,
			relationship: beneficiary.relationship,
			email: "", // Not available in WillBeneficiary
			phone: "", // Not available in WillBeneficiary
			allocation: beneficiary.allocation || 0,
			dateOfBirth: "", // Not available in WillBeneficiary
			requiresGuardian: false, // Not available in WillBeneficiary
		})),
		executors: (will.executors || []).map((executor) => ({
			fullName:
				executor.type === "individual"
					? `${executor.firstName || ""} ${executor.lastName || ""}`
					: undefined,
			companyName:
				executor.type === "corporate" ? executor.companyName : undefined,
			relationship: executor.relationship || "",
			email: "", // Not available in WillExecutor
			phone: "", // Not available in WillExecutor
			address: `${executor.address?.address || ""}, ${
				executor.address?.city || ""
			}, ${executor.address?.state || ""} ${
				executor.address?.postCode || ""
			}, ${executor.address?.country || ""}`,
			isPrimary: executor.isPrimary || false,
			type: executor.type,
			contactPerson:
				executor.type === "corporate" ? executor.contactPerson : undefined,
			registrationNumber: "", // Not available in WillExecutor
		})),
		witnesses: (will.witnesses || []).map((witness) => ({
			fullName: `${witness.firstName} ${witness.lastName}`,
			address: `${witness.address?.address || ""}, ${
				witness.address?.city || ""
			}, ${witness.address?.state || ""} ${witness.address?.postCode || ""}, ${
				witness.address?.country || ""
			}`,
		})),
		guardians: (will.guardians || []).map((guardian) => ({
			fullName: `${guardian.firstName} ${guardian.lastName}`,
			relationship: guardian.relationship,
			isPrimary: guardian.isPrimary || false,
			address: "", // Not available in WillData guardians
		})),
		gifts: (will.gifts || []).map((gift) => ({
			type: gift.type,
			description: gift.description,
			value: gift.value?.toString() || "",
			beneficiaryId: gift.person?.id || gift.charity?.id || "",
			beneficiaryName: gift.person
				? `${gift.person.firstName} ${gift.person.lastName}`
				: gift.charity?.name || "",
		})),
		residuaryBeneficiaries:
			will.residuary?.beneficiaries?.map((beneficiary) => ({
				id: beneficiary.id,
				beneficiaryId: beneficiary.person?.id || beneficiary.charity?.id || "",
				percentage: beneficiary.percentage,
			})) || [],
		// additionalInstructions: "", // Not available in WillData
	};
};

/**
 * Get will data from multiple sources (activeWill context, localStorage, etc.)
 */
export const getWillDataForDownload = (options: DownloadWillOptions) => {
	const { activeWill, willId, searchParams } = options;

	// 1. First try to get from activeWill context
	if (activeWill && activeWill.owner) {
		return transformActiveWillToPDFData(activeWill);
	}

	// 2. Try to get from localStorage using willId from URL or direct willId
	const targetWillId = willId || searchParams?.get("willId");
	if (targetWillId) {
		const savedWills: SavedWill[] = JSON.parse(
			localStorage.getItem("wills") || "[]"
		);
		const savedWill = savedWills.find((w: SavedWill) => w.id === targetWillId);
		if (savedWill && savedWill.data) {
			return savedWill.data;
		}
	}

	// 3. If still no data, try to get the most recent will from localStorage
	const savedWills: SavedWill[] = JSON.parse(
		localStorage.getItem("wills") || "[]"
	);
	if (savedWills.length > 0) {
		// Get the most recent will
		const mostRecentWill = savedWills.sort(
			(a: SavedWill, b: SavedWill) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)[0];
		if (mostRecentWill && mostRecentWill.data) {
			return mostRecentWill.data;
		}
	}

	return null;
};

/**
 * Generate and download a will PDF
 */
export const downloadWillPDF = async (
	options: DownloadWillOptions
): Promise<boolean> => {
	try {
		// Get will data from multiple sources
		const willData = getWillDataForDownload(options);

		if (!willData) {
			toast.error("No will data found. Please create a will first.");
			return false;
		}

		// --- NEW: Fetch assets from API ---
		let willId = options.willId || options.searchParams?.get("willId");
		if (!willId && options.activeWill) {
			willId = options.activeWill.id;
		}
		let apiAssets = null;
		if (willId) {
			try {
				const { data: assetsData, error } = await apiClient(
					`/assets/get-by-will/${willId}`
				);
				if (!error && Array.isArray(assetsData)) {
					apiAssets = (assetsData as AssetApiResponse[]).map((asset) => ({
						type: asset.asset_type,
						description: asset.description,
						distributionType: asset.distribution_type,
						beneficiaries: asset.beneficiaries.map((b: AssetApiBeneficiary) => {
							let beneficiaryName = "Unknown Beneficiary";
							let relationship = "Unknown";
							if (b.person) {
								beneficiaryName = `${b.person.first_name} ${b.person.last_name}`;
								relationship = getFormattedRelationshipNameById(
									b.person.relationship_id
								);
							} else if (b.charity) {
								beneficiaryName = b.charity.name;
								relationship = "Charity";
							}
							return {
								id: b.id,
								percentage: b.percentage,
								beneficiaryName,
								relationship,
							};
						}),
					}));
				}
			} catch (err) {
				console.error("Failed to fetch assets for PDF:", err);
			}
		}
		// --- END NEW ---

		// Merge API assets into willData for PDF
		const pdfData = {
			...willData,
			assets: apiAssets || willData.assets,
		};

		// Generate PDF using JSX
		const pdfDoc = pdf(
			<WillPDF
				data={pdfData}
				// additionalText="This is a sample additional text that can be customized based on the user's input."
			/>
		);

		try {
			// First try to get the blob directly
			const blob = await pdfDoc.toBlob();

			// Verify blob is valid
			if (!(blob instanceof Blob) || blob.size === 0) {
				throw new Error("Generated PDF is invalid");
			}

			// Create download link
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `will-${pdfData.personal.fullName
				.toLowerCase()
				.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 100);

			toast.success("Will downloaded successfully");
			return true;
		} catch (error) {
			console.error("Direct blob generation failed, trying buffer:", error);
			try {
				// If direct blob generation fails, try using buffer
				const buffer = await pdfDoc.toBuffer();
				const blob = new Blob([buffer], { type: "application/pdf" });
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `will-${pdfData.personal.fullName
					.toLowerCase()
					.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

				// Trigger download
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				// Clean up
				setTimeout(() => {
					URL.revokeObjectURL(url);
				}, 100);

				toast.success("Will downloaded successfully");
				return true;
			} catch (bufferError) {
				console.error("Buffer generation failed:", bufferError);
				throw new Error("Failed to generate PDF document");
			}
		}
	} catch (error) {
		console.error("Error downloading will:", error);
		toast.error(
			"Failed to generate PDF. Please try again or contact support if the issue persists."
		);
		return false;
	}
};

/**
 * Hook-like function for will download with loading state management
 */
export const useWillDownload = () => {
	const downloadWill = async (options: DownloadWillOptions) => {
		return await downloadWillPDF(options);
	};

	return { downloadWill };
};
