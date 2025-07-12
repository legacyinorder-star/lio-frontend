import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

import { getUserDetails } from "@/utils/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWill } from "@/context/WillContext";
import { type WillData } from "@/context/WillContext";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { mapWillDataFromAPI } from "@/utils/dataTransform";
import { downloadWillPDF } from "@/utils/willDownload";
import { Edit, CreditCard, Download, Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
	const navigate = useNavigate();
	const { activeWill, setActiveWill } = useWill();
	const [userName, setUserName] = useState<string>("");
	const [wills, setWills] = useState<WillData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [deleteModal, setDeleteModal] = useState<{
		open: boolean;
		willId: string | null;
		willOwnerName: string | null;
	}>({ open: false, willId: null, willOwnerName: null });

	// Utility function to convert text to title case
	const toTitleCase = (text: string) => {
		return text
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	};

	// Handler functions
	const handleEditWill = (willId: string) => {
		const will = wills.find((w) => w.id === willId);
		if (will) {
			setActiveWill(will);
			navigate("/app/create-will");
		}
	};

	const handlePaymentForWill = (willId: string) => {
		setIsProcessingPayment(true);
		navigate(`/app/payment?willId=${willId}`);
	};

	const handleDownloadPDF = async (willId: string) => {
		try {
			await downloadWillPDF(willId);
			toast.success("Will PDF downloaded successfully");
		} catch (error) {
			console.error("Error downloading PDF:", error);
			toast.error("Failed to download PDF. Please try again.");
		}
	};

	const handleDeleteWill = (willId: string) => {
		const will = wills.find((w) => w.id === willId);
		const ownerName =
			will?.owner?.firstName && will?.owner?.lastName
				? `${will.owner.firstName} ${will.owner.lastName}`
				: "Unknown";

		setDeleteModal({
			open: true,
			willId,
			willOwnerName: ownerName,
		});
	};

	const confirmDeleteWill = async () => {
		if (!deleteModal.willId) return;

		try {
			const { error } = await apiClient(`/wills/${deleteModal.willId}`, {
				method: "DELETE",
			});

			if (error) {
				console.error("Error deleting will:", error);
				toast.error("Failed to delete will. Please try again.");
				return;
			}

			// Clear active will if it's the one being deleted
			if (activeWill && activeWill.id === deleteModal.willId) {
				setActiveWill(null);
			}

			setWills((prev) => prev.filter((w) => w.id !== deleteModal.willId));
			toast.success("Will deleted successfully");
		} catch (error) {
			console.error("Error deleting will:", error);
			toast.error("Failed to delete will. Please try again.");
		} finally {
			setDeleteModal({ open: false, willId: null, willOwnerName: null });
		}
	};

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

				// Sort wills by created date (newest first)
				const sortedWills = transformedWills.sort((a, b) => {
					const dateA = new Date(a.createdAt).getTime();
					const dateB = new Date(b.createdAt).getTime();
					return dateB - dateA; // Descending order (newest first)
				});

				setWills(sortedWills);
			} catch (error) {
				console.error("Error fetching wills:", error);
				toast.error("Failed to load wills. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchWills();
	}, [navigate]);

	const actions = [
		{
			title: activeWill ? "Continue Your Will" : "Create New Will",
			description: activeWill
				? "Continue working on your will where you left off. Complete your estate planning today."
				: "Share personal guidance for your loved ones that complements your formal will.",
			href: "/app/create-will",
			action: activeWill ? "Continue Will" : "Start your Will",
		},
		{
			title: "Power of Attorney",
			description:
				"Share personal guidance for your loved ones that complements your formal will.",
			href: "/app/power-of-attorney",
			action: "Create a Power of Attorney",
		},
		{
			title: "Letter of Wishes",
			description:
				"Share personal guidance for your loved ones that complements your formal will.",
			href: "/app/letter-of-wishes",
			action: "Add a Letter of Wishes",
		},
	];

	return (
		<div className="space-y-8">
			<div
				id="dashboard-header"
				className="flex flex-col items-start justify-between p-8 ps-14 rounded-lg"
				style={{ backgroundColor: "#173C37" }}
			>
				<h1 className="text-[2rem] font-semibold text-white">
					Welcome {userName}
				</h1>
				<p className="text-white text-sm font-normal mt-2">
					Let's get your legacy in order
				</p>

				<div
					className="bg-white rounded-lg p-6 mt-6 w-full max-w-md"
					style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.15)" }}
				>
					<h3 className="text-[1.25rem] font-semibold text-black mb-2">
						Your Will
					</h3>
					<p className="text-black font-normal text-sm mb-4">
						{!activeWill
							? "Get started with your will"
							: "Continue where you left off. It only takes a few minutes to get started."}
					</p>
					<Button
						onClick={() => navigate("/app/create-will")}
						className="bg-primary hover:bg-primary/90 text-white flex items-center justify-center"
					>
						{!activeWill ? (
							<>
								Start your Will
								<svg
									width="20"
									height="8"
									viewBox="0 0 20 8"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="ml-2 w-6 h-auto"
								>
									<path
										d="M19.3536 4.45707C19.5488 4.26181 19.5488 3.94523 19.3536 3.74996L16.1716 0.567983C15.9763 0.372721 15.6597 0.372721 15.4645 0.567983C15.2692 0.763245 15.2692 1.07983 15.4645 1.27509L18.2929 4.10352L15.4645 6.93194C15.2692 7.12721 15.2692 7.44379 15.4645 7.63905C15.6597 7.83431 15.9763 7.83431 16.1716 7.63905L19.3536 4.45707ZM0 4.10352L-4.37114e-08 4.60352L19 4.60352L19 4.10352L19 3.60352L4.37114e-08 3.60352L0 4.10352Z"
										fill="currentColor"
									/>
								</svg>
							</>
						) : (
							"Continue Will"
						)}
					</Button>
				</div>
			</div>

			<div>
				<h2 className="font-semibold mt-6 mb-6">Quick Links</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{actions.map((action) => (
						<Link
							key={action.title}
							to={action.href || "#"}
							className="block transition-transform hover:scale-105"
						>
							<Card
								className="p-8 h-full rounded-lg bg-white"
								style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.10)" }}
							>
								<div>
									<h3 className="text-[1.25rem] font-semibold text-black mb-2">
										{action.title}
									</h3>
									<p className="text-sm font-[400] text-muted-foreground mb-6">
										{action.description}
									</p>
									<div className="flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
										{action.action}
										<svg
											width="20"
											height="8"
											viewBox="0 0 20 8"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											className="ml-2 w-6 h-auto"
										>
											<path
												d="M19.3536 4.45707C19.5488 4.26181 19.5488 3.94523 19.3536 3.74996L16.1716 0.567983C15.9763 0.372721 15.6597 0.372721 15.4645 0.567983C15.2692 0.763245 15.2692 1.07983 15.4645 1.27509L18.2929 4.10352L15.4645 6.93194C15.2692 7.12721 15.2692 7.44379 15.4645 7.63905C15.6597 7.83431 15.9763 7.83431 16.1716 7.63905L19.3536 4.45707ZM0 4.10352L-4.37114e-08 4.60352L19 4.60352L19 4.10352L19 3.60352L4.37114e-08 3.60352L0 4.10352Z"
												fill="currentColor"
											/>
										</svg>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>
			</div>

			{/* Recent Documents Section */}
			<div className="mt-16">
				<h2 className="font-semibold mb-6">Recent Documents</h2>
				{isLoading ? (
					<Card
						className="p-6 h-full rounded-lg bg-white"
						style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.10)" }}
					>
						<div className="flex items-center justify-center py-8">
							<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
							<p className="text-muted-foreground ml-2">Loading wills...</p>
						</div>
					</Card>
				) : wills.length === 0 ? (
					<div className="text-center py-12 bg-gray-50 rounded-lg">
						<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-gray-400"
							>
								<path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
								<path d="M6 6h12" />
								<path d="M6 10h12" />
								<path d="M6 14h12" />
								<path d="M6 18h12" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							No documents yet
						</h3>
						<p className="text-gray-600 mb-4">
							Get started by creating your will
						</p>
						<Button
							onClick={() => navigate("/app/create-will")}
							className="bg-primary hover:bg-primary/90 text-white"
						>
							Create Your Will
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{wills.map((will) => (
							<Card
								key={will.id}
								className="p-6 h-full rounded-lg bg-white"
								style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.10)" }}
							>
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center">
										<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="text-primary"
											>
												<path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
												<path d="M6 6h12" />
												<path d="M6 10h12" />
												<path d="M6 14h12" />
												<path d="M6 18h12" />
											</svg>
										</div>
										<div>
											<h3 className="text-[1rem] font-semibold text-black">
												Will for {will.owner?.firstName || "Unknown"}{" "}
												{will.owner?.lastName || ""}
											</h3>
											<p className="text-xs text-muted-foreground">
												Created: {new Date(will.createdAt).toLocaleDateString()}
												{will.lastUpdatedAt !== will.createdAt &&
													` • Updated: ${new Date(
														will.lastUpdatedAt
													).toLocaleDateString()}`}
											</p>
										</div>
									</div>
									<span
										className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
											will.status === "draft"
												? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
												: will.status === "completed"
												? "bg-green-50 text-green-700 ring-green-600/20"
												: "bg-gray-50 text-gray-700 ring-gray-600/20"
										}`}
									>
										{toTitleCase(will.status)}
									</span>
								</div>

								<div className="text-sm mb-4 space-y-1">
									{will.paymentStatus && (
										<p>
											<span className="font-medium text-muted-foreground">
												Payment:
											</span>{" "}
											<span
												className={`${
													will.paymentStatus === "paid"
														? "text-green-600"
														: will.paymentStatus === "pending"
														? "text-yellow-600"
														: "text-red-600"
												}`}
											>
												{toTitleCase(will.paymentStatus || "unpaid")}
											</span>
											{will.paymentDate && (
												<span className="text-muted-foreground ml-2">
													on {new Date(will.paymentDate).toLocaleDateString()}
												</span>
											)}
										</p>
									)}
								</div>

								<div className="flex gap-2 mt-auto">
									{will.status !== "completed" && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditWill(will.id)}
											className="flex-1 hover:bg-blue-50 text-blue-600"
										>
											<Edit className="h-4 w-4 mr-2" />
											Continue
										</Button>
									)}
									{will.status === "draft" && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePaymentForWill(will.id)}
											className="flex-1 hover:bg-green-50 text-green-600"
											disabled={isProcessingPayment}
										>
											<CreditCard className="h-4 w-4 mr-2" />
											Pay
										</Button>
									)}
									{will.status === "completed" && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDownloadPDF(will.id)}
											className="flex-1 hover:bg-green-50 text-green-600"
											disabled={!will.owner}
										>
											<Download className="h-4 w-4 mr-2" />
											Download
										</Button>
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeleteWill(will.id)}
										className="hover:bg-red-500 hover:text-white text-red-600"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</Card>
						))}
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-28">
				{/* Left Card - Black Background */}
				<div
					className="rounded-[0.5rem] p-8 text-white"
					style={{ backgroundColor: "#000000" }}
				>
					<h3 className="text-[1.5rem] text-white font-semibold mb-2">
						Try out the Legacy Vault
					</h3>
					<p className="text-white text-sm mb-16 font-normal leading-relaxed">
						The Legacy Vault is a new way for you to manage all you important
						documents, all in one place.
					</p>
					<div
						onClick={() => navigate("/app/vault")}
						className="flex items-center text-white cursor-pointer hover:text-gray-300 transition-colors"
					>
						<span className="text-sm font-semibold">Get Started</span>
						<svg
							width="20"
							height="8"
							viewBox="0 0 20 8"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="ml-2 w-6 h-auto"
						>
							<path
								d="M19.3536 4.45707C19.5488 4.26181 19.5488 3.94523 19.3536 3.74996L16.1716 0.567983C15.9763 0.372721 15.6597 0.372721 15.4645 0.567983C15.2692 0.763245 15.2692 1.07983 15.4645 1.27509L18.2929 4.10352L15.4645 6.93194C15.2692 7.12721 15.2692 7.44379 15.4645 7.63905C15.6597 7.83431 15.9763 7.83431 16.1716 7.63905L19.3536 4.45707ZM0 4.10352L-4.37114e-08 4.60352L19 4.60352L19 4.10352L19 3.60352L4.37114e-08 3.60352L0 4.10352Z"
								fill="currentColor"
							/>
						</svg>
					</div>
				</div>

				{/* Right Card - Light Gray Background */}
				<div
					className="rounded-[0.5rem] p-8"
					style={{ backgroundColor: "#FAFAFA" }}
				>
					<div className="flex items-center mb-6">
						<img
							src="/svgs/green_shield.svg"
							alt="Security shield"
							className="h-12 w-auto mr-4"
						/>
						<div>
							<h4 className="font-semibold text-[1.25rem] text-black">
								100% Secure
							</h4>
							<p
								className="text-[0.875rem] font-normal"
								style={{ color: "#545454" }}
							>
								Your data is protected with 256-bit encryption
							</p>
						</div>
					</div>

					<p className="text-sm font-semibold text-primary mt-20">
						Learn how we keep you safe
					</p>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<AlertDialog
				open={deleteModal.open}
				onOpenChange={(open) =>
					!open &&
					setDeleteModal({ open: false, willId: null, willOwnerName: null })
				}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Will</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the will for{" "}
							<span className="font-semibold">{deleteModal.willOwnerName}</span>
							?
							<br />
							<br />
							This action cannot be undone and will permanently remove all data
							associated with this will.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDeleteWill}
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white font-semibold"
						>
							Delete Will
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
