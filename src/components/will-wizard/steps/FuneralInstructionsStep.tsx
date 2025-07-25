import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
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

const funeralWishesSchema = z.object({
	wishes: z.enum(["cremated", "buried"]).optional(),
});

type FuneralWishes = "cremated" | "buried";

interface FuneralWishesApiResponse {
	id: string;
	created_at: string;
	wishes: FuneralWishes;
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
}: FuneralInstructionsStepProps) {
	const { activeWill } = useWill();
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [existingWishes, setExistingWishes] =
		useState<FuneralWishesApiResponse | null>(null);
	const [skipDialogOpen, setSkipDialogOpen] = useState(false);

	const form = useForm<z.infer<typeof funeralWishesSchema>>({
		resolver: zodResolver(funeralWishesSchema),
		defaultValues: {
			wishes: undefined,
		},
	});

	// Load existing funeral wishes on component mount
	useEffect(() => {
		const loadFuneralWishes = async () => {
			if (!activeWill?.id) return;

			setIsLoading(true);
			try {
				const { data, error } = await apiClient<FuneralWishesApiResponse>(
					`/funeral_instructions/get-by-will/${activeWill.id}`
				);

				console.log("=== LOADING FUNERAL WISHES DEBUG ===");
				console.log("API Response:", data);
				console.log("API Error:", error);

				if (error) {
					console.log("No existing funeral wishes found");
					return;
				}

				if (data) {
					console.log("Setting form value to:", data.wishes);
					form.setValue("wishes", data.wishes);
					setExistingWishes(data);
				}
			} catch (error) {
				console.error("Error loading funeral wishes:", error);
				toast.error("Failed to load existing funeral wishes");
			} finally {
				setIsLoading(false);
			}
		};

		loadFuneralWishes();
	}, [activeWill?.id, form]);

	const handleSubmit = async (values: z.infer<typeof funeralWishesSchema>) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		if (!values.wishes) {
			toast.error("Please select your preference");
			return;
		}

		setIsSaving(true);
		try {
			const { error } = await apiClient("/funeral_instructions", {
				method: "POST",
				body: JSON.stringify({
					will_id: activeWill.id,
					wishes: values.wishes,
				}),
			});

			if (error) {
				console.error("Error saving funeral wishes:", error);
				toast.error("Failed to save funeral wishes. Please try again.");
				return;
			}

			toast.success("Funeral wishes saved successfully");
			await onNext({
				funeralInstructions: {
					wishes: values.wishes,
				},
			});
		} catch (error) {
			console.error("Error saving funeral wishes:", error);
			toast.error("Failed to save funeral wishes. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!existingWishes?.id) return;

		setIsDeleting(true);
		try {
			const { error } = await apiClient(
				`/funeral_instructions/${existingWishes.id}`,
				{
					method: "DELETE",
				}
			);

			if (error) {
				console.error("Error deleting funeral wishes:", error);
				toast.error("Failed to delete funeral wishes. Please try again.");
				return;
			}

			toast.success("Funeral wishes deleted successfully");
			setExistingWishes(null);
			form.setValue("wishes", undefined);
		} catch (error) {
			console.error("Error deleting funeral wishes:", error);
			toast.error("Failed to delete funeral wishes. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleSkip = async () => {
		// If there are existing wishes, delete them from the database
		if (existingWishes?.id) {
			try {
				const { error } = await apiClient(
					`/funeral_instructions/${existingWishes.id}`,
					{
						method: "DELETE",
					}
				);

				if (error) {
					console.error("Error deleting funeral wishes:", error);
					toast.error("Failed to delete funeral wishes. Please try again.");
					return;
				}

				toast.success("Funeral wishes removed successfully");
			} catch (error) {
				console.error("Error deleting funeral wishes:", error);
				toast.error("Failed to delete funeral wishes. Please try again.");
				return;
			}
		}

		await onNext({
			funeralInstructions: {
				wishes: "",
			},
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					Funeral Wishes (Optional)
				</div>
				<div className="flex items-center justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
					<p className="text-muted-foreground ml-2">
						Loading funeral wishes...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Funeral Wishes
			</div>
			<div className="text-muted-foreground">
				Please indicate your preference for funeral arrangements. This
				information will help your loved ones carry out your wishes.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-4">
							<Label className="text-base font-medium">
								What are your funeral wishes?
							</Label>
							<FormField
								control={form.control}
								name="wishes"
								render={({ field }) => (
									<FormItem>
										<div className="space-y-3">
											<div className="flex items-center space-x-2">
												<FormControl>
													<input
														type="radio"
														id="cremated"
														value="cremated"
														checked={field.value === "cremated"}
														onChange={(e) => field.onChange(e.target.value)}
														className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-[#173C37]"
														style={{
															accentColor: "#173C37",
														}}
													/>
												</FormControl>
												<FormLabel
													htmlFor="cremated"
													className="text-base cursor-pointer"
												>
													I wish to be cremated
												</FormLabel>
											</div>
											<div className="flex items-center space-x-2">
												<FormControl>
													<input
														type="radio"
														id="buried"
														value="buried"
														checked={field.value === "buried"}
														onChange={(e) => field.onChange(e.target.value)}
														className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-[#173C37]"
														style={{
															accentColor: "#173C37",
														}}
													/>
												</FormControl>
												<FormLabel
													htmlFor="buried"
													className="text-base cursor-pointer"
												>
													I wish to be buried
												</FormLabel>
											</div>
										</div>
									</FormItem>
								)}
							/>
							<p className="text-sm text-muted-foreground">
								This preference will be included in your will to guide your
								loved ones in carrying out your wishes.
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
							{existingWishes ? (
								<>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												type="button"
												variant="outline"
												disabled={isDeleting}
												className="cursor-pointer text-red-600 hover:bg-white/50 hover:text-red-600/70"
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
													Delete Funeral Wishes
												</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to delete your funeral wishes?
													This action cannot be undone.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleDelete}
													className="bg-red-600 hover:bg-red-700 text-white"
												>
													<Trash2 className="mr-2 h-4 w-4" /> Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
									<Button
										type="submit"
										disabled={isSaving || !form.watch("wishes")}
										className="cursor-pointer bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSaving ? (
											<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
										) : null}
										Next <ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</>
							) : (
								<>
									<AlertDialog
										open={skipDialogOpen}
										onOpenChange={setSkipDialogOpen}
									>
										<AlertDialogTrigger asChild>
											<Button
												type="button"
												variant="outline"
												className="cursor-pointer"
											>
												Skip
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Skip Funeral Wishes</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to skip this step? You can
													always add your funeral wishes later, but it's helpful
													for your loved ones to know your preferences.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleSkip}
													className="bg-primary hover:bg-primary/90 text-white"
												>
													Skip Anyway
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
									<Button
										type="submit"
										disabled={isSaving || !form.watch("wishes")}
										className="cursor-pointer bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
