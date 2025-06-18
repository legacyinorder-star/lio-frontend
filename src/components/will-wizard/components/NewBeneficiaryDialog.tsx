import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { RelationshipSelect } from "@/components/ui/relationship-select";

interface NewBeneficiaryForm {
	firstName: string;
	lastName: string;
	relationshipId: string;
	charityName: string;
	registrationNumber: string;
}

interface NewBeneficiaryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAddIndividual: (
		firstName: string,
		lastName: string,
		relationshipId: string
	) => Promise<void>;
	onAddCharity: (
		charityName: string,
		registrationNumber?: string
	) => Promise<void>;
}

export function NewBeneficiaryDialog({
	open,
	onOpenChange,
	onAddIndividual,
	onAddCharity,
}: NewBeneficiaryDialogProps) {
	const [beneficiaryType, setBeneficiaryType] = useState<
		"individual" | "charity"
	>("individual");
	const [newBeneficiaryForm, setNewBeneficiaryForm] =
		useState<NewBeneficiaryForm>({
			firstName: "",
			lastName: "",
			relationshipId: "",
			charityName: "",
			registrationNumber: "",
		});

	const handleAddBeneficiary = async () => {
		if (beneficiaryType === "individual") {
			// Validate individual form
			if (
				!newBeneficiaryForm.firstName ||
				!newBeneficiaryForm.lastName ||
				!newBeneficiaryForm.relationshipId
			) {
				return;
			}

			await onAddIndividual(
				newBeneficiaryForm.firstName,
				newBeneficiaryForm.lastName,
				newBeneficiaryForm.relationshipId
			);
		} else {
			// Validate charity form
			if (!newBeneficiaryForm.charityName) {
				return;
			}

			await onAddCharity(
				newBeneficiaryForm.charityName,
				newBeneficiaryForm.registrationNumber || undefined
			);
		}

		// Reset form and close modal
		setNewBeneficiaryForm({
			firstName: "",
			lastName: "",
			relationshipId: "",
			charityName: "",
			registrationNumber: "",
		});
		setBeneficiaryType("individual");
		onOpenChange(false);
	};

	const handleCancel = () => {
		setNewBeneficiaryForm({
			firstName: "",
			lastName: "",
			relationshipId: "",
			charityName: "",
			registrationNumber: "",
		});
		setBeneficiaryType("individual");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-white max-w-2xl">
				<DialogHeader>
					<DialogTitle>Add New Beneficiary</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					{/* Tabs */}
					<div className="flex space-x-4 border-b">
						<Button
							variant="ghost"
							onClick={() => setBeneficiaryType("individual")}
							className={`border-b-2 transition-colors cursor-pointer ${
								beneficiaryType === "individual"
									? "bg-light-green text-black border-light-green"
									: "border-transparent hover:border-primary/50"
							}`}
						>
							Individual
						</Button>
						<Button
							variant="ghost"
							onClick={() => setBeneficiaryType("charity")}
							className={`border-b-2 transition-colors cursor-pointer ${
								beneficiaryType === "charity"
									? "bg-light-green text-black border-light-green"
									: "border-transparent hover:border-primary/50"
							}`}
						>
							Charity
						</Button>
					</div>

					{/* Individual Form */}
					{beneficiaryType === "individual" && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										placeholder="Enter first name"
										value={newBeneficiaryForm.firstName}
										onChange={(e) =>
											setNewBeneficiaryForm((prev) => ({
												...prev,
												firstName: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										placeholder="Enter last name"
										value={newBeneficiaryForm.lastName}
										onChange={(e) =>
											setNewBeneficiaryForm((prev) => ({
												...prev,
												lastName: e.target.value,
											}))
										}
									/>
								</div>
							</div>
							<RelationshipSelect
								value={newBeneficiaryForm.relationshipId}
								onValueChange={(value) =>
									setNewBeneficiaryForm((prev) => ({
										...prev,
										relationshipId: value,
									}))
								}
								label="Relationship"
								placeholder="Select relationship"
								excludeRelationships={["child", "spouse"]}
								useOnlyRelationships={true}
							/>
						</div>
					)}

					{/* Charity Form */}
					{beneficiaryType === "charity" && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="charityName">Charity Name</Label>
								<Input
									id="charityName"
									placeholder="Enter charity name"
									value={newBeneficiaryForm.charityName}
									onChange={(e) =>
										setNewBeneficiaryForm((prev) => ({
											...prev,
											charityName: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="registrationNumber">Registration Number</Label>
								<Input
									id="registrationNumber"
									placeholder="Enter registration number"
									value={newBeneficiaryForm.registrationNumber}
									onChange={(e) =>
										setNewBeneficiaryForm((prev) => ({
											...prev,
											registrationNumber: e.target.value,
										}))
									}
								/>
							</div>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleCancel}
						className="cursor-pointer"
					>
						Cancel
					</Button>
					<Button
						onClick={handleAddBeneficiary}
						disabled={
							(beneficiaryType === "individual" &&
								(!newBeneficiaryForm.firstName ||
									!newBeneficiaryForm.lastName ||
									!newBeneficiaryForm.relationshipId)) ||
							(beneficiaryType === "charity" && !newBeneficiaryForm.charityName)
						}
						className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
					>
						Add Beneficiary
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
