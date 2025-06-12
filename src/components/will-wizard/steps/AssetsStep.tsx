import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	ArrowRight,
	Edit2,
	Plus,
	Trash2,
	X,
	ChevronsUpDown,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/custom-dropdown-menu";
import {
	Home,
	Building2,
	Car,
	TrendingUp,
	Briefcase,
	Package,
} from "lucide-react";
import { Asset, AssetType } from "../types/will.types";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useWill } from "@/context/WillContext";
import { useRelationships } from "@/hooks/useRelationships";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

const assetSchema = z.object({
	type: z.string().min(1, "Asset type is required"),
	description: z.string().min(1, "Description is required"),
	value: z.string().min(1, "Value is required"),
	distributionType: z.enum(["equal", "percentage"]),
	beneficiaries: z.array(
		z.object({
			id: z.string(),
			percentage: z.number().optional(),
		})
	),
});

// Asset type options with icons
const ASSET_TYPES = [
	{
		value: "Property" as AssetType,
		label: "Property",
		icon: Home,
		description: "Primary residence or vacation home",
	},
	{
		value: "Investment Property" as AssetType,
		label: "Investment Property",
		icon: Building2,
		description: "Rental or commercial property",
	},
	{
		value: "Vehicle" as AssetType,
		label: "Vehicle",
		icon: Car,
		description: "Cars, boats, or other vehicles",
	},
	{
		value: "Shares & Stocks" as AssetType,
		label: "Shares & Stocks",
		icon: TrendingUp,
		description: "Investment portfolio or stock holdings",
	},
	{
		value: "Business Interest" as AssetType,
		label: "Business Interest",
		icon: Briefcase,
		description: "Business ownership or partnership",
	},
	{
		value: "Other Assets" as AssetType,
		label: "Other Assets",
		icon: Package,
		description: "Other valuable assets",
	},
];

// Asset type pill component
const AssetTypePill = ({
	type,
	selected,
	onClick,
	className = "",
}: {
	type: (typeof ASSET_TYPES)[0];
	selected?: boolean;
	onClick?: () => void;
	className?: string;
}) => {
	const Icon = type.icon;
	return (
		<button
			type="button"
			onClick={onClick}
			className={`
				flex items-center space-x-2 px-4 py-2 rounded-full border h-10
				whitespace-nowrap overflow-hidden
				${
					selected
						? "bg-light-green text-black border-light-green"
						: "bg-background hover:bg-muted border-input"
				}
				${onClick ? "cursor-pointer" : ""}
				${className}
			`}
		>
			<Icon className="h-4 w-4 flex-shrink-0" />
			<span className="truncate">{type.label}</span>
		</button>
	);
};

// Asset type selector component
const AssetTypeSelector = ({
	selectedType,
	onSelect,
	className = "",
}: {
	selectedType: AssetType;
	onSelect: (type: AssetType) => void;
	className?: string;
}) => {
	return (
		<div className={`space-y-4 ${className}`}>
			<Label>Asset Type</Label>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-2 min-w-0">
				{ASSET_TYPES.map((type) => (
					<AssetTypePill
						key={type.value}
						type={type}
						selected={selectedType === type.value}
						onClick={() => onSelect(type.value)}
					/>
				))}
			</div>
			<div className="text-sm text-muted-foreground">
				{ASSET_TYPES.find((t) => t.value === selectedType)?.description}
			</div>
		</div>
	);
};

interface AssetsStepProps {
	onNext: (data: { assets: Asset[] }) => void;
	onBack: () => void;
	initialData?: {
		assets: Asset[];
	};
}

interface BeneficiaryResponse {
	charities: Array<{
		id: string;
		name: string;
		registration_number?: string;
	}>;
	people: Array<{
		id: string;
		first_name: string;
		last_name: string;
		relationship_id: string;
		is_minor: boolean;
	}>;
}

export default function AssetsStep({
	onNext,
	onBack,
	initialData,
}: AssetsStepProps) {
	const [assets, setAssets] = useState<Asset[]>(initialData?.assets || []);
	const [assetDialogOpen, setAssetDialogOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
	const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [newBeneficiaryDialogOpen, setNewBeneficiaryDialogOpen] =
		useState(false);

	const [assetForm, setAssetForm] = useState<Omit<Asset, "id">>({
		type: "Property" as AssetType,
		description: "",
		value: "",
		distributionType: "equal",
		beneficiaries: [],
	});

	// Enhanced beneficiaries state for API integration
	const [enhancedBeneficiaries, setEnhancedBeneficiaries] = useState<
		Array<{
			id: string;
			fullName: string;
			relationship: string;
			isMinor?: boolean;
			type: "person" | "charity";
			registrationNumber?: string;
		}>
	>([]);

	const { activeWill } = useWill();
	const { relationships } = useRelationships();

	const form = useForm<z.infer<typeof assetSchema>>({
		resolver: zodResolver(assetSchema),
		defaultValues: {
			type: "Property",
			description: "",
			value: "",
			distributionType: "equal",
			beneficiaries: [],
		},
	});

	const handleSubmit = () => {
		onNext({ assets });
	};

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
				percentage: type === "equal" ? undefined : 0,
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

	// Filter beneficiaries based on search query
	const filteredBeneficiaries = enhancedBeneficiaries.filter(
		(beneficiary) =>
			!assetForm.beneficiaries.some((b) => b.id === beneficiary.id) &&
			(beneficiary.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				beneficiary.relationship
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(beneficiary.registrationNumber &&
					beneficiary.registrationNumber
						.toLowerCase()
						.includes(searchQuery.toLowerCase())))
	);

	const handleRemoveBeneficiary = (beneficiaryId: string) => {
		setAssetForm((prev) => ({
			...prev,
			beneficiaries: prev.beneficiaries.filter((b) => b.id !== beneficiaryId),
		}));
	};

	const handleSaveAsset = () => {
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

		if (editingAsset) {
			setAssets((prev) =>
				prev.map((asset) =>
					asset.id === editingAsset.id ? { ...assetForm, id: asset.id } : asset
				)
			);
		} else {
			setAssets((prev) => [...prev, { ...assetForm, id: crypto.randomUUID() }]);
		}

		// Reset form and close dialog
		setAssetForm({
			type: "Property" as AssetType,
			description: "",
			distributionType: "equal",
			beneficiaries: [],
			value: "",
		});
		setEditingAsset(null);
		setAssetDialogOpen(false);
	};

	const handleEditAsset = (asset: Asset) => {
		setAssetForm(asset);
		setEditingAsset(asset);
		setAssetDialogOpen(true);
	};

	const handleRemoveAsset = (assetId: string) => {
		setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
	};

	// Fetch beneficiaries when opening asset dialog
	const fetchBeneficiaries = async () => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		setIsLoadingBeneficiaries(true);
		try {
			const { data, error } = await apiClient<BeneficiaryResponse>(
				`/beneficiaries/${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error) {
				toast.error("Failed to fetch beneficiaries");
				return;
			}

			if (data) {
				const combinedBeneficiaries = [
					...data.charities.map((charity) => ({
						id: charity.id,
						fullName: charity.name,
						relationship: "Charity",
						type: "charity" as const,
						registrationNumber: charity.registration_number,
					})),
					...data.people.map((person) => ({
						id: person.id,
						fullName: `${person.first_name} ${person.last_name}`,
						relationship:
							getFormattedRelationshipNameById(
								relationships,
								person.relationship_id
							) || "Unknown Relationship",
						isMinor: person.is_minor,
						type: "person" as const,
					})),
				];
				setEnhancedBeneficiaries(combinedBeneficiaries);

				// Pre-populate beneficiaries in asset form without default percentage
				setAssetForm((prev) => ({
					...prev,
					beneficiaries: [], // Don't pre-populate any beneficiaries
				}));
			}
		} catch (err) {
			toast.error("Failed to fetch beneficiaries");
		} finally {
			setIsLoadingBeneficiaries(false);
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
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Your Assets</h3>
							<Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										onClick={async () => {
											// Reset asset form
											setAssetForm({
												type: "Property" as AssetType,
												description: "",
												distributionType: "equal",
												beneficiaries: [],
												value: "",
											});
											setEditingAsset(null);

											// Fetch beneficiaries before opening dialog
											await fetchBeneficiaries();
										}}
										className="cursor-pointer"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Asset
									</Button>
								</DialogTrigger>
								<DialogContent className="bg-white max-w-2xl">
									<DialogHeader>
										<DialogTitle>
											{editingAsset ? "Edit Asset" : "Add Asset"}
										</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<AssetTypeSelector
											selectedType={assetForm.type}
											onSelect={(type: AssetType) => {
												setAssetForm((prev) => ({
													...prev,
													type,
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
														assetForm.distributionType === "equal"
															? "default"
															: "outline"
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
													onClick={() =>
														handleDistributionTypeChange("percentage")
													}
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
													onClick={() => {
														setNewBeneficiaryDialogOpen(true);
													}}
													className="cursor-pointer"
												>
													<Plus className="mr-2 h-4 w-4" />
													Add New Beneficiary
												</Button>
											</div>
											{isLoadingBeneficiaries ? (
												<div className="text-center py-4">
													Loading beneficiaries...
												</div>
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
																		onChange={(e) =>
																			setSearchQuery(e.target.value)
																		}
																		className="mb-2"
																	/>
																	{filteredBeneficiaries.length === 0 ? (
																		<div className="text-sm text-muted-foreground p-2">
																			No beneficiaries found.
																		</div>
																	) : (
																		<div className="space-y-1">
																			{filteredBeneficiaries.map(
																				(beneficiary) => (
																					<DropdownMenuItem
																						key={beneficiary.id}
																						onSelect={() =>
																							handleSelectBeneficiary(
																								beneficiary.id
																							)
																						}
																						className="cursor-pointer"
																					>
																						{beneficiary.fullName} (
																						{beneficiary.relationship})
																						{beneficiary.type === "charity" &&
																							beneficiary.registrationNumber &&
																							` - Reg: ${beneficiary.registrationNumber}`}
																					</DropdownMenuItem>
																				)
																			)}
																		</div>
																	)}
																</div>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>

													{/* Selected Beneficiaries List */}
													{assetForm.beneficiaries.length === 0 ? (
														<p className="text-sm text-muted-foreground">
															No beneficiaries selected. Use the dropdown above
															to add beneficiaries.
														</p>
													) : (
														<div className="space-y-2">
															<p className="text-sm text-muted-foreground mb-2">
																Selected beneficiaries:
															</p>
															{assetForm.beneficiaries.map((beneficiary) => {
																const beneficiaryDetails =
																	enhancedBeneficiaries.find(
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
																				{beneficiaryDetails.fullName}
																			</span>
																			<span className="text-sm text-muted-foreground ml-2">
																				({beneficiaryDetails.relationship})
																				{beneficiaryDetails.type ===
																					"charity" &&
																					beneficiaryDetails.registrationNumber &&
																					` - Reg: ${beneficiaryDetails.registrationNumber}`}
																			</span>
																			{assetForm.distributionType ===
																				"percentage" && (
																				<span className="text-sm text-muted-foreground ml-2">
																					({beneficiary.percentage}%)
																				</span>
																			)}
																		</div>
																		<div className="flex items-center space-x-2">
																			{assetForm.distributionType ===
																				"percentage" && (
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
																					handleRemoveBeneficiary(
																						beneficiary.id
																					)
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
											onClick={handleSaveAsset}
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
						</div>

						{assets.length === 0 ? (
							<p className="text-muted-foreground text-center py-4">
								No assets added yet. Click "Add Asset" to add your assets.
							</p>
						) : (
							<div className="space-y-4">
								{assets.map((asset) => (
									<Card key={asset.id}>
										<CardContent className="p-4">
											<div className="flex justify-between items-start">
												<div className="space-y-1">
													<div className="flex items-center space-x-2">
														{(() => {
															const assetType = ASSET_TYPES.find(
																(t) => t.value === asset.type
															);
															if (!assetType) return null;
															const Icon = assetType.icon;
															return (
																<>
																	<Icon className="h-4 w-4 text-muted-foreground" />
																	<p className="font-medium">{asset.type}</p>
																</>
															);
														})()}
													</div>
													<p className="text-sm">{asset.description}</p>
													<div className="mt-2">
														<p className="text-sm font-medium">Distribution:</p>
														<ul className="text-sm text-muted-foreground list-disc list-inside">
															{asset.beneficiaries.map((beneficiary) => {
																const beneficiaryDetails =
																	enhancedBeneficiaries.find(
																		(b) => b.id === beneficiary.id
																	);

																if (!beneficiaryDetails) return null;

																return (
																	<li key={beneficiary.id}>
																		{beneficiaryDetails.fullName}
																		<span className="text-muted-foreground">
																			{" "}
																			({beneficiaryDetails.relationship})
																			{beneficiaryDetails.type === "charity" &&
																				beneficiaryDetails.registrationNumber &&
																				` - Reg: ${beneficiaryDetails.registrationNumber}`}
																		</span>
																		{asset.distributionType === "percentage" &&
																			` (${beneficiary.percentage}%)`}
																	</li>
																);
															})}
														</ul>
													</div>
												</div>
												<div className="flex space-x-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleEditAsset(asset)}
														className="cursor-pointer"
													>
														<Edit2 className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleRemoveAsset(asset.id)}
														className="cursor-pointer"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
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
							type="submit"
							className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
						>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</form>
			</Form>

			{/* New Beneficiary Modal */}
			<Dialog
				open={newBeneficiaryDialogOpen}
				onOpenChange={setNewBeneficiaryDialogOpen}
			>
				<DialogContent className="bg-white max-w-2xl">
					<DialogHeader>
						<DialogTitle>Add New Beneficiary</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="flex space-x-4 border-b">
							<Button
								variant="ghost"
								className="border-b-2 border-transparent hover:border-primary"
							>
								Individual
							</Button>
							<Button
								variant="ghost"
								className="border-b-2 border-transparent hover:border-primary"
							>
								Charity
							</Button>
						</div>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input id="firstName" placeholder="Enter first name" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input id="lastName" placeholder="Enter last name" />
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="relationship">Relationship</Label>
								<Input id="relationship" placeholder="Enter relationship" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="charityName">Charity Name</Label>
								<Input id="charityName" placeholder="Enter charity name" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="registrationNumber">Registration Number</Label>
								<Input
									id="registrationNumber"
									placeholder="Enter registration number"
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setNewBeneficiaryDialogOpen(false)}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							onClick={() => {
								// TODO: Implement add beneficiary logic
								setNewBeneficiaryDialogOpen(false);
								toast.success("Beneficiary added successfully");
							}}
							className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
						>
							Add Beneficiary
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
