import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
	useCallback,
} from "react";
import {
	QuestionType,
	StepCompletion,
} from "@/components/will-wizard/types/will.types";
import { apiClient } from "@/utils/apiClient";

interface WillWizardContextType {
	isInWillWizard: boolean;
	currentStep: QuestionType | null;
	setWillWizardState: (isActive: boolean, step?: QuestionType) => void;
	getStepInfo: (step: QuestionType) => { number: number; name: string };
	getTotalSteps: () => number;
	// Progress tracking
	completedSteps: StepCompletion;
	markStepComplete: (step: QuestionType) => void;
	canAccessStep: (step: QuestionType) => boolean;
	isProgressLoading: boolean;
	setActiveWillId: (id: string | null) => void;
	loadProgress: () => Promise<void>;
}

const WillWizardContext = createContext<WillWizardContextType | undefined>(
	undefined
);

// Default completion state
const DEFAULT_COMPLETION: StepCompletion = {
	personalInfo: false,
	familyInfo: false,
	guardians: false,
	hasAssets: false,
	gifts: false,
	residuary: false,
	executors: false,
	funeralInstructions: false,
	review: false,
};

// Step order for navigation
const STEP_ORDER: QuestionType[] = [
	"personalInfo",
	"familyInfo",
	"guardians",
	"residuary",
	"hasAssets",
	"gifts",
	"executors",
	"funeralInstructions",
	"review",
];

const REQUIRED_STEPS = [
	"personalInfo",
	"familyInfo",
	"hasAssets",
	"residuary",
	"executors",
	"review",
];

export function WillWizardProvider({ children }: { children: ReactNode }) {
	const [isInWillWizard, setIsInWillWizard] = useState(false);
	const [currentStep, setCurrentStep] = useState<QuestionType | null>(null);
	const [completedSteps, setCompletedSteps] = useState<StepCompletion>({
		personalInfo: false,
		familyInfo: false,
		guardians: false,
		hasAssets: false,
		gifts: false,
		residuary: false,
		executors: false,
		funeralInstructions: false,
		review: false,
	});
	const [isProgressLoading, setIsProgressLoading] = useState(false);
	const [willId, setWillId] = useState<string | null>(null);

	const setWillWizardState = (isActive: boolean, step?: QuestionType) => {
		setIsInWillWizard(isActive);
		if (step) {
			setCurrentStep(step);
		} else if (!isActive) {
			// Reset current step when setting wizard to inactive
			setCurrentStep("personalInfo");
		}
	};

	// Progress tracking functions
	const markStepComplete = useCallback(
		async (step: QuestionType) => {
			console.log(
				"🔧 WillWizardContext: markStepComplete called for step:",
				step
			);
			console.log("🔧 WillWizardContext: Current willId:", willId);
			console.log(
				"🔧 WillWizardContext: Current completedSteps:",
				completedSteps
			);

			if (!willId) {
				console.log(
					"❌ WillWizardContext: No willId available for marking step complete:",
					step
				);
				return;
			}

			console.log("✅ WillWizardContext: Marking step as complete:", step);
			const updatedCompletion = { ...completedSteps, [step]: true };
			setCompletedSteps(updatedCompletion);

			try {
				const { error } = await apiClient(`/wills/${willId}/progress`, {
					method: "PUT",
					authenticated: true,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						completed_steps: updatedCompletion,
						current_step: step,
					}),
				});

				if (error) {
					console.error("❌ Error saving progress to API:", error);
					// Revert on error
					setCompletedSteps(completedSteps);
				} else {
					console.log("✅ Progress saved successfully for step:", step);
				}
			} catch (error) {
				console.error("❌ Error saving progress:", error);
				// Revert on error
				setCompletedSteps(completedSteps);
			}
		},
		[willId, completedSteps]
	);

	const canAccessStep = useCallback(
		(step: QuestionType): boolean => {
			const stepIndex = STEP_ORDER.indexOf(step);
			console.log(`🔍 Checking access for step: ${step} (index: ${stepIndex})`);
			console.log(`📊 Current completed steps:`, completedSteps);

			// Add null check for completedSteps to prevent runtime errors
			if (!completedSteps) {
				console.log(
					`⚠️ completedSteps is undefined, allowing access to step: ${step}`
				);
				return true;
			}

			// Check if all previous required steps are completed
			for (let i = 0; i < stepIndex; i++) {
				const prevStep = STEP_ORDER[i];
				if (REQUIRED_STEPS.includes(prevStep) && !completedSteps[prevStep]) {
					console.log(
						`❌ Step ${step} blocked by incomplete required step: ${prevStep}`
					);
					return false;
				}
			}
			console.log(`✅ Step ${step} is accessible`);
			return true;
		},
		[completedSteps]
	);

	// Load progress from backend
	const loadProgress = useCallback(async () => {
		console.log("🔍 loadProgress called with willId:", willId);

		if (!willId) {
			console.log("❌ No willId provided, skipping progress load");
			setIsProgressLoading(false);
			return;
		}

		console.log("🔄 Loading progress for will:", willId);
		setIsProgressLoading(true);

		try {
			const { data, error, status } = await apiClient<{
				completed_steps: StepCompletion;
				current_step: QuestionType;
			}>(`/wills/${willId}/progress`, {
				authenticated: true,
			});

			console.log("📡 Progress API response:", { data, error, status });

			if (data && !error) {
				console.log("✅ Progress loaded successfully:", data);
				setCompletedSteps(data.completed_steps);
				setCurrentStep(data.current_step);
			} else if (status === 404) {
				console.log("📝 No progress record found, creating new one...");

				// Create new progress record with default values
				const newProgress = {
					completed_steps: DEFAULT_COMPLETION,
					current_step: "personalInfo" as QuestionType,
				};

				try {
					const { data: createData, error: createError } = await apiClient<{
						completed_steps: StepCompletion;
						current_step: QuestionType;
					}>(`/wills/${willId}/progress`, {
						method: "PUT",
						authenticated: true,
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(newProgress),
					});

					if (createData && !createError) {
						console.log("✅ New progress record created:", createData);
						setCompletedSteps(createData.completed_steps);
						setCurrentStep(createData.current_step);
					} else {
						console.log("❌ Failed to create progress record:", createError);
						// Fall back to default values
						setCompletedSteps(DEFAULT_COMPLETION);
						setCurrentStep("personalInfo");
					}
				} catch (createError) {
					console.error("💥 Error creating progress record:", createError);
					// Fall back to default values
					setCompletedSteps(DEFAULT_COMPLETION);
					setCurrentStep("personalInfo");
				}
			} else {
				console.log("❌ Progress load failed:", error);
				// Fall back to default values on other errors
				setCompletedSteps(DEFAULT_COMPLETION);
				setCurrentStep("personalInfo");
			}
		} catch (error) {
			console.error("💥 Error loading will progress:", error);
			// Fall back to default values on network errors
			setCompletedSteps(DEFAULT_COMPLETION);
			setCurrentStep("personalInfo");
		} finally {
			setIsProgressLoading(false);
		}
	}, [willId]);

	// Load progress when willId changes
	useEffect(() => {
		console.log("🔄 willId changed to:", willId);
		if (willId) {
			loadProgress();
		} else {
			// Reset to default state when no willId
			setCompletedSteps(DEFAULT_COMPLETION);
			setCurrentStep(null);
		}
	}, [willId, loadProgress]);

	// Set willId when entering wizard (this would be called from WillWizard component)
	const setActiveWillId = useCallback(
		(id: string | null) => {
			console.log("🔧 WillWizardContext: setActiveWillId called with:", id);
			console.log("🔧 WillWizardContext: Previous willId was:", willId);
			setWillId(id);
			console.log("🔧 WillWizardContext: setWillId called, new willId:", id);
		},
		[willId]
	);

	const getStepInfo = (
		step: QuestionType
	): { number: number; name: string } => {
		const stepMap: Record<QuestionType, { number: number; name: string }> = {
			personalInfo: { number: 1, name: "Personal Information" },
			familyInfo: { number: 2, name: "Family Information" },
			guardians: { number: 3, name: "Guardians" },
			residuary: { number: 4, name: "Residuary Estate" },
			hasAssets: { number: 5, name: "Assets" },
			gifts: { number: 6, name: "Gifts" },
			executors: { number: 7, name: "Executors" },
			funeralInstructions: { number: 8, name: "Funeral Instructions" },
			review: { number: 9, name: "Review" },
		};
		return stepMap[step];
	};

	const getTotalSteps = (): number => {
		return STEP_ORDER.length;
	};

	return (
		<WillWizardContext.Provider
			value={{
				isInWillWizard,
				currentStep,
				setWillWizardState,
				getStepInfo,
				getTotalSteps,
				// Progress tracking
				completedSteps,
				markStepComplete,
				canAccessStep,
				isProgressLoading,
				setActiveWillId,
				loadProgress,
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
