import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
	Shield,
	User,
	ArrowLeft,
	Calendar,
	Clock,
	Pencil,
	FilePlus,
	PlusCircle,
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
			const response = await fetch(getApiUrl(`/user/${userId}`), {
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
				<div className="flex flex-col gap-1">
					<Link
						to="/admin/users"
						className="text-[#499700] hover:text-[#499700]/90 text-sm font-medium mb-2"
					>
						Users
					</Link>
					<div className="flex flex-col gap-1">
						<h2 className="text-3xl font-medium text-[#181D27] tracking-tight flex items-center gap-3">
							{user.first_name} {user.last_name}
							<span
								className={`inline-flex items-center px-2 py-[2px] rounded-[4px] text-[11px] font-medium ${
									user.is_active
										? "bg-[#E5FC99] text-[#3F7F03]"
										: "bg-[#FFCACA] text-[#FF0000]"
								}`}
							>
								<span
									className={`mr-1 h-1 w-1 rounded-full ${
										user.is_active ? "bg-[#3F7F03]" : "bg-[#FF0000]"
									}`}
								/>
								{user.is_active ? "Active" : "Inactive"}
							</span>
						</h2>
						<span className="text-[0.875rem] text-[#545454]">{user.email}</span>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						className="gap-2 border-[#DADADA] text-[#545454] hover:bg-muted/50 cursor-pointer"
					>
						<Pencil className="h-4 w-4" />
						Edit Information
					</Button>
					<Button
						variant="outline"
						className={`gap-2 cursor-pointer ${
							user.is_active
								? "text-[#FF0000] border-[#DADADA] hover:bg-red-50"
								: "bg-light-green text-black border-[#DADADA] hover:bg-light-green/90"
						}`}
						onClick={toggleUserStatus}
					>
						{user.is_active ? "Deactivate User" : "Activate User"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-12 mt-12">
				{/* Left Column - 2/3 width */}
				<div className="col-span-2 space-y-6">
					<div className="space-y-4">
						<h3 className="text-[1.25rem] font-medium text-[#181D27] font-dm-sans">
							Documents Created
						</h3>
						<div className="border-2 border-dashed border-[#BCBCBC] rounded-[4px] p-8 flex flex-col items-center justify-center text-center">
							<p className="text-[#909090] mb-4">
								This user has not created any documents
							</p>
							<Button
								variant="outline"
								className="border-[#DADADA] rounded-[4px] text-[#212121] hover:bg-muted/50 gap-2 cursor-pointer"
							>
								<FilePlus className="h-4 w-4" />
								Create Document
							</Button>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-[1.25rem] font-medium text-[#181D27] font-dm-sans">
							Subscriptions
						</h3>
						<div className="border-2 border-dashed border-[#909090] rounded-[4px] p-8 flex flex-col items-center justify-center text-center">
							<p className="text-[#909090] mb-4">
								This user has no subscriptions
							</p>
							<Button
								variant="outline"
								className="border-[#DADADA] rounded-[4px] text-[#212121] hover:bg-muted/50 gap-2 cursor-pointer"
							>
								<PlusCircle className="h-4 w-4" />
								Add Subscription
							</Button>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-[1.25rem] font-medium text-[#181D27] font-dm-sans">
							Recent Activity
						</h3>
						<div className="text-[#545454] text-sm">No recent activity</div>
					</div>
				</div>

				{/* Right Column - 1/3 width */}
				<div className="space-y-6">
					<div className="space-y-4">
						<h3 className="text-[1.25rem] font-medium text-[#181D27] font-dm-sans">
							Details
						</h3>
						<div className="grid gap-6">
							<div className="space-y-1">
								<p className="text-sm text-[#909090]">Full Name</p>
								<p className="font-medium">
									{user.first_name} {user.last_name}
								</p>
							</div>

							<div className="space-y-1">
								<p className="text-sm text-[#909090]">Email Address</p>
								<p className="font-medium">{user.email}</p>
							</div>

							<div className="space-y-1">
								<p className="text-sm text-[#909090]">Role</p>
								<div className="flex items-center gap-2">
									{user.role === "admin" ? (
										<Shield className="h-4 w-4 text-purple-600" />
									) : (
										<User className="h-4 w-4 text-gray-600" />
									)}
									<span className="font-medium">
										{user.role
											? user.role.charAt(0).toUpperCase() + user.role.slice(1)
											: "User"}
									</span>
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-sm text-[#909090]">Status</p>
								<div className="flex items-center gap-2">
									<span
										className={`inline-flex items-center px-2 py-[2px] rounded-[4px] text-[11px] font-medium ${
											user.is_active
												? "bg-[#E5FC99] text-[#3F7F03]"
												: "bg-[#FFCACA] text-[#FF0000]"
										}`}
									>
										<span
											className={`mr-1 h-1 w-1 rounded-full ${
												user.is_active ? "bg-[#3F7F03]" : "bg-[#FF0000]"
											}`}
										/>
										{user.is_active ? "Active" : "Inactive"}
									</span>
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-sm text-[#909090]">Account Created</p>
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-[#545454]" />
									<span className="font-medium">
										{formatDate(user.created_at)}
									</span>
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-sm text-[#909090]">Last Login</p>
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-[#545454]" />
									<span className="font-medium">
										{formatDate(user.last_login_at)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
