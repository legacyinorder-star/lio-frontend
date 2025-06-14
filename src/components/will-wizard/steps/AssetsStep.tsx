import { useState, useEffect } from "react";
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
import { RelationshipSelect } from "@/components/ui/relationship-select";
import {
	Home,
	Building2,
	Car,
	TrendingUp,
	Briefcase,
	Package,
} from "lucide-react";
import { Asset, AssetType, WillFormData } from "../types/will.types";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useWill } from "@/context/WillContext";
import { useRelationships } from "@/hooks/useRelationships";
import { getFormattedRelationshipNameById } from "@/utils/relationships";
import { mapAssetBeneficiariesFromAPI } from "../../../utils/dataTransform";

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
	data: Partial<WillFormData>;
	onUpdate: (data: Partial<WillFormData>) => void;
	onNext: () => void;
	onBack: () => void;
	initialData?: {
		assets: Asset[];
	};
}

interface BeneficiaryResponse {
	charities: Array<{
		id: string;
		created_at: string;
		will_id: string;
		name: string;
		user_id: string;
		rc_number?: string;
	}>;
	people: Array<{
		id: string;
		user_id: string;
		will_id: string;
		relationship_id: string;
		first_name: string;
		last_name: string;
		is_minor: boolean;
		created_at: string;
		is_witness: boolean;
	}>;
}

interface ApiPersonResponse {
	id: string;
	first_name: string;
	last_name: string;
	relationship_id: string;
}

interface ApiCharityResponse {
	id: string;
	name: string;
	rc_number?: string;
}

interface ApiAssetResponse {
	id: string;
	will_id: string;
	name: string;
	asset_type: string;
	description: string;
	distribution_type: string;
	beneficiaries: Array<{
		id: string;
		created_at: string;
		will_id: string;
		people_id: string | undefined;
		charities_id: string | undefined;
		asset_id: string;
		percentage: number;
		person?: {
			id: string;
			user_id: string;
			will_id: string;
			relationship_id: string;
			first_name: string;
			last_name: string;
			is_minor: boolean;
			created_at: string;
			is_witness: boolean;
		};
		charity?: {
			id: string;
			created_at: string;
			will_id: string;
			name: string;
			user_id: string;
			rc_number?: string;
		};
	}>;
}

export default function AssetsStep({
	data,
	onUpdate,
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
	const [beneficiaryType, setBeneficiaryType] = useState<
		"individual" | "charity"
	>("individual");

	const [assetForm, setAssetForm] = useState<Omit<Asset, "id">>({
		assetType: "Property" as AssetType,
		description: "",
		distributionType: "equal",
		beneficiaries: [],
	});

	// New beneficiary form state
	const [newBeneficiaryForm, setNewBeneficiaryForm] = useState({
		firstName: "",
		lastName: "",
		relationshipId: "",
		charityName: "",
		registrationNumber: "",
	});

	// Enhanced beneficiaries state for API integration
	const [enhancedBeneficiaries, setEnhancedBeneficiaries] = useState<
		Array<{
			id: string;
			firstName: string;
			lastName: string;
			relationshipId: string;
			isMinor?: boolean;
			type: "person" | "charity";
			registrationNumber?: string;
		}>
	>([]);

	const { activeWill, setActiveWill } = useWill();
	const { relationships } = useRelationships();

	// Load assets from activeWill context
	useEffect(() => {
		const loadAssetsFromContext = async () => {
			if (activeWill?.assets && activeWill.assets.length > 0) {
				// Convert WillAsset format to Asset format
				const convertedAssets: Asset[] = activeWill.assets.map((willAsset) => ({
					id: willAsset.id,
					assetType: willAsset.assetType as AssetType,
					description: willAsset.description,
					distributionType: willAsset.distributionType,
					beneficiaries: willAsset.beneficiaries.map((beneficiary) => ({
						id: beneficiary.id,
						percentage: beneficiary.percentage,
						peopleId: beneficiary.peopleId,
						charitiesId: beneficiary.charitiesId,
						person: beneficiary.person,
						charity: beneficiary.charity,
					})),
				}));
				setAssets(convertedAssets);
			} else if (data.assets && data.assets.length > 0) {
				// Use assets from WillWizard data
				setAssets(data.assets);
			} else {
				// If no assets in context or data, use initialData or empty array
				setAssets(initialData?.assets || []);
			}
		};

		loadAssetsFromContext();
	}, [activeWill, data.assets, initialData]);

	const form = useForm<z.infer<typeof assetSchema>>({
		resolver: zodResolver(assetSchema),
		defaultValues: {
			assetType: "Property",
			description: "",
			distributionType: "equal",
			beneficiaries: [],
		},
	});

	const handleSubmit = () => {
		onUpdate({ assets });
		onNext();
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

	const handleRemoveBeneficiary = (beneficiaryId: string) => {
		setAssetForm((prev) => ({
			...prev,
			beneficiaries: prev.beneficiaries.filter((b) => b.id !== beneficiaryId),
		}));
	};

	const handleSaveAsset = async () => {
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

		if (!activeWill?.id) {
			toast.error("No active will found");
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

		try {
			// Send POST request to /assets
			const { data: assetData, error: assetError } =
				await apiClient<ApiAssetResponse>("/assets", {
					method: "POST",
					body: JSON.stringify({
						will_id: activeWill.id,
						name: assetForm.type,
						asset_type: assetForm.type,
						description: assetForm.description,
						distribution_type: assetForm.distributionType,
						beneficiaries: beneficiariesWithPercentages,
					}),
				});

			if (assetError || !assetData) {
				toast.error("Failed to save asset");
				return;
			}

			// Update local state with the asset from API response
			const newAsset: Asset = {
				id: assetData.id,
				assetType: assetData.asset_type as AssetType,
				description: assetData.description,
				distributionType: assetData.distribution_type as "equal" | "percentage",
				beneficiaries: assetData.beneficiaries.map((b) => ({
					id: b.id,
					percentage: b.percentage,
				})),
			};

			// Map beneficiary details for the will context using the nested objects
			const mappedBeneficiaries = mapBeneficiaryDetails(
				assetData.beneficiaries
			);

			if (editingAsset) {
				const updatedAssets = assets.map((asset) =>
					asset.id === editingAsset.id ? newAsset : asset
				);
				setAssets(updatedAssets);

				// Update will context with mapped beneficiaries
				const updatedWillAssets = activeWill.assets.map((willAsset) =>
					willAsset.id === editingAsset.id
						? {
								...willAsset,
								beneficiaries: mappedBeneficiaries,
						  }
						: willAsset
				);

				setActiveWill({
					...activeWill,
					assets: updatedWillAssets,
				});
			} else {
				const updatedAssets = [...assets, newAsset];
				setAssets(updatedAssets);

				// Add new asset to will context with mapped beneficiaries (convert snake_case to camelCase)
				const newWillAsset = {
					id: assetData.id,
					type: assetData.asset_type,
					description: assetData.description,
					distributionType: assetData.distribution_type as
						| "equal"
						| "percentage",
					beneficiaries: mappedBeneficiaries,
				};

				setActiveWill({
					...activeWill,
					assets: [...activeWill.assets, newWillAsset],
				});
			}

			toast.success(
				editingAsset ? "Asset updated successfully" : "Asset added successfully"
			);

			// Reset form and close dialog
			setAssetForm({
				type: "Property" as AssetType,
				description: "",
				distributionType: "equal",
				beneficiaries: [],
			});
			setEditingAsset(null);
			setAssetDialogOpen(false);
		} catch (err) {
			toast.error("Failed to save asset");
		}
	};

	const handleEditAsset = (asset: Asset) => {
		setAssetForm(asset);
		setEditingAsset(asset);
		setAssetDialogOpen(true);
	};

	const handleRemoveAsset = (assetId: string) => {
		const updatedAssets = assets.filter((asset) => asset.id !== assetId);
		setAssets(updatedAssets);

		// Update will context by removing the asset
		if (activeWill) {
			const updatedWillAssets = activeWill.assets.filter(
				(willAsset) => willAsset.id !== assetId
			);
			setActiveWill({
				...activeWill,
				assets: updatedWillAssets,
			});
		}
	};

	const handleAddNewBeneficiary = async () => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		if (beneficiaryType === "individual") {
			// Validate individual form
			if (
				!newBeneficiaryForm.firstName ||
				!newBeneficiaryForm.lastName ||
				!newBeneficiaryForm.relationshipId
			) {
				toast.error("Please fill in all required fields for individual");
				return;
			}

			try {
				// Send POST request to /people
				const { data: personData, error: personError } =
					await apiClient<ApiPersonResponse>("/people", {
						method: "POST",
						body: JSON.stringify({
							will_id: activeWill.id,
							relationship_id: newBeneficiaryForm.relationshipId,
							first_name: newBeneficiaryForm.firstName,
							last_name: newBeneficiaryForm.lastName,
							is_minor: false, // New beneficiaries are not minors by default
						}),
					});

				if (personError || !personData) {
					toast.error("Failed to add individual beneficiary");
					return;
				}

				// Get the relationship name for display
				const relationshipName =
					getFormattedRelationshipNameById(
						relationships,
						newBeneficiaryForm.relationshipId
					) || "Unknown Relationship";

				// Add to enhanced beneficiaries list
				const newEnhancedBeneficiary = {
					id: personData.id,
					firstName: newBeneficiaryForm.firstName,
					lastName: newBeneficiaryForm.lastName,
					relationship: relationshipName,
					type: "person" as const,
				};

				setEnhancedBeneficiaries((prev) => [...prev, newEnhancedBeneficiary]);

				// Add to selected beneficiaries
				const newBeneficiary = {
					id: personData.id,
					percentage: undefined,
				};

				setAssetForm((prev) => ({
					...prev,
					beneficiaries: [...prev.beneficiaries, newBeneficiary],
				}));

				toast.success("Individual beneficiary added successfully");
			} catch (err) {
				toast.error("Failed to add individual beneficiary");
			}
		} else {
			// Validate charity form
			if (!newBeneficiaryForm.charityName) {
				toast.error("Please enter charity name");
				return;
			}

			try {
				// Send POST request to /charities
				const { data: charityData, error: charityError } =
					await apiClient<ApiCharityResponse>("/charities", {
						method: "POST",
						body: JSON.stringify({
							name: newBeneficiaryForm.charityName,
							will_id: activeWill.id,
							rc_number: newBeneficiaryForm.registrationNumber || null,
						}),
					});

				if (charityError || !charityData) {
					toast.error("Failed to add charity beneficiary");
					return;
				}

				// Add to enhanced beneficiaries list
				const newEnhancedBeneficiary = {
					id: charityData.id,
					firstName: newBeneficiaryForm.charityName,
					lastName: "",
					relationship: "Charity",
					type: "charity" as const,
					registrationNumber: newBeneficiaryForm.registrationNumber,
				};

				setEnhancedBeneficiaries((prev) => [...prev, newEnhancedBeneficiary]);

				// Add to selected beneficiaries
				const newBeneficiary = {
					id: charityData.id,
					percentage: undefined,
				};

				setAssetForm((prev) => ({
					...prev,
					beneficiaries: [...prev.beneficiaries, newBeneficiary],
				}));

				toast.success("Charity beneficiary added successfully");
			} catch (err) {
				toast.error("Failed to add charity beneficiary");
			}
		}

		// Reset form and close modal
		setNewBeneficiaryDialogOpen(false);
		setNewBeneficiaryForm({
			firstName: "",
			lastName: "",
			relationshipId: "",
			charityName: "",
			registrationNumber: "",
		});
		setBeneficiaryType("individual");
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
						firstName: charity.name,
						lastName: "",
						relationship: "Charity",
						type: "charity" as const,
						registrationNumber: charity.rc_number,
					})),
					...data.people.map((person) => ({
						id: person.id,
						firstName: person.first_name,
						lastName: person.last_name,
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

	// Function to map beneficiary details from API response to WillContext structure (snake_case to camelCase)
	const mapBeneficiaryDetails = (assetBeneficiaries: any[]) => {
		return mapAssetBeneficiariesFromAPI(assetBeneficiaries, relationships);
	};

	// Function to load assets from API and update will context
	const loadAssetsFromAPI = async () => {
		if (!activeWill?.id) return;

		try {
			// Fetch assets from API
			const { data: assetsData, error } = await apiClient<ApiAssetResponse[]>(
				`/assets?will_id=${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error || !assetsData) {
				toast.error("Failed to fetch assets");
				return;
			}

			// Process each asset and its beneficiaries
			const processedAssets = assetsData.map((assetData) => {
				// Map beneficiary details for this asset using the nested objects
				const mappedBeneficiaries = mapBeneficiaryDetails(
					assetData.beneficiaries
				);

				// Create Asset format for local state
				const asset: Asset = {
					id: assetData.id,
					assetType: assetData.asset_type as AssetType,
					description: assetData.description,
					distributionType: assetData.distribution_type as
						| "equal"
						| "percentage",
					beneficiaries: assetData.beneficiaries.map((b) => ({
						id: b.id,
						percentage: b.percentage,
					})),
				};

				// Create WillAsset format for context (convert snake_case to camelCase)
				const willAsset = {
					id: assetData.id,
					assetType: assetData.asset_type,
					description: assetData.description,
					distributionType: assetData.distribution_type as
						| "equal"
						| "percentage",
					beneficiaries: mappedBeneficiaries,
				};

				return { asset, willAsset };
			});

			// Update local state
			setAssets(processedAssets.map((p) => p.asset));

			// Update will context
			setActiveWill({
				...activeWill,
				assets: processedAssets.map((p) => p.willAsset),
			});
		} catch (err) {
			toast.error("Failed to load assets from API");
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
							<Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										onClick={async () => {
											// Reset asset form
											setAssetForm({
												assetType: "Property" as AssetType,
												description: "",
												distributionType: "equal",
												beneficiaries: [],
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
											selectedType={assetForm.assetType}
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
																						{beneficiary.firstName}{" "}
																						{beneficiary.lastName} (
																						{beneficiary.relationshipId})
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
																				{beneficiaryDetails.type === "charity"
																					? beneficiaryDetails.firstName
																					: `${beneficiaryDetails.firstName} ${beneficiaryDetails.lastName}`}
																			</span>
																			<span className="text-sm text-muted-foreground ml-2">
																				({beneficiaryDetails.relationshipId})
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
								{assets.map(
									(asset) => (
										console.log(asset),
										(
											<Card key={asset.id}>
												<CardContent className="p-4">
													<div className="flex justify-between items-start">
														<div className="space-y-1">
															<div className="flex items-center space-x-2">
																{(() => {
																	const assetType = ASSET_TYPES.find(
																		(t) => t.value === asset.assetType
																	);
																	if (!assetType) return null;
																	const Icon = assetType.icon;
																	return (
																		<>
																			<Icon className="h-4 w-4 text-muted-foreground" />
																			<p className="font-medium">
																				{asset.assetType}
																			</p>
																		</>
																	);
																})()}
															</div>
															<p className="text-sm">{asset.description}</p>
															<div className="mt-2">
																<p className="text-sm font-medium">
																	Distribution:
																</p>
																{asset.distributionType === "equal" ? (
																	<p className="text-sm text-muted-foreground">
																		Equal Distribution
																	</p>
																) : (
																	<ul className="text-sm text-muted-foreground list-disc list-inside">
																		{asset.beneficiaries.map((beneficiary) => {
																			// Get beneficiary details from activeWill context
																			const willAsset = activeWill?.assets.find(
																				(willAsset) => willAsset.id === asset.id
																			);
																			const willBeneficiary =
																				willAsset?.beneficiaries.find(
																					(wb) => wb.id === beneficiary.id
																				);

																			if (!willBeneficiary) {
																				// Fallback to enhancedBeneficiaries if not found in context
																				const beneficiaryDetails =
																					enhancedBeneficiaries.find(
																						(b) => b.id === beneficiary.id
																					);

																				if (!beneficiaryDetails) return null;

																				return (
																					<li key={beneficiary.id}>
																						{beneficiaryDetails.type ===
																						"charity"
																							? beneficiaryDetails.firstName
																							: `${beneficiaryDetails.firstName} ${beneficiaryDetails.lastName}`}
																						<span className="text-muted-foreground">
																							{" "}
																							(
																							{
																								beneficiaryDetails.relationshipId
																							}
																							)
																							{beneficiaryDetails.type ===
																								"charity" &&
																								beneficiaryDetails.registrationNumber &&
																								` - Reg: ${beneficiaryDetails.registrationNumber}`}
																						</span>
																						{` (${beneficiary.percentage}%)`}
																					</li>
																				);
																			}

																			// Use WillContext structure - check if it's an individual based on type
																			const isIndividual =
																				willBeneficiary.type === "individual";
																			const beneficiaryName = isIndividual
																				? willBeneficiary.person
																					? `${willBeneficiary.person.firstName} ${willBeneficiary.person.lastName}`
																					: "Unknown Person"
																				: willBeneficiary.charity
																				? willBeneficiary.charity.name
																				: "Unknown Charity";

																			const relationship = isIndividual
																				? willBeneficiary.person
																						?.relationship ||
																				  "Unknown Relationship"
																				: "Charity";

																			const registrationNumber = !isIndividual
																				? willBeneficiary.charity
																						?.registrationNumber
																				: undefined;

																			return (
																				<li key={beneficiary.id}>
																					{beneficiaryName}
																					<span className="text-muted-foreground">
																						{" "}
																						({relationship})
																						{registrationNumber &&
																							` - Reg: ${registrationNumber}`}
																					</span>
																					{` (${willBeneficiary.percentage}%)`}
																				</li>
																			);
																		})}
																	</ul>
																)}
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
										)
									)
								)}
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
						{/* Tabs */}
						<div className="flex space-x-4 border-b">
							<Button
								variant="ghost"
								onClick={() => setBeneficiaryType("individual")}
								className={`border-b-2 transition-colors cursor-pointer ${
									beneficiaryType === "individual"
										? "bg-light-green text-black border-light-green"
										: "border-transparent hover:border-primary/50"
								}`}
							>
								Individual
							</Button>
							<Button
								variant="ghost"
								onClick={() => setBeneficiaryType("charity")}
								className={`border-b-2 transition-colors cursor-pointer ${
									beneficiaryType === "charity"
										? "bg-light-green text-black border-light-green"
										: "border-transparent hover:border-primary/50"
								}`}
							>
								Charity
							</Button>
						</div>

						{/* Individual Form */}
						{beneficiaryType === "individual" && (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName">First Name</Label>
										<Input
											id="firstName"
											placeholder="Enter first name"
											value={newBeneficiaryForm.firstName}
											onChange={(e) =>
												setNewBeneficiaryForm((prev) => ({
													...prev,
													firstName: e.target.value,
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="lastName">Last Name</Label>
										<Input
											id="lastName"
											placeholder="Enter last name"
											value={newBeneficiaryForm.lastName}
											onChange={(e) =>
												setNewBeneficiaryForm((prev) => ({
													...prev,
													lastName: e.target.value,
												}))
											}
										/>
									</div>
								</div>
								<RelationshipSelect
									value={newBeneficiaryForm.relationshipId}
									onValueChange={(value) =>
										setNewBeneficiaryForm((prev) => ({
											...prev,
											relationshipId: value,
										}))
									}
									label="Relationship"
									placeholder="Select relationship"
									excludeRelationships={["child", "spouse"]}
								/>
							</div>
						)}

						{/* Charity Form */}
						{beneficiaryType === "charity" && (
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="charityName">Charity Name</Label>
									<Input
										id="charityName"
										placeholder="Enter charity name"
										value={newBeneficiaryForm.charityName}
										onChange={(e) =>
											setNewBeneficiaryForm((prev) => ({
												...prev,
												charityName: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="registrationNumber">
										Registration Number
									</Label>
									<Input
										id="registrationNumber"
										placeholder="Enter registration number"
										value={newBeneficiaryForm.registrationNumber}
										onChange={(e) =>
											setNewBeneficiaryForm((prev) => ({
												...prev,
												registrationNumber: e.target.value,
											}))
										}
									/>
								</div>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setNewBeneficiaryDialogOpen(false);
								setNewBeneficiaryForm({
									firstName: "",
									lastName: "",
									relationshipId: "",
									charityName: "",
									registrationNumber: "",
								});
								setBeneficiaryType("individual");
							}}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddNewBeneficiary}
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
