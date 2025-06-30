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
import { StepProps, Address } from "../types/will.types";
import { useWill } from "@/context/WillContext";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const addressSchema = z.object({
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State/Province is required"),
	postCode: z.string().min(1, "Postal/ZIP code is required"),
	country: z.string().min(1, "Country is required"),
});

type AddressData = z.infer<typeof addressSchema>;

interface AddressStepProps extends StepProps {
	willOwnerData?: {
		address: string;
		city: string;
		state: string;
		postCode: string;
		country: string;
	} | null;
	onWillOwnerDataSave?: (data: {
		address: string;
		city: string;
		state: string;
		postCode: string;
		country: string;
	}) => Promise<boolean>;
}

export default function AddressStep({
	data,
	onUpdate,
	onNext,
	onBack,
	willOwnerData,
	onWillOwnerDataSave,
}: AddressStepProps) {
	const { activeWill } = useWill();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Determine the initial values for the form
	const getInitialValues = () => {
		// Priority: willOwnerData prop > activeWill > data prop > empty strings
		if (willOwnerData) {
			return {
				address: willOwnerData.address || "",
				city: willOwnerData.city || "",
				state: willOwnerData.state || "",
				postCode: willOwnerData.postCode || "",
				country: willOwnerData.country || "",
			};
		}

		if (activeWill?.owner) {
			return {
				address: activeWill.owner.address || "",
				city: activeWill.owner.city || "",
				state: activeWill.owner.state || "",
				postCode: activeWill.owner.postCode || "",
				country: activeWill.owner.country || "",
			};
		}

		if (data.address) {
			return {
				address: data.address.address || "",
				city: data.address.city || "",
				state: data.address.state || "",
				postCode: data.address.postCode || "",
				country: data.address.country || "",
			};
		}

		return {
			address: "",
			city: "",
			state: "",
			postCode: "",
			country: "",
		};
	};

	const initialValues = getInitialValues();

	const form = useForm<AddressData>({
		resolver: zodResolver(addressSchema),
		defaultValues: initialValues,
		mode: "onSubmit",
	});

	const {
		formState: { isValid },
		setValue,
	} = form;

	// Pre-fill form when willOwnerData changes
	useEffect(() => {
		if (willOwnerData) {
			setValue("address", willOwnerData.address || "", {
				shouldValidate: false,
			});
			setValue("city", willOwnerData.city || "", { shouldValidate: false });
			setValue("state", willOwnerData.state || "", { shouldValidate: false });
			setValue("postCode", willOwnerData.postCode || "", {
				shouldValidate: false,
			});
			setValue("country", willOwnerData.country || "", {
				shouldValidate: false,
			});
		} else if (activeWill?.owner) {
			setValue("address", activeWill.owner.address || "", {
				shouldValidate: false,
			});
			setValue("city", activeWill.owner.city || "", { shouldValidate: false });
			setValue("state", activeWill.owner.state || "", {
				shouldValidate: false,
			});
			setValue("postCode", activeWill.owner.postCode || "", {
				shouldValidate: false,
			});
			setValue("country", activeWill.owner.country || "", {
				shouldValidate: false,
			});
		} else if (data.address) {
			setValue("address", data.address.address || "", {
				shouldValidate: false,
			});
			setValue("city", data.address.city || "", { shouldValidate: false });
			setValue("state", data.address.state || "", { shouldValidate: false });
			setValue("postCode", data.address.postCode || "", {
				shouldValidate: false,
			});
			setValue("country", data.address.country || "", {
				shouldValidate: false,
			});
		}
	}, [willOwnerData, activeWill, data, setValue]);

	const onSubmit = async (values: AddressData) => {
		setIsSubmitting(true);

		try {
			// If we have the new save function and will owner data, use it
			if (onWillOwnerDataSave && willOwnerData) {
				const success = await onWillOwnerDataSave({
					address: values.address,
					city: values.city,
					state: values.state,
					postCode: values.postCode,
					country: values.country,
				});

				if (!success) {
					toast.error("Failed to save address information. Please try again.");
					return;
				}
			} else {
				// Fall back to original approach if no willOwnerData
				if (!activeWill?.owner?.id) {
					toast.error(
						"Will owner information not found. Please start from the beginning."
					);
					return;
				}

				// Prepare the request data with snake_case keys
				const requestData = {
					address: values.address,
					city: values.city,
					state: values.state,
					post_code: values.postCode,
					country: values.country,
				};

				const { error } = await apiClient(
					`/will_owner/${activeWill.owner.id}`,
					{
						method: "PATCH",
						body: JSON.stringify(requestData),
					}
				);

				if (error) {
					console.error("Error updating will owner address:", error);
					toast.error("Failed to save address information. Please try again.");
					return;
				}
			}

			// Update local form data - convert to Address type expected by form
			const addressData: Address = {
				address: values.address,
				city: values.city,
				state: values.state,
				postCode: values.postCode,
				country: values.country,
			};
			onUpdate({ address: addressData });

			// Show success message
			toast.success("Address saved successfully");

			// Proceed to next step
			onNext();
		} catch (error) {
			console.error("Error in address submission:", error);
			toast.error(
				"An error occurred while saving your address. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6 w-full max-w-4xl mx-auto">
			<div className="text-[2rem] font-medium text-black">
				What is your current address?
			</div>
			<div className="text-muted-foreground">
				Please provide your full residential address as it appears on official
				documents.
			</div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6 w-full"
				>
					<div className="space-y-2">
						<FormField
							control={form.control}
							name="address"
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
							className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
							disabled={!isValid || isSubmitting}
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
		</div>
	);
}
