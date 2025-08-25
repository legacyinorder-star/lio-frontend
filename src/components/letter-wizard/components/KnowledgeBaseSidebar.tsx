import { ExternalLink } from "lucide-react";
import { VideoGuide } from "@/components/ui/video-guide";

interface KnowledgeArticle {
	title: string;
	description: string;
	url: string;
}

interface KnowledgeBaseSidebarProps {
	currentStep: string;
}

// Video content for each step
const STEP_VIDEOS: Record<
	string,
	{
		src: string;
		poster: string;
		title: string;
		description: string;
	}
> = {
	personalFamily: {
		src: "https://drive.google.com/file/d/1Y9NELwX78wH8yMm7cB6I5jss5SC8hRCU/view",
		poster: "/images/letter-personal-family-poster.jpg",
		title: "Personal & Family Guide",
		description:
			"Learn how to write personal messages and family guidance in your letter of wishes.",
	},
	assetsPossessions: {
		src: "https://drive.google.com/file/d/1Y9NELwX78wH8yMm7cB6I5jss5SC8hRCU/view",
		poster: "/images/letter-assets-possessions-poster.jpg",
		title: "Assets & Possessions Guide",
		description:
			"Understand how to provide guidance about your personal belongings and assets.",
	},
	funeralEndOfLife: {
		src: "https://drive.google.com/file/d/1Y9NELwX78wH8yMm7cB6I5jss5SC8hRCU/view",
		poster: "/images/letter-funeral-end-of-life-poster.jpg",
		title: "Funeral & End of Life Guide",
		description:
			"Learn how to document your funeral wishes and end-of-life preferences.",
	},
	instructionsLegacy: {
		src: "https://drive.google.com/file/d/1Y9NELwX78wH8yMm7cB6I5jss5SC8hRCU/view",
		poster: "/images/letter-instructions-legacy-poster.jpg",
		title: "Instructions & Legacy Guide",
		description:
			"Discover how to leave lasting instructions and legacy guidance for your loved ones.",
	},
};

const stepArticles: Record<string, KnowledgeArticle[]> = {
	introduction: [
		{
			title: "What is a Letter of Wishes?",
			description:
				"Understanding the purpose and importance of a Letter of Wishes in estate planning.",
			url: "/knowledge/letter-of-wishes-purpose",
		},
		{
			title: "Letter of Wishes vs. Will",
			description:
				"Learn about the differences between a Letter of Wishes and a formal will.",
			url: "/knowledge/letter-vs-will",
		},
	],
	personalMessages: [
		{
			title: "Writing Personal Messages",
			description:
				"Tips for writing meaningful personal messages to your beneficiaries.",
			url: "/knowledge/personal-messages",
		},
		{
			title: "Emotional Legacy Planning",
			description:
				"How to leave an emotional legacy through personal messages and letters.",
			url: "/knowledge/emotional-legacy",
		},
	],
	guidanceNotes: [
		{
			title: "Guidance for Executors",
			description:
				"Providing clear guidance to help your executors understand your wishes.",
			url: "/knowledge/executor-guidance",
		},
		{
			title: "Family Communication",
			description:
				"Using your Letter of Wishes to communicate important family values and preferences.",
			url: "/knowledge/family-communication",
		},
	],
	specialInstructions: [
		{
			title: "Special Instructions and Wishes",
			description:
				"Including special instructions that may not fit into other categories.",
			url: "/knowledge/special-instructions",
		},
		{
			title: "Personal Preferences",
			description:
				"Documenting personal preferences and values for your loved ones.",
			url: "/knowledge/personal-preferences",
		},
	],
	review: [
		{
			title: "Reviewing Your Letter",
			description:
				"Important considerations when reviewing your Letter of Wishes before finalizing.",
			url: "/knowledge/reviewing-letter",
		},
		{
			title: "Updating Your Letter",
			description:
				"How and when to update your Letter of Wishes as circumstances change.",
			url: "/knowledge/updating-letter",
		},
	],
};

export default function KnowledgeBaseSidebar({
	currentStep,
}: KnowledgeBaseSidebarProps) {
	const articles = stepArticles[currentStep] || [];
	const videoContent = STEP_VIDEOS[currentStep];

	return (
		<div
			className="w-full lg:w-80 p-4 lg:p-6 self-start"
			style={{ backgroundColor: "#EDFBF6" }}
		>
			{/* Video Section */}
			<div className="mb-6">
				{videoContent ? (
					<VideoGuide
						src={videoContent.src}
						poster={videoContent.poster}
						title={videoContent.title}
						description={videoContent.description}
					/>
				) : (
					<div className="space-y-3">
						<h4 className="text-black font-medium text-sm">
							Learn About This Step
						</h4>
						<div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
							<div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
								Video content not available for this step.
							</div>
						</div>
						<p className="text-gray-600 text-xs">
							No video content available for this step.
						</p>
					</div>
				)}
			</div>

			<h3
				className="text-black font-semibold mb-4"
				style={{ fontSize: "1rem" }}
			>
				Knowledge Center
			</h3>

			<div className="space-y-3">
				{articles.map((article, index) => (
					<div key={index} className="underline">
						<a
							rel="noopener noreferrer"
							className="block text-gray-900 hover:text-primary text-sm font-medium"
						>
							{article.title}
						</a>
					</div>
				))}
			</div>

			<div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-white/50 rounded-lg">
				<h4 className="font-medium text-gray-900 mb-2 text-sm">
					Need More Help?
				</h4>
				<p className="text-gray-600 text-xs mb-3">
					Our comprehensive knowledge base covers all aspects of estate
					planning.
				</p>
				<a className="inline-flex items-center text-primary hover:text-primary/80 text-xs font-medium">
					Browse All Articles
					<ExternalLink className="ml-1 h-3 w-3" />
				</a>
			</div>
		</div>
	);
}
