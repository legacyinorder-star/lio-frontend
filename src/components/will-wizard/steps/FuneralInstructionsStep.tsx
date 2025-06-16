import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FuneralInstructions } from "../types/will.types";
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

const funeralInstructionsSchema = z.object({
	instructions: z.string().optional(),
});

interface FuneralInstructionsApiResponse {
	id: string;
	created_at: string;
	instructions: string;
	will_id: string;
	user_id: string;
}

interface FuneralInstructionsStepProps {
	onNext: (data: { funeralInstructions: FuneralInstructions }) => void;
	onBack: () => void;
	initialData?: {
		funeralInstructions: FuneralInstructions;
	};
}

export default function FuneralInstructionsStep({
	onNext,
	onBack,
	initialData,
}: FuneralInstructionsStepProps) {
	const { activeWill } = useWill();
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [existingInstructions, setExistingInstructions] =
		useState<FuneralInstructionsApiResponse | null>(null);

	const form = useForm<z.infer<typeof funeralInstructionsSchema>>({
		resolver: zodResolver(funeralInstructionsSchema),
		defaultValues: {
			instructions: initialData?.funeralInstructions.instructions || "",
		},
	});

	// Load existing funeral instructions on component mount
	useEffect(() => {
		const loadFuneralInstructions = async () => {
			if (!activeWill?.id) return;

			setIsLoading(true);
			try {
				const { data, error } = await apiClient<FuneralInstructionsApiResponse>(
					`/funeral_instructions/get-by-will/${activeWill.id}`
				);

				if (error) {
					// If no funeral instructions exist yet, that's okay
					console.log("No existing funeral instructions found");
					return;
				}

				if (data) {
					form.setValue("instructions", data.instructions || "");
					setExistingInstructions(data);
				}
			} catch (error) {
				console.error("Error loading funeral instructions:", error);
				toast.error("Failed to load existing funeral instructions");
			} finally {
				setIsLoading(false);
			}
		};

		loadFuneralInstructions();
	}, [activeWill?.id, form]);

	const handleSubmit = async (
		values: z.infer<typeof funeralInstructionsSchema>
	) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		setIsSaving(true);
		try {
			const { error } = await apiClient("/funeral_instructions", {
				method: "POST",
				body: JSON.stringify({
					will_id: activeWill.id,
					instructions: values.instructions || "",
				}),
			});

			if (error) {
				console.error("Error saving funeral instructions:", error);
				toast.error("Failed to save funeral instructions. Please try again.");
				return;
			}

			toast.success("Funeral instructions saved successfully");
			onNext({
				funeralInstructions: {
					instructions: values.instructions || "",
				},
			});
		} catch (error) {
			console.error("Error saving funeral instructions:", error);
			toast.error("Failed to save funeral instructions. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!existingInstructions?.id) return;

		setIsDeleting(true);
		try {
			const { error } = await apiClient(
				`/funeral_instructions/${existingInstructions.id}`,
				{
					method: "DELETE",
				}
			);

			if (error) {
				console.error("Error deleting funeral instructions:", error);
				toast.error("Failed to delete funeral instructions. Please try again.");
				return;
			}

			toast.success("Funeral instructions deleted successfully");
			setExistingInstructions(null);
			form.setValue("instructions", "");
		} catch (error) {
			console.error("Error deleting funeral instructions:", error);
			toast.error("Failed to delete funeral instructions. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleSkip = () => {
		onNext({
			funeralInstructions: {
				instructions: "",
			},
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="text-2xl font-semibold">Funeral Instructions</div>
				<div className="flex items-center justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
					<p className="text-muted-foreground ml-2">
						Loading funeral instructions...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Funeral Instructions</div>
			<div className="text-muted-foreground">
				Please provide your preferences for funeral arrangements. This
				information will help your loved ones carry out your wishes.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Funeral Instructions (Optional)</Label>
							<Textarea
								{...form.register("instructions")}
								placeholder="Enter your funeral instructions and preferences here..."
								className="min-h-[200px] resize-none"
							/>
							<p className="text-sm text-muted-foreground">
								You can include details about burial or cremation preferences,
								preferred location, specific requests, or any other instructions
								you'd like your loved ones to follow.
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
													Delete Funeral Instructions
												</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to delete your funeral
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
