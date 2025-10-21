import { useState, useEffect, useMemo } from "react";
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

// Complete Will Data interface from /wills/{will_id}/get-full-will API
interface CompleteWillData {
	id: string;
	created_at: string;
	user_id: string;
	status: string;
	last_updated_at: string;
	payment_status: string;
	owner: {
		id: string;
		will_id: string;
		created_at: string;
		first_name: string;
		middle_name?: string;
		last_name: string;
		date_of_birth?: string;
		marital_status: string;
		address: string;
		city: string;
		state: string;
		post_code: string;
		country: string;
	};
	spouse?: {
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
	children: Array<{
		id: string;
		user_id: string;
		will_id: string;
		relationship_id: string;
		first_name: string;
		last_name: string;
		is_minor: boolean;
		created_at: string;
		is_witness: boolean;
	}>;
	guardians: Array<{
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
	}>;
	pets_guardian?: {
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
	};
}

// API response interface for pet record creation
interface PetRecordResponse {
	id: string;
	will_id: string;
	guardian_id: string;
	created_at: string;
}

// Updated props interface
interface GuardiansStepProps {
	willId: string;
	hasPets: boolean;
	onNext: () => void;
	onBack: () => void;
	onUpdate: (
		updates: Partial<{ guardians: Guardian[]; petGuardianId?: string }>
	) => void;
}

export default function GuardiansStep({
	willId,
	hasPets,
	onUpdate,
	onNext,
	onBack,
}: GuardiansStepProps) {
	const { activeWill, setActiveWill } = useWill();
	const { refetch } = useWillData();

	// State for will data from API
	const [willData, setWillData] = useState<CompleteWillData | null>(null);
	const [loading, setLoading] = useState(true);

	// UI state
	const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
	const [createGuardianDialogOpen, setCreateGuardianDialogOpen] =
		useState(false);
	const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
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

	// Delete confirmation state
	const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
	const [guardianToDelete, setGuardianToDelete] = useState<Guardian | null>(
		null
	);

	// Derive state from API data
	const hasMinorChildren = useMemo(
		() => willData?.children?.some((child) => child.is_minor) || false,
		[willData?.children]
	);

	const guardians = useMemo(
		() =>
			willData?.guardians?.map((guardian) => ({
				id: guardian.person.id,
				firstName: guardian.person.first_name,
				lastName: guardian.person.last_name,
				relationship:
					getFormattedRelationshipNameById(guardian.person.relationship_id) ||
					guardian.person.relationship_id,
				isPrimary: guardian.is_primary,
				guardianshipId: guardian.will_id, // Using will_id as guardianship ID for now
			})) || [],
		[willData?.guardians]
	);

	const petGuardianFromAPI = useMemo(
		() =>
			willData?.pets_guardian?.person
				? {
						id: willData.pets_guardian.person.id,
						firstName: willData.pets_guardian.person.first_name,
						lastName: willData.pets_guardian.person.last_name,
						relationship:
							getFormattedRelationshipNameById(
								willData.pets_guardian.person.relationship_id
							) || willData.pets_guardian.person.relationship_id,
				  }
				: null,
		[willData?.pets_guardian]
	);

	// Load will data from API when component mounts
	useEffect(() => {
		const loadWillData = async () => {
			if (!willId) return;

			setLoading(true);
			try {
				const { data, error } = await apiClient<CompleteWillData>(
					`/wills/${willId}/get-full-will`
				);
				if (error) {
					console.error("Error loading will data:", error);
					toast.error("Failed to load will data");
					return;
				}
				setWillData(data);
				console.log("Loaded will data:", data);
			} catch (err) {
				console.error("Error loading will data:", err);
				toast.error("Failed to load will data");
			} finally {
				setLoading(false);
			}
		};

		loadWillData();
	}, [willId]);

	// Initialize pet guardian ID when API data loads
	useEffect(() => {
		if (petGuardianFromAPI) {
			setPetGuardianId(petGuardianFromAPI.id);
		}
	}, [petGuardianFromAPI]);

	// Update active will when guardians state changes
	const updateActiveWillGuardians = (newGuardians: Guardian[]) => {
		if (activeWill) {
			setActiveWill({
				...activeWill,
				guardians: newGuardians,
			});
		}
	};

	const resetGuardianForm = () => {
		setGuardianForm({
			id: "",
			firstName: "",
			lastName: "",
			relationship: "",
			isPrimary: false,
		});
		setEditingGuardian(null);
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
		const guardian = guardians.find((g) => g.id === guardianId);
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
				const updatedGuardians = guardians.map((g) =>
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
				// Creating new guardian - send POST requests with proper error handling
				let createdPersonId: string | null = null;

				try {
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

					createdPersonId = personData.id;

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
						// Rollback: Delete the created person record
						if (createdPersonId) {
							await apiClient(`/people/${createdPersonId}`, {
								method: "DELETE",
							});
						}
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

					const updatedGuardians = [...guardians, newGuardian];

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
					if (createGuardianDialogOpen) {
						setPetGuardianId(newGuardian.id);
						// Update form data with the new pet guardian ID
						onUpdate({ petGuardianId: newGuardian.id });
						setCreateGuardianDialogOpen(false);
					}

					toast.success("Guardian saved successfully");

					// Refresh beneficiary lists
					await refetch();
				} catch (error) {
					// Rollback: Delete the created person record if it exists
					if (createdPersonId) {
						try {
							await apiClient(`/people/${createdPersonId}`, {
								method: "DELETE",
							});
						} catch (rollbackError) {
							console.error(
								"Failed to rollback created person:",
								rollbackError
							);
						}
					}
					throw error; // Re-throw to be caught by outer catch
				}
			}

			// Reset form and close dialogs
			resetGuardianForm();
			setGuardianDialogOpen(false);
			setCreateGuardianDialogOpen(false);
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
			const updatedGuardians = guardians.filter(
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
		// If user has minor children, validate child guardians
		if (hasMinorChildren) {
			const hasValidGuardians =
				guardians.some((g) => g.isPrimary) && guardians.length >= 2;

			// If user also has pets, check pet guardian
			if (hasPets) {
				return hasValidGuardians && petGuardianId !== "";
			}

			return hasValidGuardians;
		}

		// If no minor children but has pets, only validate pet guardian
		if (hasPets) {
			return petGuardianId !== "";
		}

		// No validation needed if no children or pets (shouldn't reach this step)
		return true;
	};

	const getValidationErrors = () => {
		const errors: string[] = [];

		// Only validate child guardians if there are minor children
		if (hasMinorChildren) {
			if (guardians.length < 2) {
				errors.push("You must appoint at least 2 guardians for your children");
			}

			if (!guardians.some((g) => g.isPrimary)) {
				errors.push("You must appoint 1 primary guardian for your children");
			}
		}

		// If user has pets, check that they have a pet guardian
		if (hasPets && !petGuardianId) {
			errors.push("You must appoint a guardian for your pets");
		}

		return errors;
	};

	// Handle Next button click - update pet guardian if selected
	const handleNext = async () => {
		// If user has pets and has selected a pet guardian, create or update the pet record
		if (hasPets && petGuardianId && willId) {
			try {
				const requestBody = {
					will_id: willId,
					guardian_id: petGuardianId,
				};

				if (willData?.pets_guardian?.id) {
					// PATCH existing record
					const { error } = await apiClient(
						`/pets/${willData.pets_guardian.id}`,
						{
							method: "PATCH",
							body: JSON.stringify(requestBody),
						}
					);

					if (error) {
						console.error("Error updating pet guardian:", error);
						toast.error("Failed to update pet guardian. Please try again.");
						return;
					}

					toast.success("Pet guardian updated successfully");
				} else {
					// POST new record
					const { error } = await apiClient<PetRecordResponse>("/pets", {
						method: "POST",
						body: JSON.stringify(requestBody),
					});

					if (error) {
						console.error("Error creating pet guardian record:", error);
						toast.error("Failed to save pet guardian. Please try again.");
						return;
					}

					toast.success("Pet guardian saved successfully");
				}
			} catch (error) {
				console.error("Error saving pet guardian:", error);
				toast.error(
					"An error occurred while saving pet guardian. Please try again."
				);
				return;
			}
		}

		// Proceed to next step
		await onNext();
	};

	const validationErrors = getValidationErrors();

	// Show loading state
	if (loading) {
		return (
			<div className="space-y-6">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					Guardians for Your Loved Ones
				</div>
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading guardians data...</p>
					</div>
				</div>
			</div>
		);
	}

	// Debug render
	console.log("🎨 GuardiansStep rendering:", {
		hasChildren: !!willData?.children,
		childrenCount: willData?.children?.length,
		hasMinorChildren,
		hasPets,
		guardians: guardians.length,
	});

	return (
		<div className="space-y-6">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Guardians for Your Loved Ones
			</div>

			{/* Children Guardians Section - Only show if user has minor children */}
			{hasMinorChildren && (
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
						Guardians are only needed if there are no parents with legal
						responsibility still alive.
					</div>
					<div className="text-[#696868] text-[0.875rem] -mt-2">
						You should pick two different people to be guardians. A primary
						guardian and a backup guardian if, for whatever reason, the primary
						guardian is unable to step in.
					</div>

					{/* Guardians Management Section */}
					<div className="space-y-4 mb-[2.45rem]">
						{/* Guardians List - Only show when there are guardians */}
						{guardians.length > 0 && (
							<div className="mb-6 space-y-4">
								{guardians.map((guardian) => (
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
							onOpenChange={(open) => {
								if (!isSubmitting) {
									setGuardianDialogOpen(open);
									if (!open) {
										resetGuardianForm();
									}
								}
							}}
						>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									onClick={resetGuardianForm}
									className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
									disabled={loading}
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
											onClick={() => {
												setGuardianDialogOpen(false);
												resetGuardianForm();
											}}
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
				</div>
			)}

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
			{hasPets && (
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
						This person will be responsible for taking care of your pets in the
						event of your death.
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
							Choose who will take care of your pets, or create a new guardian.
						</div>

						{guardians && guardians.length > 0 ? (
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
								No guardians available. Create a new guardian to assign as your
								pet guardian.
							</div>
						)}

						<div className="border-t pt-4">
							<Dialog
								open={createGuardianDialogOpen}
								onOpenChange={(open) => {
									setCreateGuardianDialogOpen(open);
									if (!open) {
										resetGuardianForm();
									}
								}}
							>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										className="cursor-pointer w-full"
										onClick={resetGuardianForm}
									>
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
			<Dialog
				open={createGuardianDialogOpen}
				onOpenChange={(open) => {
					setCreateGuardianDialogOpen(open);
					if (!open) {
						resetGuardianForm();
					}
				}}
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
									disabled={isSubmitting}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="guardianLastName">Last Name</Label>
								<Input
									id="guardianLastName"
									value={guardianForm.lastName}
									onChange={handleGuardianFormChange("lastName")}
									placeholder="Last name"
									disabled={isSubmitting}
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
								disabled={isSubmitting}
							/>
						</div>
					</div>
					<div className="flex justify-end space-x-2">
						<Button
							variant="outline"
							onClick={() => {
								setCreateGuardianDialogOpen(false);
								resetGuardianForm();
							}}
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
