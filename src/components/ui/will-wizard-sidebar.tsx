import { useWillWizard } from "@/context/WillWizardContext";
import { useWillWizardNavigation } from "@/hooks/useWillWizardNavigation";
import { QuestionType } from "@/components/will-wizard/types/will.types";

export function WillWizardSidebar() {
	const { currentStep, getStepInfo, completedSteps, canAccessStep } =
		useWillWizard();
	const { navigateToStep } = useWillWizardNavigation();

	// Define the step order
	const stepOrder: QuestionType[] = [
		"name",
		"address",
		"hasSpouse",
		"hasChildren",
		"guardians",
		"pets",
		"hasAssets",
		"gifts",
		"digitalAssets",
		"residuary",
		"executors",
		"funeralInstructions",
		"review",
	];

	const getStepStatus = (step: QuestionType) => {
		if (completedSteps[step]) return "completed";
		if (step === currentStep) return "current";
		if (canAccessStep(step)) return "accessible";
		return "locked";
	};

	const handleStepClick = (step: QuestionType) => {
		if (canAccessStep(step)) {
			navigateToStep(step);
		}
	};

	return (
		<div className="w-80 bg-white h-full overflow-y-auto">
			<div className="p-6">
				<div className="flex">
					{/* Single Vertical Pill containing all markers */}
					<div
						className="p-2 mr-6 flex flex-col space-y-4 flex-shrink-0"
						style={{
							backgroundColor: "#F2F2F2",
							borderRadius: "1.5rem",
						}}
					>
						{stepOrder.map((step, _index) => {
							const status = getStepStatus(step);

							return (
								<div
									key={step}
									className="flex items-center justify-center"
									style={{ height: "28px" }}
								>
									<img
										src={
											status === "completed"
												? "/svgs/pill_2.svg"
												: "/svgs/pill_1.svg"
										}
										alt=""
										className="w-6 h-6"
										style={{
											filter:
												status === "current"
													? "brightness(0) saturate(100%) invert(15%) sepia(30%) saturate(1084%) hue-rotate(118deg) brightness(94%) contrast(93%)"
													: status === "locked"
													? "brightness(0) saturate(100%) invert(75%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
													: undefined,
										}}
									/>
								</div>
							);
						})}
					</div>

					{/* Section Names */}
					<div className="flex-1">
						<ul className="space-y-4 mt-3">
							{stepOrder.map((step, _index) => {
								const stepInfo = getStepInfo(step);
								const status = getStepStatus(step);
								const isClickable = canAccessStep(step);

								return (
									<li
										key={step}
										className="flex items-center"
										style={{ height: "28px" }}
									>
										<div
											className={`text-sm transition-colors ${
												status === "current"
													? "text-[#0F433E] font-semibold"
													: status === "completed"
													? "text-[#173C37] font-semibold"
													: status === "accessible"
													? "text-[#0F433E] font-medium"
													: "text-[#909090]"
											} ${
												isClickable
													? "cursor-pointer hover:text-[#0F433E]"
													: "cursor-not-allowed"
											}`}
											onClick={() => handleStepClick(step)}
										>
											{stepInfo.name}
										</div>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
