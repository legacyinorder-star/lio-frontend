import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";
import { WillData } from "./WillContext";
import { useAuth } from "@/hooks/useAuth";

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
	funeralPreferences?: {
		burialLocation?: string;
		serviceType?: "religious" | "non-religious" | "private" | "public";
		additionalPreferences?: string;
	};
	guardianshipPreferences?: {
		reasonForChoice?: string;
		valuesAndHopes?: string;
	};
	digitalAssetsPreferences?: {
		digitalAssets?: Array<{
			platform: string;
			usernameOrEmail: string;
			action: "delete" | "memorialize" | "transfer" | "archive";
			beneficiaryId?: string;
			beneficiaryName?: string;
			notes?: string;
		}>;
	};
	personalPossessions?: Array<{
		item: string;
		recipient: string;
		reason?: string;
	}>;
	businessLegacy?: {
		notificationContacts?: Array<{
			name: string;
			email: string;
		}>;
		professionalInstructions?: string;
	};
	charitableDonations?: Array<{
		charityName: string;
		description?: string;
	}>;
	trusteeInstructions?: string;
	notesToLovedOnes?: string;
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
	const [currentStep, setCurrentStep] = useState<string>("personalFamily");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { user } = useAuth();

	const clearLetterData = () => {
		setLetterData(null);
		setCurrentStep("personalFamily");
	};

	useEffect(() => {
		if (!user) {
			clearLetterData();
			setWillData(null);
		}
	}, [user]);

	const initializeLetterForWill = (willId: string) => {
		console.log("initializeLetterForWill called with willId:", willId);
		setLetterData({
			willId,
			title: "",
			content: "",
			personalMessages: [],
			guidanceNotes: "",
			specialInstructions: "",
			funeralPreferences: {
				burialLocation: "",
				serviceType: undefined,
				additionalPreferences: "",
			},
			guardianshipPreferences: {
				reasonForChoice: "",
				valuesAndHopes: "",
			},
			digitalAssetsPreferences: {
				digitalAssets: [],
			},
			personalPossessions: [],
			businessLegacy: {
				notificationContacts: [],
				professionalInstructions: "",
			},
			charitableDonations: [],
			trusteeInstructions: "",
			notesToLovedOnes: "",
		});
		console.log("Letter data initialized successfully");
		setCurrentStep("personalFamily");
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
