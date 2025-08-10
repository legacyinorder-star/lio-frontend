import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { downloadLetterOfWishesPDF } from "@/utils/letterOfWishesDownload";

export default function InstructionsLegacyStep() {
	const { letterData, setLetterData, willData } = useLetterOfWishes();
	const navigate = useNavigate();

	// Charitable donations states
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

	// Trustee instructions states
	const [trusteeInstructions, setTrusteeInstructions] = useState(
		letterData?.trusteeInstructions || ""
	);

	// Payment processing state
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	// Temporary state for form inputs
	const [newCharityName, setNewCharityName] = useState("");
	const [newCharityDescription, setNewCharityDescription] = useState("");

	// Charitable donations handlers
	const addCharitableDonation = () => {
		if (!newCharityName.trim()) return;

		const newDonation = {
			charityName: newCharityName.trim(),
			description: newCharityDescription.trim() || undefined,
		};

		if (isEditingCharitableDonation && editingDonationIndex !== null) {
			const updatedDonations = [...charitableDonations];
			updatedDonations[editingDonationIndex] = newDonation;
			setCharitableDonations(updatedDonations);
		} else {
			setCharitableDonations([...charitableDonations, newDonation]);
		}

		// Update letter data
		if (setLetterData) {
			setLetterData({
				...letterData,
				charitableDonations:
					isEditingCharitableDonation && editingDonationIndex !== null
						? charitableDonations.map((donation, index) =>
								index === editingDonationIndex ? newDonation : donation
						  )
						: [...charitableDonations, newDonation],
			});
		}

		// Reset form
		setNewCharityName("");
		setNewCharityDescription("");
		setIsEditingCharitableDonation(false);
		setEditingDonationIndex(null);
		setIsCharitableDonationsModalOpen(false);
	};

	const removeCharitableDonation = (index: number) => {
		const updatedDonations = charitableDonations.filter((_, i) => i !== index);
		setCharitableDonations(updatedDonations);

		if (setLetterData) {
			setLetterData({
				...letterData,
				charitableDonations: updatedDonations,
			});
		}
	};

	// Trustee instructions handlers
	const updateTrusteeInstructions = (instructions: string) => {
		setTrusteeInstructions(instructions);
		if (setLetterData) {
			setLetterData({
				...letterData,
				trusteeInstructions: instructions,
			});
		}
	};

	// Modal handlers
	const handleCharitableDonationsModalOpen = () => {
		setIsCharitableDonationsModalOpen(true);
	};

	const handleCharitableDonationsModalClose = () => {
		setIsCharitableDonationsModalOpen(false);
		// Reset form and editing state when modal is closed
		setNewCharityName("");
		setNewCharityDescription("");
		setIsEditingCharitableDonation(false);
		setEditingDonationIndex(null);
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
					charitableDonations,
					trusteeInstructions: trusteeInstructions.trim(),
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
				Instructions & Legacy
			</div>
			<div className="text-muted-foreground">
				Provide additional instructions and legacy details to support your will.
			</div>

			{/* Trustee Instructions */}
			<div className="space-y-4">
				<div>
					<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
						Trustee Instructions
					</h6>
					<p className="text-muted-foreground mb-4">
						Provide any specific instructions for your trustees regarding the
						management and distribution of your estate.
					</p>
					<Textarea
						placeholder="e.g., Please ensure my children receive their inheritance in equal portions when they reach 25 years of age..."
						value={trusteeInstructions}
						onChange={(e) => updateTrusteeInstructions(e.target.value)}
						className="w-full min-h-[120px] resize-none"
					/>
				</div>
			</div>

			{/* Charitable Donations */}
			<div className="space-y-4">
				<div>
					<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
						Charitable Donations
					</h6>
					<p className="text-muted-foreground mb-4">
						Specify any charitable organizations or causes you'd like to support
						through your estate.
					</p>
				</div>

				{/* Existing Charitable Donations */}
				{charitableDonations.length > 0 && (
					<div className="space-y-3">
						{charitableDonations.map((donation, index) => (
							<div
								key={index}
								className="flex items-center justify-between bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1rem]"
							>
								<div className="flex-1">
									<div className="font-medium text-[0.875rem]">
										{donation.charityName}
									</div>
									<div className="text-sm text-gray-600">
										Description: {donation.description}
									</div>
								</div>
								<div className="flex gap-2 ml-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setNewCharityName(donation.charityName);
											setNewCharityDescription(donation.description || "");
											setIsEditingCharitableDonation(true);
											setEditingDonationIndex(index);
											handleCharitableDonationsModalOpen();
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
					onClick={handleCharitableDonationsModalOpen}
					variant="outline"
					className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
				>
					<Plus className="mr-2 h-5 w-5" />
					Add Charitable Donation
				</Button>
			</div>

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

			{/* Instructions & Legacy Modal */}
			<Dialog
				open={isCharitableDonationsModalOpen}
				onOpenChange={handleCharitableDonationsModalClose}
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
								onClick={addCharitableDonation}
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
}
