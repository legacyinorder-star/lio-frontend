import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuthToken, getUserDetails, isTokenExpired } from "@/utils/auth";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock } from "lucide-react";

interface ProtectedRouteProps {
	children: ReactNode;
	requiredRole?: string;
	fallbackPath?: string;
	showLoadingCard?: boolean;
}

export default function ProtectedRoute({
	children,
	requiredRole,
	fallbackPath = "/app/dashboard",
	showLoadingCard = true,
}: ProtectedRouteProps) {
	const { user, isLoading, refreshSession, lastActivity } = useAuth();
	const location = useLocation();
	const [isValidatingSession, setIsValidatingSession] = useState(false);
	const [validationAttempted, setValidationAttempted] = useState(false);

	// Validate session on mount if user exists but hasn't been validated recently
	useEffect(() => {
		const validateSession = async () => {
			if (user && !validationAttempted) {
				setValidationAttempted(true);

				// Check if we need to validate the session
				const shouldValidate =
					!lastActivity || Date.now() - lastActivity.getTime() > 5 * 60 * 1000; // 5 minutes

				if (shouldValidate) {
					setIsValidatingSession(true);
					try {
						const isValid = await refreshSession();
						if (!isValid) {
							toast.error("Session validation failed. Please log in again.");
							return;
						}
					} catch (error) {
						console.error("Session validation error:", error);
					} finally {
						setIsValidatingSession(false);
					}
				}
			}
		};

		validateSession();
	}, [user, refreshSession, lastActivity, validationAttempted]);

	// Show loading state while auth is initializing or validating
	if (isLoading || isValidatingSession) {
		if (!showLoadingCard) {
			return (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">
							{isLoading ? "Loading..." : "Validating session..."}
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-md mx-auto">
					<CardContent className="p-8">
						<div className="flex flex-col items-center gap-4">
							{isValidatingSession ? (
								<Shield className="h-8 w-8 animate-pulse text-primary" />
							) : (
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							)}
							<div className="text-center">
								<h3 className="font-semibold text-lg mb-2">
									{isValidatingSession ? "Securing Your Session" : "Loading"}
								</h3>
								<p className="text-muted-foreground">
									{isValidatingSession
										? "Verifying your authentication..."
										: "Please wait while we load your dashboard..."}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Single source of truth for authentication
	const token = getAuthToken();
	const userDetails = getUserDetails();

	// Enhanced authentication checks with better error handling
	let hasValidToken = false;
	try {
		hasValidToken = !!(token && !isTokenExpired(token));
	} catch (error) {
		console.error("Error validating token:", error);
		// If token validation fails, treat as expired
		hasValidToken = false;
	}

	const hasUserData = user && userDetails;
	const isAuthenticated = hasValidToken && hasUserData;

	// Get user role with fallback
	const userRole = user?.role || userDetails?.role || "";
	const hasRequiredRole = !requiredRole || userRole === requiredRole;

	// Handle unauthenticated users
	if (!isAuthenticated) {
		// Provide specific feedback based on what's missing
		if (!token) {
			toast.error("Please log in to access this page");
		} else if (isTokenExpired(token)) {
			toast.error("Your session has expired. Please log in again.");
		} else if (!userDetails) {
			toast.error("User information is missing. Please log in again.");
		}

		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Handle users without required role
	if (!hasRequiredRole) {
		const roleMessage =
			requiredRole === "admin"
				? "You need administrator privileges to access this page"
				: `You need ${requiredRole} permissions to access this page`;

		toast.error(roleMessage);

		// Redirect to appropriate fallback based on user role
		const redirectPath =
			userRole === "admin" ? "/admin/dashboard" : fallbackPath;
		return <Navigate to={redirectPath} state={{ from: location }} replace />;
	}

	// Show session warning if user has been inactive for a while
	if (lastActivity && Date.now() - lastActivity.getTime() > 20 * 60 * 1000) {
		// Show a subtle warning for long inactivity (only once per session)
		const hasShownWarning = sessionStorage.getItem("inactivity-warning");
		if (!hasShownWarning) {
			sessionStorage.setItem("inactivity-warning", "true");
			toast.warning(
				"You've been inactive for a while. Please interact with the page to keep your session active.",
				{
					duration: 8000,
					icon: <Clock className="h-4 w-4" />,
				}
			);
		}
	}

	return <>{children}</>;
}
