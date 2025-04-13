import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
	first_name: z.string().min(2, "First name must be at least 2 characters"),
	last_name: z.string().min(2, "Last name must be at least 2 characters"),
});

export default function ProfilePage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const { user, setUser } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			first_name: user?.first_name || "",
			last_name: user?.last_name || "",
		},
	});

	useEffect(() => {
		if (!user) {
			navigate("/login");
		}
	}, [user, navigate]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!user) return;

		setIsLoading(true);
		try {
			const response = await fetch(getApiUrl(`/user/${user.id}`), {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
				body: JSON.stringify({
					first_name: values.first_name,
					last_name: values.last_name,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to update profile");
			}

			// After successful update, fetch the latest user details
			const userResponse = await fetch(getApiUrl("/auth/me"), {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});

			if (!userResponse.ok) {
				throw new Error("Failed to fetch updated user details");
			}

			const updatedUserDetails = await userResponse.json();

			// Update the user in the auth context with complete refreshed details
			setUser({
				...updatedUserDetails,
				token: user.token, // Preserve the token from the current user object
			});

			toast.success("Profile updated successfully!");
		} catch (error) {
			console.error("Profile update failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to update profile"
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="container mx-auto py-8">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>Profile Management</CardTitle>
					<CardDescription>Update your personal information</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="first_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter your first name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="last_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter your last name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										value={user?.email || ""}
										readOnly
										disabled
										className="bg-muted"
									/>
								</FormControl>
							</FormItem>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Updating..." : "Update Profile"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
