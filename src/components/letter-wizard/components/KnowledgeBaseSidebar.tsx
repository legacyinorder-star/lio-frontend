import { ExternalLink } from "lucide-react";

interface KnowledgeArticle {
	title: string;
	description: string;
	url: string;
}

interface KnowledgeBaseSidebarProps {
	currentStep: string;
}

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

	return (
		<div
			className="w-full lg:w-80 p-4 lg:p-6 self-start"
			style={{ backgroundColor: "#EDFBF6" }}
		>
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
