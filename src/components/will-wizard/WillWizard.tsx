import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonalInfoStep, { PersonalInfoData } from "./steps/PersonalInfoStep";
import AssetsStep, { Asset } from "./steps/AssetsStep";
import BeneficiariesStep, { Beneficiary } from "./steps/BeneficiariesStep";
import ExecutorStep, { ExecutorData } from "./steps/ExecutorStep";
import ReviewStep from "./steps/ReviewStep";

const steps = [
	{ id: "personal", title: "Personal Information" },
	{ id: "assets", title: "Assets" },
	{ id: "beneficiaries", title: "Beneficiaries" },
	{ id: "executor", title: "Executor" },
	{ id: "review", title: "Review" },
] as const;

interface WillFormData {
	personal: Partial<PersonalInfoData>;
	assets: Asset[];
	beneficiaries: Beneficiary[];
	executor: Partial<ExecutorData>;
}

export default function WillWizard() {
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<WillFormData>({
		personal: {},
		assets: [],
		beneficiaries: [],
		executor: {},
	});

	const updateFormData = <K extends keyof WillFormData>(
		step: K,
		data: WillFormData[K]
	) => {
		setFormData((prev) => ({
			...prev,
			[step]: data,
		}));
	};

	const handleNext = () => {
		setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
	};

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
	};

	const renderStep = () => {
		switch (currentStep) {
			case 0:
				return (
					<PersonalInfoStep
						data={formData.personal}
						onUpdate={(data) => updateFormData("personal", data)}
					/>
				);
			case 1:
				return (
					<AssetsStep
						data={formData.assets}
						onUpdate={(data) => updateFormData("assets", data)}
					/>
				);
			case 2:
				return (
					<BeneficiariesStep
						data={formData.beneficiaries}
						onUpdate={(data) => updateFormData("beneficiaries", data)}
					/>
				);
			case 3:
				return (
					<ExecutorStep
						data={formData.executor}
						onUpdate={(data) => updateFormData("executor", data)}
					/>
				);
			case 4:
				return <ReviewStep data={formData} />;
			default:
				return null;
		}
	};

	return (
		<div className="container mx-auto py-8">
			<Card className="max-w-4xl mx-auto">
				<CardHeader>
					<CardTitle>Create Your Will</CardTitle>
					<div className="flex justify-between items-center mt-4">
						{steps.map((step, index) => (
							<div
								key={step.id}
								className={`flex items-center ${
									index !== steps.length - 1 ? "flex-1" : ""
								}`}
							>
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center ${
										index <= currentStep
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground"
									}`}
								>
									{index + 1}
								</div>
								{index !== steps.length - 1 && (
									<div
										className={`h-1 flex-1 mx-2 ${
											index < currentStep ? "bg-primary" : "bg-muted"
										}`}
									/>
								)}
							</div>
						))}
					</div>
				</CardHeader>
				<CardContent>
					<div className="py-4">{renderStep()}</div>
					<div className="flex justify-between mt-6">
						<Button
							variant="outline"
							onClick={handleBack}
							disabled={currentStep === 0}
						>
							Back
						</Button>
						<Button
							onClick={handleNext}
							disabled={currentStep === steps.length - 1}
						>
							{currentStep === steps.length - 2 ? "Review" : "Next"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
