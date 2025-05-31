import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const additionalInstructionsSchema = z.object({
	additionalInstructions: z.string().optional(),
});

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
	const form = useForm<z.infer<typeof additionalInstructionsSchema>>({
		resolver: zodResolver(additionalInstructionsSchema),
		defaultValues: {
			additionalInstructions: initialData?.additionalInstructions || "",
		},
	});

	const handleSubmit = (
		values: z.infer<typeof additionalInstructionsSchema>
	) => {
		onNext({
			additionalInstructions: values.additionalInstructions || "",
		});
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Additional Instructions</div>
			<div className="text-muted-foreground">
				If you have any additional instructions or wishes that you'd like to
				include in your will, please provide them below. This could include
				specific funeral arrangements, personal messages, or any other important
				information.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Additional Instructions (Optional)</Label>
							<Textarea
								{...form.register("additionalInstructions")}
								placeholder="Enter any additional instructions or wishes..."
								className="min-h-[200px]"
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
