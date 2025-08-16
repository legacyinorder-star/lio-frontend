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
import { useNavigate } from "react-router-dom";

const nameSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type NameData = z.infer<typeof nameSchema>;

interface WillOwnerResponse {
	will_id: string;
	id: string;
}

interface NameStepProps extends StepProps {
	willOwnerData?: {
		firstName: string;
		lastName: string;
	} | null;
	onWillOwnerDataSave?: (data: {
		firstName: string;
		lastName: string;
	}) => Promise<boolean>;
}

export default function NameStep({
	data,
	onUpdate,
	onNext,
	willOwnerData,
	onWillOwnerDataSave,
}: NameStepProps) {
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
			};
		}

		if (activeWill?.owner) {
			return {
				firstName: activeWill.owner.firstName || "",
				lastName: activeWill.owner.lastName || "",
			};
		}

		if (data.firstName || data.lastName) {
			return {
				firstName: data.firstName || "",
				lastName: data.lastName || "",
			};
		}

		return {
			firstName: "",
			lastName: "",
		};
	};

	const initialValues = getInitialValues();

	const form = useForm<NameData>({
		resolver: zodResolver(nameSchema),
		defaultValues: initialValues,
		mode: "onChange",
	});

	const {
		formState: { isValid },
		setValue,
		trigger,
	} = form;

	// Pre-fill form when willOwnerData changes
	useEffect(() => {
		if (willOwnerData) {
			setValue("firstName", willOwnerData.firstName || "", {
				shouldValidate: false,
			});
			setValue("lastName", willOwnerData.lastName || "", {
				shouldValidate: false,
			});
			trigger();
		}
	}, [willOwnerData?.firstName, willOwnerData?.lastName, setValue, trigger]);

	// Separate effect for activeWill owner data
	useEffect(() => {
		if (!willOwnerData && activeWill?.owner) {
			setValue("firstName", activeWill.owner.firstName || "", {
				shouldValidate: false,
			});
			setValue("lastName", activeWill.owner.lastName || "", {
				shouldValidate: false,
			});
			trigger();
		}
	}, [
		willOwnerData,
		activeWill?.owner?.firstName,
		activeWill?.owner?.lastName,
		setValue,
		trigger,
	]);

	// Separate effect for data prop
	useEffect(() => {
		if (
			!willOwnerData &&
			!activeWill?.owner &&
			(data.firstName || data.lastName)
		) {
			setValue("firstName", data.firstName || "", { shouldValidate: false });
			setValue("lastName", data.lastName || "", { shouldValidate: false });
			trigger();
		}
	}, [
		willOwnerData,
		activeWill?.owner,
		data.firstName,
		data.lastName,
		setValue,
		trigger,
	]);

	const handleFormSubmit = async (values: NameData) => {
		// Check if disclaimer is still showing
		if (showDisclaimer) {
			return;
		}

		// Proceed with existing submission logic
		await handleSubmit(values);
	};

	const handleSubmit = async (values: NameData) => {
		setIsSubmitting(true);

		try {
			// If we have the new save function and an existing will, use it
			if (onWillOwnerDataSave && activeWill?.id) {
				const success = await onWillOwnerDataSave({
					firstName: values.firstName,
					lastName: values.lastName,
				});

				if (!success) {
					toast.error("Failed to save name information. Please try again.");
					return;
				}
			} else {
				// Fall back to original approach for new wills
				const requestData = {
					first_name: values.firstName,
					last_name: values.lastName,
					...(activeWill?.id && { will_id: activeWill.id }),
				};

				const { data: responseData, error } =
					await apiClient<WillOwnerResponse>("/will_owner", {
						method: "POST",
						body: JSON.stringify(requestData),
					});

				if (error) {
					console.error("Error saving will owner:", error);
					toast.error("Failed to save name information. Please try again.");
					return;
				}

				// Extract will_id from response and update only specific fields
				if (responseData && responseData.will_id) {
					if (activeWill) {
						// Update existing will with new id and name data
						setActiveWill({
							...activeWill,
							id: responseData.will_id,
							owner: {
								...activeWill.owner,
								id: responseData.id,
								firstName: values.firstName,
								lastName: values.lastName,
							},
						});
					} else {
						// Create new will with minimal data
						setActiveWill({
							id: responseData.will_id,
							lastUpdatedAt: new Date().toISOString(),
							createdAt: new Date().toISOString(),
							status: "draft",
							userId: "",
							owner: {
								id: responseData.id,
								firstName: values.firstName,
								lastName: values.lastName,
								maritalStatus: "",
								address: "",
								city: "",
								state: "",
								postCode: "",
								country: "",
							},
							assets: [],
							gifts: [],
							beneficiaries: [],
							executors: [],
							witnesses: [],
						});
					}
				}
			}

			// Update local form data
			onUpdate(values);

			// Show success message
			toast.success("Name saved successfully");

			// Proceed to next step
			await onNext();
		} catch (error) {
			console.error("Error in name submission:", error);
			toast.error(
				"An error occurred while saving your name. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDisclaimerAccept = async () => {
		console.log(
			"Disclaimer accepted - closing dialog and proceeding with form"
		);
		setShowDisclaimer(false);

		// Get current form data and proceed with submission
		// const currentFormData = form.getValues();
		//await handleSubmit(currentFormData);
	};

	const handleDisclaimerDecline = () => {
		setShowDisclaimer(false);
		// Optionally redirect to dashboard or show a message
		toast.info("Will creation cancelled. You can start again anytime.");
		navigate("/app/dashboard");
	};

	return (
		<>
			<div className="space-y-6 w-full max-w-4xl mx-auto">
				<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
					What is your full name?
				</div>
				<div className="text-muted-foreground">
					We'll use this as the legal name in your will.
				</div>
				<Form
					{...form}
					key={`name-form-${initialValues.firstName}-${initialValues.lastName}`}
				>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="space-y-6 w-full"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First Name</FormLabel>
											<FormControl>
												<Input
													placeholder="John"
													{...field}
													className="w-full"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="space-y-2">
								<FormField
									control={form.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Doe"
													{...field}
													className="w-full"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className="flex justify-end pt-4 max-w-md">
							<Button
								type="submit"
								className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
								disabled={!isValid || isSubmitting || showDisclaimer}
							>
								{isSubmitting ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
										Saving...
									</>
								) : showDisclaimer ? (
									<>
										Please Accept Disclaimer{" "}
										<ArrowRight className="ml-2 h-4 w-4" />
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

			{/* Disclaimer Dialog - Rendered outside Form context */}
			<WillDisclaimerDialog
				open={showDisclaimer}
				onAccept={handleDisclaimerAccept}
				onDecline={handleDisclaimerDecline}
			/>
		</>
	);
}
