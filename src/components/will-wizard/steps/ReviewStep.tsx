import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { PaymentService } from "@/services/paymentService";
import { downloadWillPDF } from "@/utils/willDownload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiClient } from "@/utils/apiClient";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

export interface ReviewStepProps {
	data?: {
		personal: {
			fullName: string;
			address: string;
			maritalStatus: string;
		};
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
		gifts: Array<{
			type: string;
			description: string;
			value?: string;
			beneficiaryId: string;
			beneficiaryName: string;
		}>;
		residuaryBeneficiaries: Array<{
			id: string;
			beneficiaryId: string;
			percentage: number;
		}>;
		funeralInstructions?: {
			instructions: string;
		};
	};
	onSave?: () => void;
	onBack?: () => void;
}

export interface ReviewStepHandle {
	handleSaveAndDownload: () => Promise<void>;
	isSaving: boolean;
}

// API Response interfaces
interface WillOwnerApiResponse {
	id: string;
	will_id: string;
	first_name: string;
	last_name: string;
	marital_status: string;
	address: string;
	city: string;
	state: string;
	post_code: string;
	country: string;
}

interface GuardianApiResponse {
	id: string;
	will_id: string;
	guardian_id: string;
	is_primary: boolean;
	guardian: {
		id: string;
		first_name: string;
		last_name: string;
		relationship: string;
	};
}

interface AssetApiResponse {
	id: string;
	will_id: string;
	asset_type: string;
	description: string;
	distribution_type: "equal" | "percentage";
	beneficiaries: Array<{
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
	}>;
}

interface GiftApiResponse {
	id: string;
	will_id: string;
	type: string;
	description: string;
	value?: number;
	currency?: string;
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

interface ResiduaryApiResponse {
	id: string;
	will_id: string;
	distribution_type: "equal" | "manual";
	beneficiaries: Array<{
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
	}>;
}

interface ExecutorApiResponse {
	id: string;
	will_id: string;
	type: "individual" | "corporate";
	first_name?: string;
	last_name?: string;
	company_name?: string;
	relationship?: string;
	is_primary: boolean;
	address: string;
	city: string;
	state: string;
	post_code: string;
	country: string;
	email: string;
	phone: string;
}

interface WitnessApiResponse {
	id: string;
	will_id: string;
	first_name: string;
	last_name: string;
	address: string;
	city: string;
	state: string;
	post_code: string;
	country: string;
}

interface FuneralInstructionsApiResponse {
	id: string;
	will_id: string;
	instructions: string;
}

interface BeneficiaryApiResponse {
	charities: Array<{
		id: string;
		name: string;
		rc_number?: string;
	}>;
	people: Array<{
		id: string;
		first_name: string;
		last_name: string;
		relationship_id: string;
		is_minor: boolean;
	}>;
}

const ReviewStep = forwardRef<ReviewStepHandle, ReviewStepProps>(
	({ data: propData, onBack }, ref) => {
		const [isSaving, setIsSaving] = useState(false);
		const [isLoading, setIsLoading] = useState(true);
		const [reviewData, setReviewData] = useState<
			ReviewStepProps["data"] | null
		>(null);
		const navigate = useNavigate();
		const [_willId, setWillId] = useState<string>("");

		// Load active will ID first
		const loadActiveWillId = async () => {
			try {
				const { data, error } = await apiClient("/wills/get-user-active-will");

				if (error) {
					console.error("Error loading active will:", error);
					toast.error("Failed to load will data");
					return null;
				}

				// Handle both array and single object responses
				const willData = Array.isArray(data) ? data[0] : data;
				if (willData && willData.id) {
					return willData.id;
				}
				return null;
			} catch (error) {
				console.error("Error loading active will:", error);
				toast.error("Failed to load will data");
				return null;
			}
		};

		// Load all data from API
		const loadAllData = async (willId: string) => {
			try {
				// Load all data in parallel
				const [
					ownerResponse,
					guardiansResponse,
					assetsResponse,
					giftsResponse,
					residuaryResponse,
					executorsResponse,
					witnessesResponse,
					funeralInstructionsResponse,
					beneficiariesResponse,
				] = await Promise.allSettled([
					apiClient<WillOwnerApiResponse>(`/will_owner/get-by-will/${willId}`),
					apiClient<GuardianApiResponse[]>(
						`/guardianship/get-by-will/${willId}`
					),
					apiClient<AssetApiResponse[]>(`/assets/get-by-will/${willId}`),
					apiClient<GiftApiResponse[]>(`/gifts/get-by-will/${willId}`),
					apiClient<ResiduaryApiResponse>(`/residuary/get-by-will/${willId}`),
					apiClient<ExecutorApiResponse[]>(`/executors/get-by-will/${willId}`),
					apiClient<WitnessApiResponse[]>(`/witnesses/get-by-will/${willId}`),
					apiClient<FuneralInstructionsApiResponse>(
						`/funeral_instructions/get-by-will/${willId}`
					),
					apiClient<BeneficiaryApiResponse>(`/beneficiaries/${willId}`),
				]);

				// Process owner data
				let personal = null;
				if (ownerResponse.status === "fulfilled" && ownerResponse.value.data) {
					const owner = ownerResponse.value.data;
					personal = {
						fullName: `${owner.first_name} ${owner.last_name}`,
						address: `${owner.address}, ${owner.city}, ${owner.state} ${owner.post_code}, ${owner.country}`,
						maritalStatus: owner.marital_status,
					};
				}

				// Process guardians
				let guardians: Array<{
					fullName: string;
					relationship: string;
					isPrimary: boolean;
				}> = [];
				if (
					guardiansResponse.status === "fulfilled" &&
					guardiansResponse.value.data
				) {
					guardians = guardiansResponse.value.data.map((guardian) => ({
						fullName: `${guardian.guardian.first_name} ${guardian.guardian.last_name}`,
						relationship: getFormattedRelationshipNameById(
							guardian.guardian.relationship
						),
						isPrimary: guardian.is_primary,
					}));
				}

				// Process assets
				let assets: Array<{
					type: string;
					description: string;
					distributionType: "equal" | "percentage";
					beneficiaries: Array<{
						id: string;
						percentage?: number;
						beneficiaryName?: string;
						relationship?: string;
					}>;
				}> = [];
				if (
					assetsResponse.status === "fulfilled" &&
					assetsResponse.value.data
				) {
					assets = assetsResponse.value.data.map((asset) => ({
						type: asset.asset_type,
						description: asset.description,
						distributionType: asset.distribution_type,
						beneficiaries: asset.beneficiaries.map((beneficiary) => {
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
						}),
					}));
				}

				// Process gifts
				let gifts: Array<{
					type: string;
					description: string;
					value?: string;
					beneficiaryId: string;
					beneficiaryName: string;
				}> = [];
				if (giftsResponse.status === "fulfilled" && giftsResponse.value.data) {
					gifts = giftsResponse.value.data.map((gift) => {
						let beneficiaryName = "Unknown Beneficiary";
						if (gift.person) {
							beneficiaryName = `${gift.person.first_name} ${gift.person.last_name}`;
						} else if (gift.charity) {
							beneficiaryName = gift.charity.name;
						}
						return {
							type: gift.type,
							description: gift.description,
							value: gift.value?.toString(),
							beneficiaryId: gift.people_id || gift.charities_id || "",
							beneficiaryName,
						};
					});
				}

				// Process residuary beneficiaries
				let residuaryBeneficiaries: Array<{
					id: string;
					beneficiaryId: string;
					percentage: number;
				}> = [];
				if (
					residuaryResponse.status === "fulfilled" &&
					residuaryResponse.value.data
				) {
					residuaryBeneficiaries =
						residuaryResponse.value.data.beneficiaries.map((beneficiary) => ({
							id: beneficiary.id,
							beneficiaryId:
								beneficiary.people_id || beneficiary.charities_id || "",
							percentage: beneficiary.percentage,
						}));
				}

				// Process executors
				let executors: Array<{
					fullName?: string;
					companyName?: string;
					relationship?: string;
					isPrimary: boolean;
					type: "individual" | "corporate";
					registrationNumber?: string;
				}> = [];
				if (
					executorsResponse.status === "fulfilled" &&
					executorsResponse.value.data
				) {
					executors = executorsResponse.value.data.map((executor) => ({
						fullName:
							executor.type === "individual"
								? `${executor.first_name || ""} ${
										executor.last_name || ""
								  }`.trim()
								: undefined,
						companyName:
							executor.type === "corporate" ? executor.company_name : undefined,
						relationship: executor.relationship,
						isPrimary: executor.is_primary,
						type: executor.type,
						registrationNumber: undefined,
					}));
				}

				// Process witnesses
				let witnesses: Array<{
					fullName: string;
					address: string;
				}> = [];
				if (
					witnessesResponse.status === "fulfilled" &&
					witnessesResponse.value.data
				) {
					witnesses = witnessesResponse.value.data.map((witness) => ({
						fullName: `${witness.first_name} ${witness.last_name}`,
						address: `${witness.address}, ${witness.city}, ${witness.state} ${witness.post_code}, ${witness.country}`,
					}));
				}

				// Process funeral instructions
				let funeralInstructions: { instructions: string } | undefined =
					undefined;
				if (
					funeralInstructionsResponse.status === "fulfilled" &&
					funeralInstructionsResponse.value.data
				) {
					funeralInstructions = {
						instructions: funeralInstructionsResponse.value.data.instructions,
					};
				}

				// Process beneficiaries for residuary display
				const beneficiaries: Array<{
					id: string;
					fullName: string;
					relationship: string;
					allocation: number;
					requiresGuardian?: boolean;
				}> = [];
				if (
					beneficiariesResponse.status === "fulfilled" &&
					beneficiariesResponse.value.data
				) {
					const beneficiariesData = beneficiariesResponse.value.data;

					// Add charities
					beneficiariesData.charities.forEach((charity) => {
						beneficiaries.push({
							id: charity.id,
							fullName: charity.name,
							relationship: "Charity",
							allocation: 0,
						});
					});

					// Add people
					beneficiariesData.people.forEach((person) => {
						const relationshipName =
							getFormattedRelationshipNameById(person.relationship_id) ||
							"Other";
						beneficiaries.push({
							id: person.id,
							fullName: `${person.first_name} ${person.last_name}`,
							relationship: relationshipName,
							allocation: 0,
							requiresGuardian: person.is_minor,
						});
					});
				}

				// Combine all data - only set if we have personal data
				if (personal) {
					const combinedData = {
						personal,
						assets,
						beneficiaries,
						executors,
						witnesses,
						guardians,
						gifts,
						residuaryBeneficiaries,
						funeralInstructions,
					};

					setReviewData(combinedData);
				} else {
					toast.error("Failed to load personal information");
				}
			} catch (error) {
				console.error("Error loading data:", error);
				toast.error("Failed to load will data");
			} finally {
				setIsLoading(false);
			}
		};

		// Load data on component mount
		useEffect(() => {
			const loadData = async () => {
				setIsLoading(true);

				// If prop data is provided, use it
				if (propData) {
					setReviewData(propData);
					setIsLoading(false);
					return;
				}

				// Load active will ID first
				const willId = await loadActiveWillId();
				if (willId) {
					// Load all data using the will ID
					await loadAllData(willId);
				} else {
					setIsLoading(false);
				}
			};

			loadData();
		}, [propData]);

		const saveWillToLocalStorage = () => {
			try {
				// Get existing wills or initialize empty array
				const existingWills = JSON.parse(localStorage.getItem("wills") || "[]");

				// Create will object with metadata
				const will = {
					id: _willId,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					data: reviewData,
					status: "draft",
				};

				// Add new will to array
				existingWills.push(will);

				// Save back to localStorage
				localStorage.setItem("wills", JSON.stringify(existingWills));

				return _willId;
			} catch (error) {
				console.error("Error saving will to localStorage:", error);
				throw new Error("Failed to save will data");
			}
		};

		const handleSaveAndDownload = async () => {
			if (isSaving) return;

			try {
				setIsSaving(true);

				// Generate a unique ID for the will
				const willId = crypto.randomUUID();
				setWillId(willId);

				// Save will data to localStorage first
				saveWillToLocalStorage();

				// Use the utility function to download the PDF
				const success = await downloadWillPDF({
					// Create a mock saved will structure for the utility
					willId: willId,
					searchParams: new URLSearchParams(`willId=${willId}`),
				});

				if (success) {
					toast.success("Will saved and downloaded successfully");
					navigate("/app/dashboard");
				}
			} catch (error) {
				console.error("Error saving will:", error);
				toast.error("Failed to save and download will. Please try again.");
			} finally {
				setIsSaving(false);
			}
		};

		const handleProceedToPayment = async () => {
			try {
				// First, save the will data to ensure we have a will ID
				if (!reviewData?.personal?.fullName) {
					toast.error(
						"Please complete all required information before proceeding to payment"
					);
					return;
				}

				// Get will ID from context or generate one
				let willId = _willId;
				if (!willId) {
					willId = crypto.randomUUID();
					setWillId(willId);
				}

				// Save will data to localStorage as backup
				saveWillToLocalStorage();

				// Navigate to payment with will data using price ID
				const searchParams = new URLSearchParams({
					willId: willId,
					amount: PaymentService.getWillPrice().toString(),
					description: "Will Creation Service",
					source: "will-wizard",
				});

				navigate(`/app/payment?${searchParams.toString()}`);
			} catch (error) {
				console.error("Error proceeding to payment:", error);
				toast.error("Failed to proceed to payment. Please try again.");
			}
		};

		useImperativeHandle(ref, () => ({
			handleSaveAndDownload,
			isSaving,
		}));

		// Show loading state
		if (isLoading || !reviewData) {
			return (
				<div className="space-y-6">
					<div className="text-2xl font-semibold">Review Your Will</div>
					<LoadingSpinner
						message="Loading will data..."
						className="min-h-[400px]"
					/>
				</div>
			);
		}

		return (
			<div data-review-step className="space-y-6">
				<div className="text-2xl font-semibold">Review Your Will</div>
				<div className="text-muted-foreground">
					Please review all the information below before proceeding to payment.
				</div>

				{/* Personal Information */}
				{reviewData.personal && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Personal Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Full Name
								</label>
								<p className="mt-1 text-gray-900">
									{reviewData.personal.fullName}
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Marital Status
								</label>
								<p className="mt-1 text-gray-900">
									{reviewData.personal.maritalStatus}
								</p>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700">
									Address
								</label>
								<p className="mt-1 text-gray-900">
									{reviewData.personal.address}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Guardians */}
				{reviewData.guardians && reviewData.guardians.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">Guardians</h3>
						<div className="grid gap-4">
							{reviewData.guardians.map((guardian, index) => (
								<div
									key={index}
									className="rounded-lg border border-gray-200 p-4 bg-gray-50"
								>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Name
											</label>
											<p className="mt-1 text-gray-900">
												{guardian.fullName}
												{guardian.isPrimary && (
													<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														Primary
													</span>
												)}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Relationship
											</label>
											<p className="mt-1 text-gray-900">
												{guardian.relationship}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Assets */}
				{reviewData.assets && reviewData.assets.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">Assets</h3>
						<div className="grid gap-4">
							{reviewData.assets.map((asset, index) => (
								<div
									key={index}
									className="rounded-lg border border-gray-200 p-4 bg-gray-50"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Type
											</label>
											<p className="mt-1 text-gray-900">{asset.type}</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Distribution Type
											</label>
											<p className="mt-1 text-gray-900 capitalize">
												{asset.distributionType}
											</p>
										</div>
										<div className="md:col-span-2">
											<label className="block text-sm font-medium text-gray-700">
												Description
											</label>
											<p className="mt-1 text-gray-900">{asset.description}</p>
										</div>
										{asset.beneficiaries && asset.beneficiaries.length > 0 && (
											<div className="md:col-span-2">
												<label className="block text-sm font-medium text-gray-700">
													Beneficiaries
												</label>
												<div className="mt-1 space-y-2">
													{asset.beneficiaries.map((beneficiary, idx) => (
														<div
															key={idx}
															className="text-gray-900 text-sm border-l-2 border-gray-200 pl-3"
														>
															<div className="font-medium">
																{beneficiary.beneficiaryName}
															</div>
															<div className="text-gray-600 text-xs">
																{beneficiary.relationship} •{" "}
																{beneficiary.percentage
																	? `${beneficiary.percentage}%`
																	: "Equal share"}
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Gifts */}
				{reviewData.gifts && reviewData.gifts.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Specific Gifts
						</h3>
						<div className="grid gap-4">
							{reviewData.gifts.map((gift, index) => (
								<div
									key={index}
									className="rounded-lg border border-gray-200 p-4 bg-gray-50"
								>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Type
											</label>
											<p className="mt-1 text-gray-900">{gift.type}</p>
										</div>
										{gift.value && (
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Value
												</label>
												<p className="mt-1 text-gray-900">{gift.value}</p>
											</div>
										)}
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Beneficiary
											</label>
											<p className="mt-1 text-gray-900">
												{gift.beneficiaryName}
											</p>
										</div>
										<div className="md:col-span-3">
											<label className="block text-sm font-medium text-gray-700">
												Description
											</label>
											<p className="mt-1 text-gray-900">{gift.description}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Residuary Estate */}
				{reviewData.residuaryBeneficiaries &&
					reviewData.residuaryBeneficiaries.length > 0 && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold border-b pb-2">
								Residuary Estate Distribution
							</h3>
							<div className="grid gap-4">
								{reviewData.residuaryBeneficiaries.map((residuary, index) => {
									const beneficiary = reviewData.beneficiaries.find(
										(b) => b.id === residuary.beneficiaryId
									);
									return (
										<div
											key={index}
											className="rounded-lg border border-gray-200 p-4 bg-gray-50"
										>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700">
														Beneficiary
													</label>
													<p className="mt-1 text-gray-900">
														{beneficiary?.fullName || "Unknown"}
													</p>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700">
														Percentage
													</label>
													<p className="mt-1 text-gray-900">
														{residuary.percentage}%
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

				{/* Executors */}
				{reviewData.executors && reviewData.executors.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">Executors</h3>
						<div className="grid gap-4">
							{reviewData.executors.map((executor, index) => (
								<div
									key={index}
									className="rounded-lg border border-gray-200 p-4 bg-gray-50"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Name
											</label>
											<p className="mt-1 text-gray-900">
												{executor.type === "individual"
													? executor.fullName
													: executor.companyName}
												{executor.isPrimary && (
													<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														Primary
													</span>
												)}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Type
											</label>
											<p className="mt-1 text-gray-900 capitalize">
												{executor.type}
											</p>
										</div>
										{executor.type === "individual" &&
											executor.relationship && (
												<div>
													<label className="block text-sm font-medium text-gray-700">
														Relationship
													</label>
													<p className="mt-1 text-gray-900">
														{executor.relationship}
													</p>
												</div>
											)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Witnesses */}
				{reviewData.witnesses && reviewData.witnesses.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">Witnesses</h3>
						<div className="grid gap-4">
							{reviewData.witnesses.map((witness, index) => (
								<div
									key={index}
									className="rounded-lg border border-gray-200 p-4 bg-gray-50"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Name
											</label>
											<p className="mt-1 text-gray-900">{witness.fullName}</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Address
											</label>
											<p className="mt-1 text-gray-900">{witness.address}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Funeral Instructions */}
				{reviewData.funeralInstructions && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Funeral Instructions
						</h3>
						<div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
							<label className="block text-sm font-medium text-gray-700">
								Instructions
							</label>
							<p className="mt-1 text-gray-900">
								{reviewData.funeralInstructions.instructions}
							</p>
						</div>
					</div>
				)}

				{/* Navigation Buttons */}
				<div className="flex justify-between pt-6 border-t">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						className="cursor-pointer"
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>

					<Button
						type="button"
						onClick={handleProceedToPayment}
						className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
					>
						<CreditCard className="mr-2 h-4 w-4" />
						Proceed to Payment
					</Button>
				</div>
			</div>
		);
	}
);

ReviewStep.displayName = "ReviewStep";

export default ReviewStep;
