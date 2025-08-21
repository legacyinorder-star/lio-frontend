import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { RelationshipSelect } from "@/components/ui/relationship-select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { StepProps } from "../types/will.types";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { useWill } from "@/context/WillContext";
import { useWillData } from "@/hooks/useWillData";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

interface Guardian {
	id: string;
	firstName: string;
	lastName: string;
	relationship: string;
	isPrimary: boolean;
	guardianshipId?: string; // Store the guardianship record ID for API operations
}

interface ApiPersonResponse {
	id: string;
	first_name: string;
	last_name: string;
}

// API response interface for guardianship endpoint
interface GuardianshipApiResponse {
	id: string;
	will_id: string;
	created_at: string;
	is_primary: boolean;
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

// API response interface for pets endpoint
interface PetApiResponse {
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

export default function GuardiansStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: StepProps) {
	const { activeWill, setActiveWill } = useWill();
	const { refetch } = useWillData();
	const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
	const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLoadingGuardians, setIsLoadingGuardians] = useState(false);
	const [hasLoadedGuardians, setHasLoadedGuardians] = useState(false);
	const [guardianForm, setGuardianForm] = useState<Guardian>({
		id: "",
		firstName: "",
		lastName: "",
		relationship: "",
		isPrimary: false,
	});

	// Pet Guardian selection state
	const [guardianSelectDialogOpen, setGuardianSelectDialogOpen] =
		useState(false);
	const [petGuardianId, setPetGuardianId] = useState<string>("");
	const [hasPetsFromAPI, setHasPetsFromAPI] = useState(false);
	const [petIdFromAPI, setPetIdFromAPI] = useState<string>("");

	// Delete confirmation state
	const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
	const [guardianToDelete, setGuardianToDelete] = useState<Guardian | null>(
		null
	);

	const loadPetData = async () => {
		if (!activeWill?.id) return;

		try {
			const { data: petData, error } = await apiClient<PetApiResponse>(
				`/pets/get-by-will/${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error) {
				// If 404, no pet record exists - this is normal
				if (error.includes("404")) {
					console.log("No existing pet record found");
					setHasPetsFromAPI(false);
					return;
				}
				console.error("Error loading pet data:", error);
				setHasPetsFromAPI(false);
				return;
			}

			if (petData && petData.guardian_id) {
				// Pet has a guardian assigned
				setPetGuardianId(petData.guardian_id);
				setHasPetsFromAPI(true);
				setPetIdFromAPI(petData.id);
				// Update form data with the existing pet guardian ID
				onUpdate({ petGuardianId: petData.guardian_id });
				console.log("Found existing pet guardian:", petData.guardian_id);
			} else if (petData) {
				// Pet record exists but no guardian assigned
				setHasPetsFromAPI(true);
				setPetIdFromAPI(petData.id);
			}
		} catch (error) {
			console.error("Error loading pet data:", error);
			setHasPetsFromAPI(false);
		}
	};

	// Load guardians from API when component mounts
	const loadGuardians = async () => {
		if (!activeWill?.id || hasLoadedGuardians) return;

		setIsLoadingGuardians(true);
		try {
			const { data: apiData, error } = await apiClient<
				GuardianshipApiResponse[]
			>(`/guardianship/get-by-will/${activeWill.id}`, {
				method: "GET",
			});

			if (error) {
				// If 404, no guardians exist - this is normal
				if (error.includes("404")) {
					console.log("No existing guardians found");
					setHasLoadedGuardians(true);
					return;
				}
				toast.error("Failed to load guardians");
				return;
			}

			if (apiData && apiData.length > 0) {
				// Filter out guardianships with missing person data
				const loadedGuardians: Guardian[] = apiData
					.filter((guardianship) => guardianship.person)
					.map((guardianship) => ({
						id: guardianship.person.id,
						firstName: guardianship.person.first_name,
						lastName: guardianship.person.last_name,
						relationship:
							getFormattedRelationshipNameById(
								guardianship.person.relationship_id
							) || guardianship.person.relationship_id,
						isPrimary: guardianship.is_primary,
						guardianshipId: guardianship.id, // Store guardianship record ID
					}));

				onUpdate({ guardians: loadedGuardians });
				updateActiveWillGuardians(loadedGuardians);
				console.log("Loaded guardians:", loadedGuardians);
			}

			setHasLoadedGuardians(true);
		} catch (err) {
			console.error("Error loading guardians:", err);
			toast.error("Failed to load guardians");
		} finally {
			setIsLoadingGuardians(false);
		}
	};

	// Load guardians when component mounts or activeWill changes
	useEffect(() => {
		loadGuardians();
	}, [activeWill?.id]);

	// Initialize petGuardianId from form data when component mounts
	useEffect(() => {
		if (data.petGuardianId) {
			setPetGuardianId(data.petGuardianId);
		}
	}, [data.petGuardianId]);

	useEffect(() => {
		loadPetData();
	}, [activeWill?.id]);

	// Initialize petGuardianId from form data when component mounts (fallback)
	useEffect(() => {
		if (data.petGuardianId && !petGuardianId) {
			setPetGuardianId(data.petGuardianId);
		}
	}, [data.petGuardianId, petGuardianId]);

	// Update active will when guardians state changes
	const updateActiveWillGuardians = (newGuardians: Guardian[]) => {
		if (activeWill) {
			setActiveWill({
				...activeWill,
				guardians: newGuardians,
			});
		}
	};

	const handleGuardianFormChange =
		(field: keyof Guardian) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setGuardianForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleSelectGuardian = (guardianId: string) => {
		setPetGuardianId(guardianId);
		// Update the form data with the selected pet guardian ID
		onUpdate({ petGuardianId: guardianId });
		setGuardianSelectDialogOpen(false);
	};

	const getGuardianName = (guardianId: string) => {
		const guardian = data.guardians?.find((g) => g.id === guardianId);
		return guardian
			? `${guardian.firstName} ${guardian.lastName}`
			: "Unknown Guardian";
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
			if (editingGuardian) {
				// Editing existing guardian - send PATCH requests

				// First update the person record
				const { error: personError } = await apiClient<ApiPersonResponse>(
					`/people/${editingGuardian.id}`,
					{
						method: "PATCH",
						body: JSON.stringify({
							first_name: guardianForm.firstName,
							last_name: guardianForm.lastName,
						}),
					}
				);

				if (personError) {
					toast.error("Failed to update guardian information");
					return;
				}

				// Then update the guardianship record using guardianshipId
				if (editingGuardian.guardianshipId) {
					const { error: guardianshipError } = await apiClient(
						`/guardianship/${editingGuardian.guardianshipId}`,
						{
							method: "PATCH",
							body: JSON.stringify({
								is_primary: guardianForm.isPrimary,
							}),
						}
					);

					if (guardianshipError) {
						toast.error("Failed to update guardianship information");
						return;
					}
				}

				// Update local state
				const currentGuardians = data.guardians || [];
				const updatedGuardians = currentGuardians.map((g) =>
					g.id === editingGuardian.id
						? {
								...g,
								firstName: guardianForm.firstName,
								lastName: guardianForm.lastName,
								relationship:
									getFormattedRelationshipNameById(guardianForm.relationship) ||
									guardianForm.relationship,
								isPrimary: guardianForm.isPrimary,
						  }
						: g
				);

				// If this is a primary guardian, ensure no other primary exists
				if (guardianForm.isPrimary) {
					updatedGuardians.forEach((g) => {
						if (g.id !== editingGuardian.id) {
							g.isPrimary = false;
						}
					});
				}

				onUpdate({ guardians: updatedGuardians });
				updateActiveWillGuardians(updatedGuardians);
				toast.success("Guardian updated successfully");

				// Refresh beneficiary lists
				await refetch();
			} else {
				// Creating new guardian - send POST requests

				// First create the guardian person record
				const { data: personData, error: personError } =
					await apiClient<ApiPersonResponse>("/people", {
						method: "POST",
						body: JSON.stringify({
							will_id: activeWill.id,
							first_name: guardianForm.firstName,
							last_name: guardianForm.lastName,
							relationship_id: guardianForm.relationship,
							is_minor: false, // Guardians are never minors
						}),
					});

				if (personError || !personData) {
					toast.error("Failed to save guardian information");
					return;
				}

				// Then create the guardianship record
				const { data: guardianshipData, error: guardianshipError } =
					await apiClient("/guardianship", {
						method: "POST",
						body: JSON.stringify({
							will_id: activeWill.id,
							guardian_id: personData.id,
							is_primary: guardianForm.isPrimary,
						}),
					});

				if (guardianshipError || !guardianshipData) {
					toast.error("Failed to save guardianship information");
					return;
				}

				const newGuardian: Guardian = {
					id: personData.id,
					firstName: personData.first_name,
					lastName: personData.last_name,
					relationship:
						getFormattedRelationshipNameById(guardianForm.relationship) ||
						guardianForm.relationship,
					isPrimary: guardianForm.isPrimary,
				};

				const currentGuardians = data.guardians || [];
				const updatedGuardians = [...currentGuardians, newGuardian];

				// If this is a primary guardian, ensure no other primary exists
				if (guardianForm.isPrimary) {
					updatedGuardians.forEach((g) => {
						if (g.id !== newGuardian.id) {
							g.isPrimary = false;
						}
					});
				}

				onUpdate({ guardians: updatedGuardians });
				updateActiveWillGuardians(updatedGuardians);

				// If this was created from the pet guardian flow, set it as the pet guardian
				if (guardianDialogOpen) {
					setPetGuardianId(newGuardian.id);
					// Update form data with the new pet guardian ID
					onUpdate({ petGuardianId: newGuardian.id });
					setGuardianDialogOpen(false);
				}

				toast.success("Guardian saved successfully");

				// Refresh beneficiary lists
				await refetch();
			}

			// Reset form and close dialog
			setGuardianForm({
				id: "",
				firstName: "",
				lastName: "",
				relationship: "",
				isPrimary: false,
			});
			setEditingGuardian(null);
			setGuardianDialogOpen(false);
		} catch (error) {
			console.error("Error saving guardian:", error);
			toast.error("An error occurred while saving guardian information");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditGuardian = (guardian: Guardian) => {
		setGuardianForm(guardian);
		setEditingGuardian(guardian);
		setGuardianDialogOpen(true);
	};

	const handleRemoveGuardian = (guardian: Guardian) => {
		setGuardianToDelete(guardian);
		setDeleteConfirmDialogOpen(true);
	};

	const handleConfirmDeleteGuardian = async () => {
		if (!activeWill?.id || !guardianToDelete) {
			toast.error("No active will or guardian to delete");
			return;
		}

		setIsDeleting(true);

		try {
			// First delete the guardianship record using guardianshipId
			if (guardianToDelete.guardianshipId) {
				const { error: guardianshipError } = await apiClient(
					`/guardianship/${guardianToDelete.guardianshipId}`,
					{
						method: "DELETE",
					}
				);

				if (guardianshipError) {
					toast.error("Failed to delete guardianship record");
					return;
				}
			}

			// Then delete the person record
			const { error: personError } = await apiClient(
				`/people/${guardianToDelete.id}`,
				{
					method: "DELETE",
				}
			);

			if (personError) {
				toast.error("Failed to delete guardian person record");
				return;
			}

			// Update local state
			const currentGuardians = data.guardians || [];
			const updatedGuardians = currentGuardians.filter(
				(g) => g.id !== guardianToDelete.id
			);
			onUpdate({ guardians: updatedGuardians });
			updateActiveWillGuardians(updatedGuardians);

			// If the deleted guardian was the pet guardian, clear the pet guardian ID
			if (petGuardianId === guardianToDelete.id) {
				setPetGuardianId("");
				onUpdate({ petGuardianId: undefined });
			}

			toast.success("Guardian removed successfully");

			// Refresh beneficiary lists
			await refetch();
		} catch (error) {
			console.error("Error removing guardian:", error);
			toast.error("An error occurred while removing the guardian");
		} finally {
			setIsDeleting(false);
			setDeleteConfirmDialogOpen(false);
			setGuardianToDelete(null);
		}
	};

	const handleCancelDeleteGuardian = () => {
		setDeleteConfirmDialogOpen(false);
		setGuardianToDelete(null);
	};

	const areGuardiansValid = () => {
		const currentGuardians = data.guardians || [];
		const hasValidGuardians =
			currentGuardians.some((g) => g.isPrimary) && currentGuardians.length >= 2;

		// If user has pets, also check that they have a pet guardian
		if (hasPetsFromAPI) {
			return hasValidGuardians && petGuardianId !== "";
		}

		return hasValidGuardians;
	};

	const getValidationErrors = () => {
		const currentGuardians = data.guardians || [];
		const errors: string[] = [];

		if (currentGuardians.length < 2) {
			errors.push("You must appoint at least 2 guardians");
		}

		if (!currentGuardians.some((g) => g.isPrimary)) {
			errors.push("You must appoint 1 primary guardian");
		}

		// If user has pets, check that they have a pet guardian
		if (hasPetsFromAPI && !petGuardianId) {
			errors.push("You must appoint a guardian for your pets");
		}

		return errors;
	};

	// Handle Next button click - update pet guardian if selected
	const handleNext = async () => {
		// If user has pets and has selected a pet guardian, update the pet record
		if (hasPetsFromAPI && petGuardianId && petIdFromAPI) {
			try {
				const { error } = await apiClient(`/pets/${petIdFromAPI}`, {
					method: "PATCH",
					body: JSON.stringify({
						guardian_id: petGuardianId,
					}),
				});

				if (error) {
					console.error("Error updating pet guardian:", error);
					toast.error("Failed to update pet guardian. Please try again.");
					return;
				}

				toast.success("Pet guardian updated successfully");
			} catch (error) {
				console.error("Error updating pet guardian:", error);
				toast.error(
					"An error occurred while updating pet guardian. Please try again."
				);
				return;
			}
		}

		// Proceed to next step
		await onNext();
	};

	const currentGuardians = data.guardians || [];
	const validationErrors = getValidationErrors();

	return (
		<div className="space-y-6">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Guardians for Your Loved Ones
			</div>
			<div className="space-y-4 mb-[2.45rem]">
				<div className="flex items-center gap-2">
					<span
						style={{
							fontSize: "1rem",
							color: "#000",
							fontWeight: 400,
							fontFamily: "TMT Limkin",
						}}
					>
						In the case of your death, who would you like to appoint as
						guardians for your children?
					</span>
				</div>
				<div className="text-[#696868] text-[0.875rem] -mt-4">
					You should pick two different people to be guardians. A primary
					guardian and a backup guardian if, for whatever reason, the primary
					guardian is unable to serve.
				</div>

				{/* Guardians Management Section */}
				<div className="space-y-4 mb-[2.45rem]">
					{/* Guardians List - Only show when there are guardians */}
					{currentGuardians.length > 0 && (
						<div className="mb-6 space-y-4">
							{currentGuardians.map((guardian) => (
								<Card key={guardian.id}>
									<CardContent className="p-4">
										<div className="flex justify-between items-center">
											<div>
												<p className="font-medium">
													{guardian.firstName} {guardian.lastName}
													{guardian.isPrimary && (
														<span className="ml-2 text-sm text-primary">
															(Primary Guardian)
														</span>
													)}
												</p>
												<p className="text-sm text-muted-foreground">
													{guardian.relationship}
												</p>
											</div>
											<div className="flex space-x-2">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => handleEditGuardian(guardian)}
													className="cursor-pointer"
													disabled={isDeleting}
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => handleRemoveGuardian(guardian)}
													className="cursor-pointer"
													disabled={isDeleting}
												>
													{isDeleting ? (
														<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black" />
													) : (
														<Trash2 className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{/* Add Guardian Button - Full width like Add Child */}
					<Dialog
						open={guardianDialogOpen}
						onOpenChange={isSubmitting ? undefined : setGuardianDialogOpen}
					>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								onClick={() => {
									setGuardianForm({
										id: "",
										firstName: "",
										lastName: "",
										relationship: "",
										isPrimary: false,
									});
									setEditingGuardian(null);
								}}
								className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
								disabled={isLoadingGuardians}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Guardian
							</Button>
						</DialogTrigger>
						<DialogContent className="bg-white">
							<DialogHeader>
								<DialogTitle>
									{editingGuardian ? "Edit Guardian" : "Add Guardian"}
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="guardianFirstName">First Name</Label>
										<Input
											id="guardianFirstName"
											value={guardianForm.firstName}
											onChange={handleGuardianFormChange("firstName")}
											placeholder="John"
											disabled={isSubmitting}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="guardianLastName">Last Name</Label>
										<Input
											id="guardianLastName"
											value={guardianForm.lastName}
											onChange={handleGuardianFormChange("lastName")}
											placeholder="Doe"
											disabled={isSubmitting}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<RelationshipSelect
										value={guardianForm.relationship}
										onValueChange={(value) =>
											setGuardianForm((prev) => ({
												...prev,
												relationship: value,
											}))
										}
										label="Relationship"
										required={true}
										excludeRelationships={["spouse"]}
										disabled={isSubmitting}
									/>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="isPrimary"
										checked={guardianForm.isPrimary}
										onCheckedChange={(checked: boolean) =>
											setGuardianForm((prev) => ({
												...prev,
												isPrimary: checked,
											}))
										}
										disabled={isSubmitting}
									/>
									<Label htmlFor="isPrimary" className="text-sm">
										Appoint as Primary Guardian
									</Label>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										onClick={() => setGuardianDialogOpen(false)}
										className="cursor-pointer"
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button
										onClick={handleSaveGuardian}
										className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<>
												<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
												{editingGuardian ? "Updating..." : "Saving..."}
											</>
										) : (
											<>{editingGuardian ? "Update" : "Save"}</>
										)}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{/* Validation Error Messages */}
				{validationErrors.length > 0 && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									Please Fix the Following Issues
								</h3>
								<div className="mt-2 text-sm text-red-700">
									<ul className="space-y-1">
										{validationErrors.map((error, index) => (
											<li key={index} className="flex items-center">
												<span className="mr-2">•</span>
												{error}
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Pet Guardian Section */}
				{hasPetsFromAPI && (
					<div className="space-y-4 mb-[2.45rem]">
						<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
							Pet Guardian
						</div>
						<div className="flex items-center gap-2">
							<span
								style={{
									fontSize: "1rem",
									color: "#000",
									fontWeight: 400,
									fontFamily: "TMT Limkin",
								}}
							>
								Who would you like to appoint as guardian for your pets?
							</span>
						</div>
						<div className="text-[#696868] text-[0.875rem] -mt-4">
							This person will be responsible for taking care of your pets in
							the event of your death.
						</div>

						{/* Pet Guardian Management Section */}
						<div className="space-y-4 mb-[2.45rem]">
							{/* Display Selected Pet Guardian */}
							{petGuardianId && (
								<div className="mb-6 space-y-4">
									<Card>
										<CardContent className="p-4">
											<div className="flex justify-between items-center">
												<div>
													<p className="font-medium">
														{getGuardianName(petGuardianId)}
													</p>
													<p className="text-sm text-muted-foreground">
														Pet Guardian
													</p>
												</div>
												<div className="flex space-x-2">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => setGuardianSelectDialogOpen(true)}
														className="cursor-pointer"
														disabled={isDeleting}
													>
														<Edit2 className="h-4 w-4" />
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => {
															setPetGuardianId("");
															// Clear the pet guardian ID from form data
															onUpdate({ petGuardianId: undefined });
														}}
														className="cursor-pointer"
														disabled={isDeleting}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							)}

							{/* Select Pet Guardian Button - Full width like Add Child */}
							<Button
								variant="outline"
								onClick={() => setGuardianSelectDialogOpen(true)}
								className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
							>
								<Plus className="mr-2 h-4 w-4" />
								Select Pet Guardian
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

							{data.guardians && data.guardians.length > 0 ? (
								<div className="space-y-2">
									<Label>Available Guardians</Label>
									<div className="space-y-2">
										{data.guardians.map((guardian) => (
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
										<Button variant="outline" className="cursor-pointer w-full">
											<Plus className="h-4 w-4 mr-2" />
											Create New Guardian
										</Button>
									</DialogTrigger>
								</Dialog>
							</div>
						</div>
						<div className="flex justify-end space-x-2">
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
						</div>
					</DialogContent>
				</Dialog>

				{/* Create Guardian Modal */}
				<Dialog open={guardianDialogOpen} onOpenChange={setGuardianDialogOpen}>
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
						<div className="flex justify-end space-x-2">
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
						</div>
					</DialogContent>
				</Dialog>

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
								Are you sure you want to remove{" "}
								<strong>
									{guardianToDelete?.firstName} {guardianToDelete?.lastName}
								</strong>{" "}
								as a guardian? This action cannot be undone.
							</div>
						</div>
						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={handleCancelDeleteGuardian}
								disabled={isDeleting}
								className="cursor-pointer"
							>
								Cancel
							</Button>
							<Button
								onClick={handleConfirmDeleteGuardian}
								disabled={isDeleting}
								className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
							>
								{isDeleting ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white mr-2" />
										Deleting...
									</>
								) : (
									"Delete Guardian"
								)}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex justify-between pt-4">
				<Button variant="outline" onClick={onBack} className="cursor-pointer">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<Button
					onClick={async () => await handleNext()}
					disabled={!areGuardiansValid()}
					className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
				>
					Next <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
