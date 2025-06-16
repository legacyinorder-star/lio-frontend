import { forwardRef, useImperativeHandle, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { PaymentService } from "@/services/paymentService";
import { downloadWillPDF } from "@/utils/willDownload";

export interface ReviewStepProps {
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
			distributionType: "equal" | "percentage";
			beneficiaries: Array<{
				id: string;
				percentage?: number;
			}>;
		}>;
		beneficiaries: Array<{
			id: string;
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
		guardians: Array<{
			fullName: string;
			relationship: string;
			isPrimary: boolean;
			address?: string;
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
		additionalInstructions?: string;
	};
	onSave?: () => void;
	onBack?: () => void;
}

export interface ReviewStepHandle {
	handleSaveAndDownload: () => Promise<void>;
	isSaving: boolean;
}

const ReviewStep = forwardRef<ReviewStepHandle, ReviewStepProps>(
	({ data, onBack }, ref) => {
		const [isSaving, setIsSaving] = useState(false);
		const navigate = useNavigate();
		const [_willId, setWillId] = useState<string>("");

		const saveWillToLocalStorage = () => {
			try {
				// Get existing wills or initialize empty array
				const existingWills = JSON.parse(localStorage.getItem("wills") || "[]");

				// Create will object with metadata
				const will = {
					id: _willId,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					data: data,
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
				if (!data.personal.fullName) {
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
							<p className="mt-1 text-gray-900">{data.personal.fullName}</p>
						</div>
						{data.personal.dateOfBirth && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Date of Birth
								</label>
								<p className="mt-1 text-gray-900">
									{data.personal.dateOfBirth}
								</p>
							</div>
						)}
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Phone Number
							</label>
							<p className="mt-1 text-gray-900">
								{data.personal.phone || "Not provided"}
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Marital Status
							</label>
							<p className="mt-1 text-gray-900">
								{data.personal.maritalStatus}
							</p>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700">
								Address
							</label>
							<p className="mt-1 text-gray-900">{data.personal.address}</p>
						</div>
					</div>
				</div>

				{/* Beneficiaries */}
				{data.beneficiaries && data.beneficiaries.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Beneficiaries
						</h3>
						<div className="grid gap-4">
							{data.beneficiaries.map((beneficiary, index) => (
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
												{beneficiary.fullName}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Relationship
											</label>
											<p className="mt-1 text-gray-900">
												{beneficiary.relationship}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Allocation
											</label>
											<p className="mt-1 text-gray-900">
												{beneficiary.allocation}%
											</p>
										</div>
										{beneficiary.requiresGuardian && (
											<div className="md:col-span-3">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
													Requires Guardian
												</span>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Guardians */}
				{data.guardians && data.guardians.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">Guardians</h3>
						<div className="grid gap-4">
							{data.guardians.map((guardian, index) => (
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
										{guardian.address && (
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Address
												</label>
												<p className="mt-1 text-gray-900">{guardian.address}</p>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Assets */}
				{data.assets && data.assets.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">Assets</h3>
						<div className="grid gap-4">
							{data.assets.map((asset, index) => (
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
													{asset.beneficiaries.map((beneficiary, idx) => (
														<p key={idx} className="text-gray-900 text-sm">
															Beneficiary {idx + 1}:{" "}
															{beneficiary.percentage
																? `${beneficiary.percentage}%`
																: "Equal share"}
														</p>
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
				{data.gifts && data.gifts.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Specific Gifts
						</h3>
						<div className="grid gap-4">
							{data.gifts.map((gift, index) => (
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
				{data.residuaryBeneficiaries &&
					data.residuaryBeneficiaries.length > 0 && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold border-b pb-2">
								Residuary Estate Distribution
							</h3>
							<div className="grid gap-4">
								{data.residuaryBeneficiaries.map((residuary, index) => {
									const beneficiary = data.beneficiaries.find(
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
				{data.executors && data.executors.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">Executors</h3>
						<div className="grid gap-4">
							{data.executors.map((executor, index) => (
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
										{executor.type === "corporate" &&
											executor.registrationNumber && (
												<div>
													<label className="block text-sm font-medium text-gray-700">
														Registration Number
													</label>
													<p className="mt-1 text-gray-900">
														{executor.registrationNumber}
													</p>
												</div>
											)}
										{executor.email && (
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Email
												</label>
												<p className="mt-1 text-gray-900">{executor.email}</p>
											</div>
										)}
										{executor.phone && (
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Phone
												</label>
												<p className="mt-1 text-gray-900">{executor.phone}</p>
											</div>
										)}
										<div className="md:col-span-2">
											<label className="block text-sm font-medium text-gray-700">
												Address
											</label>
											<p className="mt-1 text-gray-900">{executor.address}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Witnesses */}
				{data.witnesses && data.witnesses.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">Witnesses</h3>
						<div className="grid gap-4">
							{data.witnesses.map((witness, index) => (
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
				{data.funeralInstructions?.instructions && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Funeral Instructions
						</h3>
						<div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
							<div className="whitespace-pre-wrap text-gray-900">
								{data.funeralInstructions.instructions}
							</div>
						</div>
					</div>
				)}

				{/* Additional Instructions */}
				{data.additionalInstructions && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold border-b pb-2">
							Additional Instructions
						</h3>
						<div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
							<div className="whitespace-pre-wrap text-gray-900">
								{data.additionalInstructions}
							</div>
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
