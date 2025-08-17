import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	LetterOfWishesService,
	ProfessionalInstructions,
	CharitableDonation,
	CreateCharitableDonationRequest,
	UpdateCharitableDonationRequest,
} from "@/services/letterOfWishesService";

// Add interface for the ref handle
export interface InstructionsCharitableDonationsStepHandle {
	handlePayAndSubmit: () => Promise<void>;
	isProcessingPayment: boolean;
}

const InstructionsCharitableDonationsStep =
	forwardRef<InstructionsCharitableDonationsStepHandle>((_props, ref) => {
		const { letterData, setLetterData, willData } = useLetterOfWishes();
		const navigate = useNavigate();

		// Charitable Donations states
		const [charitableDonations, setCharitableDonations] = useState<
			CharitableDonation[]
		>([]);
		const [isLoadingCharitableDonations, setIsLoadingCharitableDonations] =
			useState(false);
		const [isCharitableDonationsModalOpen, setIsCharitableDonationsModalOpen] =
			useState(false);
		const [isEditingCharitableDonation, setIsEditingCharitableDonation] =
			useState(false);
		const [editingDonationIndex, setEditingDonationIndex] = useState<
			number | null
		>(null);

		// Instructions from API
		const [instructions, setInstructions] =
			useState<ProfessionalInstructions | null>(null);

		// Trustee Instructions and Notes to Loved Ones states
		const [trusteeInstructions, setTrusteeInstructions] = useState(
			letterData?.trusteeInstructions || ""
		);

		// Payment states
		const [isProcessingPayment, setIsProcessingPayment] = useState(false);

		// Temporary state for form inputs for adding new charitable donation
		const [newCharityName, setNewCharityName] = useState("");
		const [newCharityDescription, setNewCharityDescription] = useState("");

		// Load existing instructions from the API
		useEffect(() => {
			const loadInstructions = async () => {
				if (!letterData?.id) return;

				try {
					const response =
						await LetterOfWishesService.getProfessionalInstructions(
							letterData.id
						);
					if (response) {
						setInstructions(response);
						setTrusteeInstructions(response.trustee_notes || "");
					}
				} catch (error) {
					console.error("Error loading instructions:", error);
				}
			};

			loadInstructions();
		}, [letterData?.id]);

		// Load existing charitable donations from the API
		useEffect(() => {
			const loadCharitableDonations = async () => {
				if (!letterData?.id) return;

				setIsLoadingCharitableDonations(true);
				try {
					const response = await LetterOfWishesService.getCharitableDonations(
						letterData.id
					);
					setCharitableDonations(response);
				} catch (error) {
					console.error("Error loading charitable donations:", error);
					toast.error("Failed to load charitable donations");
				} finally {
					setIsLoadingCharitableDonations(false);
				}
			};

			loadCharitableDonations();
		}, [letterData?.id]);

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

		const addCharitableDonation = async () => {
			if (!newCharityName.trim() || !letterData?.id) return;

			try {
				let updatedDonation: CharitableDonation;

				if (isEditingCharitableDonation && editingDonationIndex !== null) {
					// Update existing donation via API
					const existingDonation = charitableDonations[editingDonationIndex];
					const updateData: UpdateCharitableDonationRequest = {
						charity: newCharityName.trim(),
						description: newCharityDescription.trim() || null,
					};

					updatedDonation =
						await LetterOfWishesService.updateCharitableDonation(
							existingDonation.id,
							updateData
						);

					// Update local state with the response from API
					const updatedDonations = [...charitableDonations];
					updatedDonations[editingDonationIndex] = updatedDonation;
					setCharitableDonations(updatedDonations);

					toast.success("Charitable donation updated successfully");
				} else {
					// Create new donation via API
					const donationData: CreateCharitableDonationRequest = {
						low_id: letterData.id,
						charity: newCharityName.trim(),
						description: newCharityDescription.trim() || null,
					};

					updatedDonation =
						await LetterOfWishesService.createCharitableDonation(donationData);
					const updatedDonations = [...charitableDonations, updatedDonation];
					setCharitableDonations(updatedDonations);

					toast.success("Charitable donation added successfully");
				}

				// Reset form and editing state
				setNewCharityName("");
				setNewCharityDescription("");
				setIsEditingCharitableDonation(false);
				setEditingDonationIndex(null);
				setIsCharitableDonationsModalOpen(false);
			} catch (error) {
				console.error("Error adding/updating charitable donation:", error);
				toast.error("Failed to save charitable donation");
			}
		};

		const removeCharitableDonation = async (index: number) => {
			const donationToDelete = charitableDonations[index];

			try {
				// Delete via API
				await LetterOfWishesService.deleteCharitableDonation(
					donationToDelete.id
				);

				// Update local state
				const updatedDonations = charitableDonations.filter(
					(_, i) => i !== index
				);
				setCharitableDonations(updatedDonations);

				toast.success("Charitable donation deleted successfully");
			} catch (error) {
				console.error("Error deleting charitable donation:", error);
				toast.error("Failed to delete charitable donation");
			}
		};

		// Handle payment and submit
		const handlePayAndSubmit = async () => {
			console.log("🔄 handlePayAndSubmit called");

			if (!willData?.id) {
				toast.error("No will found for payment");
				return;
			}

			setIsProcessingPayment(true);
			try {
				// Save the current letter data before proceeding to payment
				if (setLetterData && letterData) {
					console.log("📝 Saving letter data before payment...");

					// Save instructions to API (both professional_notes and trustee_notes)
					if (letterData.id) {
						try {
							const instructionsData = {
								low_id: letterData.id,
								trustee_notes: trusteeInstructions.trim() || null,
								// Preserve existing professional_notes if they exist
								...(instructions && {
									professional_notes: instructions.professional_notes,
								}),
							};

							await LetterOfWishesService.saveInstructions(instructionsData);
							console.log("✅ Instructions saved successfully");
						} catch (error) {
							console.error("❌ Error saving instructions:", error);
							toast.error("Failed to save instructions. Please try again.");
							return;
						}
					}

					const updatedLetterData = {
						...letterData,
						trusteeInstructions: trusteeInstructions.trim(),
					};

					console.log("📋 Updated letter data:", updatedLetterData);
					setLetterData(updatedLetterData);
				} else {
					console.error(
						"❌ No letter data or setLetterData function available"
					);
					toast.error("No letter data available. Please try again.");
					return;
				}

				// Navigate to Stripe Checkout page for Letter of Wishes
				const paymentUrl = `/app/payment/checkout?willId=${willData.id}&description=Letter of Wishes&source=letter-of-wishes`;
				console.log("🔄 Navigating to Stripe Checkout page:", paymentUrl);
				navigate(paymentUrl);
			} catch (error) {
				console.error("❌ Error in handlePayAndSubmit:", error);
				toast.error("Failed to process payment. Please try again.");
			} finally {
				setIsProcessingPayment(false);
			}
		};

		// Expose the handler and state through ref
		useImperativeHandle(ref, () => ({
			handlePayAndSubmit,
			isProcessingPayment,
		}));

		return (
			<div className="space-y-6 w-full max-w-4xl">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					Instructions & Charitable Donations
				</div>
				<div className="text-muted-foreground">
					Provide instructions for your executors and specify charitable
					donations.
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
					{isLoadingCharitableDonations ? (
						<div className="text-center py-8">
							<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2"></div>
							<p className="text-muted-foreground">
								Loading charitable donations...
							</p>
						</div>
					) : charitableDonations.length > 0 ? (
						<div className="space-y-3">
							{charitableDonations.map((donation, index) => (
								<div
									key={index}
									className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem] relative"
								>
									<div className="flex-1">
										<div className="font-medium text-[0.875rem]">
											{donation.charity}
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
												setNewCharityName(donation.charity);
												setNewCharityDescription(donation.description || "");
												// Set editing state
												setIsEditingCharitableDonation(true);
												setEditingDonationIndex(index);
												setIsCharitableDonationsModalOpen(true);
											}}
											className="absolute top-4 right-22 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
										>
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => removeCharitableDonation(index)}
											className="absolute top-4 right-4 border-[#CCCCCC] bg-[#E5E5E4] rounded-[0.25rem] font-medium"
										>
											Delete
										</Button>
									</div>
								</div>
							))}
						</div>
					) : null}

					{/* Add Charitable Donation Button */}
					{!isLoadingCharitableDonations && (
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
					)}
				</div>

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
			</div>
		);
	});

InstructionsCharitableDonationsStep.displayName =
	"InstructionsCharitableDonationsStep";

export default InstructionsCharitableDonationsStep;
