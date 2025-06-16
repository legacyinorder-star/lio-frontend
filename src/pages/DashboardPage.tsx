import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Scroll, FileText, Shield, Download, Trash2, Edit } from "lucide-react";
import { getUserDetails } from "@/utils/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import WillPDF from "@/components/will-wizard/WillPDF";
import { apiClient } from "@/utils/apiClient";
import { type WillData } from "@/context/WillContext";
import { mapWillDataFromAPI } from "@/utils/dataTransform";

export default function DashboardPage() {
	const navigate = useNavigate();
	const [userName, setUserName] = useState<string>("");
	const [wills, setWills] = useState<WillData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const userDetails = getUserDetails();
		if (!userDetails) {
			navigate("/login");
			return;
		}

		const name = userDetails.first_name || userDetails.email.split("@")[0];
		setUserName(name);

		// Fetch wills from API
		const fetchWills = async () => {
			try {
				const { data, error } = await apiClient<unknown[]>("/wills");
				if (error) {
					console.error("Error fetching wills:", error);
					toast.error("Failed to load wills. Please try again.");
					return;
				}

				// Transform API response from snake_case to camelCase
				const transformedWills = Array.isArray(data)
					? data.map((willData) => mapWillDataFromAPI(willData))
					: [];

				setWills(transformedWills);
			} catch (error) {
				console.error("Error fetching wills:", error);
				toast.error("Failed to load wills. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchWills();
	}, [navigate]);

	const handleDeleteWill = async (willId: string) => {
		try {
			const { error } = await apiClient(`/wills/${willId}`, {
				method: "DELETE",
			});

			if (error) {
				console.error("Error deleting will:", error);
				toast.error("Failed to delete will. Please try again.");
				return;
			}

			// Update local state
			setWills((prevWills) => prevWills.filter((will) => will.id !== willId));
			toast.success("Will deleted successfully");
		} catch (error) {
			console.error("Error deleting will:", error);
			toast.error("Failed to delete will. Please try again.");
		}
	};

	const handleEditWill = (willId: string) => {
		navigate(`/app/create-will?edit=${willId}`);
	};

	const handleDownloadPDF = async (will: WillData) => {
		try {
			if (!will.owner) {
				toast.error("Cannot generate PDF: Will data is incomplete");
				return;
			}

			// Transform the will data into the format expected by WillPDF
			const pdfData = {
				personal: {
					fullName: `${will.owner.firstName} ${will.owner.lastName}`,
					dateOfBirth: "", // Not available in WillData
					address: `${will.owner.address}, ${will.owner.city}, ${
						will.owner.state
					} ${will.owner.postCode || ""}, ${will.owner.country}`,
					phone: "", // Not available in WillData
					maritalStatus: will.owner.maritalStatus,
				},
				assets: (will.assets || []).map((asset) => ({
					type: asset.assetType,
					description: asset.description,
					distributionType: "equal" as const, // Default to equal distribution
					beneficiaries: [], // Not available in WillData
				})),
				beneficiaries: (will.beneficiaries || []).map((beneficiary) => ({
					id: "", // Not available in WillBeneficiary
					fullName: `${beneficiary.firstName} ${beneficiary.lastName}`,
					relationship: beneficiary.relationship,
					email: "", // Not available in WillBeneficiary
					phone: "", // Not available in WillBeneficiary
					allocation: beneficiary.allocation,
					dateOfBirth: "", // Not available in WillBeneficiary
					requiresGuardian: false, // Not available in WillBeneficiary
				})),
				executors: (will.executors || []).map((executor) => ({
					fullName:
						executor.type === "individual"
							? `${executor.firstName} ${executor.lastName}`
							: undefined,
					companyName:
						executor.type === "corporate" ? executor.companyName : undefined,
					relationship: executor.relationship,
					email: "", // Not available in WillExecutor
					phone: "", // Not available in WillExecutor
					address: `${executor.address.address}, ${executor.address.city}, ${
						executor.address.state
					} ${executor.address.postCode || ""}, ${executor.address.country}`,
					isPrimary: executor.isPrimary,
					type: executor.type,
					contactPerson:
						executor.type === "corporate" ? executor.contactPerson : undefined,
					registrationNumber: "", // Not available in WillExecutor
				})),
				witnesses: (will.witnesses || []).map((witness) => ({
					fullName: `${witness.firstName} ${witness.lastName}`,
					address: `${witness.address.address}, ${witness.address.city}, ${
						witness.address.state
					} ${witness.address.postCode || ""}, ${witness.address.country}`,
				})),
				guardians: [], // Not available in WillData
				gifts: [], // Not available in WillData
				residuaryBeneficiaries: [], // Not available in WillData
				additionalInstructions: "", // Not available in WillData
			};

			// Create the PDF document using our WillPDF component
			const pdfDoc = pdf(
				<WillPDF
					data={pdfData}
					additionalText="This is a sample additional text that can be customized based on the user's input."
				/>
			);

			try {
				// First try to get the blob directly
				const blob = await pdfDoc.toBlob();
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `will-${will.owner.firstName
					.toLowerCase()
					.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

				// Trigger download
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				// Clean up
				setTimeout(() => {
					URL.revokeObjectURL(url);
				}, 100);

				toast.success("Will downloaded successfully");
			} catch (error) {
				console.error("Direct blob generation failed, trying buffer:", error);
				try {
					// If direct blob generation fails, try using buffer
					const buffer = await pdfDoc.toBuffer();
					const blob = new Blob([buffer], { type: "application/pdf" });
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = `will-${will.owner.firstName
						.toLowerCase()
						.replace(/\s+/g, "-")}-${
						new Date().toISOString().split("T")[0]
					}.pdf`;

					// Trigger download
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

					// Clean up
					setTimeout(() => {
						URL.revokeObjectURL(url);
					}, 100);

					toast.success("Will downloaded successfully");
				} catch (bufferError) {
					console.error("Buffer generation failed:", bufferError);
					throw new Error("Failed to generate PDF document");
				}
			}
		} catch (error) {
			console.error("Error generating PDF:", error);
			toast.error(
				"Failed to generate PDF. Please try again or contact support if the issue persists."
			);
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
					{isLoading ? (
						<Card className="p-4">
							<div className="flex items-center justify-center py-8">
								<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
								<p className="text-muted-foreground ml-2">Loading wills...</p>
							</div>
						</Card>
					) : wills.length === 0 ? (
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
											Will for {will.owner?.firstName || "Unknown"}{" "}
											{will.owner?.lastName || ""}
										</h3>
										<p className="text-sm text-muted-foreground">
											Created on {new Date(will.createdAt).toLocaleDateString()}
											{will.lastUpdatedAt !== will.createdAt &&
												` (Updated on ${new Date(
													will.lastUpdatedAt
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
												{will.assets?.length || 0}
											</p>
											<p>
												<span className="font-medium">Beneficiaries:</span>{" "}
												{will.beneficiaries?.length || 0}
											</p>
											<p>
												<span className="font-medium">Executors:</span>{" "}
												{will.executors?.length || 0}
											</p>
											<p>
												<span className="font-medium">Witnesses:</span>{" "}
												{will.witnesses?.length || 0}
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
											Continue
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDownloadPDF(will)}
											className="hover:bg-light-green/10 cursor-pointer"
											disabled={!will.owner}
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
