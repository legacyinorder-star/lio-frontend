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

		if (spouseData) {
			setLocalSpouseData({
				firstName: spouseData.firstName,
				lastName: spouseData.lastName,
			});
		} else if (initialData?.spouse) {
			setLocalSpouseData(initialData.spouse);
		}
	}, [willOwnerData, spouseData, initialData, hasSpouseFromData, form]);

	const handleSubmit = (values: z.infer<typeof spouseSchema>) => {
		onNext({
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
				<div className="text-2xl font-semibold">
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
			<div className="text-2xl font-semibold">
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
							variant={form.watch("hasSpouse") ? "default" : "outline"}
							className={
								form.watch("hasSpouse") ? "bg-light-green text-black" : ""
							}
							onClick={() => {
								form.setValue("hasSpouse", true);
								if (!localSpouseData) setSpouseDialogOpen(true);
							}}
							disabled={isSubmitting}
						>
							Yes, I have a spouse or civil partner
						</Button>
						<Button
							type="button"
							variant={!form.watch("hasSpouse") ? "default" : "outline"}
							className={
								!form.watch("hasSpouse") ? "bg-light-green text-black" : ""
							}
							onClick={() => {
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
					</div>

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
