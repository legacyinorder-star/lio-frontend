import { useState, useEffect, useCallback } from "react";
import { WillFormData } from "./types/will.types";
import WillGuard from "./WillGuard";
import {
	useWill,
	type WillData,
	type WillPersonalData,
} from "@/context/WillContext";
import { useWillOwnerData } from "@/hooks/useWillOwnerData";
import { useWillData } from "@/hooks/useWillData";
import { apiClient } from "@/utils/apiClient";
import { useRelationships } from "@/hooks/useRelationships";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWillWizard } from "@/context/WillWizardContext";
import { useWillWizardNavigation } from "@/hooks/useWillWizardNavigation";
import KnowledgeBaseSidebar from "./components/KnowledgeBaseSidebar";
import { BookOpen, X } from "lucide-react";

// Import step components
import PersonalInfoStep from "./steps/PersonalInfoStep";
import SpouseStep from "./steps/SpouseStep";
import ChildrenStep from "./steps/ChildrenStep";
import AssetsStep from "./steps/AssetsStep";
import GiftsStep from "./steps/GiftsStep";
import DigitalAssetsStep from "./steps/DigitalAssetsStep";

import ResiduaryStep from "./steps/ResiduaryStep";

import FuneralInstructionsStep from "./steps/FuneralInstructionsStep";
import ReviewStep from "./steps/ReviewStep";
import ExecutorStep from "./steps/ExecutorStep";
import GuardiansStep from "./steps/GuardiansStep";
import PetsStep from "./steps/PetsStep";

// Spouse API response interface
interface PersonResponse {
	id: string;
	will_id: string;
	first_name: string;
	last_name: string;
	relationship_id: string;
	is_minor: boolean;
	created_at: string;
}

export default function WillWizard() {
	const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
	const { activeWill, setActiveWill } = useWill();
	const { setWillWizardState, setActiveWillId, markStepComplete } =
		useWillWizard();
	const { currentUrlStep, navigateToStep } = useWillWizardNavigation();

	// Use URL-based current step, fallback to "personalInfo" if not available
	const currentQuestion = currentUrlStep || "personalInfo";

	const {
		relationships,
		isLoading: relationshipsLoading,
		error: relationshipsError,
	} = useRelationships();
	const {
		willOwnerData,
		spouseData,
		isLoading: _isLoadingOwnerData,
		loadWillOwnerData,
		saveWillOwnerData,
	} = useWillOwnerData();

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

	// Data collection
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
		spouse: undefined,
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

	// Load will owner data when activeWill changes - FIXED VERSION
	useEffect(() => {
		if (activeWill?.id && !willOwnerData) {
			console.log("Loading will owner data for will:", activeWill.id);
			loadWillOwnerData(activeWill.id);
		}
	}, [activeWill?.id, willOwnerData]); // ✅ Removed loadWillOwnerData from deps

	// Memoize the setActiveWill to prevent unnecessary re-renders
	const updateActiveWill = useCallback(
		(updates: Partial<WillData>) => {
			if (activeWill) {
				setActiveWill({ ...activeWill, ...updates });
			}
		},
		[activeWill, setActiveWill]
	);

	// Update activeWill context when willOwnerData changes - OPTIMIZED VERSION
	useEffect(() => {
		if (
			willOwnerData &&
			activeWill &&
			willOwnerData.id !== activeWill.owner?.id
		) {
			console.log("Updating activeWill with willOwnerData");
			updateActiveWill({
				owner: {
					...activeWill.owner,
					id: willOwnerData.id,
					firstName: willOwnerData.firstName,
					lastName: willOwnerData.lastName,
					maritalStatus: willOwnerData.maritalStatus,
					address: willOwnerData.address,
					city: willOwnerData.city,
					state: willOwnerData.state,
					postCode: willOwnerData.postCode,
					country: willOwnerData.country,
				},
				...(spouseData && {
					spouse: {
						id: spouseData.id,
						firstName: spouseData.firstName,
						lastName: spouseData.lastName,
					},
				}),
			});
		}
	}, [willOwnerData, spouseData, activeWill?.owner?.id, updateActiveWill]); // ✅ Simplified deps

	// Load active will data into formData when component mounts or activeWill changes
	useEffect(() => {
		if (activeWill?.owner) {
			// Check if the structure is different than expected
			const activeWillAny = activeWill as WillData & {
				first_name?: string;
				last_name?: string;
				firstName?: string;
				lastName?: string;
			};
			const ownerAny = activeWill.owner as WillPersonalData & {
				first_name?: string;
				last_name?: string;
			};
			const firstName =
				activeWill.owner?.firstName ||
				ownerAny?.first_name ||
				activeWillAny.first_name ||
				activeWillAny.firstName;
			const lastName =
				activeWill.owner?.lastName ||
				ownerAny?.last_name ||
				activeWillAny.last_name ||
				activeWillAny.lastName;

			// Only update if the names are different from current formData
			if (
				(firstName || lastName) &&
				(firstName !== formData.firstName || lastName !== formData.lastName)
			) {
				setFormData((prev) => {
					const updated = {
						...prev,
						firstName: firstName || prev.firstName,
						lastName: lastName || prev.lastName,
					};
					return updated;
				});
			}
		}
	}, [
		activeWill?.owner?.firstName,
		activeWill?.owner?.lastName,
		formData.firstName,
		formData.lastName,
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

	const handleNext = async () => {
		// Mark current step as complete before moving to next step
		console.log("🚀 handleNext called for step:", currentQuestion);
		await markStepComplete(currentQuestion);

		switch (currentQuestion) {
			case "personalInfo":
				navigateToStep("hasSpouse");
				break;
			case "hasSpouse":
				navigateToStep("hasChildren");
				break;
			case "hasChildren":
				if (
					activeWill?.children &&
					activeWill.children.length > 0 &&
					activeWill.children.some((child) => {
						// Handle both camelCase and snake_case property names
						const childAny = child as typeof child & {
							is_minor?: boolean;
						};
						return child.isMinor || childAny.is_minor || false;
					})
				) {
					navigateToStep("guardians");
				} else {
					navigateToStep("pets");
				}
				break;
			case "guardians":
				navigateToStep("pets");
				break;
			case "pets":
				navigateToStep("hasAssets");
				break;
			case "hasAssets":
				navigateToStep("gifts");
				break;
			case "gifts":
				navigateToStep("digitalAssets");
				break;
			case "digitalAssets":
				navigateToStep("residuary");
				break;
			case "residuary":
				navigateToStep("executors");
				break;
			case "executors":
				navigateToStep("funeralInstructions");
				break;
			case "funeralInstructions":
				navigateToStep("review");
				break;
		}
	};

	const handleBack = () => {
		switch (currentQuestion) {
			case "hasSpouse":
				navigateToStep("personalInfo");
				break;
			case "hasChildren":
				navigateToStep("hasSpouse");
				break;
			case "guardians":
				navigateToStep("hasChildren");
				break;
			case "pets":
				if (
					activeWill?.children &&
					activeWill.children.length > 0 &&
					activeWill.children.some((child) => {
						// Handle both camelCase and snake_case property names
						const childAny = child as typeof child & {
							is_minor?: boolean;
						};
						return child.isMinor || childAny.is_minor || false;
					})
				) {
					navigateToStep("guardians");
				} else {
					navigateToStep("hasChildren");
				}
				break;
			case "hasAssets":
				navigateToStep("pets");
				break;
			case "gifts":
				navigateToStep("hasAssets");
				break;
			case "digitalAssets":
				navigateToStep("gifts");
				break;
			case "residuary":
				navigateToStep("digitalAssets");
				break;
			case "executors":
				navigateToStep("residuary");
				break;
			case "funeralInstructions":
				navigateToStep("executors");
				break;
			case "review":
				navigateToStep("funeralInstructions");
				break;
		}
	};

	// Render different content based on current question
	const renderQuestion = () => {
		// Show loading state if relationships are not loaded for spouse step
		if (currentQuestion === "hasSpouse" && relationshipsLoading) {
			return (
				<div className="space-y-4">
					<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
						Are you married or in a legally recognized civil relationship?
					</div>
					<div className="text-muted-foreground">
						Loading relationship types...
					</div>
					<div className="flex justify-center py-8">
						<div className="flex items-center gap-2">
							<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black"></div>
							<span>Loading relationships...</span>
						</div>
					</div>
				</div>
			);
		}

		// Show error state if relationships failed to load
		if (currentQuestion === "hasSpouse" && relationshipsError) {
			return (
				<div className="space-y-4">
					<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-red-600">
						Error Loading Relationships
					</div>
					<div className="text-muted-foreground">
						Unable to load relationship types. Please refresh the page and try
						again.
					</div>
					<div className="text-sm text-red-500">
						Error: {relationshipsError}
					</div>
					<Button
						onClick={() => window.location.reload()}
						className="bg-red-600 hover:bg-red-700"
					>
						Refresh Page
					</Button>
				</div>
			);
		}

		const commonProps = {
			data: formData,
			onUpdate: (data: Partial<WillFormData>) => {
				setFormData((prev) => ({ ...prev, ...data }));
			},
			onNext: async () => {
				await handleNext();
			},
			onBack: handleBack,
		};

		switch (currentQuestion) {
			case "personalInfo":
				return (
					<PersonalInfoStep
						{...commonProps}
						willOwnerData={willOwnerData}
						onWillOwnerDataSave={saveWillOwnerData}
					/>
				);

			case "hasSpouse":
				return (
					<SpouseStep
						{...commonProps}
						willOwnerData={willOwnerData}
						spouseData={spouseData}
						onSpouseDataSave={handleSpouseDataSave}
						isLoadingOwnerData={_isLoadingOwnerData}
					/>
				);

			case "hasChildren":
				return <ChildrenStep {...commonProps} />;

			case "guardians":
				return <GuardiansStep {...commonProps} />;

			case "pets":
				return <PetsStep {...commonProps} guardians={formData.guardians} />;

			case "hasAssets":
				return (
					<AssetsStep
						onUpdate={commonProps.onUpdate}
						onNext={commonProps.onNext}
						onBack={commonProps.onBack}
					/>
				);

			case "gifts":
				return (
					<GiftsStep
						onNext={(data) => {
							commonProps.onUpdate(data);
							commonProps.onNext();
						}}
						onBack={commonProps.onBack}
					/>
				);

			case "digitalAssets":
				return (
					<DigitalAssetsStep
						onNext={commonProps.onNext}
						onBack={commonProps.onBack}
					/>
				);

			case "residuary":
				return (
					<ResiduaryStep
						onNext={async (data) => {
							commonProps.onUpdate(data);
							await commonProps.onNext();
						}}
						onBack={commonProps.onBack}
						initialData={{
							residuaryBeneficiaries: formData.residuaryBeneficiaries || [],
						}}
					/>
				);

			case "executors":
				return (
					<ExecutorStep
						data={formData.executors || []}
						onUpdate={(data) => {
							commonProps.onUpdate({ executors: data });
						}}
						onNext={async () => {
							await commonProps.onNext();
						}}
						onBack={commonProps.onBack}
					/>
				);

			case "funeralInstructions":
				return <FuneralInstructionsStep {...commonProps} />;

			case "review":
				return (
					<ReviewStep onSave={commonProps.onNext} onBack={commonProps.onBack} />
				);

			default:
				return null;
		}
	};

	return (
		<WillGuard currentStep={currentQuestion}>
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
		</WillGuard>
	);
}
