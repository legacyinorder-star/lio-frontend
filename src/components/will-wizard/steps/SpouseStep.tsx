import { useState } from "react";
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
}

export default function SpouseStep({
	onNext,
	onBack,
	initialData,
}: SpouseStepProps) {
	const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
	const [spouseData, setSpouseData] = useState<SpouseData | undefined>(
		initialData?.spouse
	);

	const form = useForm<z.infer<typeof spouseSchema>>({
		resolver: zodResolver(spouseSchema),
		defaultValues: {
			hasSpouse: initialData?.hasSpouse ?? false,
		},
	});

	const handleSubmit = (values: z.infer<typeof spouseSchema>) => {
		onNext({
			hasSpouse: values.hasSpouse,
			spouse: spouseData,
		});
	};

	const handleSpouseData = (data: SpouseData) => {
		setSpouseData(data);
		setSpouseDialogOpen(false);
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
												setSpouseData(undefined);
											} else if (!spouseData) {
												setSpouseDialogOpen(true);
											}
										}}
									/>
								</FormControl>
								<FormLabel>Yes, I have a spouse or civil partner</FormLabel>
							</FormItem>
						)}
					/>

					{form.watch("hasSpouse") && spouseData && (
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
											{spouseData.firstName} {spouseData.lastName}
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

			<SpouseDialog
				open={spouseDialogOpen}
				onOpenChange={setSpouseDialogOpen}
				onSave={handleSpouseData}
				initialData={spouseData}
			/>
		</div>
	);
}
