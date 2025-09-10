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

const funeralWishesSchema = z.object({
	wishes: z.enum(["cremated", "buried", "no_preference"]).optional(),
});

type FuneralWishes = "cremated" | "buried" | "no_preference";

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
	const [existingWishes, setExistingWishes] =
		useState<FuneralWishesApiResponse | null>(null);

	const form = useForm<z.infer<typeof funeralWishesSchema>>({
		resolver: zodResolver(funeralWishesSchema),
		defaultValues: {
			wishes: "no_preference",
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
				} else {
					form.setValue("wishes", "no_preference");
					setExistingWishes(null);
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
			toast.error("No active Will found");
			return;
		}

		// Remove validation since we now have a default "no_preference" option
		// if (!values.wishes) {
		// 	toast.error("Please select your preference");
		// 	return;
		// }

		setIsSaving(true);
		try {
			// If user had existing wishes but now selects "no_preference", delete the existing record
			if (existingWishes && values.wishes === "no_preference") {
				const { error } = await apiClient(
					`/funeral_instructions/${existingWishes.id}`,
					{
						method: "DELETE",
					}
				);

				if (error) {
					console.error("Error deleting funeral wishes:", error);
					toast.error("Failed to remove funeral wishes. Please try again.");
					return;
				}

				toast.success("Funeral preferences removed successfully");
				setExistingWishes(null);
			}
			// Only save to database if user has made a specific choice (not "no_preference")
			else if (values.wishes && values.wishes !== "no_preference") {
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
			} else {
				toast.success("Funeral preferences recorded");
			}
			await onNext({
				funeralInstructions: {
					wishes: values.wishes || "no_preference",
				},
			});
		} catch (error) {
			console.error("Error saving funeral wishes:", error);
			toast.error("Failed to save funeral wishes. Please try again.");
		} finally {
			setIsSaving(false);
		}
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
				Please indicate your preference for funeral arrangements. Funeral wishes
				are not legally binding, but writing them down can guide your loved ones
				and make things a little easier during a difficult time.
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
											<div className="flex items-center space-x-2">
												<FormControl>
													<input
														type="radio"
														id="no_preference"
														value="no_preference"
														checked={field.value === "no_preference"}
														onChange={(e) => field.onChange(e.target.value)}
														className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-[#173C37]"
														style={{
															accentColor: "#173C37",
														}}
													/>
												</FormControl>
												<FormLabel
													htmlFor="no_preference"
													className="text-base cursor-pointer"
												>
													No preference
												</FormLabel>
											</div>
										</div>
									</FormItem>
								)}
							/>
							<p className="text-sm text-muted-foreground">
								This preference will be included in your Will to guide your
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

						<Button
							type="submit"
							disabled={isSaving}
							className="cursor-pointer bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSaving ? (
								<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
							) : null}
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
