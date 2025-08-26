import { useEffect, useState, useMemo, useCallback } from "react";
import { useWillWizard } from "@/context/WillWizardContext";
import { useWill } from "@/context/WillContext";
import { useRelationships } from "@/context/RelationshipsContext";
import { QuestionType, WillFormData } from "./types/will.types";
import KnowledgeBaseSidebar from "./components/KnowledgeBaseSidebar";
import { Button } from "@/components/ui/button";
import { BookOpen, X } from "lucide-react";

import { useWillOwnerData } from "@/hooks/useWillOwnerData";
import { useWillData } from "@/hooks/useWillData";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { PersonResponse } from "./types/will.types";

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
	const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
	const { activeWill, setActiveWill } = useWill();
	const { currentStep, setWillWizardState, markStepComplete, setActiveWillId } =
		useWillWizard();

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
		saveWillOwnerData,
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
		refetch,
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

	// Handle spouse data saving
	// This function ensures that after saving spouse data, the latest willOwnerData and spouseData
	// are re-fetched and passed down to SpouseStep, keeping the UI in sync with the backend.
	const handleSpouseDataSave = async (data: {
		firstName: string;
		lastName: string;
	}): Promise<boolean> => {
		if (!activeWill?.id || !willOwnerData?.id) {
			toast.error(
				"Will information not found. Please start from the beginning."
			);
			return false;
		}

		// Check if relationships are loaded
		if (!relationships || relationships.length === 0) {
			toast.error(
				"Relationships are still loading. Please wait a moment and try again."
			);
			return false;
		}

		try {
			// Debug: Log all available relationships
			console.log("Available relationships:", relationships);
			console.log("Looking for spouse relationship...");

			// Find the spouse relationship ID - try multiple possible names
			const spouseRelationship = relationships.find((rel) => {
				const name = rel.name.toLowerCase();
				return (
					name === "spouse" ||
					name === "husband" ||
					name === "wife" ||
					name === "partner" ||
					name === "civil partner" ||
					name === "spouse/partner"
				);
			});

			console.log("Found spouse relationship:", spouseRelationship);

			if (!spouseRelationship) {
				console.error(
					"Spouse relationship not found. Available relationships:",
					relationships.map((r) => ({ id: r.id, name: r.name }))
				);
				toast.error("Spouse relationship type not found. Please try again.");
				return false;
			}

			// Check if we're editing an existing spouse or creating a new one
			const isEditing = !!spouseData?.id;
			console.log("isEditing", isEditing);
			console.log("spouseData", spouseData);

			if (isEditing && spouseData) {
				// Update existing spouse record
				const updateData = {
					first_name: data.firstName,
					last_name: data.lastName,
				};

				const { error: updateError } = await apiClient<PersonResponse>(
					`/people/${spouseData.id}`,
					{
						method: "PATCH",
						body: JSON.stringify(updateData),
					}
				);

				if (updateError) {
					console.error("Error updating spouse record:", updateError);
					return false;
				}

				// Update activeWill context with updated spouse information
				if (activeWill) {
					setActiveWill({
						...activeWill,
						spouse: {
							id: spouseData.id,
							firstName: data.firstName,
							lastName: data.lastName,
						},
					});
				}
			} else {
				// Step 1: Update marital status to "married" (only for new spouses)
				const success = await saveWillOwnerData({ maritalStatus: "married" });
				if (!success) {
					return false;
				}

				// Step 2: Create new spouse record
				const spouseRequestData = {
					first_name: data.firstName,
					last_name: data.lastName,
					relationship_id: spouseRelationship.id,
					will_id: activeWill.id,
				};

				const { data: personResponse, error: personError } =
					await apiClient<PersonResponse>("/people", {
						method: "POST",
						body: JSON.stringify(spouseRequestData),
					});

				if (personError) {
					console.error("Error creating spouse record:", personError);
					return false;
				}

				// Update activeWill with new spouse information
				if (activeWill && personResponse) {
					setActiveWill({
						...activeWill,
						spouse: {
							id: personResponse.id,
							firstName: data.firstName,
							lastName: data.lastName,
						},
					});
				}
			}

			// After saving, always reload the latest will owner data (which includes spouse)
			await loadWillOwnerData(activeWill.id); // This will update willOwnerData and spouseData in the parent
			await refetch();
			return true;
		} catch (error) {
			console.error("Error in handleSpouseDataSave:", error);
			return false;
		}
	};

	// Handle form updates
	const handleFormUpdate = useCallback((data: Partial<WillFormData>) => {
		setFormData((prev) => ({ ...prev, ...data }));
	}, []);

	// Handle will owner data saving
	const handleWillOwnerDataSave = useCallback(
		async (_data: unknown): Promise<boolean> => {
			// This function will handle saving will owner data
			// For now, return true to allow navigation
			return true;
		},
		[]
	);

	const handleNext = useCallback(async () => {
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
	}, [currentQuestion, markStepComplete, setWillWizardState, formData]);

	const handleBack = useCallback(() => {
		switch (currentQuestion) {
			case "familyInfo":
				setWillWizardState(true, "personalInfo");
				break;
			case "guardians":
				setWillWizardState(true, "familyInfo");
				break;
			case "residuary":
				setWillWizardState(true, "guardians");
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
	}, [currentQuestion, setWillWizardState]);

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
					<PersonalInfoStep
						{...commonProps}
						willOwnerData={willOwnerData}
						onWillOwnerDataSave={handleWillOwnerDataSave}
					/>
				);

			case "familyInfo":
				return (
					<FamilyInfoStep
						{...commonProps}
						willOwnerData={willOwnerData}
						spouseData={spouseData}
						onSpouseDataSave={handleSpouseDataSave}
						isLoadingOwnerData={_isLoadingOwnerData}
					/>
				);

			case "guardians":
				return <GuardiansStep {...commonProps} />;

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
					{/* Mobile Knowledge Base Toggle - Only show if not on review step */}
					{currentQuestion !== "review" && (
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

					{/* Mobile Knowledge Base - Only show if not on review step */}
					{showKnowledgeBase && currentQuestion !== "review" && (
						<div className="lg:hidden mb-6">
							<KnowledgeBaseSidebar currentStep={currentQuestion} />
						</div>
					)}

					<div className="pt-2 lg:pt-6 space-y-6">{renderQuestion()}</div>
				</div>
			</div>

			{/* Knowledge Base Sidebar - Hidden on mobile, visible on large screens, but not on review step */}
			{currentQuestion !== "review" && (
				<div className="hidden lg:block">
					<KnowledgeBaseSidebar currentStep={currentQuestion} />
				</div>
			)}
		</div>
	);
}
