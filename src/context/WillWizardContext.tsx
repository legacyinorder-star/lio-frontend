import { createContext, useContext, useState, ReactNode } from "react";
import { QuestionType } from "@/components/will-wizard/types/will.types";

interface WillWizardContextType {
	isInWillWizard: boolean;
	currentStep: QuestionType | null;
	setWillWizardState: (isActive: boolean, step?: QuestionType) => void;
	getStepInfo: (step: QuestionType) => { number: number; name: string };
}

const WillWizardContext = createContext<WillWizardContextType | undefined>(
	undefined
);

export function WillWizardProvider({ children }: { children: ReactNode }) {
	const [isInWillWizard, setIsInWillWizard] = useState(false);
	const [currentStep, setCurrentStep] = useState<QuestionType | null>(null);

	const setWillWizardState = (isActive: boolean, step?: QuestionType) => {
		setIsInWillWizard(isActive);
		setCurrentStep(step || null);
	};

	const getStepInfo = (
		step: QuestionType
	): { number: number; name: string } => {
		const stepMap: Record<QuestionType, { number: number; name: string }> = {
			name: { number: 1, name: "Personal Information" },
			address: { number: 2, name: "Address Information" },
			hasSpouse: { number: 3, name: "Spouse Information" },
			hasChildren: { number: 4, name: "Children Information" },
			guardians: { number: 5, name: "Guardians" },
			pets: { number: 6, name: "Pet Care" },
			hasAssets: { number: 7, name: "Assets" },
			gifts: { number: 8, name: "Gifts" },
			residuary: { number: 9, name: "Residuary Estate" },
			executors: { number: 10, name: "Executors" },
			witnesses: { number: 11, name: "Witnesses" },
			funeralInstructions: { number: 12, name: "Funeral Instructions" },
			review: { number: 13, name: "Review" },
		};
		return stepMap[step];
	};

	return (
		<WillWizardContext.Provider
			value={{
				isInWillWizard,
				currentStep,
				setWillWizardState,
				getStepInfo,
			}}
		>
			{children}
		</WillWizardContext.Provider>
	);
}

export function useWillWizard() {
	const context = useContext(WillWizardContext);
	if (context === undefined) {
		throw new Error("useWillWizard must be used within a WillWizardProvider");
	}
	return context;
}
