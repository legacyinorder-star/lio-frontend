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
	initialData?: {
		assets: Asset[];
	};
}

export default function AssetsStep({
	onUpdate,
	onNext,
	onBack,
	initialData,
}: AssetsStepProps) {
	const [assetDialogOpen, setAssetDialogOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
	const [newBeneficiaryDialogOpen, setNewBeneficiaryDialogOpen] =
		useState(false);

	// Use custom hooks
	const { assets, saveAsset, removeAsset } = useAssetManagement(
		initialData?.assets || []
	);

	const {
		allBeneficiaries: enhancedBeneficiaries,
		isLoading: isLoadingBeneficiaries,
		isReady: isBeneficiariesReady,
		relationships,
		addIndividualBeneficiary,
		addCharityBeneficiary,
	} = useWillData();

	const form = useForm<z.infer<typeof assetSchema>>({
		resolver: zodResolver(assetSchema),
		defaultValues: {
			assetType: "Property",
			description: "",
			distributionType: "equal",
			beneficiaries: [],
		},
	});

	// Show loading state if data is not ready
	if (!isBeneficiariesReady || isLoadingBeneficiaries) {
		return (
			<LoadingSpinner
				message="Loading beneficiaries and relationships..."
				className="min-h-[400px]"
			/>
		);
	}

	const handleSubmit = () => {
		onUpdate({ assets });
		onNext();
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

	const handleRemoveAsset = (assetId: string) => {
		removeAsset(assetId);
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
			<div className="text-2xl font-semibold">
				Share your assets among your loved ones
			</div>
			<div className="text-muted-foreground">
				Add your assets and specify how you'd like them to be distributed among
				your beneficiaries.
			</div>
			<div className="text-muted-foreground">
				Do not include cash gifts in this section.
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
								{assets.map((asset) => (
									<AssetCard
										key={asset.id}
										asset={asset}
										onEdit={handleEditAsset}
										onRemove={handleRemoveAsset}
										enhancedBeneficiaries={enhancedBeneficiaries}
									/>
								))}
							</div>
						)}
					</div>

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
							className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
				relationships={relationships}
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
