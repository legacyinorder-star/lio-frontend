import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/custom-dropdown-menu";
import { Plus, X, ChevronsUpDown } from "lucide-react";
import { Asset, AssetType } from "../types/will.types";
import { AssetTypeSelector } from "./AssetTypeSelector";
import { EnhancedBeneficiary } from "@/hooks/useWillData";
import { getFormattedRelationshipNameById } from "@/utils/relationships";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useWill } from "@/context/WillContext";

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
	enhancedBeneficiaries: EnhancedBeneficiary[];
	isLoadingBeneficiaries: boolean;
}

// Type for beneficiary details with fallback support
type BeneficiaryDetails =
	| EnhancedBeneficiary
	| {
			id: string;
			firstName: string;
			lastName: string;
			relationship: string;
			relationshipId?: string;
			type: "person" | "charity";
			registrationNumber?: string;
			isDeleted?: boolean;
	  };

export function AssetDialog({
	open,
	onOpenChange,
	onSave,
	editingAsset,
	onAddNewBeneficiary,
	enhancedBeneficiaries,
	isLoadingBeneficiaries,
}: AssetDialogProps) {
	const { activeWill } = useWill();
	const [assetForm, setAssetForm] = useState<Omit<Asset, "id">>({
		assetType: "Property" as AssetType,
		description: "",
		hasBeneficiaries: false,
		distributionType: "equal",
		beneficiaries: [],
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// Initialize form when editing or when modal opens
	useEffect(() => {
		if (editingAsset) {
			setAssetForm({
				assetType: editingAsset.assetType,
				description: editingAsset.description,
				hasBeneficiaries: editingAsset.hasBeneficiaries,
				distributionType: editingAsset.distributionType,
				beneficiaries: editingAsset.beneficiaries,
			});
		} else if (open) {
			// Reset form to default values when adding new asset and modal is open
			setAssetForm({
				assetType: "Property" as AssetType,
				description: "",
				hasBeneficiaries: false,
				distributionType: "equal",
				beneficiaries: [],
			});
			setSearchQuery("");
			setIsDropdownOpen(false);
		}
	}, [editingAsset, open]);

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

	const handleHasBeneficiariesChange = (checked: boolean) => {
		setAssetForm((prev) => ({
			...prev,
			hasBeneficiaries: checked,
			// Clear beneficiaries if unchecking
			beneficiaries: checked ? prev.beneficiaries : [],
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

		// Clear search
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
			(assetForm.hasBeneficiaries && assetForm.beneficiaries.length === 0) ||
			(assetForm.hasBeneficiaries &&
				assetForm.distributionType === "percentage" &&
				Math.abs(
					assetForm.beneficiaries.reduce(
						(sum, b) => sum + (b.percentage || 0),
						0
					) - 100
				) > 0.01)
		) {
			return;
		}

		// Calculate percentages for beneficiaries (only if hasBeneficiaries is true)
		const beneficiariesWithPercentages = assetForm.hasBeneficiaries
			? assetForm.beneficiaries.map((beneficiary) => {
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
						type: (beneficiaryDetails?.type === "charity"
							? "charity"
							: "individual") as "charity" | "individual",
					};
			  })
			: [];

		// Call onSave with the form data
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

	// Helper function to get beneficiary details with fallback to will context
	const getBeneficiaryDetails = (beneficiaryId: string): BeneficiaryDetails => {
		// First try to find in enhancedBeneficiaries
		const enhancedBeneficiary = enhancedBeneficiaries.find(
			(b) => b.id === beneficiaryId
		);
		if (enhancedBeneficiary) {
			return enhancedBeneficiary;
		}

		// Fallback to will context for deleted beneficiaries
		if (editingAsset && activeWill?.assets) {
			const willAsset = activeWill.assets.find(
				(willAsset) => willAsset.id === editingAsset.id
			);
			if (willAsset) {
				const willBeneficiary = willAsset.beneficiaries.find(
					(wb) => wb.id === beneficiaryId
				);
				if (willBeneficiary) {
					// Check if it's a deleted beneficiary
					const isIndividual = willBeneficiary.peopleId !== undefined;
					const isCharity = willBeneficiary.charitiesId !== undefined;

					if (isIndividual && !willBeneficiary.person) {
						// Deleted person
						return {
							id: beneficiaryId,
							firstName: "Unknown Person",
							lastName: "(Deleted)",
							relationship: "Deleted Beneficiary",
							type: "person",
							isDeleted: true,
						};
					}

					if (isCharity && !willBeneficiary.charity) {
						// Deleted charity
						return {
							id: beneficiaryId,
							firstName: "Unknown Charity",
							lastName: "(Deleted)",
							relationship: "Deleted Beneficiary",
							type: "charity",
							isDeleted: true,
						};
					}

					// Valid beneficiary from will context
					if (willBeneficiary.person) {
						return {
							id: beneficiaryId,
							firstName: willBeneficiary.person.firstName,
							lastName: willBeneficiary.person.lastName,
							relationship: willBeneficiary.person.relationship,
							relationshipId: willBeneficiary.person.relationshipId,
							type: "person",
						};
					}

					if (willBeneficiary.charity) {
						return {
							id: beneficiaryId,
							firstName: willBeneficiary.charity.name,
							lastName: "",
							relationship: "Charity",
							registrationNumber: willBeneficiary.charity.registrationNumber,
							type: "charity",
						};
					}
				}
			}
		}

		// Ultimate fallback
		return {
			id: beneficiaryId,
			firstName: "Unknown",
			lastName: "Beneficiary",
			relationship: "Unknown",
			type: "person",
			isDeleted: true,
		};
	};

	// Helper function to check if beneficiary is deleted
	const isBeneficiaryDeleted = (
		beneficiaryDetails: BeneficiaryDetails
	): boolean => {
		return (
			"isDeleted" in beneficiaryDetails && beneficiaryDetails.isDeleted === true
		);
	};

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
					{/* Checkbox for beneficiaries */}
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="hasBeneficiaries"
								checked={assetForm.hasBeneficiaries}
								onChange={(e) => handleHasBeneficiariesChange(e.target.checked)}
								className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
							/>
							<Label htmlFor="hasBeneficiaries" className="text-sm font-medium">
								I want to give this asset to specific beneficiaries
							</Label>
						</div>
					</div>

					{/* Distribution and Beneficiaries Section - Only show if hasBeneficiaries is true */}
					{assetForm.hasBeneficiaries && (
						<>
							<div className="space-y-2">
								<Label>Distribution Method</Label>
								<div className="flex space-x-4">
									<Button
										variant={
											assetForm.distributionType === "equal"
												? "default"
												: "outline"
										}
										onClick={() => handleDistributionTypeChange("equal")}
										className={`cursor-pointer ${
											assetForm.distributionType === "equal"
												? "bg-primary text-white"
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
												? "bg-primary text-white"
												: ""
										}`}
									>
										Percentage Distribution
									</Button>
								</div>
							</div>
						</>
					)}
					{/* Beneficiaries Section - Only show if hasBeneficiaries is true */}
					{assetForm.hasBeneficiaries && (
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
								<LoadingSpinner message="Loading beneficiaries..." />
							) : (
								<div className="space-y-4">
									{/* Beneficiary Select Box */}
									<div className="w-full">
										<DropdownMenu
											open={isDropdownOpen}
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
															{filteredBeneficiaries.map((beneficiary) => {
																const beneficiaryDetails =
																	enhancedBeneficiaries.find(
																		(b) => b.id === beneficiary.id
																	);

																if (!beneficiaryDetails) return null;

																const relationship =
																	beneficiaryDetails.relationshipId
																		? getFormattedRelationshipNameById(
																				beneficiaryDetails.relationshipId
																		  ) || beneficiaryDetails.relationship
																		: beneficiaryDetails.relationship;

																return (
																	<DropdownMenuItem
																		key={beneficiary.id}
																		onSelect={() =>
																			handleSelectBeneficiary(beneficiary.id)
																		}
																		className="cursor-pointer"
																	>
																		{beneficiaryDetails.type === "charity"
																			? beneficiaryDetails.firstName
																			: `${beneficiaryDetails.firstName} ${beneficiaryDetails.lastName}`}
																		<span className="text-muted-foreground ps-[0.25rem]">
																			({relationship})
																			{beneficiaryDetails.type === "charity" &&
																				beneficiaryDetails.registrationNumber &&
																				` - Reg: ${beneficiaryDetails.registrationNumber}`}
																		</span>
																	</DropdownMenuItem>
																);
															})}
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
												const beneficiaryDetails = getBeneficiaryDetails(
													beneficiary.id
												);
												if (!beneficiaryDetails) return null;

												const relationship = beneficiaryDetails.relationshipId
													? getFormattedRelationshipNameById(
															beneficiaryDetails.relationshipId
													  ) || beneficiaryDetails.relationship
													: beneficiaryDetails.relationship;

												const isDeleted =
													isBeneficiaryDeleted(beneficiaryDetails);

												return (
													<div
														key={beneficiary.id}
														className={`flex items-center justify-between p-2 border rounded-md transition-colors ${
															isDeleted
																? "bg-red-50 border-red-200 hover:bg-red-100"
																: "hover:bg-gray-50"
														}`}
													>
														<div>
															<span
																className={`font-medium ${
																	isDeleted ? "text-red-600" : ""
																}`}
															>
																{beneficiaryDetails.type === "charity"
																	? beneficiaryDetails.firstName
																	: `${beneficiaryDetails.firstName} ${beneficiaryDetails.lastName}`}
															</span>
															<span className="text-sm text-muted-foreground ml-2">
																({relationship})
																{beneficiaryDetails.type === "charity" &&
																	beneficiaryDetails.registrationNumber &&
																	` - Reg: ${beneficiaryDetails.registrationNumber}`}
															</span>
															{assetForm.distributionType === "percentage" && (
																<span className="text-sm text-muted-foreground ml-2">
																	({beneficiary.percentage}%)
																</span>
															)}
															{isDeleted && (
																<span className="text-sm text-red-600 ml-2">
																	(Deleted - Please remove)
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
					)}
				</div>
				<DialogFooter>
					<Button
						onClick={handleSave}
						disabled={
							!assetForm.description ||
							(assetForm.hasBeneficiaries &&
								assetForm.beneficiaries.length === 0) ||
							(assetForm.hasBeneficiaries &&
								assetForm.distributionType === "percentage" &&
								Math.abs(
									assetForm.beneficiaries.reduce(
										(sum, b) => sum + (b.percentage || 0),
										0
									) - 100
								) > 0.01)
						}
						className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
					>
						{editingAsset ? "Save Changes" : "Add Asset"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
