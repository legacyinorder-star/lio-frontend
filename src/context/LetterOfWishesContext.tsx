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
	// Personal notes fields from backend API
	personalNotesId?: string;
	personalNotesCreatedAt?: string;
	personalNotesLowId?: string;
	personalNotesUserId?: string;
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
	initializeLetterForWill: (willId: string, letterId?: string) => void;
	setLetterIdForExisting: (letterId: string) => void;
	populateLetterWithPersonalNotes: (personalNotes: any) => void;
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

	const initializeLetterForWill = (willId: string, letterId?: string) => {
		console.log(
			"initializeLetterForWill called with willId:",
			willId,
			"letterId:",
			letterId
		);
		setLetterData({
			id: letterId,
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
		console.log("Letter data initialized successfully with ID:", letterId);
		setCurrentStep("personalFamily");
	};

	const setLetterIdForExisting = (letterId: string) => {
		console.log("Setting letter ID for existing letter data:", letterId);
		if (letterData) {
			setLetterData({
				...letterData,
				id: letterId,
			});
		} else {
			console.warn("No letter data exists to set ID for");
		}
	};

	const populateLetterWithPersonalNotes = (personalNotes: any) => {
		console.log("Populating letter with personal notes:", personalNotes);
		if (letterData && personalNotes) {
			setLetterData({
				...letterData,
				notesToLovedOnes: personalNotes.notes || "",
				guardianshipPreferences: {
					reasonForChoice: personalNotes.guardian_reason || "",
					valuesAndHopes: personalNotes.guardian_values || "",
				},
				personalNotesId: personalNotes.id,
				personalNotesCreatedAt: personalNotes.created_at,
				personalNotesLowId: personalNotes.low_id,
				personalNotesUserId: personalNotes.user_id,
			});
			console.log("Letter data populated with personal notes successfully");
		}
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
				setLetterIdForExisting,
				populateLetterWithPersonalNotes,
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
