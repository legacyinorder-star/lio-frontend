import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Edit2, Plus, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Witness } from "../types/will.types";

const witnessSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	address: z.string().min(1, "Address is required"),
	phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

interface WitnessesStepProps {
	onNext: (data: { witnesses: Witness[] }) => void;
	onBack: () => void;
	initialData?: {
		witnesses: Witness[];
	};
}

export default function WitnessesStep({
	onNext,
	onBack,
	initialData,
}: WitnessesStepProps) {
	const [witnesses, setWitnesses] = useState<Witness[]>(
		initialData?.witnesses || []
	);
	const [witnessDialogOpen, setWitnessDialogOpen] = useState(false);
	const [editingWitness, setEditingWitness] = useState<Witness | null>(null);

	const [witnessForm, setWitnessForm] = useState<Omit<Witness, "id">>({
		firstName: "",
		lastName: "",
		address: "",
		phone: "",
	});

	const form = useForm<z.infer<typeof witnessSchema>>({
		resolver: zodResolver(witnessSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			address: "",
			phone: "",
		},
	});

	const handleSubmit = () => {
		onNext({ witnesses });
	};

	const handleWitnessFormChange =
		(field: keyof Omit<Witness, "id">) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setWitnessForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleSaveWitness = () => {
		if (
			!witnessForm.firstName ||
			!witnessForm.lastName ||
			!witnessForm.address ||
			!witnessForm.phone
		) {
			return;
		}

		if (editingWitness) {
			setWitnesses((prev) =>
				prev.map((witness) =>
					witness.id === editingWitness.id
						? { ...witnessForm, id: witness.id }
						: witness
				)
			);
		} else {
			setWitnesses((prev) => [
				...prev,
				{ ...witnessForm, id: crypto.randomUUID() },
			]);
		}

		setWitnessForm({
			firstName: "",
			lastName: "",
			address: "",
			phone: "",
		});
		setEditingWitness(null);
		setWitnessDialogOpen(false);
	};

	const handleEditWitness = (witness: Witness) => {
		setEditingWitness(witness);
		setWitnessForm({
			firstName: witness.firstName,
			lastName: witness.lastName,
			address: witness.address,
			phone: witness.phone,
		});
		setWitnessDialogOpen(true);
	};

	const handleRemoveWitness = (witnessId: string) => {
		setWitnesses((prev) => prev.filter((witness) => witness.id !== witnessId));
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Add Witnesses</div>
			<div className="text-muted-foreground">
				Your will needs to be signed by two witnesses who are not beneficiaries.
				Please provide their information below.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Your Witnesses</h3>
							<Dialog
								open={witnessDialogOpen}
								onOpenChange={setWitnessDialogOpen}
							>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										onClick={() => {
											setWitnessForm({
												firstName: "",
												lastName: "",
												address: "",
												phone: "",
											});
											setEditingWitness(null);
										}}
										className="cursor-pointer"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Witness
									</Button>
								</DialogTrigger>
								<DialogContent className="bg-white">
									<DialogHeader>
										<DialogTitle>
											{editingWitness ? "Edit Witness" : "Add Witness"}
										</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>First Name</Label>
												<Input
													value={witnessForm.firstName}
													onChange={handleWitnessFormChange("firstName")}
													placeholder="First name"
												/>
											</div>
											<div className="space-y-2">
												<Label>Last Name</Label>
												<Input
													value={witnessForm.lastName}
													onChange={handleWitnessFormChange("lastName")}
													placeholder="Last name"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label>Address</Label>
											<Input
												value={witnessForm.address}
												onChange={handleWitnessFormChange("address")}
												placeholder="Full address"
											/>
										</div>
										<div className="space-y-2">
											<Label>Phone Number</Label>
											<Input
												value={witnessForm.phone}
												onChange={handleWitnessFormChange("phone")}
												placeholder="Phone number"
												type="tel"
											/>
										</div>
										<div className="flex justify-end space-x-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setWitnessDialogOpen(false)}
											>
												Cancel
											</Button>
											<Button
												type="button"
												onClick={handleSaveWitness}
												className="bg-light-green hover:bg-light-green/90 text-black"
											>
												Save
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>

						{witnesses.length === 0 ? (
							<p className="text-muted-foreground text-center py-4">
								No witnesses added yet. Click "Add Witness" to add witness
								information.
							</p>
						) : (
							<div className="space-y-4">
								{witnesses.map((witness) => (
									<div
										key={witness.id}
										className="flex justify-between items-start p-4 border rounded-lg"
									>
										<div className="space-y-1">
											<p className="font-medium">
												{witness.firstName} {witness.lastName}
											</p>
											<p className="text-sm text-muted-foreground">
												{witness.address}
											</p>
											<p className="text-sm text-muted-foreground">
												{witness.phone}
											</p>
										</div>
										<div className="flex space-x-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => handleEditWitness(witness)}
											>
												<Edit2 className="h-4 w-4 mr-2" />
												Edit
											</Button>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => handleRemoveWitness(witness.id)}
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Remove
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

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
							type="submit"
							className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
							disabled={witnesses.length < 2}
						>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
