import { useEffect } from "react";
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

const executorSchema = z.object({
	fullName: z.string().min(2, "Full name must be at least 2 characters"),
	relationship: z.string().min(1, "Relationship is required"),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(10, "Phone number must be at least 10 characters"),
	address: z.string().min(5, "Address must be at least 5 characters"),
});

export type ExecutorData = z.infer<typeof executorSchema>;

interface ExecutorStepProps {
	data: Partial<ExecutorData>;
	onUpdate: (data: ExecutorData) => void;
}

export default function ExecutorStep({ data, onUpdate }: ExecutorStepProps) {
	const form = useForm<ExecutorData>({
		resolver: zodResolver(executorSchema),
		defaultValues: {
			fullName: data.fullName || "",
			relationship: data.relationship || "",
			email: data.email || "",
			phone: data.phone || "",
			address: data.address || "",
		},
	});

	useEffect(() => {
		const subscription = form.watch((value) => {
			if (form.formState.isValid) {
				onUpdate(value as ExecutorData);
			}
		});
		return () => subscription.unsubscribe();
	}, [form, onUpdate]);

	return (
		<Form {...form}>
			<form className="space-y-4">
				<FormField
					control={form.control}
					name="fullName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Full Name</FormLabel>
							<FormControl>
								<Input placeholder="John Doe" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="relationship"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Relationship</FormLabel>
							<FormControl>
								<select
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									{...field}
								>
									<option value="">Select relationship</option>
									<option value="spouse">Spouse</option>
									<option value="child">Child</option>
									<option value="parent">Parent</option>
									<option value="sibling">Sibling</option>
									<option value="friend">Friend</option>
									<option value="lawyer">Lawyer</option>
									<option value="other">Other</option>
								</select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" placeholder="john@example.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone Number</FormLabel>
							<FormControl>
								<Input type="tel" placeholder="+1234567890" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="address"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Address</FormLabel>
							<FormControl>
								<Input placeholder="123 Main St, City, Country" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
