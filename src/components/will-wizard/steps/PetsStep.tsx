import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { StepProps, Guardian } from "../types/will.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { RelationshipSelect } from "@/components/ui/relationship-select";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { useWill } from "@/context/WillContext";
import { useWillData } from "@/hooks/useWillData";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

interface PetsStepProps extends StepProps {
	guardians: Guardian[];
}

interface ApiPersonResponse {
	id: string;
	first_name: string;
	last_name: string;
}

interface PetGuardianApiResponse {
	id: string;
	created_at: string;
	user_id: string;
	will_id: string;
	guardian_id: string;
	person: {
		id: string;
		user_id: string;
		will_id: string;
		relationship_id: string;
		first_name: string;
		last_name: string;
		is_minor: boolean;
		created_at: string;
		is_witness: boolean;
	};
}

interface PetRecordResponse {
	id: string;
	will_id: string;
	guardian_id: string;
	created_at: string;
}

export default function PetsStep({
	data,
	onUpdate,
	onNext,
	onBack,
	guardians,
}: PetsStepProps) {
	const { activeWill, setActiveWill } = useWill();
	const { refetch } = useWillData();
	const [hasPets, setHasPets] = useState(data.hasPets || false);
	const [petGuardianId, setPetGuardianId] = useState<string>(
		data.petGuardianId || ""
	);
	const [guardianSelectDialogOpen, setGuardianSelectDialogOpen] =
		useState(false);
	const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [existingPetRecordId, setExistingPetRecordId] = useState<string | null>(
		null
	);
	const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [guardianForm, setGuardianForm] = useState<Guardian>({
		id: "",
		firstName: "",
		lastName: "",
		relationship: "",
		isPrimary: false,
	});

	// Load pet data when component mounts
	useEffect(() => {
		const loadPetData = async () => {
			if (!activeWill?.id) return;

			try {
				const { data: petData, error } =
					await apiClient<PetGuardianApiResponse>(
						`/pets/get-by-will/${activeWill.id}`
					);

				if (error) {
					// If no pet data exists, that's fine - user hasn't set up pets yet
					console.log("No existing pet data found");
					setExistingPetRecordId(null);
					return;
				}

				if (petData) {
					setHasPets(true);
					setPetGuardianId(petData.guardian_id);
					setExistingPetRecordId(petData.id);
				}
			} catch (error) {
				console.error("Error loading pet data:", error);
				// Don't show error toast as this is initial loading and absence of data is normal
				setExistingPetRecordId(null);
			}
		};

		loadPetData();
	}, [activeWill?.id]);

	useEffect(() => {
		if (data.hasPets !== undefined) {
			setHasPets(data.hasPets);
		}
		if (data.petGuardianId) {
			setPetGuardianId(data.petGuardianId);
		}
	}, [data.hasPets, data.petGuardianId]);

	const handleGuardianFormChange =
		(field: keyof Guardian) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setGuardianForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleSaveGuardian = async () => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		if (
			!guardianForm.firstName ||
			!guardianForm.lastName ||
			!guardianForm.relationship
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsSubmitting(true);

		try {
			// Create the guardian person record
			const { data: personData, error: personError } =
				await apiClient<ApiPersonResponse>("/people", {
					method: "POST",
					body: JSON.stringify({
						will_id: activeWill.id,
						first_name: guardianForm.firstName,
						last_name: guardianForm.lastName,
						relationship_id: guardianForm.relationship,
						is_minor: false,
					}),
				});

			if (personError || !personData) {
				toast.error("Failed to save guardian information");
				return;
			}

			const newGuardian: Guardian = {
				id: personData.id,
				firstName: personData.first_name,
				lastName: personData.last_name,
				relationship:
					getFormattedRelationshipNameById(guardianForm.relationship) ||
					guardianForm.relationship,
				isPrimary: false,
			};

			// Update the guardians in the form data
			const updatedGuardians = [...guardians, newGuardian];
			onUpdate({ guardians: updatedGuardians });

			// Update active will guardians
			if (activeWill) {
				setActiveWill({
					...activeWill,
					guardians: updatedGuardians,
				});
			}

			// Set this new guardian as the pet guardian
			setPetGuardianId(newGuardian.id);

			toast.success("Guardian created successfully");
			await refetch();

			// Reset form and close dialog
			setGuardianForm({
				id: "",
				firstName: "",
				lastName: "",
				relationship: "",
				isPrimary: false,
			});
			setGuardianDialogOpen(false);
			setGuardianSelectDialogOpen(false);
		} catch (error) {
			console.error("Error saving guardian:", error);
			toast.error("An error occurred while saving guardian information");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSelectGuardian = (guardianId: string) => {
		setPetGuardianId(guardianId);
		setGuardianSelectDialogOpen(false);
	};

	const handleNoClick = () => {
		// If there's an existing pet record, show confirmation dialog
		if (existingPetRecordId) {
			setDeleteConfirmDialogOpen(true);
		} else {
			// No existing record, just update state
			setHasPets(false);
			setPetGuardianId("");
		}
	};

	const handleConfirmDelete = async () => {
		if (!existingPetRecordId) return;

		setIsDeleting(true);
		try {
			const { error } = await apiClient(`/pets/${existingPetRecordId}`, {
				method: "DELETE",
			});

			if (error) {
				toast.error("Failed to remove pet guardian information");
				return;
			}

			// Successfully deleted, update state
			setHasPets(false);
			setPetGuardianId("");
			setExistingPetRecordId(null);
			setDeleteConfirmDialogOpen(false);
			toast.success("Pet guardian information removed");
		} catch (error) {
			console.error("Error deleting pet data:", error);
			toast.error("An error occurred while removing pet information");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCancelDelete = () => {
		setDeleteConfirmDialogOpen(false);
	};

	const handleNext = async () => {
		const petData = {
			hasPets,
			pets: [], // Empty array since we're not tracking individual pets
			petGuardianId: hasPets ? petGuardianId : undefined,
		};
		onUpdate(petData);

		// If user has pets, save the pet guardian information
		if (hasPets && petGuardianId && activeWill?.id) {
			try {
				const requestBody = {
					will_id: activeWill.id,
					guardian_id: petGuardianId,
				};

				if (existingPetRecordId) {
					// PATCH existing record
					const { error } = await apiClient(`/pets/${existingPetRecordId}`, {
						method: "PATCH",
						body: JSON.stringify(requestBody),
					});

					if (error) {
						console.error("PATCH error:", error);
						toast.error(
							"Failed to update pet guardian information. Please try again."
						);
						// Don't return - allow navigation to continue
					} else {
						toast.success("Pet guardian information updated successfully");
					}
				} else {
					// POST new record
					const { data: petRecord, error } = await apiClient<PetRecordResponse>(
						"/pets",
						{
							method: "POST",
							body: JSON.stringify(requestBody),
						}
					);

					if (error) {
						console.error("POST error:", error);
						toast.error(
							"Failed to save pet guardian information. Please try again."
						);
						// Don't return - allow navigation to continue
					} else {
						toast.success("Pet guardian information saved successfully");
						// Store the new record ID for future updates
						if (petRecord?.id) {
							setExistingPetRecordId(petRecord.id);
						}
					}
				}
			} catch (error) {
				console.error("Error saving pet data:", error);
				toast.error(
					"An error occurred while saving pet information. Please try again."
				);
				// Don't return - allow navigation to continue
			}
		}

		// Always proceed to next step, even if API call failed
		onNext();
	};

	const getGuardianName = (guardianId: string) => {
		const guardian = guardians.find((g) => g.id === guardianId);
		return guardian
			? `${guardian.firstName} ${guardian.lastName}`
			: "Unknown Guardian";
	};

	const canProceed = () => {
		if (!hasPets) return true;
		return petGuardianId !== "";
	};

	return (
		<div className="space-y-6 w-full max-w-4xl mx-auto">
			<div className="text-[2rem] font-medium text-black">
				Do you have pets?
			</div>
			<div className="text-muted-foreground">
				If you have pets, you can designate a guardian to care for them. This
				person should be someone you trust who has agreed to take care of your
				pets.
			</div>

			<div className="flex space-x-4 mt-4">
				<Button
					variant="outline"
					onClick={handleNoClick}
					className={`cursor-pointer ${
						!hasPets ? "bg-primary text-white border-primary" : ""
					}`}
				>
					No
				</Button>
				<Button
					variant="outline"
					onClick={() => {
						setHasPets(true);
						setGuardianSelectDialogOpen(true);
					}}
					className={`cursor-pointer ${
						hasPets ? "bg-primary text-white border-primary" : ""
					}`}
				>
					Yes
				</Button>
			</div>

			{hasPets && (
				<div className="space-y-6">
					{petGuardianId && (
						<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-green-800">
										<strong>{getGuardianName(petGuardianId)}</strong> will be
										responsible for caring for your pets.
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setGuardianSelectDialogOpen(true)}
									className="cursor-pointer"
								>
									Change Guardian
								</Button>
							</div>
						</div>
					)}

					{/* Guardian Selection Modal */}
					<Dialog
						open={guardianSelectDialogOpen}
						onOpenChange={setGuardianSelectDialogOpen}
					>
						<DialogContent className="bg-white max-w-2xl">
							<DialogHeader>
								<DialogTitle>Select Pet Guardian</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="text-sm text-muted-foreground">
									Choose who will take care of your pets, or create a new
									guardian.
								</div>

								{guardians.length > 0 ? (
									<div className="space-y-2">
										<Label>Available Guardians</Label>
										<div className="space-y-2">
											{guardians.map((guardian) => (
												<div
													key={guardian.id}
													className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
														petGuardianId === guardian.id
															? "border-primary bg-primary/5"
															: "border-gray-200"
													}`}
													onClick={() => handleSelectGuardian(guardian.id)}
												>
													<div className="flex items-center justify-between">
														<div>
															<p className="font-medium">
																{guardian.firstName} {guardian.lastName}
															</p>
															<p className="text-sm text-muted-foreground">
																{guardian.relationship}
															</p>
														</div>
														{petGuardianId === guardian.id && (
															<div className="text-primary text-sm font-medium">
																Selected
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="text-sm text-muted-foreground p-4 bg-gray-50 rounded-lg">
										No guardians available. Create a new guardian to assign as
										your pet guardian.
									</div>
								)}

								<div className="border-t pt-4">
									<Dialog
										open={guardianDialogOpen}
										onOpenChange={setGuardianDialogOpen}
									>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												className="cursor-pointer w-full"
											>
												<Plus className="h-4 w-4 mr-2" />
												Create New Guardian
											</Button>
										</DialogTrigger>
									</Dialog>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setGuardianSelectDialogOpen(false)}
									className="cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									onClick={() => setGuardianSelectDialogOpen(false)}
									disabled={!petGuardianId}
									className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
								>
									Confirm Selection
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Create Guardian Modal */}
					<Dialog
						open={guardianDialogOpen}
						onOpenChange={setGuardianDialogOpen}
					>
						<DialogContent className="bg-white max-w-2xl">
							<DialogHeader>
								<DialogTitle>Create New Guardian</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="guardianFirstName">First Name</Label>
										<Input
											id="guardianFirstName"
											value={guardianForm.firstName}
											onChange={handleGuardianFormChange("firstName")}
											placeholder="First name"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="guardianLastName">Last Name</Label>
										<Input
											id="guardianLastName"
											value={guardianForm.lastName}
											onChange={handleGuardianFormChange("lastName")}
											placeholder="Last name"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="guardianRelationship">Relationship</Label>
									<RelationshipSelect
										value={guardianForm.relationship}
										onValueChange={(value) =>
											setGuardianForm((prev) => ({
												...prev,
												relationship: value,
											}))
										}
										placeholder="Select relationship"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setGuardianDialogOpen(false)}
									disabled={isSubmitting}
									className="cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									onClick={handleSaveGuardian}
									disabled={
										isSubmitting ||
										!guardianForm.firstName ||
										!guardianForm.lastName ||
										!guardianForm.relationship
									}
									className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
								>
									{isSubmitting ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
											Creating...
										</>
									) : (
										"Create Guardian"
									)}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{!petGuardianId && (
						<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
							<div className="text-yellow-800 font-medium">
								Guardian Required
							</div>
							<div className="text-yellow-700 text-sm mt-1">
								Please select or create a guardian for your pets before
								proceeding.
							</div>
						</div>
					)}
				</div>
			)}

			<div className="flex justify-between pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					className="cursor-pointer"
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<Button
					onClick={handleNext}
					className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
					disabled={!canProceed()}
				>
					Next <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteConfirmDialogOpen}
				onOpenChange={setDeleteConfirmDialogOpen}
			>
				<DialogContent className="bg-white max-w-2xl">
					<DialogHeader>
						<DialogTitle>Confirm Delete</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="text-sm text-muted-foreground">
							Are you sure you want to remove this pet guardian?
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={handleCancelDelete}
							disabled={isDeleting}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmDelete}
							disabled={isDeleting}
							className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
						>
							{isDeleting ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
