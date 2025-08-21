import { ExternalLink } from "lucide-react";
import { QuestionType } from "../types/will.types";

interface KnowledgeArticle {
	title: string;
	description: string;
	url: string;
}

interface KnowledgeBaseSidebarProps {
	currentStep: QuestionType;
}

const KNOWLEDGE_BASE: Record<QuestionType, KnowledgeArticle[]> = {
	personalInfo: [
		{
			title: "Personal Information",
			description:
				"Learn about collecting basic personal and address information for your will.",
			url: "/help/personal-information",
		},
	],
	familyInfo: [
		{
			title: "Family Information",
			description:
				"Learn about documenting your spouse, children, and pets in your will.",
			url: "/help/family-information",
		},
	],
	guardians: [
		{
			title: "Guardians",
			description: "Learn about appointing guardians for minor children.",
			url: "/help/guardians",
		},
	],
	hasAssets: [
		{
			title: "Assets",
			description:
				"Learn about documenting your assets and how to distribute them.",
			url: "/help/assets",
		},
	],
	gifts: [
		{
			title: "Gifts",
			description:
				"Learn about making specific gifts to individuals or organizations.",
			url: "/help/gifts",
		},
	],
	residuary: [
		{
			title: "Residuary Estate",
			description: "Learn about distributing the remainder of your estate.",
			url: "/help/residuary-estate",
		},
	],
	executors: [
		{
			title: "Executors",
			description: "Learn about appointing executors to carry out your will.",
			url: "/help/executors",
		},
	],
	funeralInstructions: [
		{
			title: "Funeral Instructions",
			description: "Learn about documenting your funeral and burial wishes.",
			url: "/help/funeral-instructions",
		},
	],
	review: [
		{
			title: "Review",
			description: "Learn about reviewing and finalizing your will.",
			url: "/help/review",
		},
	],
};

export default function KnowledgeBaseSidebar({
	currentStep,
}: KnowledgeBaseSidebarProps) {
	const articles = KNOWLEDGE_BASE[currentStep] || [];

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
