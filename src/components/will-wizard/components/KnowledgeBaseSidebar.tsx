//import { ExternalLink } from "lucide-react";
import { QuestionType } from "../types/will.types";
import { VideoGuide } from "@/components/ui/video-guide";

// interface KnowledgeArticle {
// 	title: string;
// 	description: string;
// 	url: string;
// }

interface KnowledgeBaseSidebarProps {
	currentStep: QuestionType;
}

// Video content for each step
const STEP_VIDEOS: Record<
	QuestionType,
	{
		src: string | string[];
		poster: string | string[];
		title: string | string[];
		description: string | string[];
	}
> = {
	personalInfo: {
		src: "https://drive.google.com/file/d/1Y9NELwX78wH8yMm7cB6I5jss5SC8hRCU/preview",
		poster: "/images/personal-info-poster.jpg",
		title: "Personal Information Guide",
		description:
			"Learn how to provide your basic personal details and address information.",
	},
	familyInfo: {
		src: "https://drive.google.com/file/d/15uTTWi5m3JmMJ1yDspkn4PmEumpljjf5/preview",
		poster: "/images/family-info-poster.jpg",
		title: "Family Information Guide",
		description:
			"Understand how to document your spouse, children, and pets in your will.",
	},
	guardians: {
		src: "https://drive.google.com/file/d/1KG8L7Zo0wFqz2-CEgemQ8Ccr6194UWNy/preview",
		poster: "/images/guardians-poster.jpg",
		title: "Guardians Guide",
		description: "Learn about appointing guardians for your minor children.",
	},
	hasAssets: {
		src: [
			"https://drive.google.com/file/d/1711JH5shwm2NW1-vtyQsMYLYSgQFPGFU/preview",
			"https://drive.google.com/file/d/1Hn6uf109REzOVeUMSi9C-NQPVou1b-rk/preview",
		],
		poster: ["/images/assets-poster.jpg", "/images/assets-poster-2.jpg"],
		title: ["Assets Guide", "Digital Assets Guide"],
		description: [
			"Discover how to document and distribute your assets effectively.",
			"Learn how to document and distribute your digital assets effectively.",
		],
	},
	gifts: {
		src: "https://drive.google.com/file/d/1JajuIvTClzV8zQQsQDYCVdycKIb0ACXv/preview",
		poster: "/images/gifts-poster.jpg",
		title: "Gifts Guide",
		description:
			"Learn how to make specific gifts to individuals or organizations.",
	},
	residuary: {
		src: "https://drive.google.com/file/d/1-7pahh83o-SOnOBLZfrd9TxH1guclIxW/preview",
		poster: "/images/residuary-poster.jpg",
		title: "Residuary Estate Guide",
		description: "Understand how to distribute the remainder of your estate.",
	},
	executors: {
		src: "https://drive.google.com/file/d/12depyRm1g0HNSchaG-kZxLfYTY4QL0zB/preview",
		poster: "/images/executors-poster.jpg",
		title: "Executors Guide",
		description: "Learn about appointing executors to carry out your will.",
	},
	funeralInstructions: {
		src: "https://drive.google.com/file/d/1Y9NELwX78wH8yMm7cB6I5jss5SC8hRCU/preview",
		poster: "/images/funeral-poster.jpg",
		title: "Funeral Instructions Guide",
		description: "Document your funeral and burial wishes for your loved ones.",
	},
	review: {
		src: "https://drive.google.com/file/d/1Y9NELwX78wH8yMm7cB6I5jss5SC8hRCU/preview",
		poster: "/images/review-poster.jpg",
		title: "Review Guide",
		description:
			"Learn how to review and finalize your will before submission.",
	},
};

// const KNOWLEDGE_BASE: Record<QuestionType, KnowledgeArticle[]> = {
// 	personalInfo: [
// 		{
// 			title: "Personal Information",
// 			description:
// 				"Learn about collecting basic personal and address information for your will.",
// 			url: "/help/personal-information",
// 		},
// 	],
// 	familyInfo: [
// 		{
// 			title: "Family Information",
// 			description:
// 				"Learn about documenting your spouse, children, and pets in your will.",
// 			url: "/help/family-information",
// 		},
// 	],
// 	guardians: [
// 		{
// 			title: "Guardians",
// 			description: "Learn about appointing guardians for minor children.",
// 			url: "/help/guardians",
// 		},
// 	],
// 	hasAssets: [
// 		{
// 			title: "Assets",
// 			description:
// 				"Learn about documenting your assets and how to distribute them.",
// 			url: "/help/assets",
// 		},
// 	],
// 	gifts: [
// 		{
// 			title: "Gifts",
// 			description:
// 				"Learn about making specific gifts to individuals or organizations.",
// 			url: "/help/gifts",
// 		},
// 	],
// 	residuary: [
// 		{
// 			title: "Residuary Estate",
// 			description: "Learn about distributing the remainder of your estate.",
// 			url: "/help/residuary-estate",
// 		},
// 	],
// 	executors: [
// 		{
// 			title: "Executors",
// 			description: "Learn about appointing executors to carry out your will.",
// 			url: "/help/executors",
// 		},
// 	],
// 	funeralInstructions: [
// 		{
// 			title: "Funeral Instructions",
// 			description: "Learn about documenting your funeral and burial wishes.",
// 			url: "/help/funeral-instructions",
// 		},
// 	],
// 	review: [
// 		{
// 			title: "Review",
// 			description: "Learn about reviewing and finalizing your will.",
// 			url: "/help/review",
// 		},
// 	],
// };

export default function KnowledgeBaseSidebar({
	currentStep,
}: KnowledgeBaseSidebarProps) {
	// const articles = KNOWLEDGE_BASE[currentStep] || [];
	const videoContent = STEP_VIDEOS[currentStep] || STEP_VIDEOS.personalInfo; // Fallback to personal info

	// Helper function to normalize video content
	const normalizeVideoContent = (content: typeof videoContent) => {
		if (Array.isArray(content.src)) {
			return content.src.map((src, index) => ({
				src,
				poster: Array.isArray(content.poster)
					? content.poster[index]
					: content.poster,
				title: Array.isArray(content.title)
					? content.title[index]
					: content.title,
				description: Array.isArray(content.description)
					? content.description[index]
					: content.description,
			}));
		}
		return [
			{
				src: content.src as string,
				poster: content.poster as string,
				title: content.title as string,
				description: content.description as string,
			},
		];
	};

	const videos = normalizeVideoContent(videoContent);

	return (
		<div
			className="w-full lg:w-80 p-4 lg:p-6 self-start"
			style={{ backgroundColor: "#EDFBF6" }}
		>
			{/* Video Section */}
			<div className="mb-0 space-y-4">
				{videos.map((video, index) => (
					<VideoGuide
						key={index}
						src={video.src}
						poster={video.poster}
						title={video.title}
						description={video.description}
					/>
				))}
			</div>

			{/* <h3
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
			</div> */}
		</div>
	);
}
