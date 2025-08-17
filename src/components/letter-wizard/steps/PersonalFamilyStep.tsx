import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { LetterOfWishesService } from "@/services/letterOfWishesService";

const PersonalFamilyStep = () => {
	const { letterData, setLetterData, willData } = useLetterOfWishes();

	// Notes to Loved Ones states
	const [notesToLovedOnes, setNotesToLovedOnes] = useState("");
	const [isLoadingNotes, setIsLoadingNotes] = useState(false);

	// Guardianship states
	const [reasonForChoice, setReasonForChoice] = useState("");
	const [valuesAndHopes, setValuesAndHopes] = useState("");
	const [isGuardianshipModalOpen, setIsGuardianshipModalOpen] = useState(false);

	// Load personal notes from API when component mounts
	useEffect(() => {
		const loadPersonalNotes = async () => {
			if (!letterData?.id) return;

			setIsLoadingNotes(true);
			try {
				const personalNotes = await LetterOfWishesService.getPersonalNotes(
					letterData.id
				);
				if (personalNotes) {
					console.log("📝 Personal notes loaded from API:", personalNotes);

					// Update local state
					setNotesToLovedOnes(personalNotes.notes || "");
					setReasonForChoice(personalNotes.guardian_reason || "");
					setValuesAndHopes(personalNotes.guardian_values || "");

					// Update context with loaded data
					if (setLetterData && letterData) {
						setLetterData({
							...letterData,
							notesToLovedOnes: personalNotes.notes || "",
							guardianshipPreferences: {
								reasonForChoice: personalNotes.guardian_reason || "",
								valuesAndHopes: personalNotes.guardian_values || "",
							},
							personalNotesId: personalNotes.id,
							personalNotesCreatedAt: personalNotes.created_at,
							personalNotesLowId: personalNotes.low_id,
						});
					}
				}
			} catch (error) {
				console.error("❌ Error loading personal notes:", error);
				// Don't show error to user as this is background loading
			} finally {
				setIsLoadingNotes(false);
			}
		};

		loadPersonalNotes();
	}, [letterData?.id, setLetterData]);

	// Get guardians from will data
	const guardians = willData?.guardians || [];
	const formatGuardianNames = () => {
		const names = guardians.map(
			(guardian) => `${guardian.firstName} ${guardian.lastName}`
		);
		if (names.length === 0) return "";
		if (names.length === 1) return names[0];
		if (names.length === 2) return `${names[0]} and ${names[1]}`;
		return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
	};
	const guardianNames = formatGuardianNames();

	const hasGuardianshipPreferences =
		reasonForChoice.trim() ||
		valuesAndHopes.trim() ||
		(letterData?.guardianshipPreferences?.reasonForChoice &&
			letterData.guardianshipPreferences.reasonForChoice.trim()) ||
		(letterData?.guardianshipPreferences?.valuesAndHopes &&
			letterData.guardianshipPreferences.valuesAndHopes.trim());

	const updateNotesToLovedOnes = (notes: string) => {
		setNotesToLovedOnes(notes);
		if (setLetterData && letterData) {
			setLetterData({
				...letterData,
				notesToLovedOnes: notes,
			});
		}
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

	return (
		<div className="space-y-6 w-full max-w-4xl">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Personal & Family Messages
			</div>
			<div className="text-muted-foreground">
				Share your personal thoughts, messages to loved ones, and guidance for
				guardians.
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

				{/* Loading State for Personal Notes */}
				{isLoadingNotes ? (
					<div className="text-center py-8">
						<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2"></div>
						<p className="text-muted-foreground">Loading personal notes...</p>
					</div>
				) : (
					<Textarea
						placeholder="e.g., I love you, thank you for being my family, I'm proud of you, etc."
						value={notesToLovedOnes}
						onChange={(e) => updateNotesToLovedOnes(e.target.value)}
						className="w-full min-h-[120px]"
					/>
				)}
			</div>

			{/* Guardianship Section - Only show if guardians exist */}
			{guardians.length > 0 && (
				<div className="space-y-6">
					<div>
						<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
							Guardianship of Children
						</h6>
						<p className="text-black">
							Your preferred guardians for your children are{" "}
							<span className="font-bold">{guardianNames}</span>
						</p>
					</div>

					{/* Add Guardianship Details Button */}
					{!hasGuardianshipPreferences && !isLoadingNotes && (
						<Button
							onClick={() => setIsGuardianshipModalOpen(true)}
							variant="outline"
							className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
						>
							<Plus className="mr-2 h-5 w-5" />
							Add Guardian Instructions
						</Button>
					)}

					{/* Loading State for Guardianship */}
					{isLoadingNotes && (
						<div className="text-center py-8">
							<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2"></div>
							<p className="text-muted-foreground">
								Loading guardian instructions...
							</p>
						</div>
					)}

					{/* Guardianship Details Summary */}
					{hasGuardianshipPreferences && !isLoadingNotes && (
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

			{/* Submit Button - REMOVED */}
		</div>
	);
};

PersonalFamilyStep.displayName = "PersonalFamilyStep";

export default PersonalFamilyStep;
