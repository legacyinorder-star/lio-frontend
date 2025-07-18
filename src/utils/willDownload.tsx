import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import WillPDF from "@/components/will-wizard/WillPDF";
import { apiClient } from "@/utils/apiClient";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

// Import the same types and transformation function from ReviewStep
interface CompleteWillData {
	id: string;
	created_at: string;
	user_id: string;
	status: string;
	last_updated_at: string;
	payment_status: string;
	owner: {
		id: string;
		will_id: string;
		created_at: string;
		first_name: string;
		last_name: string;
		marital_status: string;
		address: string;
		city: string;
		state: string;
		post_code: string;
		country: string;
	};
	spouse?: {
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
	children: Array<{
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
	guardians: Array<{
		will_id: string;
		created_at: string;
		is_primary: boolean;
		guardian_id: string;
		person: {
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
	}>;
	assets: Array<{
		id: string;
		will_id: string;
		user_id: string;
		name: string;
		asset_type: string;
		description: string;
		created_at: string;
		distribution_type: string;
		beneficiaries: Array<{
			id: string;
			created_at: string;
			will_id: string;
			people_id: string;
			charities_id: string;
			asset_id: string;
			percentage: number;
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
				rc_number: string;
				user_id: string;
			};
		}>;
	}>;

	residuary: {
		id: string;
		created_at: string;
		will_id: string;
		distribution_type: string;
		beneficiaries: Array<{
			id: string;
			created_at: string;
			residuary_id: string;
			will_id: string;
			people_id: string;
			charities_id: string;
			percentage: string;
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
				rc_number: string;
				user_id: string;
			};
		}>;
	};
	executors: Array<{
		id: string;
		created_at: string;
		will_id: string;
		corporate_executor_id: string;
		executor_id: string;
		is_primary: boolean;
		corporate_executor?: {
			id: string;
			created_at: string;
			user_id: string;
			name: string;
			will_id: string;
			rc_number: string;
		};
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
	}>;
	witnesses: Array<{
		id: string;
		created_at: string;
		will_id: string;
		user_id: string;
		first_name: string;
		last_name: string;
		address: string;
		city: string;
		state: string;
		post_code: string;
		country: string;
	}>;
	funeral_instructions?: {
		id: string;
		created_at: string;
		wishes: string;
		will_id: string;
		user_id: string;
	};
	pets_guardian?: {
		id: string;
		created_at: string;
		user_id: string;
		will_id: string;
		guardian_id: string;
		person: {
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
	};
}

// PDF data structure that matches WillPDF component expectations
interface PDFData {
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
			beneficiaryName?: string;
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

	residuaryBeneficiaries?: Array<{
		id: string;
		beneficiaryId: string;
		percentage: number;
	}>;
	residuaryDistributionType?: "equal" | "manual" | undefined;
	funeralInstructions?: {
		wishes: string;
	};
	pets?: {
		hasPets: boolean;
		guardianName?: string;
	};
	petsGuardian?: {
		fullName: string;
		relationship: string;
	};
}

/**
 * Transform CompleteWillData to PDF format using the same logic as ReviewStep
 */
const transformWillDataToPDFFormat = (willData: CompleteWillData): PDFData => {
	// Get all unique people for beneficiary resolution
	const allPeople = new Map<
		string,
		{
			firstName: string;
			lastName: string;
			relationshipId: string;
			isMinor: boolean;
		}
	>();

	// Add spouse
	if (willData.spouse) {
		allPeople.set(willData.spouse.id, {
			firstName: willData.spouse.first_name,
			lastName: willData.spouse.last_name,
			relationshipId: willData.spouse.relationship_id,
			isMinor: willData.spouse.is_minor,
		});
	}

	// Add children
	if (willData.children && Array.isArray(willData.children)) {
		willData.children.forEach((child) => {
			allPeople.set(child.id, {
				firstName: child.first_name,
				lastName: child.last_name,
				relationshipId: child.relationship_id,
				isMinor: child.is_minor,
			});
		});
	}

	// Add guardians
	if (willData.guardians && Array.isArray(willData.guardians)) {
		willData.guardians.forEach((guardian) => {
			if (guardian.person) {
				allPeople.set(guardian.person.id, {
					firstName: guardian.person.first_name,
					lastName: guardian.person.last_name,
					relationshipId: guardian.person.relationship_id,
					isMinor: guardian.person.is_minor,
				});
			}
		});
	}

	// Add people from assets
	if (willData.assets && Array.isArray(willData.assets)) {
		willData.assets.forEach((asset) => {
			if (asset.beneficiaries && Array.isArray(asset.beneficiaries)) {
				asset.beneficiaries.forEach((beneficiary) => {
					if (beneficiary.person) {
						allPeople.set(beneficiary.person.id, {
							firstName: beneficiary.person.first_name,
							lastName: beneficiary.person.last_name,
							relationshipId: beneficiary.person.relationship_id,
							isMinor: beneficiary.person.is_minor,
						});
					}
				});
			}
		});
	}

	// Add people from residuary
	if (
		willData.residuary &&
		willData.residuary.beneficiaries &&
		Array.isArray(willData.residuary.beneficiaries)
	) {
		willData.residuary.beneficiaries.forEach((beneficiary) => {
			if (beneficiary.person) {
				allPeople.set(beneficiary.person.id, {
					firstName: beneficiary.person.first_name,
					lastName: beneficiary.person.last_name,
					relationshipId: beneficiary.person.relationship_id,
					isMinor: beneficiary.person.is_minor,
				});
			}
		});
	}

	return {
		personal: {
			fullName: `${willData.owner.first_name} ${willData.owner.last_name}`,
			dateOfBirth: "", // Not available in API
			address: `${willData.owner.address}, ${willData.owner.city}, ${willData.owner.state} ${willData.owner.post_code}, ${willData.owner.country}`,
			phone: "", // Not available in API
			maritalStatus: willData.owner.marital_status,
		},
		assets:
			willData.assets && Array.isArray(willData.assets)
				? willData.assets.map((asset) => ({
						type: asset.asset_type,
						description: asset.description,
						distributionType: asset.distribution_type as "equal" | "percentage",
						beneficiaries:
							asset.beneficiaries && Array.isArray(asset.beneficiaries)
								? asset.beneficiaries.map((beneficiary) => {
										let beneficiaryName = "Unknown Beneficiary";
										if (beneficiary.person) {
											beneficiaryName = `${beneficiary.person.first_name} ${beneficiary.person.last_name}`;
										} else if (beneficiary.charity) {
											beneficiaryName = beneficiary.charity.name;
										}

										return {
											id: beneficiary.id,
											percentage: beneficiary.percentage,
											beneficiaryName,
										};
								  })
								: [],
				  }))
				: [],
		beneficiaries: Array.from(allPeople.entries()).map(([id, person]) => ({
			id,
			fullName: `${person.firstName} ${person.lastName}`,
			relationship: getFormattedRelationshipNameById(person.relationshipId),
			allocation: 0, // This will be calculated from residuary
			requiresGuardian: person.isMinor,
		})),
		executors:
			willData.executors && Array.isArray(willData.executors)
				? willData.executors.map((executor) => {
						// Handle nested person/corporate_executor structure
						if (executor.person) {
							return {
								fullName: `${executor.person.first_name} ${executor.person.last_name}`,
								companyName: undefined,
								relationship: getFormattedRelationshipNameById(
									executor.person.relationship_id
								),
								email: "",
								phone: "",
								address: "", // Not available in API
								isPrimary: executor.is_primary,
								type: "individual" as const,
								contactPerson: undefined,
								registrationNumber: undefined,
							};
						} else if (executor.corporate_executor) {
							return {
								fullName: undefined,
								companyName: executor.corporate_executor.name,
								relationship: undefined,
								email: "",
								phone: "",
								address: "", // Not available in API
								isPrimary: executor.is_primary,
								type: "corporate" as const,
								contactPerson: undefined,
								registrationNumber: executor.corporate_executor.rc_number,
							};
						}

						// Fallback
						return {
							fullName: "Unknown Executor",
							companyName: undefined,
							relationship: undefined,
							email: "",
							phone: "",
							address: "",
							isPrimary: executor.is_primary,
							type: "individual" as const,
							contactPerson: undefined,
							registrationNumber: undefined,
						};
				  })
				: [],
		witnesses:
			willData.witnesses && Array.isArray(willData.witnesses)
				? willData.witnesses.map((witness) => ({
						fullName: `${witness.first_name} ${witness.last_name}`,
						address: `${witness.address}, ${witness.city}, ${witness.state} ${witness.post_code}, ${witness.country}`,
				  }))
				: [],
		guardians:
			willData.guardians && Array.isArray(willData.guardians)
				? willData.guardians
						.filter((guardian) => guardian.person)
						.map((guardian) => ({
							fullName: `${guardian.person!.first_name} ${
								guardian.person!.last_name
							}`,
							relationship: getFormattedRelationshipNameById(
								guardian.person!.relationship_id
							),
							isPrimary: guardian.is_primary,
							address: "", // Not available in API
						}))
				: [],

		residuaryBeneficiaries:
			willData.residuary &&
			willData.residuary.beneficiaries &&
			Array.isArray(willData.residuary.beneficiaries)
				? willData.residuary.beneficiaries.map((beneficiary) => ({
						id: beneficiary.id,
						beneficiaryId:
							beneficiary.people_id || beneficiary.charities_id || "",
						percentage: parseInt(beneficiary.percentage) || 0,
				  }))
				: [],
		residuaryDistributionType: willData.residuary?.distribution_type as
			| "equal"
			| "manual"
			| undefined,
		funeralInstructions: willData.funeral_instructions
			? {
					wishes: willData.funeral_instructions.wishes,
			  }
			: undefined,
		pets: willData.pets_guardian
			? {
					hasPets: true,
					guardianName: `${willData.pets_guardian.person.first_name} ${willData.pets_guardian.person.last_name}`,
			  }
			: undefined,
		petsGuardian: willData.pets_guardian?.person
			? {
					fullName: `${willData.pets_guardian.person.first_name} ${willData.pets_guardian.person.last_name}`,
					relationship: getFormattedRelationshipNameById(
						willData.pets_guardian.person.relationship_id
					),
			  }
			: undefined,
	};
};

/**
 * Generate and download a will PDF using the specific will endpoint
 */
export const downloadWillPDF = async (willId: string): Promise<boolean> => {
	try {
		// Load complete will data from the specific will endpoint
		const { data, error } = await apiClient<CompleteWillData>(
			`/wills/${willId}/get-full-will`
		);

		if (error) {
			console.error("Error loading complete will data:", error);
			toast.error("Failed to load will data");
			return false;
		}

		const willData = Array.isArray(data) ? data[0] : data;
		if (!willData) {
			toast.error("Will not found");
			return false;
		}

		// Transform the data using the same logic as ReviewStep
		const pdfData = transformWillDataToPDFFormat(willData);

		// Generate PDF using JSX
		const pdfDoc = pdf(<WillPDF data={pdfData} />);

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
	const downloadWill = async (willId: string) => {
		return await downloadWillPDF(willId);
	};

	return { downloadWill };
};
