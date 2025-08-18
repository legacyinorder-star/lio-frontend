import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/utils/apiClient";

interface SignupResponse {
	otp_id: string;
}

const formSchema = z
	.object({
		firstName: z.string().min(2, "First name must be at least 2 characters"),
		lastName: z.string().min(2, "Last name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number"
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export default function SignupPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		try {
			const { data, error } = await apiClient<SignupResponse>("/auth/signup", {
				method: "POST",
				authenticated: false, // Signup doesn't require authentication
				body: JSON.stringify({
					email: values.email,
					password: values.password,
					first_name: values.firstName,
					last_name: values.lastName,
				}),
			});

			if (error) {
				throw new Error(error);
			}

			if (!data) {
				throw new Error("No response data received");
			}

			console.log(data);

			if (data.otp_id) {
				// Navigate to OTP verification with the OTP ID and OTP code if available
				navigate(`/verify-otp?t=${data.otp_id}`);
			} else {
				throw new Error("OTP ID not received from server");
			}

			// Show success message
			toast.success("Account created successfully!");
		} catch (error) {
			console.error("Signup failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create account"
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex flex-col">
			<AuthPageHeader />
			<div
				id="signup-card-container"
				className="flex flex-col justify-center items-center pt-12"
			>
				<div className="flex flex-col items-center mb-2">
					<h2 className="text-[2rem] font-medium">Create an account</h2>
				</div>
				<Card className="w-full max-w-md border-none rounded-none shadow-none">
					<CardContent>
						<div className="space-y-4">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
							</div>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="firstName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-[#000000] text-sm font-normal">
														First name
													</FormLabel>
													<FormControl>
														<Input
															placeholder="John"
															{...field}
															className="border-[#CCCCCC] py-[10px] px-[16px] rounded-lg mt-2"
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
													<FormLabel className="text-[#000000] text-sm font-normal">
														Last name
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Doe"
															{...field}
															className="border-[#CCCCCC] py-[10px] px-[16px] rounded-lg mt-2"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-[#000000] text-sm font-normal">
													Email
												</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="john.doe@example.com"
														className="border-[#CCCCCC] py-[10px] px-[16px] rounded-lg mt-2"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-[#000000] text-sm font-normal">
													Password
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type={showPassword ? "text" : "password"}
															placeholder="Enter your password"
															className="border-[#CCCCCC] py-[10px] px-[16px] rounded-lg pr-10 mt-2"
															{...field}
														/>
														<button
															type="button"
															onClick={() => setShowPassword(!showPassword)}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
														>
															{showPassword ? (
																<div className="text-[#818181] flex items-center gap-2">
																	Hide <EyeOff className="h-4 w-4" />
																</div>
															) : (
																<div className="text-[#818181] flex items-center gap-2">
																	Show <Eye className="h-4 w-4" />
																</div>
															)}
														</button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-[#000000] text-sm font-normal">
													Confirm password
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type={showConfirmPassword ? "text" : "password"}
															placeholder="Confirm your password"
															className="border-[#CCCCCC] py-[10px] px-[16px] rounded-lg pr-10 mt-2"
															{...field}
														/>
														<button
															type="button"
															onClick={() =>
																setShowConfirmPassword(!showConfirmPassword)
															}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
														>
															{showConfirmPassword ? (
																<div className="text-[#818181] flex items-center gap-2">
																	Hide <EyeOff className="h-4 w-4" />
																</div>
															) : (
																<div className="text-[#818181] flex items-center gap-2">
																	Show <Eye className="h-4 w-4" />
																</div>
															)}
														</button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<p className="text-sm text-[#000000]">
										By clicking "Create account", you agree to our{" "}
										<Link
											to="/terms-conditions"
											className="text-black font-semibold cursor-pointer hover:underline"
										>
											terms of service
										</Link>{" "}
										and acknowledge you have read our{" "}
										<Link
											to="/privacy-policy"
											className="text-black font-semibold cursor-pointer hover:underline"
										>
											privacy policy
										</Link>
										.
									</p>
									<Button
										type="submit"
										className="w-full py-[0.75rem] mt-3 rounded-[0.25rem] bg-primary text-white font-[1rem] font-[600] cursor-pointer hover:bg-primary/90"
										disabled={isLoading}
									>
										{isLoading ? "Creating account..." : "Create account"}
									</Button>
								</form>
							</Form>
						</div>
						<div className="mt-2">
							<p className="text-sm text-[#000000]">
								Already have an account?{" "}
								<Link
									to="/login"
									className="text-black font-semibold cursor-pointer hover:underline"
								>
									Sign in
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
