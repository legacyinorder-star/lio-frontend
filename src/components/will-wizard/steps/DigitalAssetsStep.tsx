import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useWill } from "@/context/WillContext";
import { useWillData } from "@/hooks/useWillData";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Trash2, Plus } from "lucide-react";
import { NewBeneficiaryDialog } from "../components/NewBeneficiaryDialog";

export interface DigitalAssetsStepProps {
	onNext?: () => void;
	onBack?: () => void;
}

const DigitalAssetsStep: React.FC<DigitalAssetsStepProps> = ({
	onNext,
	onBack,
}) => {
	const { activeWill, setActiveWill } = useWill();
	const { allBeneficiaries, addIndividualBeneficiary, addCharityBeneficiary } =
		useWillData();
	const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>("");
	const [digitalAssetId, setDigitalAssetId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [showConfirm, setShowConfirm] = useState(false);
	const [newBeneficiaryDialogOpen, setNewBeneficiaryDialogOpen] =
		useState(false);

	// Fetch digital asset data on mount
	useEffect(() => {
		const fetchDigitalAsset = async () => {
			if (!activeWill?.id) {
				setIsFetching(false);
				return;
			}
			try {
				const { data, error } = await apiClient(
					`/digital-assets/get-by-will/${activeWill.id}`
				);
				if (
					data &&
					typeof data === "object" &&
					"beneficiary_id" in data &&
					typeof data.beneficiary_id === "string" &&
					"id" in data &&
					typeof data.id === "string"
				) {
					setSelectedBeneficiary(data.beneficiary_id);
					setDigitalAssetId(data.id);
				} else {
					setSelectedBeneficiary("");
					setDigitalAssetId(null);
				}
				if (error) {
					console.error("Error fetching digital assets:", error);
				}
			} catch (err) {
				console.error("Error fetching digital assets:", err);
			} finally {
				setIsFetching(false);
			}
		};
		fetchDigitalAsset();
	}, [activeWill?.id]);

	const handleNext = async () => {
		if (!selectedBeneficiary) {
			toast.error("Please select a beneficiary for your digital assets");
			return;
		}
		if (!activeWill?.id) {
			toast.error("No active will found. Please try again.");
			return;
		}
		setIsLoading(true);
		try {
			const { data, error } = await apiClient("/digital-assets", {
				method: "POST",
				body: JSON.stringify({
					will_id: activeWill.id,
					beneficiary_id: selectedBeneficiary,
				}),
			});
			if (error || !data) {
				console.error("❌ Error saving digital assets to API:", error);
				toast.error("Failed to save digital assets beneficiary");
				return;
			}
			setActiveWill({
				...activeWill,
				digitalAssets: {
					beneficiaryId: selectedBeneficiary,
				},
			});
			if (
				data &&
				typeof data === "object" &&
				"id" in data &&
				typeof data.id === "string"
			) {
				setDigitalAssetId(data.id);
			} else {
				setDigitalAssetId(null);
			}
			toast.success("Digital assets beneficiary saved");
			onNext?.();
		} catch (error) {
			console.error("💥 Error saving digital assets:", error);
			toast.error("Failed to save digital assets beneficiary");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSkip = async () => {
		if (!selectedBeneficiary || !digitalAssetId) {
			onNext?.();
			return;
		}
		setShowConfirm(true);
	};

	const confirmSkip = async () => {
		if (!digitalAssetId) {
			setShowConfirm(false);
			onNext?.();
			return;
		}
		setIsLoading(true);
		try {
			const { error } = await apiClient(`/digital-assets/${digitalAssetId}`, {
				method: "DELETE",
			});
			if (error) {
				console.error("Error deleting digital asset:", error);
				toast.error("Failed to remove digital assets beneficiary");
				setIsLoading(false);
				setShowConfirm(false);
				return;
			}
			setSelectedBeneficiary("");
			setDigitalAssetId(null);
			setActiveWill({
				...activeWill!,
				digitalAssets: undefined,
			});
			toast.success("Digital assets beneficiary removed");
			setShowConfirm(false);
			onNext?.();
		} catch (err) {
			console.error("Error deleting digital asset:", err);
			toast.error("Failed to remove digital assets beneficiary");
		} finally {
			setIsLoading(false);
		}
	};

	const getBeneficiaryDisplayName = (beneficiaryId: string) => {
		const beneficiary = allBeneficiaries.find((b) => b.id === beneficiaryId);
		if (!beneficiary) return "Unknown Beneficiary";
		return `${beneficiary.firstName} ${beneficiary.lastName} (${beneficiary.relationship})`;
	};

	const handleAddNewBeneficiary = () => {
		setNewBeneficiaryDialogOpen(true);
	};

	const handleAddIndividualBeneficiary = async (
		firstName: string,
		lastName: string,
		relationshipId: string
	) => {
		const newBeneficiary = await addIndividualBeneficiary(
			firstName,
			lastName,
			relationshipId
		);

		// Automatically select the new beneficiary
		if (newBeneficiary?.id) {
			setSelectedBeneficiary(newBeneficiary.id);
			toast.success(
				`${firstName} ${lastName} added and selected for digital assets`
			);
		}
	};

	const handleAddCharityBeneficiary = async (
		charityName: string,
		registrationNumber?: string
	) => {
		const newBeneficiary = await addCharityBeneficiary(
			charityName,
			registrationNumber
		);

		// Automatically select the new beneficiary
		if (newBeneficiary?.id) {
			setSelectedBeneficiary(newBeneficiary.id);
			toast.success(`${charityName} added and selected for digital assets`);
		}
	};

	if (isFetching) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<span>Loading digital assets...</span>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Digital Assets
			</div>

			{/* Main Content */}
			<div className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label
								htmlFor="digital-assets-beneficiary"
								className="text-base font-medium"
							>
								Who should inherit your digital assets?
							</Label>
						</div>
						<p className="text-sm text-gray-600">
							This includes your online accounts, digital files,
							cryptocurrencies, social media accounts, and other digital
							property.
						</p>

						{/* Information Box */}
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
							<h4 className="font-medium text-gray-900 mb-2">
								What are Digital Assets?
							</h4>
							<ul className="text-sm text-gray-700 space-y-1">
								<li>• Online banking and financial accounts</li>
								<li>
									• Social media accounts (Facebook, Instagram, Twitter (X),
									TikTok, etc.)
								</li>
								<li>• Email accounts and cloud storage</li>
								<li>• Cryptocurrencies and digital wallets</li>
								<li>• Digital photos, videos, and documents</li>
								<li>• Online subscriptions and memberships</li>
								<li>• Domain names and websites</li>
								<li>• Digital music, books, and media collections</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium">Select Beneficiary</h3>
						<Button
							variant="outline"
							size="sm"
							onClick={handleAddNewBeneficiary}
							className="cursor-pointer"
						>
							<Plus className="mr-2 h-4 w-4" />
							Add New Beneficiary
						</Button>
					</div>
					<Select
						value={selectedBeneficiary}
						onValueChange={setSelectedBeneficiary}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a beneficiary for your digital assets" />
						</SelectTrigger>
						<SelectContent className="bg-white">
							{allBeneficiaries.map((beneficiary) => (
								<SelectItem key={beneficiary.id} value={beneficiary.id}>
									{getBeneficiaryDisplayName(beneficiary.id)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{selectedBeneficiary && (
						<div className="bg-primary/10 border border-primary rounded-lg p-4">
							<h4 className="font-medium text-primary mb-2 text-[1.5rem]">
								Selected Beneficiary
							</h4>
							<p className="text-black">
								<span className="font-[600]">
									{getBeneficiaryDisplayName(selectedBeneficiary)}
								</span>{" "}
								will inherit all your digital assets.
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Navigation Buttons */}
			<div className="flex justify-between">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					className="flex items-center gap-2 cursor-pointer"
					disabled={isLoading || isFetching}
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
				<div className="flex gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={handleSkip}
						className={`cursor-pointer flex items-center gap-2 ${
							selectedBeneficiary
								? "bg-red-500 hover:bg-red-600 hover:text-white text-white"
								: ""
						}`}
						disabled={isLoading || isFetching}
					>
						{selectedBeneficiary && <Trash2 className="h-4 w-4" />}
						{selectedBeneficiary ? "Remove & Continue" : "Skip & Continue"}
					</Button>
					<Button
						type="button"
						className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white cursor-pointer"
						onClick={handleNext}
						disabled={!selectedBeneficiary || isLoading || isFetching}
					>
						{isLoading ? (
							<>
								<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black"></div>
								Saving...
							</>
						) : (
							<>
								Next
								<ArrowRight className="h-4 w-4" />
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Confirmation Dialog */}
			{showConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
						<h3 className="text-lg font-semibold mb-4">
							Remove Digital Assets Beneficiary?
						</h3>
						<p className="mb-6 text-gray-700">
							You have already selected a beneficiary for your digital assets.
							Skipping will{" "}
							<span className="font-semibold text-red-600">
								delete your current selection
							</span>
							. Are you sure you want to continue?
						</p>
						<div className="flex justify-end gap-4">
							<Button
								variant="outline"
								onClick={() => setShowConfirm(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								variant="outline"
								onClick={confirmSkip}
								disabled={isLoading}
								className="flex items-center gap-2 bg-red-500 hover:bg-red-600 hover:text-white text-white"
							>
								{isLoading ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
										Deleting...
									</>
								) : (
									<>
										<Trash2 className="h-4 w-4" />
										Delete & Continue
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* New Beneficiary Dialog */}
			<NewBeneficiaryDialog
				open={newBeneficiaryDialogOpen}
				onOpenChange={setNewBeneficiaryDialogOpen}
				onAddIndividual={handleAddIndividualBeneficiary}
				onAddCharity={handleAddCharityBeneficiary}
			/>
		</div>
	);
};

export default DigitalAssetsStep;
