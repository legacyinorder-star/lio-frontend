import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SpouseDialog, { SpouseData } from "./SpouseDialog";
import { ArrowRight, Plus, Trash2, Edit2, ArrowLeft } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Home,
	Building2,
	Car,
	TrendingUp,
	Briefcase,
	Package,
} from "lucide-react";

// Define the different question types
type QuestionType =
	| "name"
	| "address"
	| "hasSpouse"
	| "hasChildren"
	| "guardians"
	| "hasAssets"
	| "finished";

// Define the address type
interface Address {
	street: string;
	city: string;
	province: string;
	zipCode: string;
	country: string;
}

// Define child type
interface Child {
	id: string;
	firstName: string;
	lastName: string;
	requiresGuardian: boolean;
}

// Define guardian type
interface Guardian {
	id: string;
	firstName: string;
	lastName: string;
	relationship: string;
	isPrimary: boolean;
}

// Add this type after the other type definitions
type AssetType =
	| "Property"
	| "Investment Property"
	| "Vehicle"
	| "Shares & Stocks"
	| "Business Interest"
	| "Other Assets";

// Update the Asset interface
interface Asset {
	id: string;
	type: AssetType;
	description: string;
	distributionType: "equal" | "percentage";
	beneficiaries: {
		id: string;
		percentage?: number;
	}[];
}

// Add these interfaces after the other interfaces
interface NewBeneficiary {
	id: string;
	firstName: string;
	lastName: string;
	relationship: string;
}

// Define the form data structure
interface WillFormData {
	firstName: string;
	lastName: string;
	address: Address;
	hasSpouse: boolean;
	spouse?: SpouseData;
	children: Child[];
	hasChildren: boolean;
	guardians: Guardian[];
	assets: Asset[];
	otherBeneficiaries?: NewBeneficiary[];
}

// Add these types and constants after the other type definitions
type AssetTypeOption = {
	value: AssetType;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	description: string;
};

const ASSET_TYPES: AssetTypeOption[] = [
	{
		value: "Property",
		label: "Property",
		icon: Home,
		description: "Primary residence or vacation home",
	},
	{
		value: "Investment Property",
		label: "Investment Property",
		icon: Building2,
		description: "Rental or commercial property",
	},
	{
		value: "Vehicle",
		label: "Vehicle",
		icon: Car,
		description: "Cars, boats, or other vehicles",
	},
	{
		value: "Shares & Stocks",
		label: "Shares & Stocks",
		icon: TrendingUp,
		description: "Investment portfolio or stock holdings",
	},
	{
		value: "Business Interest",
		label: "Business Interest",
		icon: Briefcase,
		description: "Business ownership or partnership",
	},
	{
		value: "Other Assets",
		label: "Other Assets",
		icon: Package,
		description: "Other valuable assets",
	},
];

// Update the AssetTypePill component styling
const AssetTypePill = ({
	type,
	selected,
	onClick,
	className = "",
}: {
	type: AssetTypeOption;
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
						? "bg-primary text-primary-foreground border-primary"
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

// Update the AssetTypeSelector grid layout
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

export default function WillWizard() {
	// Track the current question being shown
	const [currentQuestion, setCurrentQuestion] = useState<QuestionType>("name");

	// Data collection
	const [formData, setFormData] = useState<WillFormData>({
		firstName: "",
		lastName: "",
		address: {
			street: "",
			city: "",
			province: "",
			zipCode: "",
			country: "",
		},
		hasSpouse: false,
		children: [],
		hasChildren: false,
		guardians: [],
		assets: [],
		otherBeneficiaries: [],
	});

	// For the spouse dialog
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);

	// Child dialog state
	const [childDialogOpen, setChildDialogOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<Child | null>(null);
	const [childForm, setChildForm] = useState<Child>({
		id: "",
		firstName: "",
		lastName: "",
		requiresGuardian: false,
	});

	// Guardian dialog state
	const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
	const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
	const [guardianForm, setGuardianForm] = useState<Guardian>({
		id: "",
		firstName: "",
		lastName: "",
		relationship: "",
		isPrimary: false,
	});

	// Add this at the top of the component
	const [mounted, setMounted] = useState(false);

	// Confirmation dialog state
	const [confirmNoChildrenOpen, setConfirmNoChildrenOpen] = useState(false);

	// Asset dialog state
	const [assetDialogOpen, setAssetDialogOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
	const [assetForm, setAssetForm] = useState<Asset>({
		id: "",
		type: "Property" as AssetType,
		description: "",
		distributionType: "equal",
		beneficiaries: [],
	});

	// Add these state variables after the other state declarations
	const [beneficiaryDialogOpen, setBeneficiaryDialogOpen] = useState(false);
	const [newBeneficiaryForm, setNewBeneficiaryForm] = useState<NewBeneficiary>({
		id: "",
		firstName: "",
		lastName: "",
		relationship: "",
	});
	const [beneficiaryType, setBeneficiaryType] = useState<"existing" | "new">(
		"existing"
	);

	// Ensure we're mounted before rendering any dialogs
	useEffect(() => {
		setMounted(true);
	}, []);

	// Handle name inputs
	const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, firstName: e.target.value }));
	};

	const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, lastName: e.target.value }));
	};

	// Handle address inputs
	const handleAddressChange = (field: keyof Address) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({
				...prev,
				address: {
					...prev.address,
					[field]: e.target.value,
				},
			}));
		};
	};

	// Handle spouse question response
	const handleHasSpouse = (hasSpouse: boolean) => {
		setFormData((prev) => ({ ...prev, hasSpouse }));

		if (hasSpouse) {
			// Open the spouse dialog if they have a spouse
			setSpouseDialogOpen(true);
		} else {
			// Move to the next question if they don't have a spouse
			setCurrentQuestion("hasChildren");
		}
	};

	// Handle spouse data from dialog
	const handleSpouseData = (spouseData: SpouseData) => {
		setFormData((prev) => ({ ...prev, spouse: spouseData }));
		// Move to the next question after spouse data is collected
		setCurrentQuestion("hasChildren");
	};

	// Handle child form changes
	const handleChildFormChange =
		(field: keyof Child) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setChildForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	// Handle adding/editing child
	const handleSaveChild = () => {
		if (!childForm.firstName || !childForm.lastName) {
			return;
		}

		if (editingChild) {
			// Update existing child
			setFormData((prev) => ({
				...prev,
				children: prev.children.map((child) =>
					child.id === editingChild.id ? childForm : child
				),
			}));
		} else {
			// Add new child
			setFormData((prev) => ({
				...prev,
				children: [...prev.children, { ...childForm, id: crypto.randomUUID() }],
			}));
		}

		// Reset form and close dialog
		setChildForm({
			id: "",
			firstName: "",
			lastName: "",
			requiresGuardian: false,
		});
		setEditingChild(null);
		setChildDialogOpen(false);
	};

	// Handle editing child
	const handleEditChild = (child: Child) => {
		setChildForm(child);
		setEditingChild(child);
		setChildDialogOpen(true);
	};

	// Handle removing child
	const handleRemoveChild = (childId: string) => {
		setFormData((prev) => ({
			...prev,
			children: prev.children.filter((child) => child.id !== childId),
		}));
	};

	// Handle has children response
	const handleHasChildren = (hasChildren: boolean) => {
		if (!hasChildren && formData.hasChildren && formData.children.length > 0) {
			// If changing from having children to no children, show confirmation
			setConfirmNoChildrenOpen(true);
		} else {
			// Otherwise proceed normally
			setFormData((prev) => ({ ...prev, hasChildren }));
			if (!hasChildren) {
				setCurrentQuestion("hasAssets");
			}
		}
	};

	// Handle confirmation of no children
	const handleConfirmNoChildren = () => {
		setFormData((prev) => ({
			...prev,
			hasChildren: false,
			children: [], // Clear children data
		}));
		setConfirmNoChildrenOpen(false);
		setCurrentQuestion("hasAssets");
	};

	// Handle guardian form changes
	const handleGuardianFormChange =
		(field: keyof Guardian) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setGuardianForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	// Handle adding/editing guardian
	const handleSaveGuardian = () => {
		if (
			!guardianForm.firstName ||
			!guardianForm.lastName ||
			!guardianForm.relationship
		) {
			return;
		}

		// If this is a primary guardian, ensure no other primary exists
		if (guardianForm.isPrimary) {
			setFormData((prev) => ({
				...prev,
				guardians: prev.guardians.map((g) => ({
					...g,
					isPrimary: false,
				})),
			}));
		}

		if (editingGuardian) {
			// Update existing guardian
			setFormData((prev) => ({
				...prev,
				guardians: prev.guardians.map((guardian) =>
					guardian.id === editingGuardian.id ? guardianForm : guardian
				),
			}));
		} else {
			// Add new guardian
			setFormData((prev) => ({
				...prev,
				guardians: [
					...prev.guardians,
					{ ...guardianForm, id: crypto.randomUUID() },
				],
			}));
		}

		// Reset form and close dialog
		setGuardianForm({
			id: "",
			firstName: "",
			lastName: "",
			relationship: "",
			isPrimary: false,
		});
		setEditingGuardian(null);
		setGuardianDialogOpen(false);
	};

	// Handle editing guardian
	const handleEditGuardian = (guardian: Guardian) => {
		setGuardianForm(guardian);
		setEditingGuardian(guardian);
		setGuardianDialogOpen(true);
	};

	// Handle removing guardian
	const handleRemoveGuardian = (guardianId: string) => {
		setFormData((prev) => ({
			...prev,
			guardians: prev.guardians.filter(
				(guardian) => guardian.id !== guardianId
			),
		}));
	};

	// Check if guardians are needed
	const needsGuardians = () => {
		return formData.children.some((child) => child.requiresGuardian);
	};

	// Check if guardians are valid
	const areGuardiansValid = () => {
		if (!needsGuardians()) return true;
		return (
			formData.guardians.some((g) => g.isPrimary) &&
			formData.guardians.length >= 2
		);
	};

	// Handle moving to the next question for simple inputs
	const handleNext = () => {
		if (currentQuestion === "name") {
			if (
				formData.firstName.trim().length < 2 ||
				formData.lastName.trim().length < 2
			) {
				return;
			}
			setCurrentQuestion("address");
		} else if (currentQuestion === "address") {
			if (!isAddressValid()) {
				return;
			}
			setCurrentQuestion("hasSpouse");
		} else if (currentQuestion === "hasChildren") {
			// Check if we need to go to guardians step
			if (needsGuardians()) {
				setCurrentQuestion("guardians");
			} else {
				setCurrentQuestion("hasAssets");
			}
		}
	};

	// Helper function to check if address is valid
	const isAddressValid = () => {
		const { street, city, province, zipCode, country } = formData.address;
		return (
			street.trim().length >= 3 &&
			city.trim().length >= 2 &&
			province.trim().length >= 2 &&
			zipCode.trim().length >= 3 &&
			country.trim().length >= 2
		);
	};

	// Helper function to format address
	const formatAddress = (address: Address): string => {
		return `${address.street}, ${address.city}, ${address.province} ${address.zipCode}, ${address.country}`;
	};

	// Add handler for going back
	const handleBack = () => {
		switch (currentQuestion) {
			case "address":
				setCurrentQuestion("name");
				break;
			case "hasSpouse":
				setCurrentQuestion("address");
				break;
			case "hasChildren":
				setCurrentQuestion("hasSpouse");
				break;
			case "guardians":
				setCurrentQuestion("hasChildren");
				break;
			case "hasAssets":
				setCurrentQuestion(needsGuardians() ? "guardians" : "hasChildren");
				break;
			default:
				break;
		}
	};

	// Handle asset form changes
	const handleAssetFormChange =
		(field: keyof Asset) =>
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

	// Handle distribution type change
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

	// Handle beneficiary percentage change
	const handleBeneficiaryPercentageChange = (
		beneficiaryId: string,
		percentage: number
	) => {
		setAssetForm((prev) => ({
			...prev,
			beneficiaries: prev.beneficiaries.map((b) =>
				b.id === beneficiaryId ? { ...b, percentage } : b
			),
		}));
	};

	// Handle adding/editing asset
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
			setFormData((prev) => ({
				...prev,
				assets: prev.assets.map((asset) =>
					asset.id === editingAsset.id ? assetForm : asset
				),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				assets: [...prev.assets, { ...assetForm, id: crypto.randomUUID() }],
			}));
		}

		// Reset form and close dialog
		setAssetForm({
			id: "",
			type: "Property" as AssetType,
			description: "",
			distributionType: "equal",
			beneficiaries: [],
		});
		setEditingAsset(null);
		setAssetDialogOpen(false);
	};

	// Handle editing asset
	const handleEditAsset = (asset: Asset) => {
		setAssetForm(asset);
		setEditingAsset(asset);
		setAssetDialogOpen(true);
	};

	// Handle removing asset
	const handleRemoveAsset = (assetId: string) => {
		setFormData((prev) => ({
			...prev,
			assets: prev.assets.filter((asset) => asset.id !== assetId),
		}));
	};

	// Add these handlers after the other handlers
	const handleNewBeneficiaryFormChange =
		(field: keyof NewBeneficiary) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setNewBeneficiaryForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleAddBeneficiary = () => {
		setBeneficiaryType("existing");
		setBeneficiaryDialogOpen(true);
	};

	const handleSaveNewBeneficiary = () => {
		if (
			!newBeneficiaryForm.firstName ||
			!newBeneficiaryForm.lastName ||
			!newBeneficiaryForm.relationship
		) {
			return;
		}

		const newId = crypto.randomUUID();
		setAssetForm((prev) => ({
			...prev,
			beneficiaries: [
				...prev.beneficiaries,
				{
					id: newId,
					percentage: prev.distributionType === "percentage" ? 0 : undefined,
				},
			],
		}));

		// Add the new beneficiary to a separate list in formData
		setFormData((prev) => ({
			...prev,
			otherBeneficiaries: [
				...(prev.otherBeneficiaries || []),
				{ ...newBeneficiaryForm, id: newId },
			],
		}));

		// Reset form and close dialog
		setNewBeneficiaryForm({
			id: "",
			firstName: "",
			lastName: "",
			relationship: "",
		});
		setBeneficiaryDialogOpen(false);
	};

	// Update the getBeneficiaryName function to include other beneficiaries
	const getBeneficiaryName = (
		beneficiaryId: string,
		spouse: SpouseData | undefined,
		children: Child[],
		otherBeneficiaries?: NewBeneficiary[]
	) => {
		if (beneficiaryId === "spouse" && spouse) {
			return spouse.fullName;
		}
		const child = children.find((c) => c.id === beneficiaryId);
		if (child) {
			return `${child.firstName} ${child.lastName}`;
		}
		const otherBeneficiary = otherBeneficiaries?.find(
			(b) => b.id === beneficiaryId
		);
		if (otherBeneficiary) {
			return `${otherBeneficiary.firstName} ${otherBeneficiary.lastName} (${otherBeneficiary.relationship})`;
		}
		return "";
	};

	// Handle removing beneficiary
	const handleRemoveBeneficiary = (beneficiaryId: string) => {
		setAssetForm((prev) => ({
			...prev,
			beneficiaries: prev.beneficiaries.filter((b) => b.id !== beneficiaryId),
		}));
	};

	// Render different content based on current question
	const renderQuestion = () => {
		switch (currentQuestion) {
			case "name":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							What is your full name?
						</div>
						<div className="text-muted-foreground">
							We'll use this as the legal name in your will.
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={handleFirstNameChange}
									placeholder="John"
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={handleLastNameChange}
									placeholder="Doe"
									className="w-full"
								/>
							</div>
						</div>
						<div className="flex justify-end">
							<Button
								onClick={handleNext}
								disabled={
									formData.firstName.trim().length < 2 ||
									formData.lastName.trim().length < 2
								}
								className="cursor-pointer"
							>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				);

			case "address":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							What is your current address?
						</div>
						<div className="text-muted-foreground">
							Please provide your full residential address as it appears on
							official documents.
						</div>
						<div className="space-y-4 max-w-md">
							<div className="space-y-2">
								<Label htmlFor="street">Street Address</Label>
								<Input
									id="street"
									value={formData.address.street}
									onChange={handleAddressChange("street")}
									placeholder="123 Main Street"
									className="w-full"
								/>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										value={formData.address.city}
										onChange={handleAddressChange("city")}
										placeholder="Toronto"
										className="w-full"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="zipCode">Postal/ZIP Code</Label>
									<Input
										id="zipCode"
										value={formData.address.zipCode}
										onChange={handleAddressChange("zipCode")}
										placeholder="M5V 2H1"
										className="w-full"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="province">Province/State</Label>
									<Input
										id="province"
										value={formData.address.province}
										onChange={handleAddressChange("province")}
										placeholder="Ontario"
										className="w-full"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="country">Country</Label>
									<Input
										id="country"
										value={formData.address.country}
										onChange={handleAddressChange("country")}
										placeholder="Canada"
										className="w-full"
									/>
								</div>
							</div>
						</div>
						<div className="flex justify-between pt-4">
							<Button
								variant="outline"
								onClick={handleBack}
								className="cursor-pointer"
							>
								<ArrowLeft className="mr-2 h-4 w-4" /> Back
							</Button>
							<Button
								onClick={handleNext}
								disabled={!isAddressValid()}
								className="cursor-pointer"
							>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				);

			case "hasSpouse":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							Are you married or in a legally recognized civil relationship?
						</div>
						<div className="text-muted-foreground">
							If you are, we'll need some information about your partner.
						</div>
						<div className="flex space-x-4 mt-4">
							<Button
								variant="outline"
								onClick={() => handleHasSpouse(false)}
								className="cursor-pointer"
							>
								No
							</Button>
							<Button
								variant="default"
								onClick={() => handleHasSpouse(true)}
								className="cursor-pointer"
							>
								Yes
							</Button>
						</div>
						<div className="flex justify-between mt-6">
							<Button
								variant="outline"
								onClick={handleBack}
								className="cursor-pointer"
							>
								<ArrowLeft className="mr-2 h-4 w-4" /> Back
							</Button>
							<Button
								onClick={() => setCurrentQuestion("hasChildren")}
								className="cursor-pointer"
							>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				);

			case "hasChildren":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">Do you have children?</div>
						<div className="text-muted-foreground">
							This information helps us create the appropriate provisions in
							your will, especially regarding guardianship for minor children.
						</div>
						{!formData.hasChildren ? (
							<>
								<div className="flex space-x-4 mt-4">
									<Button
										variant="outline"
										onClick={() => handleHasChildren(false)}
										className="cursor-pointer"
									>
										No
									</Button>
									<Button
										variant="default"
										onClick={() => handleHasChildren(true)}
										className="cursor-pointer"
									>
										Yes
									</Button>
								</div>
								<div className="flex justify-end mt-6">
									<Button
										variant="outline"
										onClick={handleBack}
										className="cursor-pointer"
									>
										<ArrowLeft className="mr-2 h-4 w-4" /> Back
									</Button>
								</div>
							</>
						) : (
							<div className="space-y-6 mt-6">
								<div className="flex justify-between items-center">
									<h3 className="text-lg font-medium">Your Children</h3>
									<Dialog
										open={childDialogOpen}
										onOpenChange={setChildDialogOpen}
									>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												onClick={() => {
													setChildForm({
														id: "",
														firstName: "",
														lastName: "",
														requiresGuardian: false,
													});
													setEditingChild(null);
												}}
												className="cursor-pointer"
											>
												<Plus className="mr-2 h-4 w-4" />
												Add Child
											</Button>
										</DialogTrigger>
										<DialogContent className="bg-white">
											<DialogHeader>
												<DialogTitle>
													{editingChild ? "Edit Child" : "Add Child"}
												</DialogTitle>
											</DialogHeader>
											<div className="space-y-4 py-4">
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label htmlFor="childFirstName">First Name</Label>
														<Input
															id="childFirstName"
															value={childForm.firstName}
															onChange={handleChildFormChange("firstName")}
															placeholder="John"
														/>
													</div>
													<div className="space-y-2">
														<Label htmlFor="childLastName">Last Name</Label>
														<Input
															id="childLastName"
															value={childForm.lastName}
															onChange={handleChildFormChange("lastName")}
															placeholder="Doe"
														/>
													</div>
												</div>
												<div className="space-y-2">
													<div className="flex items-center space-x-2">
														<input
															type="checkbox"
															id="requiresGuardian"
															checked={childForm.requiresGuardian}
															onChange={(e) =>
																setChildForm((prev) => ({
																	...prev,
																	requiresGuardian: e.target.checked,
																}))
															}
															className="h-4 w-4 rounded border-gray-300"
														/>
														<Label
															htmlFor="requiresGuardian"
															className="text-sm"
														>
															This child is a minor or requires a legal guardian
														</Label>
													</div>
													<p className="text-sm text-muted-foreground mt-1">
														This will help us include appropriate guardianship
														provisions in your will.
													</p>
												</div>
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														onClick={() => setChildDialogOpen(false)}
														className="cursor-pointer"
													>
														Cancel
													</Button>
													<Button
														onClick={handleSaveChild}
														className="cursor-pointer"
													>
														Save
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</div>

								{formData.children.length === 0 ? (
									<p className="text-muted-foreground text-center py-4">
										No children added yet. Click "Add Child" to add your
										children.
									</p>
								) : (
									<div className="space-y-4">
										{formData.children.map((child) => (
											<Card key={child.id}>
												<CardContent className="p-4">
													<div className="flex justify-between items-center">
														<div>
															<p className="font-medium">
																{child.firstName} {child.lastName}
															</p>
															<p className="text-sm text-muted-foreground">
																{child.requiresGuardian
																	? "Requires legal guardian"
																	: "Adult (no guardian required)"}
															</p>
														</div>
														<div className="flex space-x-2">
															<Button
																variant="ghost"
																size="icon"
																onClick={() => handleEditChild(child)}
																className="cursor-pointer"
															>
																<Edit2 className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="icon"
																onClick={() => handleRemoveChild(child.id)}
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

								<div className="flex justify-between pt-4">
									<Button
										variant="outline"
										onClick={handleBack}
										className="cursor-pointer"
									>
										<ArrowLeft className="mr-2 h-4 w-4" /> Back
									</Button>
									<div className="flex space-x-4">
										<Button
											variant="outline"
											onClick={() => handleHasChildren(false)}
											className="cursor-pointer"
										>
											No Children
										</Button>
										<Button
											onClick={handleNext}
											disabled={formData.children.length === 0}
											className="cursor-pointer"
										>
											Next <ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						)}

						{/* Add confirmation dialog */}
						<Dialog
							open={confirmNoChildrenOpen}
							onOpenChange={setConfirmNoChildrenOpen}
						>
							<DialogContent className="bg-white">
								<DialogHeader>
									<DialogTitle>Remove Children Information?</DialogTitle>
									<DialogDescription>
										You have added {formData.children.length} child
										{formData.children.length !== 1 ? "ren" : ""} to your will.
										If you proceed, all children information will be removed.
										This action cannot be undone.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter className="flex space-x-2 justify-end mt-4">
									<Button
										variant="outline"
										onClick={() => setConfirmNoChildrenOpen(false)}
										className="cursor-pointer"
									>
										Cancel
									</Button>
									<Button
										variant="destructive"
										onClick={handleConfirmNoChildren}
										className="cursor-pointer"
									>
										Remove Children Information
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				);

			case "guardians":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							Guardians for Your Children
						</div>
						<div className="text-muted-foreground">
							Since you have children who require guardians, please specify who
							you would like to appoint as guardians in your will. You have to
							appoint at least two guardians (a primary and a backup) in case
							the primary guardian is unable to serve.
						</div>
						<div className="space-y-6 mt-6">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Appointed Guardians</h3>
								<Dialog
									open={guardianDialogOpen}
									onOpenChange={setGuardianDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											onClick={() => {
												setGuardianForm({
													id: "",
													firstName: "",
													lastName: "",
													relationship: "",
													isPrimary: false,
												});
												setEditingGuardian(null);
											}}
											className="cursor-pointer"
										>
											<Plus className="mr-2 h-4 w-4" />
											Add Guardian
										</Button>
									</DialogTrigger>
									<DialogContent className="bg-white">
										<DialogHeader>
											<DialogTitle>
												{editingGuardian ? "Edit Guardian" : "Add Guardian"}
											</DialogTitle>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="guardianFirstName">First Name</Label>
													<Input
														id="guardianFirstName"
														value={guardianForm.firstName}
														onChange={handleGuardianFormChange("firstName")}
														placeholder="John"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="guardianLastName">Last Name</Label>
													<Input
														id="guardianLastName"
														value={guardianForm.lastName}
														onChange={handleGuardianFormChange("lastName")}
														placeholder="Doe"
													/>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="guardianRelationship">
													Relationship to You
												</Label>
												<Input
													id="guardianRelationship"
													value={guardianForm.relationship}
													onChange={handleGuardianFormChange("relationship")}
													placeholder="e.g., Brother, Sister, Close Friend"
												/>
											</div>
											<div className="flex items-center space-x-2">
												<input
													type="checkbox"
													id="isPrimary"
													checked={guardianForm.isPrimary}
													onChange={(e) =>
														setGuardianForm((prev) => ({
															...prev,
															isPrimary: e.target.checked,
														}))
													}
													className="h-4 w-4 rounded border-gray-300"
												/>
												<Label htmlFor="isPrimary" className="text-sm">
													Appoint as Primary Guardian
												</Label>
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													variant="outline"
													onClick={() => setGuardianDialogOpen(false)}
													className="cursor-pointer"
												>
													Cancel
												</Button>
												<Button
													onClick={handleSaveGuardian}
													className="cursor-pointer"
												>
													Save
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>

							{formData.guardians.length === 0 ? (
								<p className="text-muted-foreground text-center py-4">
									No guardians added yet. Click "Add Guardian" to appoint
									guardians for your children.
								</p>
							) : (
								<div className="space-y-4">
									{formData.guardians.map((guardian) => (
										<Card key={guardian.id}>
											<CardContent className="p-4">
												<div className="flex justify-between items-center">
													<div>
														<p className="font-medium">
															{guardian.firstName} {guardian.lastName}
															{guardian.isPrimary && (
																<span className="ml-2 text-sm text-primary">
																	(Primary Guardian)
																</span>
															)}
														</p>
														<p className="text-sm text-muted-foreground">
															{guardian.relationship}
														</p>
													</div>
													<div className="flex space-x-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleEditGuardian(guardian)}
															className="cursor-pointer"
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleRemoveGuardian(guardian.id)}
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

							<div className="flex justify-between pt-4">
								<Button
									variant="outline"
									onClick={handleBack}
									className="cursor-pointer"
								>
									<ArrowLeft className="mr-2 h-4 w-4" /> Back
								</Button>
								<Button
									onClick={() => setCurrentQuestion("hasAssets")}
									disabled={!areGuardiansValid()}
									className="cursor-pointer"
								>
									Next <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				);

			case "hasAssets":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							Share your assets among your loved ones
						</div>
						<div className="text-muted-foreground">
							Add your assets and specify how you'd like them to be distributed
							among your beneficiaries.
						</div>
						<div className="text-muted-foreground">
							Do not include cash gifts in this section.
						</div>
						<div className="space-y-6 mt-6">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Your Assets</h3>
								<Dialog
									open={assetDialogOpen}
									onOpenChange={setAssetDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											onClick={() => {
												// Initialize beneficiaries based on current family members
												const beneficiaries = [];
												if (formData.hasSpouse && formData.spouse) {
													beneficiaries.push({
														id: "spouse",
														percentage: undefined,
													});
												}
												formData.children.forEach((child) => {
													beneficiaries.push({
														id: child.id,
														percentage: undefined,
													});
												});

												setAssetForm({
													id: "",
													type: "Property" as AssetType,
													description: "",
													distributionType: "equal",
													beneficiaries,
												});
												setEditingAsset(null);
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
																? "outline"
																: "default"
														}
														onClick={() =>
															handleDistributionTypeChange("equal")
														}
														className="cursor-pointer"
													>
														Equal Distribution
													</Button>
													<Button
														variant={
															assetForm.distributionType === "percentage"
																? "outline"
																: "default"
														}
														onClick={() =>
															handleDistributionTypeChange("percentage")
														}
														className="cursor-pointer"
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
														onClick={handleAddBeneficiary}
														className="cursor-pointer"
													>
														<Plus className="h-4 w-4 mr-1" />
														Add Beneficiary
													</Button>
												</div>
												<div className="space-y-2">
													{assetForm.beneficiaries.map((beneficiary) => {
														const name = getBeneficiaryName(
															beneficiary.id,
															formData.spouse,
															formData.children,
															formData.otherBeneficiaries
														);
														const isSpouse = beneficiary.id === "spouse";

														if (!name) return null;

														return (
															<div
																key={beneficiary.id}
																className="flex items-center justify-between p-2 border rounded-md"
															>
																<div className="flex items-center space-x-2">
																	<span className="font-medium">{name}</span>
																	{isSpouse && (
																		<span className="text-sm text-muted-foreground">
																			(Spouse)
																		</span>
																	)}
																</div>
																<div className="flex items-center space-x-2">
																	{assetForm.distributionType ===
																		"percentage" && (
																		<div className="flex items-center space-x-2">
																			<Input
																				type="number"
																				value={beneficiary.percentage || 0}
																				onChange={(e) =>
																					handleBeneficiaryPercentageChange(
																						beneficiary.id,
																						Number(e.target.value)
																					)
																				}
																				className="w-24"
																				min="0"
																				max="100"
																			/>
																			<span>%</span>
																		</div>
																	)}
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={() =>
																			handleRemoveBeneficiary(beneficiary.id)
																		}
																		className="cursor-pointer"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</div>
															</div>
														);
													})}
												</div>
												{assetForm.distributionType === "percentage" && (
													<div className="text-sm text-muted-foreground mt-2">
														Total:{" "}
														{assetForm.beneficiaries.reduce(
															(sum, b) => sum + (b.percentage || 0),
															0
														)}
														%
													</div>
												)}
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													variant="outline"
													onClick={() => setAssetDialogOpen(false)}
													className="cursor-pointer"
												>
													Cancel
												</Button>
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
													className="cursor-pointer"
												>
													Save
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>

							{formData.assets.length === 0 ? (
								<p className="text-muted-foreground text-center py-4">
									No assets added yet. Click "Add Asset" to add your assets.
								</p>
							) : (
								<div className="space-y-4">
									{formData.assets.map((asset) => (
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
															<p className="text-sm font-medium">
																Distribution:
															</p>
															<ul className="text-sm text-muted-foreground list-disc list-inside">
																{asset.beneficiaries.map((beneficiary) => {
																	const name = getBeneficiaryName(
																		beneficiary.id,
																		formData.spouse,
																		formData.children,
																		formData.otherBeneficiaries
																	);

																	if (!name) return null;

																	return (
																		<li key={beneficiary.id}>
																			{name}
																			{asset.distributionType ===
																				"percentage" &&
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

							<div className="flex justify-between pt-4">
								<Button
									variant="outline"
									onClick={handleBack}
									className="cursor-pointer"
								>
									<ArrowLeft className="mr-2 h-4 w-4" /> Back
								</Button>
								<Button
									onClick={() => setCurrentQuestion("finished")}
									className="cursor-pointer"
								>
									Next <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				);

			case "finished":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold text-green-600">
							Thank you!
						</div>
						<div className="text-lg">
							We've collected the initial information for your will.
						</div>
						<div>
							<p className="text-muted-foreground">
								Summary of your information:
							</p>
							<ul className="mt-2 space-y-2">
								<li>
									<strong>Name:</strong> {formData.firstName}{" "}
									{formData.lastName}
								</li>
								<li>
									<strong>Address:</strong> {formatAddress(formData.address)}
								</li>
								<li>
									<strong>Marital Status:</strong>{" "}
									{formData.hasSpouse ? "Married" : "Not Married"}
								</li>
								{formData.spouse && (
									<li>
										<strong>Spouse:</strong> {formData.spouse.fullName}
									</li>
								)}
								<li>
									<strong>Children:</strong>{" "}
									{formData.hasChildren
										? formData.children.length > 0
											? formData.children
													.map(
														(child) =>
															`${child.firstName} ${child.lastName} (${
																child.requiresGuardian
																	? "requires guardian"
																	: "adult"
															})`
													)
													.join(", ")
											: "None added"
										: "None"}
								</li>
								{needsGuardians() && formData.guardians.length > 0 && (
									<li>
										<strong>Appointed Guardians:</strong>{" "}
										{formData.guardians
											.map(
												(guardian) =>
													`${guardian.firstName} ${guardian.lastName} (${
														guardian.relationship
													})${guardian.isPrimary ? " - Primary" : ""}`
											)
											.join(", ")}
									</li>
								)}
								{formData.assets.length > 0 && (
									<li>
										<strong>Assets:</strong>
										<ul className="mt-2 space-y-2 list-disc list-inside">
											{formData.assets.map((asset) => {
												const assetType = ASSET_TYPES.find(
													(t) => t.value === asset.type
												);
												return (
													<li key={asset.id} className="text-sm">
														<div className="flex items-center space-x-2">
															{assetType && (
																<assetType.icon className="h-4 w-4 text-muted-foreground" />
															)}
															<span>{asset.type}</span>
														</div>
														<ul className="ml-4 list-disc list-inside text-muted-foreground">
															{asset.beneficiaries.map((beneficiary) => {
																const name = getBeneficiaryName(
																	beneficiary.id,
																	formData.spouse,
																	formData.children,
																	formData.otherBeneficiaries
																);

																if (!name) return null;

																return (
																	<li key={beneficiary.id}>
																		{name}
																		{asset.distributionType === "percentage" &&
																			` (${beneficiary.percentage}%)`}
																	</li>
																);
															})}
														</ul>
													</li>
												);
											})}
										</ul>
									</li>
								)}
							</ul>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	// Track progress
	const totalQuestions = 6;
	const progress = (() => {
		switch (currentQuestion) {
			case "name":
				return 1;
			case "address":
				return 2;
			case "hasSpouse":
				return 3;
			case "hasChildren":
				return 4;
			case "guardians":
				return 5;
			case "hasAssets":
				return 6;
			case "finished":
				return 6;
			default:
				return 1;
		}
	})();

	const progressPercent = (progress / totalQuestions) * 100;

	return (
		<div className="container mx-auto py-8">
			<Card className="max-w-3xl mx-auto">
				<CardHeader>
					<CardTitle>Create Your Will</CardTitle>
					{/* Progress bar */}
					<div className="w-full bg-muted h-2 rounded-full mt-4">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
					<div className="text-xs text-muted-foreground mt-1">
						Question {progress} of {totalQuestions}
					</div>
				</CardHeader>
				<CardContent className="pt-6">{renderQuestion()}</CardContent>
			</Card>

			{/* Only render dialog after component is mounted */}
			{mounted && (
				<SpouseDialog
					open={spouseDialogOpen}
					onOpenChange={setSpouseDialogOpen}
					onSave={handleSpouseData}
				/>
			)}

			{/* Add the beneficiary selection dialog after the asset dialog */}
			<Dialog
				open={beneficiaryDialogOpen}
				onOpenChange={setBeneficiaryDialogOpen}
			>
				<DialogContent className="bg-white">
					<DialogHeader>
						<DialogTitle>Add Beneficiary</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="flex space-x-4 mb-4">
							<Button
								variant={beneficiaryType === "existing" ? "outline" : "default"}
								onClick={() => setBeneficiaryType("existing")}
								className="cursor-pointer"
							>
								Select Existing Beneficiary
							</Button>
							<Button
								variant={beneficiaryType === "new" ? "outline" : "default"}
								onClick={() => setBeneficiaryType("new")}
								className="cursor-pointer"
							>
								Add New Beneficiary
							</Button>
						</div>

						{beneficiaryType === "existing" ? (
							<div className="space-y-2">
								<Label>Select Beneficiary</Label>
								<div className="space-y-2 max-h-[300px] overflow-y-auto">
									{formData.hasSpouse &&
										formData.spouse &&
										!assetForm.beneficiaries.some((b) => b.id === "spouse") && (
											<div
												className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
												onClick={() => {
													setAssetForm((prev) => ({
														...prev,
														beneficiaries: [
															...prev.beneficiaries,
															{
																id: "spouse",
																percentage:
																	prev.distributionType === "percentage"
																		? 0
																		: undefined,
															},
														],
													}));
													setBeneficiaryDialogOpen(false);
												}}
											>
												<div>
													<span className="font-medium">
														{formData.spouse.fullName}
													</span>
													<span className="text-sm text-muted-foreground ml-2">
														(Spouse)
													</span>
												</div>
											</div>
										)}
									{formData.children
										.filter(
											(child) =>
												!assetForm.beneficiaries.some((b) => b.id === child.id)
										)
										.map((child) => (
											<div
												key={child.id}
												className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
												onClick={() => {
													setAssetForm((prev) => ({
														...prev,
														beneficiaries: [
															...prev.beneficiaries,
															{
																id: child.id,
																percentage:
																	prev.distributionType === "percentage"
																		? 0
																		: undefined,
															},
														],
													}));
													setBeneficiaryDialogOpen(false);
												}}
											>
												<div>
													<span className="font-medium">
														{child.firstName} {child.lastName}
													</span>
													<span className="text-sm text-muted-foreground ml-2">
														(Child)
													</span>
												</div>
											</div>
										))}
									{formData.otherBeneficiaries
										?.filter(
											(beneficiary) =>
												!assetForm.beneficiaries.some(
													(b) => b.id === beneficiary.id
												)
										)
										.map((beneficiary) => (
											<div
												key={beneficiary.id}
												className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
												onClick={() => {
													setAssetForm((prev) => ({
														...prev,
														beneficiaries: [
															...prev.beneficiaries,
															{
																id: beneficiary.id,
																percentage:
																	prev.distributionType === "percentage"
																		? 0
																		: undefined,
															},
														],
													}));
													setBeneficiaryDialogOpen(false);
												}}
											>
												<div>
													<span className="font-medium">
														{beneficiary.firstName} {beneficiary.lastName}
													</span>
													<span className="text-sm text-muted-foreground ml-2">
														({beneficiary.relationship})
													</span>
												</div>
											</div>
										))}
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="beneficiaryFirstName">First Name</Label>
										<Input
											id="beneficiaryFirstName"
											value={newBeneficiaryForm.firstName}
											onChange={handleNewBeneficiaryFormChange("firstName")}
											placeholder="John"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="beneficiaryLastName">Last Name</Label>
										<Input
											id="beneficiaryLastName"
											value={newBeneficiaryForm.lastName}
											onChange={handleNewBeneficiaryFormChange("lastName")}
											placeholder="Doe"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="beneficiaryRelationship">Relationship</Label>
									<Input
										id="beneficiaryRelationship"
										value={newBeneficiaryForm.relationship}
										onChange={handleNewBeneficiaryFormChange("relationship")}
										placeholder="e.g., Niece, Nephew, Friend"
									/>
								</div>
							</div>
						)}
						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => setBeneficiaryDialogOpen(false)}
								className="cursor-pointer"
							>
								Cancel
							</Button>
							{beneficiaryType === "new" && (
								<Button
									onClick={handleSaveNewBeneficiary}
									disabled={
										!newBeneficiaryForm.firstName ||
										!newBeneficiaryForm.lastName ||
										!newBeneficiaryForm.relationship
									}
									className="cursor-pointer"
								>
									Add Beneficiary
								</Button>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
