import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiClient } from "@/utils/apiClient";
import { getFormattedRelationshipNameById } from "@/utils/relationships";
import { useNavigate } from "react-router-dom";
import { useWill } from "@/context/WillContext";

// Create a type for the review data
type ReviewData = {
	personal: {
		fullName: string;
		address: string;
		maritalStatus: string;
	};
	spouse?: {
		fullName: string;
	};
	children?: Array<{
		fullName: string;
		relationship: string;
		requiresGuardian: boolean;
	}>;
	assets: Array<{
		type: string;
		description: string;
		distributionType: "equal" | "percentage";
		beneficiaries: Array<{
			id: string;
			percentage?: number;
			beneficiaryName?: string;
			relationship?: string;
		}>;
	}>;
	digitalAssets?: {
		beneficiaryId: string;
		beneficiaryName?: string;
		relationship?: string;
	};
	beneficiaries: Array<{
		id: string;
		fullName: string;
		relationship: string;
		allocation: number;
		requiresGuardian?: boolean;
	}>;
	executors: Array<{
		fullName?: string;
		companyName?: string;
		relationship?: string;
		isPrimary: boolean;
		type: "individual" | "corporate";
		registrationNumber?: string;
	}>;
	witnesses: Array<{
		fullName: string;
		address: string;
	}>;
	guardians: Array<{
		fullName: string;
		relationship: string;
		isPrimary: boolean;
	}>;
	pets?: {
		hasPets: boolean;
		guardianName?: string;
	};
	petsGuardian?: {
		fullName: string;
		relationship: string;
	};

	residuaryBeneficiaries: Array<{
		id: string;
		beneficiaryId: string;
		beneficiaryName: string;
		percentage: number;
	}>;
	funeralInstructions?: {
		wishes: string;
	};
};

export interface ReviewStepProps {
	onSave?: () => void;
	onBack?: () => void;
}

export interface ReviewStepHandle {
	handleSaveAndDownload: () => Promise<void>;
	isSaving: boolean;
}

// Complete Will Data Structure
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
	pets?: Array<{
		id: string;
		name: string;
		type: string;
		guardian_id: string;
		guardian_name: string;
	}>;
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
}

// Data transformation function
const transformWillDataToReviewFormat = (
	willData: CompleteWillData
): ReviewData => {
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

	// Add executors
	if (willData.executors && Array.isArray(willData.executors)) {
		willData.executors.forEach((executor) => {
			console.log("Processing executor:", executor);

			// Handle nested person/corporate_executor structure (expected)
			if (executor.person) {
				console.log("Found person executor:", executor.person);
				return {
					fullName: `${executor.person.first_name} ${executor.person.last_name}`,
					companyName: undefined,
					relationship: getFormattedRelationshipNameById(
						executor.person.relationship_id
					),
					isPrimary: executor.is_primary,
					type: "individual" as const,
					registrationNumber: undefined,
				};
			} else if (executor.corporate_executor) {
				console.log("Found corporate executor:", executor.corporate_executor);
				return {
					fullName: undefined,
					companyName: executor.corporate_executor.name,
					relationship: undefined,
					isPrimary: executor.is_primary,
					type: "corporate" as const,
					registrationNumber: executor.corporate_executor.rc_number,
				};
			}

			// Handle flat structure (fallback)
			console.log("No nested structure found, trying flat structure");
			const flatExecutor = executor as Record<string, unknown>; // Type assertion for fallback
			if (flatExecutor.first_name || flatExecutor.last_name) {
				return {
					fullName: `${flatExecutor.first_name || ""} ${
						flatExecutor.last_name || ""
					}`.trim(),
					companyName:
						(flatExecutor.name as string) ||
						(flatExecutor.company_name as string),
					relationship: flatExecutor.relationship as string,
					isPrimary: executor.is_primary,
					type:
						(flatExecutor.name as string) ||
						(flatExecutor.company_name as string)
							? "corporate"
							: "individual",
					registrationNumber:
						(flatExecutor.rc_number as string) ||
						(flatExecutor.registration_number as string),
				};
			}

			// If we can't determine the type, return a fallback
			console.log("Could not determine executor type, returning fallback");
			return {
				fullName: "Unknown Executor",
				companyName: undefined,
				relationship: undefined,
				isPrimary: executor.is_primary,
				type: "individual" as const,
				registrationNumber: undefined,
			};
		});
	}

	return {
		personal: {
			fullName: `${willData.owner.first_name} ${willData.owner.last_name}`,
			address: `${willData.owner.address}, ${willData.owner.city}, ${willData.owner.state} ${willData.owner.post_code}, ${willData.owner.country}`,
			maritalStatus: willData.owner.marital_status,
		},
		spouse: willData.spouse
			? {
					fullName: `${willData.spouse.first_name} ${willData.spouse.last_name}`,
			  }
			: undefined,
		children:
			willData.children && Array.isArray(willData.children)
				? willData.children.map((child) => ({
						fullName: `${child.first_name} ${child.last_name}`,
						relationship: getFormattedRelationshipNameById(
							child.relationship_id
						),
						requiresGuardian: child.is_minor,
				  }))
				: [],
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
										let relationship = "Unknown";

										if (beneficiary.person) {
											beneficiaryName = `${beneficiary.person.first_name} ${beneficiary.person.last_name}`;
											relationship = getFormattedRelationshipNameById(
												beneficiary.person.relationship_id
											);
										} else if (beneficiary.charity) {
											beneficiaryName = beneficiary.charity.name;
											relationship = "Charity";
										}

										return {
											id: beneficiary.id,
											percentage: beneficiary.percentage,
											beneficiaryName,
											relationship,
										};
								  })
								: [],
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
						console.log("Processing executor:", executor);

						// Handle nested person/corporate_executor structure (expected)
						if (executor.person) {
							console.log("Found person executor:", executor.person);
							return {
								fullName: `${executor.person.first_name} ${executor.person.last_name}`,
								companyName: undefined,
								relationship: getFormattedRelationshipNameById(
									executor.person.relationship_id
								),
								isPrimary: executor.is_primary,
								type: "individual" as const,
								registrationNumber: undefined,
							};
						} else if (executor.corporate_executor) {
							console.log(
								"Found corporate executor:",
								executor.corporate_executor
							);
							return {
								fullName: undefined,
								companyName: executor.corporate_executor.name,
								relationship: undefined,
								isPrimary: executor.is_primary,
								type: "corporate" as const,
								registrationNumber: executor.corporate_executor.rc_number,
							};
						}

						// Handle flat structure (fallback)
						console.log("No nested structure found, trying flat structure");
						const flatExecutor = executor as Record<string, unknown>; // Type assertion for fallback
						if (flatExecutor.first_name || flatExecutor.last_name) {
							return {
								fullName: `${flatExecutor.first_name || ""} ${
									flatExecutor.last_name || ""
								}`.trim(),
								companyName:
									(flatExecutor.name as string) ||
									(flatExecutor.company_name as string),
								relationship: flatExecutor.relationship as string,
								isPrimary: executor.is_primary,
								type:
									(flatExecutor.name as string) ||
									(flatExecutor.company_name as string)
										? "corporate"
										: "individual",
								registrationNumber:
									(flatExecutor.rc_number as string) ||
									(flatExecutor.registration_number as string),
							};
						}

						// If we can't determine the type, return a fallback
						console.log(
							"Could not determine executor type, returning fallback"
						);
						return {
							fullName: "Unknown Executor",
							companyName: undefined,
							relationship: undefined,
							isPrimary: executor.is_primary,
							type: "individual" as const,
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
						.filter((guardian) => guardian.person) // Filter out guardians without person data
						.map((guardian) => ({
							fullName: `${guardian.person!.first_name} ${
								guardian.person!.last_name
							}`,
							relationship: getFormattedRelationshipNameById(
								guardian.person!.relationship_id
							),
							isPrimary: guardian.is_primary,
						}))
				: [],
		pets:
			willData.pets && Array.isArray(willData.pets) && willData.pets.length > 0
				? {
						hasPets: true,
						guardianName: willData.pets[0]?.guardian_name,
				  }
				: undefined,

		residuaryBeneficiaries:
			willData.residuary &&
			willData.residuary.beneficiaries &&
			Array.isArray(willData.residuary.beneficiaries)
				? willData.residuary.beneficiaries.map((beneficiary) => {
						let beneficiaryName = "Unknown Beneficiary";
						if (beneficiary.person) {
							beneficiaryName = `${beneficiary.person.first_name} ${beneficiary.person.last_name}`;
						} else if (beneficiary.charity) {
							beneficiaryName = beneficiary.charity.name;
						}

						return {
							id: beneficiary.id,
							beneficiaryId:
								beneficiary.people_id || beneficiary.charities_id || "",
							beneficiaryName,
							percentage: parseInt(beneficiary.percentage) || 0,
						};
				  })
				: [],
		funeralInstructions: willData.funeral_instructions
			? {
					wishes: willData.funeral_instructions.wishes,
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

const ReviewStep = forwardRef<ReviewStepHandle, ReviewStepProps>(
	({ onBack }, ref) => {
		const [isLoading, setIsLoading] = useState(true);
		const [reviewData, setReviewData] = useState<ReviewData | null>(null);
		const [willId, setWillId] = useState<string | null>(null);
		const navigate = useNavigate();
		const { activeWill } = useWill();

		// Load complete will data from single endpoint
		const loadCompleteWillData = async () => {
			if (!activeWill?.id) {
				toast.error("No active will found");
				setIsLoading(false);
				return;
			}

			try {
				const { data, error } = await apiClient<CompleteWillData>(
					`/wills/${activeWill.id}/get-full-will`
				);

				if (error) {
					console.error("Error loading complete will data:", error);
					toast.error("Failed to load will data");
					return;
				}

				const willData = Array.isArray(data) ? data[0] : data;
				console.log("Raw will data:", willData);

				// Add specific debugging for funeral instructions
				console.log("=== REVIEW STEP FUNERAL INSTRUCTIONS DEBUG ===");
				console.log(
					"Raw funeral_instructions:",
					willData?.funeral_instructions
				);

				if (willData) {
					// Store the will ID for payment flow
					setWillId(willData.id);

					console.log("Will data structure check:");
					console.log("- owner:", willData.owner);
					console.log("- spouse:", willData.spouse);
					console.log("- children:", willData.children);
					console.log("- guardians:", willData.guardians);
					console.log("- pets:", willData.pets);
					console.log("- pets_guardian:", willData.pets_guardian);
					console.log("- assets:", willData.assets);

					console.log("- executors:", willData.executors);
					console.log("- witnesses:", willData.witnesses);
					console.log("- residuary:", willData.residuary);
					console.log("- funeral_instructions:", willData.funeral_instructions);

					// Debug executors specifically
					console.log("=== EXECUTORS DEBUG ===");
					if (willData.executors && Array.isArray(willData.executors)) {
						console.log("Executors array length:", willData.executors.length);
						willData.executors.forEach(
							(executor: CompleteWillData["executors"][0], index: number) => {
								console.log(`Executor ${index}:`, {
									id: executor.id,
									is_primary: executor.is_primary,
									corporate_executor: executor.corporate_executor,
									person: executor.person,
									executor_id: executor.executor_id,
									corporate_executor_id: executor.corporate_executor_id,
								});
							}
						);
					} else {
						console.log("No executors array or not an array");
					}
					console.log("=== END EXECUTORS DEBUG ===");

					const transformedData = transformWillDataToReviewFormat(willData);
					console.log("Transformed data:", transformedData);

					console.log("Transformed executors:", transformedData.executors);
					console.log(
						"Transformed funeral instructions:",
						transformedData.funeralInstructions
					);
					console.log(
						"Transformed pets guardian:",
						transformedData.petsGuardian
					);
					setReviewData(transformedData);

					// Update will status to draft
					await updateWillStatusToDraft(willData.id);
				} else {
					toast.error("No active will found");
				}
			} catch (error) {
				console.error("Error loading complete will data:", error);
				toast.error("Failed to load will data");
			} finally {
				setIsLoading(false);
			}
		};

		// Update will status to draft
		const updateWillStatusToDraft = async (willId: string) => {
			try {
				const { error } = await apiClient(`/wills/${willId}`, {
					method: "PATCH",
					body: JSON.stringify({
						status: "draft",
					}),
				});

				if (error) {
					console.error("Error updating will status to draft:", error);
					// Don't show error toast as this is not critical for the review step
					return;
				}

				console.log("Will status updated to draft successfully");
			} catch (error) {
				console.error("Error updating will status to draft:", error);
				// Don't show error toast as this is not critical for the review step
			}
		};

		// Handle payment flow (same as Dashboard)
		const handleProceedToPayment = () => {
			if (!willId) {
				toast.error("No will ID found. Please try again.");
				return;
			}

			// Navigate directly to Stripe Checkout with the will ID (same as Dashboard)
			const paymentUrl = `/app/payment/checkout?willId=${willId}&description=Will Creation Service`;
			navigate(paymentUrl);
		};

		useEffect(() => {
			const loadData = async () => {
				setIsLoading(true);
				await loadCompleteWillData();
			};
			loadData();
		}, []);

		useImperativeHandle(ref, () => ({
			handleSaveAndDownload: async () => {},
			isSaving: false,
		}));

		if (isLoading || !reviewData) {
			return (
				<div className="space-y-6">
					<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
						Review Your Will
					</div>
					<LoadingSpinner
						message="Loading will data..."
						className="min-h-[400px]"
					/>
				</div>
			);
		}

		// --- REDESIGNED REVIEW PAGE ---
		// Prepare sections dynamically
		const sections = [
			{
				shouldShow: true,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="personal"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
								<span className="text-blue-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">
								Personal Information
							</h3>
						</div>
						<div className="space-y-6">
							<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Full Name
									</label>
									<p className="text-gray-900 font-medium">
										{reviewData.personal.fullName}
									</p>
								</div>
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Marital Status
									</label>
									<p className="text-gray-900 font-medium capitalize">
										{reviewData.personal.maritalStatus}
									</p>
								</div>
							</div>
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-700">
									Address
								</label>
								<p className="text-gray-900">{reviewData.personal.address}</p>
							</div>
						</div>
					</section>
				),
			},
			{
				shouldShow: !!reviewData.spouse,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="spouse"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
								<span className="text-pink-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">Spouse</h3>
						</div>
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Full Name
							</label>
							<p className="text-gray-900 font-medium">
								{reviewData.spouse?.fullName}
							</p>
						</div>
					</section>
				),
			},
			{
				shouldShow: reviewData.children && reviewData.children.length > 0,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="children"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
								<span className="text-green-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">Children</h3>
						</div>
						<div className="grid gap-4">
							{reviewData.children?.map((child, idx) => (
								<div
									key={idx}
									className="bg-gray-50 rounded-lg p-4 border border-gray-100"
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between">
										<div className="space-y-1">
											<label className="block text-sm font-medium text-gray-700">
												Full Name
											</label>
											<div className="flex items-center gap-2">
												<p className="text-gray-900 font-medium">
													{child.fullName}
												</p>
												{child.requiresGuardian && (
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
														Minor
													</span>
												)}
											</div>
										</div>
										<div className="space-y-1 mt-2 md:mt-0">
											<label className="block text-sm font-medium text-gray-700">
												Relationship
											</label>
											<p className="text-gray-900">{child.relationship}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				),
			},
			{
				shouldShow: reviewData.guardians && reviewData.guardians.length > 0,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="guardians"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
								<span className="text-purple-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">Guardians</h3>
						</div>
						<div className="grid gap-4">
							{reviewData.guardians?.map((guardian, idx) => (
								<div
									key={idx}
									className="bg-gray-50 rounded-lg p-4 border border-gray-100"
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between">
										<div className="space-y-1">
											<label className="block text-sm font-medium text-gray-700">
												Full Name
											</label>
											<div className="flex items-center gap-2">
												<p className="text-gray-900 font-medium">
													{guardian.fullName}
												</p>
												{guardian.isPrimary && (
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
														Primary Guardian
													</span>
												)}
											</div>
										</div>
										<div className="space-y-1 mt-2 md:mt-0">
											<label className="block text-sm font-medium text-gray-700">
												Relationship
											</label>
											<p className="text-gray-900">{guardian.relationship}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				),
			},
			{
				shouldShow: reviewData.pets && reviewData.pets.hasPets,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="pets"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
								<span className="text-emerald-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">Pet Care</h3>
						</div>
						<div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
							<div className="space-y-4">
								<div className="space-y-1">
									<label className="block text-sm font-medium text-gray-700">
										Pet Care Status
									</label>
									<p className="text-gray-900 font-medium">You have pets</p>
								</div>
								{reviewData.pets?.guardianName && (
									<div className="space-y-1">
										<label className="block text-sm font-medium text-gray-700">
											Guardian
										</label>
										<p className="text-gray-900 font-medium">
											{reviewData.pets.guardianName}
										</p>
									</div>
								)}
							</div>
						</div>
					</section>
				),
			},
			{
				shouldShow: !!reviewData.petsGuardian,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="pets-guardian"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
								<span className="text-emerald-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">
								Pet Guardian
							</h3>
						</div>
						<div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
							<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Full Name
									</label>
									<p className="text-gray-900 font-medium">
										{reviewData.petsGuardian?.fullName}
									</p>
								</div>
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Relationship
									</label>
									<p className="text-gray-900">
										{reviewData.petsGuardian?.relationship}
									</p>
								</div>
							</div>
						</div>
					</section>
				),
			},
			{
				shouldShow:
					reviewData.assets &&
					reviewData.assets.some(
						(asset) =>
							asset.distributionType &&
							asset.beneficiaries &&
							asset.beneficiaries.length > 0
					),
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="assets"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
								<span className="text-yellow-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">Gifts</h3>
						</div>
						<div className="grid gap-6">
							{reviewData.assets
								.filter(
									(asset) =>
										asset.distributionType &&
										asset.beneficiaries &&
										asset.beneficiaries.length > 0
								)
								.map((asset, idx) => (
									<div
										key={idx}
										className="bg-gray-50 rounded-lg p-6 border border-gray-100"
									>
										<div className="space-y-4 mb-4">
											<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														Asset Type
													</label>
													<p className="text-gray-900 font-medium">
														{asset.type}
													</p>
												</div>
												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														Distribution Type
													</label>
													<p className="text-gray-900 font-medium capitalize">
														{asset.distributionType}
													</p>
												</div>
											</div>
											<div className="space-y-2">
												<label className="block text-sm font-medium text-gray-700">
													Description
												</label>
												<p className="text-gray-900">{asset.description}</p>
											</div>
										</div>
										{asset.beneficiaries && asset.beneficiaries.length > 0 && (
											<div className="border-t border-gray-200 pt-4">
												<label className="block text-sm font-medium text-gray-700 mb-3">
													Beneficiaries
												</label>
												<div className="space-y-3">
													{asset.beneficiaries.map((beneficiary, bidx) => (
														<div
															key={bidx}
															className="bg-white rounded-lg p-3 border border-gray-200"
														>
															<div className="flex flex-col md:flex-row md:items-center md:justify-between">
																<div className="space-y-1">
																	<p className="text-gray-900 font-medium">
																		{beneficiary.beneficiaryName}
																	</p>
																	<p className="text-sm text-gray-600">
																		{beneficiary.relationship}
																	</p>
																</div>
																{asset.beneficiaries.length > 1 &&
																	asset.distributionType === "percentage" && (
																		<div className="mt-2 md:mt-0">
																			<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
																				{beneficiary.percentage
																					? `${beneficiary.percentage}%`
																					: "Equal share"}
																			</span>
																		</div>
																	)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								))}
						</div>
					</section>
				),
			},
			{
				shouldShow: reviewData.digitalAssets?.beneficiaryId,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="digital-assets"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
								<span className="text-purple-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">
								Digital Assets
							</h3>
						</div>
						<div className="space-y-4">
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Digital Assets Beneficiary
									</label>
									<p className="text-gray-900 font-medium">
										{reviewData.digitalAssets?.beneficiaryName}
									</p>
									<p className="text-sm text-gray-600">
										{reviewData.digitalAssets?.relationship}
									</p>
								</div>
							</div>
						</div>
					</section>
				),
			},

			{
				shouldShow:
					reviewData.residuaryBeneficiaries &&
					reviewData.residuaryBeneficiaries.length > 0,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="residuary"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
								<span className="text-orange-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">
								Residuary Estate Distribution
							</h3>
						</div>
						<div className="grid gap-4">
							{reviewData.residuaryBeneficiaries.map((residuary, idx) => (
								<div
									key={idx}
									className="bg-gray-50 rounded-lg p-4 border border-gray-100"
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between">
										<div className="space-y-1">
											<label className="block text-sm font-medium text-gray-700">
												Beneficiary
											</label>
											<p className="text-gray-900 font-medium">
												{residuary.beneficiaryName}
											</p>
										</div>
										<div className="space-y-1 mt-2 md:mt-0">
											<label className="block text-sm font-medium text-gray-700">
												Percentage
											</label>
											<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
												{residuary.percentage}%
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				),
			},
			{
				shouldShow: reviewData.executors && reviewData.executors.length > 0,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="executors"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
								<span className="text-red-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">Executors</h3>
						</div>
						<div className="grid gap-4">
							{reviewData.executors.map((executor, idx) => (
								<div
									key={idx}
									className="bg-gray-50 rounded-lg p-4 border border-gray-100"
								>
									<div className="space-y-4">
										<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
											<div className="space-y-2">
												<label className="block text-sm font-medium text-gray-700">
													{executor.type === "individual"
														? "Name"
														: "Company Name"}
												</label>
												<div className="flex items-center gap-2">
													<p className="text-gray-900 font-medium">
														{executor.type === "individual"
															? executor.fullName
															: executor.companyName}
													</p>
													{executor.isPrimary && (
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
															Primary Executor
														</span>
													)}
												</div>
											</div>
											<div className="space-y-2">
												<label className="block text-sm font-medium text-gray-700">
													Type
												</label>
												<p className="text-gray-900 font-medium capitalize">
													{executor.type}
												</p>
											</div>
										</div>
										{executor.type === "individual" &&
											executor.relationship && (
												<div className="space-y-2">
													<label className="block text-sm font-medium text-gray-700">
														Relationship
													</label>
													<p className="text-gray-900">
														{executor.relationship}
													</p>
												</div>
											)}
									</div>
								</div>
							))}
						</div>
					</section>
				),
			},
			{
				shouldShow: reviewData.witnesses && reviewData.witnesses.length > 0,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="witnesses"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
								<span className="text-teal-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">Witnesses</h3>
						</div>
						<div className="grid gap-4">
							{reviewData.witnesses.map((witness, idx) => (
								<div
									key={idx}
									className="bg-gray-50 rounded-lg p-4 border border-gray-100"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<label className="block text-sm font-medium text-gray-700">
												Full Name
											</label>
											<p className="text-gray-900 font-medium">
												{witness.fullName}
											</p>
										</div>
										<div className="space-y-2">
											<label className="block text-sm font-medium text-gray-700">
												Address
											</label>
											<p className="text-gray-900">{witness.address}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				),
			},
			{
				shouldShow: !!reviewData.funeralInstructions,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="funeral"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
								<span className="text-gray-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">
								Funeral Instructions
							</h3>
						</div>
						<div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Instructions
							</label>
							<p className="text-gray-900">
								I want to be {reviewData.funeralInstructions?.wishes}
							</p>
						</div>
					</section>
				),
			},

			{
				shouldShow: reviewData.assets && reviewData.assets.length > 0,
				render: (num: number) => (
					<section
						className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
						key="all-assets"
					>
						<div className="flex items-center space-x-3 mb-6">
							<div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
								<span className="text-indigo-600 font-semibold text-sm">
									{num}
								</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900">
								All Assets
							</h3>
						</div>
						<div className="grid gap-4">
							{reviewData.assets.map((asset, idx) => (
								<div
									key={idx}
									className="bg-gray-50 rounded-lg p-4 border border-gray-100"
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
										<div className="space-y-2">
											<label className="block text-sm font-medium text-gray-700">
												Asset Type
											</label>
											<p className="text-gray-900 font-medium">{asset.type}</p>
										</div>
										<div className="space-y-2">
											<label className="block text-sm font-medium text-gray-700">
												Description
											</label>
											<p className="text-gray-900">{asset.description}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				),
			},
		];

		return (
			<div data-review-step className="space-y-8">
				{/* Header Section */}
				<div className="text-left space-y-4">
					<div className="text-3xl font-bold text-gray-900">
						Review Your Will
					</div>
					<div className="text-lg text-gray-600 mx-auto">
						Please carefully review all the information below before proceeding
						to payment.
					</div>
					<div className="text-lg text-gray-600 mx-auto">
						This document will be legally binding once completed.
					</div>
				</div>

				{/* Dynamically Rendered Sections */}
				{sections
					.filter((s) => s.shouldShow)
					.map((section, idx) => section.render(idx + 1))}

				{/* Navigation Buttons */}
				<div className="flex justify-between pt-8 border-t border-gray-200">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						className="cursor-pointer px-8 py-3"
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button
						type="button"
						className="cursor-pointer bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium"
						onClick={handleProceedToPayment}
					>
						<CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment
					</Button>
				</div>
			</div>
		);
	}
);

ReviewStep.displayName = "ReviewStep";

export default ReviewStep;
