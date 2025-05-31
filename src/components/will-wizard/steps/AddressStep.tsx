import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { StepProps, Address } from "../types/will.types";

const addressSchema = z.object({
	street: z.string().min(5, "Street address must be at least 5 characters"),
	city: z.string().min(2, "City must be at least 2 characters"),
	state: z.string().min(2, "State must be at least 2 characters"),
	zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
	country: z.string().min(2, "Country must be at least 2 characters"),
});

type AddressData = z.infer<typeof addressSchema>;

export default function AddressStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: StepProps) {
	const form = useForm<AddressData>({
		resolver: zodResolver(addressSchema),
		defaultValues: {
			street: data.address?.street || "",
			city: data.address?.city || "",
			state: data.address?.state || "",
			zipCode: data.address?.zipCode || "",
			country: data.address?.country || "",
		},
	});

	const onSubmit = (values: AddressData) => {
		onUpdate({ address: values as Address });
		onNext();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="street"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Street Address</FormLabel>
							<FormControl>
								<Input placeholder="123 Main St" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="city"
						render={({ field }) => (
							<FormItem>
								<FormLabel>City</FormLabel>
								<FormControl>
									<Input placeholder="New York" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="state"
						render={({ field }) => (
							<FormItem>
								<FormLabel>State/Province</FormLabel>
								<FormControl>
									<Input placeholder="NY" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="zipCode"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Zip/Postal Code</FormLabel>
								<FormControl>
									<Input placeholder="10001" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="country"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Country</FormLabel>
								<FormControl>
									<Input placeholder="United States" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex justify-between">
					<button
						type="button"
						onClick={onBack}
						className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
					>
						<svg
							className="mr-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back
					</button>
					<button
						type="submit"
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Next
						<svg
							className="ml-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			</form>
		</Form>
	);
}
