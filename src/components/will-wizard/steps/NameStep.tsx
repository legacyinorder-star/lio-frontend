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
import { useWill } from "@/context/WillContext";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useState } from "react";

const nameSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type NameData = z.infer<typeof nameSchema>;

interface WillOwnerResponse {
	will_id: string;
}

export default function NameStep({ data, onUpdate, onNext }: StepProps) {
	const { activeWill, setActiveWill } = useWill();
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	const onSubmit = async (values: NameData) => {
		setIsSubmitting(true);

		try {
			// Prepare the request data
			const requestData = {
				first_name: values.firstName,
				last_name: values.lastName,
				...(activeWill?.id && { will_id: activeWill.id }),
			};

			// Make POST request to /will_owner
			const { data: responseData, error } = await apiClient<WillOwnerResponse>(
				"/will_owner",
				{
					method: "POST",
					body: JSON.stringify(requestData),
				}
			);

			if (error) {
				console.error("Error saving will owner:", error);
				toast.error("Failed to save name information. Please try again.");
				return;
			}

			// Extract will_id from response and save as active will
			if (responseData && responseData.will_id) {
				setActiveWill({
					id: responseData.will_id,
					lastUpdatedAt: new Date().toISOString(),
					createdAt: new Date().toISOString(),
					status: "draft",
					userId: "",
					owner: {
						firstName: values.firstName,
						lastName: values.lastName,
						maritalStatus: "",
						address: "",
						city: "",
						state: "",
						postCode: "",
						country: "",
					},
					assets: [],
					beneficiaries: [],
					executors: [],
					witnesses: [],
				});
			}

			// Update local form data
			onUpdate(values);

			// Show success message
			toast.success("Name saved successfully");

			// Proceed to next step
			onNext();
		} catch (error) {
			console.error("Error in name submission:", error);
			toast.error(
				"An error occurred while saving your name. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
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
						disabled={!isValid || !isDirty || isSubmitting}
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
	);
}
