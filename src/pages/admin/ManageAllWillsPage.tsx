import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	Filter,
} from "lucide-react";
import { formatDate } from "@/utils/format";

interface Will {
	id: string;
	status: "in progress" | "draft" | "under-review" | "completed" | "rejected";
	created_at: string;
	updated_at: string;
	payment_status: "pending" | "succeeded" | "failed";
	payment_date?: string;
	owner: {
		id: string;
		first_name: string;
		last_name: string;
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

export default function ManageAllWillsPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [wills, setWills] = useState<Will[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	useEffect(() => {
		if (user?.role !== "admin") {
			navigate("/app/dashboard");
			return;
		}
		fetchAllWills();
	}, [user, navigate]);

	const fetchAllWills = async () => {
		try {
			setIsLoading(true);
			const { data, error } = await apiClient<Will[]>("/admin/wills");

			if (error) {
				throw new Error(error);
			}

			setWills(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching all wills:", error);
			toast.error("Failed to load wills");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownloadWill = async (will: Will) => {
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
						name: true,
						address: true,
						hasSpouse: true,
						hasChildren: true,
						guardians: true,
						pets: true,
						hasAssets: true,
						gifts: true,
						digitalAssets: true,
						residuary: true,
						executors: true,
						witnesses: true,
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

	const getStatusColor = (status: Will["status"]) => {
		switch (status) {
			case "draft":
				return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
			case "under-review":
				return "bg-blue-50 text-blue-700 ring-blue-600/20";
			case "completed":
				return "bg-green-50 text-green-700 ring-green-600/20";
			case "rejected":
				return "bg-red-50 text-red-700 ring-red-600/20";
			default:
				return "bg-gray-50 text-gray-700 ring-gray-600/20";
		}
	};

	const getStatusIcon = (status: Will["status"]) => {
		switch (status) {
			case "draft":
				return <FileText className="h-4 w-4" />;
			case "under-review":
				return <Clock className="h-4 w-4" />;
			case "completed":
				return <CheckCircle className="h-4 w-4" />;
			case "rejected":
				return <XCircle className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	// Filter and sort wills
	const filteredAndSortedWills = wills
		.filter((will) => {
			// Status filter
			if (statusFilter !== "all" && will.status !== statusFilter) {
				return false;
			}

			// Search filter
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
					<h1 className="text-[2rem] font-semibold text-black">All Wills</h1>
					<p className="text-muted-foreground">
						Manage and view all wills in the system
					</p>
				</div>
			</div>

			{/* Search and Filters */}
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
				<div className="flex gap-2">
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[140px]">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent className="bg-white">
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="under-review">Under Review</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Wills List */}
			{isLoading ? (
				<Card className="p-6 h-full rounded-lg bg-white shadow-sm">
					<div className="flex items-center justify-center py-8">
						<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
						<p className="text-muted-foreground ml-2">Loading wills...</p>
					</div>
				</Card>
			) : filteredAndSortedWills.length === 0 ? (
				<div className="text-center py-16 bg-gray-50 rounded-lg">
					<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
						<FileText className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{wills.length === 0
							? "No wills found"
							: "No wills match your criteria"}
					</h3>
					<p className="text-gray-600">
						{wills.length === 0
							? "No wills have been created yet"
							: "Try adjusting your search or filter criteria"}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					<div className="text-sm text-muted-foreground">
						Showing {filteredAndSortedWills.length} of {wills.length} wills
					</div>
					<div className="grid gap-4">
						{filteredAndSortedWills.map((will) => (
							<Card
								key={will.id}
								className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
											{getStatusIcon(will.status)}
										</div>
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<h3 className="text-lg font-semibold text-black">
													Will for {will.owner.first_name}{" "}
													{will.owner.last_name}
												</h3>
												<Badge className={getStatusColor(will.status)}>
													{will.status
														.replace("-", " ")
														.replace(/\b\w/g, (l) => l.toUpperCase())}
												</Badge>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
												<div className="flex items-center space-x-2">
													<User className="h-4 w-4" />
													<span>{will.user.email}</span>
												</div>
												<div className="flex items-center space-x-2">
													<Calendar className="h-4 w-4" />
													<span>Created: {formatDate(will.created_at)}</span>
												</div>
												<div className="flex items-center space-x-2">
													<Calendar className="h-4 w-4" />
													<span>
														Payment:{" "}
														{will.payment_date
															? formatDate(will.payment_date)
															: "Pending"}
													</span>
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
										{will.status !== "in progress" && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDownloadWill(will)}
												className="hover:bg-green-50 text-green-600"
											>
												<Download className="h-4 w-4 mr-2" />
												Download
											</Button>
										)}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => navigate(`/admin/wills/${will.id}`)}
													className="cursor-pointer"
												>
													<FileText className="h-4 w-4 mr-2" />
													View Details
												</DropdownMenuItem>
												{will.status === "under-review" && (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() =>
																navigate(`/admin/wills/${will.id}/approve`)
															}
															className="text-green-600 cursor-pointer"
														>
															<CheckCircle className="h-4 w-4 mr-2" />
															Approve Will
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																navigate(`/admin/wills/${will.id}/reject`)
															}
															className="text-red-600 cursor-pointer"
														>
															<XCircle className="h-4 w-4 mr-2" />
															Reject Will
														</DropdownMenuItem>
													</>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
