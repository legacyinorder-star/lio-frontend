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

const stepArticles: Record<QuestionType, KnowledgeArticle[]> = {
	name: [
		{
			title: "Legal Name Requirements in Wills",
			description:
				"Understand the importance of using your full legal name in estate planning documents.",
			url: "/knowledge/legal-name-requirements",
		},
		{
			title: "Common Name Issues in Estate Planning",
			description:
				"Learn about potential problems with name variations and how to avoid them.",
			url: "/knowledge/name-issues-estate-planning",
		},
	],
	address: [
		{
			title: "Residence and Estate Planning",
			description:
				"How your primary residence affects your will and estate planning strategy.",
			url: "#",
		},
		{
			title: "Multi-State Estate Planning",
			description:
				"Important considerations if you own property in multiple states or countries.",
			url: "#",
		},
	],
	hasSpouse: [
		{
			title: "Spousal Rights in Estate Planning",
			description:
				"Understanding how marriage affects your will and inheritance rights.",
			url: "#",
		},
		{
			title: "Common Law vs. Legal Marriage",
			description:
				"How different relationship types affect your estate planning options.",
			url: "#",
		},
	],
	hasChildren: [
		{
			title: "Including Children in Your Will",
			description:
				"Best practices for providing for your children in your estate plan.",
			url: "#",
		},
		{
			title: "Disinheritance and Legal Requirements",
			description: "What happens if you don't include a child in your will.",
			url: "#",
		},
	],
	guardians: [
		{
			title: "Choosing Guardians for Minor Children",
			description:
				"Key factors to consider when selecting guardians for your children.",
			url: "#",
		},
		{
			title: "Guardian Responsibilities and Rights",
			description:
				"Understanding what guardianship entails and how to prepare guardians.",
			url: "#",
		},
	],
	pets: [
		{
			title: "Pet Guardianship in Estate Planning",
			description:
				"How to ensure your beloved pets are cared for after you're gone.",
			url: "#",
		},
		{
			title: "Legal Considerations for Pet Guardians",
			description:
				"Understanding the legal aspects of designating pet guardians in your will.",
			url: "#",
		},
	],
	hasAssets: [
		{
			title: "Asset Inventory for Estate Planning",
			description:
				"How to properly catalog and value your assets for your will.",
			url: "#",
		},
		{
			title: "Digital Assets in Estate Planning",
			description:
				"Don't forget about your digital property and online accounts.",
			url: "#",
		},
	],
	digitalAssets: [
		{
			title: "Digital Assets in Your Will",
			description:
				"Learn about digital assets and how to include them in your will.",
			url: "#",
		},
		{
			title: "Managing Digital Legacy",
			description:
				"Understanding how to handle online accounts and digital property.",
			url: "#",
		},
	],

	residuary: [
		{
			title: "Understanding Residuary Beneficiaries",
			description:
				"Why the residuary estate is often the most important part of your will.",
			url: "#",
		},
		{
			title: "Contingent Beneficiaries Explained",
			description:
				"Planning for what happens if your primary beneficiaries predecease you.",
			url: "#",
		},
	],
	executors: [
		{
			title: "Choosing the Right Executor",
			description:
				"Key qualities to look for in an executor and common mistakes to avoid.",
			url: "#",
		},
		{
			title: "Executor Duties and Timeline",
			description:
				"What your executor will need to do and how long the process typically takes.",
			url: "#",
		},
	],
	witnesses: [
		{
			title: "Will Signing Requirements",
			description:
				"Legal requirements for witnesses and proper will execution.",
			url: "#",
		},
		{
			title: "Who Can and Cannot Witness a Will",
			description:
				"Important restrictions on who can serve as a witness to your will.",
			url: "#",
		},
	],
	funeralInstructions: [
		{
			title: "Funeral Instructions in Wills",
			description:
				"How to properly include funeral wishes and their legal standing.",
			url: "#",
		},
		{
			title: "Separate Funeral Planning Documents",
			description:
				"When to use separate documents for funeral and burial instructions.",
			url: "#",
		},
	],
	review: [
		{
			title: "Final Will Review Checklist",
			description:
				"Important items to double-check before finalizing your will.",
			url: "#",
		},
		{
			title: "When to Update Your Will",
			description: "Life events that should trigger a will review and update.",
			url: "#",
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
							href={article.url}
							target="_blank"
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
				<a
					href="#"
					className="inline-flex items-center text-primary hover:text-primary/80 text-xs font-medium"
				>
					Browse All Articles
					<ExternalLink className="ml-1 h-3 w-3" />
				</a>
			</div>
		</div>
	);
}
