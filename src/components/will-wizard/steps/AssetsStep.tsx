import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Asset, WillFormData } from "../types/will.types";
import { useAssetManagement } from "@/hooks/useAssetManagement";
import { useWillData } from "@/hooks/useWillData";
import { useWill } from "@/context/WillContext";
import { AssetDialog } from "../components/AssetDialog";
import { NewBeneficiaryDialog } from "../components/NewBeneficiaryDialog";
import { AssetCard } from "../components/AssetCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const assetSchema = z.object({
	assetType: z.string().min(1, "Asset type is required"),
	description: z.string().min(1, "Description is required"),
	distributionType: z.enum(["equal", "percentage"]),
	beneficiaries: z.array(
		z.object({
			id: z.string(),
			percentage: z.number().optional(),
		})
	),
});

interface AssetsStepProps {
	onUpdate: (data: Partial<WillFormData>) => void;
	onNext: () => void;
	onBack: () => void;
}

export default function AssetsStep({
	onUpdate,
	onNext,
	onBack,
}: AssetsStepProps) {
	const [assetDialogOpen, setAssetDialogOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
	const [newBeneficiaryDialogOpen, setNewBeneficiaryDialogOpen] =
		useState(false);

	// Use custom hooks
	const { assets, saveAsset, removeAsset } = useAssetManagement();

	const {
		allBeneficiaries: enhancedBeneficiaries,
		isLoading: isLoadingBeneficiaries,
		isReady: isBeneficiariesReady,
		addIndividualBeneficiary,
		addCharityBeneficiary,
	} = useWillData();

	const { activeWill } = useWill();

	const form = useForm<z.infer<typeof assetSchema>>({
		resolver: zodResolver(assetSchema),
		defaultValues: {
			assetType: "Property",
			description: "",
			distributionType: "equal",
			beneficiaries: [],
		},
	});

	// Function to check if a beneficiary is deleted
	const isBeneficiaryDeleted = (
		beneficiaryId: string,
		assetId: string
	): boolean => {
		// Get the will asset from activeWill context
		const willAsset = activeWill?.assets.find(
			(willAsset) => willAsset.id === assetId
		);

		if (!willAsset) return false;

		// Find the beneficiary in the will asset
		const willBeneficiary = willAsset.beneficiaries.find(
			(wb) => wb.id === beneficiaryId
		);

		if (!willBeneficiary) return true;

		// Check if it's an individual and the person data is missing
		const isIndividual = willBeneficiary.peopleId !== undefined;
		const isCharity = willBeneficiary.charitiesId !== undefined;

		if (isIndividual && !willBeneficiary.person) {
			return true;
		}

		if (isCharity && !willBeneficiary.charity) {
			return true;
		}

		return false;
	};

	// Check if any asset has deleted beneficiaries (only for assets with beneficiaries)
	const hasAnyDeletedBeneficiaries = assets.some(
		(asset) =>
			asset.hasBeneficiaries &&
			asset.beneficiaries.some((beneficiary) =>
				isBeneficiaryDeleted(beneficiary.id, asset.id)
			)
	);

	// Show loading state if data is not ready
	if (!isBeneficiariesReady || isLoadingBeneficiaries) {
		return (
			<LoadingSpinner
				message="Loading beneficiaries and relationships..."
				className="min-h-[400px]"
			/>
		);
	}

	const handleSubmit = async () => {
		onUpdate({ assets });
		await onNext();
	};

	const handleSaveAsset = async (
		assetForm: Omit<Asset, "id">,
		beneficiariesWithPercentages: Array<{
			id: string;
			percentage: number;
			type: "charity" | "individual";
		}>
	) => {
		const savedAsset = await saveAsset(
			assetForm,
			beneficiariesWithPercentages,
			editingAsset?.id
		);

		if (savedAsset) {
			// Reset form and close dialog
			setEditingAsset(null);
			setAssetDialogOpen(false);
		}
	};

	const handleEditAsset = (asset: Asset) => {
		setEditingAsset(asset);
		setAssetDialogOpen(true);
	};

	const handleRemoveAsset = async (assetId: string) => {
		await removeAsset(assetId);
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

		if (newBeneficiary) {
			// Close the dialog after successful addition
			setNewBeneficiaryDialogOpen(false);
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

		if (newBeneficiary) {
			// Close the dialog after successful addition
			setNewBeneficiaryDialogOpen(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				List your accounts and property
			</div>
			<div className="text-muted-foreground">
				This includes your bank accounts, investments, property and life
				insurance policies. It helps your executors, the people who will deal
				with your estate after you die, know which providers to contact.
			</div>
			<div className="text-muted-foreground">
				We will not ask for specific details like account or policy numbers.
			</div>

			<Form {...form}>
				<div className="space-y-6">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Your Assets</h3>
							<Button
								variant="outline"
								onClick={() => {
									setEditingAsset(null);
									setAssetDialogOpen(true);
								}}
								className="cursor-pointer"
								disabled={isLoadingBeneficiaries}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Asset
							</Button>
						</div>

						{assets.length === 0 ? (
							<p className="text-muted-foreground text-center py-4">
								No assets added yet. Click "Add Asset" to add your assets.
							</p>
						) : (
							<div className="space-y-4">
								{assets.map((asset) => {
									// Check if this specific asset has deleted beneficiaries (only for assets with beneficiaries)
									const hasDeletedBeneficiaries =
										asset.hasBeneficiaries &&
										asset.beneficiaries.some((beneficiary) =>
											isBeneficiaryDeleted(beneficiary.id, asset.id)
										);

									return (
										<AssetCard
											key={asset.id}
											asset={asset}
											onEdit={handleEditAsset}
											onRemove={handleRemoveAsset}
											hasDeletedBeneficiaries={hasDeletedBeneficiaries}
										/>
									);
								})}
							</div>
						)}
					</div>

					{/* Validation message for deleted beneficiaries */}
					{hasAnyDeletedBeneficiaries && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-red-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-red-800">
										Deleted Beneficiaries Detected
									</h3>
									<div className="mt-2 text-sm text-red-700">
										<p>
											Some assets have beneficiaries that have been deleted.
											Please edit those assets to fix this issue before
											proceeding.
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="flex justify-between pt-4">
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
							onClick={handleSubmit}
							disabled={hasAnyDeletedBeneficiaries}
							className="cursor-pointer bg-primary hover:bg-primary/90 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
						>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>
			</Form>

			{/* Asset Dialog */}
			<AssetDialog
				open={assetDialogOpen}
				onOpenChange={setAssetDialogOpen}
				onSave={handleSaveAsset}
				editingAsset={editingAsset}
				onAddNewBeneficiary={handleAddNewBeneficiary}
				enhancedBeneficiaries={enhancedBeneficiaries}
				isLoadingBeneficiaries={isLoadingBeneficiaries}
			/>

			{/* New Beneficiary Dialog */}
			<NewBeneficiaryDialog
				open={newBeneficiaryDialogOpen}
				onOpenChange={setNewBeneficiaryDialogOpen}
				onAddIndividual={handleAddIndividualBeneficiary}
				onAddCharity={handleAddCharityBeneficiary}
			/>
		</div>
	);
}
