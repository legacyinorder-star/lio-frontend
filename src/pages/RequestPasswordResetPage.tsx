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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { API_CONFIG, getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { AuthPageHeader } from "@/components/auth/auth-page-header";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export default function RequestPasswordResetPage() {
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();

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

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		try {
			const response = await fetch(
				getApiUrl(API_CONFIG.endpoints.auth.requestPasswordReset),
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: values.email,
					}),
				}
			);

			const data = await response.json();
			console.log(data);

			if (!response.ok) {
				throw new Error(data.message || "Failed to request password reset");
			}

			toast.success("Password reset link sent to your email!");
			form.reset();
		} catch (error) {
			console.error("Password reset request failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to request password reset"
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex flex-col">
			<AuthPageHeader />
			<div
				id="password-reset-card-container"
				className="flex flex-col justify-center items-center pt-12"
			>
				<div className="flex flex-col items-center mb-2">
					<h2 className="text-[2rem] font-medium">Reset Password</h2>
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
									<Button
										type="submit"
										className="w-full py-[0.75rem] mt-3 rounded-[0.25rem] bg-primary text-white font-[1rem] font-[600] cursor-pointer hover:bg-primary/90"
										disabled={isLoading}
									>
										{isLoading ? "Sending..." : "Send Reset Link"}
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
