import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RelationshipSelect } from "@/components/ui/relationship-select";
import { ArrowLeft, ArrowRight, Edit2, Plus, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Child, Guardian } from "../types/will.types";

const childrenSchema = z.object({
	hasChildren: z.boolean(),
});

interface ChildrenStepProps {
	onNext: (data: {
		hasChildren: boolean;
		children: Child[];
		guardians: Guardian[];
	}) => void;
	onBack: () => void;
	initialData?: {
		hasChildren: boolean;
		children: Child[];
		guardians: Guardian[];
	};
}

export default function ChildrenStep({
	onNext,
	onBack,
	initialData,
}: ChildrenStepProps) {
	const [childDialogOpen, setChildDialogOpen] = useState(false);
	const [guardianDialogOpen, setGuardianDialogOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<Child | null>(null);
	const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
	const [children, setChildren] = useState<Child[]>(
		initialData?.children || []
	);
	const [guardians, setGuardians] = useState<Guardian[]>(
		initialData?.guardians || []
	);

	const [childForm, setChildForm] = useState<Omit<Child, "id">>({
		firstName: "",
		lastName: "",
		isMinor: false,
	});

	const [guardianForm, setGuardianForm] = useState<Omit<Guardian, "id">>({
		firstName: "",
		lastName: "",
		relationship: "",
		isPrimary: false,
	});

	const form = useForm<z.infer<typeof childrenSchema>>({
		resolver: zodResolver(childrenSchema),
		defaultValues: {
			hasChildren: initialData?.hasChildren ?? false,
		},
	});

	const handleSubmit = (values: z.infer<typeof childrenSchema>) => {
		onNext({
			hasChildren: values.hasChildren,
			children,
			guardians,
		});
	};

	const handleChildFormChange =
		(field: keyof Omit<Child, "id">) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setChildForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleGuardianFormChange =
		(field: keyof Omit<Guardian, "id">) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setGuardianForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const handleSaveChild = () => {
		if (editingChild) {
			setChildren((prev) =>
				prev.map((child) =>
					child.id === editingChild.id ? { ...childForm, id: child.id } : child
				)
			);
		} else {
			setChildren((prev) => [
				...prev,
				{ ...childForm, id: crypto.randomUUID() },
			]);
		}
		setChildForm({ firstName: "", lastName: "", isMinor: false });
		setEditingChild(null);
		setChildDialogOpen(false);
	};

	const handleSaveGuardian = () => {
		if (editingGuardian) {
			setGuardians((prev) =>
				prev.map((guardian) =>
					guardian.id === editingGuardian.id
						? { ...guardianForm, id: guardian.id }
						: guardian
				)
			);
		} else {
			setGuardians((prev) => [
				...prev,
				{ ...guardianForm, id: crypto.randomUUID() },
			]);
		}
		setGuardianForm({
			firstName: "",
			lastName: "",
			relationship: "",
			isPrimary: false,
		});
		setEditingGuardian(null);
		setGuardianDialogOpen(false);
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

	const handleEditGuardian = (guardian: Guardian) => {
		setEditingGuardian(guardian);
		setGuardianForm({
			firstName: guardian.firstName,
			lastName: guardian.lastName,
			relationship: guardian.relationship,
			isPrimary: guardian.isPrimary,
		});
		setGuardianDialogOpen(true);
	};

	const handleRemoveChild = (childId: string) => {
		setChildren((prev) => prev.filter((child) => child.id !== childId));
	};

	const handleRemoveGuardian = (guardianId: string) => {
		setGuardians((prev) =>
			prev.filter((guardian) => guardian.id !== guardianId)
		);
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Do you have any children?</div>
			<div className="text-muted-foreground">
				This includes biological children, adopted children, and step-children.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="hasChildren"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={(checked) => {
											field.onChange(checked);
											if (!checked) {
												setChildren([]);
												setGuardians([]);
											}
										}}
									/>
								</FormControl>
								<FormLabel>Yes, I have children</FormLabel>
							</FormItem>
						)}
					/>

					{form.watch("hasChildren") && (
						<div className="space-y-6">
							{/* Children Section */}
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<h3 className="text-lg font-medium">Your Children</h3>
									<Dialog
										open={childDialogOpen}
										onOpenChange={setChildDialogOpen}
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
												disabled={children.length >= 5}
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
														/>
													</div>
													<div className="space-y-2">
														<Label htmlFor="childLastName">Last Name</Label>
														<Input
															id="childLastName"
															value={childForm.lastName}
															onChange={handleChildFormChange("lastName")}
															placeholder="Doe"
														/>
													</div>
												</div>
												<div className="flex items-center space-x-2">
													<Checkbox
														id="isMinor"
														checked={childForm.isMinor}
														onCheckedChange={(checked) =>
															setChildForm((prev) => ({
																...prev,
																isMinor: checked as boolean,
															}))
														}
													/>
													<Label htmlFor="isMinor">Is a minor (under 18)</Label>
												</div>
												<div className="flex justify-end space-x-2">
													<Button
														type="button"
														variant="outline"
														onClick={() => setChildDialogOpen(false)}
													>
														Cancel
													</Button>
													<Button
														type="button"
														onClick={handleSaveChild}
														className="bg-light-green hover:bg-light-green/90 text-black"
													>
														Save
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</div>

								{children.length > 0 && (
									<div className="space-y-2">
										{children.map((child) => (
											<div
												key={child.id}
												className="flex justify-between items-center p-4 border rounded-lg"
											>
												<div>
													<p className="font-medium">
														{child.firstName} {child.lastName}
													</p>
													{child.isMinor && (
														<p className="text-sm text-muted-foreground">
															Minor
														</p>
													)}
												</div>
												<div className="flex space-x-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => handleEditChild(child)}
													>
														<Edit2 className="h-4 w-4 mr-2" />
														Edit
													</Button>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => handleRemoveChild(child.id)}
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Remove
													</Button>
												</div>
											</div>
										))}
									</div>
								)}

								{/* Guardians Section */}
								{children.some((child) => child.isMinor) && (
									<div className="space-y-4 mt-6">
										<div className="flex justify-between items-center">
											<h3 className="text-lg font-medium">
												Guardians for Minor Children
											</h3>
											<Dialog
												open={guardianDialogOpen}
												onOpenChange={setGuardianDialogOpen}
											>
												<DialogTrigger asChild>
													<Button
														variant="outline"
														onClick={() => {
															setGuardianForm({
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
															{editingGuardian
																? "Edit Guardian"
																: "Add Guardian"}
														</DialogTitle>
													</DialogHeader>
													<div className="space-y-4 py-4">
														<div className="grid grid-cols-2 gap-4">
															<div className="space-y-2">
																<Label htmlFor="guardianFirstName">
																	First Name
																</Label>
																<Input
																	id="guardianFirstName"
																	value={guardianForm.firstName}
																	onChange={handleGuardianFormChange(
																		"firstName"
																	)}
																	placeholder="John"
																/>
															</div>
															<div className="space-y-2">
																<Label htmlFor="guardianLastName">
																	Last Name
																</Label>
																<Input
																	id="guardianLastName"
																	value={guardianForm.lastName}
																	onChange={handleGuardianFormChange(
																		"lastName"
																	)}
																	placeholder="Doe"
																/>
															</div>
														</div>
														<div className="space-y-2">
															<Label>Relationship to Children</Label>
															<RelationshipSelect
																value={guardianForm.relationship}
																onValueChange={(value) =>
																	setGuardianForm((prev) => ({
																		...prev,
																		relationship: value,
																	}))
																}
																excludeRelationships={["spouse", "child"]}
															/>
														</div>
														<div className="flex items-center space-x-2">
															<Checkbox
																id="isPrimary"
																checked={guardianForm.isPrimary}
																onCheckedChange={(checked) =>
																	setGuardianForm((prev) => ({
																		...prev,
																		isPrimary: checked as boolean,
																	}))
																}
															/>
															<Label htmlFor="isPrimary">
																Primary Guardian
															</Label>
														</div>
														<div className="flex justify-end space-x-2">
															<Button
																type="button"
																variant="outline"
																onClick={() => setGuardianDialogOpen(false)}
															>
																Cancel
															</Button>
															<Button
																type="button"
																onClick={handleSaveGuardian}
																className="bg-light-green hover:bg-light-green/90 text-black"
															>
																Save
															</Button>
														</div>
													</div>
												</DialogContent>
											</Dialog>
										</div>

										{guardians.length > 0 && (
											<div className="space-y-2">
												{guardians.map((guardian) => (
													<div
														key={guardian.id}
														className="flex justify-between items-center p-4 border rounded-lg"
													>
														<div>
															<p className="font-medium">
																{guardian.firstName} {guardian.lastName}
															</p>
															<p className="text-sm text-muted-foreground">
																{guardian.relationship}
																{guardian.isPrimary && " (Primary)"}
															</p>
														</div>
														<div className="flex space-x-2">
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => handleEditGuardian(guardian)}
															>
																<Edit2 className="h-4 w-4 mr-2" />
																Edit
															</Button>
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() =>
																	handleRemoveGuardian(guardian.id)
																}
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
								)}
							</div>
						</div>
					)}

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
						>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
