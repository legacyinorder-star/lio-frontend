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
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Spouse Details</DialogTitle>
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
									<FormLabel>Spouse Name</FormLabel>
									<FormControl>
										<Input placeholder="Jane Doe" {...field} autoFocus />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit">Save</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
