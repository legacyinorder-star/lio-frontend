import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, WifiOff, Eye, EyeOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { AuthPageHeader } from "@/components/auth/auth-page-header";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

interface LoginResponse {
	otp: string;
	otp_id: string;
}

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [isLoading, setIsLoading] = useState(false);
	const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
	const isOnline = useOnlineStatus();
	const [showPassword, setShowPassword] = useState(false);

	// Check API connectivity on component mount and when online status changes
	useEffect(() => {
		const checkApiStatus = async () => {
			if (!isOnline) {
				setApiAvailable(false);
				return;
			}

			try {
				//const status = await pingApi();
				const status = true;
				setApiAvailable(status);
				if (!status) {
					console.error("API is not available");
				}
			} catch (error) {
				console.error("Error checking API status:", error);
				setApiAvailable(false);
			}
		};

		checkApiStatus();
	}, [isOnline]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Verify we're online and API is available
		if (!isOnline) {
			toast.error("You are offline. Please check your internet connection.");
			return;
		}

		// Prevent login attempt if API is known to be unavailable
		if (apiAvailable === false) {
			toast.error(
				"Cannot connect to server. Please check your internet connection and try again."
			);
			return;
		}

		setIsLoading(true);
		try {
			console.log(
				"Attempting to login with API URL:",
				getApiUrl(API_CONFIG.endpoints.auth.login)
			);

			// Add timeout to prevent long-hanging requests
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

			const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.login), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: values.email,
					password: values.password,
				}),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			const data = await response.json();

			if (!response.ok) {
				const errorMessage =
					data.message || `Login failed with status: ${response.status}`;
				console.error("Login error:", errorMessage);
				throw new Error(errorMessage);
			}
			console.log(data);
			// Validate expected response shape
			if (!data.otp_id) {
				console.error("API response missing otp_id:", data);
				throw new Error("Invalid response from server");
			}

			const { otp_id, otp } = data as LoginResponse;
			toast.success("Welcome back! Please enter your OTP.");

			// Store return URL if it exists in location state
			const locationState = location.state as {
				from?: { pathname: string };
			} | null;
			const returnUrl =
				locationState?.from?.pathname || localStorage.getItem("returnUrl");
			if (returnUrl && returnUrl !== "/login") {
				localStorage.setItem("returnUrl", returnUrl);
			}

			// Pass both OTP ID and OTP code to verification page
			if (otp) {
				navigate(`/verify-otp?t=${otp_id}&otp=${otp}`);
			} else {
				navigate(`/verify-otp?t=${otp_id}`);
			}
		} catch (error) {
			console.error("Login failed:", error);

			// Specific error handling based on error type
			if (error instanceof DOMException && error.name === "AbortError") {
				toast.error("Request timed out. The server took too long to respond.");
			} else if (
				error instanceof TypeError &&
				error.message.includes("fetch")
			) {
				setApiAvailable(false);
				toast.error(
					"Network error: Could not connect to the authentication server. Please check your internet connection and try again."
				);
			} else if (error instanceof SyntaxError) {
				toast.error(
					"Server error: The server returned an invalid response. Please try again later."
				);
			} else {
				toast.error(error instanceof Error ? error.message : "Login failed");
			}
		} finally {
			setIsLoading(false);
		}
	}

	// Show appropriate offline message
	const getConnectionMessage = () => {
		if (!isOnline) {
			return {
				title: "You're Offline",
				description: "Please check your internet connection to log in.",
			};
		}

		if (apiAvailable === false) {
			return {
				title: "Server Unavailable",
				description:
					"We cannot reach our servers right now. Please try again later.",
			};
		}

		return null;
	};

	const connectionIssue = getConnectionMessage();

	return (
		<div className="min-h-screen flex flex-col">
			<AuthPageHeader />
			{connectionIssue && (
				<Alert variant="destructive" className="mb-4 max-w-md">
					{!isOnline ? (
						<WifiOff className="h-4 w-4" />
					) : (
						<AlertCircle className="h-4 w-4" />
					)}
					<AlertTitle>{connectionIssue.title}</AlertTitle>
					<AlertDescription>{connectionIssue.description}</AlertDescription>
				</Alert>
			)}

			<div
				id="login-card-container"
				className="flex flex-col justify-center items-center pt-12"
			>
				<div className="flex flex-col items-center mb-6">
					<h2 className="text-2xl font-bold">Log into your account</h2>
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
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-[#000000] font-[14px]">
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
												<FormLabel className="text-[#000000] font-[14px]">
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
									<Button
										type="submit"
										className="w-full py-[12px] px-[12px] rounded-lg bg-light-green font-[1rem] font-[600] cursor-pointer"
										disabled={isLoading || !isOnline || apiAvailable === false}
									>
										{isLoading ? "Signing in..." : "Continue"}
									</Button>
								</form>
							</Form>
						</div>
						<div className="mt-2">
							<p className="text-sm text-[#000000]">
								Don't have an account?{" "}
								<Link
									to="/signup"
									className="text-black font-bold cursor-pointer hover:underline"
								>
									Create an account
								</Link>
							</p>
							<p className="text-sm text-[#000000]">
								Forgot your password?{" "}
								<Link
									to="/request-password-reset"
									className="text-black font-bold cursor-pointer hover:underline"
								>
									Reset password
								</Link>
							</p>
							<div className="mt-12 flex flex-col justify-left items-left">
								<div className="flex items-center gap-2">
									<img src="svgs/green_shield.svg" alt="green shield" />
									<h2 className="text-[#000000] text-bold font-[0.875rem]">
										Privacy guaranteed
									</h2>
								</div>
								<p className="text-[#5E5D5D] font-[14px]">
									We take your privacy seriously. We will never sell your data,
									and our world-class security ensures your will is completely
									confidential.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
