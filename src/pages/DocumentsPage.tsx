import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useWill } from "@/context/WillContext";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { useState, useEffect } from "react";

export default function DocumentsPage() {
	const navigate = useNavigate();
	const { activeWill } = useWill();
	const { letterData } = useLetterOfWishes();
	const [isLoading, setIsLoading] = useState(true);
	const [error] = useState<string | null>(null);

	// Handler functions
	const handleEditWill = () => {
		if (activeWill) {
			// Navigate to the current step from progress
			const currentStep = activeWill.progress?.currentStep || "personalInfo";
			navigate(`/app/create-will/${currentStep}`);
		}
	};

	const handlePayAndSubmit = () => {
		if (activeWill) {
			// Navigate to payment page
			navigate(
				`/app/payment/checkout?willId=${activeWill.id}&description=Will Creation Service`
			);
		}
	};

	const handleDownloadWill = () => {
		if (activeWill) {
			// Navigate to will download page
			navigate(`/app/will/${activeWill.id}`);
		}
	};

	const handleStartLetterOfWishes = () => {
		navigate("/app/letter-of-wishes");
	};

	const handleContinueLetterOfWishes = () => {
		if (letterData?.id) {
			navigate("/app/letter-of-wishes");
		}
	};

	const handleDownloadLetterOfWishes = () => {
		if (letterData?.id) {
			// Navigate to letter download page or trigger download
			navigate(`/app/letter-of-wishes/${letterData.id}/download`);
		}
	};

	// Determine button text and action based on will status and current step
	const getWillButtonInfo = () => {
		if (!activeWill) {
			return {
				text: "Start your Will",
				action: () => navigate("/app/create-will"),
				description: "Create your will to ensure your wishes are carried out.",
				progress: "0/9 sections complete",
				nextSection: "Personal Details",
				lastEdited: "Not started",
				showNextStep: true,
				progressPercentage: 0,
			};
		}

		const willStatus = activeWill.status;
		const currentStep = activeWill.progress?.currentStep;
		const completedSteps = activeWill.progress?.completedSteps;

		// Define step order and calculate total steps dynamically
		const stepOrder = [
			"personalInfo",
			"familyInfo",
			"guardians",
			"residuary",
			"hasAssets",
			"gifts",
			"executors",
			"funeralInstructions",
			"review",
		];
		const totalSteps = stepOrder.length; // Calculate dynamically instead of hardcoding
		const completedCount = completedSteps
			? Object.values(completedSteps).filter(Boolean).length
			: 0;
		const progressText = `${completedCount}/${totalSteps} sections complete`;
		const progressPercentage = (completedCount / totalSteps) * 100;

		// Determine next section based on current step
		const getNextSection = () => {
			if (!currentStep) return "Personal Details";
			const currentIndex = stepOrder.indexOf(currentStep);
			const nextStep = stepOrder[currentIndex + 1] || "review";

			const stepNames = {
				personalInfo: "Personal Details",
				familyInfo: "Family Information",
				guardians: "Guardians",
				residuary: "Residuary Estate",
				hasAssets: "Assets",
				gifts: "Gifts",
				executors: "Executors",
				funeralInstructions: "Funeral Instructions",
				review: "Review",
			};

			return stepNames[nextStep as keyof typeof stepNames] || "Review";
		};

		if (willStatus === "under review") {
			return {
				text: "Under Review",
				action: null,
				description:
					"Your Will is currently being reviewed by our legal team. We'll notify you once the review is complete.",
				progress: progressText,
				nextSection: "Under Review",
				lastEdited: activeWill.lastUpdatedAt
					? new Date(activeWill.lastUpdatedAt).toLocaleDateString()
					: "Recently",
				showNextStep: false,
				progressPercentage,
			};
		}

		if (willStatus === "in progress") {
			return {
				text: "Continue Will",
				action: handleEditWill,
				description:
					"Continue working on your Will where you left off. Complete your estate planning today.",
				progress: progressText,
				nextSection: getNextSection(),
				lastEdited: activeWill.lastUpdatedAt
					? new Date(activeWill.lastUpdatedAt).toLocaleDateString()
					: "Recently",
				showNextStep: true,
				progressPercentage,
			};
		}

		if (willStatus === "draft" || currentStep === "review") {
			return {
				text: "Pay & Submit",
				action: handlePayAndSubmit,
				description:
					"Your Will is ready! Complete payment and submit for review.",
				progress: progressText,
				nextSection: "Ready to Submit",
				lastEdited: activeWill.lastUpdatedAt
					? new Date(activeWill.lastUpdatedAt).toLocaleDateString()
					: "Recently",
				showNextStep: false,
				progressPercentage,
			};
		}

		if (willStatus === "completed") {
			return {
				text: "Download Will",
				action: handleDownloadWill,
				description:
					"Your Will is ready! You can download it for your records.",
				progress: `${totalSteps}/${totalSteps} sections complete`,
				nextSection: "Complete",
				lastEdited: activeWill.lastUpdatedAt
					? new Date(activeWill.lastUpdatedAt).toLocaleDateString()
					: "Recently",
				showNextStep: false,
				progressPercentage: 100,
			};
		}

		// Default fallback
		return {
			text: "Continue Will",
			action: handleEditWill,
			description:
				"Continue working on your will where you left off. Complete your estate planning today.",
			progress: progressText,
			nextSection: getNextSection(),
			lastEdited: activeWill.lastUpdatedAt
				? new Date(activeWill.lastUpdatedAt).toLocaleDateString()
				: "Recently",
			showNextStep: true,
			progressPercentage,
		};
	};

	const willButtonInfo = getWillButtonInfo();

	// Determine button text and action for Letter of Wishes based on will status and letter data
	const getLetterButtonInfo = () => {
		// Letter of Wishes can only be created if Will is completed
		if (!activeWill || activeWill.status !== "completed") {
			return {
				text: "Will must be completed first",
				action: null,
				description: "Complete your Will first to create a Letter of Wishes.",
				progress: "0/4 sections complete",
				nextSection: "Will not completed",
				lastEdited: "Not available",
				showNextStep: false,
				progressPercentage: 0,
			};
		}

		// If no letter data exists, show create option
		if (!letterData) {
			return {
				text: "Start Letter of Wishes",
				action: handleStartLetterOfWishes,
				description:
					"Share personal guidance for your loved ones that complements your formal Will.",
				progress: "0/4 sections complete",
				nextSection: "Personal & Family",
				lastEdited: "Not started",
				showNextStep: true,
				progressPercentage: 0,
			};
		}

		// Define letter sections and calculate total sections dynamically
		const letterSections = [
			letterData.personalMessages && letterData.personalMessages.length > 0,
			letterData.funeralPreferences &&
				(letterData.funeralPreferences.burialLocation ||
					letterData.funeralPreferences.serviceType ||
					letterData.funeralPreferences.additionalPreferences),
			letterData.personalPossessions &&
				letterData.personalPossessions.length > 0,
			letterData.charitableDonations &&
				letterData.charitableDonations.length > 0,
		];

		const totalSections = letterSections.length; // Calculate dynamically instead of hardcoding
		const completedCount = letterSections.filter(Boolean).length;
		const progressText = `${completedCount}/${totalSections} sections complete`;
		const progressPercentage = (completedCount / totalSections) * 100;

		// Determine next section based on what's completed
		const getNextLetterSection = () => {
			if (
				!letterData.personalMessages ||
				letterData.personalMessages.length === 0
			) {
				return "Personal & Family";
			}
			if (
				!letterData.funeralPreferences ||
				(!letterData.funeralPreferences.burialLocation &&
					!letterData.funeralPreferences.serviceType &&
					!letterData.funeralPreferences.additionalPreferences)
			) {
				return "Funeral & End of Life";
			}
			if (
				!letterData.personalPossessions ||
				letterData.personalPossessions.length === 0
			) {
				return "Assets & Possessions";
			}
			if (
				!letterData.charitableDonations ||
				letterData.charitableDonations.length === 0
			) {
				return "Charitable Donations";
			}
			return "Complete";
		};

		// If letter is complete and available for download
		if (letterData.available_to_download) {
			return {
				text: "Download Letter of Wishes",
				action: handleDownloadLetterOfWishes,
				description:
					"Your Letter of Wishes is ready! You can download it for your records.",
				progress: `${totalSections}/${totalSections} sections complete`,
				nextSection: "Complete",
				lastEdited: letterData.updatedAt
					? new Date(letterData.updatedAt).toLocaleDateString()
					: "Recently",
				showNextStep: false,
				progressPercentage: 100,
			};
		}

		// Letter in progress
		return {
			text: "Continue Letter of Wishes",
			action: handleContinueLetterOfWishes,
			description:
				"Continue working on your Letter of Wishes where you left off.",
			progress: progressText,
			nextSection: getNextLetterSection(),
			lastEdited: letterData.updatedAt
				? new Date(letterData.updatedAt).toLocaleDateString()
				: "Recently",
			showNextStep: true,
			progressPercentage,
		};
	};

	const letterButtonInfo = getLetterButtonInfo();

	// Handle loading and error states
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000); // Simulate loading time

		return () => clearTimeout(timer);
	}, []);

	// Show loading state
	if (isLoading) {
		return (
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-[2rem] font-[500] text-black">
							Your Documents
						</h1>
						<p className="text-[#545454] font-[400] text-[1rem]">
							Continue where you left off or create a new document.
						</p>
					</div>
				</div>

				{/* Loading Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-2/4">
					{/* Will Card Loading */}
					<Card
						className="p-6 w-full"
						style={{
							borderRadius: "0.5rem",
							background: "#FFF",
							boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.15)",
						}}
					>
						<div
							className="flex items-center space-x-2 text-white text-sm font-medium mb-6 w-fit"
							style={{
								padding: "0.25rem 0.5rem",
								borderRadius: "0.25rem",
								background:
									"linear-gradient(99deg, #024048 42.51%, #1184C1 94.43%)",
							}}
						>
							<FileText className="w-4 h-4" />
							<span>Will</span>
						</div>
						<div className="flex flex-col h-full">
							<div className="flex items-center space-x-4 mb-14">
								<div>
									<div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
									<div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
								</div>
							</div>
							<div className="mb-14">
								<div className="flex justify-between items-center mb-2">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
								</div>
								<div className="w-full h-2 rounded bg-gray-200 animate-pulse"></div>
							</div>
							<div className="space-y-4">
								<div className="mb-4">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
									<div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
								</div>
								<div className="h-10 bg-gray-200 rounded animate-pulse"></div>
							</div>
						</div>
					</Card>

					{/* Letter Card Loading */}
					<Card
						className="p-6 w-full"
						style={{
							borderRadius: "0.5rem",
							background: "#FFF",
							boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.15)",
						}}
					>
						<div
							className="flex items-center space-x-2 text-white text-sm font-medium mb-6 w-fit"
							style={{
								padding: "0.25rem 0.5rem",
								borderRadius: "0.25rem",
								background:
									"linear-gradient(99deg, #482B02 42.51%, #C17E11 94.43%)",
							}}
						>
							<FileText className="w-4 h-4" />
							<span>Letter of Wishes</span>
						</div>
						<div className="flex flex-col h-full">
							<div className="flex items-center space-x-4 mb-14">
								<div>
									<div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
									<div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
								</div>
							</div>
							<div className="mb-14">
								<div className="flex justify-between items-center mb-2">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
								</div>
								<div className="w-full h-2 rounded bg-gray-200 animate-pulse"></div>
							</div>
							<div className="space-y-4">
								<div className="mb-4">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
									<div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
								</div>
								<div className="h-10 bg-gray-200 rounded animate-pulse"></div>
							</div>
						</div>
					</Card>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-[2rem] font-[500] text-black">
							Your Documents
						</h1>
						<p className="text-[#545454] font-[400] text-[1rem]">
							Continue where you left off or create a new document.
						</p>
					</div>
				</div>

				{/* Error Message */}
				<div className="w-2/4">
					<Card
						className="p-6"
						style={{
							borderRadius: "0.5rem",
							background: "#FFF",
							boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.15)",
						}}
					>
						<div className="text-center">
							<div className="text-red-500 text-lg font-semibold mb-2">
								Error Loading Documents
							</div>
							<p className="text-gray-600 mb-4">{error}</p>
							<Button
								onClick={() => window.location.reload()}
								className="bg-primary hover:bg-primary/90 text-white"
							>
								Try Again
							</Button>
						</div>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-[2rem] font-[500] text-black">Your Documents</h1>
					<p className="text-[#545454] font-[400] text-[1rem]">
						Continue where you left off or create a new document.
					</p>
				</div>
			</div>

			{/* Two Cards Side by Side */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-2/4">
				{/* Will Card */}
				<Card
					className="p-6 w-full"
					style={{
						borderRadius: "0.5rem",
						background: "#FFF",
						boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.15)",
					}}
				>
					{/* Document Type Badge */}
					<div
						className="flex items-center space-x-2 text-white text-sm font-medium mb-6 w-fit"
						style={{
							padding: "0.25rem 0.5rem",
							borderRadius: "0.25rem",
							background:
								"linear-gradient(99deg, #024048 42.51%, #1184C1 94.43%)",
						}}
					>
						<FileText className="w-4 h-4" />
						<span>Will</span>
					</div>

					{/* Status Badge */}
					{activeWill && (
						<div
							className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full mb-4 w-fit ${
								activeWill.status === "completed"
									? "bg-green-100 text-green-800"
									: activeWill.status === "under review"
									? "bg-yellow-100 text-yellow-800"
									: activeWill.status === "in progress"
									? "bg-blue-100 text-blue-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							<div
								className={`w-2 h-2 rounded-full ${
									activeWill.status === "completed"
										? "bg-green-500"
										: activeWill.status === "under review"
										? "bg-yellow-500"
										: activeWill.status === "in progress"
										? "bg-blue-500"
										: "bg-gray-500"
								}`}
							></div>
							<span className="capitalize">
								{activeWill.status === "in progress"
									? "In Progress"
									: activeWill.status === "under review"
									? "Under Review"
									: activeWill.status}
							</span>
						</div>
					)}

					<div className="flex flex-col h-full">
						{/* Header */}
						<div className="flex items-center space-x-4 mb-14">
							<div>
								<h3 className="text-2xl font-semibold text-[#173C37]">Will</h3>
								<p className="text-[#909090] text-sm">
									Last edited {willButtonInfo.lastEdited}
								</p>
							</div>
						</div>

						{/* Progress Section */}
						<div className="mb-14">
							<div className="flex justify-between items-center mb-2">
								<span className="text-[0.875rem] font-medium text-[#6D6C6C]">
									{willButtonInfo.progress}
								</span>
							</div>
							<div className="w-full h-2 rounded bg-gray-200">
								<div
									className="h-2 rounded transition-all duration-300"
									style={{
										width: `${willButtonInfo.progressPercentage}%`,
										background:
											"linear-gradient(90deg, #A2DD16 0%, #4A8607 100%)",
									}}
								></div>
							</div>
						</div>
						<div className="space-y-4">
							<div
								className={`mb-4 ${
									!willButtonInfo.showNextStep ? "invisible" : ""
								}`}
							>
								<h5 className="text-sm text-[#909090] font-[400]">Next step</h5>
								<p className="text-sm text-[#173C37] font-[500]">
									{willButtonInfo.nextSection}
								</p>
							</div>
							<div>
								<Button
									onClick={willButtonInfo.action || undefined}
									disabled={willButtonInfo.action === null}
									className="w-full text-sm font-medium text-[#173C37] bg-[#EDEDED] rounded-[0.25rem] disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{willButtonInfo.text}
								</Button>
							</div>
						</div>
					</div>
				</Card>

				{/* Letter of Wishes Card */}
				<Card
					className="p-6 w-full"
					style={{
						borderRadius: "0.5rem",
						background: "#FFF",
						boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.15)",
					}}
				>
					{/* Document Type Badge */}
					<div
						className="flex items-center space-x-2 text-white text-sm font-medium mb-6 w-fit"
						style={{
							padding: "0.25rem 0.5rem",
							borderRadius: "0.25rem",
							background:
								"linear-gradient(99deg, #482B02 42.51%, #C17E11 94.43%)",
						}}
					>
						<FileText className="w-4 h-4" />
						<span>Letter of Wishes</span>
					</div>

					{/* Status Badge */}
					{letterData && (
						<div
							className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full mb-4 w-fit ${
								letterData.available_to_download
									? "bg-green-100 text-green-800"
									: "bg-blue-100 text-blue-800"
							}`}
						>
							<div
								className={`w-2 h-2 rounded-full ${
									letterData.available_to_download
										? "bg-green-500"
										: "bg-blue-500"
								}`}
							></div>
							<span>
								{letterData.available_to_download ? "Completed" : "In Progress"}
							</span>
						</div>
					)}

					<div className="flex flex-col h-full">
						{/* Header */}
						<div className="flex items-center space-x-4 mb-14">
							<div>
								<h3 className="text-2xl font-semibold text-[#173C37]">
									Letter of Wishes
								</h3>
								<p className="text-[#909090] text-sm">
									Last edited {letterButtonInfo.lastEdited}
								</p>
							</div>
						</div>

						{/* Progress Section */}
						<div className="mb-14">
							<div className="flex justify-between items-center mb-2">
								<span className="text-[0.875rem] font-medium text-[#173C37]">
									{letterButtonInfo.progress}
								</span>
							</div>
							<div className="w-full h-2 rounded bg-gray-200">
								<div
									className="h-2 rounded transition-all duration-300"
									style={{
										width: `${letterButtonInfo.progressPercentage}%`,
										background:
											"linear-gradient(90deg, #A2DD16 0%, #4A8607 100%)",
									}}
								></div>
							</div>
						</div>
						<div className="space-y-4">
							<div
								className={`mb-4 ${
									!letterButtonInfo.showNextStep ? "invisible" : ""
								}`}
							>
								<h5 className="text-sm text-[#909090] font-[400]">Next step</h5>
								<p className="text-sm text-[#173C37] font-[500]">
									{letterButtonInfo.nextSection}
								</p>
							</div>
							<div>
								<Button
									onClick={letterButtonInfo.action || undefined}
									disabled={letterButtonInfo.action === null}
									className="w-full text-sm font-medium text-[#173C37] bg-[#EDEDED] rounded-[0.25rem] disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{letterButtonInfo.text}
								</Button>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
