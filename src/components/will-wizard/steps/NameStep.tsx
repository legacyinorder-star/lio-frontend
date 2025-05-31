import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepProps } from "../types/will.types";

const nameSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type NameData = z.infer<typeof nameSchema>;

export default function NameStep({ data, onUpdate, onNext }: StepProps) {
	const form = useForm<NameData>({
		resolver: zodResolver(nameSchema),
		defaultValues: {
			firstName: data.firstName || "",
			lastName: data.lastName || "",
		},
		mode: "onChange",
	});

	const {
		formState: { isValid, isDirty },
	} = form;

	const onSubmit = (values: NameData) => {
		onUpdate(values);
		onNext();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="text-2xl font-semibold">What is your full name?</div>
				<div className="text-muted-foreground">
					We'll use this as the legal name in your will.
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
					<div className="space-y-2">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>First Name</FormLabel>
									<FormControl>
										<Input placeholder="John" {...field} className="w-full" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="space-y-2">
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Last Name</FormLabel>
									<FormControl>
										<Input placeholder="Doe" {...field} className="w-full" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>
				<div className="flex justify-end">
					<Button
						type="submit"
						className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
						disabled={!isValid || !isDirty}
					>
						Next <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</form>
		</Form>
	);
}
