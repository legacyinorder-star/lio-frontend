import { useState, useEffect, useRef } from "react";
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
import { apiClient } from "@/utils/apiClient";
import { useWill } from "@/context/WillContext";
import { toast } from "sonner";

const witnessSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	address: z.object({
		address: z.string().min(1, "Address is required"),
		city: z.string().min(1, "City is required"),
		state: z.string().min(1, "State is required"),
		postCode: z.string().min(1, "Post code is required"),
		country: z.string().min(1, "Country is required"),
	}),
});

interface WitnessesStepProps {
	data: Partial<{ witnesses: Witness[] }>;
	onUpdate: (data: Partial<{ witnesses: Witness[] }>) => void;
	onNext: () => void;
	onBack: () => void;
}

export default function WitnessesStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: WitnessesStepProps) {
	const [witnesses, setWitnesses] = useState<Witness[]>(data?.witnesses || []);
	const [witnessDialogOpen, setWitnessDialogOpen] = useState(false);
	const [editingWitness, setEditingWitness] = useState<Witness | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingWitnesses, setIsLoadingWitnesses] = useState(false);
	const { activeWill } = useWill();
	const prevWitnessesRef = useRef<Witness[]>([]);

	const [witnessForm, setWitnessForm] = useState<Omit<Witness, "id">>({
		firstName: "",
		lastName: "",
		address: {
			address: "",
			city: "",
			state: "",
			postCode: "",
			country: "",
		},
	});

	const form = useForm<z.infer<typeof witnessSchema>>({
		resolver: zodResolver(witnessSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			address: {
				address: "",
				city: "",
				state: "",
				postCode: "",
				country: "",
			},
		},
	});

	const handleSubmit = () => {
		onNext();
	};

	// Update parent component when witnesses change
	useEffect(() => {
		// Only update if witnesses have actually changed
		if (
			JSON.stringify(witnesses) !== JSON.stringify(prevWitnessesRef.current)
		) {
			prevWitnessesRef.current = witnesses;
			onUpdate({ witnesses });
		}
	}, [witnesses, onUpdate]);

	// API response interface for witnesses
	interface WitnessApiResponse {
		id: string;
		will_id: string;
		first_name: string;
		last_name: string;
		address: string;
		city: string;
		state: string;
		post_code: string;
		country: string;
	}

	// Load existing witnesses
	const loadWitnesses = async () => {
		if (!activeWill?.id) return;

		setIsLoadingWitnesses(true);
		try {
			const { data, error } = await apiClient<WitnessApiResponse[]>(
				`/witnesses/get-by-will/${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error) {
				if (error.includes("404")) {
					console.log("No existing witnesses found");
					return;
				}
				toast.error("Failed to load witnesses");
				return;
			}

			if (data && data.length > 0) {
				const loadedWitnesses: Witness[] = data.map((apiWitness) => ({
					id: apiWitness.id,
					firstName: apiWitness.first_name,
					lastName: apiWitness.last_name,
					address: {
						address: apiWitness.address,
						city: apiWitness.city,
						state: apiWitness.state,
						postCode: apiWitness.post_code,
						country: apiWitness.country,
					},
				}));
				setWitnesses(loadedWitnesses);
			}
		} catch (err) {
			console.error("Error loading witnesses:", err);
			toast.error("Failed to load witnesses");
		} finally {
			setIsLoadingWitnesses(false);
		}
	};

	// Load witnesses on component mount
	useEffect(() => {
		loadWitnesses();
	}, [activeWill?.id]);

	const handleSkip = () => {
		// Update with empty witnesses array and proceed
		onUpdate({ witnesses: [] });
		onNext();
	};

	// Individual form handlers
	const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWitnessForm((prev) => ({ ...prev, firstName: e.target.value }));
	};

	const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWitnessForm((prev) => ({ ...prev, lastName: e.target.value }));
	};

	const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWitnessForm((prev) => ({
			...prev,
			address: { ...prev.address, address: e.target.value },
		}));
	};

	const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWitnessForm((prev) => ({
			...prev,
			address: { ...prev.address, city: e.target.value },
		}));
	};

	const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWitnessForm((prev) => ({
			...prev,
			address: { ...prev.address, state: e.target.value },
		}));
	};

	const handlePostCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWitnessForm((prev) => ({
			...prev,
			address: { ...prev.address, postCode: e.target.value },
		}));
	};

	const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWitnessForm((prev) => ({
			...prev,
			address: { ...prev.address, country: e.target.value },
		}));
	};

	const handleSaveWitness = async () => {
		if (
			!witnessForm.firstName ||
			!witnessForm.lastName ||
			!witnessForm.address.address ||
			!witnessForm.address.city ||
			!witnessForm.address.state ||
			!witnessForm.address.postCode ||
			!witnessForm.address.country ||
			!activeWill?.id
		) {
			return;
		}

		setIsSubmitting(true);
		try {
			const payload = {
				will_id: activeWill.id,
				first_name: witnessForm.firstName,
				last_name: witnessForm.lastName,
				address: witnessForm.address.address,
				city: witnessForm.address.city,
				state: witnessForm.address.state,
				post_code: witnessForm.address.postCode,
				country: witnessForm.address.country,
			};

			if (editingWitness) {
				// PATCH request for editing
				const { error } = await apiClient<WitnessApiResponse>(
					`/witnesses/${editingWitness.id}`,
					{
						method: "PATCH",
						body: JSON.stringify(payload),
					}
				);

				if (error) {
					toast.error("Failed to update witness");
					return;
				}

				// Update local state
				setWitnesses((prev) =>
					prev.map((witness) =>
						witness.id === editingWitness.id
							? { ...witnessForm, id: witness.id }
							: witness
					)
				);
				toast.success("Witness updated successfully");
			} else {
				// POST request for creating
				const { data, error } = await apiClient<WitnessApiResponse>(
					"/witnesses",
					{
						method: "POST",
						body: JSON.stringify(payload),
					}
				);

				if (error) {
					toast.error("Failed to create witness");
					return;
				}

				if (!data) {
					toast.error("Failed to create witness - no data returned");
					return;
				}

				// Add to local state
				setWitnesses((prev) => [...prev, { ...witnessForm, id: data.id }]);
				toast.success("Witness added successfully");
			}

			// Reset form
			setWitnessForm({
				firstName: "",
				lastName: "",
				address: {
					address: "",
					city: "",
					state: "",
					postCode: "",
					country: "",
				},
			});
			setEditingWitness(null);
			setWitnessDialogOpen(false);
		} catch (err) {
			console.error("Error saving witness:", err);
			toast.error("Failed to save witness");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditWitness = (witness: Witness) => {
		setEditingWitness(witness);
		setWitnessForm({
			firstName: witness.firstName,
			lastName: witness.lastName,
			address: witness.address,
		});
		setWitnessDialogOpen(true);
	};

	const handleRemoveWitness = async (witnessId: string) => {
		if (!activeWill?.id) return;

		try {
			const { error } = await apiClient(`/witnesses/${witnessId}`, {
				method: "DELETE",
			});

			if (error) {
				toast.error("Failed to delete witness");
				return;
			}

			// Remove from local state
			setWitnesses((prev) =>
				prev.filter((witness) => witness.id !== witnessId)
			);
			toast.success("Witness removed successfully");
		} catch (err) {
			console.error("Error deleting witness:", err);
			toast.error("Failed to delete witness");
		}
	};

	const resetForm = () => {
		setWitnessForm({
			firstName: "",
			lastName: "",
			address: {
				address: "",
				city: "",
				state: "",
				postCode: "",
				country: "",
			},
		});
		setEditingWitness(null);
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
										onClick={resetForm}
										className="cursor-pointer"
										disabled={witnesses.length >= 2}
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
													onChange={handleFirstNameChange}
													placeholder="First name"
												/>
											</div>
											<div className="space-y-2">
												<Label>Last Name</Label>
												<Input
													value={witnessForm.lastName}
													onChange={handleLastNameChange}
													placeholder="Last name"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label>Street Address</Label>
											<Input
												value={witnessForm.address.address}
												onChange={handleAddressChange}
												placeholder="Street address"
											/>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>City</Label>
												<Input
													value={witnessForm.address.city}
													onChange={handleCityChange}
													placeholder="City"
												/>
											</div>
											<div className="space-y-2">
												<Label>State</Label>
												<Input
													value={witnessForm.address.state}
													onChange={handleStateChange}
													placeholder="State"
												/>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>Post Code</Label>
												<Input
													value={witnessForm.address.postCode}
													onChange={handlePostCodeChange}
													placeholder="Post code"
												/>
											</div>
											<div className="space-y-2">
												<Label>Country</Label>
												<Input
													value={witnessForm.address.country}
													onChange={handleCountryChange}
													placeholder="Country"
												/>
											</div>
										</div>
										<div className="flex justify-end space-x-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setWitnessDialogOpen(false)}
												disabled={isSubmitting}
												className="cursor-pointer"
											>
												Cancel
											</Button>
											<Button
												type="button"
												onClick={handleSaveWitness}
												disabled={isSubmitting}
												className="bg-light-green hover:bg-light-green/90 text-black cursor-pointer"
											>
												{isSubmitting ? "Saving..." : "Save"}
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>

						{isLoadingWitnesses ? (
							<p className="text-muted-foreground text-center py-4">
								Loading witnesses...
							</p>
						) : witnesses.length === 0 ? (
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
												{witness.address.address}, {witness.address.city},{" "}
												{witness.address.state} {witness.address.postCode},{" "}
												{witness.address.country}
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
						<div className="flex space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={handleSkip}
								className="cursor-pointer"
							>
								Skip
							</Button>
							<Button
								type="submit"
								className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
								disabled={witnesses.length !== 2}
							>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
