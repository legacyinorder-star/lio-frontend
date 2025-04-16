import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

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
	const [isLoading, setIsLoading] = useState(false);
	const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
	const isOnline = useOnlineStatus();

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

			const { otp_id } = data as LoginResponse;
			toast.success("Welcome back! Please enter your OTP.");
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

	const handleGoogleSignIn = async () => {
		if (!isOnline || apiAvailable === false) {
			toast.error(
				"Cannot connect to server. Please check your internet connection."
			);
			return;
		}

		try {
			// Implement Google sign-in logic
			toast.info("Google sign-in functionality coming soon");
		} catch (error) {
			console.error("Google sign-in failed:", error);
		}
	};

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

			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
					<CardDescription>
						Enter your credentials to access your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={handleGoogleSignIn}
							disabled={!isOnline || apiAvailable === false}
						>
							<svg
								className="mr-2 h-4 w-4"
								aria-hidden="true"
								focusable="false"
								data-prefix="fab"
								data-icon="google"
								role="img"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 488 512"
							>
								<path
									fill="currentColor"
									d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
								></path>
							</svg>
							Sign in with Google
						</Button>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
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
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="john.doe@example.com"
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
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Enter your password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-full"
									disabled={isLoading || !isOnline || apiAvailable === false}
								>
									{isLoading ? "Signing in..." : "Sign in"}
								</Button>
							</form>
						</Form>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<div className="text-sm text-center text-muted-foreground">
						Don't have an account?{" "}
						<Link to="/signup" className="text-primary hover:underline">
							Create an account
						</Link>
					</div>
					<div className="text-sm text-center text-muted-foreground">
						Forgot your password?{" "}
						<Link
							to="/request-password-reset"
							className="text-primary hover:underline"
						>
							Reset password
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
