import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import WillPDF from "@/components/will-wizard/WillPDF";
import { apiClient } from "@/utils/apiClient";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

// Import the same types and transformation function from willDownload.tsx
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
		distribution_type?: string;
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
	digital_asset?: {
		id: string;
		created_at: string;
		will_id: string;
		beneficiary_id: string;
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
	};
}

// PDF Data interface (same as in willDownload.tsx)
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
		hasBeneficiaries?: boolean;
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
	digitalAssets?: {
		beneficiaryId: string;
		beneficiaryName?: string;
		relationship?: string;
	};
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

// Transform will data to PDF format (same logic as willDownload.tsx)
const transformWillDataToPDFFormat = (willData: CompleteWillData): PDFData => {
	return {
		personal: {
			fullName: `${willData.owner.first_name} ${willData.owner.last_name}`,
			dateOfBirth: "Not specified", // Not available in API
			address: `${willData.owner.address}, ${willData.owner.city}, ${willData.owner.state} ${willData.owner.post_code}, ${willData.owner.country}`,
			phone: "Not specified", // Not available in API
			maritalStatus: willData.owner.marital_status || "Not specified",
		},
		assets:
			willData.assets && Array.isArray(willData.assets)
				? willData.assets.map((asset) => ({
						type: asset.asset_type,
						description: asset.description,
						hasBeneficiaries:
							asset.beneficiaries && asset.beneficiaries.length > 0,
						distributionType: asset.distribution_type as "equal" | "percentage",
						beneficiaries: asset.beneficiaries
							? asset.beneficiaries.map((beneficiary) => ({
									id: beneficiary.id,
									percentage: beneficiary.percentage,
									beneficiaryName: beneficiary.person
										? `${beneficiary.person.first_name} ${beneficiary.person.last_name}`
										: "Unknown",
							  }))
							: undefined,
				  }))
				: [],
		beneficiaries:
			willData.children && Array.isArray(willData.children)
				? willData.children.map((child) => ({
						id: child.id,
						fullName: `${child.first_name} ${child.last_name}`,
						relationship: getFormattedRelationshipNameById(
							child.relationship_id
						),
						email: "", // Not available in API
						phone: "", // Not available in API
						allocation: 0, // Not available in API
						dateOfBirth: "", // Not available in API
						requiresGuardian: child.is_minor,
				  }))
				: [],
		executors:
			willData.executors && Array.isArray(willData.executors)
				? willData.executors.map((executor) => {
						if (executor.person) {
							return {
								fullName: `${executor.person.first_name} ${executor.person.last_name}`,
								companyName: undefined,
								relationship: getFormattedRelationshipNameById(
									executor.person.relationship_id
								),
								email: "", // Not available in API
								phone: "", // Not available in API
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
		digitalAssets: willData.digital_asset
			? {
					beneficiaryId: willData.digital_asset.beneficiary_id,
					beneficiaryName: willData.digital_asset.person
						? `${willData.digital_asset.person.first_name} ${willData.digital_asset.person.last_name}`
						: "Unknown Beneficiary",
					relationship: willData.digital_asset.person
						? getFormattedRelationshipNameById(
								willData.digital_asset.person.relationship_id
						  )
						: "Unknown Relationship",
			  }
			: undefined,
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

interface UploadResponse {
	path: string;
	name: string;
}

/**
 * Generate and upload a will PDF to the server
 */
export const uploadWillPDF = async (
	willId: string
): Promise<UploadResponse | null> => {
	try {
		console.log("🔄 Starting will PDF generation and upload for will:", willId);

		// Load complete will data from the specific will endpoint
		const { data, error } = await apiClient<CompleteWillData>(
			`/wills/${willId}/get-full-will`
		);

		if (error) {
			console.error("❌ Error loading complete will data:", error);
			toast.error("Failed to load will data");
			return null;
		}

		const willData = Array.isArray(data) ? data[0] : data;
		if (!willData) {
			console.error("❌ Will not found");
			toast.error("Will not found");
			return null;
		}

		console.log("✅ Will data loaded successfully");
		console.log("📋 Will data structure:", {
			id: willData.id,
			owner: willData.owner?.first_name + " " + willData.owner?.last_name,
			assetsCount: willData.assets?.length || 0,
			executorsCount: willData.executors?.length || 0,
			beneficiariesCount: willData.beneficiaries?.length || 0,
		});

		// Transform the data using the same logic as willDownload.tsx
		console.log("🔄 Transforming will data to PDF format...");
		let pdfData: PDFData;
		try {
			pdfData = transformWillDataToPDFFormat(willData);
			console.log("✅ PDF data transformed successfully");
		} catch (transformError) {
			console.error("❌ Error transforming will data:", transformError);
			console.error("❌ Transform error details:", {
				name: transformError instanceof Error ? transformError.name : "Unknown",
				message:
					transformError instanceof Error
						? transformError.message
						: String(transformError),
				stack:
					transformError instanceof Error
						? transformError.stack
						: "No stack trace",
			});
			toast.error("Failed to process will data");
			return null;
		}

		console.log("🔄 Creating PDF document...");
		let pdfDoc;
		try {
			pdfDoc = pdf(<WillPDF data={pdfData} />);
			console.log("✅ PDF document created successfully");
		} catch (pdfError) {
			console.error("❌ Error creating PDF document:", pdfError);
			console.error("❌ PDF creation error details:", {
				name: pdfError instanceof Error ? pdfError.name : "Unknown",
				message:
					pdfError instanceof Error ? pdfError.message : String(pdfError),
				stack: pdfError instanceof Error ? pdfError.stack : "No stack trace",
			});
			toast.error("Failed to create PDF document");
			return null;
		}

		console.log("🔄 Generating PDF blob...");

		try {
			// Generate the PDF blob
			const blob = await pdfDoc.toBlob();

			// Verify blob is valid
			if (!(blob instanceof Blob) || blob.size === 0) {
				throw new Error("Generated PDF is invalid");
			}

			console.log("✅ PDF blob generated successfully, size:", blob.size);

			// Create FormData for file upload
			const formData = new FormData();
			const fileName = `will-${pdfData.personal.fullName
				.toLowerCase()
				.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

			formData.append("document", blob, fileName);

			console.log("🔄 Saving PDF to secure storage...");

			// Upload the PDF to the server
			console.log(
				"🔄 Uploading FormData with blob size:",
				blob.size,
				"and filename:",
				fileName
			);
			const { data: uploadResponse, error: uploadError } = await apiClient<{
				name: string;
				path: string;
			}>(`/wills/${willId}/upload-will-document`, {
				method: "POST",
				authenticated: true,
				body: formData,
				// Don't set Content-Type header for FormData, let the browser set it with boundary
			});

			if (uploadError) {
				console.error("❌ Error saving PDF:", uploadError);
				return null;
			}

			console.log("✅ PDF saved successfully");
			return uploadResponse || null;
		} catch (blobError) {
			console.error(
				"❌ Direct blob generation failed, trying buffer:",
				blobError
			);
			console.error("❌ Blob error details:", {
				name: blobError instanceof Error ? blobError.name : "Unknown",
				message:
					blobError instanceof Error ? blobError.message : String(blobError),
				stack: blobError instanceof Error ? blobError.stack : "No stack trace",
			});
			try {
				// If direct blob generation fails, try using buffer
				const buffer = await pdfDoc.toBuffer();
				const blob = new Blob([buffer], { type: "application/pdf" });

				console.log("✅ PDF buffer generated successfully, size:", blob.size);

				// Create FormData for file upload
				const formData = new FormData();
				const fileName = `will-${pdfData.personal.fullName
					.toLowerCase()
					.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

				formData.append("document", blob, fileName);

				console.log("🔄 Saving PDF to server...");

				// Upload the PDF to the server
				const { data: uploadResponse, error: uploadError } = await apiClient<{
					name: string;
					path: string;
				}>(`/wills/${willId}/upload-will-document`, {
					method: "POST",
					authenticated: true,
					body: formData,
					// Don't set Content-Type header for FormData, let the browser set it with boundary
				});

				if (uploadError) {
					console.error("❌ Error saving PDF:", uploadError);
					return null;
				}

				console.log("✅ PDF saved successfully");
				return uploadResponse || null;
			} catch (bufferError) {
				console.error("❌ Buffer generation failed:", bufferError);
				console.error("❌ Buffer error details:", {
					name: bufferError instanceof Error ? bufferError.name : "Unknown",
					message:
						bufferError instanceof Error
							? bufferError.message
							: String(bufferError),
					stack:
						bufferError instanceof Error ? bufferError.stack : "No stack trace",
				});
				throw new Error("Failed to generate PDF document");
			}
		}
	} catch (error) {
		console.error("❌ Error saving will:", error);
		console.error("❌ Main error details:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : "No stack trace",
		});
		toast.error(
			"Failed to generate and save PDF. Please try again or contact support if the issue persists."
		);
		return null;
	}
};
