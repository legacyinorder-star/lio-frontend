import { createContext, useContext, useState, ReactNode } from "react";
import { WillData } from "./WillContext";

export interface LetterOfWishesData {
	id?: string;
	willId: string;
	title?: string;
	content?: string;
	personalMessages?: {
		beneficiaryId: string;
		beneficiaryName: string;
		message: string;
	}[];
	guidanceNotes?: string;
	specialInstructions?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface LetterOfWishesContextType {
	// Will data for reference during letter creation
	willData: WillData | null;
	setWillData: (will: WillData | null) => void;

	// Letter of wishes data
	letterData: LetterOfWishesData | null;
	setLetterData: (letter: LetterOfWishesData | null) => void;

	// Current step in the letter wizard
	currentStep: string;
	setCurrentStep: (step: string) => void;

	// Loading states
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;

	// Utility functions
	clearLetterData: () => void;
	initializeLetterForWill: (willId: string) => void;
}

const LetterOfWishesContext = createContext<
	LetterOfWishesContextType | undefined
>(undefined);

export function LetterOfWishesProvider({ children }: { children: ReactNode }) {
	const [willData, setWillData] = useState<WillData | null>(null);
	const [letterData, setLetterData] = useState<LetterOfWishesData | null>(null);
	const [currentStep, setCurrentStep] = useState<string>("introduction");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const clearLetterData = () => {
		setLetterData(null);
		setCurrentStep("introduction");
	};

	const initializeLetterForWill = (willId: string) => {
		setLetterData({
			willId,
			title: "",
			content: "",
			personalMessages: [],
			guidanceNotes: "",
			specialInstructions: "",
		});
		setCurrentStep("introduction");
	};

	return (
		<LetterOfWishesContext.Provider
			value={{
				willData,
				setWillData,
				letterData,
				setLetterData,
				currentStep,
				setCurrentStep,
				isLoading,
				setIsLoading,
				clearLetterData,
				initializeLetterForWill,
			}}
		>
			{children}
		</LetterOfWishesContext.Provider>
	);
}

export function useLetterOfWishes() {
	const context = useContext(LetterOfWishesContext);
	if (context === undefined) {
		throw new Error(
			"useLetterOfWishes must be used within a LetterOfWishesProvider"
		);
	}
	return context;
}
