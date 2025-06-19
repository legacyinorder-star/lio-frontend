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
import { toast } from "sonner";

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
}

export default function SpouseStep({
	onNext,
	onBack,
	initialData,
	willOwnerData,
	spouseData,
	onSpouseDataSave,
}: SpouseStepProps) {
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
	const [localSpouseData, setLocalSpouseData] = useState<
		SpouseData | undefined
	>(spouseData || initialData?.spouse);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
												setLocalSpouseData(undefined);
											} else if (!localSpouseData) {
												setSpouseDialogOpen(true);
											}
										}}
									/>
								</FormControl>
								<FormLabel>Yes, I have a spouse or civil partner</FormLabel>
							</FormItem>
						)}
					/>

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
		</div>
	);
}
