import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
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
import {
	ArrowLeft,
	ArrowRight,
	Edit2,
	Plus,
	Trash2,
	User,
	Baby,
	PawPrint,
} from "lucide-react";
import { toast } from "sonner";
import { SpouseData, Child, StepProps, Guardian } from "../types/will.types";
import { RelationshipSelect } from "@/components/ui/relationship-select";

interface FamilyInfoStepProps extends StepProps {
	guardians?: Guardian[];
}

const spouseSchema = z.object({
	hasSpouse: z.boolean(),
});

export default function FamilyInfoStep({
	data,
	onUpdate,
	onNext,
	onBack,
	guardians = [],
}: FamilyInfoStepProps) {
	// Store the latest onUpdate function in a ref to avoid infinite loops
	const onUpdateRef = useRef(onUpdate);
	onUpdateRef.current = onUpdate;

	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
	const [localSpouseData, setLocalSpouseData] = useState<
		SpouseData | undefined
	>(data?.spouse);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [hasChildren, setHasChildren] = useState(data?.hasChildren ?? false);
	const [children, setChildren] = useState<Child[]>(data?.children ?? []);
	const [childDialogOpen, setChildDialogOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<Child | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [childForm, setChildForm] = useState<Omit<Child, "id">>({
		firstName: "",
		lastName: "",
		isMinor: false,
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [childToDelete, setChildToDelete] = useState<Child | null>(null);

	const [hasPets, setHasPets] = useState(data?.hasPets || false);
	const [petGuardianId, setPetGuardianId] = useState<string>(
		data?.petGuardianId || ""
	);
	const [guardianSelectDialogOpen, setGuardianSelectDialogOpen] =
		useState(false);
	const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
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

	const form = useForm<z.infer<typeof spouseSchema>>({
		resolver: zodResolver(spouseSchema),
		defaultValues: {
			hasSpouse: !!data?.spouse || false,
		},
	});

	const hasSpouseFromData = !!data?.spouse;

	useEffect(() => {
		onUpdateRef.current({
			hasSpouse: hasSpouseFromData,
			spouse: hasSpouseFromData ? localSpouseData : undefined,
			hasChildren,
			children: hasChildren ? children : [],
			hasPets,
			petGuardianId: hasPets ? petGuardianId : undefined,
		});
	}, [
		hasSpouseFromData,
		localSpouseData,
		hasChildren,
		children,
		hasPets,
		petGuardianId,
	]);

	const handleSpouseData = async (data: SpouseData) => {
		setIsSubmitting(true);
		try {
			setLocalSpouseData(data);
			setSpouseDialogOpen(false);
			toast.success("Spouse information saved successfully");
		} catch (error) {
			console.error("Error in spouse data submission:", error);
			toast.error(
				"An error occurred while saving spouse information. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteSpouse = async () => {
		setDeleteLoading(true);
		try {
			setLocalSpouseData(undefined);
			setShowDeleteConfirm(false);
			toast.success("Spousal details deleted successfully.");
		} catch (error) {
			console.error("Error deleting spouse:", error);
			toast.error("Failed to delete spousal details. Please try again.");
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleSpouseChange = (field: keyof SpouseData, value: string) => {
		if (localSpouseData) {
			setLocalSpouseData({ ...localSpouseData, [field]: value });
		}
	};

	const handleSubmit = async () => {
		await onNext();
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
			if (editingChild) {
				// Update existing child
				const updatedChildren = children.map((child) =>
					child.id === editingChild.id ? { ...child, ...childForm } : child
				);
				setChildren(updatedChildren);
				toast.success("Child information updated successfully");
			} else {
				// Add new child
				const newChild: Child = {
					id: Date.now().toString(), // Temporary ID
					...childForm,
				};
				setChildren([...children, newChild]);
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
			setChildren(children.filter((child) => child.id !== childId));
			toast.success("Child removed successfully");
		} catch (error) {
			console.error("Error removing child:", error);
			toast.error("Failed to remove child. Please try again.");
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

	const handleGuardianFormChange =
		(field: keyof Guardian) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setGuardianForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleSaveGuardian = async () => {
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
			const newGuardian: Guardian = {
				id: Date.now().toString(), // Temporary ID
				firstName: guardianForm.firstName,
				lastName: guardianForm.lastName,
				relationship: guardianForm.relationship,
				isPrimary: false,
			};

			// Set this new guardian as the pet guardian
			setPetGuardianId(newGuardian.id);

			toast.success("Guardian created successfully");

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
		if (existingPetRecordId) {
			setDeleteConfirmDialogOpen(true);
		} else {
			setHasPets(false);
			setPetGuardianId("");
		}
	};

	const handleConfirmDelete = async () => {
		if (!existingPetRecordId) return;

		setIsDeleting(true);
		try {
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
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					Family Information
				</div>
				<div className="text-muted-foreground">
					Tell us about your family members and pets.
				</div>

				{/* Spouse Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="w-5 h-5" />
							Spouse/Partner Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-4">
							<Button
								type="button"
								variant={!form.watch("hasSpouse") ? "default" : "outline"}
								className={
									!form.watch("hasSpouse") ? "bg-primary text-white" : ""
								}
								onClick={() => {
									if (localSpouseData) {
										setShowDeleteConfirm(true);
									} else {
										form.setValue("hasSpouse", false);
										setLocalSpouseData(undefined);
									}
								}}
								disabled={isSubmitting}
							>
								No
							</Button>
							<Button
								type="button"
								variant={form.watch("hasSpouse") ? "default" : "outline"}
								className={
									form.watch("hasSpouse") ? "bg-primary text-white" : ""
								}
								onClick={() => {
									form.setValue("hasSpouse", true);
									if (!localSpouseData) setSpouseDialogOpen(true);
								}}
								disabled={isSubmitting}
							>
								Yes, I have a spouse or civil partner
							</Button>
						</div>

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
					</CardContent>
				</Card>

				{/* Children Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Baby className="w-5 h-5" />
							Children Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
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
												disabled={isSubmitting}
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

								{isSubmitting ? (
									<div className="flex items-center justify-center py-8">
										<div className="flex flex-col items-center gap-4">
											<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
											<p className="text-muted-foreground">
												Loading children...
											</p>
										</div>
									</div>
								) : children.length === 0 ? (
									<p className="text-muted-foreground text-center py-4">
										No children added yet. Click "Add Child" to add your
										children.
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
																disabled={isSubmitting}
															>
																<Edit2 className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="icon"
																onClick={() => openDeleteDialog(child)}
																className="cursor-pointer"
																disabled={isSubmitting}
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
					</CardContent>
				</Card>

				{/* Pets Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PawPrint className="w-5 h-5" />
							Pet Care Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
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
													<strong>{getGuardianName(petGuardianId)}</strong> will
													be responsible for caring for your pets.
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
					</CardContent>
				</Card>

				{/* Navigation */}
				<div className="flex justify-between pt-6">
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
						type="button"
						onClick={handleSubmit}
						disabled={!canProceed() || isSubmitting}
						className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
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

				{/* Spouse Dialog */}
				<Dialog
					open={spouseDialogOpen}
					onOpenChange={isSubmitting ? undefined : setSpouseDialogOpen}
				>
					<DialogContent className="sm:max-w-[425px] bg-white">
						<DialogHeader>
							<DialogTitle>
								{localSpouseData
									? "Edit Partner Details"
									: "Add Partner Details"}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="spouseFirstName">First Name</Label>
									<Input
										id="spouseFirstName"
										value={localSpouseData?.firstName || ""}
										onChange={(e) =>
											handleSpouseChange("firstName", e.target.value)
										}
										placeholder="Jane"
										autoFocus
										disabled={isSubmitting}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="spouseLastName">Last Name</Label>
									<Input
										id="spouseLastName"
										value={localSpouseData?.lastName || ""}
										onChange={(e) =>
											handleSpouseChange("lastName", e.target.value)
										}
										placeholder="Doe"
										disabled={isSubmitting}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="spouseRelationship">Relationship Type</Label>
								<RelationshipSelect
									value={localSpouseData?.relationship || ""}
									onValueChange={(value) =>
										handleSpouseChange("relationship", value)
									}
									placeholder="Select relationship type"
								/>
							</div>
							<div className="flex justify-end space-x-2">
								<Button
									variant="outline"
									onClick={() => setSpouseDialogOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button
									onClick={() => handleSpouseData(localSpouseData!)}
									disabled={
										isSubmitting ||
										!localSpouseData?.firstName ||
										!localSpouseData?.lastName ||
										!localSpouseData?.relationship
									}
									className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
								>
									{isSubmitting ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
											Saving...
										</>
									) : (
										<>{localSpouseData ? "Update" : "Save"}</>
									)}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{/* Guardian Selection Modal for Pets */}
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
										<Button variant="outline" className="cursor-pointer w-full">
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

				{/* Delete Confirmation Dialog for Children */}
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
							<AlertDialogCancel onClick={cancelDelete}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmDelete}
								className="bg-red-600 hover:bg-red-700"
							>
								Remove Child
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Delete Confirmation Dialog for Spouse */}
				<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Remove Spousal Details?</DialogTitle>
						</DialogHeader>
						<p>
							If you continue, your spousal details will be deleted and cannot
							be undone. Are you sure you want to proceed?
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

				{/* Delete Confirmation Dialog for Pets */}
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
			</form>
		</Form>
	);
}
