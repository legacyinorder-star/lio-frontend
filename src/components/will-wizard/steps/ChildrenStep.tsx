import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Child } from "../types/will.types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ArrowLeft, ArrowRight, Edit2, Plus, Trash2 } from "lucide-react";
import { useWill } from "@/context/WillContext";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useRelationships } from "@/hooks/useRelationships";

interface ChildrenStepProps {
	onNext: () => void;
	onBack: () => void;
	onUpdate: (
		data: Partial<{ hasChildren: boolean; children: Child[] }>
	) => void;
	initialData?: {
		hasChildren: boolean;
		children: Child[];
	};
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

export default function ChildrenStep({
	onNext,
	onBack,
	onUpdate,
	initialData,
}: ChildrenStepProps) {
	const { activeWill, setActiveWill } = useWill();
	const { relationships } = useRelationships();
	const [hasChildren, setHasChildren] = useState(
		initialData?.hasChildren ?? false
	);
	const [children, setChildren] = useState<Child[]>(
		initialData?.children ?? []
	);
	const [childDialogOpen, setChildDialogOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<Child | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [childForm, setChildForm] = useState<Omit<Child, "id">>({
		firstName: "",
		lastName: "",
		isMinor: false,
	});
	const [isLoadingChildren, setIsLoadingChildren] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [childToDelete, setChildToDelete] = useState<Child | null>(null);

	// Load children from API when component mounts
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

				// Update active will context with loaded children
				updateActiveWillChildren(transformedChildren);
			} else {
				// No children found, check initialData as fallback
				if (initialData?.children && initialData.children.length > 0) {
					setChildren(initialData.children);
					setHasChildren(initialData.hasChildren);
				}
			}
		} catch (error) {
			console.error("Error loading children:", error);
			// Fall back to initialData if API call fails
			if (initialData?.children && initialData.children.length > 0) {
				setChildren(initialData.children);
				setHasChildren(initialData.hasChildren);
			}
		} finally {
			setIsLoadingChildren(false);
		}
	};

	useEffect(() => {
		if (activeWill?.id) {
			loadChildren(activeWill.id);
		} else if (initialData?.children && initialData.children.length > 0) {
			setChildren(initialData.children);
			setHasChildren(initialData.hasChildren);
		}
	}, [activeWill?.id, initialData]);

	// Update active will when children state changes
	const updateActiveWillChildren = (newChildren: Child[]) => {
		if (activeWill) {
			setActiveWill({
				...activeWill,
				children: newChildren,
			});
		}
	};

	const handleSubmit = () => {
		// Update the form data with current children state
		onUpdate({
			hasChildren,
			children,
		});

		// Let the parent WillWizard handle navigation
		// It will check if there are minor children and navigate to guardians or assets accordingly
		onNext();
	};

	const handleChildFormChange =
		(field: keyof Omit<Child, "id">) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setChildForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

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

	const handleEditChild = (child: Child) => {
		setEditingChild(child);
		setChildForm({
			firstName: child.firstName,
			lastName: child.lastName,
			isMinor: child.isMinor,
		});
		setChildDialogOpen(true);
	};

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

			// Reload children from API to get the latest data
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

	const openDeleteDialog = (child: Child) => {
		setChildToDelete(child);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (childToDelete) {
			await handleRemoveChild(childToDelete.id);
			setDeleteDialogOpen(false);
			setChildToDelete(null);
		}
	};

	const cancelDelete = () => {
		setDeleteDialogOpen(false);
		setChildToDelete(null);
	};

	return (
		<div className="space-y-4">
			<div className="text-[2rem] font-medium text-black">
				Do you have children?
			</div>
			<div className="text-muted-foreground">
				This information helps us create the appropriate provisions in your
				will, especially regarding guardianship for minor children.
			</div>
			<div className="flex space-x-4 mt-4">
				<Button
					variant="outline"
					onClick={() => setHasChildren(false)}
					className={`cursor-pointer ${
						!hasChildren ? "bg-primary text-white border-primary" : ""
					}`}
				>
					No
				</Button>
				<Button
					variant="outline"
					onClick={() => setHasChildren(true)}
					className={`cursor-pointer ${
						hasChildren ? "bg-primary text-white border-primary" : ""
					}`}
				>
					Yes
				</Button>
			</div>

			{hasChildren && (
				<div className="space-y-6 mt-6">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium">Your Children</h3>
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
									className="cursor-pointer"
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
											provisions in your will.
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

					{isLoadingChildren ? (
						<div className="flex items-center justify-center py-8">
							<div className="flex flex-col items-center gap-4">
								<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
								<p className="text-muted-foreground">Loading children...</p>
							</div>
						</div>
					) : children.length === 0 ? (
						<p className="text-muted-foreground text-center py-4">
							No children added yet. Click "Add Child" to add your children.
						</p>
					) : (
						<div className="space-y-4">
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
													variant="ghost"
													size="icon"
													onClick={() => handleEditChild(child)}
													className="cursor-pointer"
													disabled={isLoadingChildren}
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openDeleteDialog(child)}
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
				</div>
			)}

			{/* Navigation buttons - always visible */}
			<div className="flex justify-between pt-6">
				<Button variant="outline" onClick={onBack} className="cursor-pointer">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={hasChildren && children.length === 0}
					className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
				>
					Next <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Child</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove{" "}
							<strong>
								{childToDelete?.firstName} {childToDelete?.lastName}
							</strong>{" "}
							from your will? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Remove Child
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
