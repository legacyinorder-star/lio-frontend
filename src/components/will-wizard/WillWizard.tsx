import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWillWizard } from "@/context/WillWizardContext";
import { useWill } from "@/context/WillContext";
import { useRelationships } from "@/context/RelationshipsContext";
import { QuestionType, WillFormData } from "./types/will.types";
import KnowledgeBaseSidebar from "./components/KnowledgeBaseSidebar";
import DisclaimerGuard from "./DisclaimerGuard";
import { Button } from "@/components/ui/button";
import { BookOpen, X } from "lucide-react";

import { useWillOwnerData } from "@/hooks/useWillOwnerData";
import { useWillData } from "@/hooks/useWillData";

// Import step components
import PersonalInfoStep from "./steps/PersonalInfoStep";
import FamilyInfoStep from "./steps/FamilyInfoStep";
import GuardiansStep from "./steps/GuardiansStep";
import AssetsStep from "./steps/AssetsStep";
import GiftsStep from "./steps/GiftsStep";
import ResiduaryStep from "./steps/ResiduaryStep";
import ExecutorStep from "./steps/ExecutorStep";
import FuneralInstructionsStep from "./steps/FuneralInstructionsStep";
import ReviewStep from "./steps/ReviewStep";

export default function WillWizard() {
	const navigate = useNavigate();
	const { step: urlStep } = useParams<{ step: string }>();
	const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
	const { activeWill } = useWill();
	const { currentStep, setWillWizardState, markStepComplete, setActiveWillId } =
		useWillWizard();

	// Handle case where user visits /app/create-will without step parameter
	useEffect(() => {
		if (!urlStep) {
			console.log("🔄 No step parameter found, redirecting to personalInfo");
			navigate("/app/create-will/personalInfo", { replace: true });
			return;
		}
	}, [urlStep, navigate]);

	//const { activeWill } = useWill();
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
		otherBeneficiaries: [],
		gifts: [],
		residuaryBeneficiaries: [],
		executors: [],
		witnesses: [],
		funeralInstructions: {
			wishes: "",
		},
	});

	const {
		willOwnerData,
		spouseData,
		isLoading: _isLoadingOwnerData,
		loadWillOwnerData,
	} = useWillOwnerData();

	// Get the current question from the URL or default to personalInfo
	const currentQuestion: QuestionType = currentStep || "personalInfo";

	// Conditional data loading based on current step
	const needsBeneficiaryData = [
		"hasAssets",
		"gifts",
		"residuary",
		"review",
	].includes(currentQuestion);

	// Only load beneficiary data when needed
	const {
		allBeneficiaries: _allBeneficiaries,
		isLoading: _isLoadingBeneficiaries,
	} = useWillData(needsBeneficiaryData);

	// Load will owner data when activeWill changes
	useEffect(() => {
		if (activeWill?.id && !willOwnerData) {
			console.log("Loading will owner data for will:", activeWill.id);
			loadWillOwnerData(activeWill.id);
		}
	}, [activeWill?.id, willOwnerData]); // ✅ Removed loadWillOwnerData from deps
	// useEffect(() => {
	// 	if (activeWill?.owner) {
	// 		setWillOwnerData({
	// 			firstName: activeWill.owner.firstName || "",
	// 			lastName: activeWill.owner.lastName || "",
	// 			address: activeWill.owner.address || "",
	// 			city: activeWill.owner.city || "",
	// 			state: activeWill.owner.state || "",
	// 			postCode: activeWill.owner.postCode || "",
	// 			country: activeWill.owner.country || "",
	// 		});
	// 		setFormData((prev) => ({
	// 			...prev,
	// 			firstName: activeWill.owner.firstName || "",
	// 			lastName: activeWill.owner.lastName || "",
	// 			address: {
	// 				address: activeWill.owner.address || "",
	// 				city: activeWill.owner.city || "",
	// 				state: activeWill.owner.state || "",
	// 				postCode: activeWill.owner.postCode || "",
	// 				country: activeWill.owner.country || "",
	// 			},
	// 		}));
	// 	}
	// }, [
	// 	activeWill?.owner?.firstName,
	// 	activeWill?.owner?.lastName,
	// 	activeWill?.owner?.address,
	// 	activeWill?.owner?.city,
	// 	activeWill?.owner?.state,
	// 	activeWill?.owner?.postCode,
	// 	activeWill?.owner?.country,
	// ]);

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
			console.log("🚀 WillWizard: setActiveWillId call completed");
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
	const handleFormUpdate = useCallback((data: Partial<WillFormData>) => {
		setFormData((prev) => ({ ...prev, ...data }));
	}, []);

	const handleNext = useCallback(async () => {
		// Mark current step as complete before moving to next step
		console.log("🚀 WillWizard: handleNext called for step:", currentQuestion);
		console.log("📊 WillWizard: Current form data:", formData);
		console.log(
			"🔧 WillWizard: About to call markStepComplete for:",
			currentQuestion
		);
		await markStepComplete(currentQuestion);
		console.log(
			"🔧 WillWizard: markStepComplete completed for:",
			currentQuestion
		);

		// Helper function to check if there are minor children
		const hasMinorChildren = () => {
			// Check both formData and activeWill for children data
			const childrenFromForm = formData.children || [];
			const childrenFromContext = activeWill?.children || [];
			const allChildren = [...childrenFromForm, ...childrenFromContext];

			// Remove duplicates based on id
			const uniqueChildren = allChildren.filter(
				(child, index, self) =>
					index === self.findIndex((c) => c.id === child.id)
			);

			return uniqueChildren.some((child) => child.isMinor);
		};

		switch (currentQuestion) {
			case "personalInfo":
				setWillWizardState(true, "familyInfo");
				break;
			case "familyInfo":
				// Conditional navigation based on whether user has minor children or pets
				console.log("🔍 WillWizard familyInfo navigation:", {
					formDataHasPets: formData.hasPets,
					hasMinorChildren: hasMinorChildren(),
					fullFormData: formData,
				});
				if (hasMinorChildren() || formData.hasPets) {
					console.log(
						"✅ User has minor children or pets - navigating to guardians"
					);
					setWillWizardState(true, "guardians");
				} else {
					console.log(
						"⏭️ No minor children or pets - skipping guardians, going to residuary"
					);
					setWillWizardState(true, "residuary");
				}
				break;
			case "guardians":
				setWillWizardState(true, "residuary");
				break;
			case "residuary":
				setWillWizardState(true, "hasAssets");
				break;
			case "hasAssets":
				setWillWizardState(true, "gifts");
				break;
			case "gifts":
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
	}, [
		currentQuestion,
		markStepComplete,
		setWillWizardState,
		formData,
		activeWill,
	]);

	const handleBack = useCallback(() => {
		// Helper function to check if there are minor children
		const hasMinorChildren = () => {
			// Check both formData and activeWill for children data
			const childrenFromForm = formData.children || [];
			const childrenFromContext = activeWill?.children || [];
			const allChildren = [...childrenFromForm, ...childrenFromContext];

			// Remove duplicates based on id
			const uniqueChildren = allChildren.filter(
				(child, index, self) =>
					index === self.findIndex((c) => c.id === child.id)
			);

			return uniqueChildren.some((child) => child.isMinor);
		};

		switch (currentQuestion) {
			case "familyInfo":
				setWillWizardState(true, "personalInfo");
				break;
			case "guardians":
				setWillWizardState(true, "familyInfo");
				break;
			case "residuary":
				// Conditional back navigation - if we have minor children or pets, go back to guardians
				// otherwise go back to familyInfo
				if (hasMinorChildren() || formData.hasPets) {
					console.log(
						"⬅️ Going back to guardians (has minor children or pets)"
					);
					setWillWizardState(true, "guardians");
				} else {
					console.log(
						"⬅️ Going back to familyInfo (no minor children or pets)"
					);
					setWillWizardState(true, "familyInfo");
				}
				break;
			case "hasAssets":
				setWillWizardState(true, "residuary");
				break;
			case "gifts":
				setWillWizardState(true, "hasAssets");
				break;
			case "executors":
				setWillWizardState(true, "gifts");
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
	}, [currentQuestion, setWillWizardState, formData, activeWill]);

	// Memoize common props to prevent infinite re-renders
	const commonProps = useMemo(
		() => ({
			data: formData,
			onUpdate: handleFormUpdate,
			onNext: handleNext,
			onBack: handleBack,
		}),
		[formData, handleFormUpdate, handleNext, handleBack]
	);

	// Render different content based on current question
	const renderQuestion = () => {
		switch (currentQuestion) {
			case "personalInfo":
				return (
					<PersonalInfoStep {...commonProps} willOwnerData={willOwnerData} />
				);

			case "familyInfo":
				return (
					<FamilyInfoStep
						onNext={handleNext}
						onBack={handleBack}
						onUpdate={handleFormUpdate}
						willOwnerData={willOwnerData}
						spouseData={spouseData}
						isLoadingOwnerData={_isLoadingOwnerData}
						initialData={formData}
					/>
				);

			case "guardians":
				return (
					<GuardiansStep
						willId={activeWill?.id || ""}
						hasPets={formData.hasPets || false}
						onNext={handleNext}
						onBack={handleBack}
						onUpdate={handleFormUpdate}
					/>
				);

			case "hasAssets":
				return <AssetsStep {...commonProps} />;

			case "gifts":
				return <GiftsStep {...commonProps} />;

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
					<PersonalInfoStep {...commonProps} willOwnerData={willOwnerData} />
				);
		}
	};

	return (
		<DisclaimerGuard>
			<div className="flex flex-col lg:flex-row min-h-screen">
				{/* Main Content Area */}
				<div className="flex-1 container mx-auto py-4 lg:py-8 px-4 lg:px-8">
					<div className="max-w-3xl mx-auto">
						{/* Mobile Knowledge Base Toggle - Only show if not on review or funeralInstructions step */}
						{currentQuestion !== "review" &&
							currentQuestion !== "funeralInstructions" && (
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
							)}

						{/* Mobile Knowledge Base - Only show if not on review or funeralInstructions step */}
						{showKnowledgeBase &&
							currentQuestion !== "review" &&
							currentQuestion !== "funeralInstructions" && (
								<div className="lg:hidden mb-6">
									<KnowledgeBaseSidebar currentStep={currentQuestion} />
								</div>
							)}

						<div className="pt-2 lg:pt-6 space-y-6">{renderQuestion()}</div>
					</div>
				</div>

				{/* Knowledge Base Sidebar - Hidden on mobile, visible on large screens, but not on review or funeralInstructions step */}
				{currentQuestion !== "review" &&
					currentQuestion !== "funeralInstructions" && (
						<div className="hidden lg:block">
							<KnowledgeBaseSidebar currentStep={currentQuestion} />
						</div>
					)}
			</div>
		</DisclaimerGuard>
	);
}
