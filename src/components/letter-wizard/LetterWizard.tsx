import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { apiClient } from "@/utils/apiClient";
import { mapWillDataFromAPI } from "@/utils/dataTransform";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import KnowledgeBaseSidebar from "./components/KnowledgeBaseSidebar";
import { BookOpen, X, CreditCard } from "lucide-react";

// Import step components
import PersonalFamilyStep from "./steps/PersonalFamilyStep";
import AssetsPossessionsStep from "./steps/AssetsPossessionsStep";
import FuneralEndOfLifeStep from "./steps/FuneralEndOfLifeStep";
import InstructionsLegacyStep, {
	InstructionsCharitableDonationsStepHandle,
} from "./steps/InstructionsCharitableDonationsStep";

// Step order and configuration
const STEP_ORDER = [
	"personalFamily",
	"assetsPossessions",
	"funeralEndOfLife",
	"instructionsLegacy",
] as const;

export default function LetterWizard() {
	const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const stepParam = searchParams.get("step");
	const [currentStepIndex, setCurrentStepIndex] = useState(() => {
		if (stepParam) {
			const stepIndex = STEP_ORDER.indexOf(
				stepParam as (typeof STEP_ORDER)[number]
			);
			return stepIndex >= 0 ? stepIndex : 0;
		}
		return 0;
	});

	// Add ref for the instructions step
	const instructionsStepRef =
		useRef<InstructionsCharitableDonationsStepHandle>(null);

	const {
		willData,
		setWillData,
		letterData,
		currentStep,
		setCurrentStep,
		isLoading: contextLoading,
		setIsLoading: setContextLoading,
		initializeLetterForWill,
	} = useLetterOfWishes();

	// Update currentStep when currentStepIndex changes
	useEffect(() => {
		setCurrentStep(STEP_ORDER[currentStepIndex]);
	}, [currentStepIndex, setCurrentStep]);

	const willId = searchParams.get("willId");

	// Load will data if not already loaded
	useEffect(() => {
		const loadWillData = async () => {
			if (!willId) {
				toast.error("No will specified for Letter of Wishes");
				navigate("/app/dashboard");
				return;
			}

			// Always show loading when starting to load will data
			if (!willData) {
				console.log("Starting to load will data for willId:", willId);
				setContextLoading(true);
				try {
					const { data, error } = await apiClient(
						`/wills/${willId}/get-full-will`
					);

					if (error) {
						console.error("Error loading will data:", error);
						toast.error("Failed to load will data");
						navigate("/app/dashboard");
						return;
					}

					const will = Array.isArray(data) ? data[0] : data;
					console.log("Will data loaded:", will);

					if (will) {
						console.log("Transforming will data using mapWillDataFromAPI...");
						// Use the standard data transformation utility
						const transformedWill = mapWillDataFromAPI(will);

						console.log("Will data transformed:", {
							guardiansCount: transformedWill.guardians?.length || 0,
							childrenCount: transformedWill.children?.length || 0,
							hasOwner: !!transformedWill.owner,
						});

						setWillData(transformedWill);
						console.log("Transformed will data:", transformedWill);
						console.log("Will data successfully loaded and transformed!");

						// Initialize letter data if not already initialized
						if (!letterData) {
							console.log("Initializing letter data for will:", willId);
							initializeLetterForWill(willId);
						}
					}
				} catch (error) {
					console.error("Error loading will data:", error);
					toast.error("Failed to load will data");
					navigate("/app/dashboard");
				} finally {
					setContextLoading(false);
				}
			}
		};

		loadWillData();
	}, [
		willId,
		willData,
		letterData,
		setWillData,
		setContextLoading,
		navigate,
		initializeLetterForWill,
	]);

	// Navigation functions
	const goToNextStep = useCallback(() => {
		if (currentStepIndex < STEP_ORDER.length - 1) {
			setCurrentStepIndex(currentStepIndex + 1);
			setCurrentStep(STEP_ORDER[currentStepIndex + 1]);
		}
	}, [currentStepIndex, setCurrentStep]);

	const goToPreviousStep = useCallback(() => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex(currentStepIndex - 1);
			setCurrentStep(STEP_ORDER[currentStepIndex - 1]);
		}
	}, [currentStepIndex, setCurrentStep]);

	// Render current step
	const renderCurrentStep = () => {
		const currentStepType = STEP_ORDER[currentStepIndex];
		const isLastStep = currentStepIndex === STEP_ORDER.length - 1;

		switch (currentStepType) {
			case "personalFamily":
				return (
					<div>
						<PersonalFamilyStep />
						{!isLastStep && (
							<div className="flex justify-end pt-6">
								<Button
									onClick={goToNextStep}
									className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium"
								>
									Next: Assets & Possessions
								</Button>
							</div>
						)}
					</div>
				);
			case "assetsPossessions":
				return (
					<div>
						<AssetsPossessionsStep />
						<div className="flex justify-between pt-6">
							<Button
								onClick={goToPreviousStep}
								variant="outline"
								className="px-6 py-2"
							>
								Previous: Personal & Family
							</Button>
							<Button
								onClick={goToNextStep}
								className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
							>
								Next: Funeral & Legacy
							</Button>
						</div>
					</div>
				);
			case "funeralEndOfLife":
				return (
					<div>
						<FuneralEndOfLifeStep />
						<div className="flex justify-between pt-6">
							<Button
								onClick={goToPreviousStep}
								variant="outline"
								className="px-6 py-2"
							>
								Previous: Assets & Possessions
							</Button>
							<Button
								onClick={goToNextStep}
								className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
							>
								Next: Instructions & Charitable Donations
							</Button>
						</div>
					</div>
				);
			case "instructionsLegacy":
				return (
					<div>
						<InstructionsLegacyStep ref={instructionsStepRef} />
						<div className="flex justify-between pt-6">
							<Button
								onClick={goToPreviousStep}
								variant="outline"
								className="px-6 py-2"
							>
								Previous: Funeral & Legacy
							</Button>
							<Button
								onClick={() =>
									instructionsStepRef.current?.handlePayAndSubmit()
								}
								disabled={instructionsStepRef.current?.isProcessingPayment}
								className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium"
							>
								{instructionsStepRef.current?.isProcessingPayment ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white mr-2"></div>
										Processing...
									</>
								) : (
									<>
										<CreditCard className="mr-2 h-4 w-4" />
										Pay and Submit
									</>
								)}
							</Button>
						</div>
					</div>
				);
			default:
				return <div>Step not found</div>;
		}
	};

	// Show loading state - wait for both will data and letter data to be ready
	if (contextLoading || !willData || !letterData) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">
						{!willData
							? "Loading will data..."
							: "Initializing Letter of Wishes..."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col lg:flex-row min-h-screen">
			{/* Main Content Area */}
			<div className="flex-1 container mx-auto py-4 lg:py-8 px-4 lg:px-8">
				<div className="max-w-4xl">
					{/* Progress Indicator */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-gray-700">
								Step {currentStepIndex + 1} of {STEP_ORDER.length}
							</span>
							<span className="text-sm text-gray-500">
								{Math.round(((currentStepIndex + 1) / STEP_ORDER.length) * 100)}
								% Complete
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="bg-primary h-2 rounded-full transition-all duration-300"
								style={{
									width: `${
										((currentStepIndex + 1) / STEP_ORDER.length) * 100
									}%`,
								}}
							></div>
						</div>
					</div>

					{/* Mobile Knowledge Base Toggle */}
					<div className="lg:hidden mb-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
							className="flex items-center gap-2"
						>
							{showKnowledgeBase ? (
								<>
									<X className="h-4 w-4" />
									Hide Help
								</>
							) : (
								<>
									<BookOpen className="h-4 w-4" />
									Show Help
								</>
							)}
						</Button>
					</div>

					{/* Mobile Knowledge Base */}
					{showKnowledgeBase && (
						<div className="lg:hidden mb-6">
							<KnowledgeBaseSidebar currentStep={currentStep} />
						</div>
					)}

					<div className="pt-2 lg:pt-6 space-y-6">{renderCurrentStep()}</div>
				</div>
			</div>

			{/* Knowledge Base Sidebar - Hidden on mobile, visible on large screens */}
			<div className="hidden lg:block">
				<KnowledgeBaseSidebar currentStep={currentStep} />
			</div>
		</div>
	);
}
