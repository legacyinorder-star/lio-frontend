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
import {
	useWill,
	type WillData,
	type WillPersonalData,
} from "@/context/WillContext";
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

interface WillOwnerResponse {
	id: string;
}

export default function AddressStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: StepProps) {
	const { activeWill, setActiveWill } = useWill();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Determine the initial values for the form
	const getInitialValues = () => {
		// Priority: activeWill > data prop > empty strings
		if (activeWill) {
			const activeWillAny = activeWill as WillData & {
				address?: string;
				city?: string;
				state?: string;
				postCode?: string;
				country?: string;
			};
			const ownerAny = activeWill.owner as WillPersonalData & {
				address?: string;
				city?: string;
				state?: string;
				postCode?: string;
				country?: string;
			};
			const address =
				activeWill.owner?.address || ownerAny?.address || activeWillAny.address;
			const city =
				activeWill.owner?.city || ownerAny?.city || activeWillAny.city;
			const state =
				activeWill.owner?.state || ownerAny?.state || activeWillAny.state;
			const postCode =
				activeWill.owner?.postCode ||
				ownerAny?.postCode ||
				activeWillAny.postCode;
			const country =
				activeWill.owner?.country || ownerAny?.country || activeWillAny.country;

			if (address || city || state || postCode || country) {
				return {
					address: address || "",
					city: city || "",
					state: state || "",
					postCode: postCode || "",
					country: country || "",
				};
			}
		}
		if (
			data.address?.address ||
			data.address?.city ||
			data.address?.state ||
			data.address?.postCode ||
			data.address?.country
		) {
			return {
				address: data.address?.address || "",
				city: data.address?.city || "",
				state: data.address?.state || "",
				postCode: data.address?.postCode || "",
				country: data.address?.country || "",
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

	// Pre-fill form with active will data when component loads
	useEffect(() => {
		if (activeWill) {
			const activeWillAny = activeWill as WillData & {
				address?: string;
				city?: string;
				state?: string;
				postCode?: string;
				country?: string;
			};
			const ownerAny = activeWill.owner as WillPersonalData & {
				address?: string;
				city?: string;
				state?: string;
				postCode?: string;
				country?: string;
			};
			const address =
				activeWill.owner?.address || ownerAny?.address || activeWillAny.address;
			const city =
				activeWill.owner?.city || ownerAny?.city || activeWillAny.city;
			const state =
				activeWill.owner?.state || ownerAny?.state || activeWillAny.state;
			const postCode =
				activeWill.owner?.postCode ||
				ownerAny?.postCode ||
				activeWillAny.postCode;
			const country =
				activeWill.owner?.country || ownerAny?.country || activeWillAny.country;

			if (address || city || state || postCode || country) {
				setValue("address", address || "", { shouldValidate: false });
				setValue("city", city || "", { shouldValidate: false });
				setValue("state", state || "", { shouldValidate: false });
				setValue("postCode", postCode || "", { shouldValidate: false });
				setValue("country", country || "", { shouldValidate: false });
			}
		} else if (
			data.address?.address ||
			data.address?.city ||
			data.address?.state ||
			data.address?.postCode ||
			data.address?.country
		) {
			setValue("address", data.address?.address || "", {
				shouldValidate: false,
			});
			setValue("city", data.address?.city || "", { shouldValidate: false });
			setValue("state", data.address?.state || "", { shouldValidate: false });
			setValue("postCode", data.address?.postCode || "", {
				shouldValidate: false,
			});
			setValue("country", data.address?.country || "", {
				shouldValidate: false,
			});
		}
	}, [activeWill, data, setValue]);

	const onSubmit = async (values: AddressData) => {
		setIsSubmitting(true);

		try {
			// Check if we have an active will with owner ID
			if (!activeWill?.owner?.id) {
				toast.error(
					"Will owner information not found. Please start from the beginning."
				);
				return;
			}

			// Prepare the request data - convert street back to address for API
			const requestData = {
				address: values.address,
				city: values.city,
				state: values.state,
				post_code: values.postCode,
				country: values.country,
			};

			// Make PATCH request to /will_owner/{will_owner_id}
			const { error } = await apiClient<WillOwnerResponse>(
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

			// Update active will with address data
			if (activeWill) {
				setActiveWill({
					...activeWill,
					owner: {
						...activeWill.owner,
						address: values.address,
						city: values.city,
						state: values.state,
						postCode: values.postCode,
						country: values.country,
					},
				});
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
							className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
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
