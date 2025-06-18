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
import { useRelationships } from "@/hooks/useRelationships";
import { getFormattedRelationshipNameById } from "@/utils/relationships";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { useWill } from "@/context/WillContext";

interface Guardian {
	id: string;
	firstName: string;
	lastName: string;
	relationship: string;
	isPrimary: boolean;
}

interface ApiPersonResponse {
	id: string;
	first_name: string;
	last_name: string;
}

export default function GuardiansStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: StepProps) {
	const { activeWill, setActiveWill } = useWill();
	const { relationships } = useRelationships();
	const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
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

	// Load guardians from active will when component mounts
	useEffect(() => {
		if (activeWill?.guardians && activeWill.guardians.length > 0) {
			// Check if guardians are already loaded in form data to prevent infinite loop
			const currentGuardians = data.guardians || [];
			if (currentGuardians.length === 0) {
				// Transform guardians data to match the expected format
				const transformedGuardians = activeWill.guardians.map((guardian) => {
					// Handle potential API data structure (snake_case) vs component structure (camelCase)
					const guardianAny = guardian as typeof guardian & {
						first_name?: string;
						last_name?: string;
						is_primary?: boolean;
					};
					return {
						id: guardian.id,
						firstName: guardian.firstName || guardianAny.first_name || "",
						lastName: guardian.lastName || guardianAny.last_name || "",
						relationship: guardian.relationship,
						isPrimary: guardian.isPrimary || guardianAny.is_primary || false,
					};
				});
				onUpdate({ guardians: transformedGuardians });
			}
		}
	}, [activeWill]); // Remove onUpdate from dependency array

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

				// Then update the guardianship record
				const { error: guardianshipError } = await apiClient(
					`/guardianship/${editingGuardian.id}`,
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

				// Update local state
				const currentGuardians = data.guardians || [];
				const updatedGuardians = currentGuardians.map((g) =>
					g.id === editingGuardian.id
						? {
								...g,
								firstName: guardianForm.firstName,
								lastName: guardianForm.lastName,
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
					relationship: guardianForm.relationship,
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
				toast.success("Guardian saved successfully");
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

	const handleRemoveGuardian = async (guardianId: string) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		setIsDeleting(true);

		try {
			// First delete the guardianship record
			const { error: guardianshipError } = await apiClient(
				`/guardianship/${guardianId}`,
				{
					method: "DELETE",
				}
			);

			if (guardianshipError) {
				toast.error("Failed to delete guardianship record");
				return;
			}

			// Then delete the person record
			const { error: personError } = await apiClient(`/people/${guardianId}`, {
				method: "DELETE",
			});

			if (personError) {
				toast.error("Failed to delete guardian person record");
				return;
			}

			// Update local state
			const currentGuardians = data.guardians || [];
			const updatedGuardians = currentGuardians.filter(
				(g) => g.id !== guardianId
			);
			onUpdate({ guardians: updatedGuardians });
			updateActiveWillGuardians(updatedGuardians);

			toast.success("Guardian removed successfully");
		} catch (error) {
			console.error("Error removing guardian:", error);
			toast.error("An error occurred while removing the guardian");
		} finally {
			setIsDeleting(false);
		}
	};

	const areGuardiansValid = () => {
		const currentGuardians = data.guardians || [];
		return (
			currentGuardians.some((g) => g.isPrimary) && currentGuardians.length >= 2
		);
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

		return errors;
	};

	const currentGuardians = data.guardians || [];
	const validationErrors = getValidationErrors();

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Guardians for Your Children</div>
			<div className="text-muted-foreground">
				Since you have children who require guardians, please specify who you
				would like to appoint as guardians in your will.
			</div>
			<div className="font-bold text-red-500">
				You have to appoint at least two guardians (a primary and a backup) in
				case the primary guardian is unable to serve.
			</div>
			<div className="space-y-6 mt-6">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-medium">Appointed Guardians</h3>
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
								className="cursor-pointer"
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
										onValueChange={(value) => {
											const event = {
												target: { value },
											} as React.ChangeEvent<HTMLInputElement>;
											handleGuardianFormChange("relationship")(event);
										}}
										label="Relationship to You"
										required
										excludeRelationships={["spouse", "child"]}
										disabled={isSubmitting}
										useOnlyRelationships={true}
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
										className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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

				{currentGuardians.length === 0 ? (
					<p className="text-muted-foreground text-center py-4">
						No guardians added yet. Click "Add Guardian" to appoint guardians
						for your children.
					</p>
				) : (
					<div className="space-y-4">
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
												{getFormattedRelationshipNameById(
													relationships,
													guardian.relationship
												)}
											</p>
										</div>
										<div className="flex space-x-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEditGuardian(guardian)}
												className="cursor-pointer"
												disabled={isDeleting}
											>
												<Edit2 className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleRemoveGuardian(guardian.id)}
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

				{/* Validation Error Messages */}
				{validationErrors.length > 0 && (
					<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
						<div className="text-sm font-medium text-red-800 mb-1">
							Please fix the following issues:
						</div>
						<ul className="text-sm text-red-700 space-y-1">
							{validationErrors.map((error, index) => (
								<li key={index} className="flex items-center">
									<span className="mr-2">•</span>
									{error}
								</li>
							))}
						</ul>
					</div>
				)}

				<div className="flex justify-between pt-4">
					<Button variant="outline" onClick={onBack} className="cursor-pointer">
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button
						onClick={onNext}
						disabled={!areGuardiansValid()}
						className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
					>
						Next <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
