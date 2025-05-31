import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FuneralInstructions } from "../types/will.types";

const funeralInstructionsSchema = z.object({
	disposition: z.enum(["cremation", "burial"]).nullable(),
	location: z.string().optional(),
});

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
	const form = useForm<z.infer<typeof funeralInstructionsSchema>>({
		resolver: zodResolver(funeralInstructionsSchema),
		defaultValues: {
			disposition: initialData?.funeralInstructions.disposition || null,
			location: initialData?.funeralInstructions.location || "",
		},
	});

	const handleSubmit = (values: z.infer<typeof funeralInstructionsSchema>) => {
		onNext({
			funeralInstructions: {
				disposition: values.disposition,
				location: values.location,
			},
		});
	};

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
							<Label>Disposition Preference</Label>
							<Select
								value={form.watch("disposition") || ""}
								onValueChange={(value: "cremation" | "burial" | "") =>
									form.setValue("disposition", value || null)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select disposition preference" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="burial">Burial</SelectItem>
									<SelectItem value="cremation">Cremation</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Preferred Location (Optional)</Label>
							<Input
								{...form.register("location")}
								placeholder="Enter preferred location (e.g., cemetery name, city)"
							/>
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
							className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
						>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
