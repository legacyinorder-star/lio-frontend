import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/custom-dropdown-menu";
import { ChevronsUpDown, Plus, X } from "lucide-react";
import { Asset, AssetType } from "../types/will.types";
import { AssetTypeSelector } from "./AssetTypeSelector";
import {
	useBeneficiaryManagement,
	EnhancedBeneficiary,
} from "@/hooks/useBeneficiaryManagement";

interface AssetDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		asset: Omit<Asset, "id">,
		beneficiariesWithPercentages: Array<{
			id: string;
			percentage: number;
			type: "charity" | "individual";
		}>
	) => void;
	editingAsset?: Asset | null;
	onAddNewBeneficiary: () => void;
}

export function AssetDialog({
	open,
	onOpenChange,
	onSave,
	editingAsset,
	onAddNewBeneficiary,
}: AssetDialogProps) {
	const [assetForm, setAssetForm] = useState<Omit<Asset, "id">>({
		assetType: "Property" as AssetType,
		description: "",
		distributionType: "equal",
		beneficiaries: [],
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const { enhancedBeneficiaries, isLoadingBeneficiaries, fetchBeneficiaries } =
		useBeneficiaryManagement();

	// Initialize form when editing
	useEffect(() => {
		if (editingAsset) {
			setAssetForm({
				assetType: editingAsset.assetType,
				description: editingAsset.description,
				distributionType: editingAsset.distributionType,
				beneficiaries: editingAsset.beneficiaries,
			});
		} else {
			setAssetForm({
				assetType: "Property" as AssetType,
				description: "",
				distributionType: "equal",
				beneficiaries: [],
			});
		}
	}, [editingAsset]);

	// Fetch beneficiaries when dialog opens
	useEffect(() => {
		if (open) {
			fetchBeneficiaries();
		}
	}, [open]);

	const handleAssetFormChange =
		(field: keyof Omit<Asset, "id">) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>
		) => {
			setAssetForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleDistributionTypeChange = (type: "equal" | "percentage") => {
		setAssetForm((prev) => ({
			...prev,
			distributionType: type,
			beneficiaries: prev.beneficiaries.map((b) => ({
				...b,
				percentage: type === "equal" ? undefined : undefined,
			})),
		}));
	};

	const handleBeneficiaryPercentageChange = (
		beneficiaryId: string,
		percentage: number | undefined
	) => {
		setAssetForm((prev) => ({
			...prev,
			beneficiaries: prev.beneficiaries.map((b) =>
				b.id === beneficiaryId ? { ...b, percentage } : b
			),
		}));
	};

	const handleSelectBeneficiary = (beneficiaryId: string) => {
		if (!beneficiaryId) return;

		// Add the selected beneficiary to the asset form
		setAssetForm((prev) => ({
			...prev,
			beneficiaries: [
				...prev.beneficiaries,
				{
					id: beneficiaryId,
					percentage: undefined,
				},
			],
		}));

		// Close dropdown and clear search
		setIsDropdownOpen(false);
		setSearchQuery("");
	};

	const handleRemoveBeneficiary = (beneficiaryId: string) => {
		setAssetForm((prev) => ({
			...prev,
			beneficiaries: prev.beneficiaries.filter((b) => b.id !== beneficiaryId),
		}));
	};

	const handleSave = () => {
		if (
			!assetForm.description ||
			assetForm.beneficiaries.length === 0 ||
			(assetForm.distributionType === "percentage" &&
				Math.abs(
					assetForm.beneficiaries.reduce(
						(sum, b) => sum + (b.percentage || 0),
						0
					) - 100
				) > 0.01)
		) {
			return;
		}

		// Calculate percentages for beneficiaries
		const beneficiariesWithPercentages = assetForm.beneficiaries.map(
			(beneficiary) => {
				const beneficiaryDetails = enhancedBeneficiaries.find(
					(b) => b.id === beneficiary.id
				);

				let percentage: number;
				if (assetForm.distributionType === "equal") {
					percentage = Math.round(100 / assetForm.beneficiaries.length);
				} else {
					percentage = beneficiary.percentage || 0;
				}

				return {
					id: beneficiary.id,
					percentage,
					type:
						beneficiaryDetails?.type === "charity" ? "charity" : "individual",
				};
			}
		);

		onSave(assetForm, beneficiariesWithPercentages);
	};

	// Filter beneficiaries based on search query
	const filteredBeneficiaries = enhancedBeneficiaries.filter(
		(beneficiary) =>
			!assetForm.beneficiaries.some((b) => b.id === beneficiary.id) &&
			(beneficiary.firstName
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
				beneficiary.lastName
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(beneficiary.registrationNumber &&
					beneficiary.registrationNumber
						.toLowerCase()
						.includes(searchQuery.toLowerCase())))
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-white max-w-2xl">
				<DialogHeader>
					<DialogTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<AssetTypeSelector
						selectedType={assetForm.assetType}
						onSelect={(type: AssetType) => {
							setAssetForm((prev) => ({
								...prev,
								assetType: type,
							}));
						}}
						className="mb-4"
					/>
					<div className="space-y-2">
						<Label htmlFor="assetDescription">Description</Label>
						<textarea
							id="assetDescription"
							value={assetForm.description}
							onChange={handleAssetFormChange("description")}
							placeholder="Describe the asset, its location and any details that may be relevant to its distribution"
							className="w-full min-h-[100px] p-2 border rounded-md"
						/>
					</div>
					<div className="space-y-2">
						<Label>Distribution Method</Label>
						<div className="flex space-x-4">
							<Button
								variant={
									assetForm.distributionType === "equal" ? "default" : "outline"
								}
								onClick={() => handleDistributionTypeChange("equal")}
								className={`cursor-pointer ${
									assetForm.distributionType === "equal"
										? "bg-light-green text-black"
										: ""
								}`}
							>
								Equal Distribution
							</Button>
							<Button
								variant={
									assetForm.distributionType === "percentage"
										? "default"
										: "outline"
								}
								onClick={() => handleDistributionTypeChange("percentage")}
								className={`cursor-pointer ${
									assetForm.distributionType === "percentage"
										? "bg-light-green text-black"
										: ""
								}`}
							>
								Percentage Distribution
							</Button>
						</div>
					</div>
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label>Beneficiaries</Label>
							<Button
								variant="outline"
								size="sm"
								onClick={onAddNewBeneficiary}
								className="cursor-pointer"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add New Beneficiary
							</Button>
						</div>
						{isLoadingBeneficiaries ? (
							<div className="text-center py-4">Loading beneficiaries...</div>
						) : (
							<div className="space-y-4">
								{/* Beneficiary Select Box */}
								<div className="w-full">
									<DropdownMenu
										onOpenChange={setIsDropdownOpen}
										className="w-[600px] max-h-[300px] "
									>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={isDropdownOpen}
											className="w-full justify-between"
										>
											{searchQuery || "Search beneficiary..."}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
										<DropdownMenuContent className="w-[600px] max-h-[300px] overflow-y-auto">
											<div className="p-2">
												<Input
													placeholder="Search beneficiaries..."
													value={searchQuery}
													onChange={(e) => setSearchQuery(e.target.value)}
													className="mb-2"
												/>
												{filteredBeneficiaries.length === 0 ? (
													<div className="text-sm text-muted-foreground p-2">
														No beneficiaries found.
													</div>
												) : (
													<div className="space-y-1">
														{filteredBeneficiaries.map((beneficiary) => (
															<DropdownMenuItem
																key={beneficiary.id}
																onSelect={() =>
																	handleSelectBeneficiary(beneficiary.id)
																}
																className="cursor-pointer"
															>
																{beneficiary.firstName} {beneficiary.lastName} (
																{beneficiary.relationship})
																{beneficiary.type === "charity" &&
																	beneficiary.registrationNumber &&
																	` - Reg: ${beneficiary.registrationNumber}`}
															</DropdownMenuItem>
														))}
													</div>
												)}
											</div>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								{/* Selected Beneficiaries List */}
								{assetForm.beneficiaries.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No beneficiaries selected. Use the dropdown above to add
										beneficiaries.
									</p>
								) : (
									<div className="space-y-2">
										<p className="text-sm text-muted-foreground mb-2">
											Selected beneficiaries:
										</p>
										{assetForm.beneficiaries.map((beneficiary) => {
											const beneficiaryDetails = enhancedBeneficiaries.find(
												(b) => b.id === beneficiary.id
											);
											if (!beneficiaryDetails) return null;

											return (
												<div
													key={beneficiary.id}
													className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 transition-colors"
												>
													<div>
														<span className="font-medium">
															{beneficiaryDetails.type === "charity"
																? beneficiaryDetails.firstName
																: `${beneficiaryDetails.firstName} ${beneficiaryDetails.lastName}`}
														</span>
														<span className="text-sm text-muted-foreground ml-2">
															({beneficiaryDetails.relationship})
															{beneficiaryDetails.type === "charity" &&
																beneficiaryDetails.registrationNumber &&
																` - Reg: ${beneficiaryDetails.registrationNumber}`}
														</span>
														{assetForm.distributionType === "percentage" && (
															<span className="text-sm text-muted-foreground ml-2">
																({beneficiary.percentage}%)
															</span>
														)}
													</div>
													<div className="flex items-center space-x-2">
														{assetForm.distributionType === "percentage" && (
															<Input
																type="number"
																min="0"
																max="100"
																value={beneficiary.percentage ?? ""}
																onChange={(e) => {
																	const inputValue = e.target.value;
																	if (inputValue === "") {
																		handleBeneficiaryPercentageChange(
																			beneficiary.id,
																			undefined
																		);
																	} else {
																		const value = Math.min(
																			100,
																			Math.max(0, Number(inputValue))
																		);
																		handleBeneficiaryPercentageChange(
																			beneficiary.id,
																			value
																		);
																	}
																}}
																className="w-20"
															/>
														)}
														<Button
															variant="ghost"
															size="icon"
															onClick={() =>
																handleRemoveBeneficiary(beneficiary.id)
															}
															className="cursor-pointer"
														>
															<X className="h-4 w-4" />
														</Button>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={handleSave}
						disabled={
							!assetForm.description ||
							assetForm.beneficiaries.length === 0 ||
							(assetForm.distributionType === "percentage" &&
								Math.abs(
									assetForm.beneficiaries.reduce(
										(sum, b) => sum + (b.percentage || 0),
										0
									) - 100
								) > 0.01)
						}
						className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
					>
						{editingAsset ? "Save Changes" : "Add Asset"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
