import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { Link } from "react-router-dom";

export type QuizOutcome = "GREEN" | "AMBER" | "REFERRAL";

export interface QuizAnswers {
	familyStructure: string[];
	ageAndCapacity: string | null;
	jurisdiction: string | null;
	jointOwnership: string | null;
	businessInterests: string | null;
}

interface WillSuitabilityQuizProps {
	onComplete: (outcome: QuizOutcome, answers: QuizAnswers) => void;
}

const QUESTIONS = [
	{
		id: "ageAndCapacity",
		title: "Age and capacity",
		question:
			"Are you 18 or over, and making this Will freely and with full mental capacity?",
		type: "single",
		options: [
			{ value: "yes", label: "Yes" },
			{ value: "no", label: "No" },
		],
	},
	{
		id: "familyStructure",
		title: "Family structure",
		question: "Which best describes your situation?",
		subtitle: "(select all that apply)",
		type: "multi",
		options: [
			{ value: "married", label: "Married or in a civil partnership" },
			{ value: "single", label: "Single" },
			{ value: "children", label: "Children under 18" },
			{
				value: "blended",
				label:
					"Blended family (children from previous relationships or stepchildren)",
			},
		],
	},
	{
		id: "jurisdiction",
		title: "Jurisdiction",
		question:
			"Are all the assets you want this Will to cover located in England or Wales?",
		type: "single",
		options: [
			{ value: "yes", label: "Yes" },
			{ value: "no", label: "No" },
		],
		infoPanel: {
			showOn: ["no"],
			title: "Important to know",
			content: (
				<>
					<p>
						You can still use Legacy in Order to create a Will for your assets
						in England and Wales. Assets located abroad are usually dealt with
						under a separate Will made in that country.
					</p>
					<p className="mt-2">
						It is important that multiple Wills are carefully structured so they
						work together and do not accidentally cancel each other out.
					</p>
				</>
			),
		},
	},
	{
		id: "jointOwnership",
		title: "Joint ownership",
		question: "Do you own any assets jointly with someone else?",
		subtitle: "(for example, property or bank accounts)",
		type: "single",
		options: [
			{ value: "yes", label: "Yes" },
			{ value: "no", label: "No" },
			{ value: "notSure", label: "Not sure" },
		],
		infoPanel: {
			showOn: ["notSure"],
			title: "Important to know",
			content: (
				<>
					<p>
						If you are unsure how an asset is owned, you can still include it in
						your Will.
					</p>
					<p className="mt-2">
						Jointly owned assets usually pass automatically to the surviving
						owner, regardless of what your Will says. If the asset is owned as
						"tenants in common", your share will pass according to your Will.
					</p>
					<p className="mt-2">
						This is very common and nothing to worry about. You can still
						continue with your online Will.
					</p>
				</>
			),
		},
		infoPanelMain: {
			showOn: ["yes"],
			title: "Important to know",
			content: (
				<>
					<p>
						If an asset is owned jointly, it usually passes automatically to the
						surviving owner, regardless of what your Will says. If the asset is
						owned as "tenants in common", your share will pass according to your
						Will.
					</p>
					<p className="mt-2">
						This is very common and nothing to worry about. You can still
						continue with your online Will.
					</p>
				</>
			),
		},
	},
	{
		id: "businessInterests",
		title: "Business interests",
		question: "Do you own or co-own a business or company shares?",
		subtitle:
			"(This includes limited companies, partnerships, or shares in a private business.)",
		type: "single",
		options: [
			{ value: "no", label: "No" },
			{
				value: "valueOnly",
				label:
					"Yes – but I only want my beneficiaries to receive the value of my shares",
			},
			{
				value: "inheritOrTakeOver",
				label:
					"Yes – and I want my beneficiaries to inherit or take over the business",
			},
			{ value: "notSure", label: "Not sure" },
		],
		infoPanel: {
			showOn: ["valueOnly", "notSure"],
			title: "Information",
			content: (
				<>
					<p>
						Business agreements often take priority over a Will. Your Will can
						only deal with the shares you are entitled to.
					</p>
				</>
			),
		},
		infoPanelMain: {
			showOn: ["inheritOrTakeOver"],
			title: "Information",
			content: (
				<>
					<p>
						Business interests often have separate agreements that decide what
						happens on death. If you want someone to take over or inherit a
						business, extra planning is usually needed.
					</p>
				</>
			),
		},
	},
];

export default function WillSuitabilityQuiz({
	onComplete,
}: WillSuitabilityQuizProps) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<QuizAnswers>({
		familyStructure: [],
		ageAndCapacity: null,
		jurisdiction: null,
		jointOwnership: null,
		businessInterests: null,
	});
	const [showInfoPanel, setShowInfoPanel] = useState(false);
	const [showInfoPanelMain, setShowInfoPanelMain] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);

	const currentQuestion = QUESTIONS[currentQuestionIndex];
	const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
	const isFirstQuestion = currentQuestionIndex === 0;

	// Check if age and capacity answer is "no" - end quiz immediately
	useEffect(() => {
		if (answers.ageAndCapacity === "no") {
			// End quiz immediately with REFERRAL outcome
			const outcome = calculateOutcome(answers);
			onComplete(outcome, answers);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [answers.ageAndCapacity]);

	// Check if current answer should show info panel
	useEffect(() => {
		if (currentQuestion.infoPanel || currentQuestion.infoPanelMain) {
			const currentAnswer = answers[currentQuestion.id as keyof QuizAnswers] as
				| string
				| string[]
				| null;

			// Check for main info panel (e.g., inheritOrTakeOver)
			const shouldShowMain =
				currentQuestion.infoPanelMain?.showOn.some((trigger) => {
					if (Array.isArray(currentAnswer)) {
						return currentAnswer.includes(trigger);
					}
					return currentAnswer === trigger;
				}) ?? false;

			// Check for regular info panel (e.g., valueOnly, notSure)
			const shouldShow =
				currentQuestion.infoPanel?.showOn.some((trigger) => {
					if (Array.isArray(currentAnswer)) {
						return currentAnswer.includes(trigger);
					}
					return currentAnswer === trigger;
				}) ?? false;

			setShowInfoPanel(shouldShow);
			setShowInfoPanelMain(shouldShowMain);
		} else {
			setShowInfoPanel(false);
			setShowInfoPanelMain(false);
		}
	}, [answers, currentQuestion]);

	const handleAnswerChange = (value: string, checked: boolean) => {
		if (currentQuestion.type === "multi") {
			setAnswers((prev) => {
				const currentAnswers =
					(prev[currentQuestion.id as keyof QuizAnswers] as string[]) || [];
				if (checked) {
					// If "none" is selected, clear all others
					if (value === "none") {
						return {
							...prev,
							[currentQuestion.id]: ["none"],
						};
					}
					// Handle mutual exclusivity for familyStructure: single and married
					if (currentQuestion.id === "familyStructure") {
						let filtered = currentAnswers.filter((a) => a !== "none");
						// If selecting "single", remove "married"
						if (value === "single") {
							filtered = filtered.filter((a) => a !== "married");
						}
						// If selecting "married", remove "single"
						if (value === "married") {
							filtered = filtered.filter((a) => a !== "single");
						}
						return {
							...prev,
							[currentQuestion.id]: [...filtered, value],
						};
					}
					// If another option is selected, remove "none"
					const filtered = currentAnswers.filter((a) => a !== "none");
					return {
						...prev,
						[currentQuestion.id]: [...filtered, value],
					};
				} else {
					// If unchecking "none", allow other selections
					if (value === "none") {
						return {
							...prev,
							[currentQuestion.id]: [],
						};
					}
					return {
						...prev,
						[currentQuestion.id]: currentAnswers.filter((a) => a !== value),
					};
				}
			});
		} else {
			setAnswers((prev) => ({
				...prev,
				[currentQuestion.id]: value,
			}));
		}
	};

	const canProceed = () => {
		const currentAnswer = answers[currentQuestion.id as keyof QuizAnswers] as
			| string
			| string[]
			| null;
		if (currentQuestion.type === "multi") {
			return Array.isArray(currentAnswer) && currentAnswer.length > 0;
		}
		return currentAnswer !== null && currentAnswer !== "";
	};

	const handleNext = () => {
		if (!canProceed()) return;

		if (isLastQuestion) {
			// Calculate outcome
			const outcome = calculateOutcome(answers);
			onComplete(outcome, answers);
		} else {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentQuestionIndex((prev) => prev + 1);
				setIsTransitioning(false);
			}, 300);
		}
	};

	const handlePrevious = () => {
		if (!isFirstQuestion) {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentQuestionIndex((prev) => prev - 1);
				setIsTransitioning(false);
			}, 300);
		}
	};

	const calculateOutcome = (answers: QuizAnswers): QuizOutcome => {
		// REFERRAL conditions (highest priority)
		if (answers.ageAndCapacity === "no") return "REFERRAL";
		if (answers.jurisdiction === "no") return "REFERRAL";
		if (answers.businessInterests === "inheritOrTakeOver") return "REFERRAL";

		// AMBER conditions
		if (answers.familyStructure.includes("blended")) return "AMBER";

		// GREEN - suitable for online Will
		return "GREEN";
	};

	const getCurrentAnswer = () => {
		return answers[currentQuestion.id as keyof QuizAnswers] as
			| string
			| string[]
			| null;
	};

	const isChecked = (value: string) => {
		const currentAnswer = getCurrentAnswer();
		if (Array.isArray(currentAnswer)) {
			return currentAnswer.includes(value);
		}
		return currentAnswer === value;
	};

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<AuthPageHeader />
			<div className="flex flex-col justify-center items-center pt-8 pb-12 px-4">
				<div className="w-full max-w-2xl">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-[2rem] font-medium text-[#173C37] mb-2">
							Online Will Suitability Quiz
						</h1>
						<p className="text-sm text-[#545454] mb-2">(England & Wales)</p>
						<p className="text-base text-[#545454] mt-4">
							A few simple questions to make sure this service is right for you.
						</p>
					</div>

					{/* Progress Bar */}
					<div className="mb-8">
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm text-[#545454]">
								Question {currentQuestionIndex + 1} of {QUESTIONS.length}
							</span>
							<span className="text-sm text-[#545454]">
								{Math.round(
									((currentQuestionIndex + 1) / QUESTIONS.length) * 100
								)}
								%
							</span>
						</div>
						<div className="w-full bg-[#E9E9E9] rounded-full h-2 overflow-hidden">
							<div
								className={cn(
									"h-full bg-[#239485] transition-all duration-500 ease-out",
									isTransitioning && "opacity-50"
								)}
								style={{
									width: `${
										((currentQuestionIndex + 1) / QUESTIONS.length) * 100
									}%`,
								}}
							/>
						</div>
					</div>

					{/* Question Card */}
					<Card
						className={cn(
							"border border-[#CCCCCC] shadow-none rounded-lg transition-all duration-300 ease-in-out",
							isTransitioning
								? "opacity-0 translate-x-4 scale-95"
								: "opacity-100 translate-x-0 scale-100"
						)}
					>
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-medium text-[#173C37]">
								{currentQuestionIndex + 1}. {currentQuestion.title}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div>
								<p className="text-base font-normal text-[#173C37] mb-1">
									{currentQuestion.question}
								</p>
								{currentQuestion.subtitle && (
									<p className="text-sm text-[#545454] mb-4">
										{currentQuestion.subtitle}
									</p>
								)}
							</div>

							{/* Options */}
							<div className="space-y-3">
								{currentQuestion.options.map((option) => (
									<label
										key={option.value}
										className={cn(
											"flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out",
											isChecked(option.value)
												? "border-[#239485] bg-[#EFF8F5] shadow-sm"
												: "border-[#CCCCCC] bg-white hover:border-[#239485]/50 hover:bg-[#EFF8F5]/50"
										)}
									>
										<Checkbox
											checked={isChecked(option.value)}
											onCheckedChange={(checked) =>
												handleAnswerChange(option.value, checked as boolean)
											}
											className="mt-1"
										/>
										<span className="flex-1 text-sm text-[#173C37] leading-relaxed flex items-center gap-2">
											{option.label}
											{"hasInfoIcon" in option && option.hasInfoIcon && (
												<span
													className="text-[#239485] font-semibold text-base"
													title="More information available"
												>
													ⓘ
												</span>
											)}
										</span>
									</label>
								))}
							</div>

							{/* Info Panel Main (for inheritOrTakeOver) */}
							{showInfoPanelMain && currentQuestion.infoPanelMain && (
								<Alert className="bg-[#DFF2EB] border-[#239485]/30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg">
									<Info className="h-4 w-4 text-[#239485]" />
									<AlertDescription className="space-y-3">
										<strong className="text-[#173C37] font-semibold block">
											{currentQuestion.infoPanelMain.title}
										</strong>
										<div className="text-sm text-[#545454] mt-2">
											{currentQuestion.infoPanelMain.content}
										</div>
									</AlertDescription>
								</Alert>
							)}

							{/* Info Panel (for valueOnly, notSure) */}
							{showInfoPanel && currentQuestion.infoPanel && (
								<Alert className="bg-[#DFF2EB] border-[#239485]/30 animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg">
									<Info className="h-4 w-4 text-[#239485]" />
									<AlertDescription className="space-y-3">
										<strong className="text-[#173C37] font-semibold block">
											{currentQuestion.infoPanel.title}
										</strong>
										<div className="text-sm text-[#545454] mt-2">
											{currentQuestion.infoPanel.content}
										</div>
										{currentQuestion.infoPanel.hasButtons && (
											<div className="flex flex-col sm:flex-row gap-3 mt-4">
												<Button
													onClick={() => {
														if (isLastQuestion) {
															const outcome = calculateOutcome(answers);
															onComplete(outcome, answers);
														} else {
															handleNext();
														}
													}}
													className="bg-[#173C37] text-white hover:bg-[#173C37]/90 focus:ring-2 focus:ring-primary focus:border-primary"
												>
													Continue with my UK Will
												</Button>
												<Button
													variant="outline"
													className="border-[#CCCCCC] text-[#173C37] hover:bg-[#EFF8F5]"
													asChild
												>
													<Link
														to="/schedule"
														className="flex items-center gap-2"
														aria-label="Schedule a call with the team"
													>
														<PhoneCall className="h-4 w-4" />
														Schedule a call
													</Link>
												</Button>
											</div>
										)}
									</AlertDescription>
								</Alert>
							)}

							{/* Navigation Buttons */}
							{!(showInfoPanel && currentQuestion.infoPanel?.hasButtons) && (
								<div className="flex justify-end items-center pt-4 border-t border-[#CCCCCC]">
									<div className="flex gap-3">
										{!isFirstQuestion && (
											<Button
												variant="outline"
												onClick={handlePrevious}
												className="border-[#CCCCCC] text-[#173C37] hover:bg-[#EFF8F5]"
											>
												Previous
											</Button>
										)}
										<Button
											onClick={handleNext}
											disabled={!canProceed()}
											className={cn(
												"bg-[#173C37] text-white hover:bg-[#173C37]/90 focus:ring-2 focus:ring-primary focus:border-primary",
												!canProceed() && "opacity-50 cursor-not-allowed"
											)}
										>
											{isLastQuestion ? "Complete Quiz" : "Next"}
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
