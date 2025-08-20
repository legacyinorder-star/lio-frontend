import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SpouseDialog, { SpouseData } from "../SpouseDialog";
import { ArrowLeft, ArrowRight, Edit2, User } from "lucide-react";
import { toast } from "sonner";
import { useRelationships } from "@/hooks/useRelationships";
import { useWillData } from "@/hooks/useWillData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/utils/apiClient";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const spouseSchema = z.object({
	hasSpouse: z.boolean(),
});

interface FamilyInfoStepProps {
	onNext: (data: { hasSpouse: boolean; spouse?: SpouseData }) => void;
	onBack: () => void;
	initialData?: {
		hasSpouse: boolean;
		spouse?: SpouseData;
	};
	willOwnerData?: {
		maritalStatus: string;
	} | null;
	spouseData?: {
		id: string;
		firstName: string;
		lastName: string;
	} | null;
	onSpouseDataSave?: (data: SpouseData) => Promise<boolean>;
	isLoadingOwnerData?: boolean;
}

export default function FamilyInfoStep({
	onNext,
	onBack,
	initialData,
	willOwnerData,
	spouseData,
	onSpouseDataSave,
	isLoadingOwnerData,
}: FamilyInfoStepProps) {
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { isLoading: relationshipsLoading } = useRelationships();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const { refetch } = useWillData();

	// ✅ ADDED: Local state to show spouse data immediately after save
	const [localSpouseData, setLocalSpouseData] = useState<{
		id?: string;
		firstName: string;
		lastName: string;
	} | null>(spouseData);

	// Determine if has spouse based on marital status or existing spouse data
	const hasSpouseFromData =
		willOwnerData?.maritalStatus === "married" || !!spouseData;

	const form = useForm<z.infer<typeof spouseSchema>>({
		resolver: zodResolver(spouseSchema),
		defaultValues: {
			hasSpouse: hasSpouseFromData || initialData?.hasSpouse || false,
		},
	});

	// ✅ UPDATED: Sync local state when parent's spouseData changes
	useEffect(() => {
		const hasSpouse = hasSpouseFromData || initialData?.hasSpouse || false;
		form.setValue("hasSpouse", hasSpouse);

		// Update local state when parent provides new spouse data
		if (spouseData) {
			setLocalSpouseData(spouseData);
		}
	}, [willOwnerData, spouseData, initialData, hasSpouseFromData, form]);

	const handleSubmit = async (values: z.infer<typeof spouseSchema>) => {
		await onNext({
			hasSpouse: values.hasSpouse,
			spouse: localSpouseData
				? {
						firstName: localSpouseData.firstName,
						lastName: localSpouseData.lastName,
				  }
				: undefined,
		});
	};

	// ✅ UPDATED: Enhanced spouse data handling with immediate local state update
	const handleSpouseData = async (data: SpouseData) => {
		setIsSubmitting(true);

		try {
			// Check if we're editing an existing spouse or creating a new one
			const isEditing = !!(localSpouseData && localSpouseData.id);

			if (onSpouseDataSave) {
				// For editing, pass the ID along with the data
				const dataToSave = isEditing
					? { ...data, id: localSpouseData!.id }
					: data;

				const success = await onSpouseDataSave(dataToSave);

				if (!success) {
					toast.error("Failed to save spouse information. Please try again.");
					return;
				}
			} else {
				toast.error(
					"Unable to save spouse information. Please refresh and try again."
				);
				return;
			}

			// ✅ IMMEDIATE UPDATE: Update local state to show spouse details right away
			setLocalSpouseData({
				id: isEditing ? localSpouseData!.id : "temp-id", // Use temp ID for new spouses
				firstName: data.firstName,
				lastName: data.lastName,
			});

			// Close dialog and show success message
			setSpouseDialogOpen(false);
			const action = isEditing ? "updated" : "saved";
			toast.success(`Spouse information ${action} successfully`);

			// Refresh data from parent
			refetch();
		} catch (error) {
			console.error("Error in spouse data submission:", error);
			toast.error(
				"An error occurred while saving spouse information. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// ✅ UPDATED: Enhanced delete function with local state cleanup
	const handleDeleteSpouse = async () => {
		if (!localSpouseData?.id || localSpouseData.id === "temp-id") {
			toast.error("No spouse to delete");
			return;
		}

		setDeleteLoading(true);
		try {
			await apiClient(`/people/${localSpouseData.id}`, { method: "DELETE" });

			// Clear local state and form
			setLocalSpouseData(null);
			form.setValue("hasSpouse", false);
			setShowDeleteConfirm(false);
			toast.success("Spousal details deleted successfully.");

			// Refresh data
			refetch();
		} catch (error) {
			console.error("Error deleting spouse:", error);
			toast.error("Failed to delete spousal details. Please try again.");
		} finally {
			setDeleteLoading(false);
		}
	};

	// Show loading state if relationships or owner data are still loading
	if (relationshipsLoading || isLoadingOwnerData) {
		return (
			<div className="space-y-4">
				<div className="flex justify-center py-8">
					<LoadingSpinner message="Loading..." />
				</div>
			</div>
		);
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
						Tell us about your family
					</div>
					<div className="text-[#696868] text-[0.875rem] -mt-4">
						We'll help you include your loved ones in your will.
					</div>

					{/* Spouse Section */}
					<div className="space-y-4 mb-[2.45rem]">
						<div className="flex items-center gap-2">
							<span
								style={{
									fontSize: "1rem",
									color: "#000",
									fontWeight: 400,
									fontFamily: "TMT Limkin",
								}}
							>
								Are you married or in a legally recognized civil relationship?
							</span>
						</div>

						<div className="space-y-3 mt-[-0.5rem]">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="spouseNo"
									checked={!form.watch("hasSpouse")}
									onCheckedChange={(checked) => {
										if (checked) {
											// If "No" is being selected
											if (localSpouseData) {
												// If there's existing spouse data, show delete confirmation
												setShowDeleteConfirm(true);
											} else {
												// If no existing data, just clear the form
												form.setValue("hasSpouse", false);
											}
										}
									}}
									disabled={isSubmitting}
									className="rounded-full"
								/>
								<Label
									htmlFor="spouseNo"
									className="text-sm font-normal cursor-pointer"
								>
									No, I don't
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="spouseYes"
									checked={form.watch("hasSpouse")}
									onCheckedChange={(checked) => {
										if (checked) {
											// If "Yes" is being selected
											form.setValue("hasSpouse", true);
											if (!localSpouseData) setSpouseDialogOpen(true);
										}
									}}
									disabled={isSubmitting}
									className="rounded-full"
								/>
								<Label
									htmlFor="spouseYes"
									className="text-sm font-normal cursor-pointer"
								>
									Yes, I have a spouse or civil partner
								</Label>
							</div>
						</div>

						{/* ✅ UPDATED: Show spouse details from local state */}
						{form.watch("hasSpouse") && localSpouseData && (
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
												{localSpouseData.firstName} {localSpouseData.lastName}
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
					</div>

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
							className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
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

			{/* ✅ UPDATED: Pass local spouse data for editing */}
			<SpouseDialog
				open={spouseDialogOpen}
				onOpenChange={setSpouseDialogOpen}
				onSave={handleSpouseData}
				initialData={
					localSpouseData
						? {
								firstName: localSpouseData.firstName,
								lastName: localSpouseData.lastName,
						  }
						: undefined
				}
				isSubmitting={isSubmitting}
			/>

			{/* Confirmation Dialog for Deleting Spouse */}
			<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Remove Spousal Details?</DialogTitle>
					</DialogHeader>
					<p>
						If you continue, your spousal details will be deleted and cannot be
						undone. Are you sure you want to proceed?
					</p>
					<div className="flex justify-end gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => setShowDeleteConfirm(false)}
							disabled={deleteLoading}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteSpouse}
							disabled={deleteLoading}
						>
							{deleteLoading ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
									Deleting...
								</>
							) : (
								<>Delete</>
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
