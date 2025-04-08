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

const personalInfoSchema = z.object({
	fullName: z.string().min(2, "Full name must be at least 2 characters"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	address: z.string().min(5, "Address must be at least 5 characters"),
	phone: z.string().min(10, "Phone number must be at least 10 characters"),
	maritalStatus: z.string().min(1, "Marital status is required"),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoStepProps {
	data: Partial<PersonalInfoData>;
	onUpdate: (data: PersonalInfoData) => void;
}

export default function PersonalInfoStep({
	data,
	onUpdate,
}: PersonalInfoStepProps) {
	const form = useForm<PersonalInfoData>({
		resolver: zodResolver(personalInfoSchema),
		defaultValues: {
			fullName: data.fullName || "",
			dateOfBirth: data.dateOfBirth || "",
			address: data.address || "",
			phone: data.phone || "",
			maritalStatus: data.maritalStatus || "",
		},
	});

	const onSubmit = (values: PersonalInfoData) => {
		onUpdate(values);
	};

	return (
		<Form {...form}>
			<form onChange={form.handleSubmit(onSubmit)} className="space-y-4">
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
					name="dateOfBirth"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Date of Birth</FormLabel>
							<FormControl>
								<Input type="date" {...field} />
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
					name="maritalStatus"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Marital Status</FormLabel>
							<FormControl>
								<select
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									{...field}
								>
									<option value="">Select status</option>
									<option value="single">Single</option>
									<option value="married">Married</option>
									<option value="divorced">Divorced</option>
									<option value="widowed">Widowed</option>
								</select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
