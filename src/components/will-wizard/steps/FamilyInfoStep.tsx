import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, Trash2, User, Baby, PawPrint } from "lucide-react";
import { useRelationships } from "@/context/RelationshipsContext";
import { toast } from "sonner";
import { SpouseData, Child, StepProps } from "../types/will.types";

interface FamilyInfoStepProps extends StepProps {
	// Additional props specific to FamilyInfoStep can be added here
}

interface Pet {
	id?: string;
	name: string;
	type: string;
	careInstructions: string;
	caretakerId?: string;
}

export default function FamilyInfoStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: FamilyInfoStepProps) {
	const {
		relationships,
		isLoading: relationshipsLoading,
		error: relationshipsError,
	} = useRelationships();

	const [hasSpouse, setHasSpouse] = useState(data?.hasSpouse || false);
	const [spouse, setSpouse] = useState<SpouseData>(
		data?.spouse || {
			firstName: "",
			lastName: "",
			relationship: "",
		}
	);

	const [hasChildren, setHasChildren] = useState(data?.hasChildren || false);
	const [children, setChildren] = useState<Child[]>(data?.children || []);

	const [hasPets, setHasPets] = useState(data?.hasPets || false);
	const [pets, setPets] = useState<Pet[]>([]);

	const [isSubmitting, setIsSubmitting] = useState(false);

	// Update parent data when local state changes
	useEffect(() => {
		onUpdate({
			hasSpouse,
			spouse: hasSpouse ? spouse : undefined,
			hasChildren,
			children: hasChildren ? children : [],
			hasPets,
		});
	}, [hasSpouse, spouse, hasChildren, children, hasPets, onUpdate]);

	const handleSpouseChange = (field: keyof SpouseData, value: string) => {
		setSpouse((prev) => ({ ...prev, [field]: value }));
	};

	const addChild = () => {
		const newChild: Child = {
			id: "",
			firstName: "",
			lastName: "",
			isMinor: true,
		};
		setChildren((prev) => [...prev, newChild]);
	};

	const updateChild = (
		index: number,
		field: keyof Child,
		value: string | boolean
	) => {
		setChildren((prev) =>
			prev.map((child, i) =>
				i === index ? { ...child, [field]: value } : child
			)
		);
	};

	const removeChild = (index: number) => {
		setChildren((prev) => prev.filter((_, i) => i !== index));
	};

	const addPet = () => {
		const newPet: Pet = {
			name: "",
			type: "",
			careInstructions: "",
		};
		setPets((prev) => [...prev, newPet]);
	};

	const updatePet = (index: number, field: keyof Pet, value: string) => {
		setPets((prev) =>
			prev.map((pet, i) => (i === index ? { ...pet, [field]: value } : pet))
		);
	};

	const removePet = (index: number) => {
		setPets((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			await onNext();
		} catch (error) {
			console.error("Error submitting family information:", error);
			toast.error("Failed to save family information");
		} finally {
			setIsSubmitting(false);
		}
	};

	const canProceed = () => {
		if (
			hasSpouse &&
			(!spouse.firstName || !spouse.lastName || !spouse.relationship)
		) {
			return false;
		}
		if (
			hasChildren &&
			children.some((child) => !child.firstName || !child.lastName)
		) {
			return false;
		}
		if (hasPets && pets.some((pet) => !pet.name || !pet.type)) {
			return false;
		}
		return true;
	};

	if (relationshipsLoading) {
		return (
			<div className="space-y-4">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					Family Information
				</div>
				<div className="text-muted-foreground">
					Loading relationship types...
				</div>
				<div className="flex justify-center py-8">
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black"></div>
						<span>Loading relationships...</span>
					</div>
				</div>
			</div>
		);
	}

	if (relationshipsError) {
		return (
			<div className="space-y-4">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-red-600">
					Error Loading Relationships
				</div>
				<div className="text-muted-foreground">
					Unable to load relationship types. Please refresh the page and try
					again.
				</div>
				<div className="text-sm text-red-500">Error: {relationshipsError}</div>
				<Button
					onClick={() => window.location.reload()}
					className="bg-red-600 hover:bg-red-700"
				>
					Refresh Page
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
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
					<div className="flex items-center space-x-2">
						<Checkbox
							id="hasSpouse"
							checked={hasSpouse}
							onCheckedChange={(checked) => setHasSpouse(checked as boolean)}
						/>
						<Label htmlFor="hasSpouse">I have a spouse or partner</Label>
					</div>

					{hasSpouse && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="spouseFirstName">First Name</Label>
								<Input
									id="spouseFirstName"
									value={spouse.firstName}
									onChange={(e) =>
										handleSpouseChange("firstName", e.target.value)
									}
									placeholder="Enter first name"
								/>
							</div>
							<div>
								<Label htmlFor="spouseLastName">Last Name</Label>
								<Input
									id="spouseLastName"
									value={spouse.lastName}
									onChange={(e) =>
										handleSpouseChange("lastName", e.target.value)
									}
									placeholder="Enter last name"
								/>
							</div>
							<div>
								<Label htmlFor="spouseRelationship">Relationship Type</Label>
								<Select
									value={spouse.relationship}
									onValueChange={(value) =>
										handleSpouseChange("relationship", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select relationship type" />
									</SelectTrigger>
									<SelectContent>
										{relationships.map((relationship) => (
											<SelectItem key={relationship.id} value={relationship.id}>
												{relationship.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
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
					<div className="flex items-center space-x-2">
						<Checkbox
							id="hasChildren"
							checked={hasChildren}
							onCheckedChange={(checked) => setHasChildren(checked as boolean)}
						/>
						<Label htmlFor="hasChildren">I have children</Label>
					</div>

					{hasChildren && (
						<div className="space-y-4">
							{children.map((child, index) => (
								<div key={index} className="border rounded-lg p-4 space-y-4">
									<div className="flex justify-between items-center">
										<h4 className="font-medium">Child {index + 1}</h4>
										<Button
											variant="outline"
											size="sm"
											onClick={() => removeChild(index)}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor={`childFirstName${index}`}>
												First Name
											</Label>
											<Input
												id={`childFirstName${index}`}
												value={child.firstName}
												onChange={(e) =>
													updateChild(index, "firstName", e.target.value)
												}
												placeholder="Enter first name"
											/>
										</div>
										<div>
											<Label htmlFor={`childLastName${index}`}>Last Name</Label>
											<Input
												id={`childLastName${index}`}
												value={child.lastName}
												onChange={(e) =>
													updateChild(index, "lastName", e.target.value)
												}
												placeholder="Enter last name"
											/>
										</div>
										<div className="flex items-center space-x-2">
											<Checkbox
												id={`childIsMinor${index}`}
												checked={child.isMinor}
												onCheckedChange={(checked) =>
													updateChild(index, "isMinor", checked as boolean)
												}
											/>
											<Label htmlFor={`childIsMinor${index}`}>Is a minor</Label>
										</div>
									</div>
								</div>
							))}
							<Button
								type="button"
								variant="outline"
								onClick={addChild}
								className="w-full"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Child
							</Button>
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
					<div className="flex items-center space-x-2">
						<Checkbox
							id="hasPets"
							checked={hasPets}
							onCheckedChange={(checked) => setHasPets(checked as boolean)}
						/>
						<Label htmlFor="hasPets">I have pets that need care</Label>
					</div>

					{hasPets && (
						<div className="space-y-4">
							{pets.map((pet, index) => (
								<div key={index} className="border rounded-lg p-4 space-y-4">
									<div className="flex justify-between items-center">
										<h4 className="font-medium">Pet {index + 1}</h4>
										<Button
											variant="outline"
											size="sm"
											onClick={() => removePet(index)}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor={`petName${index}`}>Pet Name</Label>
											<Input
												id={`petName${index}`}
												value={pet.name}
												onChange={(e) =>
													updatePet(index, "name", e.target.value)
												}
												placeholder="Enter pet name"
											/>
										</div>
										<div>
											<Label htmlFor={`petType${index}`}>Pet Type</Label>
											<Input
												id={`petType${index}`}
												value={pet.type}
												onChange={(e) =>
													updatePet(index, "type", e.target.value)
												}
												placeholder="e.g., Dog, Cat, Bird"
											/>
										</div>
										<div className="md:col-span-2">
											<Label htmlFor={`petCareInstructions${index}`}>
												Care Instructions
											</Label>
											<Input
												id={`petCareInstructions${index}`}
												value={pet.careInstructions}
												onChange={(e) =>
													updatePet(index, "careInstructions", e.target.value)
												}
												placeholder="Enter care instructions"
											/>
										</div>
									</div>
								</div>
							))}
							<Button
								type="button"
								variant="outline"
								onClick={addPet}
								className="w-full"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Pet
							</Button>
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
				>
					Back
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
		</div>
	);
}
