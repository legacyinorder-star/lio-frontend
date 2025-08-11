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
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { apiClient } from "@/utils/apiClient";

interface FuneralWishesApiResponse {
	id: string;
	created_at: string;
	wishes: "cremated" | "buried";
	will_id: string;
	user_id: string;
}

export default function FuneralEndOfLifeStep() {
	const { letterData, setLetterData, willData } = useLetterOfWishes();
	const [funeralWishes, setFuneralWishes] = useState<
		"cremated" | "buried" | null
	>(null);
	const [burialLocation, setBurialLocation] = useState(
		letterData?.funeralPreferences?.burialLocation || ""
	);
	const [serviceType, setServiceType] = useState<
		"religious" | "non-religious" | "private" | "public" | undefined
	>(letterData?.funeralPreferences?.serviceType);
	const [additionalPreferences, setAdditionalPreferences] = useState(
		letterData?.funeralPreferences?.additionalPreferences || ""
	);
	const [isLoadingFuneralData, setIsLoadingFuneralData] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Business Legacy states
	const [notificationContacts, setNotificationContacts] = useState(
		letterData?.businessLegacy?.notificationContacts || []
	);
	const [professionalInstructions, setProfessionalInstructions] = useState(
		letterData?.businessLegacy?.professionalInstructions || ""
	);
	const [isBusinessLegacyModalOpen, setIsBusinessLegacyModalOpen] =
		useState(false);
	const [isEditingNotificationContact, setIsEditingNotificationContact] =
		useState(false);
	const [editingContactIndex, setEditingContactIndex] = useState<number | null>(
		null
	);

	// Temporary state for form inputs for adding new notification contact
	const [newContactName, setNewContactName] = useState("");
	const [newContactEmail, setNewContactEmail] = useState("");

	// Load existing funeral wishes from the will
	useEffect(() => {
		const loadFuneralWishes = async () => {
			if (!willData?.id) {
				setIsLoadingFuneralData(false);
				return;
			}

			try {
				const { data, error } = await apiClient<FuneralWishesApiResponse>(
					`/funeral_instructions/get-by-will/${willData.id}`
				);

				if (!error && data) {
					setFuneralWishes(data.wishes);
				}
			} catch (error) {
				console.error("Error loading funeral wishes:", error);
			} finally {
				setIsLoadingFuneralData(false);
			}
		};

		loadFuneralWishes();
	}, [willData?.id]);

	const handleModalSubmit = () => {
		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				funeralPreferences: {
					burialLocation: burialLocation.trim(),
					serviceType,
					additionalPreferences: additionalPreferences.trim(),
				},
			});
		}
		setIsModalOpen(false);
	};

	const addNotificationContact = () => {
		if (newContactName.trim() && newContactEmail.trim()) {
			const newContact = {
				name: newContactName.trim(),
				email: newContactEmail.trim(),
			};

			let updatedContacts;
			if (isEditingNotificationContact && editingContactIndex !== null) {
				// Update existing contact
				updatedContacts = [...notificationContacts];
				updatedContacts[editingContactIndex] = newContact;
			} else {
				// Add new contact
				updatedContacts = [...notificationContacts, newContact];
			}

			setNotificationContacts(updatedContacts);

			// Update letter data in context
			if (setLetterData && letterData) {
				setLetterData({
					...letterData,
					businessLegacy: {
						...letterData.businessLegacy,
						notificationContacts: updatedContacts,
					},
				});
			}

			// Reset form and editing state
			setNewContactName("");
			setNewContactEmail("");
			setIsEditingNotificationContact(false);
			setEditingContactIndex(null);
		}
	};

	const removeNotificationContact = (index: number) => {
		const updatedContacts = notificationContacts.filter((_, i) => i !== index);
		setNotificationContacts(updatedContacts);

		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				businessLegacy: {
					...letterData.businessLegacy,
					notificationContacts: updatedContacts,
				},
			});
		}
	};

	const updateProfessionalInstructions = (instructions: string) => {
		setProfessionalInstructions(instructions);

		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				businessLegacy: {
					...letterData.businessLegacy,
					professionalInstructions: instructions,
				},
			});
		}
	};

	const hasFuneralPreferences =
		burialLocation.trim() || serviceType || additionalPreferences.trim();

	return (
		<div className="space-y-6 w-full max-w-4xl">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Funeral & Legacy Instructions
			</div>
			<div className="text-muted-foreground">
				Specify your funeral and legacy preferences to guide your loved ones.
			</div>

			{/* Funeral Wishes from Will */}
			{!isLoadingFuneralData && funeralWishes && (
				<div className="space-y-6">
					<div>
						<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
							Funeral Wishes from Your Will
						</h6>
						<p className="text-black">
							Your Will indicates you wish to be{" "}
							<span className="font-bold">{funeralWishes}</span>.
						</p>
					</div>

					{/* Add Funeral Details Button */}
					{!hasFuneralPreferences && (
						<Button
							onClick={() => setIsModalOpen(true)}
							variant="outline"
							className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
						>
							<Plus className="mr-2 h-5 w-5" />
							Add Funeral Details
						</Button>
					)}

					{/* Funeral Details Summary */}
					{hasFuneralPreferences && (
						<div className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem] relative">
							{/* Edit Button - Top Right Corner */}
							<Button
								onClick={() => setIsModalOpen(true)}
								variant="outline"
								size="sm"
								className="absolute top-4 right-4 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
							>
								Edit
							</Button>

							<div className="space-y-2">
								{burialLocation.trim() && (
									<div className="mb-4">
										<div className="font-semibold text-[0.875rem] text-[#212121] mb-1">
											Your preferred location
										</div>
										<div className="text-[0.875rem] text-[#212121] font-normal">
											{burialLocation}
										</div>
									</div>
								)}
								{serviceType && (
									<div className="mb-4">
										<div className="font-semibold text-[0.875rem] text-[#212121] mb-1">
											Service Type
										</div>
										<div className="text-[0.875rem] text-[#212121] font-normal capitalize">
											{serviceType.replace("-", " ")} Service
										</div>
									</div>
								)}
								{additionalPreferences.trim() && (
									<div className="mb-4">
										<div className="font-semibold text-[0.875rem] text-[#212121] mb-1">
											Additional Preferences
										</div>
										<div className="text-[0.875rem] text-[#212121] font-normal">
											{additionalPreferences}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Business/Professional Legacy Section */}
			<div className="space-y-6">
				<div>
					<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
						Business/Professional Legacy
					</h6>
					<p className="text-black">
						Specify who should be notified about your passing and provide
						instructions regarding your business or professional matters.
					</p>
				</div>

				{/* Professional Instructions */}
				<div className="space-y-4">
					<div>
						<h6 className="font-semibold text-black mb-2 text-[1rem]">
							Professional Instructions
						</h6>
						<p className="text-black text-sm">
							Instructions regarding your business or professional matters after
							your passing.
						</p>
					</div>

					<Textarea
						placeholder="e.g., Close my business accounts, notify clients about my passing, transfer ongoing projects to colleagues, etc."
						value={professionalInstructions}
						onChange={(e) => updateProfessionalInstructions(e.target.value)}
						className="w-full min-h-[120px]"
					/>
				</div>
				{/* Notification Contacts */}
				<div className="space-y-4">
					<div>
						<h6 className="font-semibold text-black mb-2 text-[1rem]">
							Notify Contacts
						</h6>
						<p className="text-black text-sm">
							People who should be notified about your passing for business or
							professional reasons.
						</p>
					</div>

					{/* Notification Contacts List */}
					{notificationContacts.length > 0 && (
						<div className="space-y-3">
							{notificationContacts.map((contact, index) => (
								<div
									key={index}
									className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border"
								>
									<div className="flex-1">
										<div className="font-medium text-[0.875rem]">
											{contact.name}
										</div>
										<div className="text-sm text-gray-600">{contact.email}</div>
									</div>
									<div className="flex gap-2 ml-4">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												// Set the form values for editing
												setNewContactName(contact.name);
												setNewContactEmail(contact.email);
												// Set editing state
												setIsEditingNotificationContact(true);
												setEditingContactIndex(index);
												setIsBusinessLegacyModalOpen(true);
											}}
											className="text-blue-600 hover:text-blue-700"
										>
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => removeNotificationContact(index)}
											className="text-red-600 hover:text-red-700"
										>
											Delete
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Add Notification Contact Button */}
					<Button
						onClick={() => {
							// Reset form when adding new contact
							setNewContactName("");
							setNewContactEmail("");
							setIsEditingNotificationContact(false);
							setEditingContactIndex(null);
							setIsBusinessLegacyModalOpen(true);
						}}
						variant="outline"
						className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Contact to Notify
					</Button>
				</div>
			</div>

			{/* Funeral Details Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Funeral and Burial Preferences</DialogTitle>
						<DialogDescription>
							Specify your funeral and burial preferences to guide your loved
							ones.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						{/* Burial/Cremation Location */}
						<div className="space-y-2">
							<Label htmlFor="modal-burialLocation">
								Where would you like to be{" "}
								{funeralWishes === "cremated" ? "scattered/buried" : "buried"}?
							</Label>
							<Input
								id="modal-burialLocation"
								placeholder={`e.g., ${
									funeralWishes === "cremated"
										? "Garden of remembrance, family plot, specific location"
										: "Family cemetery, specific cemetery, location"
								}`}
								value={burialLocation}
								onChange={(e) => setBurialLocation(e.target.value)}
								className="w-full"
							/>
							<p className="text-sm text-gray-500">
								Specify the location where you would like your remains to be
								placed
							</p>
						</div>

						{/* Service Type */}
						<div className="space-y-2">
							<Label htmlFor="modal-serviceType">Type of Service</Label>
							<Select
								value={serviceType}
								onValueChange={(
									value: "religious" | "non-religious" | "private" | "public"
								) => setServiceType(value)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select service type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="religious">Religious Service</SelectItem>
									<SelectItem value="non-religious">
										Non-Religious Service
									</SelectItem>
									<SelectItem value="private">Private Service</SelectItem>
									<SelectItem value="public">Public Service</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-sm text-gray-500">
								Choose the type of service you would prefer
							</p>
						</div>

						{/* Additional Preferences */}
						<div className="space-y-2">
							<Label htmlFor="modal-additionalPreferences">
								Additional Preferences
							</Label>
							<Textarea
								id="modal-additionalPreferences"
								placeholder="e.g., Specific music, readings, people to speak, flowers, dress code, etc."
								value={additionalPreferences}
								onChange={(e) => setAdditionalPreferences(e.target.value)}
								className="w-full min-h-[120px]"
							/>
							<p className="text-sm text-gray-500">
								Include any specific preferences for music, readings, people to
								speak, flowers, dress code, or other details
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsModalOpen(false)}>
							Cancel
						</Button>
						<Button className="text-white" onClick={handleModalSubmit}>
							Save Funeral Details
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Business Legacy Modal */}
			<Dialog
				open={isBusinessLegacyModalOpen}
				onOpenChange={(open) => {
					setIsBusinessLegacyModalOpen(open);
					if (!open) {
						// Reset form and editing state when modal is closed
						setNewContactName("");
						setNewContactEmail("");
						setIsEditingNotificationContact(false);
						setEditingContactIndex(null);
					}
				}}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditingNotificationContact
								? "Edit Notification Contact"
								: "Add Notification Contact"}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6 pb-4">
						{/* Notification Contact Details */}
						<div className="space-y-2">
							<Label htmlFor="modal-contactName">Name</Label>
							<Input
								id="modal-contactName"
								placeholder="e.g., John Smith, Business Partner"
								value={newContactName}
								onChange={(e) => setNewContactName(e.target.value)}
								className="w-full"
							/>
							<Label htmlFor="modal-contactEmail">Email</Label>
							<Input
								id="modal-contactEmail"
								type="email"
								placeholder="e.g., john.smith@company.com"
								value={newContactEmail}
								onChange={(e) => setNewContactEmail(e.target.value)}
								className="w-full"
							/>
							<Button
								onClick={() => {
									addNotificationContact();
									setIsBusinessLegacyModalOpen(false);
								}}
								disabled={!newContactName.trim() || !newContactEmail.trim()}
								className="w-full text-white"
							>
								{isEditingNotificationContact
									? "Save Changes"
									: "Add Notification Contact"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
