import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WillFormData, QuestionType, NewBeneficiary } from "./types/will.types";
import type { ExecutorData } from "./steps/ExecutorStep";
import WillGuard from "./WillGuard";
import {
	useWill,
	type WillData,
	type WillPersonalData,
} from "@/context/WillContext";
import { useWillOwnerData } from "@/hooks/useWillOwnerData";
import { apiClient } from "@/utils/apiClient";
import { useRelationships } from "@/hooks/useRelationships";
import { toast } from "sonner";

// Import step components
import NameStep from "./steps/NameStep";
import AddressStep from "./steps/AddressStep";
import SpouseStep from "./steps/SpouseStep";
import ChildrenStep from "./steps/ChildrenStep";
import AssetsStep from "./steps/AssetsStep";
import GiftsStep from "./steps/GiftsStep";
import ResiduaryStep from "./steps/ResiduaryStep";
import WitnessesStep from "./steps/WitnessesStep";
import FuneralInstructionsStep from "./steps/FuneralInstructionsStep";
import ReviewStep from "./steps/ReviewStep";
import ExecutorStep from "./steps/ExecutorStep";
import GuardiansStep from "./steps/GuardiansStep";

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
	// Track the current question being shown
	const [currentQuestion, setCurrentQuestion] = useState<QuestionType>("name");
	const { activeWill, setActiveWill } = useWill();
	const { relationships } = useRelationships();
	const {
		willOwnerData,
		spouseData,
		isLoading: _isLoadingOwnerData,
		loadWillOwnerData,
		saveWillOwnerData,
	} = useWillOwnerData();

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
		hasAssets: false,
		assets: [],
		otherBeneficiaries: [],
		gifts: [],
		residuaryBeneficiaries: [],
		executors: [],
		witnesses: [],
		funeralInstructions: {
			instructions: "",
		},
	});

	// Load will owner data when activeWill changes
	useEffect(() => {
		if (activeWill?.id && !willOwnerData) {
			loadWillOwnerData(activeWill.id);
		}
	}, [activeWill?.id, willOwnerData, loadWillOwnerData]);

	// Update activeWill context when willOwnerData changes
	useEffect(() => {
		if (
			willOwnerData &&
			activeWill &&
			willOwnerData.id !== activeWill.owner?.id
		) {
			setActiveWill({
				...activeWill,
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
	}, [
		willOwnerData?.id,
		willOwnerData?.firstName,
		willOwnerData?.lastName,
		willOwnerData?.maritalStatus,
		willOwnerData?.address,
		willOwnerData?.city,
		willOwnerData?.state,
		willOwnerData?.postCode,
		willOwnerData?.country,
		spouseData?.id,
		spouseData?.firstName,
		spouseData?.lastName,
		activeWill?.owner?.id,
		setActiveWill,
	]);

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

	// Handle spouse data saving
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

		try {
			// Find the spouse relationship ID
			const spouseRelationship = relationships.find(
				(rel) => rel.name.toLowerCase() === "spouse"
			);

			if (!spouseRelationship) {
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

			// Reload will owner data to get updated spouse information
			await loadWillOwnerData(activeWill.id);
			return true;
		} catch (error) {
			console.error("Error in handleSpouseDataSave:", error);
			return false;
		}
	};

	const handleNext = () => {
		switch (currentQuestion) {
			case "name":
				setCurrentQuestion("address");
				break;
			case "address":
				setCurrentQuestion("hasSpouse");
				break;
			case "hasSpouse":
				setCurrentQuestion("hasChildren");
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
					setCurrentQuestion("guardians");
				} else {
					setCurrentQuestion("hasAssets");
				}
				break;
			case "guardians":
				setCurrentQuestion("hasAssets");
				break;
			case "hasAssets":
				setCurrentQuestion("gifts");
				break;
			case "gifts":
				setCurrentQuestion("residuary");
				break;
			case "residuary":
				setCurrentQuestion("executors");
				break;
			case "executors":
				setCurrentQuestion("witnesses");
				break;
			case "witnesses":
				setCurrentQuestion("funeralInstructions");
				break;
			case "funeralInstructions":
				setCurrentQuestion("review");
				break;
		}
	};

	const handleBack = () => {
		switch (currentQuestion) {
			case "address":
				setCurrentQuestion("name");
				break;
			case "hasSpouse":
				setCurrentQuestion("address");
				break;
			case "hasChildren":
				setCurrentQuestion("hasSpouse");
				break;
			case "guardians":
				setCurrentQuestion("hasChildren");
				break;
			case "hasAssets":
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
					setCurrentQuestion("guardians");
				} else {
					setCurrentQuestion("hasChildren");
				}
				break;
			case "gifts":
				setCurrentQuestion("hasAssets");
				break;
			case "residuary":
				setCurrentQuestion("gifts");
				break;
			case "executors":
				setCurrentQuestion("residuary");
				break;
			case "witnesses":
				setCurrentQuestion("executors");
				break;
			case "funeralInstructions":
				setCurrentQuestion("witnesses");
				break;
			case "review":
				setCurrentQuestion("funeralInstructions");
				break;
		}
	};

	// Calculate progress
	const totalQuestions = 12; // Update this if you add/remove questions
	const questionOrder: QuestionType[] = [
		"name",
		"address",
		"hasSpouse",
		"hasChildren",
		"guardians",
		"hasAssets",
		"gifts",
		"residuary",
		"executors",
		"witnesses",
		"funeralInstructions",
		"review",
	];
	const progress = questionOrder.indexOf(currentQuestion) + 1;
	const progressPercent = (progress / totalQuestions) * 100;

	// Transform form data for step components
	const getBeneficiaries = (): NewBeneficiary[] => {
		const beneficiaries: NewBeneficiary[] = [];

		// Add spouse if exists
		if (formData.hasSpouse && formData.spouse) {
			beneficiaries.push({
				id: "spouse",
				firstName: formData.spouse.firstName,
				lastName: formData.spouse.lastName,
				relationship: "Spouse",
				type: "spouse",
				allocation: "100",
			});
		}

		// Add children
		formData.children.forEach((child) => {
			beneficiaries.push({
				id: child.id,
				firstName: child.firstName,
				lastName: child.lastName,
				relationship: "Child",
				type: "child",
				allocation: "100",
			});
		});

		// Add other beneficiaries
		beneficiaries.push(...formData.otherBeneficiaries);

		return beneficiaries;
	};

	// Transform form data for review step
	const getReviewData = () => {
		return {
			personal: {
				fullName: `${formData.firstName} ${formData.lastName}`,
				dateOfBirth: "", // Add empty dateOfBirth for now
				address: `${formData.address.address}, ${formData.address.city}, ${formData.address.state} ${formData.address.postCode}, ${formData.address.country}`,
				phone: formData.phone,
				maritalStatus: formData.hasSpouse ? "Married" : "Single",
			},
			assets: formData.assets.map((asset) => ({
				type: asset.assetType,
				description: asset.description,
				distributionType: asset.distributionType,
				beneficiaries: asset.beneficiaries,
			})),
			beneficiaries: getBeneficiaries().map((ben) => ({
				id: ben.id,
				fullName: `${ben.firstName} ${ben.lastName}`,
				relationship: ben.relationship,
				allocation: parseInt(ben.allocation),
				requiresGuardian:
					ben.type === "child" &&
					formData.children.find((c) => c.id === ben.id)?.isMinor,
			})),
			executors: formData.executors.map((exec) => ({
				fullName:
					exec.type === "individual"
						? `${exec.firstName} ${exec.lastName}`
						: undefined,
				companyName: exec.type === "corporate" ? exec.companyName : undefined,
				relationship: exec.relationship,
				address: `${exec.address.address}, ${exec.address.city}, ${exec.address.state} ${exec.address.postCode}, ${exec.address.country}`,
				isPrimary: exec.isPrimary,
				type: exec.type,
				registrationNumber: exec.registrationNumber,
			})),
			witnesses: formData.witnesses.map((wit) => ({
				fullName: `${wit.firstName} ${wit.lastName}`,
				address: `${wit.address.address}, ${wit.address.city}, ${wit.address.state} ${wit.address.postCode}, ${wit.address.country}`,
			})),
			guardians: formData.guardians.map((guard) => ({
				fullName: `${guard.firstName} ${guard.lastName}`,
				relationship: guard.relationship,
				isPrimary: guard.isPrimary,
			})),
			gifts: formData.gifts.map((gift) => ({
				type: gift.type as string,
				description: gift.description,
				value: gift.value?.toString(),
				beneficiaryId: gift.peopleId || gift.charitiesId || "",
				beneficiaryName:
					getBeneficiaries().find(
						(b) => b.id === (gift.peopleId || gift.charitiesId)
					)?.firstName +
					" " +
					getBeneficiaries().find(
						(b) => b.id === (gift.peopleId || gift.charitiesId)
					)?.lastName,
			})),
			residuaryBeneficiaries: formData.residuaryBeneficiaries,
			funeralInstructions: formData.funeralInstructions,
		};
	};

	// Render different content based on current question
	const renderQuestion = () => {
		const commonProps = {
			data: formData,
			onUpdate: (data: Partial<WillFormData>) => {
				setFormData((prev) => ({ ...prev, ...data }));
			},
			onNext: handleNext,
			onBack: handleBack,
		};

		switch (currentQuestion) {
			case "name":
				return (
					<NameStep
						{...commonProps}
						willOwnerData={willOwnerData}
						onWillOwnerDataSave={saveWillOwnerData}
					/>
				);

			case "address":
				return (
					<AddressStep
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
					/>
				);

			case "hasChildren":
				return <ChildrenStep {...commonProps} />;

			case "guardians":
				return <GuardiansStep {...commonProps} />;

			case "hasAssets":
				return <AssetsStep {...commonProps} />;

			case "gifts":
				return <GiftsStep {...commonProps} />;

			case "residuary":
				return <ResiduaryStep {...commonProps} />;

			case "executors": {
				// Convert formData.executors to ExecutorData format for ExecutorStep
				const executorData: ExecutorData = formData.executors.map(
					(executor) => ({
						id: executor.id,
						type: executor.type,
						firstName: executor.firstName,
						lastName: executor.lastName,
						relationshipId: executor.relationship,
						name: executor.companyName,
						rc_number: executor.registrationNumber,
						isPrimary: executor.isPrimary,
					})
				);

				return (
					<ExecutorStep
						data={executorData}
						onUpdate={(data: ExecutorData) => {
							// Convert ExecutorData back to WillFormData.executors format
							const convertedExecutors = data.map((executor) => ({
								id: executor.id,
								type: executor.type,
								firstName: executor.firstName || "",
								lastName: executor.lastName || "",
								relationship: executor.relationshipId || "",
								companyName: executor.name || "",
								registrationNumber: executor.rc_number || "",
								contactPerson: "",
								isPrimary: executor.isPrimary,
								address: {
									address: "",
									city: "",
									state: "",
									postCode: "",
									country: "",
								},
								email: "",
								phone: "",
							}));
							setFormData((prev) => ({
								...prev,
								executors: convertedExecutors,
							}));
						}}
						onNext={handleNext}
						onBack={handleBack}
					/>
				);
			}

			case "witnesses":
				return <WitnessesStep {...commonProps} />;

			case "funeralInstructions":
				return <FuneralInstructionsStep {...commonProps} />;

			case "review":
				return <ReviewStep data={getReviewData()} onBack={handleBack} />;

			default:
				return null;
		}
	};

	return (
		<WillGuard currentStep={currentQuestion}>
			<div className="container mx-auto py-8">
				<Card className="max-w-3xl mx-auto">
					<CardHeader>
						<CardTitle>Create Your Will</CardTitle>
						{/* Progress bar */}
						<div className="w-full bg-muted h-2 rounded-full mt-4">
							<div
								className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
						<div className="text-xs text-muted-foreground mt-1">
							Question {progress} of {totalQuestions}
						</div>
					</CardHeader>
					<CardContent className="pt-6">{renderQuestion()}</CardContent>
				</Card>
			</div>
		</WillGuard>
	);
}
