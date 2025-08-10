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
import { Plus, CreditCard } from "lucide-react";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { apiClient } from "@/utils/apiClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { downloadLetterOfWishesPDF } from "@/utils/letterOfWishesDownload";

interface FuneralWishesApiResponse {
	id: string;
	created_at: string;
	wishes: "cremated" | "buried";
	will_id: string;
	user_id: string;
}

export default function IntroductionStep() {
	const { letterData, setLetterData, willData } = useLetterOfWishes();
	const navigate = useNavigate();
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

	// Guardianship states
	const [reasonForChoice, setReasonForChoice] = useState(
		letterData?.guardianshipPreferences?.reasonForChoice || ""
	);
	const [valuesAndHopes, setValuesAndHopes] = useState(
		letterData?.guardianshipPreferences?.valuesAndHopes || ""
	);
	const [isGuardianshipModalOpen, setIsGuardianshipModalOpen] = useState(false);

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

	// Temporary state for form inputs for adding new personal possession
	const [newPossessionItem, setNewPossessionItem] = useState("");
	const [newPossessionRecipient, setNewPossessionRecipient] = useState("");
	const [newPossessionReason, setNewPossessionReason] = useState("");

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

	// Charitable Donations states
	const [charitableDonations, setCharitableDonations] = useState(
		letterData?.charitableDonations || []
	);
	const [isCharitableDonationsModalOpen, setIsCharitableDonationsModalOpen] =
		useState(false);
	const [isEditingCharitableDonation, setIsEditingCharitableDonation] =
		useState(false);
	const [editingDonationIndex, setEditingDonationIndex] = useState<
		number | null
	>(null);

	// Temporary state for form inputs for adding new charitable donation
	const [newCharityName, setNewCharityName] = useState("");
	const [newCharityDescription, setNewCharityDescription] = useState("");

	// Trustee Instructions and Notes to Loved Ones states
	const [trusteeInstructions, setTrusteeInstructions] = useState(
		letterData?.trusteeInstructions || ""
	);
	const [notesToLovedOnes, setNotesToLovedOnes] = useState(
		letterData?.notesToLovedOnes || ""
	);

	// Payment states
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

	const handleGuardianshipModalSubmit = () => {
		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				guardianshipPreferences: {
					reasonForChoice: reasonForChoice.trim(),
					valuesAndHopes: valuesAndHopes.trim(),
				},
			});
		}
		setIsGuardianshipModalOpen(false);
	};

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

	const addCharitableDonation = () => {
		if (newCharityName.trim()) {
			const newDonation = {
				charityName: newCharityName.trim(),
				description: newCharityDescription.trim() || undefined,
			};

			let updatedDonations;
			if (isEditingCharitableDonation && editingDonationIndex !== null) {
				// Update existing donation
				updatedDonations = [...charitableDonations];
				updatedDonations[editingDonationIndex] = newDonation;
			} else {
				// Add new donation
				updatedDonations = [...charitableDonations, newDonation];
			}

			setCharitableDonations(updatedDonations);

			// Update letter data in context
			if (setLetterData && letterData) {
				setLetterData({
					...letterData,
					charitableDonations: updatedDonations,
				});
			}

			// Reset form and editing state
			setNewCharityName("");
			setNewCharityDescription("");
			setIsEditingCharitableDonation(false);
			setEditingDonationIndex(null);
		}
	};

	const removeCharitableDonation = (index: number) => {
		const updatedDonations = charitableDonations.filter((_, i) => i !== index);
		setCharitableDonations(updatedDonations);

		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				charitableDonations: updatedDonations,
			});
		}
	};

	const updateTrusteeInstructions = (instructions: string) => {
		setTrusteeInstructions(instructions);

		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				trusteeInstructions: instructions,
			});
		}
	};

	const updateNotesToLovedOnes = (notes: string) => {
		setNotesToLovedOnes(notes);

		// Update letter data in context
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				notesToLovedOnes: notes,
			});
		}
	};

	const hasFuneralPreferences =
		burialLocation.trim() || serviceType || additionalPreferences.trim();

	const hasGuardianshipPreferences =
		reasonForChoice.trim() || valuesAndHopes.trim();

	// Get guardians from will data
	const guardians = willData?.guardians || [];
	const guardianNames = guardians
		.map((guardian) => `${guardian.firstName} ${guardian.lastName}`)
		.join(" and ");

	// Handle payment and submit
	const handlePayAndSubmit = async () => {
		console.log("🔄 handlePayAndSubmit called");

		if (!willData?.id) {
			toast.error("No will found for payment");
			return;
		}

		setIsProcessingPayment(true);
		try {
			// First, save the current letter data
			if (setLetterData && letterData) {
				console.log("📝 Preparing letter data for PDF generation...");

				const updatedLetterData = {
					...letterData,
					funeralPreferences: {
						burialLocation: burialLocation.trim(),
						serviceType,
						additionalPreferences: additionalPreferences.trim(),
					},
					guardianshipPreferences: {
						reasonForChoice: reasonForChoice.trim(),
						valuesAndHopes: valuesAndHopes.trim(),
					},
					digitalAssetsPreferences: {
						digitalAssets,
					},
					personalPossessions,
					businessLegacy: {
						notificationContacts,
						professionalInstructions: professionalInstructions.trim(),
					},
					charitableDonations,
					trusteeInstructions: trusteeInstructions.trim(),
					notesToLovedOnes: notesToLovedOnes.trim(),
				};

				console.log("📋 Updated letter data:", updatedLetterData);

				setLetterData(updatedLetterData);

				// Generate and download the PDF
				const willOwnerName = willData.owner
					? `${willData.owner.firstName} ${willData.owner.lastName}`
					: undefined;

				console.log("🔄 Starting PDF generation for:", willOwnerName);

				const pdfResult = await downloadLetterOfWishesPDF(
					updatedLetterData,
					willOwnerName
				);
				console.log("📄 PDF generation result:", pdfResult);

				if (!pdfResult) {
					console.error("❌ PDF generation failed");
					toast.error("Failed to generate PDF. Please try again.");
					return;
				}
			} else {
				console.error("❌ No letter data or setLetterData function available");
				toast.error("No letter data available for PDF generation");
				return;
			}

			// Navigate to payment page for letter of wishes
			const paymentUrl = `/app/payment?willId=${willData.id}&description=Letter of Wishes&source=letter-of-wishes`;
			console.log("🔄 Navigating to payment page:", paymentUrl);
			navigate(paymentUrl);
		} catch (error) {
			console.error("❌ Error in handlePayAndSubmit:", error);
			toast.error("Failed to process payment. Please try again.");
		} finally {
			setIsProcessingPayment(false);
		}
	};

	return (
		<div className="space-y-6 w-full max-w-4xl">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Your Letter of Wishes
			</div>
			<div className="text-muted-foreground">
				This information will be used to create your Letter of Wishes - a
				personal guide to support your will and help carry out your intentions.
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
							<span className="font-medium">{funeralWishes}</span>.
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

			{/* Guardianship Section */}
			{guardians.length > 0 && (
				<div className="space-y-6">
					<div>
						<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
							Guardianship of Children
						</h6>
						<p className="text-black">
							Your preferred guardians for your children are{" "}
							<span className="font-medium">{guardianNames}</span>
						</p>
					</div>

					{/* Add Guardianship Details Button */}
					{!hasGuardianshipPreferences && (
						<Button
							onClick={() => setIsGuardianshipModalOpen(true)}
							variant="outline"
							className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
						>
							<Plus className="mr-2 h-5 w-5" />
							Add Guardian Instructions
						</Button>
					)}

					{/* Guardianship Details Summary */}
					{hasGuardianshipPreferences && (
						<div className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem] relative">
							{/* Edit Button - Top Right Corner */}
							<Button
								onClick={() => setIsGuardianshipModalOpen(true)}
								variant="outline"
								size="sm"
								className="absolute top-4 right-4 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
							>
								Edit
							</Button>

							<div className="space-y-2">
								{reasonForChoice.trim() && (
									<div className="mb-4">
										<div className="font-semibold text-[0.875rem] text-[#212121] mb-1">
											Reason for Choice
										</div>
										<div className="text-[0.875rem] text-[#212121] font-normal">
											{reasonForChoice}
										</div>
									</div>
								)}
								{valuesAndHopes.trim() && (
									<div className="mb-4">
										<div className="font-semibold text-[0.875rem] text-[#212121] mb-1">
											Values and Hopes
										</div>
										<div className="text-[0.875rem] text-[#212121] font-normal">
											{valuesAndHopes}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}

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
								className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border"
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
										className="text-blue-600 hover:text-blue-700"
									>
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => removePersonalPossession(index)}
										className="text-red-600 hover:text-red-700"
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
								className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border"
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
										className="text-blue-600 hover:text-blue-700"
									>
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => removeDigitalAsset(index)}
										className="text-red-600 hover:text-red-700"
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

			{/* Charitable Donations Section */}
			<div className="space-y-6">
				<div>
					<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
						Charitable Donations
					</h6>
					<p className="text-black">
						List the charities you would like your executors to support if
						possible.
					</p>
				</div>

				{/* Charitable Donations List */}
				{charitableDonations.length > 0 && (
					<div className="space-y-3">
						{charitableDonations.map((donation, index) => (
							<div
								key={index}
								className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border"
							>
								<div className="flex-1">
									<div className="font-medium text-[0.875rem]">
										{donation.charityName}
									</div>
									{donation.description && (
										<div className="text-sm text-gray-600">
											{donation.description}
										</div>
									)}
								</div>
								<div className="flex gap-2 ml-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											// Set the form values for editing
											setNewCharityName(donation.charityName);
											setNewCharityDescription(donation.description || "");
											// Set editing state
											setIsEditingCharitableDonation(true);
											setEditingDonationIndex(index);
											setIsCharitableDonationsModalOpen(true);
										}}
										className="text-blue-600 hover:text-blue-700"
									>
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => removeCharitableDonation(index)}
										className="text-red-600 hover:text-red-700"
									>
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Add Charitable Donation Button */}
				<Button
					onClick={() => {
						// Reset form when adding new donation
						setNewCharityName("");
						setNewCharityDescription("");
						setIsEditingCharitableDonation(false);
						setEditingDonationIndex(null);
						setIsCharitableDonationsModalOpen(true);
					}}
					variant="outline"
					className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Charitable Donation
				</Button>
			</div>

			{/* Trustee Instructions Section */}
			<div className="space-y-6">
				<div>
					<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
						Trustee Instructions
					</h6>
					<p className="text-black">
						Provide instructions for your executors regarding the distribution
						of your assets and the execution of your wishes.
					</p>
				</div>

				<Textarea
					placeholder="e.g., Please distribute my assets as per my will, notify my family members, close my bank accounts, etc."
					value={trusteeInstructions}
					onChange={(e) => updateTrusteeInstructions(e.target.value)}
					className="w-full min-h-[120px]"
				/>
			</div>

			{/* Notes to Loved Ones Section */}
			<div className="space-y-6">
				<div>
					<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
						Notes to Loved Ones
					</h6>
					<p className="text-black">
						Messages or notes you would like your loved ones to receive after
						your passing.
					</p>
				</div>

				<Textarea
					placeholder="e.g., I love you, thank you for being my family, I'm proud of you, etc."
					value={notesToLovedOnes}
					onChange={(e) => updateNotesToLovedOnes(e.target.value)}
					className="w-full min-h-[120px]"
				/>
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

			{/* Guardianship Details Modal */}
			<Dialog
				open={isGuardianshipModalOpen}
				onOpenChange={setIsGuardianshipModalOpen}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Guardianship Preferences</DialogTitle>
						<DialogDescription>
							Specify your reasons for choosing these guardians and your hopes
							for your children's upbringing.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						{/* Reason for Choice */}
						<div className="space-y-2">
							<Label htmlFor="modal-reasonForChoice">
								Reason for Choosing These Guardians
							</Label>
							<Textarea
								id="modal-reasonForChoice"
								placeholder="e.g., Their expertise in child development, their stable family environment, their shared values..."
								value={reasonForChoice}
								onChange={(e) => setReasonForChoice(e.target.value)}
								className="w-full min-h-[120px]"
							/>
							<p className="text-sm text-gray-500">
								Explain why you chose these specific guardians for your children
							</p>
						</div>

						{/* Values and Hopes */}
						<div className="space-y-2">
							<Label htmlFor="modal-valuesAndHopes">
								Values and Hopes for Upbringing
							</Label>
							<Textarea
								id="modal-valuesAndHopes"
								placeholder="e.g., I hope my children will be raised with strong moral values, kindness, and a love for learning..."
								value={valuesAndHopes}
								onChange={(e) => setValuesAndHopes(e.target.value)}
								className="w-full min-h-[120px]"
							/>
							<p className="text-sm text-gray-500">
								Share your core values and hopes for how your children should be
								raised including their education, religion, and lifestyle
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsGuardianshipModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							className="text-white"
							onClick={handleGuardianshipModalSubmit}
						>
							Save Guardianship Details
						</Button>
					</DialogFooter>
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

			{/* Charitable Donations Modal */}
			<Dialog
				open={isCharitableDonationsModalOpen}
				onOpenChange={(open) => {
					setIsCharitableDonationsModalOpen(open);
					if (!open) {
						// Reset form and editing state when modal is closed
						setNewCharityName("");
						setNewCharityDescription("");
						setIsEditingCharitableDonation(false);
						setEditingDonationIndex(null);
					}
				}}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditingCharitableDonation
								? "Edit Charitable Donation"
								: "Add Charitable Donation"}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6 pb-4">
						{/* Charitable Donation Details */}
						<div className="space-y-2">
							<Label htmlFor="modal-charityName">Charity Name</Label>
							<Input
								id="modal-charityName"
								placeholder="e.g., American Red Cross, UNICEF, etc."
								value={newCharityName}
								onChange={(e) => setNewCharityName(e.target.value)}
								className="w-full"
							/>
							<Label htmlFor="modal-charityDescription">
								Description (Optional)
							</Label>
							<Textarea
								id="modal-charityDescription"
								placeholder="e.g., For disaster relief, for education, etc."
								value={newCharityDescription}
								onChange={(e) => setNewCharityDescription(e.target.value)}
								className="w-full min-h-[80px]"
							/>
							<Button
								onClick={() => {
									addCharitableDonation();
									setIsCharitableDonationsModalOpen(false);
								}}
								disabled={!newCharityName.trim()}
								className="w-full text-white"
							>
								{isEditingCharitableDonation
									? "Save Changes"
									: "Add Charitable Donation"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Pay and Submit Button */}
			<div className="flex justify-start pt-6">
				<Button
					onClick={handlePayAndSubmit}
					disabled={isProcessingPayment}
					className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium"
				>
					{isProcessingPayment ? (
						<>
							<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white mr-2"></div>
							Processing...
						</>
					) : (
						<>
							<CreditCard className="mr-2 h-4 w-4" />
							Pay and Submit
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
