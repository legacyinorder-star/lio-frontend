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
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const beneficiarySchema = z.object({
	fullName: z.string().min(2, "Full name must be at least 2 characters"),
	relationship: z.string().min(1, "Relationship is required"),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(10, "Phone number must be at least 10 characters"),
	allocation: z.string().min(1, "Allocation percentage is required"),
});

export type Beneficiary = z.infer<typeof beneficiarySchema>;

interface BeneficiariesStepProps {
	data: Beneficiary[];
	onUpdate: (data: Beneficiary[]) => void;
}

export default function BeneficiariesStep({
	data,
	onUpdate,
}: BeneficiariesStepProps) {
	const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(data);

	const form = useForm<Beneficiary>({
		resolver: zodResolver(beneficiarySchema),
		defaultValues: {
			fullName: "",
			relationship: "",
			email: "",
			phone: "",
			allocation: "",
		},
	});

	const onSubmit = (values: Beneficiary) => {
		const updatedBeneficiaries = [...beneficiaries, values];
		setBeneficiaries(updatedBeneficiaries);
		onUpdate(updatedBeneficiaries);
		form.reset();
	};

	const removeBeneficiary = (index: number) => {
		const updatedBeneficiaries = beneficiaries.filter((_, i) => i !== index);
		setBeneficiaries(updatedBeneficiaries);
		onUpdate(updatedBeneficiaries);
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-4">
				{beneficiaries.map((beneficiary, index) => (
					<div
						key={index}
						className="flex items-center justify-between p-4 border rounded-lg"
					>
						<div>
							<h4 className="font-medium">{beneficiary.fullName}</h4>
							<p className="text-sm text-muted-foreground">
								{beneficiary.relationship} • {beneficiary.allocation}%
							</p>
							<p className="text-sm">
								{beneficiary.email} • {beneficiary.phone}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => removeBeneficiary(index)}
							className="text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
									<Input
										type="email"
										placeholder="john@example.com"
										{...field}
									/>
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
						name="allocation"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Allocation Percentage</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="0"
										max="100"
										placeholder="Enter percentage"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Add Beneficiary</Button>
				</form>
			</Form>
		</div>
	);
}
