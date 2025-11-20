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
import { addDataSourceHeader } from "@/utils/apiClient";
import { startGoogleOAuthPopup } from "@/utils/googlePopupAuth";
import { useAuth } from "@/hooks/useAuth";
import { setAuthToken, setUserDetails, UserDetails } from "@/utils/auth";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

interface LoginResponse {
	otp_id: string;
}

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
	const isOnline = useOnlineStatus();
	const [showPassword, setShowPassword] = useState(false);
	const { setUser } = useAuth();

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

			const headers = addDataSourceHeader({
				"Content-Type": "application/json",
			});

			const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.login), {
				method: "POST",
				headers,
				body: JSON.stringify({
					email: values.email.trim().toLowerCase(),
					password: values.password.trim(),
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

			const { otp_id } = data as LoginResponse;
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
			navigate(`/verify-otp?t=${otp_id}`);
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

	const handleGoogleSuccess = async (
		token: string,
		name?: string,
		email?: string
	) => {
		setAuthToken(token);

		const headers = addDataSourceHeader({
			Authorization: `Bearer ${token}`,
		});

		const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.me), {
			headers,
		});

		if (!response.ok) {
			throw new Error("Failed to fetch user details after Google sign-in.");
		}

		const userDetails: UserDetails = await response.json();
		setUserDetails(userDetails);

		const userData = {
			id: userDetails.id,
			email: userDetails.email || email || "",
			first_name:
				userDetails.first_name || (name ? name.split(" ")[0] : "") || "",
			last_name:
				userDetails.last_name ||
				(name ? name.split(" ").slice(1).join(" ") : "") ||
				"",
			role: userDetails.role,
			token,
		};

		setUser(userData);

		const returnUrl = localStorage.getItem("returnUrl");
		if (returnUrl && returnUrl !== "/login") {
			localStorage.removeItem("returnUrl");
			navigate(returnUrl);
			return;
		}

		if (userDetails.role === "admin") {
			navigate("/admin/dashboard");
		} else {
			navigate("/app/dashboard");
		}
	};

	const handleGoogleSignIn = async () => {
		if (!isOnline) {
			toast.error("You are offline. Please check your internet connection.");
			return;
		}

		setIsGoogleLoading(true);
		try {
			const { token, name, email, is_created } = await startGoogleOAuthPopup();
			await handleGoogleSuccess(token, name, email);
			if (is_created) {
				toast.success("Account created and signed in with Google!");
			} else {
				toast.success("Signed in with Google");
			}
		} catch (error) {
			console.error("Google sign-in failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Google sign-in failed. Please try again."
			);
		} finally {
			setIsGoogleLoading(false);
		}
	};

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
				<div className="flex flex-col items-center mb-2">
					<h2 className="text-[2rem] font-medium">Log into your account</h2>
				</div>
				<Card className="w-full max-w-md border-none rounded-none shadow-none">
					<CardContent>
						<div className="space-y-4">
							<Button
								type="button"
								variant="outline"
								onClick={handleGoogleSignIn}
								disabled={isGoogleLoading || !isOnline}
								className="w-full flex items-center justify-center gap-2 border border-[#CCCCCC] py-[0.75rem]"
							>
								{isGoogleLoading ? (
									"Connecting..."
								) : (
									<>
										<svg
											className="w-5 h-5"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
												fill="#4285F4"
											/>
											<path
												d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
												fill="#34A853"
											/>
											<path
												d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
												fill="#FBBC05"
											/>
											<path
												d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
												fill="#EA4335"
											/>
										</svg>
										Continue with Google
									</>
								)}
							</Button>
							<div className="relative py-2">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t border-gray-200" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-white px-2 text-gray-500">or</span>
								</div>
							</div>
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
									<Button
										type="submit"
										className="w-full py-[0.75rem] mt-3 rounded-[0.25rem] bg-primary text-white font-[1rem] font-[600] cursor-pointer hover:bg-primary/90"
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
									className="text-black font-semibold cursor-pointer hover:underline"
								>
									Create an account
								</Link>
							</p>
							<p className="text-sm text-[#000000]">
								Forgot your password?{" "}
								<Link
									to="/request-password-reset"
									className="text-black font-semibold cursor-pointer hover:underline"
								>
									Reset password
								</Link>
							</p>
							<div className="mt-12 flex flex-col justify-left items-left">
								<div className="flex items-center gap-2">
									<img src="svgs/green_shield.svg" alt="green shield" />
									<h2 className="text-[#000000] font-semibold text-[0.875rem]">
										Privacy guaranteed
									</h2>
								</div>
								<p className="text-[#5E5D5D] text-sm">
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
