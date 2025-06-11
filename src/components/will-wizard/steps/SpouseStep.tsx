import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SpouseDialog, { SpouseData } from "../SpouseDialog";
import { ArrowLeft, ArrowRight, Edit2, User } from "lucide-react";
import { useWill } from "@/context/WillContext";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useRelationships } from "@/hooks/useRelationships";

const spouseSchema = z.object({
	hasSpouse: z.boolean(),
});

interface SpouseStepProps {
	onNext: (data: { hasSpouse: boolean; spouse?: SpouseData }) => void;
	onBack: () => void;
	initialData?: {
		hasSpouse: boolean;
		spouse?: SpouseData;
	};
}

interface WillOwnerResponse {
	id: string;
}

interface PersonResponse {
	id: string;
	will_id: string;
	first_name: string;
	last_name: string;
	relationship_id: string;
	is_minor: boolean;
	created_at: string;
}

export default function SpouseStep({
	onNext,
	onBack,
	initialData,
}: SpouseStepProps) {
	const { activeWill, setActiveWill } = useWill();
	const { relationships } = useRelationships();
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
	const [spouseData, setSpouseData] = useState<SpouseData | undefined>(
		initialData?.spouse
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<z.infer<typeof spouseSchema>>({
		resolver: zodResolver(spouseSchema),
		defaultValues: {
			hasSpouse: initialData?.hasSpouse ?? false,
		},
	});

	// Pre-fill spouse data from active will when component loads
	useEffect(() => {
		if (activeWill?.spouse) {
			setSpouseData({
				firstName: activeWill.spouse.firstName,
				lastName: activeWill.spouse.lastName,
			});
			form.setValue("hasSpouse", true);
		} else if (initialData?.spouse) {
			setSpouseData(initialData.spouse);
			form.setValue("hasSpouse", initialData.hasSpouse);
		}
	}, [activeWill, initialData, form]);

	const handleSubmit = (values: z.infer<typeof spouseSchema>) => {
		onNext({
			hasSpouse: values.hasSpouse,
			spouse: spouseData,
		});
	};

	const handleSpouseData = async (data: SpouseData) => {
		setIsSubmitting(true);

		try {
			// Check if we have an active will with owner ID
			if (!activeWill?.owner?.id) {
				toast.error(
					"Will owner information not found. Please start from the beginning."
				);
				return;
			}

			// Find the spouse relationship ID
			const spouseRelationship = relationships.find(
				(rel) => rel.name.toLowerCase() === "spouse"
			);

			if (!spouseRelationship) {
				toast.error("Spouse relationship type not found. Please try again.");
				return;
			}

			// Check if we're editing an existing spouse or creating a new one
			const isEditing = !!activeWill.spouse?.id;

			if (isEditing && activeWill.spouse) {
				// Update existing spouse record
				const updateData = {
					first_name: data.firstName,
					last_name: data.lastName,
				};

				const { error: updateError } = await apiClient<PersonResponse>(
					`/people/${activeWill.spouse.id}`,
					{
						method: "PATCH",
						body: JSON.stringify(updateData),
					}
				);

				if (updateError) {
					console.error("Error updating spouse record:", updateError);
					toast.error("Failed to update spouse information. Please try again.");
					return;
				}

				// Update spouse information in active will
				setActiveWill({
					...activeWill,
					spouse: {
						...activeWill.spouse,
						firstName: data.firstName,
						lastName: data.lastName,
					},
				});
			} else {
				// Step 1: Update marital status to "married" (only for new spouses)
				const maritalStatusData = {
					marital_status: "married",
				};

				const { error: maritalError } = await apiClient<WillOwnerResponse>(
					`/will_owner/${activeWill.owner.id}`,
					{
						method: "PATCH",
						body: JSON.stringify(maritalStatusData),
					}
				);

				if (maritalError) {
					console.error("Error updating marital status:", maritalError);
					toast.error("Failed to update marital status. Please try again.");
					return;
				}

				// Step 2: Create new spouse record
				const spouseData = {
					first_name: data.firstName,
					last_name: data.lastName,
					relationship_id: spouseRelationship.id,
					will_id: activeWill.id,
				};

				const { data: personResponse, error: personError } =
					await apiClient<PersonResponse>("/people", {
						method: "POST",
						body: JSON.stringify(spouseData),
					});

				if (personError) {
					console.error("Error creating spouse record:", personError);
					toast.error("Failed to save spouse information. Please try again.");
					return;
				}

				// Update active will with marital status and new spouse information
				if (activeWill) {
					setActiveWill({
						...activeWill,
						owner: {
							...activeWill.owner,
							maritalStatus: "married",
						},
						spouse: {
							id: personResponse?.id,
							firstName: data.firstName,
							lastName: data.lastName,
						},
					});
				}
			}

			// Update local state
			setSpouseData(data);
			setSpouseDialogOpen(false);

			// Show success message
			toast.success(
				isEditing
					? "Spouse information updated successfully"
					: "Spouse information saved successfully"
			);
		} catch (error) {
			console.error("Error in spouse data submission:", error);
			toast.error(
				"An error occurred while saving spouse information. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">
				Are you married or in a legally recognized civil relationship?
			</div>
			<div className="text-muted-foreground">
				If you are, we'll need some information about your partner.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="hasSpouse"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={(checked) => {
											field.onChange(checked);
											if (!checked) {
												setSpouseData(undefined);
											} else if (!spouseData) {
												setSpouseDialogOpen(true);
											}
										}}
									/>
								</FormControl>
								<FormLabel>Yes, I have a spouse or civil partner</FormLabel>
							</FormItem>
						)}
					/>

					{form.watch("hasSpouse") && spouseData && (
						<Card className="border-2 border-green-100 bg-green-50/50">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-lg">
									<User className="h-5 w-5 text-green-600" />
									Partner Information
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="flex justify-between items-center">
									<div className="space-y-1">
										<p className="font-medium text-gray-900">
											{spouseData.firstName} {spouseData.lastName}
										</p>
										<p className="text-sm text-muted-foreground">
											Spouse or Civil Partner
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="cursor-pointer border-green-200 hover:bg-green-100"
										onClick={() => setSpouseDialogOpen(true)}
										disabled={isSubmitting}
									>
										<Edit2 className="h-4 w-4 mr-2" />
										Edit
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					<div className="flex justify-between pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onBack}
							className="cursor-pointer"
							disabled={isSubmitting}
						>
							<ArrowLeft className="mr-2 h-4 w-4" /> Back
						</Button>
						<Button
							type="submit"
							className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
							disabled={isSubmitting}
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
				</form>
			</Form>

			<SpouseDialog
				open={spouseDialogOpen}
				onOpenChange={setSpouseDialogOpen}
				onSave={handleSpouseData}
				initialData={spouseData}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
