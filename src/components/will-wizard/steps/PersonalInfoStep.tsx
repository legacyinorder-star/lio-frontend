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
import { useState, useEffect } from "react";
import WillDisclaimerDialog from "../WillDisclaimerDialog";
import Select from "react-select";
import countryRegionData from "country-region-data/data.json";
import { useNavigate } from "react-router-dom";

const personalInfoSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State/Province is required"),
	postCode: z.string().min(1, "Postal/ZIP code is required"),
	country: z.string().min(1, "Country is required"),
});

type PersonalInfoData = z.infer<typeof personalInfoSchema>;

interface RegionType {
	name: string;
	shortCode?: string;
}

interface CountryType {
	countryName: string;
	countryShortCode: string;
	regions: RegionType[];
}

interface OptionType {
	value: string;
	label: string;
}

interface WillOwnerResponse {
	will_id: string;
	id: string;
}

interface PersonalInfoStepProps extends StepProps {
	willOwnerData?: {
		firstName: string;
		lastName: string;
		address: string;
		city: string;
		state: string;
		postCode: string;
		country: string;
	} | null;
	onWillOwnerDataSave?: (data: {
		firstName: string;
		lastName: string;
		address: string;
		city: string;
		state: string;
		postCode: string;
		country: string;
	}) => Promise<boolean>;
}

export default function PersonalInfoStep({
	data,
	onUpdate,
	onNext,
	willOwnerData,
	onWillOwnerDataSave,
}: PersonalInfoStepProps) {
	const { activeWill, setActiveWill } = useWill();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDisclaimer, setShowDisclaimer] = useState(false);
	const navigate = useNavigate();

	// Auto-show disclaimer for new wills when component mounts
	useEffect(() => {
		const isNewWill = !activeWill?.id;
		if (isNewWill && !showDisclaimer) {
			setShowDisclaimer(true);
		}
	}, [activeWill?.id]);

	// Determine the initial values for the form
	const getInitialValues = () => {
		// Priority: willOwnerData prop > activeWill > data prop > empty strings
		if (willOwnerData) {
			return {
				firstName: willOwnerData.firstName || "",
				lastName: willOwnerData.lastName || "",
				address: willOwnerData.address || "",
				city: willOwnerData.city || "",
				state: willOwnerData.state || "",
				postCode: willOwnerData.postCode || "",
				country: willOwnerData.country || "",
			};
		}

		if (activeWill?.owner) {
			return {
				firstName: activeWill.owner.firstName || "",
				lastName: activeWill.owner.lastName || "",
				address: activeWill.owner.address || "",
				city: activeWill.owner.city || "",
				state: activeWill.owner.state || "",
				postCode: activeWill.owner.postCode || "",
				country: activeWill.owner.country || "",
			};
		}

		return {
			firstName: data.firstName || "",
			lastName: data.lastName || "",
			address: data.address?.address || "",
			city: data.address?.city || "",
			state: data.address?.state || "",
			postCode: data.address?.postCode || "",
			country: data.address?.country || "",
		};
	};

	const initialValues = getInitialValues();

	const form = useForm<PersonalInfoData>({
		resolver: zodResolver(personalInfoSchema),
		defaultValues: initialValues,
	});

	const onSubmit = async (formData: PersonalInfoData) => {
		setIsSubmitting(true);

		try {
			// Update the context with the form data
			const updatedData = {
				...data,
				firstName: formData.firstName,
				lastName: formData.lastName,
				address: {
					address: formData.address,
					city: formData.city,
					state: formData.state,
					postCode: formData.postCode,
					country: formData.country,
				},
			};

			onUpdate(updatedData);

			// If we have willOwnerData and onWillOwnerDataSave, save to backend
			if (willOwnerData && onWillOwnerDataSave) {
				const saveSuccess = await onWillOwnerDataSave({
					firstName: formData.firstName,
					lastName: formData.lastName,
					address: formData.address,
					city: formData.city,
					state: formData.state,
					postCode: formData.postCode,
					country: formData.country,
				});

				if (!saveSuccess) {
					toast.error("Failed to save personal information");
					return;
				}
			}

			// If this is a new will, create the will owner record
			if (!activeWill?.id) {
				const { data: willResponse, error: willError } =
					await apiClient<WillOwnerResponse>("/wills", {
						method: "POST",
						body: JSON.stringify({
							status: "draft",
						}),
					});

				if (willError || !willResponse) {
					console.error("Error creating will:", willError);
					toast.error("Failed to create will");
					return;
				}

				// Create will owner record
				const { error: ownerError } = await apiClient("/will_owner", {
					method: "POST",
					body: JSON.stringify({
						will_id: willResponse.id,
						first_name: formData.firstName,
						last_name: formData.lastName,
						address: formData.address,
						city: formData.city,
						state: formData.state,
						post_code: formData.postCode,
						country: formData.country,
					}),
				});

				if (ownerError) {
					console.error("Error creating will owner:", ownerError);
					toast.error("Failed to create will owner");
					return;
				}

				// Update the active will in context
				if (setActiveWill && activeWill) {
					setActiveWill({
						...activeWill,
						id: willResponse.id,
						owner: {
							...activeWill.owner,
							firstName: formData.firstName,
							lastName: formData.lastName,
							address: formData.address,
							city: formData.city,
							state: formData.state,
							postCode: formData.postCode,
							country: formData.country,
						},
					});
				}

				toast.success("Will created successfully!");
			}

			// Proceed to next step
			onNext();
		} catch (error) {
			console.error("Error in PersonalInfoStep:", error);
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Get country options for the select dropdown
	const countryOptions: OptionType[] = countryRegionData.map(
		(country: CountryType) => ({
			value: country.countryName,
			label: country.countryName,
		})
	);

	// Get state/region options based on selected country
	const getStateOptions = (selectedCountry: string): OptionType[] => {
		const country = countryRegionData.find(
			(c: CountryType) => c.countryName === selectedCountry
		);
		if (country && country.regions) {
			return country.regions.map((region: RegionType) => ({
				value: region.name,
				label: region.name,
			}));
		}
		return [];
	};

	const selectedCountry = form.watch("country");
	const stateOptions = getStateOptions(selectedCountry);

	return (
		<>
			<WillDisclaimerDialog
				open={showDisclaimer}
				onDecline={() => {
					setShowDisclaimer(false);
					toast.error(
						"Disclaimer declined. You cannot proceed with creating your will."
					);
					navigate("/app/dashboard");
				}}
				onAccept={() => {
					setShowDisclaimer(false);
					toast.success(
						"Disclaimer accepted. You can now proceed with creating your will."
					);
				}}
			/>

			<div className="space-y-4">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					Personal Information
				</div>
				<div className="text-muted-foreground">
					Let's start with your basic information and address details.
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Personal Information Section */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Personal Details</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First Name *</FormLabel>
											<FormControl>
												<Input placeholder="Enter your first name" {...field} />
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
											<FormLabel>Last Name *</FormLabel>
											<FormControl>
												<Input placeholder="Enter your last name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Address Section */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Address Information</h3>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Street Address *</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your street address"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City *</FormLabel>
											<FormControl>
												<Input placeholder="Enter your city" {...field} />
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
											<FormLabel>State/Province *</FormLabel>
											<FormControl>
												<Select
													options={stateOptions}
													value={stateOptions.find(
														(option) => option.value === field.value
													)}
													onChange={(option) =>
														field.onChange(option?.value || "")
													}
													placeholder="Select state/province"
													className="w-full"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="postCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Postal/ZIP Code *</FormLabel>
											<FormControl>
												<Input placeholder="Enter postal/ZIP code" {...field} />
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
											<FormLabel>Country *</FormLabel>
											<FormControl>
												<Select
													options={countryOptions}
													value={countryOptions.find(
														(option) => option.value === field.value
													)}
													onChange={(option) =>
														field.onChange(option?.value || "")
													}
													placeholder="Select country"
													className="w-full"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Navigation buttons */}
						<div className="flex justify-end pt-6">
							<Button
								type="submit"
								disabled={isSubmitting}
								className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
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
		</>
	);
}
