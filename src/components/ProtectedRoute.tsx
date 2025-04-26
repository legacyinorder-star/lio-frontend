import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuthToken, getUserDetails, removeAuthData } from "@/utils/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
	children: ReactNode;
	requiredRole?: string;
}

export default function ProtectedRoute({
	children,
	requiredRole,
}: ProtectedRouteProps) {
	const { logout } = useAuth();
	const location = useLocation();
	const token = getAuthToken();
	const userDetails = getUserDetails();

	// Simpler authentication check without using complex JWT validation
	const authenticated = !!token && !!userDetails;

	// Check user role
	const userRole = userDetails?.role || "";
	const hasRequiredRole = !requiredRole || userRole === requiredRole;

	useEffect(() => {
		if (!token && !userDetails) {
			// No credentials at all
			toast.error("Please log in to access this page");
		} else if (!token || !userDetails) {
			// Partial credentials - could be corrupt state
			toast.error("Your session is invalid, please log in again");
			removeAuthData(); // Clean up any partial auth data
			logout();
		} else if (requiredRole && userRole !== requiredRole) {
			// User is logged in but doesn't have the required role
			toast.error(`You need ${requiredRole} permissions to access this page`);
		}
	}, [token, userDetails, logout, requiredRole, userRole]);

	if (!authenticated) {
		// Redirect to the login page with a return URL
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (authenticated && !hasRequiredRole) {
		// User is authenticated but lacks the required role
		// Redirect to user dashboard
		return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
	}

	return <>{children}</>;
}
