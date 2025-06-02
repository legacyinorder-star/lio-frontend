import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
	Shield,
	User,
	Power,
	ArrowLeft,
	Mail,
	Calendar,
	Clock,
} from "lucide-react";

interface UserDetails {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role?: string;
	created_at: string;
	last_login_at?: string;
	is_active: boolean;
}

export default function UserDetailPage() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const { user: currentUser } = useAuth();
	const [user, setUser] = useState<UserDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (userId) {
			fetchUserDetails();
		}
	}, [userId]);

	const fetchUserDetails = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(getApiUrl(`/admin/users/${userId}`), {
				headers: {
					Authorization: `Bearer ${currentUser?.token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch user details");
			}

			const data = await response.json();
			setUser(data);
		} catch (error) {
			console.error("Error fetching user details:", error);
			toast.error("Failed to load user details");
			navigate("/admin/users");
		} finally {
			setIsLoading(false);
		}
	};

	const toggleUserStatus = async () => {
		if (!user) return;

		try {
			const response = await fetch(getApiUrl(`/admin/users/${userId}/status`), {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${currentUser?.token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to update user status");
			}

			setUser({ ...user, is_active: !user.is_active });
			toast.success(
				`User ${!user.is_active ? "activated" : "deactivated"} successfully`
			);
		} catch (error) {
			console.error("Error updating user status:", error);
			toast.error("Failed to update user status");
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "Never";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p className="text-[#545454]">Loading user details...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-semibold text-[#545454] mb-4">
					User not found
				</h2>
				<Button
					variant="outline"
					onClick={() => navigate("/admin/users")}
					className="gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Users
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						onClick={() => navigate("/admin/users")}
						className="gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>
					<h2 className="text-3xl font-medium tracking-tight">User Details</h2>
				</div>
				<Button
					variant={user.is_active ? "destructive" : "default"}
					onClick={toggleUserStatus}
					className="gap-2"
				>
					<Power className="h-4 w-4" />
					{user.is_active ? "Deactivate User" : "Activate User"}
				</Button>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-xl">Profile Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#F3F3F3] flex items-center justify-center">
									<span className="text-2xl font-medium text-[#545454]">
										{user.first_name?.[0] || ""}
										{user.last_name?.[0] || ""}
									</span>
								</div>
								<div>
									<h3 className="text-lg font-medium">
										{user.first_name} {user.last_name}
									</h3>
									<div className="flex items-center gap-2 text-[#545454]">
										<Mail className="h-4 w-4" />
										<span>{user.email}</span>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<p className="text-sm text-[#909090]">Role</p>
									<div className="flex items-center gap-2">
										{user.role === "admin" ? (
											<Shield className="h-4 w-4 text-purple-600" />
										) : (
											<User className="h-4 w-4 text-gray-600" />
										)}
										<span className="font-medium">
											{user.role?.charAt(0).toUpperCase() +
												user.role?.slice(1) || "User"}
										</span>
									</div>
								</div>

								<div className="space-y-1">
									<p className="text-sm text-[#909090]">Status</p>
									<div className="flex items-center gap-2">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-xs font-medium ${
												user.is_active
													? "bg-[#E5FC99] text-[#3F7F03]"
													: "bg-[#FFCACA] text-[#FF0000]"
											}`}
										>
											<span
												className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
													user.is_active ? "bg-[#3F7F03]" : "bg-[#FF0000]"
												}`}
											/>
											{user.is_active ? "Active" : "Inactive"}
										</span>
									</div>
								</div>

								<div className="space-y-1">
									<p className="text-sm text-[#909090]">Created</p>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-[#545454]" />
										<span>{formatDate(user.created_at)}</span>
									</div>
								</div>

								<div className="space-y-1">
									<p className="text-sm text-[#909090]">Last Login</p>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-[#545454]" />
										<span>{formatDate(user.last_login_at)}</span>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Add more cards here for additional user information */}
				{/* For example: Activity Log, Associated Documents, etc. */}
			</div>
		</div>
	);
}
