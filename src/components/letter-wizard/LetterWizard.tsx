import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { apiClient } from "@/utils/apiClient";
import { WillData } from "@/context/WillContext";
import { toast } from "sonner";
import { LetterOfWishesService } from "@/services/letterOfWishesService";

// CompleteWillData interface for the get-full-will API response
interface CompleteWillData {
	id: string;
	created_at: string;
	user_id: string;
	status: string;
	last_updated_at: string;
	payment_status: string;
	owner: {
		id: string;
		will_id: string;
		created_at: string;
		first_name: string;
		last_name: string;
		marital_status: string;
		address: string;
		city: string;
		state: string;
		post_code: string;
		country: string;
	};
	spouse?: {
		id: string;
		user_id: string;
		will_id: string;
		relationship_id: string;
		first_name: string;
		last_name: string;
		is_minor: boolean;
		created_at: string;
		is_witness: boolean;
	};
	children: Array<{
		id: string;
		user_id: string;
		will_id: string;
		relationship_id: string;
		first_name: string;
		last_name: string;
		is_minor: boolean;
		created_at: string;
		is_witness: boolean;
	}>;
	guardians: Array<{
		will_id: string;
		created_at: string;
		is_primary: boolean;
		guardian_id: string;
		person: {
			id: string;
			user_id: string;
			will_id: string;
			relationship_id: string;
			first_name: string;
			last_name: string;
			is_minor: boolean;
			created_at: string;
			is_witness: boolean;
		};
	}>;
	funeral_instructions?: {
		id: string;
		created_at: string;
		wishes: string;
		will_id: string;
		user_id: string;
	};
}
import { Button } from "@/components/ui/button";
import KnowledgeBaseSidebar from "./components/KnowledgeBaseSidebar";
import { BookOpen, X, CreditCard } from "lucide-react";

// Import step components
import PersonalFamilyStep from "./steps/PersonalFamilyStep";
import AssetsPossessionsStep from "./steps/AssetsPossessionsStep";
import FuneralEndOfLifeStep, {
	FuneralEndOfLifeStepHandle,
} from "./steps/FuneralEndOfLifeStep";
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

	// Add refs for the steps
	const instructionsStepRef =
		useRef<InstructionsCharitableDonationsStepHandle>(null);
	const funeralEndOfLifeStepRef = useRef<FuneralEndOfLifeStepHandle>(null);

	const {
		willData,
		setWillData,
		letterData,
		currentStep: contextCurrentStep,
		setCurrentStep: setContextCurrentStep,
		isLoading: contextLoading,
		setIsLoading: setContextLoading,
		initializeLetterForWill,
		setLetterData,
	} = useLetterOfWishes();

	// Update currentStep when currentStepIndex changes
	useEffect(() => {
		setContextCurrentStep(STEP_ORDER[currentStepIndex]);
	}, [currentStepIndex, setContextCurrentStep]);

	const willId = searchParams.get("willId");

	// Clear will data when willId changes to prevent stale data
	useEffect(() => {
		if (willId && willData && willData.id !== willId) {
			console.log("Will ID changed, clearing stale will data");
			setWillData(null);
		}
	}, [willId, willData, setWillData]);

	// Always load will data when Letter of Wishes is invoked
	useEffect(() => {
		const loadWillData = async () => {
			if (!willId) {
				toast.error("No will specified for Letter of Wishes");
				navigate("/app/dashboard");
				return;
			}

			// Always load will data fresh to ensure we have the latest information
			console.log("Loading will data for willId:", willId);
			setContextLoading(true);
			try {
				const { data, error } = await apiClient<CompleteWillData>(
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
					console.log("Transforming will data from CompleteWillData format...");
					// Transform CompleteWillData to WillData format
					const transformedWill: WillData = {
						id: will.id,
						lastUpdatedAt: will.last_updated_at,
						createdAt: will.created_at,
						status: will.status,
						userId: will.user_id,
						paymentStatus: will.payment_status,
						owner: {
							firstName: will.owner.first_name,
							lastName: will.owner.last_name,
							address: will.owner.address,
							city: will.owner.city,
							state: will.owner.state,
							postCode: will.owner.post_code,
							country: will.owner.country,
							maritalStatus: will.owner.marital_status,
						},
						spouse: will.spouse
							? {
									firstName: will.spouse.first_name,
									lastName: will.spouse.last_name,
							  }
							: undefined,
						children: will.children?.map(
							(child: CompleteWillData["children"][0]) => ({
								id: child.id,
								firstName: child.first_name,
								lastName: child.last_name,
								isMinor: child.is_minor,
							})
						),
						guardians: will.guardians?.map(
							(guardian: CompleteWillData["guardians"][0]) => ({
								id: guardian.guardian_id,
								firstName: guardian.person.first_name,
								lastName: guardian.person.last_name,
								relationship: guardian.person.relationship_id, // This might need relationship name mapping
								isPrimary: guardian.is_primary,
							})
						),
						funeralInstructions: will.funeral_instructions
							? {
									wishes: will.funeral_instructions.wishes,
							  }
							: undefined,
						assets: [],
						gifts: [],
						beneficiaries: [],
						executors: [],
						witnesses: [],
					};

					setWillData(transformedWill);
					console.log("Will data successfully loaded and transformed!");
					console.log(
						"Funeral instructions:",
						transformedWill.funeralInstructions
					);
					console.log("Guardians:", transformedWill.guardians);
				}
			} catch (error) {
				console.error("Error loading will data:", error);
				toast.error("Failed to load will data");
				navigate("/app/dashboard");
			} finally {
				setContextLoading(false);
			}
		};

		loadWillData();
	}, [willId, setWillData, setContextLoading, navigate]);

	// Separate effect to initialize letter data after will data is loaded
	useEffect(() => {
		const initializeLetterData = async () => {
			if (willId && willData && !letterData) {
				console.log("Initializing letter data for will:", willId);

				try {
					// Get or create a Letter of Wishes to ensure we have an ID
					const letterResponse = await LetterOfWishesService.getOrCreate(
						willId
					);

					// Initialize letter data with the actual ID
					initializeLetterForWill(willId, letterResponse.id);

					console.log("Letter data initialized with ID:", letterResponse.id);
				} catch (error) {
					console.error("Error initializing Letter of Wishes:", error);
					toast.error("Failed to initialize Letter of Wishes");
				}
			}
		};

		initializeLetterData();
	}, [willId, willData, letterData, initializeLetterForWill]);

	// Navigation functions
	const goToNextStep = useCallback(async () => {
		// If we're on the personalFamily step, submit the data first
		if (currentStepIndex === 0 && letterData && willId) {
			try {
				// Ensure we have a valid Letter of Wishes ID
				let letterId = letterData.id;

				if (!letterId) {
					console.log(
						"No Letter of Wishes ID found, creating or getting existing one..."
					);
					try {
						const letterResponse = await LetterOfWishesService.getOrCreate(
							willId
						);
						letterId = letterResponse.id;

						// Update the letter data with the ID
						if (setLetterData) {
							setLetterData({
								...letterData,
								id: letterId,
							});
						}
					} catch (error) {
						console.error("Error creating/getting Letter of Wishes:", error);
						toast.error("Failed to initialize Letter of Wishes");
						return;
					}
				}

				if (!letterId) {
					console.error(
						"Still no Letter of Wishes ID available after creation attempt"
					);
					toast.error("Failed to get Letter of Wishes ID");
					return;
				}

				// Helper function to convert empty strings to null
				const toNullIfEmpty = (
					value: string | undefined | null
				): string | null => {
					return value?.trim() || null;
				};

				// Submit personal notes data when moving to next step
				const personalNotesData = {
					id: letterData.personalNotesId || undefined,
					guardian_reason: toNullIfEmpty(
						letterData.guardianshipPreferences?.reasonForChoice
					),
					notes: toNullIfEmpty(letterData.notesToLovedOnes),
					guardian_values: toNullIfEmpty(
						letterData.guardianshipPreferences?.valuesAndHopes
					),
				};

				console.log("Submitting personal notes data:", personalNotesData);

				await LetterOfWishesService.submitPersonalNotes(
					letterId,
					personalNotesData
				);

				toast.success("Personal notes submitted successfully");
			} catch (error) {
				console.error("Error submitting personal notes:", error);
				toast.error("Failed to submit personal notes");
				return; // Don't proceed if submission failed
			}
		} else if (currentStepIndex === 2 && letterData && willId) {
			// If we're on the funeralEndOfLife step, submit professional instructions
			try {
				// Ensure we have a valid Letter of Wishes ID
				let letterId = letterData.id;

				if (!letterId) {
					console.log(
						"No Letter of Wishes ID found, creating or getting existing one..."
					);
					try {
						const letterResponse = await LetterOfWishesService.getOrCreate(
							willId
						);
						letterId = letterResponse.id;

						// Update the letter data with the ID
						if (setLetterData) {
							setLetterData({
								...letterData,
								id: letterId,
							});
						}
					} catch (error) {
						console.error("Error creating/getting Letter of Wishes:", error);
						toast.error("Failed to initialize Letter of Wishes");
						return;
					}
				}

				if (!letterId) {
					console.error(
						"Still no Letter of Wishes ID available after creation attempt"
					);
					toast.error("Failed to get Letter of Wishes ID");
					return;
				}

				// Submit professional instructions when moving to next step
				if (funeralEndOfLifeStepRef.current) {
					const success =
						await funeralEndOfLifeStepRef.current.submitProfessionalInstructions();
					if (!success) {
						toast.error("Failed to submit professional instructions");
						return; // Don't proceed if submission failed
					}
					toast.success("Professional instructions submitted successfully");
				}
			} catch (error) {
				console.error("Error submitting professional instructions:", error);
				toast.error("Failed to submit professional instructions");
				return; // Don't proceed if submission failed
			}
		} else if (currentStepIndex === 0 && !willId) {
			console.error("No willId available for Letter of Wishes");
			toast.error("Will ID not found");
			return;
		}

		if (currentStepIndex < STEP_ORDER.length - 1) {
			setCurrentStepIndex(currentStepIndex + 1);
			setContextCurrentStep(STEP_ORDER[currentStepIndex + 1]);
		}
	}, [
		currentStepIndex,
		setContextCurrentStep,
		letterData,
		willId,
		setLetterData,
		funeralEndOfLifeStepRef,
	]);

	const goToPreviousStep = useCallback(() => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex(currentStepIndex - 1);
			setContextCurrentStep(STEP_ORDER[currentStepIndex - 1]);
		}
	}, [currentStepIndex, setContextCurrentStep]);

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
						<FuneralEndOfLifeStep ref={funeralEndOfLifeStepRef} />
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
							<KnowledgeBaseSidebar currentStep={contextCurrentStep} />
						</div>
					)}

					<div className="pt-2 lg:pt-6 space-y-6">{renderCurrentStep()}</div>
				</div>
			</div>

			{/* Knowledge Base Sidebar - Hidden on mobile, visible on large screens */}
			<div className="hidden lg:block">
				<KnowledgeBaseSidebar currentStep={contextCurrentStep} />
			</div>
		</div>
	);
}
