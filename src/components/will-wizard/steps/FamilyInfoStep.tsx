import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SpouseDialog, { SpouseData } from "../SpouseDialog";
import { ArrowLeft, ArrowRight, Edit2, User, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRelationships } from "@/hooks/useRelationships";
import { useWillData } from "@/hooks/useWillData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/utils/apiClient";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Child } from "../types/will.types";
import { useWill } from "@/context/WillContext";

const familyInfoSchema = z.object({
	hasSpouse: z.boolean(),
	hasChildren: z.boolean(),
});

interface FamilyInfoStepProps {
	onNext: (data: {
		hasSpouse: boolean;
		spouse?: SpouseData;
		hasChildren: boolean;
		children?: Child[];
		hasPets: boolean;
		petId?: string;
	}) => void;
	onBack: () => void;
	initialData?: {
		hasSpouse: boolean;
		spouse?: SpouseData;
		hasChildren: boolean;
		children?: Child[];
		hasPets?: boolean;
	};
	willOwnerData?: {
		maritalStatus: string;
	} | null;
	spouseData?: {
		id: string;
		firstName: string;
		lastName: string;
	} | null;
	onSpouseDataSave?: (data: SpouseData) => Promise<boolean>;
	isLoadingOwnerData?: boolean;
}

interface PersonResponse {
	id: string;
	will_id: string;
	first_name: string;
	last_name: string;
	relationship_id: string;
	is_minor: boolean;
	created_at: string;
}

interface ChildApiResponse {
	id: string;
	user_id: string;
	will_id: string;
	relationship_id: string;
	first_name: string;
	last_name: string;
	is_minor: boolean;
	created_at: string;
	is_witness: boolean;
}

export default function FamilyInfoStep({
	onNext,
	onBack,
	initialData,
	willOwnerData,
	spouseData,
	onSpouseDataSave,
	isLoadingOwnerData,
}: FamilyInfoStepProps) {
	const { activeWill, setActiveWill } = useWill();
	const { relationships, isLoading: relationshipsLoading } = useRelationships();
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const { refetch } = useWillData();

	// ✅ ADDED: Local state to show spouse data immediately after save
	const [localSpouseData, setLocalSpouseData] = useState<{
		id?: string;
		firstName: string;
		lastName: string;
	} | null>(spouseData || null);

	// ✅ ADDED: Flag to track when we've just deleted a spouse
	const [justDeletedSpouse, setJustDeletedSpouse] = useState(false);

	// ✅ ADDED: Store spouse data for deletion to prevent it from being cleared
	const [spouseToDelete, setSpouseToDelete] = useState<{
		id?: string;
		firstName: string;
		lastName: string;
	} | null>(null);

	// ✅ ADDED: Children state and functionality
	const [hasChildren, setHasChildren] = useState(
		initialData?.hasChildren ?? false
	);
	const [children, setChildren] = useState<Child[]>(
		initialData?.children ?? []
	);

	// ✅ ADDED: Pets state (simple yes/no)
	const [hasPets, setHasPets] = useState(initialData?.hasPets ?? false);
	const [petId, setPetId] = useState<string | null>(null);
	const [initialHasPets, setInitialHasPets] = useState(
		initialData?.hasPets ?? false
	);
	const [childDialogOpen, setChildDialogOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<Child | null>(null);
	const [childForm, setChildForm] = useState<Omit<Child, "id">>({
		firstName: "",
		lastName: "",
		isMinor: false,
	});
	const [isLoadingChildren, setIsLoadingChildren] = useState(false);
	const [deleteChildDialogOpen, setDeleteChildDialogOpen] = useState(false);
	const [childToDelete, setChildToDelete] = useState<Child | null>(null);

	// Determine if has spouse based on marital status or existing spouse data
	const hasSpouseFromData =
		willOwnerData?.maritalStatus === "married" || !!spouseData;

	const form = useForm<z.infer<typeof familyInfoSchema>>({
		resolver: zodResolver(familyInfoSchema),
		defaultValues: {
			hasSpouse: hasSpouseFromData || initialData?.hasSpouse || false,
			hasChildren: initialData?.hasChildren || false,
		},
	});

	const loadExistingPets = async (willId: string) => {
		try {
			const { data, error } = await apiClient<{ id: string }>(
				`/pets/get-by-will/${willId}`
			);

			if (error) {
				// If 404, no pets exist - this is normal
				if (error.includes("404")) {
					console.log("No existing pets found");
					setHasPets(false);
					setInitialHasPets(false);
					return;
				}
				console.error("Error loading existing pets:", error);
				return;
			}

			if (data) {
				// User has pets
				setHasPets(true);
				setInitialHasPets(true);
				setPetId(data.id);
				console.log("Found existing pets, pet ID:", data.id);
			} else {
				// No pets found
				setHasPets(false);
				setInitialHasPets(false);
			}
		} catch (error) {
			console.error("Error loading existing pets:", error);
		}
	};

	// ✅ UPDATED: Enhanced sync logic that respects deletion state
	useEffect(() => {
		const hasSpouse = hasSpouseFromData || initialData?.hasSpouse || false;
		form.setValue("hasSpouse", hasSpouse);
		form.setValue("hasChildren", hasChildren);

		// Only update local state if we haven't just deleted a spouse
		// This prevents stale parent data from re-populating after deletion
		if (spouseData && !justDeletedSpouse) {
			setLocalSpouseData(spouseData);
		}
	}, [
		willOwnerData,
		spouseData,
		initialData,
		hasSpouseFromData,
		form,
		justDeletedSpouse,
		hasChildren,
	]);

	// ✅ ADDED: Effect to sync form state when localSpouseData changes
	useEffect(() => {
		// Update form state based on whether we have spouse data
		const hasSpouse = !!localSpouseData;
		form.setValue("hasSpouse", hasSpouse);
	}, [localSpouseData, form]);

	// ✅ ADDED: Load children from API when component mounts
	const loadChildren = async (willId: string) => {
		setIsLoadingChildren(true);
		try {
			const { data, error } = await apiClient<ChildApiResponse[]>(
				`/people/children/get-by-will/${willId}`
			);

			if (error) {
				console.error("Error loading children:", error);
				return;
			}

			if (data && data.length > 0) {
				// Transform API data to component format
				const transformedChildren: Child[] = data.map((child) => ({
					id: child.id,
					firstName: child.first_name,
					lastName: child.last_name,
					isMinor: child.is_minor,
				}));

				setChildren(transformedChildren);
				setHasChildren(true);
				form.setValue("hasChildren", true);

				// Update active will context with loaded children
				updateActiveWillChildren(transformedChildren);
			} else {
				// No children found, check initialData as fallback
				if (initialData?.children && initialData.children.length > 0) {
					setChildren(initialData.children);
					setHasChildren(initialData.hasChildren);
					form.setValue("hasChildren", initialData.hasChildren);
				}
			}
		} catch (error) {
			console.error("Error loading children:", error);
			// Fall back to initialData if API call fails
			if (initialData?.children && initialData.children.length > 0) {
				setChildren(initialData.children);
				setHasChildren(initialData.hasChildren);
				form.setValue("hasChildren", initialData.hasChildren);
			}
		} finally {
			setIsLoadingChildren(false);
		}
	};

	useEffect(() => {
		if (activeWill?.id) {
			loadChildren(activeWill.id);
			// Always check for existing pets to determine if user has pets
			loadExistingPets(activeWill.id);
		} else if (initialData?.children && initialData.children.length > 0) {
			setChildren(initialData.children);
			setHasChildren(initialData.hasChildren);
			form.setValue("hasChildren", initialData.hasChildren);
		}

		// Only use initialData for pets if we don't have an active will (fallback)
		if (!activeWill?.id && initialData?.hasPets !== undefined) {
			setHasPets(initialData.hasPets);
			setInitialHasPets(initialData.hasPets);
		}
	}, [activeWill?.id, initialData]);

	// ✅ ADDED: Update active will when children state changes
	const updateActiveWillChildren = (newChildren: Child[]) => {
		if (activeWill) {
			setActiveWill({
				...activeWill,
				children: newChildren,
			});
		}
	};

	// ✅ ADDED: Pet management function
	const handlePetsChange = async () => {
		if (!activeWill?.id) {
			toast.error(
				"Will information not found. Please start from the beginning."
			);
			return;
		}

		try {
			// If user had pets initially and now doesn't want pets
			if (initialHasPets && !hasPets && petId) {
				// Send DELETE request to remove pets
				const { error } = await apiClient(`/pets/${petId}`, {
					method: "DELETE",
				});

				if (error) {
					console.error("Error deleting pets:", error);
					toast.error("Failed to remove pets. Please try again.");
					return;
				}
			}
			// If user didn't have pets initially and now wants pets
			else if (!initialHasPets && hasPets) {
				// Send POST request to create pets record
				const petData = {
					will_id: activeWill.id,
				};

				const { data, error } = await apiClient<{ id: string }>("/pets", {
					method: "POST",
					body: JSON.stringify(petData),
				});

				if (error) {
					console.error("Error creating pets record:", error);
					toast.error("Failed to create pets record. Please try again.");
					return;
				}

				// Save the pet ID for future reference
				if (data && data.id) {
					setPetId(data.id);
				}
			}
			// If status remains the same, no API calls needed
		} catch (error) {
			console.error("Error managing pets:", error);
			toast.error("An error occurred while managing pets. Please try again.");
		}
	};

	const handleSubmit = async (values: z.infer<typeof familyInfoSchema>) => {
		// Handle pets changes before proceeding
		await handlePetsChange();

		await onNext({
			hasSpouse: values.hasSpouse,
			spouse: localSpouseData
				? {
						firstName: localSpouseData.firstName,
						lastName: localSpouseData.lastName,
				  }
				: undefined,
			hasChildren: values.hasChildren,
			children: children,
			hasPets: hasPets,
			petId: petId || undefined, // Convert null to undefined for type compatibility
		});
	};

	// ✅ UPDATED: Enhanced spouse data handling with immediate local state update
	const handleSpouseData = async (data: SpouseData) => {
		setIsSubmitting(true);

		try {
			// Check if we're editing an existing spouse or creating a new one
			const isEditing = !!(
				localSpouseData &&
				localSpouseData.id &&
				localSpouseData.id !== "temp-id"
			);

			if (onSpouseDataSave) {
				// For editing, pass the ID along with the data
				const dataToSave = isEditing
					? { ...data, id: localSpouseData!.id }
					: data;

				const success = await onSpouseDataSave(dataToSave);

				if (!success) {
					toast.error("Failed to save spouse information. Please try again.");
					return;
				}
			} else {
				toast.error(
					"Unable to save spouse information. Please refresh and try again."
				);
				return;
			}

			// ✅ IMMEDIATE UPDATE: Update local state to show spouse details right away
			setLocalSpouseData({
				id: isEditing ? localSpouseData!.id : "temp-id", // Use temp ID for new spouses
				firstName: data.firstName,
				lastName: data.lastName,
			});

			// Close dialog and show success message
			setSpouseDialogOpen(false);
			const action = isEditing ? "updated" : "saved";
			toast.success(`Spouse information ${action} successfully`);

			// Refresh data from parent
			refetch();
		} catch (error) {
			console.error("Error in spouse data submission:", error);
			toast.error(
				"An error occurred while saving spouse information. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// ✅ UPDATED: Enhanced delete function that uses stored spouse data
	const handleDeleteSpouse = async () => {
		// ✅ FIXED: Use the stored spouse data instead of localSpouseData
		if (!spouseToDelete?.id) {
			toast.error("No spouse to delete");
			return;
		}

		setDeleteLoading(true);
		try {
			await apiClient(`/people/${spouseToDelete.id}`, { method: "DELETE" });

			// ✅ SET DELETION FLAG: Mark that we just deleted a spouse
			setJustDeletedSpouse(true);

			// Clear local state and form
			setLocalSpouseData(null);
			setSpouseToDelete(null); // Clear stored spouse data
			form.setValue("hasSpouse", false);
			setShowDeleteConfirm(false);
			toast.success("Spousal details deleted successfully.");

			// Refresh data from parent
			refetch();

			// ✅ RESET DELETION FLAG: After a delay to allow parent data to refresh
			setTimeout(() => {
				setJustDeletedSpouse(false);
			}, 1000); // 1 second delay
		} catch (error) {
			console.error("Error deleting spouse:", error);
			toast.error("Failed to delete spousal details. Please try again.");
		} finally {
			setDeleteLoading(false);
		}
	};

	// ✅ ADDED: Children form handling
	const handleChildFormChange =
		(field: keyof Omit<Child, "id">) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setChildForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	// ✅ ADDED: Save child functionality
	const handleSaveChild = async () => {
		if (!childForm.firstName || !childForm.lastName) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Check if we have an active will
			if (!activeWill?.id) {
				toast.error(
					"Will information not found. Please start from the beginning."
				);
				return;
			}

			// Find the child relationship ID
			const childRelationship = relationships.find(
				(rel) => rel.name.toLowerCase() === "child"
			);

			if (!childRelationship) {
				toast.error("Child relationship type not found. Please try again.");
				return;
			}

			if (editingChild) {
				// Update existing child record
				const updateData = {
					first_name: childForm.firstName,
					last_name: childForm.lastName,
					is_minor: childForm.isMinor,
				};

				const { error: updateError } = await apiClient<PersonResponse>(
					`/people/${editingChild.id}`,
					{
						method: "PATCH",
						body: JSON.stringify(updateData),
					}
				);

				if (updateError) {
					console.error("Error updating child record:", updateError);
					toast.error("Failed to update child information. Please try again.");
					return;
				}

				// Reload children from API to get the latest data
				if (activeWill?.id) {
					await loadChildren(activeWill.id);
				}

				toast.success("Child information updated successfully");
			} else {
				// Create new child record
				const childData = {
					first_name: childForm.firstName,
					last_name: childForm.lastName,
					relationship_id: childRelationship.id,
					will_id: activeWill.id,
					is_minor: childForm.isMinor,
				};

				const { data: _personResponse, error: personError } =
					await apiClient<PersonResponse>("/people", {
						method: "POST",
						body: JSON.stringify(childData),
					});

				if (personError) {
					console.error("Error creating child record:", personError);
					toast.error("Failed to save child information. Please try again.");
					return;
				}

				// Reload children from API to get the latest data
				if (activeWill?.id) {
					await loadChildren(activeWill.id);
				}

				toast.success("Child information saved successfully");
			}

			// Reset form and close dialog
			setChildDialogOpen(false);
			setEditingChild(null);
			setChildForm({
				firstName: "",
				lastName: "",
				isMinor: false,
			});
		} catch (error) {
			console.error("Error in child data submission:", error);
			toast.error(
				"An error occurred while saving child information. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// ✅ ADDED: Edit child functionality
	const handleEditChild = (child: Child) => {
		setEditingChild(child);
		setChildForm({
			firstName: child.firstName,
			lastName: child.lastName,
			isMinor: child.isMinor,
		});
		setChildDialogOpen(true);
	};

	// ✅ ADDED: Remove child functionality
	const handleRemoveChild = async (childId: string) => {
		try {
			// Delete child record from API
			const { error } = await apiClient(`/people/${childId}`, {
				method: "DELETE",
			});

			if (error) {
				console.error("Error deleting child record:", error);
				toast.error("Failed to remove child. Please try again.");
				return;
			}

			// Immediately update local state for better UX
			setChildren((prevChildren) =>
				prevChildren.filter((child) => child.id !== childId)
			);

			// Update active will context
			if (activeWill) {
				const updatedChildren = children.filter(
					(child) => child.id !== childId
				);
				setActiveWill({
					...activeWill,
					children: updatedChildren,
				});
			}

			// Reload children from API to ensure consistency
			if (activeWill?.id) {
				await loadChildren(activeWill.id);
			}

			toast.success("Child removed successfully");
		} catch (error) {
			console.error("Error removing child:", error);
			toast.error(
				"An error occurred while removing the child. Please try again."
			);
		}
	};

	// ✅ ADDED: Delete child dialog handling
	const openDeleteChildDialog = (child: Child) => {
		setChildToDelete(child);
		setDeleteChildDialogOpen(true);
	};

	const confirmDeleteChild = async () => {
		if (childToDelete) {
			await handleRemoveChild(childToDelete.id);
			setDeleteChildDialogOpen(false);
			setChildToDelete(null);
		}
	};

	const cancelDeleteChild = () => {
		setDeleteChildDialogOpen(false);
		setChildToDelete(null);
	};

	// Show loading state if relationships or owner data are still loading
	if (relationshipsLoading || isLoadingOwnerData) {
		return (
			<div className="space-y-4">
				<div className="flex justify-center py-8">
					<LoadingSpinner message="Loading..." />
				</div>
			</div>
		);
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
						Tell us about your family
					</div>
					<div className="text-[#696868] text-[0.875rem] -mt-4">
						This will help to ensure the Will is based on your personal
						circumstance.
					</div>

					{/* Spouse Section */}
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
								Are you married or in a legally recognised civil relationship?
							</span>
						</div>

						<div className="space-y-3 mt-[-0.5rem]">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="spouseNo"
									checked={!form.watch("hasSpouse")}
									onCheckedChange={(checked) => {
										if (checked) {
											// If "No" is being selected
											if (localSpouseData) {
												// ✅ FIXED: Store spouse data before showing delete confirmation
												setSpouseToDelete(localSpouseData);
												setShowDeleteConfirm(true);
											} else {
												// If no existing data, just clear the form
												form.setValue("hasSpouse", false);
											}
										}
									}}
									disabled={isSubmitting}
									className="rounded-full"
								/>
								<Label
									htmlFor="spouseNo"
									className="text-sm font-normal cursor-pointer"
								>
									No, I am not
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="spouseYes"
									checked={form.watch("hasSpouse")}
									onCheckedChange={(checked) => {
										if (checked) {
											// If "Yes" is being selected
											form.setValue("hasSpouse", true);
											if (!localSpouseData) setSpouseDialogOpen(true);
										}
									}}
									disabled={isSubmitting}
									className="rounded-full"
								/>
								<Label
									htmlFor="spouseYes"
									className="text-sm font-normal cursor-pointer"
								>
									Yes, I have a spouse or civil partner
								</Label>
							</div>
						</div>

						{/* ✅ UPDATED: Show spouse details from local state */}
						{form.watch("hasSpouse") && localSpouseData && (
							<Card className="border-2 border-green-100 bg-green-50/50">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-lg">
										<User className="h-5 w-5 text-green-600" />
										Partner Information
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex justify-between items-center">
										<div className="space-y-1">
											<p className="font-medium text-gray-900">
												{localSpouseData.firstName} {localSpouseData.lastName}
											</p>
											<p className="text-sm text-muted-foreground">
												Spouse or Civil Partner
											</p>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="cursor-pointer border-green-200 hover:bg-green-100"
											onClick={() => setSpouseDialogOpen(true)}
											disabled={isSubmitting}
										>
											<Edit2 className="h-4 w-4 mr-2" />
											Edit
										</Button>
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* ✅ ADDED: Children Section */}
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
								Do you have children?
							</span>
						</div>
						<div className="text-[#696868] text-[0.875rem] -mt-4">
							This information helps us create the appropriate provisions in
							your Will, especially regarding guardianship for minor children.
						</div>

						<div className="space-y-3 mt-[-0.5rem]">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="childrenNo"
									checked={!form.watch("hasChildren")}
									onCheckedChange={(checked) => {
										if (checked) {
											setHasChildren(false);
											form.setValue("hasChildren", false);
											setChildren([]);
										}
									}}
									disabled={isSubmitting}
									className="rounded-full"
								/>
								<Label
									htmlFor="childrenNo"
									className="text-sm font-normal cursor-pointer"
								>
									No, I don't
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="childrenYes"
									checked={form.watch("hasChildren")}
									onCheckedChange={(checked) => {
										if (checked) {
											setHasChildren(true);
											form.setValue("hasChildren", true);
										}
									}}
									disabled={isSubmitting}
									className="rounded-full"
								/>
								<Label
									htmlFor="childrenYes"
									className="text-sm font-normal cursor-pointer"
								>
									Yes, I have children
								</Label>
							</div>
						</div>

						{/* ✅ ADDED: Children Management Section */}
						{form.watch("hasChildren") && (
							<div className="mt-6">
								{/* Children List - Only show when there are children */}
								{children.length > 0 && (
									<div className="mb-6 space-y-4">
										{children.map((child) => (
											<Card key={child.id}>
												<CardContent className="p-4">
													<div className="flex justify-between items-center">
														<div>
															<p className="font-medium">
																{child.firstName} {child.lastName}
															</p>
															<p className="text-sm text-muted-foreground">
																{child.isMinor
																	? "Requires legal guardian"
																	: "Adult (no guardian required)"}
															</p>
														</div>
														<div className="flex space-x-2">
															<Button
																type="button"
																variant="ghost"
																size="icon"
																onClick={() => handleEditChild(child)}
																className="cursor-pointer"
																disabled={isLoadingChildren}
															>
																<Edit2 className="h-4 w-4" />
															</Button>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																onClick={() => openDeleteChildDialog(child)}
																className="cursor-pointer"
																disabled={isLoadingChildren}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
								<Dialog
									open={childDialogOpen}
									onOpenChange={isSubmitting ? undefined : setChildDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											onClick={() => {
												setChildForm({
													firstName: "",
													lastName: "",
													isMinor: false,
												});
												setEditingChild(null);
											}}
											className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
											disabled={isLoadingChildren}
										>
											<Plus className="mr-2 h-4 w-4" />
											Add Child
										</Button>
									</DialogTrigger>
									<DialogContent className="bg-white">
										<DialogHeader>
											<DialogTitle>
												{editingChild ? "Edit Child" : "Add Child"}
											</DialogTitle>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="childFirstName">First Name</Label>
													<Input
														id="childFirstName"
														value={childForm.firstName}
														onChange={handleChildFormChange("firstName")}
														placeholder="John"
														disabled={isSubmitting}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="childLastName">Last Name</Label>
													<Input
														id="childLastName"
														value={childForm.lastName}
														onChange={handleChildFormChange("lastName")}
														placeholder="Doe"
														disabled={isSubmitting}
													/>
												</div>
											</div>
											<div className="space-y-2">
												<div className="flex items-center space-x-2">
													<Checkbox
														id="isMinor"
														checked={childForm.isMinor}
														onCheckedChange={(checked: boolean) =>
															setChildForm((prev) => ({
																...prev,
																isMinor: checked,
															}))
														}
														disabled={isSubmitting}
													/>
													<Label htmlFor="isMinor" className="text-sm">
														This child is a minor or requires a legal guardian
													</Label>
												</div>
												<p className="text-sm text-muted-foreground mt-1">
													This will help us include appropriate guardianship
													provisions in your Will.
												</p>
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													variant="outline"
													onClick={() => setChildDialogOpen(false)}
													className="cursor-pointer"
													disabled={isSubmitting}
												>
													Cancel
												</Button>
												<Button
													onClick={handleSaveChild}
													className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
													disabled={isSubmitting}
												>
													{isSubmitting ? (
														<>
															<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
															Saving...
														</>
													) : (
														<>Save</>
													)}
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						)}

						{/* Pets Section */}
						<div className="space-y-4 my-[2.45rem]">
							<div className="flex items-center gap-2">
								<span
									style={{
										fontSize: "1rem",
										color: "#000",
										fontWeight: 400,
										fontFamily: "TMT Limkin",
									}}
								>
									Do you have pets?
								</span>
							</div>
							<div className="text-[#696868] text-[0.875rem] -mt-4">
								This information helps us include provisions for pet care in
								your Will, allowing you to specify who will take care of your
								pets.
							</div>

							<div className="space-y-3 mt-[-0.5rem]">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="petsNo"
										checked={!hasPets}
										onCheckedChange={(checked) => {
											if (checked) {
												setHasPets(false);
											}
										}}
									/>
									<Label htmlFor="petsNo" className="text-sm">
										No, I don't have pets
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="petsYes"
										checked={hasPets}
										onCheckedChange={(checked) => {
											if (checked) {
												setHasPets(true);
											}
										}}
									/>
									<Label htmlFor="petsYes" className="text-sm">
										Yes, I have pets
									</Label>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-between pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onBack}
							className="cursor-pointer"
							disabled={isSubmitting}
						>
							<ArrowLeft className="mr-2 h-4 w-4" /> Back
						</Button>
						<Button
							type="submit"
							className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
									Saving...
								</>
							) : (
								<>
									Next <ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>

			{/* ✅ UPDATED: Pass local spouse data for editing */}
			<SpouseDialog
				open={spouseDialogOpen}
				onOpenChange={setSpouseDialogOpen}
				onSave={handleSpouseData}
				initialData={
					localSpouseData
						? {
								firstName: localSpouseData.firstName,
								lastName: localSpouseData.lastName,
						  }
						: undefined
				}
				isSubmitting={isSubmitting}
			/>

			{/* Confirmation Dialog for Deleting Spouse */}
			<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Remove Spousal Details?</DialogTitle>
					</DialogHeader>
					<p>
						If you continue, your spousal details will be deleted and cannot be
						undone. Are you sure you want to proceed?
					</p>
					<div className="flex justify-end gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => setShowDeleteConfirm(false)}
							disabled={deleteLoading}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteSpouse}
							disabled={deleteLoading}
						>
							{deleteLoading ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
									Deleting...
								</>
							) : (
								<>Delete</>
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* ✅ ADDED: Delete Confirmation Dialog for Children */}
			<AlertDialog
				open={deleteChildDialogOpen}
				onOpenChange={setDeleteChildDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Child</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove{" "}
							<strong>
								{childToDelete?.firstName} {childToDelete?.lastName}
							</strong>{" "}
							from your Will? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelDeleteChild}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDeleteChild}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							Remove Child
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
