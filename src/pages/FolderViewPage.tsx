import { ArrowLeft, Upload, FileText, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Document {
	id: string;
	name: string;
	type: string;
	created_at: string;
}

interface Folder {
	id: string;
	name: string;
	icon: string;
	created_at: string;
	created_by: string;
	is_deletable: boolean;
}

export function FolderViewPage() {
	const { folderId } = useParams<{ folderId: string }>();
	const navigate = useNavigate();
	const [folder, setFolder] = useState<Folder | null>(null);
	const [documents, setDocuments] = useState<Document[]>([]);

	useEffect(() => {
		const fetchFolderAndDocuments = async () => {
			if (!folderId) return;

			try {
				// Fetch folder details
				const folderResponse = await apiClient<Folder>(`/folders/${folderId}`, {
					authenticated: true,
				});

				if (folderResponse.data) {
					setFolder(folderResponse.data);
				}

				// Fetch documents in the folder
				const documentsResponse = await apiClient<Document[]>(
					`/folders/${folderId}/documents`,
					{
						authenticated: true,
					}
				);

				if (documentsResponse.data) {
					setDocuments(documentsResponse.data);
				}
			} catch (error) {
				toast.error("Error loading folder");
				console.error("Error loading folder:", error);
			} finally {
				// Loading complete
			}
		};

		fetchFolderAndDocuments();
	}, [folderId]);

	const handleUploadFile = () => {
		toast.info("Upload functionality coming soon!");
		// TODO: Implement file upload
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (!folder) {
		return (
			<div>
				<div
					id="dashboard-header"
					className="flex flex-col items-start justify-between p-8 ps-14 bg-[#239485] -mx-4 sm:-mx-6 -mt-4 sm:-mt-6"
				>
					<div className="text-center py-12 w-full">
						<p className="text-white text-lg">Folder not found</p>
						<Button
							onClick={() => navigate("/vault")}
							className="mt-4 bg-white text-[#239485] hover:bg-white/90"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Vault
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div
				id="dashboard-header"
				className="flex flex-col items-start justify-between p-8 ps-14 bg-[#239485] -mx-4 sm:-mx-6 -mt-4 sm:-mt-6"
			>
				<img
					src="/svgs/dashboard_icons/LegacyPadlock.svg"
					alt="Vault"
					className="h-12 w-12 mb-4 brightness-0 invert"
				/>
				<h1 className="text-[2rem] font-semibold text-white">Legacy Vault</h1>
				<p className="text-white text-sm font-normal mt-2">
					Securely store and manage important documents
				</p>
			</div>

			{/* Folder Content */}
			<div className="mt-8 px-4 sm:px-0">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-3">
						<h2 className="text-xl font-semibold text-gray-900">
							{folder.name}
						</h2>
						<Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
							{documents.length}
						</Badge>
					</div>
					<Button
						onClick={handleUploadFile}
						className="flex items-center space-x-2 border border-[#DADADA] bg-white text-[#173C37] px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-semibold cursor-pointer text-sm"
					>
						<Upload className="mr-2 h-4 w-4" />
						Upload File
					</Button>
				</div>

				{/* Documents Table */}
				{documents.length === 0 ? (
					<div className="text-center py-12">
						<FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p className="text-gray-500 text-lg mb-2">No documents yet</p>
						<p className="text-gray-400 text-sm">
							Upload your first document to get started
						</p>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										className="px-6 py-3 text-left font-semibold tracking-wider"
										style={{ color: "#535862", fontSize: "0.75rem" }}
									>
										Name
									</th>
									<th
										className="px-6 py-3 text-left font-semibold tracking-wider"
										style={{ color: "#535862", fontSize: "0.75rem" }}
									>
										Type
									</th>
									<th
										className="px-6 py-3 text-left font-semibold tracking-wider"
										style={{ color: "#535862", fontSize: "0.75rem" }}
									>
										Uploaded on
									</th>
									<th className="px-6 py-3 text-left"></th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{documents.map((document, index) => (
									<tr
										key={document.id}
										className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
										style={{ height: "4.5rem" }}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className="font-medium"
												style={{
													fontSize: "0.875rem",
													color: "#181D27",
													fontWeight: "500",
												}}
											>
												{document.name}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{document.type}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{formatDate(document.created_at)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<button className="p-1 hover:bg-gray-100 rounded">
												<MoreVertical className="h-4 w-4 text-gray-400" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
