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

	const handleRemoveGuardian = async (guardian: Guardian) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		setIsDeleting(true);

		try {
			// First delete the guardianship record using guardianshipId
			if (guardian.guardianshipId) {
				const { error: guardianshipError } = await apiClient(
					`/guardianship/${guardian.guardianshipId}`,
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
			const { error: personError } = await apiClient(`/people/${guardian.id}`, {
				method: "DELETE",
			});

			if (personError) {
				toast.error("Failed to delete guardian person record");
				return;
			}

			// Update local state
			const currentGuardians = data.guardians || [];
			const updatedGuardians = currentGuardians.filter(
				(g) => g.id !== guardian.id
			);
			onUpdate({ guardians: updatedGuardians });
			updateActiveWillGuardians(updatedGuardians);

			toast.success("Guardian removed successfully");

			// Refresh beneficiary lists
			await refetch();
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
					isLoadingGuardians ? (
						<p className="text-muted-foreground text-center py-4">
							Loading guardians...
						</p>
					) : (
						<p className="text-muted-foreground text-center py-4">
							No guardians added yet. Click "Add Guardian" to appoint guardians
							for your children.
						</p>
					)
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
												{guardian.relationship}
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
