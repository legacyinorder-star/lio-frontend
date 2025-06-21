import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { PaymentService } from "@/services/paymentService";
import { downloadWillPDF } from "@/utils/willDownload";
import { useWill } from "@/context/WillContext";
import { useWillData } from "@/hooks/useWillData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiClient } from "@/utils/apiClient";
import { mapWillDataFromAPI } from "@/utils/dataTransform";

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

const ReviewStep = forwardRef<ReviewStepHandle, ReviewStepProps>(
	({ data: propData, onBack }, ref) => {
		const [isSaving, setIsSaving] = useState(false);
		const [isLoading, setIsLoading] = useState(true);
		const [reviewData, setReviewData] = useState<
			ReviewStepProps["data"] | null
		>(null);
		const navigate = useNavigate();
		const [_willId, setWillId] = useState<string>("");

		const { activeWill, setActiveWill } = useWill();
		const {
			allBeneficiaries,
			isLoading: isLoadingBeneficiaries,
			isReady: isBeneficiariesReady,
		} = useWillData();

		// Load active will from API on page load
		const loadActiveWill = async () => {
			try {
				const { data, error } = await apiClient("/wills/get-user-active-will");

				if (error) {
					console.error("Error loading active will:", error);
					toast.error("Failed to load will data");
					return;
				}

				// Handle both array and single object responses
				const willData = Array.isArray(data) ? data[0] : data;
				if (willData) {
					// Transform API data to camelCase format
					const transformedWillData = mapWillDataFromAPI(willData);
					setActiveWill(transformedWillData);
				}
			} catch (error) {
				console.error("Error loading active will:", error);
				toast.error("Failed to load will data");
			}
		};

		// Transform activeWill data to review format
		const transformWillDataToReviewFormat = () => {
			if (!activeWill) return null;

			// Transform beneficiaries from allBeneficiaries
			const beneficiaries = allBeneficiaries.map((beneficiary) => ({
				id: beneficiary.id,
				fullName:
					beneficiary.type === "charity"
						? beneficiary.firstName
						: `${beneficiary.firstName} ${beneficiary.lastName}`,
				relationship: beneficiary.relationship,
				allocation: 0, // This will be calculated from assets/residuary
				requiresGuardian: beneficiary.isMinor || false,
			}));

			// Transform assets with proper beneficiary name resolution
			const assets = activeWill.assets.map((asset) => ({
				type: asset.assetType,
				description: asset.description,
				distributionType: asset.distributionType,
				beneficiaries: asset.beneficiaries.map((beneficiary) => {
					// Find the beneficiary details from allBeneficiaries
					const beneficiaryDetails = allBeneficiaries.find(
						(b) =>
							b.id ===
							(beneficiary.peopleId ||
								beneficiary.charitiesId ||
								beneficiary.id)
					);

					return {
						id:
							beneficiary.peopleId || beneficiary.charitiesId || beneficiary.id,
						percentage: beneficiary.percentage,
						// Add beneficiary name for display
						beneficiaryName: beneficiaryDetails
							? beneficiaryDetails.type === "charity"
								? beneficiaryDetails.firstName
								: `${beneficiaryDetails.firstName} ${beneficiaryDetails.lastName}`
							: "Unknown Beneficiary",
					};
				}),
			}));

			// Transform gifts with proper beneficiary name resolution
			const gifts = activeWill.gifts.map((gift) => {
				const beneficiary = allBeneficiaries.find(
					(b) => b.id === (gift.peopleId || gift.charitiesId)
				);
				return {
					type: gift.type,
					description: gift.description,
					value: gift.value?.toString(),
					beneficiaryId: gift.peopleId || gift.charitiesId || "",
					beneficiaryName: beneficiary
						? beneficiary.type === "charity"
							? beneficiary.firstName
							: `${beneficiary.firstName} ${beneficiary.lastName}`
						: "Unknown Beneficiary",
				};
			});

			// Transform executors
			const executors = activeWill.executors.map((executor) => ({
				fullName:
					executor.type === "individual"
						? `${executor.firstName || ""} ${executor.lastName || ""}`.trim()
						: undefined,
				companyName:
					executor.type === "corporate" ? executor.companyName : undefined,
				relationship: executor.relationship,
				isPrimary: executor.isPrimary,
				type: executor.type,
				registrationNumber: undefined, // Not available in WillExecutor interface
			}));

			// Transform witnesses
			const witnesses = activeWill.witnesses.map((witness) => ({
				fullName: `${witness.firstName} ${witness.lastName}`,
				address: `${witness.address.address}, ${witness.address.city}, ${witness.address.state} ${witness.address.postCode}, ${witness.address.country}`,
			}));

			// Transform guardians
			const guardians =
				activeWill.guardians?.map((guardian) => ({
					fullName: `${guardian.firstName} ${guardian.lastName}`,
					relationship: guardian.relationship,
					isPrimary: guardian.isPrimary,
				})) || [];

			// Transform residuary beneficiaries
			const residuaryBeneficiaries =
				activeWill.residuary?.beneficiaries.map((residuary) => ({
					id: residuary.id,
					beneficiaryId: residuary.peopleId || residuary.charitiesId || "",
					percentage: residuary.percentage,
				})) || [];

			return {
				personal: {
					fullName: `${activeWill.owner.firstName} ${activeWill.owner.lastName}`,
					address: `${activeWill.owner.address}, ${activeWill.owner.city}, ${activeWill.owner.state} ${activeWill.owner.postCode}, ${activeWill.owner.country}`,
					maritalStatus: activeWill.owner.maritalStatus,
				},
				assets,
				beneficiaries,
				executors,
				witnesses,
				guardians,
				gifts,
				residuaryBeneficiaries,
				funeralInstructions: undefined, // Not available in WillData interface
			};
		};

		// Load and transform data on component mount
		useEffect(() => {
			const loadData = async () => {
				setIsLoading(true);

				// If prop data is provided, use it
				if (propData) {
					setReviewData(propData);
					setIsLoading(false);
					return;
				}

				// Load active will from API first
				await loadActiveWill();

				// Wait for beneficiaries to be ready
				if (!isBeneficiariesReady || isLoadingBeneficiaries) {
					return;
				}

				// Transform activeWill data
				const transformedData = transformWillDataToReviewFormat();
				if (transformedData) {
					setReviewData(transformedData);
				}

				setIsLoading(false);
			};

			loadData();
		}, [
			activeWill,
			allBeneficiaries,
			isBeneficiariesReady,
			isLoadingBeneficiaries,
			propData,
		]);

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
				if (!reviewData?.personal.fullName) {
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
												<div className="mt-1 space-y-1">
													{asset.beneficiaries.map((beneficiary, idx) => {
														// Use the beneficiaryName from the transformed data
														const beneficiaryName =
															beneficiary.beneficiaryName ||
															reviewData.beneficiaries.find(
																(b) => b.id === beneficiary.id
															)?.fullName ||
															"Unknown Beneficiary";

														return (
															<p key={idx} className="text-gray-900 text-sm">
																{beneficiaryName}:{" "}
																{beneficiary.percentage
																	? `${beneficiary.percentage}%`
																	: "Equal share"}
															</p>
														);
													})}
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
