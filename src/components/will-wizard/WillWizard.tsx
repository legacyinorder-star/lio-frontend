import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SpouseDialog, { SpouseData } from "./SpouseDialog";
import { ArrowRight, Plus, Trash2, Edit2, ArrowLeft, Save } from "lucide-react";
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
import ReviewStep, { ReviewStepHandle } from "./steps/ReviewStep";

// Define the different question types
type QuestionType =
	| "name"
	| "address"
	| "hasSpouse"
	| "hasChildren"
	| "guardians"
	| "hasAssets"
	| "gifts"
	| "executors"
	| "witnesses"
	| "review";

// Define the address type
interface Address {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

// Define child type
interface Child {
	id: `${string}-${string}-${string}-${string}-${string}`;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	requiresGuardian: boolean;
	guardian?: {
		firstName: string;
		lastName: string;
		relationship: string;
		phone: string;
		email: string;
		address: Address;
	};
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
	value: string;
}

// Add these interfaces after the other interfaces
interface NewBeneficiary {
	id: string;
	firstName: string;
	lastName: string;
	relationship: string;
	type: BeneficiaryType;
	organizationName?: string;
	registrationNumber?: string;
	email: string;
	phone: string;
	allocation: string;
}

// Add new type for gifts after the other type definitions
type GiftType = "Cash" | "Item" | "Other";

interface Gift {
	id: string;
	type: GiftType;
	description: string;
	value?: number;
	beneficiaryId: string;
}

// Add this type after the other type definitions
interface Executor {
	id: string;
	type: "individual" | "corporate";
	firstName?: string;
	lastName?: string;
	relationship?: string;
	companyName?: string;
	registrationNumber?: string;
	contactPerson?: string;
	isPrimary: boolean;
	address: Address;
	email: string;
	phone: string;
}

// Add Witness interface
interface Witness {
	id: string;
	firstName: string;
	lastName: string;
	address: Address;
}

// Define the form data structure
interface WillFormData {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	phone: string;
	address: Address;
	hasSpouse: boolean;
	spouse?: SpouseData;
	hasChildren: boolean;
	children: Child[];
	guardians: Guardian[];
	hasAssets: boolean;
	assets: Asset[];
	otherBeneficiaries: NewBeneficiary[];
	gifts: Gift[];
	executors: Executor[];
	witnesses: Witness[];
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

// Add this type definition after the other type definitions
type BeneficiaryType =
	| "spouse"
	| "child"
	| "guardian"
	| "other"
	| "charity"
	| "individual";

export default function WillWizard() {
	// Track the current question being shown
	const [currentQuestion, setCurrentQuestion] = useState<QuestionType>("name");

	// Data collection
	const [formData, setFormData] = useState<WillFormData>({
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		phone: "",
		address: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "",
		},
		hasSpouse: false,
		spouse: undefined,
		hasChildren: false,
		children: [],
		guardians: [],
		hasAssets: false,
		assets: [],
		otherBeneficiaries: [],
		gifts: [],
		executors: [],
		witnesses: [],
	});

	// For the spouse dialog
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);

	// Child dialog state
	const [childDialogOpen, setChildDialogOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<Child | null>(null);
	const [childForm, setChildForm] = useState<Omit<Child, "id">>({
		firstName: "",
		lastName: "",
		dateOfBirth: "",
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
		value: "",
	});

	// Add these state variables after the other state declarations
	const [beneficiaryDialogOpen, setBeneficiaryDialogOpen] = useState(false);
	const [newBeneficiaryForm, setNewBeneficiaryForm] = useState<NewBeneficiary>({
		id: "",
		type: "other",
		firstName: "",
		lastName: "",
		relationship: "",
		organizationName: "",
		registrationNumber: "",
		email: "",
		phone: "",
		allocation: "",
	});
	const [beneficiaryType, setBeneficiaryType] = useState<"existing" | "new">(
		"existing"
	);

	// Add state for gift dialog
	const [giftDialogOpen, setGiftDialogOpen] = useState(false);
	const [editingGift, setEditingGift] = useState<Gift | null>(null);
	const [giftForm, setGiftForm] = useState<Gift>({
		id: "",
		type: "Cash",
		description: "",
		value: undefined,
		beneficiaryId: "",
	});

	// Add executor dialog state
	const [executorDialogOpen, setExecutorDialogOpen] = useState(false);
	const [editingExecutor, setEditingExecutor] = useState<Executor | null>(null);
	const [executorForm, setExecutorForm] = useState<Executor>({
		id: "",
		type: "individual",
		firstName: "",
		lastName: "",
		relationship: "",
		companyName: "",
		registrationNumber: "",
		contactPerson: "",
		isPrimary: false,
		address: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "",
		},
		email: "",
		phone: "",
	});

	// Add witness dialog state
	const [witnessDialogOpen, setWitnessDialogOpen] = useState(false);
	const [editingWitness, setEditingWitness] = useState<Witness | null>(null);
	const [witnessForm, setWitnessForm] = useState<Witness>({
		id: "",
		firstName: "",
		lastName: "",
		address: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "",
		},
	});

	// Add witness conflict confirmation dialog state
	const [witnessConflictDialogOpen, setWitnessConflictDialogOpen] =
		useState(false);
	const [potentialConflict, setPotentialConflict] = useState<{
		witness: Witness;
		beneficiary: string;
	} | null>(null);

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
		(field: keyof Omit<Child, "id">) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setChildForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	// Handle adding/editing child
	const _addChild = () => {
		const newChild: Child = {
			id: crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`,
			...childForm,
		};
		setFormData((prev) => ({
			...prev,
			children: [...prev.children, newChild],
		}));
		setChildForm({
			firstName: "",
			lastName: "",
			dateOfBirth: "",
			requiresGuardian: false,
		});
	};

	// Handle editing child
	const editChild = (child: Child) => {
		setEditingChild(child);
		setChildForm({
			firstName: child.firstName,
			lastName: child.lastName,
			dateOfBirth: child.dateOfBirth,
			requiresGuardian: child.requiresGuardian,
			guardian: child.guardian,
		});
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
		} else if (currentQuestion === "hasAssets") {
			setCurrentQuestion("gifts");
		} else if (currentQuestion === "gifts") {
			setCurrentQuestion("executors");
		} else if (currentQuestion === "executors") {
			setCurrentQuestion("witnesses");
		} else if (currentQuestion === "witnesses") {
			setCurrentQuestion("review");
		}
	};

	// Helper function to check if address is valid
	const isAddressValid = (address?: Address) => {
		const addr = address || formData.address;
		return (
			addr.street.trim().length > 0 &&
			addr.city.trim().length > 0 &&
			addr.state.trim().length > 0 &&
			addr.zipCode.trim().length > 0
		);
	};

	// Helper function to format address
	const formatAddress = (address: Address): string => {
		return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
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
			case "gifts":
				setCurrentQuestion("hasAssets");
				break;
			case "executors":
				setCurrentQuestion("gifts");
				break;
			case "witnesses":
				setCurrentQuestion("executors");
				break;
			case "review":
				setCurrentQuestion("witnesses");
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
			value: "",
		});
		setEditingAsset(null);
		setAssetDialogOpen(false);
	};

	// Handle editing asset
	const handleEditAsset = (asset: Asset) => {
		// When editing, we want to keep the existing beneficiaries
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

	const handleAddBeneficiary = () => {
		setBeneficiaryType("existing");
		setBeneficiaryDialogOpen(true);
	};

	const handleSaveNewBeneficiary = () => {
		const newBeneficiary: NewBeneficiary = {
			id: crypto.randomUUID(),
			type: newBeneficiaryForm.type,
			firstName: newBeneficiaryForm.firstName,
			lastName: newBeneficiaryForm.lastName,
			relationship: newBeneficiaryForm.relationship,
			organizationName: newBeneficiaryForm.organizationName,
			registrationNumber: newBeneficiaryForm.registrationNumber,
			email: newBeneficiaryForm.email,
			phone: newBeneficiaryForm.phone,
			allocation: newBeneficiaryForm.allocation,
		};

		setFormData((prev) => ({
			...prev,
			otherBeneficiaries: [...(prev.otherBeneficiaries || []), newBeneficiary],
		}));

		setNewBeneficiaryForm({
			id: "",
			type: "other",
			firstName: "",
			lastName: "",
			relationship: "",
			organizationName: "",
			registrationNumber: "",
			email: "",
			phone: "",
			allocation: "",
		});

		setBeneficiaryType("existing");
	};

	// Update the getBeneficiaryName function to include guardians and charities
	const getBeneficiaryName = (
		beneficiaryId: string,
		spouse: SpouseData | undefined,
		children: Child[],
		guardians: Guardian[],
		otherBeneficiaries?: NewBeneficiary[]
	) => {
		if (beneficiaryId === "spouse" && spouse) {
			return spouse.fullName;
		}
		const child = children.find((c) => c.id === beneficiaryId);
		if (child) {
			return `${child.firstName} ${child.lastName}`;
		}
		const guardian = guardians.find((g) => g.id === beneficiaryId);
		if (guardian) {
			return `${guardian.firstName} ${guardian.lastName} (Guardian)`;
		}
		const otherBeneficiary = otherBeneficiaries?.find(
			(b) => b.id === beneficiaryId
		);
		if (otherBeneficiary) {
			if (otherBeneficiary.type === "charity") {
				return `${otherBeneficiary.organizationName} (Charity)`;
			}
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

	// Handle gift form changes
	const handleGiftFormChange =
		(field: keyof Gift) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			>
		) => {
			setGiftForm((prev) => ({
				...prev,
				[field]: field === "value" ? Number(e.target.value) : e.target.value,
			}));
		};

	// Handle adding/editing gift
	const handleSaveGift = () => {
		if (!giftForm.description || !giftForm.beneficiaryId) {
			return;
		}

		if (editingGift) {
			setFormData((prev) => ({
				...prev,
				gifts: prev.gifts.map((gift) =>
					gift.id === editingGift.id ? giftForm : gift
				),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				gifts: [...prev.gifts, { ...giftForm, id: crypto.randomUUID() }],
			}));
		}

		// Reset form and close dialog
		setGiftForm({
			id: "",
			type: "Cash",
			description: "",
			value: undefined,
			beneficiaryId: "",
		});
		setEditingGift(null);
		setGiftDialogOpen(false);
	};

	const handleEditGift = (gift: Gift) => {
		setGiftForm(gift);
		setEditingGift(gift);
		setGiftDialogOpen(true);
	};

	const handleRemoveGift = (giftId: string) => {
		setFormData((prev) => ({
			...prev,
			gifts: prev.gifts.filter((gift) => gift.id !== giftId),
		}));
	};

	// Add executor form handlers
	const handleExecutorFormChange = (field: keyof Executor) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			setExecutorForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};
	};

	const handleExecutorAddressChange = (field: keyof Address) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			setExecutorForm((prev) => ({
				...prev,
				address: {
					...prev.address,
					[field]: e.target.value,
				},
			}));
		};
	};

	const handleSaveExecutor = () => {
		if (
			!executorForm.firstName ||
			!executorForm.lastName ||
			!executorForm.relationship ||
			!isAddressValid(executorForm.address)
		) {
			return;
		}

		// If this is a primary executor, ensure no other primary exists
		if (executorForm.isPrimary) {
			setFormData((prev) => ({
				...prev,
				executors: prev.executors.map((e) => ({
					...e,
					isPrimary: false,
				})),
			}));
		}

		if (editingExecutor) {
			setFormData((prev) => ({
				...prev,
				executors: prev.executors.map((executor) =>
					executor.id === editingExecutor.id ? executorForm : executor
				),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				executors: [
					...prev.executors,
					{ ...executorForm, id: crypto.randomUUID() },
				],
			}));
		}

		// Reset form and close dialog
		setExecutorForm({
			id: "",
			type: "individual",
			firstName: "",
			lastName: "",
			relationship: "",
			companyName: "",
			registrationNumber: "",
			contactPerson: "",
			isPrimary: false,
			address: {
				street: "",
				city: "",
				state: "",
				zipCode: "",
				country: "",
			},
			email: "",
			phone: "",
		});
		setEditingExecutor(null);
		setExecutorDialogOpen(false);
	};

	const handleEditExecutor = (executor: Executor) => {
		setExecutorForm(executor);
		setEditingExecutor(executor);
		setExecutorDialogOpen(true);
	};

	const handleRemoveExecutor = (executorId: string) => {
		setFormData((prev) => ({
			...prev,
			executors: prev.executors.filter(
				(executor) => executor.id !== executorId
			),
		}));
	};

	// Add witness form handlers
	const handleWitnessFormChange = (field: keyof Witness) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			setWitnessForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};
	};

	const handleWitnessAddressChange = (field: keyof Address) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			setWitnessForm((prev) => ({
				...prev,
				address: {
					...prev.address,
					[field]: e.target.value,
				},
			}));
		};
	};

	// Add function to check for beneficiary conflicts
	const checkWitnessConflict = (
		witness: Witness
	): { hasConflict: boolean; beneficiary: string } => {
		// Check spouse
		if (formData.hasSpouse && formData.spouse) {
			const spouseName = formData.spouse.fullName.toLowerCase();
			const witnessName =
				`${witness.firstName} ${witness.lastName}`.toLowerCase();
			if (spouseName === witnessName) {
				return { hasConflict: true, beneficiary: formData.spouse.fullName };
			}
		}

		// Check children
		for (const child of formData.children) {
			const childName = `${child.firstName} ${child.lastName}`.toLowerCase();
			const witnessName =
				`${witness.firstName} ${witness.lastName}`.toLowerCase();
			if (childName === witnessName) {
				return {
					hasConflict: true,
					beneficiary: `${child.firstName} ${child.lastName}`,
				};
			}
		}

		// Check other beneficiaries
		if (formData.otherBeneficiaries) {
			for (const beneficiary of formData.otherBeneficiaries) {
				if (beneficiary.type === "other") {
					const beneficiaryName =
						`${beneficiary.firstName} ${beneficiary.lastName}`.toLowerCase();
					const witnessName =
						`${witness.firstName} ${witness.lastName}`.toLowerCase();
					if (beneficiaryName === witnessName) {
						return {
							hasConflict: true,
							beneficiary: `${beneficiary.firstName} ${beneficiary.lastName}`,
						};
					}
				}
			}
		}

		return { hasConflict: false, beneficiary: "" };
	};

	// Add witness save handler
	const handleSaveWitness = () => {
		if (
			!witnessForm.firstName ||
			!witnessForm.lastName ||
			!isAddressValid(witnessForm.address)
		) {
			return;
		}

		const conflict = checkWitnessConflict(witnessForm);
		if (conflict.hasConflict) {
			setPotentialConflict({
				witness: witnessForm,
				beneficiary: conflict.beneficiary,
			});
			setWitnessConflictDialogOpen(true);
			return;
		}

		if (editingWitness) {
			setFormData((prev) => ({
				...prev,
				witnesses: prev.witnesses.map((witness) =>
					witness.id === editingWitness.id ? witnessForm : witness
				),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				witnesses: [
					...prev.witnesses,
					{ ...witnessForm, id: crypto.randomUUID() },
				],
			}));
		}

		// Reset form and close dialog
		setWitnessForm({
			id: "",
			firstName: "",
			lastName: "",
			address: {
				street: "",
				city: "",
				state: "",
				zipCode: "",
				country: "",
			},
		});
		setEditingWitness(null);
		setWitnessDialogOpen(false);
	};

	// Add witness edit handler
	const handleEditWitness = (witness: Witness) => {
		setWitnessForm(witness);
		setEditingWitness(witness);
		setWitnessDialogOpen(true);
	};

	// Add witness remove handler
	const handleRemoveWitness = (witnessId: string) => {
		setFormData((prev) => ({
			...prev,
			witnesses: prev.witnesses.filter((witness) => witness.id !== witnessId),
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
								className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
									<Label htmlFor="state">State/Province</Label>
									<Input
										id="state"
										value={formData.address.state}
										onChange={handleAddressChange("state")}
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
								className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
								className={`cursor-pointer ${
									!formData.hasSpouse
										? "bg-light-green text-black border-light-green"
										: ""
								}`}
							>
								No
							</Button>
							<Button
								variant="outline"
								onClick={() => handleHasSpouse(true)}
								className={`cursor-pointer ${
									formData.hasSpouse
										? "bg-light-green text-black border-light-green"
										: ""
								}`}
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
								className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
										className={`cursor-pointer ${
											!formData.hasChildren
												? "bg-light-green text-black border-light-green"
												: ""
										}`}
									>
										No
									</Button>
									<Button
										variant="outline"
										onClick={() => handleHasChildren(true)}
										className={`cursor-pointer ${
											formData.hasChildren
												? "bg-light-green text-black border-light-green"
												: ""
										}`}
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
														firstName: "",
														lastName: "",
														dateOfBirth: "",
														requiresGuardian: false,
													});
													setEditingChild(null);
												}}
												className="cursor-pointer"
												disabled={formData.children.length >= 5}
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
														<Checkbox
															id="requiresGuardian"
															checked={childForm.requiresGuardian}
															onCheckedChange={(checked: boolean) =>
																setChildForm((prev) => ({
																	...prev,
																	requiresGuardian: checked,
																}))
															}
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
														onClick={saveChild}
														className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
																onClick={() => editChild(child)}
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
											className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
											<DialogDescription>
												Add a legal guardian who will be responsible for your
												minor children in the event of your passing.
											</DialogDescription>
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
												<Checkbox
													id="isPrimary"
													checked={guardianForm.isPrimary}
													onCheckedChange={(checked: boolean) =>
														setGuardianForm((prev) => ({
															...prev,
															isPrimary: checked,
														}))
													}
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
													className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
									className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
												// Initialize beneficiaries with all existing beneficiaries
												const beneficiaries = [];

												// Add spouse if exists
												if (formData.hasSpouse && formData.spouse) {
													beneficiaries.push({
														id: "spouse",
														percentage: undefined,
													});
												}

												// Add all children
												formData.children.forEach((child) => {
													beneficiaries.push({
														id: child.id,
														percentage: undefined,
													});
												});

												// Add all other beneficiaries
												formData.otherBeneficiaries?.forEach((beneficiary) => {
													beneficiaries.push({
														id: beneficiary.id,
														percentage: undefined,
													});
												});

												setAssetForm({
													id: "",
													type: "Property" as AssetType,
													description: "",
													distributionType: "equal",
													beneficiaries,
													value: "",
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
																? "default"
																: "outline"
														}
														onClick={() =>
															handleDistributionTypeChange("equal")
														}
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
															formData.guardians,
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
													className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
																		formData.guardians,
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
									onClick={() => setCurrentQuestion("gifts")}
									className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
								>
									Next <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				);

			case "gifts":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							Specify any one-off gifts
						</div>
						<div className="text-muted-foreground">
							Add any specific gifts you'd like to leave to particular
							individuals. This could include cash gifts, personal items, or
							other specific bequests.
						</div>
						<div className="space-y-6 mt-6">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Your Gifts</h3>
								<Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											onClick={() => {
												setGiftForm({
													id: "",
													type: "Cash",
													description: "",
													value: undefined,
													beneficiaryId: "",
												});
												setEditingGift(null);
											}}
											className="cursor-pointer"
										>
											<Plus className="mr-2 h-4 w-4" />
											Add Gift
										</Button>
									</DialogTrigger>
									<DialogContent className="bg-white">
										<DialogHeader>
											<DialogTitle>
												{editingGift ? "Edit Gift" : "Add Gift"}
											</DialogTitle>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label>Gift Type</Label>
												<select
													value={giftForm.type}
													onChange={handleGiftFormChange("type")}
													className="w-full p-2 border rounded-md"
												>
													<option value="Cash">Cash Gift</option>
													<option value="Item">Specific Item</option>
													<option value="Other">Other</option>
												</select>
											</div>
											<div className="space-y-2">
												<Label>Description</Label>
												{giftForm.type === "Cash" ? (
													<div className="space-y-2">
														<Input
															type="number"
															value={giftForm.value || ""}
															onChange={handleGiftFormChange("value")}
															placeholder="Amount"
															className="w-full"
														/>
														<textarea
															value={giftForm.description}
															onChange={handleGiftFormChange("description")}
															placeholder="Add any specific instructions or conditions for this gift"
															className="w-full min-h-[100px] p-2 border rounded-md"
														/>
													</div>
												) : (
													<textarea
														value={giftForm.description}
														onChange={handleGiftFormChange("description")}
														placeholder="Describe the item or gift in detail"
														className="w-full min-h-[100px] p-2 border rounded-md"
													/>
												)}
											</div>
											<div className="space-y-2">
												<Label>Beneficiary</Label>
												<div className="flex justify-between items-center mb-4">
													<div className="flex space-x-4">
														<Button
															variant={
																beneficiaryType === "existing"
																	? "default"
																	: "outline"
															}
															onClick={() => setBeneficiaryType("existing")}
															className={`cursor-pointer ${
																beneficiaryType === "existing"
																	? "bg-light-green text-black"
																	: ""
															}`}
														>
															Select Existing Beneficiary
														</Button>
														<Button
															variant={
																beneficiaryType === "new"
																	? "default"
																	: "outline"
															}
															onClick={() => setBeneficiaryType("new")}
															className={`cursor-pointer ${
																beneficiaryType === "new"
																	? "bg-light-green text-black"
																	: ""
															}`}
														>
															Add New Beneficiary
														</Button>
													</div>
												</div>

												{beneficiaryType === "existing" ? (
													<select
														value={giftForm.beneficiaryId}
														onChange={(e) =>
															setGiftForm((prev) => ({
																...prev,
																beneficiaryId: e.target.value,
															}))
														}
														className="w-full p-2 border rounded-md"
													>
														<option value="">Select a beneficiary</option>
														{formData.hasSpouse && formData.spouse && (
															<option value="spouse">
																{formData.spouse.fullName} (Spouse)
															</option>
														)}
														{formData.children.map((child) => (
															<option key={child.id} value={child.id}>
																{child.firstName} {child.lastName} (Child)
															</option>
														))}
														{formData.otherBeneficiaries?.map((beneficiary) => (
															<option
																key={beneficiary.id}
																value={beneficiary.id}
															>
																{beneficiary.type === "charity"
																	? `${beneficiary.organizationName} (Charity)`
																	: `${beneficiary.firstName} ${beneficiary.lastName} (${beneficiary.relationship})`}
															</option>
														))}
													</select>
												) : (
													<div className="space-y-4">
														<div className="flex space-x-4 mb-4">
															<Button
																variant={
																	newBeneficiaryForm.type === "other"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setNewBeneficiaryForm((prev) => ({
																		...prev,
																		type: "other",
																	}))
																}
																className={`cursor-pointer ${
																	newBeneficiaryForm.type === "other"
																		? "bg-light-green text-black"
																		: ""
																}`}
															>
																Add Person
															</Button>
															<Button
																variant={
																	newBeneficiaryForm.type === "charity"
																		? "default"
																		: "outline"
																}
																onClick={() =>
																	setNewBeneficiaryForm((prev) => ({
																		...prev,
																		type: "charity",
																	}))
																}
																className={`cursor-pointer ${
																	newBeneficiaryForm.type === "charity"
																		? "bg-light-green text-black"
																		: ""
																}`}
															>
																Add Charity
															</Button>
														</div>

														{newBeneficiaryForm.type === "charity" ? (
															<>
																<div className="space-y-2">
																	<Label htmlFor="organizationName">
																		Organization Name
																	</Label>
																	<Input
																		id="organizationName"
																		value={newBeneficiaryForm.organizationName}
																		onChange={(e) =>
																			setNewBeneficiaryForm((prev) => ({
																				...prev,
																				organizationName: e.target.value,
																			}))
																		}
																		placeholder="Enter charity name"
																	/>
																</div>
																<div className="space-y-2">
																	<Label htmlFor="registrationNumber">
																		Charity Registration Number (Optional)
																	</Label>
																	<Input
																		id="registrationNumber"
																		value={
																			newBeneficiaryForm.registrationNumber
																		}
																		onChange={(e) =>
																			setNewBeneficiaryForm((prev) => ({
																				...prev,
																				registrationNumber: e.target.value,
																			}))
																		}
																		placeholder="Enter registration number if available"
																	/>
																</div>
															</>
														) : (
															<>
																<div className="grid grid-cols-2 gap-4">
																	<div className="space-y-2">
																		<Label htmlFor="beneficiaryFirstName">
																			First Name
																		</Label>
																		<Input
																			id="beneficiaryFirstName"
																			value={newBeneficiaryForm.firstName}
																			onChange={(e) =>
																				setNewBeneficiaryForm((prev) => ({
																					...prev,
																					firstName: e.target.value,
																				}))
																			}
																			placeholder="John"
																		/>
																	</div>
																	<div className="space-y-2">
																		<Label htmlFor="beneficiaryLastName">
																			Last Name
																		</Label>
																		<Input
																			id="beneficiaryLastName"
																			value={newBeneficiaryForm.lastName}
																			onChange={(e) =>
																				setNewBeneficiaryForm((prev) => ({
																					...prev,
																					lastName: e.target.value,
																				}))
																			}
																			placeholder="Doe"
																		/>
																	</div>
																</div>
																<div className="space-y-2">
																	<Label htmlFor="beneficiaryRelationship">
																		Relationship
																	</Label>
																	<Input
																		id="beneficiaryRelationship"
																		value={newBeneficiaryForm.relationship}
																		onChange={(e) =>
																			setNewBeneficiaryForm((prev) => ({
																				...prev,
																				relationship: e.target.value,
																			}))
																		}
																		placeholder="e.g., Niece, Nephew, Friend"
																	/>
																</div>
															</>
														)}
														<div className="flex justify-end">
															<Button
																onClick={handleSaveNewBeneficiary}
																disabled={
																	(newBeneficiaryForm.type === "charity" &&
																		!newBeneficiaryForm.organizationName) ||
																	(newBeneficiaryForm.type === "other" &&
																		(!newBeneficiaryForm.firstName ||
																			!newBeneficiaryForm.lastName ||
																			!newBeneficiaryForm.relationship))
																}
																className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
															>
																Add Beneficiary
															</Button>
														</div>
													</div>
												)}
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													variant="outline"
													onClick={() => setGiftDialogOpen(false)}
													className="cursor-pointer"
												>
													Cancel
												</Button>
												<Button
													onClick={handleSaveGift}
													disabled={
														!giftForm.description || !giftForm.beneficiaryId
													}
													className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
												>
													Save
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>

							{formData.gifts.length === 0 ? (
								<p className="text-muted-foreground text-center py-4">
									No gifts added yet. Click "Add Gift" to specify gifts for your
									beneficiaries.
								</p>
							) : (
								<div className="space-y-4">
									{formData.gifts.map((gift) => (
										<Card key={gift.id}>
											<CardContent className="p-4">
												<div className="flex justify-between items-start">
													<div className="space-y-1">
														<div className="flex items-center space-x-2">
															<p className="font-medium">{gift.type}</p>
															{gift.type === "Cash" && gift.value && (
																<span className="text-sm text-muted-foreground">
																	${gift.value.toLocaleString()}
																</span>
															)}
														</div>
														<p className="text-sm">{gift.description}</p>
														<p className="text-sm text-muted-foreground">
															To:{" "}
															{getBeneficiaryName(
																gift.beneficiaryId,
																formData.spouse,
																formData.children,
																formData.guardians,
																formData.otherBeneficiaries
															)}
														</p>
													</div>
													<div className="flex space-x-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleEditGift(gift)}
															className="cursor-pointer"
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleRemoveGift(gift.id)}
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
									onClick={() => setCurrentQuestion("executors")}
									className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
								>
									Next <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				);

			case "executors":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							Appoint Executors for Your Estate
						</div>
						<div className="text-muted-foreground">
							Executors are responsible for carrying out the terms of your will.
							You should appoint at least one executor, and it's recommended to
							have a backup executor in case the primary executor is unable to
							serve.
						</div>
						<div className="space-y-6 mt-6">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Appointed Executors</h3>
								<Dialog
									open={executorDialogOpen}
									onOpenChange={setExecutorDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											onClick={() => {
												setExecutorForm({
													id: "",
													type: "individual",
													firstName: "",
													lastName: "",
													relationship: "",
													companyName: "",
													registrationNumber: "",
													contactPerson: "",
													isPrimary: false,
													address: {
														street: "",
														city: "",
														state: "",
														zipCode: "",
														country: "",
													},
													email: "",
													phone: "",
												});
												setEditingExecutor(null);
											}}
											className="cursor-pointer"
										>
											<Plus className="mr-2 h-4 w-4" />
											Add Executor
										</Button>
									</DialogTrigger>
									<DialogContent className="bg-white max-w-2xl">
										<DialogHeader>
											<DialogTitle>
												{editingExecutor ? "Edit Executor" : "Add Executor"}
											</DialogTitle>
											<DialogDescription>
												Add an executor who will be responsible for carrying out
												the terms of your will. You can appoint either an
												individual or a corporate executor.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="flex space-x-4 mb-4">
												<Button
													variant={
														executorForm.type === "individual"
															? "default"
															: "outline"
													}
													onClick={() =>
														setExecutorForm((prev) => ({
															...prev,
															type: "individual",
														}))
													}
													className={`cursor-pointer ${
														executorForm.type === "individual"
															? "bg-light-green text-black"
															: ""
													}`}
												>
													Individual Executor
												</Button>
												<Button
													variant={
														executorForm.type === "corporate"
															? "default"
															: "outline"
													}
													onClick={() =>
														setExecutorForm((prev) => ({
															...prev,
															type: "corporate",
														}))
													}
													className={`cursor-pointer ${
														executorForm.type === "corporate"
															? "bg-light-green text-black"
															: ""
													}`}
												>
													Corporate Executor
												</Button>
											</div>

											{executorForm.type === "individual" ? (
												<>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor="executorFirstName">
																First Name
															</Label>
															<Input
																id="executorFirstName"
																value={executorForm.firstName}
																onChange={handleExecutorFormChange("firstName")}
																placeholder="John"
															/>
														</div>
														<div className="space-y-2">
															<Label htmlFor="executorLastName">
																Last Name
															</Label>
															<Input
																id="executorLastName"
																value={executorForm.lastName}
																onChange={handleExecutorFormChange("lastName")}
																placeholder="Doe"
															/>
														</div>
													</div>
													<div className="space-y-2">
														<Label htmlFor="executorRelationship">
															Relationship to You
														</Label>
														<Input
															id="executorRelationship"
															value={executorForm.relationship}
															onChange={handleExecutorFormChange(
																"relationship"
															)}
															placeholder="e.g., Brother, Sister, Close Friend"
														/>
													</div>
												</>
											) : (
												<>
													<div className="space-y-2">
														<Label htmlFor="companyName">Company Name</Label>
														<Input
															id="companyName"
															value={executorForm.companyName}
															onChange={handleExecutorFormChange("companyName")}
															placeholder="Enter company name"
														/>
													</div>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor="registrationNumber">
																Registration Number
															</Label>
															<Input
																id="registrationNumber"
																value={executorForm.registrationNumber}
																onChange={handleExecutorFormChange(
																	"registrationNumber"
																)}
																placeholder="Enter company registration number"
															/>
														</div>
														<div className="space-y-2">
															<Label htmlFor="contactPerson">
																Contact Person
															</Label>
															<Input
																id="contactPerson"
																value={executorForm.contactPerson}
																onChange={handleExecutorFormChange(
																	"contactPerson"
																)}
																placeholder="Name of primary contact"
															/>
														</div>
													</div>
												</>
											)}

											<div className="space-y-2">
												<Label>Address</Label>
												<div className="space-y-4">
													<div className="space-y-2">
														<Label htmlFor="executorStreet">
															Street Address
														</Label>
														<Input
															id="executorStreet"
															value={executorForm.address.street}
															onChange={handleExecutorAddressChange("street")}
															placeholder="123 Main Street"
														/>
													</div>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor="executorCity">City</Label>
															<Input
																id="executorCity"
																value={executorForm.address.city}
																onChange={handleExecutorAddressChange("city")}
																placeholder="Toronto"
															/>
														</div>
														<div className="space-y-2">
															<Label htmlFor="executorZipCode">
																Postal/ZIP Code
															</Label>
															<Input
																id="executorZipCode"
																value={executorForm.address.zipCode}
																onChange={handleExecutorAddressChange(
																	"zipCode"
																)}
																placeholder="M5V 2H1"
															/>
														</div>
													</div>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor="executorState">
																State/Province
															</Label>
															<Input
																id="executorState"
																value={executorForm.address.state}
																onChange={handleExecutorAddressChange("state")}
																placeholder="Ontario"
															/>
														</div>
														<div className="space-y-2">
															<Label htmlFor="executorCountry">Country</Label>
															<Input
																id="executorCountry"
																value={executorForm.address.country}
																onChange={handleExecutorAddressChange(
																	"country"
																)}
																placeholder="Canada"
															/>
														</div>
													</div>
												</div>
											</div>
											<div className="flex items-center space-x-2">
												<Checkbox
													id="isPrimaryExecutor"
													checked={executorForm.isPrimary}
													onCheckedChange={(checked: boolean) =>
														setExecutorForm((prev) => ({
															...prev,
															isPrimary: checked,
														}))
													}
												/>
												<Label htmlFor="isPrimaryExecutor" className="text-sm">
													Appoint as Primary Executor
												</Label>
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													variant="outline"
													onClick={() => setExecutorDialogOpen(false)}
													className="cursor-pointer"
												>
													Cancel
												</Button>
												<Button
													onClick={handleSaveExecutor}
													disabled={
														(executorForm.type === "individual" &&
															(!executorForm.firstName ||
																!executorForm.lastName ||
																!executorForm.relationship)) ||
														(executorForm.type === "corporate" &&
															(!executorForm.companyName ||
																!executorForm.registrationNumber ||
																!executorForm.contactPerson)) ||
														!isAddressValid(executorForm.address)
													}
													className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
												>
													Save
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>

							{formData.executors.length === 0 ? (
								<p className="text-muted-foreground text-center py-4">
									No executors added yet. Click "Add Executor" to appoint
									executors for your estate.
								</p>
							) : (
								<div className="space-y-4">
									{formData.executors.map((executor) => (
										<Card key={executor.id}>
											<CardContent className="p-4">
												<div className="flex justify-between items-start">
													<div className="space-y-1">
														<p className="font-medium">
															{executor.type === "individual" ? (
																<>
																	{executor.firstName} {executor.lastName}
																	<span className="text-sm text-muted-foreground ml-2">
																		({executor.relationship})
																	</span>
																</>
															) : (
																<>
																	{executor.companyName}
																	<span className="text-sm text-muted-foreground ml-2">
																		(Corporate Executor)
																	</span>
																	<div className="text-sm text-muted-foreground">
																		Contact: {executor.contactPerson}
																	</div>
																</>
															)}
															{executor.isPrimary && (
																<span className="ml-2 text-sm text-primary">
																	(Primary Executor)
																</span>
															)}
														</p>
														<p className="text-sm text-muted-foreground">
															{formatAddress(executor.address)}
														</p>
													</div>
													<div className="flex space-x-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleEditExecutor(executor)}
															className="cursor-pointer"
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleRemoveExecutor(executor.id)}
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
									onClick={() => setCurrentQuestion("witnesses")}
									className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
								>
									Next <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				);

			case "witnesses":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">
							Add Witnesses to Your Will
						</div>
						<div className="text-muted-foreground">
							Your will requires two witnesses who are not beneficiaries of the
							will. Witnesses must be present when you sign your will and must
							also sign it.
						</div>
						<div className="space-y-6 mt-6">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Witnesses</h3>
								<Dialog
									open={witnessDialogOpen}
									onOpenChange={setWitnessDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											onClick={() => {
												setWitnessForm({
													id: "",
													firstName: "",
													lastName: "",
													address: {
														street: "",
														city: "",
														state: "",
														zipCode: "",
														country: "",
													},
												});
												setEditingWitness(null);
											}}
											className="cursor-pointer"
										>
											<Plus className="mr-2 h-4 w-4" />
											Add Witness
										</Button>
									</DialogTrigger>
									<DialogContent className="bg-white max-w-2xl">
										<DialogHeader>
											<DialogTitle>
												{editingWitness ? "Edit Witness" : "Add Witness"}
											</DialogTitle>
											<DialogDescription>
												Add a witness who will be present when you sign your
												will. The witness must not be a beneficiary of the will.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="witnessFirstName">First Name</Label>
													<Input
														id="witnessFirstName"
														value={witnessForm.firstName}
														onChange={handleWitnessFormChange("firstName")}
														placeholder="John"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="witnessLastName">Last Name</Label>
													<Input
														id="witnessLastName"
														value={witnessForm.lastName}
														onChange={handleWitnessFormChange("lastName")}
														placeholder="Doe"
													/>
												</div>
											</div>
											<div className="space-y-2">
												<Label>Address</Label>
												<div className="space-y-4">
													<div className="space-y-2">
														<Label htmlFor="witnessStreet">
															Street Address
														</Label>
														<Input
															id="witnessStreet"
															value={witnessForm.address.street}
															onChange={handleWitnessAddressChange("street")}
															placeholder="123 Main Street"
														/>
													</div>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor="witnessCity">City</Label>
															<Input
																id="witnessCity"
																value={witnessForm.address.city}
																onChange={handleWitnessAddressChange("city")}
																placeholder="Toronto"
															/>
														</div>
														<div className="space-y-2">
															<Label htmlFor="witnessZipCode">
																Postal/ZIP Code
															</Label>
															<Input
																id="witnessZipCode"
																value={witnessForm.address.zipCode}
																onChange={handleWitnessAddressChange("zipCode")}
																placeholder="M5V 2H1"
															/>
														</div>
													</div>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor="witnessState">
																State/Province
															</Label>
															<Input
																id="witnessState"
																value={witnessForm.address.state}
																onChange={handleWitnessAddressChange("state")}
																placeholder="Ontario"
															/>
														</div>
														<div className="space-y-2">
															<Label htmlFor="witnessCountry">Country</Label>
															<Input
																id="witnessCountry"
																value={witnessForm.address.country}
																onChange={handleWitnessAddressChange("country")}
																placeholder="Canada"
															/>
														</div>
													</div>
												</div>
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													variant="outline"
													onClick={() => setWitnessDialogOpen(false)}
													className="cursor-pointer"
												>
													Cancel
												</Button>
												<Button
													onClick={handleSaveWitness}
													disabled={
														!witnessForm.firstName ||
														!witnessForm.lastName ||
														!isAddressValid(witnessForm.address)
													}
													className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
												>
													Save
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>

							{formData.witnesses.length === 0 ? (
								<p className="text-muted-foreground text-center py-4">
									No witnesses added yet. Click "Add Witness" to add witnesses
									to your will.
								</p>
							) : (
								<div className="space-y-4">
									{formData.witnesses.map((witness) => (
										<Card key={witness.id}>
											<CardContent className="p-4">
												<div className="flex justify-between items-start">
													<div className="space-y-1">
														<p className="font-medium">
															{witness.firstName} {witness.lastName}
														</p>
														<p className="text-sm text-muted-foreground">
															{formatAddress(witness.address)}
														</p>
													</div>
													<div className="flex space-x-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleEditWitness(witness)}
															className="cursor-pointer"
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleRemoveWitness(witness.id)}
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
									onClick={handleNext}
									disabled={formData.witnesses.length !== 2}
									className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
								>
									Next <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* Add witness conflict confirmation dialog */}
						<Dialog
							open={witnessConflictDialogOpen}
							onOpenChange={setWitnessConflictDialogOpen}
						>
							<DialogContent className="bg-white">
								<DialogHeader>
									<DialogTitle>Potential Beneficiary Conflict</DialogTitle>
									<DialogDescription>
										The witness you're trying to add has the same name as a
										beneficiary in your will ({potentialConflict?.beneficiary}).
										A witness cannot be a beneficiary of the will.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter className="flex space-x-2 justify-end mt-4">
									<Button
										variant="outline"
										onClick={() => {
											setWitnessConflictDialogOpen(false);
											setPotentialConflict(null);
										}}
										className="cursor-pointer"
									>
										Cancel
									</Button>
									<Button
										onClick={() => {
											if (potentialConflict) {
												setWitnessForm(potentialConflict.witness);
												setWitnessConflictDialogOpen(false);
												setPotentialConflict(null);
												setWitnessDialogOpen(true);
											}
										}}
										className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
									>
										Edit Witness
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				);

			case "review":
				return (
					<div className="space-y-4">
						<div className="text-2xl font-semibold">Review Your Will</div>
						<div className="text-muted-foreground">
							Please review all the information below carefully. You can save
							your will and download a PDF copy for your records.
						</div>
						<ReviewStep
							ref={reviewStepRef}
							data={{
								personal: {
									fullName: `${formData.firstName} ${formData.lastName}`,
									dateOfBirth: formData.dateOfBirth,
									address: formatAddress(formData.address),
									phone: formData.phone,
									maritalStatus: formData.hasSpouse ? "Married" : "Single",
								},
								assets: formData.assets.map((asset) => ({
									value: asset.value,
									type: asset.type,
									description: asset.description,
									distributionType: asset.distributionType,
									beneficiaries: asset.beneficiaries.map((b) => ({
										id: b.id,
										percentage: b.percentage,
									})),
								})),
								beneficiaries: [
									...(formData.spouse
										? [
												{
													id: "spouse",
													fullName: formData.spouse.fullName,
													relationship: "Spouse",
													allocation: 100,
												},
										  ]
										: []),
									...formData.children.map((child) => ({
										id: child.id,
										fullName: `${child.firstName} ${child.lastName}`,
										relationship: "Child",
										dateOfBirth: child.dateOfBirth,
										requiresGuardian: child.requiresGuardian,
										email: "",
										phone: "",
										allocation: 100,
									})),
									...formData.guardians.map((guardian) => ({
										id: guardian.id,
										fullName: `${guardian.firstName} ${guardian.lastName}`,
										relationship: `${guardian.relationship} (Guardian${
											guardian.isPrimary ? " - Primary" : ""
										})`,
										email: "",
										phone: "",
										allocation: 100,
									})),
									...(formData.otherBeneficiaries || []).map((beneficiary) => ({
										id: beneficiary.id,
										fullName:
											beneficiary.type === "charity"
												? beneficiary.organizationName || ""
												: `${beneficiary.firstName} ${beneficiary.lastName}`,
										relationship: beneficiary.relationship,
										email: beneficiary.email,
										phone: beneficiary.phone,
										allocation: Number(beneficiary.allocation) || 0,
									})),
								],
								executors: formData.executors.map((executor) => ({
									fullName:
										executor.type === "individual"
											? `${executor.firstName} ${executor.lastName}`
											: executor.companyName || "",
									relationship: executor.relationship,
									email: executor.email,
									phone: executor.phone,
									address: formatAddress(executor.address),
									isPrimary: executor.isPrimary,
									type: executor.type,
									companyName: executor.companyName,
									contactPerson: executor.contactPerson,
									registrationNumber: executor.registrationNumber,
								})),
								witnesses: formData.witnesses.map((witness) => ({
									fullName: `${witness.firstName} ${witness.lastName}`,
									address: formatAddress(witness.address),
								})),
								guardians: formData.guardians.map((guardian) => ({
									fullName: `${guardian.firstName} ${guardian.lastName}`,
									relationship: guardian.relationship,
									isPrimary: guardian.isPrimary,
								})),
								gifts: formData.gifts.map((gift) => ({
									type: gift.type,
									description: gift.description,
									value: gift.value?.toString(),
									beneficiaryId: gift.beneficiaryId,
									beneficiaryName: getBeneficiaryName(
										gift.beneficiaryId,
										formData.spouse,
										formData.children,
										formData.guardians,
										formData.otherBeneficiaries
									),
								})),
							}}
						/>
						<div className="flex justify-between pt-4">
							<Button
								variant="outline"
								onClick={handleBack}
								className="cursor-pointer"
								disabled={reviewStepRef.current?.isSaving}
							>
								<ArrowLeft className="mr-2 h-4 w-4" /> Back
							</Button>
							<Button
								onClick={() => reviewStepRef.current?.handleSaveAndDownload()}
								className="bg-light-green hover:bg-light-green/90 text-black cursor-pointer"
								disabled={reviewStepRef.current?.isSaving}
							>
								<Save className="mr-2 h-4 w-4" />
								{reviewStepRef.current?.isSaving
									? "Saving..."
									: "Save & Download"}
							</Button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	// Track progress
	const totalQuestions = 8; // Updated to remove finished step
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
			case "gifts":
				return 7;
			case "executors":
				return 7;
			case "witnesses":
				return 8;
			case "review":
				return 8;
			default:
				return 1;
		}
	})();

	const progressPercent = (progress / totalQuestions) * 100;

	// Add the saveChild function
	const saveChild = () => {
		if (editingChild) {
			setFormData((prev) => ({
				...prev,
				children: prev.children.map((child) =>
					child.id === editingChild.id ? { ...childForm, id: child.id } : child
				),
			}));
		} else {
			const newChild: Child = {
				id: crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`,
				...childForm,
			};
			setFormData((prev) => ({
				...prev,
				children: [...prev.children, newChild],
			}));
		}
		setChildForm({
			firstName: "",
			lastName: "",
			dateOfBirth: "",
			requiresGuardian: false,
		});
		setEditingChild(null);
		setChildDialogOpen(false);
	};

	const reviewStepRef = useRef<ReviewStepHandle>(null);

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
								variant={beneficiaryType === "existing" ? "default" : "outline"}
								onClick={() => setBeneficiaryType("existing")}
								className={`cursor-pointer ${
									beneficiaryType === "existing"
										? "bg-light-green text-black"
										: ""
								}`}
							>
								Select Existing Beneficiary
							</Button>
							<Button
								variant={beneficiaryType === "new" ? "default" : "outline"}
								onClick={() => setBeneficiaryType("new")}
								className={`cursor-pointer ${
									beneficiaryType === "new" ? "bg-light-green text-black" : ""
								}`}
							>
								Add New Beneficiary
							</Button>
						</div>

						{beneficiaryType === "existing" ? (
							<div className="space-y-2">
								<Label>Select Beneficiary</Label>
								<div className="space-y-2 max-h-[300px] overflow-y-auto">
									{/* Spouse */}
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

									{/* Children */}
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

									{/* Guardians */}
									{formData.guardians
										.filter(
											(guardian) =>
												!assetForm.beneficiaries.some(
													(b) => b.id === guardian.id
												)
										)
										.map((guardian) => (
											<div
												key={guardian.id}
												className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
												onClick={() => {
													setAssetForm((prev) => ({
														...prev,
														beneficiaries: [
															...prev.beneficiaries,
															{
																id: guardian.id,
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
														{guardian.firstName} {guardian.lastName}
													</span>
													<span className="text-sm text-muted-foreground ml-2">
														(Guardian{guardian.isPrimary ? " - Primary" : ""})
													</span>
												</div>
											</div>
										))}

									{/* Other Beneficiaries */}
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
														{beneficiary.type === "charity"
															? beneficiary.organizationName
															: `${beneficiary.firstName} ${beneficiary.lastName}`}
													</span>
													<span className="text-sm text-muted-foreground ml-2">
														(
														{beneficiary.type === "charity"
															? "Charity"
															: beneficiary.relationship}
														)
													</span>
												</div>
											</div>
										))}
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex space-x-4 mb-4">
									<Button
										variant={
											newBeneficiaryForm.type === "other"
												? "default"
												: "outline"
										}
										onClick={() =>
											setNewBeneficiaryForm((prev) => ({
												...prev,
												type: "other",
											}))
										}
										className={`cursor-pointer ${
											newBeneficiaryForm.type === "other"
												? "bg-light-green text-black"
												: ""
										}`}
									>
										Add Person
									</Button>
									<Button
										variant={
											newBeneficiaryForm.type === "charity"
												? "default"
												: "outline"
										}
										onClick={() =>
											setNewBeneficiaryForm((prev) => ({
												...prev,
												type: "charity",
											}))
										}
										className={`cursor-pointer ${
											newBeneficiaryForm.type === "charity"
												? "bg-light-green text-black"
												: ""
										}`}
									>
										Add Charity
									</Button>
								</div>

								{newBeneficiaryForm.type === "charity" ? (
									<>
										<div className="space-y-2">
											<Label htmlFor="organizationName">
												Organization Name
											</Label>
											<Input
												id="organizationName"
												value={newBeneficiaryForm.organizationName}
												onChange={(e) =>
													setNewBeneficiaryForm((prev) => ({
														...prev,
														organizationName: e.target.value,
													}))
												}
												placeholder="Enter charity name"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="registrationNumber">
												Charity Registration Number (Optional)
											</Label>
											<Input
												id="registrationNumber"
												value={newBeneficiaryForm.registrationNumber}
												onChange={(e) =>
													setNewBeneficiaryForm((prev) => ({
														...prev,
														registrationNumber: e.target.value,
													}))
												}
												placeholder="Enter registration number if available"
											/>
										</div>
									</>
								) : (
									<>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="beneficiaryFirstName">First Name</Label>
												<Input
													id="beneficiaryFirstName"
													value={newBeneficiaryForm.firstName}
													onChange={(e) =>
														setNewBeneficiaryForm((prev) => ({
															...prev,
															firstName: e.target.value,
														}))
													}
													placeholder="John"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="beneficiaryLastName">Last Name</Label>
												<Input
													id="beneficiaryLastName"
													value={newBeneficiaryForm.lastName}
													onChange={(e) =>
														setNewBeneficiaryForm((prev) => ({
															...prev,
															lastName: e.target.value,
														}))
													}
													placeholder="Doe"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="beneficiaryRelationship">
												Relationship
											</Label>
											<Input
												id="beneficiaryRelationship"
												value={newBeneficiaryForm.relationship}
												onChange={(e) =>
													setNewBeneficiaryForm((prev) => ({
														...prev,
														relationship: e.target.value,
													}))
												}
												placeholder="e.g., Niece, Nephew, Friend"
											/>
										</div>
									</>
								)}
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
										(newBeneficiaryForm.type === "charity" &&
											!newBeneficiaryForm.organizationName) ||
										(newBeneficiaryForm.type === "other" &&
											(!newBeneficiaryForm.firstName ||
												!newBeneficiaryForm.lastName ||
												!newBeneficiaryForm.relationship))
									}
									className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
