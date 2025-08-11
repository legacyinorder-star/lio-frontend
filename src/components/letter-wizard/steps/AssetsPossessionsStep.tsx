import { useState } from "react";
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
	const [personalPossessions, setPersonalPossessions] = useState(
		letterData?.personalPossessions || []
	);
	const [isPersonalPossessionsModalOpen, setIsPersonalPossessionsModalOpen] =
		useState(false);
	const [isEditingPersonalPossession, setIsEditingPersonalPossession] =
		useState(false);
	const [editingPossessionIndex, setEditingPossessionIndex] = useState<
		number | null
	>(null);

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
	};

	const addPersonalPossession = () => {
		if (newPossessionItem.trim() && newPossessionRecipient.trim()) {
			const newPossession = {
				item: newPossessionItem.trim(),
				recipient: newPossessionRecipient.trim(),
				reason: newPossessionReason.trim() || undefined,
			};

			let updatedPossessions;
			if (isEditingPersonalPossession && editingPossessionIndex !== null) {
				// Update existing possession
				updatedPossessions = [...personalPossessions];
				updatedPossessions[editingPossessionIndex] = newPossession;
			} else {
				// Add new possession
				updatedPossessions = [...personalPossessions, newPossession];
			}

			setPersonalPossessions(updatedPossessions);

			// Update letter data in context
			if (setLetterData && letterData) {
				setLetterData({
					...letterData,
					personalPossessions: updatedPossessions,
				});
			}

			// Reset form and editing state
			setNewPossessionItem("");
			setNewPossessionRecipient("");
			setNewPossessionReason("");
			setIsEditingPersonalPossession(false);
			setEditingPossessionIndex(null);
			setIsPersonalPossessionsModalOpen(false);
		}
	};

	const removePersonalPossession = (index: number) => {
		const updatedPossessions = personalPossessions.filter(
			(_, i) => i !== index
		);
		setPersonalPossessions(updatedPossessions);

		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				personalPossessions: updatedPossessions,
			});
		}
	};

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
				{personalPossessions.length > 0 && (
					<div className="space-y-3">
						{personalPossessions.map((possession, index) => (
							<div
								key={index}
								className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem] relative"
							>
								<div className="flex-1">
									<div className="font-medium text-[0.875rem]">
										{possession.item}
									</div>
									<div className="text-sm text-gray-600">
										To: {possession.recipient}
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
											setNewPossessionRecipient(possession.recipient);
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
				)}

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
										<SelectItem value="delete">Delete</SelectItem>
										<SelectItem value="memorialize">Memorialize</SelectItem>
										<SelectItem value="transfer">Transfer</SelectItem>
										<SelectItem value="archive">Archive</SelectItem>
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
		</div>
	);
}
