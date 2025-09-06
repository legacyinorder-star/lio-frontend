import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "@/utils/apiClient";
import { mapWillDataFromAPI } from "@/utils/dataTransform";
import { type WillData } from "@/context/WillContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface WillStatusGuardProps {
	children: React.ReactNode;
	allowedStatuses?: string[];
	redirectTo?: string;
}

/**
 * WillStatusGuard - Prevents access to will editing when will is in protected states
 *
 * Protected states:
 * - "under review": Will is being reviewed by legal team
 * - "completed": Will has been finalized and should not be edited
 * - "submitted": Will has been submitted for review
 *
 * Allowed states for editing:
 * - "in progress": Will is being created/edited
 * - "draft": Will is ready for review but not yet submitted
 */
export default function WillStatusGuard({
	children,
	allowedStatuses = ["in progress", "draft"],
	redirectTo = "/app/dashboard",
}: WillStatusGuardProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [willData, setWillData] = useState<WillData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [accessDenied, setAccessDenied] = useState(false);

	useEffect(() => {
		const checkWillAccess = async () => {
			try {
				setIsLoading(true);
				const { data, error } = await apiClient("/wills/get-user-active-will");

				if (error) {
					console.error("Error loading will data:", error);
					toast.error("Failed to verify will access");
					navigate(redirectTo);
					return;
				}

				const willInfo = Array.isArray(data) ? data[0] : data;

				if (!willInfo) {
					// No will exists, allow access for creation
					setAccessDenied(false);
					setIsLoading(false);
					return;
				}

				const transformedWill = mapWillDataFromAPI(willInfo);
				setWillData(transformedWill);

				// Check if current status allows editing
				const isAllowed = allowedStatuses.includes(transformedWill.status);

				if (!isAllowed) {
					console.log(
						`🚫 Access denied: Will status '${transformedWill.status}' not in allowed statuses:`,
						allowedStatuses
					);
					setAccessDenied(true);
				} else {
					console.log(
						`✅ Access granted: Will status '${transformedWill.status}' is allowed`
					);
					setAccessDenied(false);
				}
			} catch (error) {
				console.error("Error checking will access:", error);
				toast.error("Failed to verify will access");
				navigate(redirectTo);
			} finally {
				setIsLoading(false);
			}
		};

		checkWillAccess();
	}, [location.pathname, allowedStatuses, navigate, redirectTo]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner message="Verifying will access..." />
			</div>
		);
	}

	if (accessDenied && willData) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
							{willData.status === "completed" ? (
								<CheckCircle className="h-8 w-8 text-green-600" />
							) : willData.status === "under review" ? (
								<Clock className="h-8 w-8 text-orange-600" />
							) : (
								<Lock className="h-8 w-8 text-gray-600" />
							)}
						</div>
						<CardTitle className="text-xl">
							{willData.status === "completed" && "Will Completed"}
							{willData.status === "under review" && "Will Under Review"}
							{willData.status === "submitted" && "Will Submitted"}
							{!["completed", "under review", "submitted"].includes(
								willData.status
							) && "Access Restricted"}
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<div className="text-sm text-muted-foreground">
							{willData.status === "completed" && (
								<>
									<p>Your will has been completed and finalized.</p>
									<p>
										Editing is no longer available to maintain document
										integrity.
									</p>
								</>
							)}
							{willData.status === "under review" && (
								<>
									<p>
										Your will is currently being reviewed by our legal team.
									</p>
									<p>
										Editing is temporarily disabled during the review process.
									</p>
								</>
							)}
							{willData.status === "submitted" && (
								<>
									<p>Your will has been submitted for processing.</p>
									<p>No further changes can be made at this time.</p>
								</>
							)}
							{!["completed", "under review", "submitted"].includes(
								willData.status
							) && (
								<>
									<p>This will cannot be edited in its current state.</p>
									<p>Status: {willData.status}</p>
								</>
							)}
						</div>

						<div className="flex flex-col gap-2 pt-4">
							<Button
								onClick={() => navigate("/app/dashboard")}
								className="w-full text-white"
							>
								Return to Dashboard
							</Button>
							{willData.status === "completed" && (
								<Button
									variant="outline"
									onClick={() => navigate(`/app/will/${willData.id}`)}
									className="w-full text-white"
								>
									Download Will
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Access granted - render children
	return <>{children}</>;
}
