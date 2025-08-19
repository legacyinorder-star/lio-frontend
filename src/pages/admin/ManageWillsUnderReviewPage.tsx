import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { smartDownloadWill } from "@/utils/willSmartDownload";
import { type WillData } from "@/context/WillContext";
import {
	Search,
	FileText,
	MoreVertical,
	Download,
	CheckCircle,
	XCircle,
	Clock,
	User,
	Calendar,
} from "lucide-react";
import { formatDate } from "@/utils/format";

interface WillUnderReview {
	id: string;
	status: "under review";
	created_at: string;
	updated_at: string;
	payment_status: "succeeded";
	payment_date: string;
	owner: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
		address: string;
		city: string;
		state: string;
		post_code: string;
		country: string;
	};
	user: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
	};
	document?: {
		willId: string;
		userId: string;
		document: {
			url: string;
			name: string;
			size: number;
			type: string;
		};
	};
}

interface RejectDialogData {
	isOpen: boolean;
	willId: string | null;
	willOwnerName: string | null;
	reason: string;
}

interface ApproveDialogData {
	isOpen: boolean;
	willId: string | null;
	willOwnerName: string | null;
}

export default function ManageWillsUnderReviewPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [wills, setWills] = useState<WillUnderReview[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [rejectDialog, setRejectDialog] = useState<RejectDialogData>({
		isOpen: false,
		willId: null,
		willOwnerName: null,
		reason: "",
	});
	const [approveDialog, setApproveDialog] = useState<ApproveDialogData>({
		isOpen: false,
		willId: null,
		willOwnerName: null,
	});
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		if (user?.role !== "admin") {
			navigate("/app/dashboard");
			return;
		}
		fetchWillsUnderReview();
	}, [user, navigate]);

	const fetchWillsUnderReview = async () => {
		try {
			setIsLoading(true);
			const { data, error } = await apiClient<WillUnderReview[]>(
				"/admin/wills/get-pending-review"
			);

			if (error) {
				throw new Error(error);
			}

			setWills(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching wills under review:", error);
			toast.error("Failed to load wills under review");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownloadWill = async (will: WillUnderReview) => {
		try {
			// Transform the admin will data to the format expected by smartDownloadWill
			const willData: WillData = {
				id: will.id,
				status: will.status,
				createdAt: will.created_at,
				lastUpdatedAt: will.updated_at,
				userId: will.user.id,
				paymentStatus: will.payment_status,
				paymentDate: will.payment_date,
				owner: {
					id: will.owner.id,
					firstName: will.owner.first_name,
					lastName: will.owner.last_name,
					maritalStatus: "Not specified",
					address: will.owner.address,
					city: will.owner.city,
					state: will.owner.state,
					postCode: will.owner.post_code,
					country: will.owner.country,
				},
				document: will.document
					? {
							willId: will.document.willId,
							userId: will.document.userId,
							document: {
								url: will.document.document.url,
								meta: {},
								mime: will.document.document.type,
								name: will.document.document.name,
								path: "",
								size: will.document.document.size,
								type: will.document.document.type,
								access: {},
							},
					  }
					: undefined,
				assets: [],
				gifts: [],
				beneficiaries: [],
				executors: [],
				witnesses: [],
				progress: {
					id: will.id,
					createdAt: will.created_at,
					willId: will.id,
					userId: will.user.id,
					completedSteps: {
						personalInfo: true,
						hasSpouse: true,
						hasChildren: true,
						guardians: true,
						pets: true,
						hasAssets: true,
						gifts: true,
						digitalAssets: true,
						residuary: true,
						executors: true,
						funeralInstructions: true,
						review: true,
					},
					currentStep: "review",
					updatedAt: will.updated_at,
				},
			};

			await smartDownloadWill(willData);
		} catch (error) {
			console.error("Error downloading will:", error);
			toast.error("Failed to download will");
		}
	};

	const handleApproveWill = async () => {
		if (!approveDialog.willId) {
			toast.error("No will selected for approval");
			return;
		}

		try {
			setIsProcessing(true);
			const { error } = await apiClient(
				`/admin/wills/${approveDialog.willId}/approve`,
				{
					method: "POST",
				}
			);

			if (error) {
				throw new Error(error);
			}

			toast.success("Will approved successfully");
			closeApproveDialog();
			fetchWillsUnderReview(); // Refresh the list
		} catch (error) {
			console.error("Error approving will:", error);
			toast.error("Failed to approve will");
		} finally {
			setIsProcessing(false);
		}
	};

	const openApproveDialog = (will: WillUnderReview) => {
		setApproveDialog({
			isOpen: true,
			willId: will.id,
			willOwnerName: `${will.owner.first_name} ${will.owner.last_name}`,
		});
	};

	const closeApproveDialog = () => {
		setApproveDialog({
			isOpen: false,
			willId: null,
			willOwnerName: null,
		});
	};

	const handleRejectWill = async () => {
		if (!rejectDialog.willId || !rejectDialog.reason.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}

		try {
			setIsProcessing(true);
			const { error } = await apiClient(
				`/admin/wills/${rejectDialog.willId}/reject`,
				{
					method: "POST",
					body: JSON.stringify({
						reason: rejectDialog.reason.trim(),
					}),
				}
			);

			if (error) {
				throw new Error(error);
			}

			toast.success("Will rejected successfully");
			setRejectDialog({
				isOpen: false,
				willId: null,
				willOwnerName: null,
				reason: "",
			});
			fetchWillsUnderReview(); // Refresh the list
		} catch (error) {
			console.error("Error rejecting will:", error);
			toast.error("Failed to reject will");
		} finally {
			setIsProcessing(false);
		}
	};

	const openRejectDialog = (will: WillUnderReview) => {
		setRejectDialog({
			isOpen: true,
			willId: will.id,
			willOwnerName: `${will.owner.first_name} ${will.owner.last_name}`,
			reason: "",
		});
	};

	const closeRejectDialog = () => {
		setRejectDialog({
			isOpen: false,
			willId: null,
			willOwnerName: null,
			reason: "",
		});
	};

	// Filter and sort wills
	const filteredAndSortedWills = wills
		.filter((will) => {
			if (searchQuery) {
				const searchLower = searchQuery.toLowerCase();
				const ownerName =
					`${will.owner.first_name} ${will.owner.last_name}`.toLowerCase();
				const ownerEmail = will.user.email.toLowerCase();
				return (
					ownerName.includes(searchLower) || ownerEmail.includes(searchLower)
				);
			}
			return true;
		})
		.sort((a, b) => {
			// Sort by creation date, newest first
			return (
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
		});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-[2rem] font-semibold text-black">
						Wills Under Review
					</h1>
					<p className="text-muted-foreground">
						Review and manage wills that are pending approval
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by owner name or email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>
			</div>

			{/* Wills List */}
			{isLoading ? (
				<Card className="p-6 h-full rounded-lg bg-white shadow-sm">
					<div className="flex items-center justify-center py-8">
						<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
						<p className="text-muted-foreground ml-2">
							Loading wills under review...
						</p>
					</div>
				</Card>
			) : filteredAndSortedWills.length === 0 ? (
				<div className="text-center py-16 bg-gray-50 rounded-lg">
					<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
						<FileText className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{wills.length === 0 ? "No wills under review" : "No wills found"}
					</h3>
					<p className="text-gray-600">
						{wills.length === 0
							? "All wills have been processed"
							: "Try adjusting your search criteria"}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					<div className="text-sm text-muted-foreground">
						Showing {filteredAndSortedWills.length} of {wills.length} wills
						under review
					</div>
					<div className="grid gap-4">
						{filteredAndSortedWills.map((will) => (
							<Card
								key={will.id}
								className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
											<Clock className="w-6 h-6 text-blue-600" />
										</div>
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<h3 className="text-lg font-semibold text-black">
													Will for {will.owner.first_name}{" "}
													{will.owner.last_name}
												</h3>
												<Badge className="bg-blue-100 text-blue-700">
													Under Review
												</Badge>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
												<div className="flex items-center space-x-2">
													<User className="h-4 w-4" />
													<span>{will.user.email}</span>
												</div>
												<div className="flex items-center space-x-2">
													<Calendar className="h-4 w-4" />
													<span>Submitted: {formatDate(will.created_at)}</span>
												</div>
												<div className="flex items-center space-x-2">
													<Calendar className="h-4 w-4" />
													<span>Payment: {formatDate(will.payment_date)}</span>
												</div>
											</div>
											<div className="mt-2 text-sm text-muted-foreground">
												{will.owner.address}, {will.owner.city},{" "}
												{will.owner.state} {will.owner.post_code},{" "}
												{will.owner.country}
											</div>
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDownloadWill(will)}
											className="hover:bg-green-50 text-green-600"
										>
											<Download className="h-4 w-4 mr-2" />
											Download
										</Button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => openApproveDialog(will)}
													disabled={isProcessing}
													className="text-green-600 cursor-pointer"
												>
													<CheckCircle className="h-4 w-4 mr-2" />
													Approve Will
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => openRejectDialog(will)}
													disabled={isProcessing}
													className="text-red-600 cursor-pointer"
												>
													<XCircle className="h-4 w-4 mr-2" />
													Reject Will
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Reject Dialog */}
			<Dialog open={rejectDialog.isOpen} onOpenChange={closeRejectDialog}>
				<DialogContent
					onOpenAutoFocus={(e) => {
						// Prevent default focus behavior to avoid conflicts
						e.preventDefault();
					}}
					onCloseAutoFocus={(e) => {
						// Prevent default focus behavior to avoid conflicts
						e.preventDefault();
					}}
				>
					<DialogHeader>
						<DialogTitle>Reject Will</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting the will for{" "}
							<span className="font-medium">{rejectDialog.willOwnerName}</span>.
							This reason will be communicated to the user.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="rejection-reason">Reason for Rejection</Label>
							<Textarea
								id="rejection-reason"
								placeholder="Enter the reason for rejecting this will..."
								value={rejectDialog.reason}
								onChange={(e) =>
									setRejectDialog({ ...rejectDialog, reason: e.target.value })
								}
								rows={4}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={closeRejectDialog}>
							Cancel
						</Button>
						<Button
							onClick={handleRejectWill}
							disabled={!rejectDialog.reason.trim() || isProcessing}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							<XCircle className="h-4 w-4 mr-2" />
							{isProcessing ? "Rejecting..." : "Reject Will"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Approve Dialog */}
			<Dialog open={approveDialog.isOpen} onOpenChange={closeApproveDialog}>
				<DialogContent
					onOpenAutoFocus={(e) => {
						// Prevent default focus behavior to avoid conflicts
						e.preventDefault();
					}}
					onCloseAutoFocus={(e) => {
						// Prevent default focus behavior to avoid conflicts
						e.preventDefault();
					}}
				>
					<DialogHeader>
						<DialogTitle>Approve Will</DialogTitle>
						<DialogDescription>
							Are you sure you want to approve the will for{" "}
							<span className="font-medium">{approveDialog.willOwnerName}</span>
							? <br />
							This action will mark the will as completed and make it available
							for download by the user.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={closeApproveDialog}>
							Cancel
						</Button>
						<Button
							onClick={handleApproveWill}
							disabled={isProcessing}
							className="bg-green-600 hover:bg-green-700 text-white"
						>
							<CheckCircle className="h-4 w-4 mr-2" />
							{isProcessing ? "Approving..." : "Approve Will"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
