import { Check, Lock } from "lucide-react";
import { QuestionType, StepCompletion } from "../types/will.types";
import { cn } from "@/lib/utils";

interface StepNavigationProps {
	currentStep: QuestionType;
	completedSteps: StepCompletion;
	onStepClick: (step: QuestionType) => void;
}

const STEPS: { key: QuestionType; label: string; required: boolean }[] = [
	{ key: "name", label: "Personal Info", required: true },
	{ key: "address", label: "Address", required: true },
	{ key: "hasSpouse", label: "Spouse", required: true },
	{ key: "hasChildren", label: "Children", required: true },
	{ key: "guardians", label: "Guardians", required: false },
	{ key: "pets", label: "Pets", required: false },
	{ key: "hasAssets", label: "Assets", required: true },
	{ key: "gifts", label: "Gifts", required: false },
	{ key: "residuary", label: "Residuary", required: true },
	{ key: "executors", label: "Executors", required: true },
	{ key: "witnesses", label: "Witnesses", required: true },
	{ key: "funeralInstructions", label: "Funeral", required: false },
	{ key: "review", label: "Review", required: true },
];

export default function StepNavigation({
	currentStep,
	completedSteps,
	onStepClick,
}: StepNavigationProps) {
	const isStepAccessible = (stepKey: QuestionType): boolean => {
		const stepIndex = STEPS.findIndex((s) => s.key === stepKey);

		// Check if all previous required steps are completed
		for (let i = 0; i < stepIndex; i++) {
			const prevStep = STEPS[i];
			if (prevStep.required && !completedSteps[prevStep.key]) {
				return false;
			}
		}
		return true;
	};

	const getStepStatus = (stepKey: QuestionType) => {
		if (completedSteps[stepKey]) return "completed";
		if (stepKey === currentStep) return "current";
		if (isStepAccessible(stepKey)) return "accessible";
		return "locked";
	};

	return (
		<div className="bg-white border-r border-gray-200 w-64 min-h-screen p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-6">
				Will Creation Progress
			</h3>

			<div className="space-y-2">
				{STEPS.map((step, index) => {
					const status = getStepStatus(step.key);
					const isClickable = status === "completed" || status === "accessible";

					return (
						<button
							key={step.key}
							onClick={() => isClickable && onStepClick(step.key)}
							disabled={!isClickable}
							className={cn(
								"w-full flex items-center p-3 rounded-lg text-left transition-colors",
								{
									"bg-green-50 border border-green-200 text-green-800":
										status === "completed",
									"bg-blue-50 border border-blue-200 text-blue-800":
										status === "current",
									"hover:bg-gray-50 text-gray-700": status === "accessible",
									"text-gray-400 cursor-not-allowed": status === "locked",
								}
							)}
						>
							<div className="flex items-center justify-between w-full">
								<div className="flex items-center space-x-3">
									<div
										className={cn(
											"flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
											{
												"bg-green-500 text-white": status === "completed",
												"bg-blue-500 text-white": status === "current",
												"bg-gray-200 text-gray-600": status === "accessible",
												"bg-gray-100 text-gray-400": status === "locked",
											}
										)}
									>
										{status === "completed" ? (
											<Check className="w-4 h-4" />
										) : status === "locked" ? (
											<Lock className="w-3 h-3" />
										) : (
											index + 1
										)}
									</div>
									<span className="font-medium">{step.label}</span>
								</div>
								{!step.required && (
									<span className="text-xs text-gray-500">Optional</span>
								)}
							</div>
						</button>
					);
				})}
			</div>

			{/* Progress Bar */}
			<div className="mt-6">
				<div className="flex justify-between text-sm text-gray-600 mb-2">
					<span>Progress</span>
					<span>
						{Object.values(completedSteps).filter(Boolean).length} /{" "}
						{STEPS.length}
					</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className="bg-blue-500 h-2 rounded-full transition-all duration-300"
						style={{
							width: `${
								(Object.values(completedSteps).filter(Boolean).length /
									STEPS.length) *
								100
							}%`,
						}}
					/>
				</div>
			</div>
		</div>
	);
}
