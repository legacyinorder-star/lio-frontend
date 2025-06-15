import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

const formSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export default function ResetPasswordPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);
	const token = searchParams.get("token");
	const { user } = useAuth();

	// Redirect if user is already logged in
	useEffect(() => {
		if (user) {
			// Redirect based on user role
			if (user.role === "admin") {
				navigate("/admin/dashboard");
			} else {
				navigate("/app/dashboard");
			}
		}
	}, [user, navigate]);

	useEffect(() => {
		if (!token) {
			toast.error("Invalid password reset link");
			navigate("/login");
			return;
		}

		// Verify the token
		const verifyToken = async () => {
			try {
				const response = await fetch(
					getApiUrl("/password_reset_tokens/verify"),
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ token }),
					}
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || "Invalid or expired token");
				}

				setUserId(data.user_id);
			} catch (error) {
				console.error("Token verification failed:", error);
				toast.error(
					error instanceof Error ? error.message : "Invalid or expired token"
				);
				navigate("/login");
			}
		};

		verifyToken();
	}, [token, navigate]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!token || !userId) return;

		setIsLoading(true);
		try {
			const response = await fetch(
				getApiUrl(API_CONFIG.endpoints.auth.resetPassword),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						token,
						new_password: values.password,
						user_id: userId,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to reset password");
			}

			toast.success("Password reset successful!");
			navigate("/login");
		} catch (error) {
			console.error("Password reset failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to reset password"
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
					<CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
					<CardDescription>Enter your new password</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter your new password"
												{...field}
											/>
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
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Confirm your new password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Resetting..." : "Reset Password"}
							</Button>
						</form>
					</Form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<div className="text-sm text-center text-muted-foreground">
						Remember your password?{" "}
						<Link to="/login" className="text-primary hover:underline">
							Sign in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
