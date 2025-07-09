import { MoreVertical, Plus, Eye, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Folder {
	id: string;
	created_at: string;
	name: string;
	icon: string;
	created_by: string;
	is_deletable: boolean;
}

export function VaultPage() {
	const [selectedCard, setSelectedCard] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [folderName, setFolderName] = useState("");
	const [selectedIcon, setSelectedIcon] = useState("");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [folderToDelete, setFolderToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
	const [editFolderName, setEditFolderName] = useState("");
	const [editSelectedIcon, setEditSelectedIcon] = useState("");

	const availableIcons = [
		"fingerprint.svg",
		"diamond.svg",
		"history.svg",
		"health_and_safety.svg",
		"cottage.svg",
		"money_bag.svg",
		"savings.svg",
		"password.svg",
		"personal.svg",
	];

	// Fetch folders from API
	useEffect(() => {
		const fetchFolders = async () => {
			try {
				const response = await apiClient<Folder[]>("/folders", {
					authenticated: true,
				});

				if (response.data) {
					// Sort folders by created_at timestamp, newest first
					const sortedFolders = response.data.sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime()
					);
					setFolders(sortedFolders);
				} else {
					toast.error("Failed to fetch folders");
				}
			} catch (error) {
				toast.error("Error fetching folders");
				console.error("Error fetching folders:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchFolders();
	}, []);

	const handleCreateFolder = async () => {
		if (folderName.trim() && selectedIcon) {
			try {
				const response = await apiClient<Folder>("/folders", {
					method: "POST",
					authenticated: true,
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: folderName.trim(),
						icon: selectedIcon,
					}),
				});

				if (response.data) {
					// Add new folder and sort by created_at timestamp, newest first
					const updatedFolders = [...folders, response.data].sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime()
					);
					setFolders(updatedFolders);
					toast.success(`Folder "${folderName}" created successfully!`);

					// Reset form

					setSelectedIcon("");
					setIsModalOpen(false);
				} else {
					toast.error("Failed to create folder");
				}
			} catch (error) {
				toast.error("Error creating folder");
				console.error("Error creating folder:", error);
			}
		}
	};

	const handleDeleteFolder = (folderId: string, folderName: string) => {
		setFolderToDelete({ id: folderId, name: folderName });
		setIsDeleteDialogOpen(true);
	};

	const confirmDeleteFolder = async () => {
		if (folderToDelete) {
			try {
				const response = await apiClient(`/folders/${folderToDelete.id}`, {
					method: "DELETE",
					authenticated: true,
				});

				if (response.status === 200) {
					setFolders(
						folders.filter((folder) => folder.id !== folderToDelete.id)
					);
					toast.success(
						`Folder "${folderToDelete.name}" deleted successfully!`
					);
					setIsDeleteDialogOpen(false);
					setFolderToDelete(null);
				} else {
					toast.error("Failed to delete folder");
				}
			} catch (error) {
				toast.error("Error deleting folder");
				console.error("Error deleting folder:", error);
			}
		}
	};

	const handleViewFolder = (folderName: string) => {
		toast.info(`Opening folder: ${folderName}`);
		// Add logic to navigate to folder view
	};

	const handleEditFolder = (folder: Folder) => {
		setFolderToEdit(folder);
		setEditFolderName(folder.name);
		setEditSelectedIcon(folder.icon);
		setIsEditDialogOpen(true);
	};

	const handleUpdateFolder = async () => {
		if (folderToEdit && editFolderName.trim() && editSelectedIcon) {
			try {
				const response = await apiClient<Folder>(
					`/folders/${folderToEdit.id}`,
					{
						method: "PATCH",
						authenticated: true,
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							name: editFolderName.trim(),
							icon: editSelectedIcon,
						}),
					}
				);

				if (response.data) {
					// Update the folder in the list and re-sort
					const updatedFolders = folders
						.map((folder) =>
							folder.id === folderToEdit.id ? response.data! : folder
						)
						.sort(
							(a, b) =>
								new Date(b.created_at).getTime() -
								new Date(a.created_at).getTime()
						);
					setFolders(updatedFolders);
					toast.success(`Folder "${editFolderName}" updated successfully!`);

					// Reset form
					setEditFolderName("");
					setEditSelectedIcon("");
					setFolderToEdit(null);
					setIsEditDialogOpen(false);
				} else {
					toast.error("Failed to update folder");
				}
			} catch (error) {
				toast.error("Error updating folder");
				console.error("Error updating folder:", error);
			}
		}
	};

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

			{/* Folders Section */}
			<div className="mt-8 px-4 sm:px-0">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-3">
						<h2 className="text-xl font-semibold text-gray-900">Folders</h2>
						<span className="bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
							{folders.length}
						</span>
					</div>
					<button
						onClick={() => setIsModalOpen(true)}
						className="flex items-center space-x-2 border border-[#DADADA] bg-white text-[#173C37] px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-semibold cursor-pointer"
					>
						<Plus className="h-4 w-4" />
						<span className="text-sm font-medium">Create a Folder</span>
					</button>
				</div>
				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#239485]"></div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{folders.map((folder) => {
							const isSelected = selectedCard === folder.id;
							return (
								<div
									key={folder.id}
									className="py-8 px-4 cursor-pointer transition-all duration-200 border-2 border-transparent hover:border-[#239485]"
									style={{
										borderRadius: "0.75rem",
										background: isSelected ? "#239485" : "#FFF",
										boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.10)",
									}}
									onClick={() => setSelectedCard(isSelected ? null : folder.id)}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4">
											<div className="flex-shrink-0">
												<img
													src={`/svgs/vault/${folder.icon}`}
													alt={folder.name}
													className={isSelected ? "brightness-0 invert" : ""}
													style={{
														height: "2rem",
														width: "2rem",
														filter: isSelected
															? undefined
															: "brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.5)",
													}}
												/>
											</div>
											<div>
												<h3
													className={`font-normal pt-[0.25rem] ${
														isSelected ? "text-white" : "text-[#173C37]"
													}`}
													style={{ fontSize: "0.875rem" }}
												>
													{folder.name}
												</h3>
											</div>
										</div>
										<DropdownMenu modal={false}>
											<DropdownMenuTrigger asChild>
												<button
													className={`flex-shrink-0 p-2 rounded-full transition-colors ${
														isSelected
															? "hover:bg-white/20"
															: "hover:bg-gray-100"
													}`}
													onClick={(e) => e.stopPropagation()}
												>
													<MoreVertical
														className={`h-5 w-5 cursor-pointer ${
															isSelected ? "text-white" : "text-gray-600"
														}`}
													/>
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												className="bg-white"
												align="end"
												onCloseAutoFocus={(e) => e.preventDefault()}
											>
												<DropdownMenuItem
													className="cursor-pointer"
													onClick={(e) => {
														e.stopPropagation();
														handleViewFolder(folder.name);
													}}
												>
													<Eye className="mr-2 h-4 w-4" />
													View Folder
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														folder.is_deletable && handleEditFolder(folder);
													}}
													className={`${
														folder.is_deletable
															? "cursor-pointer"
															: "text-gray-700 cursor-not-allowed opacity-50"
													}`}
													disabled={!folder.is_deletable}
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit Folder
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														folder.is_deletable &&
															handleDeleteFolder(folder.id, folder.name);
													}}
													className={`${
														folder.is_deletable
															? "text-red-600 hover:!text-red-600 cursor-pointer"
															: "text-red-600 cursor-not-allowed opacity-50"
													}`}
													disabled={!folder.is_deletable}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete Folder
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Create Folder Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create a New Folder</DialogTitle>
						<DialogDescription>
							Choose a name and icon for your new folder to organize your
							documents.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="folder-name">Name</Label>
							<Input
								id="folder-name"
								value={folderName}
								onChange={(e) => setFolderName(e.target.value)}
								placeholder="Enter folder name"
							/>
						</div>
						<div className="space-y-2">
							<Label>Icon *</Label>
							<div className="grid grid-cols-5 gap-2">
								{availableIcons.map((iconFilename, index) => (
									<button
										key={index}
										type="button"
										onClick={() => setSelectedIcon(iconFilename)}
										className={`p-2 rounded-lg border-2 transition-colors flex items-center justify-center cursor-pointer ${
											selectedIcon === iconFilename
												? "border-[#239485] bg-[#239485]/10"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<img
											src={`/svgs/vault/${iconFilename}`}
											alt={`Icon ${index + 1}`}
											className="w-6 h-6"
											style={{
												filter:
													selectedIcon === iconFilename
														? "brightness(0) saturate(100%) invert(33%) sepia(71%) saturate(1210%) hue-rotate(146deg) brightness(93%) contrast(89%)"
														: "brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.5)",
											}}
										/>
									</button>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleCreateFolder}
							disabled={!folderName.trim() || !selectedIcon}
							className="bg-[#239485] hover:bg-[#239485]/90 text-white cursor-pointer"
						>
							<Plus className="mr-2 h-4 w-4" />
							Create Folder
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Folder Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Folder</DialogTitle>
						<DialogDescription>
							Update the name and icon for your folder.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="edit-folder-name">Name</Label>
							<Input
								id="edit-folder-name"
								value={editFolderName}
								onChange={(e) => setEditFolderName(e.target.value)}
								placeholder="Enter folder name"
							/>
						</div>
						<div className="space-y-2">
							<Label>Icon *</Label>
							<div className="grid grid-cols-5 gap-2">
								{availableIcons.map((iconFilename, index) => (
									<button
										key={index}
										type="button"
										onClick={() => setEditSelectedIcon(iconFilename)}
										className={`p-2 rounded-lg border-2 transition-colors flex items-center justify-center cursor-pointer ${
											editSelectedIcon === iconFilename
												? "border-[#239485] bg-[#239485]/10"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<img
											src={`/svgs/vault/${iconFilename}`}
											alt={`Icon ${index + 1}`}
											className="w-6 h-6"
											style={{
												filter:
													editSelectedIcon === iconFilename
														? "brightness(0) saturate(100%) invert(33%) sepia(71%) saturate(1210%) hue-rotate(146deg) brightness(93%) contrast(89%)"
														: "brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.5)",
											}}
										/>
									</button>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsEditDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleUpdateFolder}
							disabled={!editFolderName.trim() || !editSelectedIcon}
							className="bg-[#239485] hover:bg-[#239485]/90 text-white cursor-pointer"
						>
							<Edit className="mr-2 h-4 w-4" />
							Update Folder
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete Folder</DialogTitle>
						<DialogDescription>
							This action will permanently remove the folder and cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-600">
							Are you sure you want to delete "{folderToDelete?.name}"?
						</p>
						<p className="text-sm font-medium text-gray-600 mt-1">
							This action cannot be undone.
						</p>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={confirmDeleteFolder}
							className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
