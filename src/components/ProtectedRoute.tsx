import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuthToken, getUserDetails } from "@/utils/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
	children: ReactNode;
	requiredRole?: string;
}

export default function ProtectedRoute({
	children,
	requiredRole,
}: ProtectedRouteProps) {
	const { user } = useAuth();
	const location = useLocation();

	// Check if we have a user from context first (this comes from useAuth hook)
	// If not, then try to get from localStorage as a fallback
	const isAuthenticated = !!user || (!!getAuthToken() && !!getUserDetails());

	// Get user role from context or localStorage
	const userRole = user?.role || getUserDetails()?.role || "";
	const hasRequiredRole = !requiredRole || userRole === requiredRole;

	useEffect(() => {
		if (!isAuthenticated) {
			// No valid authentication
			toast.error("Please log in to access this page");
		} else if (requiredRole && userRole !== requiredRole) {
			// User is logged in but doesn't have the required role
			toast.error(`You need ${requiredRole} permissions to access this page`);
		}
	}, [isAuthenticated, requiredRole, userRole]);

	if (!isAuthenticated) {
		// Redirect to the login page with a return URL
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (isAuthenticated && !hasRequiredRole) {
		// User is authenticated but lacks the required role
		// Redirect to user dashboard
		return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
	}

	return <>{children}</>;
}
