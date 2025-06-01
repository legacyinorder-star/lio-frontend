import { useState } from "react";
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
import { ArrowLeft, ArrowRight, Edit2, Plus, Trash2 } from "lucide-react";

interface ChildrenStepProps {
	onNext: (data: { hasChildren: boolean; children: Child[] }) => void;
	onBack: () => void;
	initialData?: {
		hasChildren: boolean;
		children: Child[];
	};
}

export default function ChildrenStep({
	onNext,
	onBack,
	initialData,
}: ChildrenStepProps) {
	const [hasChildren, setHasChildren] = useState(
		initialData?.hasChildren ?? false
	);
	const [children, setChildren] = useState<Child[]>(
		initialData?.children ?? []
	);
	const [childDialogOpen, setChildDialogOpen] = useState(false);
	const [editingChild, setEditingChild] = useState<Child | null>(null);
	const [childForm, setChildForm] = useState<Omit<Child, "id">>({
		firstName: "",
		lastName: "",
		isMinor: false,
	});

	const handleSubmit = () => {
		onNext({
			hasChildren,
			children,
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

	const handleSaveChild = () => {
		if (!childForm.firstName || !childForm.lastName) {
			return;
		}

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

		setChildDialogOpen(false);
		setEditingChild(null);
		setChildForm({
			firstName: "",
			lastName: "",
			isMinor: false,
		});
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

	const handleRemoveChild = (childId: string) => {
		setChildren((prev) => prev.filter((child) => child.id !== childId));
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Do you have children?</div>
			<div className="text-muted-foreground">
				This information helps us create the appropriate provisions in your
				will, especially regarding guardianship for minor children.
			</div>
			{!hasChildren ? (
				<>
					<div className="flex space-x-4 mt-4">
						<Button
							variant="outline"
							onClick={() => setHasChildren(false)}
							className={`cursor-pointer ${
								!hasChildren
									? "bg-light-green text-black border-light-green"
									: ""
							}`}
						>
							No
						</Button>
						<Button
							variant="outline"
							onClick={() => setHasChildren(true)}
							className={`cursor-pointer ${
								hasChildren
									? "bg-light-green text-black border-light-green"
									: ""
							}`}
						>
							Yes
						</Button>
					</div>
					<div className="flex justify-end mt-6">
						<Button
							variant="outline"
							onClick={onBack}
							className="cursor-pointer"
						>
							<ArrowLeft className="mr-2 h-4 w-4" /> Back
						</Button>
					</div>
				</>
			) : (
				<div className="space-y-6 mt-6">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium">Your Children</h3>
						<Dialog open={childDialogOpen} onOpenChange={setChildDialogOpen}>
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
										>
											Cancel
										</Button>
										<Button
											onClick={handleSaveChild}
											className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
										>
											Save
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>

					{children.length === 0 ? (
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
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleRemoveChild(child.id)}
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
						<Button
							variant="outline"
							onClick={onBack}
							className="cursor-pointer"
						>
							<ArrowLeft className="mr-2 h-4 w-4" /> Back
						</Button>
						<div className="flex space-x-4">
							<Button
								variant="outline"
								onClick={() => setHasChildren(false)}
								className="cursor-pointer"
							>
								No Children
							</Button>
							<Button
								onClick={handleSubmit}
								disabled={children.length === 0}
								className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
							>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
