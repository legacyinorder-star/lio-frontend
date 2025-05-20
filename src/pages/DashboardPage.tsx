import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Scroll, FileText, Shield, Download, Trash2, Edit } from "lucide-react";
import { getUserDetails } from "@/utils/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import WillPDF from "@/components/will-wizard/WillPDF";

interface Will {
	id: string;
	createdAt: string;
	updatedAt: string;
	status: "draft" | "final";
	data: {
		personal: {
			fullName: string;
			dateOfBirth: string;
			address: string;
			phone: string;
			maritalStatus: string;
		};
		assets: Array<{
			type: string;
			description: string;
			value: string;
		}>;
		beneficiaries: Array<{
			fullName: string;
			relationship: string;
			email?: string;
			phone?: string;
			allocation: number;
		}>;
		executors: Array<{
			fullName?: string;
			companyName?: string;
			relationship?: string;
			email?: string;
			phone?: string;
			address: string;
			isPrimary: boolean;
			type: "individual" | "corporate";
			contactPerson?: string;
		}>;
		witnesses: Array<{
			fullName: string;
			address: string;
		}>;
	};
}

export default function DashboardPage() {
	const navigate = useNavigate();
	const [userName, setUserName] = useState<string>("");
	const [wills, setWills] = useState<Will[]>([]);

	useEffect(() => {
		const userDetails = getUserDetails();
		if (!userDetails) {
			navigate("/login");
			return;
		}

		const name = userDetails.first_name || userDetails.email.split("@")[0];
		setUserName(name);

		// Load saved wills from localStorage
		const savedWills = JSON.parse(localStorage.getItem("wills") || "[]");
		setWills(savedWills);
	}, [navigate]);

	const handleDeleteWill = (willId: string) => {
		const updatedWills = wills.filter((will) => will.id !== willId);
		localStorage.setItem("wills", JSON.stringify(updatedWills));
		setWills(updatedWills);
		toast.success("Will deleted successfully");
	};

	const handleEditWill = (willId: string) => {
		// Navigate to the will wizard with the will ID
		navigate(`/create-will?edit=${willId}`);
	};

	const handleDownloadPDF = async (will: Will) => {
		try {
			// Create the PDF document using our WillPDF component
			const pdfDoc = pdf(
				<WillPDF
					data={will.data}
					additionalText="This is a sample additional text that can be customized based on the user's input."
				/>
			);

			// Generate blob
			const blob = await pdfDoc.toBlob();

			// Create download link
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `will-${will.data.personal.fullName
				.toLowerCase()
				.replace(/\s+/g, "-")}-${
				new Date(will.createdAt).toISOString().split("T")[0]
			}.pdf`;

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 100);

			toast.success("PDF downloaded successfully");
		} catch (error) {
			console.error("Error generating PDF:", error);
			toast.error("Failed to generate PDF");
		}
	};

	const actions = [
		{
			title: "Create New Will",
			description: "Start creating your last will and testament",
			icon: <Scroll className="h-6 w-6" />,
			href: "/create-will",
			color: "text-blue-500",
		},
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
	];

	return (
		<div className="space-y-8">
			<div
				id="dashboard-header"
				className="flex flex-col items-start justify-between p-8 rounded-lg bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: "url('/images/bg_grass.png')" }}
			>
				<h1 className="text-3xl font-bold text-white">
					Welcome back, {userName}!
				</h1>
				<p className="text-white/90 mt-2">
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
					{wills.length === 0 ? (
						<Card className="p-4">
							<p className="text-muted-foreground text-center py-8">
								No documents created yet. Start by creating a will or trust.
							</p>
						</Card>
					) : (
						wills.map((will) => (
							<Card key={will.id} className="p-4">
								<div className="flex justify-between items-start">
									<div className="space-y-2">
										<h3 className="font-medium">
											Will for {will.data.personal.fullName}
										</h3>
										<p className="text-sm text-muted-foreground">
											Created on {new Date(will.createdAt).toLocaleDateString()}
											{will.updatedAt !== will.createdAt &&
												` (Updated on ${new Date(
													will.updatedAt
												).toLocaleDateString()})`}
										</p>
										<div className="text-sm">
											<p>
												<span className="font-medium">Status:</span>{" "}
												<span
													className={`capitalize ${
														will.status === "draft"
															? "text-yellow-600"
															: "text-green-600"
													}`}
												>
													{will.status}
												</span>
											</p>
											<p>
												<span className="font-medium">Assets:</span>{" "}
												{will.data.assets.length}
											</p>
											<p>
												<span className="font-medium">Beneficiaries:</span>{" "}
												{will.data.beneficiaries.length}
											</p>
											<p>
												<span className="font-medium">Executors:</span>{" "}
												{will.data.executors.length}
											</p>
											<p>
												<span className="font-medium">Witnesses:</span>{" "}
												{will.data.witnesses.length}
											</p>
										</div>
									</div>
									<div className="flex space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditWill(will.id)}
											className="hover:bg-blue-100 text-blue-600 cursor-pointer"
										>
											<Edit className="h-4 w-4 mr-2" />
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDownloadPDF(will)}
											className="hover:bg-light-green/10 cursor-pointer"
										>
											<Download className="h-4 w-4 mr-2" />
											Download
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteWill(will.id)}
											className="hover:bg-red-100 text-red-600 cursor-pointer"
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete
										</Button>
									</div>
								</div>
							</Card>
						))
					)}
				</div>
			</div>
		</div>
	);
}
