import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useWill } from "@/context/WillContext";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const additionalInstructionsSchema = z.object({
	instructions: z.string().optional(),
});

interface AdditionalInstructionsApiResponse {
	id: string;
	created_at: string;
	instructions: string;
	will_id: string;
	user_id: string;
}

interface AdditionalInstructionsStepProps {
	onNext: (data: { additionalInstructions: string }) => void;
	onBack: () => void;
	initialData?: {
		additionalInstructions: string;
	};
}

export default function AdditionalInstructionsStep({
	onNext,
	onBack,
	initialData,
}: AdditionalInstructionsStepProps) {
	const { activeWill } = useWill();
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [existingInstructions, setExistingInstructions] =
		useState<AdditionalInstructionsApiResponse | null>(null);

	const form = useForm<z.infer<typeof additionalInstructionsSchema>>({
		resolver: zodResolver(additionalInstructionsSchema),
		defaultValues: {
			instructions: initialData?.additionalInstructions || "",
		},
	});

	// Load existing additional instructions on component mount
	useEffect(() => {
		const loadAdditionalInstructions = async () => {
			if (!activeWill?.id) return;

			setIsLoading(true);
			try {
				const { data, error } =
					await apiClient<AdditionalInstructionsApiResponse>(
						`/additional_instructions/get-by-will/${activeWill.id}`
					);

				if (error) {
					// If no additional instructions exist yet, that's okay
					console.log("No existing additional instructions found");
					return;
				}

				if (data) {
					form.setValue("instructions", data.instructions || "");
					setExistingInstructions(data);
				}
			} catch (error) {
				console.error("Error loading additional instructions:", error);
				toast.error("Failed to load existing additional instructions");
			} finally {
				setIsLoading(false);
			}
		};

		loadAdditionalInstructions();
	}, [activeWill?.id, form]);

	const handleSubmit = async (
		values: z.infer<typeof additionalInstructionsSchema>
	) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		setIsSaving(true);
		try {
			const { error } = await apiClient("/additional_instructions", {
				method: "POST",
				body: JSON.stringify({
					will_id: activeWill.id,
					instructions: values.instructions || "",
				}),
			});

			if (error) {
				console.error("Error saving additional instructions:", error);
				toast.error(
					"Failed to save additional instructions. Please try again."
				);
				return;
			}

			toast.success("Additional instructions saved successfully");
			onNext({
				additionalInstructions: values.instructions || "",
			});
		} catch (error) {
			console.error("Error saving additional instructions:", error);
			toast.error("Failed to save additional instructions. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!existingInstructions?.id) return;

		setIsDeleting(true);
		try {
			const { error } = await apiClient(
				`/additional_instructions/${existingInstructions.id}`,
				{
					method: "DELETE",
				}
			);

			if (error) {
				console.error("Error deleting additional instructions:", error);
				toast.error(
					"Failed to delete additional instructions. Please try again."
				);
				return;
			}

			toast.success("Additional instructions deleted successfully");
			setExistingInstructions(null);
			form.setValue("instructions", "");
		} catch (error) {
			console.error("Error deleting additional instructions:", error);
			toast.error(
				"Failed to delete additional instructions. Please try again."
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleSkip = () => {
		onNext({
			additionalInstructions: "",
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="text-2xl font-semibold">Additional Instructions</div>
				<div className="flex items-center justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
					<p className="text-muted-foreground ml-2">
						Loading additional instructions...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Additional Instructions</div>
			<div className="text-muted-foreground">
				If you have any additional instructions or wishes that you'd like to
				include in your will, please provide them below. This could include
				specific instructions, personal messages, or any other important
				information.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Additional Instructions (Optional)</Label>
							<Textarea
								{...form.register("instructions")}
								placeholder="Enter any additional instructions or wishes..."
								className="min-h-[200px] resize-none"
							/>
							<p className="text-sm text-muted-foreground">
								You can include personal messages, specific instructions for
								your loved ones, or any other important information you'd like
								to be part of your will.
							</p>
						</div>
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
							{existingInstructions ? (
								<>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												type="button"
												variant="outline"
												disabled={isDeleting}
												className="cursor-pointer text-red-600 hover:bg-red-50"
											>
												{isDeleting ? (
													<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-red-600 mr-2" />
												) : (
													<Trash2 className="mr-2 h-4 w-4" />
												)}
												Remove
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Delete Additional Instructions
												</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to delete your additional
													instructions? This action cannot be undone.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleDelete}
													className="bg-red-600 hover:bg-red-700"
												>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
									<Button
										type="submit"
										disabled={isSaving || !form.watch("instructions")?.trim()}
										className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSaving ? (
											<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
										) : null}
										Next <ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</>
							) : (
								<>
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
										disabled={isSaving || !form.watch("instructions")?.trim()}
										className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSaving ? (
											<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
										) : null}
										Next <ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</>
							)}
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
