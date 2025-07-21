import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	QuestionType,
	StepCompletion,
	WillProgress,
} from "@/components/will-wizard/types/will.types";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";

// Default completion state
const DEFAULT_COMPLETION: StepCompletion = {
	name: false,
	address: false,
	hasSpouse: false,
	hasChildren: false,
	guardians: false,
	pets: false,
	hasAssets: false,
	digitalAssets: false,

	residuary: false,
	executors: false,
	witnesses: false,
	funeralInstructions: false,
	review: false,
};

const STEP_ORDER: QuestionType[] = [
	"name",
	"address",
	"hasSpouse",
	"hasChildren",
	"guardians",
	"pets",
	"hasAssets",

	"residuary",
	"executors",
	"witnesses",
	"funeralInstructions",
	"review",
];

export function useWillProgress(willId?: string) {
	const navigate = useNavigate();
	const { step: urlStep } = useParams<{ step: string }>();
	const [completedSteps, setCompletedSteps] =
		useState<StepCompletion>(DEFAULT_COMPLETION);
	const [currentStep, setCurrentStep] = useState<QuestionType>("name");
	const [isLoading, setIsLoading] = useState(true);

	// Load progress from backend
	const loadProgress = useCallback(async () => {
		if (!willId) {
			setIsLoading(false);
			return;
		}

		try {
			const { data, error } = await apiClient<WillProgress>(
				`/wills/${willId}/progress`,
				{
					authenticated: true,
				}
			);

			if (data && !error) {
				setCompletedSteps(data.completedSteps);

				// If URL has step parameter, validate and use it
				if (urlStep && isValidStep(urlStep as QuestionType)) {
					const targetStep = urlStep as QuestionType;
					if (canAccessStep(targetStep, data.completedSteps)) {
						setCurrentStep(targetStep);
					} else {
						// Redirect to first accessible step
						const firstAccessible = getFirstAccessibleStep(data.completedSteps);
						setCurrentStep(firstAccessible);
						navigate(`/app/create-will/${firstAccessible}`, { replace: true });
					}
				} else {
					// No URL step, use the next incomplete step
					const nextStep = getNextIncompleteStep(data.completedSteps);
					setCurrentStep(nextStep);
					navigate(`/app/create-will/${nextStep}`, { replace: true });
				}
			}
		} catch (error) {
			console.error("Error loading will progress:", error);
			toast.error("Failed to load progress");
		} finally {
			setIsLoading(false);
		}
	}, [willId, urlStep, navigate]);

	// Save progress to backend
	const saveProgress = useCallback(
		async (step: QuestionType) => {
			if (!willId) return;

			const updatedCompletion = { ...completedSteps, [step]: true };
			setCompletedSteps(updatedCompletion);

			try {
				await apiClient(`/wills/${willId}/progress`, {
					method: "PUT",
					authenticated: true,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						completedSteps: updatedCompletion,
						currentStep: step,
					}),
				});
			} catch (error) {
				console.error("Error saving progress:", error);
				// Revert on error
				setCompletedSteps(completedSteps);
			}
		},
		[willId, completedSteps]
	);

	// Navigation functions
	const navigateToStep = useCallback(
		(step: QuestionType) => {
			if (canAccessStep(step, completedSteps)) {
				setCurrentStep(step);
				navigate(`/app/create-will/${step}`);
			} else {
				toast.error("Please complete previous steps first");
			}
		},
		[completedSteps, navigate]
	);

	const goToNextStep = useCallback(() => {
		// Mark current step as completed
		saveProgress(currentStep);

		// Find next step
		const nextStep = getNextStep(currentStep);
		if (nextStep) {
			setCurrentStep(nextStep);
			navigate(`/app/create-will/${nextStep}`);
		}
	}, [currentStep, saveProgress, navigate]);

	const goToPreviousStep = useCallback(() => {
		const prevStep = getPreviousStep(currentStep);
		if (prevStep) {
			setCurrentStep(prevStep);
			navigate(`/app/create-will/${prevStep}`);
		}
	}, [currentStep, navigate]);

	// Load progress on mount
	useEffect(() => {
		loadProgress();
	}, [loadProgress]);

	return {
		currentStep,
		completedSteps,
		isLoading,
		navigateToStep,
		goToNextStep,
		goToPreviousStep,
		markStepComplete: saveProgress,
		canAccessStep: (step: QuestionType) => canAccessStep(step, completedSteps),
	};
}

// Helper functions
function isValidStep(step: string): step is QuestionType {
	return STEP_ORDER.includes(step as QuestionType);
}

function canAccessStep(step: QuestionType, completed: StepCompletion): boolean {
	const stepIndex = STEP_ORDER.indexOf(step);

	// Check if all previous steps are completed
	for (let i = 0; i < stepIndex; i++) {
		const prevStep = STEP_ORDER[i];
		// Required steps must be completed
		const requiredSteps = [
			"name",
			"address",
			"hasSpouse",
			"hasChildren",
			"hasAssets",
			"residuary",
			"executors",
			"witnesses",
			"review",
		];
		if (requiredSteps.includes(prevStep) && !completed[prevStep]) {
			return false;
		}
	}
	return true;
}

function getFirstAccessibleStep(completed: StepCompletion): QuestionType {
	for (const step of STEP_ORDER) {
		if (canAccessStep(step, completed)) {
			return step;
		}
	}
	return "name";
}

function getNextIncompleteStep(completed: StepCompletion): QuestionType {
	for (const step of STEP_ORDER) {
		if (!completed[step] && canAccessStep(step, completed)) {
			return step;
		}
	}
	return "review"; // All steps completed, go to review
}

function getNextStep(currentStep: QuestionType): QuestionType | null {
	const currentIndex = STEP_ORDER.indexOf(currentStep);
	return currentIndex < STEP_ORDER.length - 1
		? STEP_ORDER[currentIndex + 1]
		: null;
}

function getPreviousStep(currentStep: QuestionType): QuestionType | null {
	const currentIndex = STEP_ORDER.indexOf(currentStep);
	return currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null;
}
