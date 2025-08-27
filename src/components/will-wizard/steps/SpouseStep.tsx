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

export default function SpouseStep({
	onNext,
	onBack,
	initialData,
	willOwnerData,
	spouseData,
	onSpouseDataSave,
	isLoadingOwnerData,
}: SpouseStepProps) {
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
	const [localSpouseData, setLocalSpouseData] = useState<
		SpouseData | undefined
	>(spouseData || initialData?.spouse);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { isLoading: relationshipsLoading } = useRelationships();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);
	const { refetch } = useWillData();

	// Determine if has spouse based on marital status or existing spouse data
	const hasSpouseFromData =
		willOwnerData?.maritalStatus === "married" || !!spouseData;

	const form = useForm<z.infer<typeof spouseSchema>>({
		resolver: zodResolver(spouseSchema),
		defaultValues: {
			hasSpouse: hasSpouseFromData || initialData?.hasSpouse || false,
		},
	});

	// Update form and local state when props change
	useEffect(() => {
		const hasSpouse = hasSpouseFromData || initialData?.hasSpouse || false;
		form.setValue("hasSpouse", hasSpouse);

		// Prioritize spouseData from props, then initialData, then undefined
		if (spouseData) {
			setLocalSpouseData({
				firstName: spouseData.firstName,
				lastName: spouseData.lastName,
			});
		} else if (initialData?.spouse) {
			setLocalSpouseData(initialData.spouse);
		} else {
			// Clear local spouse data if no data exists
			setLocalSpouseData(undefined);
		}
	}, [willOwnerData, spouseData, initialData, hasSpouseFromData, form]);

	// Additional effect to handle race conditions when spouseData loads asynchronously
	useEffect(() => {
		if (spouseData && !localSpouseData) {
			// If spouseData exists but localSpouseData is undefined, update local state
			setLocalSpouseData({
				firstName: spouseData.firstName,
				lastName: spouseData.lastName,
			});
			// Ensure form reflects the correct state
			form.setValue("hasSpouse", true);
		}
	}, [spouseData, localSpouseData, form]);

	// Helper function to check if spouse data is valid and complete
	const isSpouseDataValid = (spouseData: SpouseData | undefined): boolean => {
		if (!spouseData) return false;

		// Check if both firstName and lastName exist and are not empty strings
		const hasValidFirstName =
			spouseData.firstName && spouseData.firstName.trim().length > 0;
		const hasValidLastName =
			spouseData.lastName && spouseData.lastName.trim().length > 0;

		return hasValidFirstName && hasValidLastName;
	};

	const handleSubmit = async (values: z.infer<typeof spouseSchema>) => {
		// Clear any previous validation errors
		setValidationError(null);

		// Validate: if user selected "Yes" but hasn't provided valid spouse details
		if (values.hasSpouse && !isSpouseDataValid(localSpouseData)) {
			setValidationError(
				"Please provide your partner's details or select 'No' if you don't have a spouse."
			);
			return;
		}

		await onNext({
			hasSpouse: values.hasSpouse,
			spouse: localSpouseData,
		});
	};

	const handleSpouseData = async (data: SpouseData) => {
		setIsSubmitting(true);

		try {
			// If we have the new save function, use it
			if (onSpouseDataSave) {
				const success = await onSpouseDataSave(data);

				if (!success) {
					toast.error("Failed to save spouse information. Please try again.");
					return;
				}
			} else {
				// Fall back to original approach - this would need additional imports and logic
				// For now, just show an error
				toast.error(
					"Unable to save spouse information. Please refresh and try again."
				);
				return;
			}

			// Update local state
			setLocalSpouseData(data);
			setSpouseDialogOpen(false);
			setValidationError(null); // Clear validation error when spouse data is saved

			// Show success message
			toast.success("Spouse information saved successfully");

			// Refresh beneficiary lists
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

	const handleSpouseDialogClose = (open: boolean) => {
		setSpouseDialogOpen(open);
		console.log("Spouse dialog closed:", open);

		// If dialog is being closed and no valid spouse data exists, reset to "No"
		if (!open && !isSpouseDataValid(localSpouseData)) {
			console.log("Closing spouse dialog and resetting to No");
			form.setValue("hasSpouse", false);
		}
	};

	const handleDeleteSpouse = async () => {
		if (!spouseData?.id) return;
		setDeleteLoading(true);
		try {
			await apiClient(`/people/${spouseData.id}`, { method: "DELETE" });
			setLocalSpouseData(undefined);
			setShowDeleteConfirm(false);
			toast.success("Spousal details deleted successfully.");

			// Refresh beneficiary lists
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
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					Are you married or in a legally recognized civil relationship?
				</div>
				<div className="text-muted-foreground">
					Loading relationship types or spouse information...
				</div>
				<div className="flex justify-center py-8">
					<LoadingSpinner message="Loading..." />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Are you married or in a legally recognized civil relationship?
			</div>
			<div className="text-muted-foreground">
				If you are, we'll need some information about your partner.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="flex gap-4">
						<Button
							type="button"
							variant={!form.watch("hasSpouse") ? "default" : "outline"}
							className={
								!form.watch("hasSpouse") ? "bg-primary text-white" : ""
							}
							onClick={() => {
								setValidationError(null); // Clear validation error
								if (spouseData) {
									setShowDeleteConfirm(true);
								} else {
									form.setValue("hasSpouse", false);
									setLocalSpouseData(undefined);
								}
							}}
							disabled={isSubmitting}
						>
							No
						</Button>
						<Button
							type="button"
							variant={form.watch("hasSpouse") ? "default" : "outline"}
							className={form.watch("hasSpouse") ? "bg-primary text-white" : ""}
							onClick={() => {
								setValidationError(null); // Clear validation error
								form.setValue("hasSpouse", true);
								if (!isSpouseDataValid(localSpouseData))
									setSpouseDialogOpen(true);
							}}
							disabled={isSubmitting}
						>
							Yes, I have a spouse or civil partner
						</Button>
					</div>

					{/* Validation Error Message */}
					{validationError && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
							<p className="text-red-800 text-sm font-medium">
								{validationError}
							</p>
						</div>
					)}

					{form.watch("hasSpouse") && isSpouseDataValid(localSpouseData) && (
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

			<SpouseDialog
				open={spouseDialogOpen}
				onOpenChange={handleSpouseDialogClose}
				onSave={handleSpouseData}
				initialData={localSpouseData}
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
		</div>
	);
}
