import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { API_CONFIG, getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import {
	Search,
	ChevronUp,
	ChevronDown,
	FileText,
	MoreVertical,
	Eye,
	Pencil,
	Trash2,
} from "lucide-react";
import { formatDate } from "@/utils/format";

interface Document {
	id: string;
	title: string;
	status: "draft" | "published" | "archived";
	type: "will" | "power_of_attorney" | "letter_of_wishes";
	created_at: string;
	updated_at: string;
	created_by: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
	};
}

type DocumentTypeFilter =
	| "all"
	| "will"
	| "power_of_attorney"
	| "letter_of_wishes";
type DocumentStatusFilter = "all" | "draft" | "published" | "archived";

export default function ManageDocumentsPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [documents, setDocuments] = useState<Document[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [documentTypeFilter, setDocumentTypeFilter] =
		useState<DocumentTypeFilter>("all");
	const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("all");
	const [sortField, setSortField] = useState<keyof Document>("created_at");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	useEffect(() => {
		if (user?.role !== "admin") {
			navigate("/app/dashboard");
			return;
		}
		fetchDocuments();
	}, [user, navigate]);

	const fetchDocuments = async () => {
		try {
			const response = await fetch(
				getApiUrl(API_CONFIG.endpoints.admin.documents),
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to fetch documents");
			}

			const data = await response.json();
			setDocuments(data);
		} catch (error) {
			console.error("Error fetching documents:", error);
			toast.error("Failed to load documents");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSort = (field: keyof Document) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleDeleteDocument = async (documentId: string) => {
		if (!confirm("Are you sure you want to delete this document?")) return;

		try {
			const response = await fetch(
				`${getApiUrl(API_CONFIG.endpoints.admin.documents)}/${documentId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);

			if (!response.ok) throw new Error("Failed to delete document");

			toast.success("Document deleted successfully");
			fetchDocuments(); // Refresh the list
		} catch (error) {
			console.error("Error deleting document:", error);
			toast.error("Failed to delete document");
		}
	};

	const filteredDocuments = documents
		.filter((doc) => {
			const matchesSearch =
				doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				doc.created_by.email
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				`${doc.created_by.first_name} ${doc.created_by.last_name}`
					.toLowerCase()
					.includes(searchQuery.toLowerCase());

			const matchesType =
				documentTypeFilter === "all" || doc.type === documentTypeFilter;
			const matchesStatus =
				statusFilter === "all" || doc.status === statusFilter;

			return matchesSearch && matchesType && matchesStatus;
		})
		.sort((a, b) => {
			const aValue = a[sortField];
			const bValue = b[sortField];

			if (typeof aValue === "string" && typeof bValue === "string") {
				return sortDirection === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}

			if (aValue instanceof Date && bValue instanceof Date) {
				return sortDirection === "asc"
					? aValue.getTime() - bValue.getTime()
					: bValue.getTime() - aValue.getTime();
			}

			return 0;
		});

	const getStatusColor = (status: Document["status"]) => {
		switch (status) {
			case "published":
				return "bg-[#E5FC99] text-[#3F7F03]";
			case "draft":
				return "bg-[#FFF4CC] text-[#B95000]";
			case "archived":
				return "bg-[#FFCACA] text-[#FF0000]";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="text-left">
					<div className="flex items-center gap-2">
						<h2 className="text-3xl font-medium tracking-tight">Documents</h2>
						<span className="text-[0.875rem] text-[#909090]">
							{filteredDocuments.length}
						</span>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center gap-4 mb-12">
					<div className="relative flex-1">
						<div className="flex-1 max-w-2xl">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#929292]" />
								<Input
									type="search"
									placeholder="Search documents..."
									className="pl-9 bg-[#F3F3F3] border-none focus-visible:ring-0 h-10"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between gap-3">
					<div className="flex gap-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="rounded-[12px] border-dashed border-[#909090] hover:bg-muted/50 text-[#545454]"
								>
									<img
										src="/svgs/sort.svg"
										alt="Sort"
										className="h-4 w-4 mr-2"
									/>
									Document Type:{" "}
									{documentTypeFilter === "all"
										? "All"
										: documentTypeFilter
												.split("_")
												.map(
													(word) => word.charAt(0).toUpperCase() + word.slice(1)
												)
												.join(" ")}
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="bg-white">
								<DropdownMenuItem onClick={() => setDocumentTypeFilter("all")}>
									All
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setDocumentTypeFilter("will")}>
									Will
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setDocumentTypeFilter("power_of_attorney")}
								>
									Power of Attorney
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setDocumentTypeFilter("letter_of_wishes")}
								>
									Letter of Wishes
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="rounded-[12px] border-dashed border-[#909090] hover:bg-muted/50 text-[#545454]"
								>
									<img
										src="/svgs/sort.svg"
										alt="Sort"
										className="h-4 w-4 mr-2"
									/>
									Status:{" "}
									{statusFilter === "all"
										? "All"
										: statusFilter.charAt(0).toUpperCase() +
										  statusFilter.slice(1)}
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="bg-white">
								<DropdownMenuItem onClick={() => setStatusFilter("all")}>
									All
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setStatusFilter("draft")}>
									Draft
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setStatusFilter("published")}>
									Published
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setStatusFilter("archived")}>
									Archived
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<div className="border rounded-lg overflow-hidden mt-6">
				<div className="overflow-x-auto">
					<table className="w-full caption-bottom text-sm">
						<thead className="border-b bg-[#FAFAFA] border-[#E9EAEB] text-[#535862] font-['Inter']">
							<tr>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("title")}
								>
									<div className="flex items-center gap-2">
										Title
										{sortField === "title" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("type")}
								>
									<div className="flex items-center gap-2">
										Document Type
										{sortField === "type" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("status")}
								>
									<div className="flex items-center gap-2">
										Status
										{sortField === "status" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("created_at")}
								>
									<div className="flex items-center gap-2">
										Created
										{sortField === "created_at" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th
									className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("updated_at")}
								>
									<div className="flex items-center gap-2">
										Last Updated
										{sortField === "updated_at" ? (
											sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)
										) : (
											<ChevronDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								</th>
								<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td
										colSpan={6}
										className="text-center p-6 border-b border-[#DADADA]"
									>
										Loading documents...
									</td>
								</tr>
							) : filteredDocuments.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										className="text-center p-6 border-b border-[#DADADA]"
									>
										No documents found matching your search
									</td>
								</tr>
							) : (
								filteredDocuments.map((doc) => (
									<tr
										key={doc.id}
										className="border-b border-[#DADADA] hover:bg-muted/50 transition-colors"
									>
										<td className="p-4 text-left text-[#181D27] font-medium font-['Inter']">
											<div className="flex items-center gap-2">
												<FileText className="h-4 w-4 text-muted-foreground" />
												{doc.title}
											</div>
										</td>
										<td className="p-4 text-left text-[#545454] font-['DMSans']">
											{doc.type
												.split("_")
												.map(
													(word) => word.charAt(0).toUpperCase() + word.slice(1)
												)
												.join(" ")}
										</td>
										<td className="p-4 text-left">
											<span
												className={`inline-flex items-center px-2 py-[2px] rounded-[4px] text-[11px] font-medium ${getStatusColor(
													doc.status
												)}`}
											>
												<span
													className={`mr-1 h-1 w-1 rounded-full ${
														doc.status === "published"
															? "bg-[#3F7F03]"
															: doc.status === "draft"
															? "bg-[#B95000]"
															: "bg-[#FF0000]"
													}`}
												/>
												{doc.status.charAt(0).toUpperCase() +
													doc.status.slice(1)}
											</span>
										</td>
										<td className="p-4 text-left text-[#545454]">
											{formatDate(doc.created_at)}
										</td>
										<td className="p-4 text-left text-[#545454]">
											{formatDate(doc.updated_at)}
										</td>
										<td className="p-4 text-left">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0 hover:bg-muted/50"
													>
														<MoreVertical className="h-4 w-4 text-[#545454]" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="bg-white">
													<DropdownMenuItem
														onClick={() =>
															navigate(`/admin/documents/${doc.id}`)
														}
														className="cursor-pointer"
													>
														<Eye className="mr-2 h-4 w-4" />
														View Document
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															navigate(`/admin/documents/${doc.id}/edit`)
														}
														className="cursor-pointer"
													>
														<Pencil className="mr-2 h-4 w-4" />
														Edit Document
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														onClick={() => handleDeleteDocument(doc.id)}
														className="cursor-pointer text-red-600 hover:text-red-700"
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete Document
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
