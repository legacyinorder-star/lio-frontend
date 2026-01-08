import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	CheckCircle2,
	AlertTriangle,
	Info,
	PhoneCall,
	Home,
	RotateCcw,
	FileText,
	BookOpen,
	Briefcase,
} from "lucide-react";
import { QuizOutcome as OutcomeType } from "./WillSuitabilityQuiz";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { useNavigate } from "react-router-dom";

interface QuizOutcomeProps {
	outcome: OutcomeType;
	onContinue: () => void;
	onContactLawyer?: () => void;
	isAgeRestriction?: boolean;
	onRestart?: () => void;
}

export default function QuizOutcome({
	outcome,
	onContinue,
	onContactLawyer,
	isAgeRestriction = false,
	onRestart,
}: QuizOutcomeProps) {
	const navigate = useNavigate();
	const getOutcomeContent = () => {
		switch (outcome) {
			case "GREEN":
				return {
					icon: CheckCircle2,
					iconColor: "text-green-600",
					bgColor: "bg-green-50",
					borderColor: "border-green-200",
					title: "Great news!",
					subtitle: "You can create your online Will",
					message:
						"Based on your answers, an online Will is a suitable and legally sound option for you.",
					cta: {
						primary: {
							text: "Create your online Will",
							action: onContinue,
							icon: FileText,
							note: "You can complete it in as little as 15 minutes and update it later if circumstances change.",
						},
					},
				};
			case "AMBER":
				return {
					icon: AlertTriangle,
					iconColor: "text-amber-600",
					bgColor: "bg-amber-50",
					borderColor: "border-amber-200",
					title: "Proceed with caution",
					subtitle: undefined,
					message:
						"You can proceed with an online Will. Some parts of your situation may benefit from additional consideration, and we'll guide you as you go.",
					cta: {
						primary: {
							text: "Continue with your UK Will",
							action: onContinue,
							icon: FileText,
						},
						secondary: {
							text: "Learn more about joint assets and overseas planning",
							action: () => {
								// Could link to a help page
								window.open("/will-information", "_blank");
							},
							icon: BookOpen,
						},
						optional: onContactLawyer
							? {
									text: "Schedule a call with a lawyer (optional)",
									action: onContactLawyer,
									icon: PhoneCall,
							  }
							: undefined,
					},
				};
			case "REFERRAL":
				if (isAgeRestriction) {
					return {
						icon: Info,
						iconColor: "text-blue-600",
						bgColor: "bg-blue-50",
						borderColor: "border-blue-200",
						title: "Age Requirement",
						subtitle: undefined,
						message:
							"You must be 18 years or older to create a Will in England and Wales. If you are under 18, please wait until you reach the age of 18 before creating a Will.",
						cta: {
							primary: {
								text: "Go to Home Page",
								action: () => navigate("/"),
								icon: Home,
							},
						},
					};
				}
				return {
					icon: Info,
					iconColor: "text-blue-600",
					bgColor: "bg-blue-50",
					borderColor: "border-blue-200",
					title: "Partner lawyer recommended",
					subtitle: undefined,
					message:
						"Your situation involves additional complexity and may benefit from personalised legal advice. We recommend speaking with one of our trusted partner lawyers before finalising your Will.",
					cta: {
						primary: {
							text: "Schedule a call with our team",
							action: () =>
								(window.location.href =
									"https://calendly.com/legacyinorder/new-meeting"),
							icon: PhoneCall,
						},
						secondary: {
							text: "Get organised with Legacy in Order",
							action: onContinue,
							icon: Briefcase,
						},
					},
				};
		}
	};

	const content = getOutcomeContent();
	const Icon = content.icon;

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<AuthPageHeader />
			<div className="flex flex-col justify-center items-center pt-8 pb-12 px-4">
				<div className="w-full max-w-2xl">
					<Card className="border border-[#CCCCCC] shadow-none rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
						<CardHeader className="text-center">
							<div
								className={`mx-auto w-16 h-16 rounded-full ${content.bgColor} ${content.borderColor} border-2 flex items-center justify-center mb-4`}
							>
								<Icon className={`w-8 h-8 ${content.iconColor}`} />
							</div>
							<CardTitle className="text-2xl text-[#173C37] font-medium">
								{content.title}
							</CardTitle>
							{content.subtitle && (
								<CardTitle className="text-lg text-[#173C37] font-semibold">
									{content.subtitle}
								</CardTitle>
							)}
						</CardHeader>
						<CardContent className="space-y-6">
							<p className="text-base text-[#545454] text-center leading-relaxed">
								{content.message}
							</p>

							{/* CTAs */}
							<div className="space-y-3 pt-4">
								{content.cta.primary && (
									<Button
										onClick={content.cta.primary.action}
										className="w-full bg-[#173C37] text-white hover:bg-[#173C37]/90 py-6 text-base font-semibold focus:ring-2 focus:ring-primary focus:border-primary"
									>
										<span className="flex items-center justify-center gap-2">
											{content.cta.primary.icon && (
												<content.cta.primary.icon className="h-4 w-4" />
											)}
											{content.cta.primary.text}
										</span>
									</Button>
								)}
								{content.cta.primary?.note && (
									<p className="text-sm text-[#545454] text-center">
										{content.cta.primary.note}
									</p>
								)}

								{content.cta.secondary && (
									<Button
										variant="outline"
										onClick={content.cta.secondary.action}
										className="w-full border-[#CCCCCC] text-[#173C37] hover:bg-[#EFF8F5] py-6 text-base"
									>
										<span className="flex items-center justify-center gap-2">
											{content.cta.secondary.icon && (
												<content.cta.secondary.icon className="h-4 w-4" />
											)}
											{content.cta.secondary.text}
										</span>
									</Button>
								)}

								{content.cta.optional && (
									<Button
										variant="ghost"
										onClick={content.cta.optional.action}
										className="w-full text-[#173C37] hover:bg-[#EFF8F5] py-6 text-base"
									>
										<span className="flex items-center justify-center gap-2">
											{content.cta.optional.icon && (
												<content.cta.optional.icon className="h-4 w-4" />
											)}
											{content.cta.optional.text}
										</span>
									</Button>
								)}

								{/* Restart Quiz Button */}
								{onRestart && (
									<Button
										variant="ghost"
										onClick={onRestart}
										className="w-full text-[#173C37] hover:bg-[#EFF8F5] py-6 text-base"
									>
										<span className="flex items-center justify-center gap-2">
											<RotateCcw className="h-4 w-4" />
											Restart Quiz
										</span>
									</Button>
								)}
							</div>

							{/* Additional Info for REFERRAL */}
							{outcome === "REFERRAL" && !isAgeRestriction && (
								<Alert className="bg-[#DFF2EB] border-[#239485]/30 mt-6 rounded-lg">
									<Info className="h-4 w-4 text-[#239485]" />
									<AlertDescription>
										<div className="space-y-4">
											<div>
												<strong className="text-[#173C37] font-semibold block">
													When extra legal advice can help
												</strong>
												<p className="text-sm text-[#545454] mt-2">
													Some situations benefit from tailored legal guidance.
													This does not mean you can't get organised — it simply
													means your circumstances deserve careful handling.
												</p>
											</div>
											<div>
												<strong className="text-[#173C37] font-semibold block">
													You may wish to speak with a lawyer if you:
												</strong>
												<ul className="list-disc list-inside text-sm text-[#545454] mt-2 space-y-1">
													<li>Own assets outside England or Wales</li>
													<li>Have business or partnership interests</li>
													<li>Have complex family arrangements</li>
													<li>
														Intend to exclude a spouse, civil partner, or
														dependant
													</li>
													<li>
														Want multiple Wills that work together across
														countries
													</li>
												</ul>
											</div>
											<div>
												<strong className="text-[#173C37] font-semibold block">
													How our partner lawyers can help
												</strong>
												<ul className="list-disc list-inside text-sm text-[#545454] mt-2 space-y-1">
													<li>
														Advise on structuring multiple Wills so they work
														together
													</li>
													<li>
														Ensure overseas and UK assets are covered correctly
													</li>
													<li>
														Help reduce the risk of disputes or unintended
														outcomes
													</li>
													<li>
														Provide reassurance where your situation is more
														complex
													</li>
												</ul>
											</div>
											<div>
												<p className="text-sm text-[#545454]">
													<strong className="text-[#173C37] font-semibold">
														Your choice
													</strong>
													<br />
													There is no obligation — the choice is always yours.
												</p>
											</div>
										</div>
									</AlertDescription>
								</Alert>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
