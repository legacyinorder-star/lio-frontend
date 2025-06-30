import { useWillWizard } from "@/context/WillWizardContext";
import { QuestionType } from "@/components/will-wizard/types/will.types";

export function WillWizardSidebar() {
	const { currentStep, getStepInfo } = useWillWizard();

	// Define the step order
	const stepOrder: QuestionType[] = [
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

	const currentStepIndex = currentStep ? stepOrder.indexOf(currentStep) : -1;

	const getStepStatus = (stepIndex: number) => {
		if (stepIndex < currentStepIndex) return "completed";
		if (stepIndex === currentStepIndex) return "current";
		return "upcoming";
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
						{stepOrder.map((step, index) => {
							const status = getStepStatus(index);

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
							{stepOrder.map((step, index) => {
								const stepInfo = getStepInfo(step);
								const status = getStepStatus(index);

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
													: "text-[#909090]"
											}`}
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
