import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
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

const spouseSchema = z.object({
	fullName: z.string().min(2, "Spouse name must be at least 2 characters"),
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	address: z.object({
		street: z.string().min(1, "Street address is required"),
		city: z.string().min(1, "City is required"),
		state: z.string().min(1, "State is required"),
		zipCode: z.string().min(1, "Postal/ZIP code is required"),
		country: z.string().min(1, "Country is required"),
	}),
});

export type SpouseData = z.infer<typeof spouseSchema>;

interface SpouseDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: SpouseData) => void;
}

export default function SpouseDialog({
	open,
	onOpenChange,
	onSave,
}: SpouseDialogProps) {
	const [isMounted, setIsMounted] = useState(false);

	// Handle client-side mounting
	useEffect(() => {
		setIsMounted(true);
	}, []);

	const form = useForm<SpouseData>({
		resolver: zodResolver(spouseSchema),
		defaultValues: {
			fullName: "",
		},
	});

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			form.reset();
		}
	}, [open, form]);

	const handleSubmit = (values: SpouseData) => {
		onSave(values);
		form.reset();
		onOpenChange(false);
	};

	// Don't render anything during SSR
	if (!isMounted) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px] bg-white">
				<DialogHeader>
					<DialogTitle>Add Partner Details</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Partner Name</FormLabel>
									<FormControl>
										<Input placeholder="Jane Doe" {...field} autoFocus />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input placeholder="Jane" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input placeholder="Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="address.street"
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
									name="address.city"
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
								<FormField
									control={form.control}
									name="address.state"
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
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="address.zipCode"
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
								<FormField
									control={form.control}
									name="address.country"
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
						<DialogFooter>
							<Button type="submit">Save</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
