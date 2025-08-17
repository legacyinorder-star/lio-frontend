import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
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
import {
	LetterOfWishesService,
	FuneralInstructions,
	CreateFuneralInstructionsRequest,
	UpdateFuneralInstructionsRequest,
	Contact,
	CreateContactRequest,
	UpdateContactRequest,
} from "@/services/letterOfWishesService";
import { toast } from "sonner";

interface FuneralWishesApiResponse {
	id: string;
	created_at: string;
	wishes: "cremated" | "buried";
	will_id: string;
	user_id: string;
}

export interface FuneralEndOfLifeStepHandle {
	submitProfessionalInstructions: () => Promise<boolean>;
}

const FuneralEndOfLifeStep = forwardRef<FuneralEndOfLifeStepHandle>(
	(_, ref) => {
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

		// Funeral Instructions from API
		const [funeralInstructions, setFuneralInstructions] =
			useState<FuneralInstructions | null>(null);
		const [isLoadingFuneralInstructions, setIsLoadingFuneralInstructions] =
			useState(false);

		// Business Legacy states
		const [notificationContacts, setNotificationContacts] = useState<Contact[]>(
			[]
		);
		const [isLoadingContacts, setIsLoadingContacts] = useState(false);
		const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
			useState(false);
		const [contactToDelete, setContactToDelete] = useState<Contact | null>(
			null
		);

		// Professional Instructions from API
		const [
			isLoadingProfessionalInstructions,
			setIsLoadingProfessionalInstructions,
		] = useState(false);

		// Local state for form inputs
		const [professionalInstructionsText, setProfessionalInstructionsText] =
			useState(letterData?.businessLegacy?.professionalInstructions || "");
		const [isBusinessLegacyModalOpen, setIsBusinessLegacyModalOpen] =
			useState(false);
		const [isEditingNotificationContact, setIsEditingNotificationContact] =
			useState(false);
		const [editingContactIndex, setEditingContactIndex] = useState<
			number | null
		>(null);

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

		// Load existing funeral instructions from the Letter of Wishes
		useEffect(() => {
			const loadFuneralInstructions = async () => {
				if (!letterData?.id) {
					setIsLoadingFuneralInstructions(false);
					return;
				}

				setIsLoadingFuneralInstructions(true);
				try {
					const response = await LetterOfWishesService.getFuneralInstructions(
						letterData.id
					);
					console.log("🔍 Funeral instructions API response:", response);
					console.log("🔍 Current state before API update:", {
						burialLocation,
						serviceType,
						additionalPreferences,
					});
					if (response) {
						setFuneralInstructions(response);
						// Update local state with API data
						setBurialLocation(response.location || "");
						setServiceType(response.service || undefined);
						setAdditionalPreferences(response.additional_preferences || "");
						console.log("🔍 Updated local state:", {
							location: response.location,
							service: response.service,
							additional_preferences: response.additional_preferences,
						});
						console.log("🔍 State after API update:", {
							burialLocation: response.location || "",
							serviceType: response.service || undefined,
							additionalPreferences: response.additional_preferences || "",
						});
					}
				} catch (error) {
					console.error("Error loading funeral instructions:", error);
					toast.error("Failed to load funeral instructions");
				} finally {
					setIsLoadingFuneralInstructions(false);
				}
			};

			loadFuneralInstructions();
		}, [letterData?.id]);

		// Load existing contacts from the API
		useEffect(() => {
			const loadContacts = async () => {
				if (!letterData?.id) {
					setIsLoadingContacts(false);
					return;
				}

				setIsLoadingContacts(true);
				try {
					const response = await LetterOfWishesService.getContacts(
						letterData.id
					);
					setNotificationContacts(response);
				} catch (error) {
					console.error("Error loading contacts:", error);
					toast.error("Failed to load contacts");
				} finally {
					setIsLoadingContacts(false);
				}
			};

			loadContacts();
		}, [letterData?.id]);

		// Load existing professional instructions from the API
		useEffect(() => {
			const loadProfessionalInstructions = async () => {
				if (!letterData?.id) {
					setIsLoadingProfessionalInstructions(false);
					return;
				}

				setIsLoadingProfessionalInstructions(true);
				try {
					const response =
						await LetterOfWishesService.getProfessionalInstructions(
							letterData.id
						);
					if (response) {
						setProfessionalInstructionsText(response.professional_notes || "");
					}
				} catch (error) {
					console.error("Error loading professional instructions:", error);
					toast.error("Failed to load professional instructions");
				} finally {
					setIsLoadingProfessionalInstructions(false);
				}
			};

			loadProfessionalInstructions();
		}, [letterData?.id]);

		// Expose submit function to parent component
		useImperativeHandle(ref, () => ({
			submitProfessionalInstructions: async (): Promise<boolean> => {
				if (!letterData?.id) {
					toast.error("No Letter of Wishes ID available");
					return false;
				}

				try {
					// Save professional instructions (create or update)
					const instructionsData = {
						low_id: letterData.id,
						professional_notes: professionalInstructionsText.trim() || null,
					};

					const updatedInstructions =
						await LetterOfWishesService.saveProfessionalInstructions(
							instructionsData
						);

					// Update letter data in context
					if (setLetterData && letterData) {
						setLetterData({
							...letterData,
							businessLegacy: {
								...letterData.businessLegacy,
								professionalInstructions:
									updatedInstructions.professional_notes || "",
							},
						});
					}

					return true;
				} catch (error) {
					console.error("Error saving professional instructions:", error);
					toast.error("Failed to save professional instructions");
					return false;
				}
			},
		}));

		const handleModalSubmit = async () => {
			if (!letterData?.id) {
				toast.error("No Letter of Wishes ID available");
				return;
			}

			try {
				let updatedInstructions: FuneralInstructions;

				if (funeralInstructions) {
					// Update existing funeral instructions
					const updateData: UpdateFuneralInstructionsRequest = {
						location: burialLocation.trim() || null,
						service: serviceType || null,
						additional_preferences: additionalPreferences.trim() || null,
					};

					console.log("🔍 State values before update:", {
						burialLocation: burialLocation,
						serviceType: serviceType,
						additionalPreferences: additionalPreferences,
					});
					console.log("🔍 Update data being sent:", updateData);
					console.log("🔍 Funeral instructions ID:", funeralInstructions.id);

					updatedInstructions =
						await LetterOfWishesService.updateFuneralInstructions(
							funeralInstructions.id,
							updateData
						);
					toast.success("Funeral instructions updated successfully");
				} else {
					// Create new funeral instructions
					const createData: CreateFuneralInstructionsRequest = {
						low_id: letterData.id,
						location: burialLocation.trim() || null,
						service: serviceType || null,
						additional_preferences: additionalPreferences.trim() || null,
					};

					console.log("🔍 State values before create:", {
						burialLocation: burialLocation,
						serviceType: serviceType,
						additionalPreferences: additionalPreferences,
					});
					console.log("🔍 Create data being sent:", createData);

					updatedInstructions =
						await LetterOfWishesService.createFuneralInstructions(createData);
					toast.success("Funeral instructions saved successfully");
				}

				// Update local state with API response
				setFuneralInstructions(updatedInstructions);

				// Update letter data in context
				if (setLetterData && letterData) {
					setLetterData({
						...letterData,
						funeralPreferences: {
							burialLocation: updatedInstructions.location || "",
							serviceType: updatedInstructions.service || undefined,
							additionalPreferences:
								updatedInstructions.additional_preferences || "",
						},
					});
				}

				setIsModalOpen(false);
			} catch (error) {
				console.error("❌ Error saving funeral instructions:", error);
				toast.error("Failed to save funeral instructions");
			}
		};

		const addNotificationContact = async () => {
			if (newContactName.trim() && newContactEmail.trim() && letterData?.id) {
				try {
					let updatedContact: Contact;

					if (isEditingNotificationContact && editingContactIndex !== null) {
						// Update existing contact via API
						const existingContact = notificationContacts[editingContactIndex];
						const updateData: UpdateContactRequest = {
							full_name: newContactName.trim(),
							email: newContactEmail.trim(),
						};

						updatedContact = await LetterOfWishesService.updateContact(
							existingContact.id,
							updateData
						);

						// Update local state with the response from API
						const updatedContacts = [...notificationContacts];
						updatedContacts[editingContactIndex] = updatedContact;
						setNotificationContacts(updatedContacts);

						// Update letter data in context with the new structure
						if (setLetterData && letterData) {
							setLetterData({
								...letterData,
								businessLegacy: {
									...letterData.businessLegacy,
									notificationContacts: updatedContacts.map((contact) => ({
										name: contact.full_name,
										email: contact.email,
									})),
								},
							});
						}

						toast.success("Contact updated successfully");
					} else {
						// Create new contact via API
						const contactData: CreateContactRequest = {
							low_id: letterData.id,
							full_name: newContactName.trim(),
							email: newContactEmail.trim(),
						};

						updatedContact = await LetterOfWishesService.createContact(
							contactData
						);
						const updatedContacts = [...notificationContacts, updatedContact];
						setNotificationContacts(updatedContacts);

						// Update letter data in context with the new structure
						if (setLetterData && letterData) {
							setLetterData({
								...letterData,
								businessLegacy: {
									...letterData.businessLegacy,
									notificationContacts: updatedContacts.map((contact) => ({
										name: contact.full_name,
										email: contact.email,
									})),
								},
							});
						}

						toast.success("Contact added successfully");
					}

					// Reset form and editing state
					setNewContactName("");
					setNewContactEmail("");
					setIsEditingNotificationContact(false);
					setEditingContactIndex(null);
					setIsBusinessLegacyModalOpen(false);
				} catch (error) {
					console.error("Error adding/updating contact:", error);
					toast.error("Failed to save contact");
				}
			}
		};

		const removeNotificationContact = (index: number) => {
			const contact = notificationContacts[index];

			// Show confirmation dialog
			setContactToDelete(contact);
			setIsDeleteConfirmationOpen(true);
		};

		const confirmDeleteContact = async () => {
			if (!contactToDelete) return;

			try {
				// Delete via API
				await LetterOfWishesService.deleteContact(contactToDelete.id);

				// Update local state
				const updatedContacts = notificationContacts.filter(
					(contact) => contact.id !== contactToDelete.id
				);
				setNotificationContacts(updatedContacts);

				// Update letter data in context with the new structure
				if (setLetterData && letterData) {
					setLetterData({
						...letterData,
						businessLegacy: {
							...letterData.businessLegacy,
							notificationContacts: updatedContacts.map((contact) => ({
								name: contact.full_name,
								email: contact.email,
							})),
						},
					});
				}

				toast.success("Contact deleted successfully");
			} catch (error) {
				console.error("Error deleting contact:", error);
				toast.error("Failed to delete contact");
			} finally {
				// Close confirmation dialog and reset state
				setIsDeleteConfirmationOpen(false);
				setContactToDelete(null);
			}
		};

		const updateProfessionalInstructions = (instructions: string) => {
			setProfessionalInstructionsText(instructions);

			// Update letter data in context immediately for next button submission
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
			burialLocation.trim() ||
			serviceType ||
			additionalPreferences.trim() ||
			(funeralInstructions?.location && funeralInstructions.location.trim()) ||
			funeralInstructions?.service ||
			(funeralInstructions?.additional_preferences &&
				funeralInstructions.additional_preferences.trim());

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
						{!hasFuneralPreferences && !isLoadingFuneralInstructions && (
							<Button
								onClick={() => setIsModalOpen(true)}
								variant="outline"
								className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
							>
								<Plus className="mr-2 h-5 w-5" />
								Add Funeral Details
							</Button>
						)}

						{/* Loading State for Funeral Instructions */}
						{isLoadingFuneralInstructions && (
							<div className="text-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2"></div>
								<p className="text-muted-foreground">
									Loading funeral instructions...
								</p>
							</div>
						)}

						{/* Funeral Details Summary */}
						{hasFuneralPreferences && !isLoadingFuneralInstructions && (
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
								Instructions regarding your business or professional matters
								after your passing.
							</p>
						</div>

						{/* Loading State for Professional Instructions */}
						{isLoadingProfessionalInstructions ? (
							<div className="text-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2"></div>
								<p className="text-muted-foreground">
									Loading professional instructions...
								</p>
							</div>
						) : (
							<Textarea
								placeholder="e.g., Close my business accounts, notify clients about my passing, transfer ongoing projects to colleagues, etc."
								value={professionalInstructionsText}
								onChange={(e) => updateProfessionalInstructions(e.target.value)}
								className="w-full min-h-[120px]"
							/>
						)}
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

						{/* Loading State for Contacts */}
						{isLoadingContacts && (
							<div className="text-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2"></div>
								<p className="text-muted-foreground">Loading contacts...</p>
							</div>
						)}

						{/* Notification Contacts List */}
						{!isLoadingContacts && notificationContacts.length > 0 && (
							<div className="space-y-3">
								{notificationContacts.map((contact, index) => (
									<div
										key={index}
										className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem] relative"
									>
										<div className="flex-1">
											<div className="font-medium text-[0.875rem]">
												{contact.full_name}
											</div>
											<div className="text-sm text-gray-600">
												{contact.email}
											</div>
										</div>
										<div className="flex gap-2 ml-4">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													// Set the form values for editing
													setNewContactName(contact.full_name);
													setNewContactEmail(contact.email);
													// Set editing state
													setIsEditingNotificationContact(true);
													setEditingContactIndex(index);
													setIsBusinessLegacyModalOpen(true);
												}}
												className="absolute top-4 right-22 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
											>
												Edit
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => removeNotificationContact(index)}
												className="absolute top-4 right-4 bg-red-600 border-[#CCCCCC] text-white hover:bg-red-700 hover:text-white rounded-[0.25rem] font-medium"
											>
												Delete
											</Button>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Add Notification Contact Button */}
						{!isLoadingContacts && (
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
						)}
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
									{funeralWishes === "cremated" ? "scattered/buried" : "buried"}
									?
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
									Include any specific preferences for music, readings, people
									to speak, flowers, dress code, or other details
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

				{/* Delete Confirmation Dialog */}
				<Dialog
					open={isDeleteConfirmationOpen}
					onOpenChange={setIsDeleteConfirmationOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirm Deletion</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this contact? This action cannot
								be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDeleteConfirmationOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={confirmDeleteContact}
								className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
							>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	}
);

FuneralEndOfLifeStep.displayName = "FuneralEndOfLifeStep";

export default FuneralEndOfLifeStep;
