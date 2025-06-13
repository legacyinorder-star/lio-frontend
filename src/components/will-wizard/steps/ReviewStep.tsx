import { forwardRef, useImperativeHandle, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import WillPDF from "../WillPDF";

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
			disposition: "cremation" | "burial" | null;
			location?: string;
		};
		additionalInstructions?: string;
	};
	onSave?: () => void;
}

export interface ReviewStepHandle {
	handleSaveAndDownload: () => Promise<void>;
	isSaving: boolean;
}

const ReviewStep = forwardRef<ReviewStepHandle, ReviewStepProps>(
	({ data }, ref) => {
		const [isSaving, setIsSaving] = useState(false);
		const navigate = useNavigate();
		const [_willId, setWillId] = useState<string>("");

		const generatePDF = async (): Promise<Blob> => {
			// Create the PDF document
			const pdfDoc = pdf(
				<WillPDF
					data={data}
					additionalText="This is a sample additional text that can be customized based on the user's input."
				/>
			);

			try {
				// First try to get the blob directly
				return await pdfDoc.toBlob();
			} catch (error) {
				console.error("Direct blob generation failed, trying buffer:", error);
				try {
					// If direct blob generation fails, try using buffer
					const buffer = await pdfDoc.toBuffer();
					return new Blob([buffer], { type: "application/pdf" });
				} catch (bufferError) {
					console.error("Buffer generation failed:", bufferError);
					throw new Error("Failed to generate PDF document");
				}
			}
		};

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
				setWillId(crypto.randomUUID());

				// Save will data to localStorage first
				saveWillToLocalStorage();

				// Generate PDF blob
				const blob = await generatePDF();

				// Verify blob is valid
				if (!(blob instanceof Blob) || blob.size === 0) {
					throw new Error("Generated PDF is invalid");
				}

				// Create download link
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `will-${data.personal.fullName
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

				toast.success("Will saved and downloaded successfully");
				navigate("/app/dashboard");
			} catch (error) {
				console.error("Error saving will:", error);
				toast.error(
					error instanceof Error && error.message === "Failed to save will data"
						? "Failed to save will data. Please try again."
						: "Failed to generate PDF. Please try again or contact support if the issue persists."
				);
			} finally {
				setIsSaving(false);
			}
		};

		useImperativeHandle(ref, () => ({
			handleSaveAndDownload,
			isSaving,
		}));

		return (
			<div data-review-step className="space-y-6">
				{/* Personal Information */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Personal Information</h3>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Full Name
							</label>
							<p className="mt-1">{data.personal.fullName}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Address
							</label>
							<p className="mt-1">{data.personal.address}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Marital Status
							</label>
							<p className="mt-1">{data.personal.maritalStatus}</p>
						</div>
					</div>
				</div>

				{/* Assets */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Assets</h3>
					<div className="grid gap-4">
						{data.assets.map((asset, index) => (
							<div
								key={index}
								className="rounded-lg border border-gray-200 p-4"
							>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Type
										</label>
										<p className="mt-1">{asset.type}</p>
									</div>
									<div className="col-span-2">
										<label className="block text-sm font-medium text-gray-700">
											Description
										</label>
										<p className="mt-1">{asset.description}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Beneficiaries */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Beneficiaries</h3>
					<div className="grid gap-4">
						{data.beneficiaries.map((beneficiary, index) => (
							<div
								key={index}
								className="rounded-lg border border-gray-200 p-4"
							>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Name
										</label>
										<p className="mt-1">{beneficiary.fullName}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Relationship
										</label>
										<p className="mt-1">{beneficiary.relationship}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Allocation
										</label>
										<p className="mt-1">{beneficiary.allocation}%</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Executors */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Executors</h3>
					<div className="grid gap-4">
						{data.executors.map((executor, index) => (
							<div
								key={index}
								className="rounded-lg border border-gray-200 p-4"
							>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Name
										</label>
										<p className="mt-1">
											{executor.type === "individual"
												? executor.fullName
												: executor.companyName}
											{executor.isPrimary && " (Primary Executor)"}
										</p>
									</div>
									{executor.type === "individual" && executor.relationship && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Relationship
											</label>
											<p className="mt-1">{executor.relationship}</p>
										</div>
									)}
									{executor.type === "corporate" && executor.contactPerson && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Contact Person
											</label>
											<p className="mt-1">{executor.contactPerson}</p>
										</div>
									)}
									{executor.email && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Email
											</label>
											<p className="mt-1">{executor.email}</p>
										</div>
									)}
									{executor.phone && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Phone
											</label>
											<p className="mt-1">{executor.phone}</p>
										</div>
									)}
									<div className="col-span-2">
										<label className="block text-sm font-medium text-gray-700">
											Address
										</label>
										<p className="mt-1">{executor.address}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Witnesses */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Witnesses</h3>
					<div className="grid gap-4">
						{data.witnesses.map((witness, index) => (
							<div
								key={index}
								className="rounded-lg border border-gray-200 p-4"
							>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Name
										</label>
										<p className="mt-1">{witness.fullName}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Address
										</label>
										<p className="mt-1">{witness.address}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Funeral Instructions */}
				{data.funeralInstructions?.disposition && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Funeral Instructions</h3>
						<div className="rounded-lg border border-gray-200 p-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Disposition Preference
									</label>
									<p className="mt-1 capitalize">
										{data.funeralInstructions.disposition}
									</p>
								</div>
								{data.funeralInstructions.location && (
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Preferred Location
										</label>
										<p className="mt-1">{data.funeralInstructions.location}</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Additional Instructions */}
				{data.additionalInstructions && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Additional Instructions</h3>
						<div className="rounded-lg border border-gray-200 p-4">
							<div className="whitespace-pre-wrap">
								{data.additionalInstructions}
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
);

ReviewStep.displayName = "ReviewStep";

export default ReviewStep;
