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
	const preloadedOtp = searchParams.get("otp");

	useEffect(() => {
		if (!otpId) {
			toast.error("Invalid verification token");
			navigate("/login");
		}
	}, [otpId, navigate]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			otp: preloadedOtp || "",
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

			// Validate the token format before proceeding
			if (!data.authToken) {
				throw new Error("No authentication token received from server");
			}

			// Token format validation (supports both JWT and JWE)
			const tokenParts = data.authToken.split(".");
			const isJWT = tokenParts.length === 3; // Standard JWT format
			const isJWE = tokenParts.length === 5; // JSON Web Encryption format

			if (!isJWT && !isJWE) {
				console.error("Invalid token format received:", {
					token: data.authToken,
					parts: tokenParts,
					partsLength: tokenParts.length,
					expectedFormats: "JWT (3 parts) or JWE (5 parts)",
				});
				throw new Error("Invalid token format received from server");
			}

			console.log("Token validation successful:", {
				format: isJWE ? "JWE (encrypted)" : "JWT",
				partsLength: tokenParts.length,
				tokenPreview: `${data.authToken.substring(0, 20)}...`,
			});

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
			const userData = {
				id: userDetails.id,
				email: userDetails.email,
				first_name: userDetails.first_name || "",
				last_name: userDetails.last_name || "",
				role: userDetails.role,
				token: data.authToken,
			};

			// Update auth context
			setUser(userData);

			toast.success("OTP verified successfully!");

			// Small delay to ensure auth context is updated before navigation
			setTimeout(() => {
				// Check for return URL first
				const returnUrl = localStorage.getItem("returnUrl");
				if (returnUrl && returnUrl !== "/login") {
					localStorage.removeItem("returnUrl");
					navigate(returnUrl);
					return;
				}

				// Default redirect based on user role
				if (userDetails.role === "admin") {
					navigate("/admin/dashboard");
				} else {
					navigate("/app/dashboard");
				}
			}, 100);
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
										className="w-full py-[12px] px-[12px] rounded-lg bg-light-green font-[1rem] font-[600] cursor-pointer"
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
				</Card>
			</div>
		</div>
	);
}
