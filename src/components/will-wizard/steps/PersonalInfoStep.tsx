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
	middleName: z.string().optional(),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	dateOfBirth: z
		.string()
		.min(1, "Date of birth is required")
		.refine((date) => {
			if (!date) return false;
			const birthDate = new Date(date);
			const today = new Date();
			const age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();

			// Adjust age if birthday hasn't occurred this year
			const adjustedAge =
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
					? age - 1
					: age;

			return adjustedAge >= 18;
		}, "You must be at least 18 years old to create a will"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "Town/Borough is required"),
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

interface PersonalInfoStepProps extends StepProps {
	willOwnerData?: {
		firstName: string;
		middleName?: string;
		lastName: string;
		dateOfBirth?: string;
		address: string;
		city: string;
		state: string;
		postCode: string;
		country: string;
	} | null;
	onWillOwnerDataSave?: (data: {
		firstName: string;
		middleName?: string;
		lastName: string;
		dateOfBirth?: string;
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
}: PersonalInfoStepProps) {
	const { activeWill, setActiveWill } = useWill();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDisclaimer, setShowDisclaimer] = useState(false);
	const navigate = useNavigate();

	// Auto-show disclaimer if user hasn't agreed to it yet
	useEffect(() => {
		const hasNotAgreedToDisclaimer =
			activeWill?.agreed_disclaimer === false ||
			activeWill?.agreed_disclaimer === null;
		if (hasNotAgreedToDisclaimer && !showDisclaimer) {
			setShowDisclaimer(true);
		}
	}, [activeWill?.agreed_disclaimer]);

	// Determine the initial values for the form
	const getInitialValues = () => {
		// Priority: activeWill > data prop > empty strings
		if (activeWill?.owner) {
			return {
				firstName: activeWill.owner.firstName || "",
				middleName: activeWill.owner.middleName || "",
				lastName: activeWill.owner.lastName || "",
				dateOfBirth: activeWill.owner.dateOfBirth || "",
				address: activeWill.owner.address || "",
				city: activeWill.owner.city || "",
				state: activeWill.owner.state || "",
				postCode: activeWill.owner.postCode || "",
				country: "United Kingdom", // Always set to UK and disable
			};
		}

		return {
			firstName: data.firstName || "",
			middleName: data.middleName || "",
			lastName: data.lastName || "",
			dateOfBirth: data.dateOfBirth || "",
			address: data.address?.address || "",
			city: data.address?.city || "",
			state: data.address?.state || "",
			postCode: data.address?.postCode || "",
			country: "United Kingdom", // Always set to UK and disable
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
				middleName: formData.middleName,
				lastName: formData.lastName,
				dateOfBirth: formData.dateOfBirth,
				address: {
					address: formData.address,
					city: formData.city,
					state: formData.state,
					postCode: formData.postCode,
					country: "United Kingdom", // Always set to UK
				},
			};

			onUpdate(updatedData);

			// Always submit to /will_owner endpoint
			const { data: ownerResponse, error: ownerError } = await apiClient<{
				will_id?: string;
			}>("/will_owner", {
				method: "POST",
				body: JSON.stringify({
					will_id: activeWill?.id || null, // Include will_id if it exists, otherwise null
					first_name: formData.firstName,
					middle_name: formData.middleName,
					last_name: formData.lastName,
					date_of_birth: formData.dateOfBirth,
					address: formData.address,
					city: formData.city,
					state: formData.state,
					post_code: formData.postCode,
					country: "United Kingdom", // Always set to UK
				}),
			});

			if (ownerError) {
				console.error("Error creating/updating will owner:", ownerError);
				toast.error("Failed to save personal information");
				return;
			}

			// If this was a new will and we got a response with will_id, update the active will
			if (!activeWill?.id && ownerResponse?.will_id) {
				if (setActiveWill && activeWill) {
					setActiveWill({
						...activeWill,
						id: ownerResponse.will_id,
						owner: {
							...activeWill.owner,
							firstName: formData.firstName,
							middleName: formData.middleName,
							lastName: formData.lastName,
							dateOfBirth: formData.dateOfBirth,
							address: formData.address,
							city: formData.city,
							state: formData.state,
							postCode: formData.postCode,
							country: "United Kingdom", // Always set to UK
						},
					});
				}
				toast.success("Will created successfully!");
			} else {
				toast.success("Personal information saved successfully!");
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

	// Get town/borough options based on selected country
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

	// Handle disclaimer acceptance
	const handleDisclaimerAccept = async () => {
		if (!activeWill?.id) {
			// For new wills, just close the disclaimer
			setShowDisclaimer(false);
			toast.success(
				"Disclaimer accepted. You can now proceed with creating your will."
			);
			return;
		}

		try {
			// Update the will with disclaimer agreement
			const { error } = await apiClient(
				`/wills/${activeWill.id}/accept-disclaimer`,
				{
					method: "POST",
				}
			);

			if (error) {
				console.error("Error updating disclaimer agreement:", error);
				toast.error("Failed to save disclaimer agreement. Please try again.");
				return;
			}

			// Update the active will context
			if (setActiveWill && activeWill) {
				setActiveWill({
					...activeWill,
					agreed_disclaimer: true,
					agreed_disclaimer_date: new Date().toISOString(),
				});
			}

			setShowDisclaimer(false);
			toast.success(
				"Disclaimer accepted. You can now proceed with creating your will."
			);
		} catch (error) {
			console.error("Error in disclaimer acceptance:", error);
			toast.error(
				"An error occurred while saving disclaimer agreement. Please try again."
			);
		}
	};

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
				onAccept={handleDisclaimerAccept}
			/>

			<div className="space-y-6">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					Personal Information
				</div>
				<div className="text-[#696868] text-[0.875rem] -mt-4">
					Let's start with your basic information and address details.
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Personal Information Section */}
						<div className="space-y-4 mb-[2.45rem]">
							<div className="space-y-4 mt-[-0.5rem]">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-700">
												First Name *
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your first name"
													{...field}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary "
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="middleName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-700">
												Middle Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your middle name"
													{...field}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary "
												/>
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
											<FormLabel className="text-sm font-medium text-gray-700">
												Last Name *
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your last name"
													{...field}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
												/>
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
											<FormLabel className="text-sm font-medium text-gray-700">
												Date of Birth *
											</FormLabel>
											<FormControl>
												<Input
													type="date"
													{...field}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
												/>
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
											<FormLabel className="text-sm font-medium text-gray-700">
												Street Address *
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your street address"
													{...field}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary "
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-700">
												City *
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your city"
													{...field}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary "
												/>
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
											<FormLabel className="text-sm font-medium text-gray-700">
												Town/Borough *
											</FormLabel>
											<FormControl>
												<Select
													options={stateOptions}
													value={stateOptions.find(
														(option) => option.value === field.value
													)}
													onChange={(option) =>
														field.onChange(option?.value || "")
													}
													placeholder="Select town/borough"
													className="w-full"
													styles={{
														control: (provided) => ({
															...provided,
															height: "48px",
															borderRadius: "8px",
															border: "1px solid #d1d5db",
															"&:hover": {
																borderColor: "#173c37",
															},
															"&:focus-within": {
																borderColor: "#173c37",
																boxShadow: "0 0 0 2px rgba(23, 60, 55, 0.1)",
															},
														}),
														option: (provided, state) => ({
															...provided,
															backgroundColor: state.isSelected
																? "#173c37"
																: state.isFocused
																? "rgba(23, 60, 55, 0.1)"
																: "white",
															color: state.isSelected ? "white" : "#374151",
														}),
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="postCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-700">
												Postal/ZIP Code *
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter postal/ZIP code"
													{...field}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary "
												/>
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
											<FormLabel className="text-sm font-medium text-gray-700">
												Country *
											</FormLabel>
											<FormControl>
												<Select
													options={countryOptions}
													value={countryOptions.find(
														(option) => option.value === "United Kingdom"
													)}
													onChange={() => field.onChange("United Kingdom")}
													placeholder="Select country"
													className="w-full"
													isDisabled={true}
													styles={{
														control: (provided) => ({
															...provided,
															height: "48px",
															borderRadius: "8px",
															border: "1px solid #d1d5db",
															backgroundColor: "#f9fafb",
															"&:hover": {
																borderColor: "#d1d5db",
															},
															"&:focus-within": {
																borderColor: "#d1d5db",
																boxShadow: "none",
															},
														}),
														option: (provided, state) => ({
															...provided,
															backgroundColor: state.isSelected
																? "#3b82f6"
																: state.isFocused
																? "#eff6ff"
																: "white",
															"&:hover": {
																backgroundColor: "#eff6ff",
															},
														}),
													}}
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
							{/* <Button
								type="submit"
								disabled={isSubmitting}
								className="w-full h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
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
							</Button> */}
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
