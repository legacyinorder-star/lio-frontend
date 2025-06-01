import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { StepProps } from "../types/will.types";

const addressSchema = z.object({
	street: z.string().min(1, "Street address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State/Province is required"),
	postCode: z.string().min(1, "Postal/ZIP code is required"),
	country: z.string().min(1, "Country is required"),
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
			postCode: data.address?.postCode || "",
			country: data.address?.country || "",
		},
	});

	const onSubmit = (values: AddressData) => {
		onUpdate({ address: values });
		onNext();
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">
				What is your current address?
			</div>
			<div className="text-muted-foreground">
				Please provide your full residential address as it appears on official
				documents.
			</div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4 max-w-md"
				>
					<div className="space-y-2">
						<FormField
							control={form.control}
							name="street"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Street Address</FormLabel>
									<FormControl>
										<Input placeholder="123 Main Street" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<FormField
								control={form.control}
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel>City</FormLabel>
										<FormControl>
											<Input placeholder="Toronto" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="space-y-2">
							<FormField
								control={form.control}
								name="postCode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Postal/ZIP Code</FormLabel>
										<FormControl>
											<Input placeholder="M5V 2H1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<FormField
								control={form.control}
								name="state"
								render={({ field }) => (
									<FormItem>
										<FormLabel>State/Province</FormLabel>
										<FormControl>
											<Input placeholder="Ontario" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="space-y-2">
							<FormField
								control={form.control}
								name="country"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Country</FormLabel>
										<FormControl>
											<Input placeholder="Canada" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
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
