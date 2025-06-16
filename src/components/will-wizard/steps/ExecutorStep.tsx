import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RelationshipSelect } from "@/components/ui/relationship-select";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Plus, Trash2, Edit2 } from "lucide-react";

// Add this type after the other type definitions
interface Executor {
	id: string;
	type: "individual" | "corporate";
	// Individual executor fields
	firstName?: string;
	lastName?: string;
	relationshipId?: string;
	// Corporate executor fields
	name?: string;
	rc_number?: string;
	isPrimary: boolean;
}

export type ExecutorData = Executor[];

interface ExecutorStepProps {
	data: Partial<ExecutorData>;
	onUpdate: (data: ExecutorData) => void;
	onNext?: () => void;
	onBack?: () => void;
}

export default function ExecutorStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: ExecutorStepProps) {
	const [executorDialogOpen, setExecutorDialogOpen] = useState(false);
	const [editingExecutor, setEditingExecutor] = useState<Executor | null>(null);
	const [executors, setExecutors] = useState<Executor[]>(
		Array.isArray(data)
			? data.filter((executor): executor is Executor => executor !== undefined)
			: []
	);
	const prevExecutorsRef = useRef<Executor[]>([]);

	const [executorForm, setExecutorForm] = useState<Executor>({
		id: "",
		type: "individual",
		firstName: "",
		lastName: "",
		relationshipId: "",
		name: "",
		rc_number: "",
		isPrimary: false,
	});

	// Helper function to check if form is valid
	const isFormValid = () => {
		if (executorForm.type === "individual") {
			return (
				executorForm.firstName &&
				executorForm.lastName &&
				executorForm.relationshipId
			);
		} else {
			return executorForm.name && executorForm.rc_number;
		}
	};

	// Add executor form handlers
	const handleExecutorFormChange = (field: keyof Executor) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			setExecutorForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};
	};

	const handleSaveExecutor = () => {
		if (!isFormValid()) {
			return;
		}

		// If this is a primary executor, ensure no other primary exists
		if (executorForm.isPrimary) {
			setExecutors((prev) =>
				prev.map((e) => ({
					...e,
					isPrimary: false,
				}))
			);
		}

		if (editingExecutor) {
			setExecutors((prev) =>
				prev.map((executor) =>
					executor.id === editingExecutor.id ? executorForm : executor
				)
			);
		} else {
			setExecutors((prev) => [
				...prev,
				{ ...executorForm, id: crypto.randomUUID() },
			]);
		}

		// Reset form and close dialog
		setExecutorForm({
			id: "",
			type: "individual",
			firstName: "",
			lastName: "",
			relationshipId: "",
			name: "",
			rc_number: "",
			isPrimary: false,
		});
		setEditingExecutor(null);
		setExecutorDialogOpen(false);
	};

	const handleEditExecutor = (executor: Executor) => {
		setExecutorForm(executor);
		setEditingExecutor(executor);
		setExecutorDialogOpen(true);
	};

	const handleRemoveExecutor = (executorId: string) => {
		setExecutors((prev) =>
			prev.filter((executor) => executor.id !== executorId)
		);
	};

	// Update parent component when executors change
	useEffect(() => {
		// Only update if executors have actually changed
		if (
			JSON.stringify(executors) !== JSON.stringify(prevExecutorsRef.current)
		) {
			prevExecutorsRef.current = executors;
			onUpdate(executors);
		}
	}, [executors, onUpdate]);

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">
				Appoint Executors for Your Estate
			</div>
			<div className="text-muted-foreground">
				Executors are responsible for carrying out the terms of your will. You
				should appoint at least one executor, and it's recommended to have a
				backup executor in case the primary executor is unable to serve.
			</div>
			<div className="space-y-6 mt-6">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-medium">Appointed Executors</h3>
					<Dialog
						open={executorDialogOpen}
						onOpenChange={setExecutorDialogOpen}
					>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								onClick={() => {
									setExecutorForm({
										id: "",
										type: "individual",
										firstName: "",
										lastName: "",
										relationshipId: "",
										name: "",
										rc_number: "",
										isPrimary: false,
									});
									setEditingExecutor(null);
								}}
								className="cursor-pointer"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Executor
							</Button>
						</DialogTrigger>
						<DialogContent className="bg-white max-w-2xl">
							<DialogHeader>
								<DialogTitle>
									{editingExecutor ? "Edit Executor" : "Add Executor"}
								</DialogTitle>
								<DialogDescription>
									Add an executor who will be responsible for carrying out the
									terms of your will. You can appoint either an individual or a
									corporate executor.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="flex space-x-4 mb-4">
									<Button
										variant={
											executorForm.type === "individual" ? "default" : "outline"
										}
										onClick={() =>
											setExecutorForm((prev) => ({
												...prev,
												type: "individual",
											}))
										}
										className={`cursor-pointer ${
											executorForm.type === "individual"
												? "bg-light-green text-black"
												: ""
										}`}
									>
										Individual Executor
									</Button>
									<Button
										variant={
											executorForm.type === "corporate" ? "default" : "outline"
										}
										onClick={() =>
											setExecutorForm((prev) => ({
												...prev,
												type: "corporate",
											}))
										}
										className={`cursor-pointer ${
											executorForm.type === "corporate"
												? "bg-light-green text-black"
												: ""
										}`}
									>
										Corporate Executor
									</Button>
								</div>

								{executorForm.type === "individual" ? (
									<>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="executorFirstName">First Name</Label>
												<Input
													id="executorFirstName"
													value={executorForm.firstName}
													onChange={handleExecutorFormChange("firstName")}
													placeholder="John"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="executorLastName">Last Name</Label>
												<Input
													id="executorLastName"
													value={executorForm.lastName}
													onChange={handleExecutorFormChange("lastName")}
													placeholder="Doe"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="executorRelationship">
												Relationship to You
											</Label>
											<RelationshipSelect
												value={executorForm.relationshipId || ""}
												onValueChange={(value) => {
													const event = {
														target: { value },
													} as React.ChangeEvent<HTMLInputElement>;
													handleExecutorFormChange("relationshipId")(event);
												}}
												required
											/>
										</div>
									</>
								) : (
									<>
										<div className="space-y-2">
											<Label htmlFor="companyName">Company Name</Label>
											<Input
												id="companyName"
												value={executorForm.name}
												onChange={handleExecutorFormChange("name")}
												placeholder="Enter company name"
											/>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="registrationNumber">
													Registration Number
												</Label>
												<Input
													id="registrationNumber"
													value={executorForm.rc_number}
													onChange={handleExecutorFormChange("rc_number")}
													placeholder="Enter company registration number"
												/>
											</div>
										</div>
									</>
								)}

								<div className="flex items-center space-x-2">
									<Checkbox
										id="isPrimaryExecutor"
										checked={executorForm.isPrimary}
										onCheckedChange={(checked: boolean) =>
											setExecutorForm((prev) => ({
												...prev,
												isPrimary: checked,
											}))
										}
									/>
									<Label htmlFor="isPrimaryExecutor" className="text-sm">
										Appoint as Primary Executor
									</Label>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										onClick={() => setExecutorDialogOpen(false)}
										className="cursor-pointer"
									>
										Cancel
									</Button>
									<Button
										onClick={handleSaveExecutor}
										disabled={!isFormValid()}
										className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
									>
										Save
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{executors.length === 0 ? (
					<p className="text-muted-foreground text-center py-4">
						No executors added yet. Click "Add Executor" to appoint executors
						for your estate.
					</p>
				) : (
					<div className="space-y-4">
						{executors.map((executor) => (
							<Card key={executor.id}>
								<CardContent className="p-4">
									<div className="flex justify-between items-start">
										<div className="space-y-1">
											<p className="font-medium">
												{executor.type === "individual" ? (
													<>
														{executor.firstName} {executor.lastName}
														<span className="text-sm text-muted-foreground ml-2">
															({executor.relationshipId})
														</span>
													</>
												) : (
													<>
														{executor.name}
														<span className="text-sm text-muted-foreground ml-2">
															(Corporate Executor)
														</span>
														<div className="text-sm text-muted-foreground">
															RC Number: {executor.rc_number}
														</div>
													</>
												)}
												{executor.isPrimary && (
													<span className="ml-2 text-sm text-primary">
														(Primary Executor)
													</span>
												)}
											</p>
										</div>
										<div className="flex space-x-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEditExecutor(executor)}
												className="cursor-pointer"
											>
												<Edit2 className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleRemoveExecutor(executor.id)}
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
						disabled={executors.length === 0}
						className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
					>
						Next <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
