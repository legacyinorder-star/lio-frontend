import { useState } from "react";
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

// Extend the WillFormData type for this component
interface GuardiansStepData {
	willId?: string;
	guardians?: Guardian[];
}

export default function GuardiansStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: StepProps) {
	const { relationships } = useRelationships();
	const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
	const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
	const [guardianForm, setGuardianForm] = useState<Guardian>({
		id: "",
		firstName: "",
		lastName: "",
		relationship: "",
		isPrimary: false,
	});

	const handleGuardianFormChange =
		(field: keyof Guardian) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setGuardianForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleSaveGuardian = async () => {
		const stepData = data as GuardiansStepData;
		const willId = stepData.willId;
		if (!willId) {
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

		try {
			// First create the guardian person record
			const { data: personData, error: personError } =
				await apiClient<ApiPersonResponse>("/people", {
					method: "POST",
					body: JSON.stringify({
						will_id: willId,
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
						will_id: willId,
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

			const currentGuardians = stepData.guardians || [];
			const updatedGuardians = editingGuardian
				? currentGuardians.map((g) =>
						g.id === editingGuardian.id ? newGuardian : g
				  )
				: [...currentGuardians, newGuardian];

			// If this is a primary guardian, ensure no other primary exists
			if (guardianForm.isPrimary) {
				updatedGuardians.forEach((g) => {
					if (g.id !== newGuardian.id) {
						g.isPrimary = false;
					}
				});
			}

			onUpdate({ guardians: updatedGuardians });

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
			toast.success("Guardian saved successfully");
		} catch (error) {
			console.error("Error saving guardian:", error);
			toast.error("An error occurred while saving guardian information");
		}
	};

	const handleEditGuardian = (guardian: Guardian) => {
		setGuardianForm(guardian);
		setEditingGuardian(guardian);
		setGuardianDialogOpen(true);
	};

	const handleRemoveGuardian = (guardianId: string) => {
		const stepData = data as GuardiansStepData;
		const currentGuardians = stepData.guardians || [];
		onUpdate({
			guardians: currentGuardians.filter((g) => g.id !== guardianId),
		});
	};

	const areGuardiansValid = () => {
		const stepData = data as GuardiansStepData;
		const currentGuardians = stepData.guardians || [];
		return (
			currentGuardians.some((g) => g.isPrimary) && currentGuardians.length >= 2
		);
	};

	const stepData = data as GuardiansStepData;
	const currentGuardians = stepData.guardians || [];

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Guardians for Your Children</div>
			<div className="text-muted-foreground">
				Since you have children who require guardians, please specify who you
				would like to appoint as guardians in your will. You have to appoint at
				least two guardians (a primary and a backup) in case the primary
				guardian is unable to serve.
			</div>
			<div className="space-y-6 mt-6">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-medium">Appointed Guardians</h3>
					<Dialog
						open={guardianDialogOpen}
						onOpenChange={setGuardianDialogOpen}
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
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="guardianLastName">Last Name</Label>
										<Input
											id="guardianLastName"
											value={guardianForm.lastName}
											onChange={handleGuardianFormChange("lastName")}
											placeholder="Doe"
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
									>
										Cancel
									</Button>
									<Button
										onClick={handleSaveGuardian}
										className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
									>
										Save
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
											>
												<Edit2 className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleRemoveGuardian(guardian.id)}
												className="cursor-pointer"
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
