import React, { createContext, useContext, useState } from "react";

// Add import for QuestionType
import { QuestionType } from "@/components/will-wizard/types/will.types";

// Use the Will interface from DashboardPage for type safety
export interface Address {
	address: string;
	city: string;
	state: string;
	postCode?: string;
	country: string;
}

export interface WillPersonalData {
	id?: string;
	firstName: string;
	lastName: string;
	maritalStatus: string;
	address: string;
	city: string;
	state: string;
	postCode?: string;
	country: string;
}

export interface WillPerson {
	id: string;
	firstName: string;
	lastName: string;
	relationship: string;
	relationshipId?: string;
	isMinor: boolean;
}

export interface WillCharity {
	id: string;
	name: string;
	registrationNumber?: string;
}

export interface WillAssetBeneficiary {
	id: string;
	percentage: number;
	peopleId?: string;
	charitiesId?: string;
	person?: WillPerson;
	charity?: WillCharity;
}

export interface WillAsset {
	id: string;
	assetType: string;
	description: string;
	distributionType: "equal" | "percentage";
	beneficiaries: WillAssetBeneficiary[];
}

export interface WillBeneficiary {
	firstName: string;
	lastName: string;
	relationship: string;
	allocation: number;
}

export interface WillExecutor {
	firstName?: string;
	lastName?: string;
	companyName?: string;
	relationship?: string;
	address: Address;
	isPrimary: boolean;
	type: "individual" | "corporate";
	contactPerson?: string;
}

export interface WillWitness {
	firstName: string;
	lastName: string;
	address: Address;
}

export interface WillResiduary {
	id: string;
	distribution_type: "equal" | "manual";
	beneficiaries: Array<{
		id: string;
		percentage: number;
		peopleId?: string;
		charitiesId?: string;
		person?: WillPerson;
		charity?: WillCharity;
	}>;
}

export interface WillProgress {
	id: string;
	createdAt: string;
	willId: string;
	userId: string;
	completedSteps: Record<QuestionType, boolean>;
	currentStep: QuestionType;
	updatedAt: string;
}

export interface WillData {
	id: string;
	lastUpdatedAt: string;
	createdAt: string;
	status: string;
	userId: string;
	// Payment data
	paymentStatus?: string;
	paymentDate?: string;
	// Owner data
	owner: WillPersonalData;
	// Spouse data
	spouse?: {
		id?: string;
		firstName: string;
		lastName: string;
	};
	// Children data
	children?: Array<{
		id: string;
		firstName: string;
		lastName: string;
		isMinor: boolean;
	}>;
	// Guardians data
	guardians?: Array<{
		id: string;
		firstName: string;
		lastName: string;
		relationship: string;
		isPrimary: boolean;
	}>;
	// Arrays
	assets: WillAsset[];
	beneficiaries: WillBeneficiary[];
	executors: WillExecutor[];
	witnesses: WillWitness[];
	// Residuary estate
	residuary?: WillResiduary;
	// Progress data
	progress?: WillProgress;
}

interface WillContextType {
	activeWill: WillData | null;
	setActiveWill: (will: WillData | null) => void;
}

const WillContext = createContext<WillContextType>({
	activeWill: null,
	setActiveWill: () => {},
});

export const WillProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [activeWill, setActiveWill] = useState<WillData | null>(null);
	return (
		<WillContext.Provider value={{ activeWill, setActiveWill }}>
			{children}
		</WillContext.Provider>
	);
};

export const useWill = () => useContext(WillContext);
