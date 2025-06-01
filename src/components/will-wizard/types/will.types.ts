// Question Types
export type QuestionType =
	| "name"
	| "address"
	| "hasSpouse"
	| "hasChildren"
	| "guardians"
	| "hasAssets"
	| "gifts"
	| "residuary"
	| "executors"
	| "witnesses"
	| "funeralInstructions"
	| "additionalInstructions"
	| "review";

// Common Types
export type FormChangeEvent = React.ChangeEvent<HTMLInputElement>;

// Address Types
export interface Address {
	street: string;
	city: string;
	state: string;
	postCode: string;
	country: string;
}

// Person Types
export interface BasePerson {
	firstName: string;
	lastName: string;
}

export interface Child extends BasePerson {
	id: string;
	isMinor: boolean;
}

export interface Witness extends BasePerson {
	id: string;
	address: Address;
}

export interface Guardian extends BasePerson {
	id: string;
	relationship: string;
	isPrimary: boolean;
}

// Asset Types
export type AssetType =
	| "Property"
	| "Investment Property"
	| "Vehicle"
	| "Shares & Stocks"
	| "Business Interest"
	| "Other Assets";

export interface Asset {
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

export type AssetTypeOption = {
	value: AssetType;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	description: string;
};

// Beneficiary Types
export type BeneficiaryType =
	| "spouse"
	| "child"
	| "guardian"
	| "other"
	| "charity"
	| "individual";

export interface NewBeneficiary extends BasePerson {
	id: string;
	relationship: string;
	type: BeneficiaryType;
	organizationName?: string;
	registrationNumber?: string;
	email: string;
	phone: string;
	allocation: string;
}

// Gift Types
export type GiftType = "Cash" | "Item" | "Other";

export interface Gift {
	id: string;
	type: GiftType;
	description: string;
	value?: number;
	beneficiaryId: string;
}

// Executor Types
export interface Executor {
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

// Funeral Instructions Types
export interface FuneralInstructions {
	disposition: "cremation" | "burial" | null;
	location?: string;
}

// Main Form Data Type
export interface WillFormData {
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
	residuaryBeneficiaries: Array<{
		id: string;
		beneficiaryId: string;
		percentage: number;
	}>;
	executors: Executor[];
	witnesses: Witness[];
	additionalInstructions: string;
	funeralInstructions: FuneralInstructions;
}

// API Response Types
export interface PersonResponse {
	id: string;
	will_id: string;
	first_name: string;
	last_name: string;
	relationship_id: string;
	is_minor: boolean;
	created_at: string;
}

export interface GuardianshipResponse {
	id: string;
	will_id: string;
	guardian_id: string;
	is_primary: boolean;
	created_at: string;
}

export interface BeneficiaryResponse {
	charities: Array<{
		id: string;
		name: string;
		registration_number?: string;
	}>;
	people: Array<{
		id: string;
		first_name: string;
		last_name: string;
		relationship: string;
		is_minor: boolean;
	}>;
}

// Component Props Types
export interface StepProps {
	data: Partial<WillFormData>;
	onUpdate: (data: Partial<WillFormData>) => void;
	onNext: () => void;
	onBack: () => void;
}

export interface DialogProps<T> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: T) => void;
	editingItem?: T;
}

// Review Step Types
export interface ReviewStepHandle {
	handleSaveAndDownload: () => Promise<void>;
	isSaving: boolean;
}

// Define SpouseData type here since it's used in WillFormData
export interface SpouseData {
	firstName: string;
	lastName: string;
	relationship: string;
	dateOfBirth: string;
	phone: string;
	address: Address;
}
