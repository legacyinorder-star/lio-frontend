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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { API_CONFIG, getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { AuthPageHeader } from "@/components/auth/auth-page-header";

const formSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[ -~]{8,64}$/,
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
		<div className="min-h-screen flex flex-col">
			<AuthPageHeader />
			<div
				id="login-card-container"
				className="flex flex-col justify-center items-center pt-12"
			>
				<div className="flex flex-col items-center mb-2">
					<h2 className="text-[2rem] font-medium">Enter your new password</h2>
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
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-[#000000] text-sm font-normal">
													New Password
												</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Enter your new password"
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
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-[#000000] text-sm font-normal">
													Confirm Password
												</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Confirm your new password"
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
										className="w-full py-[0.75rem] mt-3 rounded-[0.25rem] bg-primary text-white font-[1rem] font-[600] cursor-pointer hover:bg-primary/90"
										disabled={isLoading}
									>
										{isLoading ? "Resetting..." : "Reset Password"}
									</Button>
								</form>
							</Form>
						</div>
						<div className="mt-2">
							<p className="text-sm text-[#000000]">
								Remember your password?{" "}
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
