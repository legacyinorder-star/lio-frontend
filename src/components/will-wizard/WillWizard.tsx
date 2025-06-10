import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WillFormData, QuestionType, NewBeneficiary } from "./types/will.types";
import type { ExecutorData } from "./steps/ExecutorStep";
import WillGuard from "./WillGuard";

// Import step components
import NameStep from "./steps/NameStep";
import AddressStep from "./steps/AddressStep";
import SpouseStep from "./steps/SpouseStep";
import ChildrenStep from "./steps/ChildrenStep";
import AssetsStep from "./steps/AssetsStep";
import GiftsStep from "./steps/GiftsStep";
import WitnessesStep from "./steps/WitnessesStep";
import FuneralInstructionsStep from "./steps/FuneralInstructionsStep";
import AdditionalInstructionsStep from "./steps/AdditionalInstructionsStep";
import ReviewStep from "./steps/ReviewStep";
import ExecutorStep from "./steps/ExecutorStep";
import GuardiansStep from "./steps/GuardiansStep";

export default function WillWizard() {
	// Track the current question being shown
	const [currentQuestion, setCurrentQuestion] = useState<QuestionType>("name");

	// Data collection
	const [formData, setFormData] = useState<WillFormData>({
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		phone: "",
		address: {
			street: "",
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
		additionalInstructions: "",
		funeralInstructions: {
			disposition: null,
			location: "",
		},
	});

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
					formData.hasChildren &&
					formData.children.some((child) => child.isMinor)
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
				setCurrentQuestion("executors");
				break;
			case "executors":
				setCurrentQuestion("witnesses");
				break;
			case "witnesses":
				setCurrentQuestion("funeralInstructions");
				break;
			case "funeralInstructions":
				setCurrentQuestion("additionalInstructions");
				break;
			case "additionalInstructions":
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
				setCurrentQuestion(
					formData.hasChildren &&
						formData.children.some((child) => child.isMinor)
						? "guardians"
						: "hasChildren"
				);
				break;
			case "gifts":
				setCurrentQuestion("hasAssets");
				break;
			case "executors":
				setCurrentQuestion("gifts");
				break;
			case "witnesses":
				setCurrentQuestion("executors");
				break;
			case "funeralInstructions":
				setCurrentQuestion("witnesses");
				break;
			case "additionalInstructions":
				setCurrentQuestion("funeralInstructions");
				break;
			case "review":
				setCurrentQuestion("additionalInstructions");
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
		"executors",
		"witnesses",
		"funeralInstructions",
		"additionalInstructions",
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
				email: "",
				phone: formData.spouse.phone,
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
				email: "",
				phone: "",
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
				dateOfBirth: formData.dateOfBirth,
				address: `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.postCode}, ${formData.address.country}`,
				phone: formData.phone,
				maritalStatus: formData.hasSpouse ? "Married" : "Single",
			},
			assets: formData.assets.map((asset) => ({
				type: asset.type,
				description: asset.description,
				value: asset.value,
				distributionType: asset.distributionType,
				beneficiaries: asset.beneficiaries,
			})),
			beneficiaries: getBeneficiaries().map((ben) => ({
				id: ben.id,
				fullName: `${ben.firstName} ${ben.lastName}`,
				relationship: ben.relationship,
				email: ben.email,
				phone: ben.phone,
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
				email: exec.email,
				phone: exec.phone,
				address: `${exec.address.street}, ${exec.address.city}, ${exec.address.state} ${exec.address.postCode}, ${exec.address.country}`,
				isPrimary: exec.isPrimary,
				type: exec.type,
				contactPerson: exec.contactPerson,
				registrationNumber: exec.registrationNumber,
			})),
			witnesses: formData.witnesses.map((wit) => ({
				fullName: `${wit.firstName} ${wit.lastName}`,
				address: `${wit.address.street}, ${wit.address.city}, ${wit.address.state} ${wit.address.postCode}, ${wit.address.country}`,
			})),
			guardians: formData.guardians.map((guard) => ({
				fullName: `${guard.firstName} ${guard.lastName}`,
				relationship: guard.relationship,
				isPrimary: guard.isPrimary,
			})),
			gifts: formData.gifts.map((gift) => ({
				type: gift.type,
				description: gift.description,
				value: gift.value?.toString(),
				beneficiaryId: gift.beneficiaryId,
				beneficiaryName:
					getBeneficiaries().find((b) => b.id === gift.beneficiaryId)
						?.firstName +
					" " +
					getBeneficiaries().find((b) => b.id === gift.beneficiaryId)?.lastName,
			})),
			residuaryBeneficiaries: formData.residuaryBeneficiaries,
			funeralInstructions: formData.funeralInstructions,
			additionalInstructions: formData.additionalInstructions,
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
				return <NameStep {...commonProps} />;

			case "address":
				return <AddressStep {...commonProps} />;

			case "hasSpouse":
				return <SpouseStep {...commonProps} />;

			case "hasChildren":
				return <ChildrenStep {...commonProps} />;

			case "guardians":
				return <GuardiansStep {...commonProps} />;

			case "hasAssets":
				return (
					<AssetsStep {...commonProps} beneficiaries={getBeneficiaries()} />
				);

			case "gifts":
				return (
					<GiftsStep {...commonProps} beneficiaries={getBeneficiaries()} />
				);

			case "executors": {
				const executor = formData.executors[0] || {};
				const executorData: Partial<ExecutorData> = {
					fullName:
						executor.type === "individual"
							? `${executor.firstName || ""} ${executor.lastName || ""}`.trim()
							: "",
					relationship: executor.relationship || "",
					email: executor.email || "",
					phone: executor.phone || "",
					address: executor.address
						? `${executor.address.street}, ${executor.address.city}, ${executor.address.state} ${executor.address.postCode}, ${executor.address.country}`
						: "",
				};
				return (
					<ExecutorStep
						data={executorData}
						onUpdate={(data) => {
							const [firstName, ...lastNameParts] = (data.fullName || "").split(
								" "
							);
							const lastName = lastNameParts.join(" ");
							setFormData((prev) => ({
								...prev,
								executors: [
									{
										...prev.executors[0],
										type: "individual",
										firstName,
										lastName,
										relationship: data.relationship,
										email: data.email,
										phone: data.phone,
										address: {
											street: (data.address?.split(",")[0] || "").trim(),
											city: (data.address?.split(",")[1] || "").trim(),
											state: (data.address?.split(",")[2] || "")
												.trim()
												.split(" ")[0],
											postCode: (data.address?.split(",")[2] || "")
												.trim()
												.split(" ")[1],
											country: (data.address?.split(",")[3] || "").trim(),
										},
										isPrimary: true,
									},
								],
							}));
						}}
					/>
				);
			}

			case "witnesses":
				return <WitnessesStep {...commonProps} />;

			case "funeralInstructions":
				return <FuneralInstructionsStep {...commonProps} />;

			case "additionalInstructions":
				return <AdditionalInstructionsStep {...commonProps} />;

			case "review":
				return <ReviewStep data={getReviewData()} />;

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
