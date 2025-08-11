import { useState, forwardRef, useImperativeHandle } from "react";
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
import { downloadLetterOfWishesPDF } from "@/utils/letterOfWishesDownload";

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

		// Trustee Instructions and Notes to Loved Ones states
		const [trusteeInstructions, setTrusteeInstructions] = useState(
			letterData?.trusteeInstructions || ""
		);

		// Payment states
		const [isProcessingPayment, setIsProcessingPayment] = useState(false);

		// Temporary state for form inputs for adding new charitable donation
		const [newCharityName, setNewCharityName] = useState("");
		const [newCharityDescription, setNewCharityDescription] = useState("");

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
			const updatedDonations = charitableDonations.filter(
				(_, i) => i !== index
			);
			setCharitableDonations(updatedDonations);

			// Update letter data in context
			if (setLetterData && letterData) {
				setLetterData({
					...letterData,
					charitableDonations: updatedDonations,
				});
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
				// First, save the current letter data
				if (setLetterData && letterData) {
					console.log("📝 Preparing letter data for PDF generation...");

					const updatedLetterData = {
						...letterData,
						trusteeInstructions: trusteeInstructions.trim(),
						charitableDonations,
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
						willData,
						willOwnerName
					);
					console.log("📄 PDF generation result:", pdfResult);

					if (!pdfResult) {
						console.error("❌ PDF generation failed");
						toast.error("Failed to generate PDF. Please try again.");
						return;
					}
				} else {
					console.error(
						"❌ No letter data or setLetterData function available"
					);
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
					{charitableDonations.length > 0 && (
						<div className="space-y-3">
							{charitableDonations.map((donation, index) => (
								<div
									key={index}
									className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem] relative"
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
