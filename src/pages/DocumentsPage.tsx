import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import {
	Edit,
	CreditCard,
	Download,
	Trash2,
	Search,
	Plus,
	FileText,
	Filter,
	Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWill, type WillData } from "@/context/WillContext";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { getUserDetails } from "@/utils/auth";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { mapWillDataFromAPI } from "@/utils/dataTransform";
import { smartDownloadWill } from "@/utils/willSmartDownload";

export default function DocumentsPage() {
	const navigate = useNavigate();
	const { setActiveWill } = useWill();
	const { setWillData } = useLetterOfWishes();
	const [documents, setDocuments] = useState<WillData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("updated");
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
	const handleEditDocument = (documentId: string) => {
		const document = documents.find((d) => d.id === documentId);
		if (document) {
			setActiveWill(document);
			navigate("/app/create-will");
		}
	};

	const handlePaymentForDocument = (documentId: string) => {
		setIsProcessingPayment(true);
		// Navigate directly to Stripe Checkout (same as Review step)
		const paymentUrl = `/app/payment/checkout?willId=${documentId}&description=Will Creation Service`;
		navigate(paymentUrl);
	};

	const handleDownloadPDF = async (documentId: string) => {
		try {
			const document = documents.find((d) => d.id === documentId);
			if (!document) {
				toast.error("Document not found");
				return;
			}

			await smartDownloadWill(document);
			toast.success("Document PDF downloaded successfully");
		} catch (error) {
			console.error("Error downloading PDF:", error);
			toast.error("Failed to download PDF. Please try again.");
		}
	};

	const handleCreateLetterOfWishes = (documentId: string) => {
		const document = documents.find((d) => d.id === documentId);
		if (document) {
			// Store the will data in the Letter of Wishes context
			setWillData(document);
			// Navigate to letter of wishes with will ID
			navigate(`/app/letter-of-wishes?willId=${documentId}`);
		} else {
			toast.error("Document not found");
		}
	};

	const handleDeleteDocument = (documentId: string) => {
		const document = documents.find((d) => d.id === documentId);
		const ownerName =
			document?.owner?.firstName && document?.owner?.lastName
				? `${document.owner.firstName} ${document.owner.lastName}`
				: "Unknown";

		setDeleteModal({
			open: true,
			willId: documentId,
			willOwnerName: ownerName,
		});
	};

	const confirmDeleteDocument = async () => {
		if (!deleteModal.willId) return;

		try {
			const { error } = await apiClient(`/wills/${deleteModal.willId}`, {
				method: "DELETE",
			});

			if (error) {
				console.error("Error deleting document:", error);
				toast.error("Failed to delete document. Please try again.");
				return;
			}

			setDocuments((prev) => prev.filter((d) => d.id !== deleteModal.willId));
			toast.success("Document deleted successfully");
		} catch (error) {
			console.error("Error deleting document:", error);
			toast.error("Failed to delete document. Please try again.");
		} finally {
			setDeleteModal({ open: false, willId: null, willOwnerName: null });
		}
	};

	// Load documents from API
	useEffect(() => {
		const userDetails = getUserDetails();
		if (!userDetails) {
			navigate("/login");
			return;
		}

		const fetchDocuments = async () => {
			try {
				const { data, error } = await apiClient<unknown[]>("/wills");
				if (error) {
					console.error("Error fetching documents:", error);
					toast.error("Failed to load documents. Please try again.");
					return;
				}

				// Transform API response from snake_case to camelCase
				const transformedDocuments = Array.isArray(data)
					? data.map((documentData) => mapWillDataFromAPI(documentData))
					: [];

				setDocuments(transformedDocuments);
			} catch (error) {
				console.error("Error fetching documents:", error);
				toast.error("Failed to load documents. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchDocuments();
	}, [navigate]);

	// Filter and sort documents
	const filteredAndSortedDocuments = documents
		.filter((doc) => {
			// Status filter
			if (statusFilter !== "all" && doc.status !== statusFilter) {
				return false;
			}

			// Search filter
			if (searchQuery) {
				const searchLower = searchQuery.toLowerCase();
				const ownerName = `${doc.owner?.firstName || ""} ${
					doc.owner?.lastName || ""
				}`.toLowerCase();
				return (
					ownerName.includes(searchLower) ||
					doc.status.toLowerCase().includes(searchLower)
				);
			}

			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "created":
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				case "updated":
					return (
						new Date(b.lastUpdatedAt).getTime() -
						new Date(a.lastUpdatedAt).getTime()
					);
				case "name": {
					const nameA = `${a.owner?.firstName || ""} ${
						a.owner?.lastName || ""
					}`;
					const nameB = `${b.owner?.firstName || ""} ${
						b.owner?.lastName || ""
					}`;
					return nameA.localeCompare(nameB);
				}
				case "status":
					return a.status.localeCompare(b.status);
				default:
					return 0;
			}
		});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-[2rem] font-semibold text-black">Documents</h1>
					<p className="text-muted-foreground">
						Manage all your created legal documents
					</p>
				</div>
				<Button
					onClick={() => navigate("/app/create-will")}
					className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
				>
					<Plus className="mr-2 h-4 w-4" />
					Create New Will
				</Button>
			</div>

			{/* Filters and Search */}
			<div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search documents by owner name or status..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>
				<div className="flex gap-2">
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[140px]">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="under review">Under Review</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="updated">Last Updated</SelectItem>
							<SelectItem value="created">Date Created</SelectItem>
							<SelectItem value="name">Owner Name</SelectItem>
							<SelectItem value="status">Status</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Documents List */}
			{isLoading ? (
				<Card className="p-6 h-full rounded-lg bg-white shadow-sm">
					<div className="flex items-center justify-center py-8">
						<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
						<p className="text-muted-foreground ml-2">Loading documents...</p>
					</div>
				</Card>
			) : filteredAndSortedDocuments.length === 0 ? (
				<div className="text-center py-16 bg-gray-50 rounded-lg">
					<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
						<FileText className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{documents.length === 0 ? "No documents yet" : "No documents found"}
					</h3>
					<p className="text-gray-600 mb-4">
						{documents.length === 0
							? "Get started by creating your first will"
							: "Try adjusting your search or filter criteria"}
					</p>
					{documents.length === 0 && (
						<Button
							onClick={() => navigate("/app/create-will")}
							className="bg-primary hover:bg-primary/90 text-white"
						>
							<Plus className="mr-2 h-4 w-4" />
							Create Your First Will
						</Button>
					)}
				</div>
			) : (
				<div className="space-y-4">
					<div className="text-sm text-muted-foreground">
						Showing {filteredAndSortedDocuments.length} of {documents.length}{" "}
						documents
					</div>
					<div className="grid gap-4">
						{filteredAndSortedDocuments.map((document) => (
							<Card
								key={document.id}
								className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
											<FileText className="w-6 h-6 text-primary" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-black">
												Will for {document.owner?.firstName || "Unknown"}{" "}
												{document.owner?.lastName || ""}
											</h3>
											<div className="flex items-center space-x-4 text-sm text-muted-foreground">
												<span>
													Created:{" "}
													{new Date(document.createdAt).toLocaleDateString()}
												</span>
												{document.lastUpdatedAt !== document.createdAt && (
													<span>
														Updated:{" "}
														{new Date(
															document.lastUpdatedAt
														).toLocaleDateString()}
													</span>
												)}
												{document.paymentStatus && (
													<span>
														Payment:
														<span
															className={`ml-1 ${
																document.paymentStatus === "paid"
																	? "text-green-600"
																	: document.paymentStatus === "pending"
																	? "text-yellow-600"
																	: "text-red-600"
															}`}
														>
															{toTitleCase(document.paymentStatus)}
														</span>
													</span>
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center space-x-4">
										<span
											className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
												document.status === "draft"
													? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
													: document.status === "completed"
													? "bg-green-50 text-green-700 ring-green-600/20"
													: document.status === "under review"
													? "bg-blue-50 text-blue-700 ring-blue-600/20"
													: "bg-gray-50 text-gray-700 ring-gray-600/20"
											}`}
										>
											{toTitleCase(document.status)}
										</span>
										<div className="flex gap-2 mt-auto">
											{document.status !== "completed" &&
												document.status !== "under review" && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleEditDocument(document.id)}
														className="flex-1 hover:bg-blue-50 text-blue-600"
													>
														<Edit className="h-4 w-4 mr-2" />
														Continue
													</Button>
												)}
											{document.status === "draft" && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => handlePaymentForDocument(document.id)}
													className="flex-1 hover:bg-green-50 text-green-600"
													disabled={isProcessingPayment}
												>
													<CreditCard className="h-4 w-4 mr-2" />
													Pay
												</Button>
											)}
											{document.status === "under review" && (
												<div className="flex-1 text-center">
													<p className="text-sm text-blue-600 font-medium">
														Under Review
													</p>
													<p className="text-xs text-muted-foreground">
														Our legal team is reviewing your will
													</p>
												</div>
											)}
											{document.status === "completed" && (
												<>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDownloadPDF(document.id)}
														className="flex-1 hover:bg-green-50 text-green-600"
														disabled={!document.owner}
													>
														<Download className="h-4 w-4 mr-2" />
														Download
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															handleCreateLetterOfWishes(document.id)
														}
														className="flex-1 hover:bg-purple-50 text-purple-600"
														title="Add Letter of Wishes"
													>
														<Heart className="h-4 w-4 mr-2" />
														Letter
													</Button>
												</>
											)}
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDeleteDocument(document.id)}
												className="hover:bg-red-500 hover:text-white text-red-600"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}

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
						<AlertDialogTitle>Delete Document</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the will for{" "}
							<span className="font-semibold">{deleteModal.willOwnerName}</span>
							?
							<br />
							<br />
							This action cannot be undone and will permanently remove all data
							associated with this document.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDeleteDocument}
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white font-semibold"
						>
							Delete Document
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
