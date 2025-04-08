import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
	Scroll,
	FileText,
	Users,
	Building2,
	Shield,
	PlusCircle,
} from "lucide-react";

export default function DashboardPage() {
	const actions = [
		{
			title: "Create New Will",
			description: "Start creating your last will and testament",
			icon: <Scroll className="h-6 w-6" />,
			href: "/create-will",
			color: "text-blue-500",
		},
		// {
		// 	title: "Living Trust",
		// 	description: "Set up a living trust for your assets",
		// 	icon: <Building2 className="h-6 w-6" />,
		// 	href: "/create-trust",
		// 	color: "text-green-500",
		// },
		{
			title: "Power of Attorney",
			description: "Designate someone to act on your behalf",
			icon: <Shield className="h-6 w-6" />,
			href: "/power-of-attorney",
			color: "text-purple-500",
		},
		{
			title: "Letter of Wishes",
			description: "Leave a message for your loved ones",
			icon: <FileText className="h-6 w-6" />,
			href: "/power-of-attorney",
			color: "text-green-500",
		},
		// {
		// 	title: "Healthcare Directive",
		// 	description: "Specify your healthcare preferences",
		// 	icon: <FileText className="h-6 w-6" />,
		// 	href: "/healthcare-directive",
		// 	color: "text-red-500",
		// },
		// {
		// 	title: "Beneficiaries",
		// 	description: "Manage your beneficiaries",
		// 	icon: <Users className="h-6 w-6" />,
		// 	href: "/beneficiaries",
		// 	color: "text-orange-500",
		// },
		// {
		// 	title: "Add Document",
		// 	description: "Upload additional legal documents",
		// 	icon: <PlusCircle className="h-6 w-6" />,
		// 	href: "/add-document",
		// 	color: "text-teal-500",
		// },
	];

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Welcome back, John!</h1>
				<p className="text-muted-foreground">
					Here's an overview of your legal docs
				</p>
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{actions.map((action) => (
						<Link
							key={action.title}
							to={action.href}
							className="block transition-transform hover:scale-105"
						>
							<Card className="p-4 h-full">
								<div className="flex items-start space-x-4">
									<div className={`${action.color} shrink-0`}>
										{action.icon}
									</div>
									<div>
										<h3 className="font-medium">{action.title}</h3>
										<p className="text-sm text-muted-foreground">
											{action.description}
										</p>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
				<div className="grid grid-cols-1 gap-4">
					<Card className="p-4">
						<p className="text-muted-foreground text-center py-8">
							No documents created yet. Start by creating a will or trust.
						</p>
					</Card>
				</div>
			</div>
		</div>
	);
}
