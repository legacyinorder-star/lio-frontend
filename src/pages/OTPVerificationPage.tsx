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
import { getApiUrl } from "@/config/api";

const formSchema = z.object({
	otp: z.string().length(6, "OTP must be 6 digits"),
});

interface UserDetails {
	id: string;
	email: string;
	name?: string;
	// Add other user fields as needed
}

export default function OTPVerificationPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const otpId = searchParams.get("t");

	useEffect(() => {
		if (!otpId) {
			toast.error("Invalid verification link");
			navigate("/login");
		}
	}, [otpId, navigate]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			otp: "",
		},
	});

	async function fetchUserDetails(token: string): Promise<UserDetails> {
		const response = await fetch(getApiUrl("/auth/me"), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch user details");
		}

		return response.json();
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!otpId) return;

		setIsLoading(true);
		try {
			const response = await fetch(
				getApiUrl(`/one_time_password/${otpId}/verify`),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						otp_code: values.otp,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Verification failed");
			}

			// Store the auth token from successful verification
			if (data.authToken) {
				localStorage.setItem("authToken", data.authToken);

				// Fetch user details
				const userDetails = await fetchUserDetails(data.authToken);
				localStorage.setItem("userDetails", JSON.stringify(userDetails));
				console.log(userDetails);

				toast.success("OTP verification successful!");
				navigate("/app/dashboard");
			}
		} catch (error) {
			console.error("Verification failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Verification failed"
			);
		} finally {
			setIsLoading(false);
		}
	}

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
					<CardTitle className="text-2xl font-bold">
						Verify Your Email
					</CardTitle>
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
										<FormLabel>Verification Code</FormLabel>
										<FormControl>
											<Input
												type="text"
												placeholder="Enter 6-digit code"
												maxLength={6}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Verifying..." : "Verify"}
							</Button>
						</form>
					</Form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<div className="text-sm text-center text-muted-foreground">
						Didn't receive the code?{" "}
						<Button
							variant="link"
							className="p-0 h-auto"
							onClick={() => navigate("/login")}
						>
							Try again
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
