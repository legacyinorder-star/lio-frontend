import React, { createContext, useContext, useState } from "react";

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
	post_code?: string;
	country: string;
}

export interface WillAsset {
	type: string;
	description: string;
	value: string;
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

export interface WillData {
	id: string;
	lastUpdatedAt: string;
	createdAt: string;
	status: string;
	userId: string;
	// Owner data
	owner: WillPersonalData;
	// Arrays
	assets: WillAsset[];
	beneficiaries: WillBeneficiary[];
	executors: WillExecutor[];
	witnesses: WillWitness[];
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
