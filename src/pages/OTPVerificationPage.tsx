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
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { API_CONFIG, getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { UserDetails, setAuthToken, setUserDetails } from "@/utils/auth";

const formSchema = z.object({
	otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function OTPVerificationPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
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
			navigate("/app/dashboard");
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

			toast.success("OTP resent successfully!");
		} catch (error) {
			console.error("Failed to resend OTP:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to resend OTP"
			);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="mb-8 flex items-center justify-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="mr-2 h-6 w-6"
				>
					<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
				</svg>
				<span className="text-lg font-medium">Legacy In Order</span>
			</div>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
					<CardDescription>
						Enter the 6-digit code sent to your email
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="otp"
								render={({ field }) => (
									<FormItem>
										<FormLabel>OTP Code</FormLabel>
										<FormControl>
											<Input placeholder="Enter 6-digit code" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Verifying..." : "Verify OTP"}
							</Button>
						</form>
					</Form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<div className="text-sm text-center text-muted-foreground">
						Didn't receive the code?{" "}
						<button
							className="text-primary hover:underline"
							onClick={handleResendOTP}
						>
							Resend
						</button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
