import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { QuestionType } from "@/components/will-wizard/types/will.types";
import { useWillWizard } from "@/context/WillWizardContext";

const STEP_ORDER: QuestionType[] = [
	"personalInfo",
	"familyInfo",
	"guardians",
	"hasAssets",
	"gifts",
	"digitalAssets",
	"residuary",
	"executors",
	"funeralInstructions",
	"review",
];

export function useWillWizardNavigation() {
	const navigate = useNavigate();
	const { step: urlStep } = useParams<{ step: string }>();
	const { canAccessStep, setWillWizardState, setActiveWillId, loadProgress } =
		useWillWizard();

	// Navigate to a specific step
	const navigateToStep = useCallback(
		(step: QuestionType) => {
			// ToDO: Implement this
			// if (canAccessStep(step)) {
			// 	setWillWizardState(true, step);
			// 	navigate(`/app/create-will/${step}`);
			// } else {
			// 	toast.error("Please complete previous steps first");
			// }
			setWillWizardState(true, step);
			navigate(`/app/create-will/${step}`);
		},
		[canAccessStep, navigate, setWillWizardState]
	);

	// Get the next step in sequence
	const getNextStep = useCallback(
		(current: QuestionType): QuestionType | null => {
			const currentIndex = STEP_ORDER.indexOf(current);
			return currentIndex < STEP_ORDER.length - 1
				? STEP_ORDER[currentIndex + 1]
				: null;
		},
		[]
	);

	// Get the previous step in sequence
	const getPreviousStep = useCallback(
		(current: QuestionType): QuestionType | null => {
			const currentIndex = STEP_ORDER.indexOf(current);
			return currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null;
		},
		[]
	);

	// Navigate to next step
	const goToNextStep = useCallback(
		(current: QuestionType) => {
			const nextStep = getNextStep(current);
			if (nextStep) {
				navigateToStep(nextStep);
			}
		},
		[getNextStep, navigateToStep]
	);

	// Navigate to previous step
	const goToPreviousStep = useCallback(
		(current: QuestionType) => {
			const prevStep = getPreviousStep(current);
			if (prevStep) {
				navigateToStep(prevStep);
			}
		},
		[getPreviousStep, navigateToStep]
	);

	// Get first accessible step based on completed steps
	const getFirstAccessibleStep = useCallback((): QuestionType => {
		for (const step of STEP_ORDER) {
			if (canAccessStep(step)) {
				return step;
			}
		}
		return "personalInfo";
	}, [canAccessStep]);

	// Initialize from URL parameter
	useEffect(() => {
		if (urlStep && STEP_ORDER.includes(urlStep as QuestionType)) {
			const targetStep = urlStep as QuestionType;
			if (canAccessStep(targetStep)) {
				setWillWizardState(true, targetStep);
			} else {
				// Redirect to first accessible step
				const firstAccessible = getFirstAccessibleStep();
				navigate(`/app/create-will/${firstAccessible}`, { replace: true });
				setWillWizardState(true, firstAccessible);
			}
		}
	}, [
		urlStep,
		canAccessStep,
		setWillWizardState,
		navigate,
		getFirstAccessibleStep,
	]);

	// Initialize will ID for progress tracking
	const initializeWillProgress = useCallback(
		(willId: string) => {
			setActiveWillId(willId);
			loadProgress();
		},
		[setActiveWillId, loadProgress]
	);

	return {
		navigateToStep,
		goToNextStep,
		goToPreviousStep,
		getNextStep,
		getPreviousStep,
		getFirstAccessibleStep,
		initializeWillProgress,
		currentUrlStep: urlStep as QuestionType | undefined,
	};
}
