import { useEffect, useState } from "react";
import { useWillWizard } from "@/context/WillWizardContext";
import { useWill } from "@/context/WillContext";
import { useRelationships } from "@/context/RelationshipsContext";
import { QuestionType, WillFormData } from "./types/will.types";
import KnowledgeBaseSidebar from "./components/KnowledgeBaseSidebar";
import { Button } from "@/components/ui/button";
import { BookOpen, X } from "lucide-react";

// Import step components
import PersonalInfoStep from "./steps/PersonalInfoStep";
import FamilyInfoStep from "./steps/FamilyInfoStep";
import GuardiansStep from "./steps/GuardiansStep";
import AssetsStep from "./steps/AssetsStep";
import GiftsStep from "./steps/GiftsStep";
import DigitalAssetsStep from "./steps/DigitalAssetsStep";
import ResiduaryStep from "./steps/ResiduaryStep";
import ExecutorStep from "./steps/ExecutorStep";
import FuneralInstructionsStep from "./steps/FuneralInstructionsStep";
import ReviewStep from "./steps/ReviewStep";

export default function WillWizard() {
	const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
	const { currentStep, setWillWizardState, markStepComplete, setActiveWillId } =
		useWillWizard();

	const { activeWill } = useWill();
	const {
		relationships,
		isLoading: relationshipsLoading,
		error: relationshipsError,
	} = useRelationships();

	const [formData, setFormData] = useState<WillFormData>({
		firstName: "",
		lastName: "",
		phone: "",
		address: {
			address: "",
			city: "",
			state: "",
			postCode: "",
			country: "",
		},
		hasSpouse: false,
		hasChildren: false,
		children: [],
		guardians: [],
		hasPets: false,
		hasAssets: false,
		assets: [],
		digitalAssets: undefined,
		otherBeneficiaries: [],
		gifts: [],
		residuaryBeneficiaries: [],
		executors: [],
		witnesses: [],
		funeralInstructions: {
			wishes: "",
		},
	});

	const [willOwnerData, setWillOwnerData] = useState<{
		firstName: string;
		lastName: string;
		address: string;
		city: string;
		state: string;
		postCode: string;
		country: string;
	} | null>(null);

	// Get the current question from the URL or default to personalInfo
	const currentQuestion: QuestionType = currentStep || "personalInfo";

	// Load will owner data when activeWill changes
	useEffect(() => {
		if (activeWill?.owner) {
			setWillOwnerData({
				firstName: activeWill.owner.firstName || "",
				lastName: activeWill.owner.lastName || "",
				address: activeWill.owner.address || "",
				city: activeWill.owner.city || "",
				state: activeWill.owner.state || "",
				postCode: activeWill.owner.postCode || "",
				country: activeWill.owner.country || "",
			});
			setFormData((prev) => ({
				...prev,
				firstName: activeWill.owner.firstName || "",
				lastName: activeWill.owner.lastName || "",
				address: {
					address: activeWill.owner.address || "",
					city: activeWill.owner.city || "",
					state: activeWill.owner.state || "",
					postCode: activeWill.owner.postCode || "",
					country: activeWill.owner.country || "",
				},
			}));
		}
	}, [
		activeWill?.owner?.firstName,
		activeWill?.owner?.lastName,
		activeWill?.owner?.address,
		activeWill?.owner?.city,
		activeWill?.owner?.state,
		activeWill?.owner?.postCode,
		activeWill?.owner?.country,
	]);

	// Set will wizard state when component mounts and when step changes
	useEffect(() => {
		setWillWizardState(true, currentQuestion);

		// Cleanup function to set wizard state to false when component unmounts
		return () => {
			setWillWizardState(false);
		};
	}, [currentQuestion, setWillWizardState]);

	// Initialize progress tracking when activeWill is available
	useEffect(() => {
		console.log("🎯 WillWizard: activeWill changed to:", activeWill?.id);
		if (activeWill?.id) {
			console.log(
				"🚀 WillWizard: Calling setActiveWillId with:",
				activeWill.id
			);
			setActiveWillId(activeWill.id);
		}
	}, [activeWill?.id, setActiveWillId]);

	// Debug: Log relationships loading state
	useEffect(() => {
		console.log("WillWizard - Relationships state:", {
			count: relationships.length,
			loading: relationshipsLoading,
			error: relationshipsError,
			relationships: relationships.map((r) => ({ id: r.id, name: r.name })),
		});
	}, [relationships, relationshipsLoading, relationshipsError]);

	// Handle form updates
	const handleFormUpdate = (data: Partial<WillFormData>) => {
		setFormData((prev) => ({ ...prev, ...data }));
	};

	// Handle will owner data saving
	const handleWillOwnerDataSave = async (_data: unknown): Promise<boolean> => {
		// This function will handle saving will owner data
		// For now, return true to allow navigation
		return true;
	};

	const handleNext = async () => {
		// Mark current step as complete before moving to next step
		console.log("🚀 handleNext called for step:", currentQuestion);
		await markStepComplete(currentQuestion);

		switch (currentQuestion) {
			case "personalInfo":
				setWillWizardState(true, "familyInfo");
				break;
			case "familyInfo":
				setWillWizardState(true, "guardians");
				break;
			case "guardians":
				setWillWizardState(true, "hasAssets");
				break;
			case "hasAssets":
				setWillWizardState(true, "gifts");
				break;
			case "gifts":
				setWillWizardState(true, "digitalAssets");
				break;
			case "digitalAssets":
				setWillWizardState(true, "residuary");
				break;
			case "residuary":
				setWillWizardState(true, "executors");
				break;
			case "executors":
				setWillWizardState(true, "funeralInstructions");
				break;
			case "funeralInstructions":
				setWillWizardState(true, "review");
				break;
			case "review":
				// Handle final submission
				console.log("🎯 Final submission - form data:", formData);
				break;
			default:
				console.warn("Unknown step:", currentQuestion);
		}
	};

	const handleBack = () => {
		switch (currentQuestion) {
			case "familyInfo":
				setWillWizardState(true, "personalInfo");
				break;
			case "guardians":
				setWillWizardState(true, "familyInfo");
				break;
			case "hasAssets":
				setWillWizardState(true, "guardians");
				break;
			case "gifts":
				setWillWizardState(true, "hasAssets");
				break;
			case "digitalAssets":
				setWillWizardState(true, "gifts");
				break;
			case "residuary":
				setWillWizardState(true, "digitalAssets");
				break;
			case "executors":
				setWillWizardState(true, "residuary");
				break;
			case "funeralInstructions":
				setWillWizardState(true, "executors");
				break;
			case "review":
				setWillWizardState(true, "funeralInstructions");
				break;
			default:
				console.warn("Unknown step for back navigation:", currentQuestion);
		}
	};

	// Render different content based on current question
	const renderQuestion = () => {
		const commonProps = {
			data: formData,
			onUpdate: handleFormUpdate,
			onNext: handleNext,
			onBack: handleBack,
		};

		switch (currentQuestion) {
			case "personalInfo":
				return (
					<PersonalInfoStep
						{...commonProps}
						willOwnerData={willOwnerData}
						onWillOwnerDataSave={handleWillOwnerDataSave}
					/>
				);

			case "familyInfo":
				return <FamilyInfoStep {...commonProps} />;

			case "guardians":
				return <GuardiansStep {...commonProps} />;

			case "hasAssets":
				return <AssetsStep {...commonProps} />;

			case "gifts":
				return <GiftsStep {...commonProps} />;

			case "digitalAssets":
				return <DigitalAssetsStep {...commonProps} />;

			case "residuary":
				return <ResiduaryStep {...commonProps} />;

			case "executors":
				return (
					<ExecutorStep
						data={formData.executors || []}
						onUpdate={(data) => handleFormUpdate({ executors: data })}
						onNext={handleNext}
						onBack={handleBack}
					/>
				);

			case "funeralInstructions":
				return <FuneralInstructionsStep {...commonProps} />;

			case "review":
				return <ReviewStep onSave={handleNext} onBack={handleBack} />;

			default:
				return (
					<PersonalInfoStep
						{...commonProps}
						willOwnerData={willOwnerData}
						onWillOwnerDataSave={handleWillOwnerDataSave}
					/>
				);
		}
	};

	return (
		<div className="flex flex-col lg:flex-row min-h-screen">
			{/* Main Content Area */}
			<div className="flex-1 container mx-auto py-4 lg:py-8 px-4 lg:px-8">
				<div className="max-w-3xl mx-auto">
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
							<KnowledgeBaseSidebar currentStep={currentQuestion} />
						</div>
					)}

					<div className="pt-2 lg:pt-6 space-y-6">{renderQuestion()}</div>
				</div>
			</div>

			{/* Knowledge Base Sidebar - Hidden on mobile, visible on large screens */}
			<div className="hidden lg:block">
				<KnowledgeBaseSidebar currentStep={currentQuestion} />
			</div>
		</div>
	);
}
