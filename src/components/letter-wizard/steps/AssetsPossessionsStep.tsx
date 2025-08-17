import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import {
	LetterOfWishesService,
	PersonalPossession,
} from "@/services/letterOfWishesService";
import { toast } from "sonner";

export default function AssetsPossessionsStep() {
	const { letterData, setLetterData } = useLetterOfWishes();

	// Digital Assets states
	const [digitalAssets, setDigitalAssets] = useState(
		letterData?.digitalAssetsPreferences?.digitalAssets || []
	);
	const [isDigitalAssetsModalOpen, setIsDigitalAssetsModalOpen] =
		useState(false);
	const [isEditingDigitalAsset, setIsEditingDigitalAsset] = useState(false);
	const [editingAssetIndex, setEditingAssetIndex] = useState<number | null>(
		null
	);

	// Personal Possessions states
	const [personalPossessions, setPersonalPossessions] = useState<
		PersonalPossession[]
	>([]);
	const [isPersonalPossessionsModalOpen, setIsPersonalPossessionsModalOpen] =
		useState(false);
	const [isEditingPersonalPossession, setIsEditingPersonalPossession] =
		useState(false);
	const [editingPossessionIndex, setEditingPossessionIndex] = useState<
		number | null
	>(null);
	const [isLoadingPossessions, setIsLoadingPossessions] = useState(false);

	// Delete confirmation states
	const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
		useState(false);
	const [possessionToDelete, setPossessionToDelete] =
		useState<PersonalPossession | null>(null);

	// Digital asset delete confirmation states
	const [
		isDigitalAssetDeleteConfirmationOpen,
		setIsDigitalAssetDeleteConfirmationOpen,
	] = useState(false);
	const [digitalAssetToDelete, setDigitalAssetToDelete] = useState<{
		index: number;
		asset: {
			platform: string;
			usernameOrEmail: string;
			action: "delete" | "memorialize" | "transfer" | "archive";
			beneficiaryName?: string;
			notes?: string;
		};
	} | null>(null);

	// Temporary state for form inputs for adding new digital asset
	const [newDigitalAssetPlatform, setNewDigitalAssetPlatform] = useState("");
	const [newDigitalAssetUsernameOrEmail, setNewDigitalAssetUsernameOrEmail] =
		useState("");
	const [newDigitalAssetAction, setNewDigitalAssetAction] = useState<
		"delete" | "memorialize" | "transfer" | "archive"
	>("delete");
	const [newDigitalAssetBeneficiaryName, setNewDigitalAssetBeneficiaryName] =
		useState("");
	const [newDigitalAssetNotes, setNewDigitalAssetNotes] = useState("");

	// Temporary state for form inputs for adding new personal possession
	const [newPossessionItem, setNewPossessionItem] = useState("");
	const [newPossessionRecipient, setNewPossessionRecipient] = useState("");
	const [newPossessionReason, setNewPossessionReason] = useState("");

	const addDigitalAsset = () => {
		if (
			newDigitalAssetPlatform.trim() &&
			newDigitalAssetUsernameOrEmail.trim()
		) {
			const newDigitalAsset = {
				platform: newDigitalAssetPlatform.trim(),
				usernameOrEmail: newDigitalAssetUsernameOrEmail.trim(),
				action: newDigitalAssetAction,
				beneficiaryName: newDigitalAssetBeneficiaryName.trim() || undefined,
				notes: newDigitalAssetNotes.trim(),
			};

			let updatedDigitalAssets;
			if (isEditingDigitalAsset && editingAssetIndex !== null) {
				// Update existing asset
				updatedDigitalAssets = [...digitalAssets];
				updatedDigitalAssets[editingAssetIndex] = newDigitalAsset;
			} else {
				// Add new asset
				updatedDigitalAssets = [...digitalAssets, newDigitalAsset];
			}

			setDigitalAssets(updatedDigitalAssets);

			// Update letter data in context
			if (setLetterData && letterData) {
				setLetterData({
					...letterData,
					digitalAssetsPreferences: {
						...letterData.digitalAssetsPreferences,
						digitalAssets: updatedDigitalAssets,
					},
				});
			}

			// Reset form and editing state
			setNewDigitalAssetPlatform("");
			setNewDigitalAssetUsernameOrEmail("");
			setNewDigitalAssetAction("delete");
			setNewDigitalAssetBeneficiaryName("");
			setNewDigitalAssetNotes("");
			setIsEditingDigitalAsset(false);
			setEditingAssetIndex(null);
			setIsDigitalAssetsModalOpen(false); // Close modal after adding/editing
		}
	};

	const removeDigitalAsset = (index: number) => {
		const asset = digitalAssets[index];

		// Show confirmation dialog
		setDigitalAssetToDelete({ index, asset });
		setIsDigitalAssetDeleteConfirmationOpen(true);
	};

	const confirmDeleteDigitalAsset = () => {
		if (!digitalAssetToDelete) return;

		const { index } = digitalAssetToDelete;
		const updatedDigitalAssets = digitalAssets.filter((_, i) => i !== index);
		setDigitalAssets(updatedDigitalAssets);

		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				digitalAssetsPreferences: {
					...letterData.digitalAssetsPreferences,
					digitalAssets: updatedDigitalAssets,
				},
			});
		}

		// Close confirmation dialog and reset state
		setIsDigitalAssetDeleteConfirmationOpen(false);
		setDigitalAssetToDelete(null);
	};

	const addPersonalPossession = async () => {
		if (
			newPossessionItem.trim() &&
			newPossessionRecipient.trim() &&
			letterData?.id
		) {
			try {
				let updatedPossessions;
				if (isEditingPersonalPossession && editingPossessionIndex !== null) {
					// Update existing possession via API
					const existingPossession =
						personalPossessions[editingPossessionIndex];
					const updateData = {
						beneficiary: newPossessionRecipient.trim(),
						reason: newPossessionReason.trim() || null,
						item: newPossessionItem.trim(),
					};

					const updatedPossession =
						await LetterOfWishesService.updatePersonalPossession(
							existingPossession.id,
							updateData
						);

					// Update local state with the response from API
					updatedPossessions = [...personalPossessions];
					updatedPossessions[editingPossessionIndex] = updatedPossession;
					toast.success("Personal possession updated successfully");
				} else {
					// Create new possession via API
					const possessionData = {
						low_id: letterData.id,
						beneficiary: newPossessionRecipient.trim(),
						reason: newPossessionReason.trim() || null,
						item: newPossessionItem.trim(),
					};

					const newPossession =
						await LetterOfWishesService.createPersonalPossession(
							possessionData
						);
					updatedPossessions = [...personalPossessions, newPossession];
					toast.success("Personal possession added successfully");
				}

				// Update local state
				setPersonalPossessions(updatedPossessions);

				// Update letter data in context with the new structure
				if (setLetterData && letterData) {
					setLetterData({
						...letterData,
						personalPossessions: updatedPossessions.map((possession) => ({
							item: possession.item,
							recipient: possession.beneficiary,
							reason: possession.reason || undefined,
						})),
					});
				}

				// Reset form and editing state
				setNewPossessionItem("");
				setNewPossessionRecipient("");
				setNewPossessionReason("");
				setIsEditingPersonalPossession(false);
				setEditingPossessionIndex(null);
				setIsPersonalPossessionsModalOpen(false);
			} catch (error) {
				console.error("Error adding/updating personal possession:", error);
				toast.error("Failed to save personal possession");
			}
		}
	};

	const removePersonalPossession = async (index: number) => {
		const possession = personalPossessions[index];

		// Show confirmation dialog
		setPossessionToDelete(possession);
		setIsDeleteConfirmationOpen(true);
	};

	const confirmDelete = async () => {
		if (!possessionToDelete) return;

		try {
			// Delete via API
			await LetterOfWishesService.deletePersonalPossession(
				possessionToDelete.id
			);

			// Update local state
			const updatedPossessions = personalPossessions.filter(
				(possession) => possession.id !== possessionToDelete.id
			);
			setPersonalPossessions(updatedPossessions);

			// Update letter data in context with the new structure
			if (setLetterData && letterData) {
				setLetterData({
					...letterData,
					personalPossessions: updatedPossessions.map((possession) => ({
						item: possession.item,
						recipient: possession.beneficiary,
						reason: possession.reason || undefined,
					})),
				});
			}

			toast.success("Personal possession deleted successfully");
		} catch (error) {
			console.error("Error deleting personal possession:", error);
			toast.error("Failed to delete personal possession");
		} finally {
			// Close confirmation dialog and reset state
			setIsDeleteConfirmationOpen(false);
			setPossessionToDelete(null);
		}
	};

	useEffect(() => {
		const loadPersonalPossessions = async () => {
			if (!letterData?.id) {
				console.log(
					"No Letter of Wishes ID available, skipping personal possessions load"
				);
				return;
			}

			setIsLoadingPossessions(true);
			try {
				const response = await LetterOfWishesService.getPersonalPossessions(
					letterData.id
				);
				setPersonalPossessions(response);
			} catch (error) {
				toast.error("Failed to load personal possessions.");
				console.error(error);
			} finally {
				setIsLoadingPossessions(false);
			}
		};

		loadPersonalPossessions();
	}, [letterData?.id]);

	return (
		<div className="space-y-6 w-full max-w-4xl">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Assets & Possessions
			</div>
			<div className="text-muted-foreground">
				Manage your personal possessions and digital assets.
			</div>

			{/* Personal Possessions Section */}
			<div className="space-y-6">
				<div>
					<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
						Distribution of Personal Possessions
					</h6>
					<p className="text-black">
						Specify how you would like your personal possessions to be
						distributed among your loved ones.
					</p>
				</div>

				{/* Personal Possessions List */}
				{isLoadingPossessions ? (
					<div className="text-center py-8">
						<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2"></div>
						<p className="text-muted-foreground">
							Loading personal possessions...
						</p>
					</div>
				) : personalPossessions.length > 0 ? (
					<div className="space-y-3">
						{personalPossessions.map((possession, index) => (
							<div
								key={possession.id}
								className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem] relative"
							>
								<div className="flex-1">
									<div className="font-medium text-[0.875rem]">
										{possession.item}
									</div>
									<div className="text-sm text-gray-600">
										To: {possession.beneficiary}
									</div>
									{possession.reason && (
										<div className="text-sm text-gray-600">
											Reason: {possession.reason}
										</div>
									)}
								</div>
								<div className="flex gap-2 ml-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											// Set the form values for editing
											setNewPossessionItem(possession.item);
											setNewPossessionRecipient(possession.beneficiary);
											setNewPossessionReason(possession.reason || "");
											// Set editing state
											setIsEditingPersonalPossession(true);
											setEditingPossessionIndex(index);
											setIsPersonalPossessionsModalOpen(true);
										}}
										className="absolute top-4 right-22 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
									>
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => removePersonalPossession(index)}
										className="absolute top-4 right-4 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
									>
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				) : null}

				{/* Add Personal Possession Button - Always Visible */}
				<Button
					onClick={() => {
						// Reset form when adding new possession
						setNewPossessionItem("");
						setNewPossessionRecipient("");
						setNewPossessionReason("");
						setIsEditingPersonalPossession(false);
						setEditingPossessionIndex(null);
						setIsPersonalPossessionsModalOpen(true);
					}}
					variant="outline"
					className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
				>
					<Plus className="mr-2 h-5 w-5" />
					Add Personal Possession
				</Button>
			</div>

			{/* Digital Assets Section */}
			<div className="space-y-6">
				<div>
					<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
						Digital Assets
					</h6>
					<p className="text-black">
						Specify your preferences for managing and accessing your digital
						assets after your death.
					</p>
				</div>

				{/* Digital Assets List */}
				{digitalAssets.length > 0 && (
					<div className="space-y-3">
						{digitalAssets.map((asset, index) => (
							<div
								key={index}
								className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem] relative"
							>
								<div className="flex-1">
									<div className="font-medium text-[0.875rem]">
										{asset.platform} - {asset.usernameOrEmail}
									</div>
									<div className="text-sm text-gray-600">
										Action: {asset.action}
										{asset.beneficiaryName && ` → ${asset.beneficiaryName}`}
									</div>
									{asset.notes && (
										<div className="text-sm text-gray-600">
											Access and Instructions: {asset.notes}
										</div>
									)}
								</div>
								<div className="flex gap-2 ml-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											// Set the form values for editing
											setNewDigitalAssetPlatform(asset.platform);
											setNewDigitalAssetUsernameOrEmail(asset.usernameOrEmail);
											setNewDigitalAssetAction(asset.action);
											setNewDigitalAssetBeneficiaryName(
												asset.beneficiaryName || ""
											);
											setNewDigitalAssetNotes(asset.notes || "");
											// Set editing state
											setIsEditingDigitalAsset(true);
											setEditingAssetIndex(index);
											setIsDigitalAssetsModalOpen(true);
										}}
										className="absolute top-4 right-22 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
									>
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => removeDigitalAsset(index)}
										className="absolute top-4 right-4 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
									>
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Add Digital Asset Button - Always Visible */}
				<Button
					onClick={() => {
						// Reset form when adding new asset
						setNewDigitalAssetPlatform("");
						setNewDigitalAssetUsernameOrEmail("");
						setNewDigitalAssetAction("delete");
						setNewDigitalAssetBeneficiaryName("");
						setNewDigitalAssetNotes("");
						setIsEditingDigitalAsset(false); // Ensure editing state is false
						setEditingAssetIndex(null); // Ensure editing index is null
						setIsDigitalAssetsModalOpen(true);
					}}
					variant="outline"
					className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
				>
					<Plus className="mr-2 h-5 w-5" />
					Add Digital Asset
				</Button>
			</div>

			{/* Personal Possessions Modal */}
			<Dialog
				open={isPersonalPossessionsModalOpen}
				onOpenChange={(open) => {
					setIsPersonalPossessionsModalOpen(open);
					if (!open) {
						// Reset form and editing state when modal is closed
						setNewPossessionItem("");
						setNewPossessionRecipient("");
						setNewPossessionReason("");
						setIsEditingPersonalPossession(false);
						setEditingPossessionIndex(null);
					}
				}}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditingPersonalPossession
								? "Edit Personal Possession"
								: "Add Personal Possession"}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6 pb-4">
						{/* Personal Possession Details */}
						<div className="space-y-2">
							<Label htmlFor="modal-possessionItem">Item</Label>
							<Input
								id="modal-possessionItem"
								placeholder="e.g., Laptop, Jewelry, Furniture, etc."
								value={newPossessionItem}
								onChange={(e) => setNewPossessionItem(e.target.value)}
								className="w-full"
							/>
							<Label htmlFor="modal-possessionRecipient">Recipient</Label>
							<Input
								id="modal-possessionRecipient"
								placeholder="e.g., John Doe, Jane Smith, etc."
								value={newPossessionRecipient}
								onChange={(e) => setNewPossessionRecipient(e.target.value)}
								className="w-full"
							/>
							<Label htmlFor="modal-possessionReason">Reason (Optional)</Label>
							<Textarea
								id="modal-possessionReason"
								placeholder="e.g., For John's education, as a keepsake for Jane, etc."
								value={newPossessionReason}
								onChange={(e) => setNewPossessionReason(e.target.value)}
								className="w-full min-h-[80px]"
							/>
							<Button
								onClick={() => {
									addPersonalPossession();
									setIsPersonalPossessionsModalOpen(false);
								}}
								disabled={
									!newPossessionItem.trim() || !newPossessionRecipient.trim()
								}
								className="w-full text-white"
							>
								{isEditingPersonalPossession
									? "Save Changes"
									: "Add Personal Possession"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Digital Assets Modal */}
			<Dialog
				open={isDigitalAssetsModalOpen}
				onOpenChange={(open) => {
					setIsDigitalAssetsModalOpen(open);
					if (!open) {
						// Reset form and editing state when modal is closed
						setNewDigitalAssetPlatform("");
						setNewDigitalAssetUsernameOrEmail("");
						setNewDigitalAssetAction("delete");
						setNewDigitalAssetBeneficiaryName("");
						setNewDigitalAssetNotes("");
						setIsEditingDigitalAsset(false);
						setEditingAssetIndex(null);
					}
				}}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditingDigitalAsset
								? "Edit Digital Asset"
								: "Add Digital Asset"}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6 pb-4">
						{/* Social Media Accounts */}
						<div className="space-y-2">
							{/* Add New Digital Asset */}
							<div className="space-y-2 border-t pt-4">
								<Label htmlFor="modal-digitalAssetPlatform">
									Platform Name
								</Label>
								<Input
									id="modal-digitalAssetPlatform"
									placeholder="e.g., Facebook, Twitter, Instagram, Gmail, etc."
									value={newDigitalAssetPlatform}
									onChange={(e) => setNewDigitalAssetPlatform(e.target.value)}
									className="w-full"
								/>
								<Label htmlFor="modal-digitalAssetUsernameOrEmail">
									Username or Email Address
								</Label>
								<Input
									id="modal-digitalAssetUsernameOrEmail"
									placeholder="e.g., john.doe@gmail.com or @johndoe"
									value={newDigitalAssetUsernameOrEmail}
									onChange={(e) =>
										setNewDigitalAssetUsernameOrEmail(e.target.value)
									}
									className="w-full"
								/>
								<Label htmlFor="modal-digitalAssetBeneficiaryName">
									Beneficiary Name
								</Label>
								<Input
									id="modal-digitalAssetBeneficiaryName"
									placeholder="e.g., John Doe (for Facebook)"
									value={newDigitalAssetBeneficiaryName}
									onChange={(e) =>
										setNewDigitalAssetBeneficiaryName(e.target.value)
									}
									className="w-full"
								/>
								<Label htmlFor="modal-digitalAssetAction">Action</Label>
								<Select
									value={newDigitalAssetAction}
									onValueChange={(
										value: "delete" | "memorialize" | "transfer" | "archive"
									) => setNewDigitalAssetAction(value)}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select action" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="memorialize">Memorialize</SelectItem>
										<SelectItem value="transfer">Transfer</SelectItem>
										<SelectItem value="archive">Archive</SelectItem>
										<SelectItem value="delete">Delete</SelectItem>
									</SelectContent>
								</Select>
								<Label htmlFor="modal-digitalAssetNotes">
									Access and Instructions (Optional)
								</Label>
								<Textarea
									id="modal-digitalAssetNotes"
									placeholder="e.g., Password: 123456, Recovery email: backup@email.com, Instructions: Please delete all personal photos before transferring"
									value={newDigitalAssetNotes}
									onChange={(e) => setNewDigitalAssetNotes(e.target.value)}
									className="w-full min-h-[80px]"
								/>
								<Button
									onClick={() => {
										addDigitalAsset();
										setIsDigitalAssetsModalOpen(false);
									}}
									disabled={
										!newDigitalAssetPlatform.trim() ||
										!newDigitalAssetUsernameOrEmail.trim()
									}
									className="w-full text-white"
								>
									{isEditingDigitalAsset ? "Save Changes" : "Add Digital Asset"}
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={isDeleteConfirmationOpen}
				onOpenChange={(open) => {
					setIsDeleteConfirmationOpen(open);
					if (!open) {
						setPossessionToDelete(null);
					}
				}}
			>
				<DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
					</DialogHeader>
					<div className="py-4 text-center">
						<p className="text-black">
							Are you sure you want to delete this personal possession? This
							action cannot be undone.
						</p>
						<p className="text-black font-semibold">
							Item: {possessionToDelete?.item}
						</p>
						<p className="text-black font-semibold">
							Recipient: {possessionToDelete?.beneficiary}
						</p>
						{possessionToDelete?.reason && (
							<p className="text-black font-semibold">
								Reason: {possessionToDelete.reason}
							</p>
						)}
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setIsDeleteConfirmationOpen(false)}
							className="w-full"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							className="w-full"
						>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Digital Asset Delete Confirmation Dialog */}
			<Dialog
				open={isDigitalAssetDeleteConfirmationOpen}
				onOpenChange={(open) => {
					setIsDigitalAssetDeleteConfirmationOpen(open);
					if (!open) {
						setDigitalAssetToDelete(null);
					}
				}}
			>
				<DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
					</DialogHeader>
					<div className="py-4 text-center">
						<p className="text-black">
							Are you sure you want to delete this digital asset? This action
							cannot be undone.
						</p>
						<p className="text-black font-semibold">
							Platform: {digitalAssetToDelete?.asset.platform}
						</p>
						<p className="text-black font-semibold">
							Username/Email: {digitalAssetToDelete?.asset.usernameOrEmail}
						</p>
						{digitalAssetToDelete?.asset.notes && (
							<p className="text-black font-semibold">
								Notes: {digitalAssetToDelete.asset.notes}
							</p>
						)}
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setIsDigitalAssetDeleteConfirmationOpen(false)}
							className="w-full"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDeleteDigitalAsset}
							className="w-full"
						>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
