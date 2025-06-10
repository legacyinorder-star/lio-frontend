import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { API_CONFIG, getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { UserDetails, setAuthToken, setUserDetails } from "@/utils/auth";
import { AuthPageHeader } from "@/components/auth/auth-page-header";

const formSchema = z.object({
	otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function OTPVerificationPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const { setUser } = useAuth();
	const otpId = searchParams.get("t");

	useEffect(() => {
		if (!otpId) {
			toast.error("Invalid verification token");
			navigate("/login");
		}
	}, [otpId, navigate]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			otp: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!otpId) return;

		setIsLoading(true);
		try {
			const verifyUrl = API_CONFIG.endpoints.auth.verifyOtp.replace(
				"{one_time_password_id}",
				otpId
			);
			const response = await fetch(getApiUrl(verifyUrl), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					otp_code: values.otp,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "OTP Verification failed");
			}

			// Store auth token
			setAuthToken(data.authToken);

			// Fetch user details
			const userResponse = await fetch(
				getApiUrl(API_CONFIG.endpoints.auth.me),
				{
					headers: {
						Authorization: `Bearer ${data.authToken}`,
					},
				}
			);

			if (!userResponse.ok) {
				throw new Error("Failed to fetch user details");
			}

			const userDetails: UserDetails = await userResponse.json();

			// Store user details
			setUserDetails(userDetails);

			// Convert UserDetails to User type for auth context
			setUser({
				id: userDetails.id,
				email: userDetails.email,
				first_name: userDetails.first_name || "",
				last_name: userDetails.last_name || "",
				role: userDetails.role,
				token: data.authToken,
			});

			toast.success("OTP verified successfully!");

			// Redirect based on user role
			if (userDetails.role === "admin") {
				navigate("/admin/dashboard");
			} else {
				navigate("/app/dashboard");
			}
		} catch (error) {
			console.error("OTP verification failed:", error);
			console.log(error);
			toast.error(
				error instanceof Error ? error.message : "OTP verification failed"
			);
		} finally {
			setIsLoading(false);
		}
	}

	const handleResendOTP = async () => {
		if (!otpId) return;

		setIsResending(true);
		try {
			// API endpoint for resending OTP
			const resendUrl = API_CONFIG.endpoints.auth.resendOtp.replace(
				"{one_time_password_id}",
				otpId
			);
			const response = await fetch(getApiUrl(resendUrl), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to resend OTP");
			}

			console.log(data);

			// Check if we received a new OTP ID in the response
			if (data.otp_id) {
				toast.success("New OTP code sent successfully!");
				// Redirect to the same page with the new OTP ID
				navigate(`/verify-otp?t=${data.otp_id}`);
			} else {
				toast.success("OTP resent successfully!");
			}
		} catch (error) {
			console.error("Failed to resend OTP:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to resend OTP"
			);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<AuthPageHeader />
			<div
				id="otp-card-container"
				className="flex flex-col justify-center items-center pt-12"
			>
				<Card className="w-full max-w-md border-none rounded-none shadow-none">
					<div className="flex flex-col items-center mb-6">
						<h2 className="text-2xl font-bold">Verify OTP</h2>
					</div>
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
									<FormField
										control={form.control}
										name="otp"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Enter the 6-digit code sent to your email
												</FormLabel>
												<FormControl>
													<Input
														placeholder="OTP code"
														className="border-[#CCCCCC] py-[10px] px-[16px] rounded-lg mt-2"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="submit"
										className="w-full py-[12px] px-[12px] rounded-lg bg-light-green font-[1rem] font-[600]"
										disabled={isLoading}
									>
										{isLoading ? "Verifying..." : "Verify OTP"}
									</Button>
								</form>
							</Form>
						</div>
						<div className="mt-2">
							<p className="text-sm text-[#000000]">
								Didn't receive the code?{" "}
								<button
									className="text-black font-bold cursor-pointer hover:underline"
									onClick={handleResendOTP}
									disabled={isResending}
								>
									{isResending ? "Resending..." : "Resend"}
								</button>
							</p>
						</div>
					</CardContent>
					{/* <CardFooter className="flex flex-col space-y-4">
						<div className="text-sm text-center text-muted-foreground">
							Didn't receive the code?{" "}
							<button
								className="text-primary hover:underline"
								onClick={handleResendOTP}
							>
								Resend
							</button>
						</div>
					</CardFooter> */}
				</Card>
			</div>
		</div>
	);
}
