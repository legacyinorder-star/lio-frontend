import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuthToken, getUserDetails, isTokenExpired } from "@/utils/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
	children: ReactNode;
	requiredRole?: string;
}

export default function ProtectedRoute({
	children,
	requiredRole,
}: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	// Show loading state while auth is initializing
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Single source of truth for authentication
	const token = getAuthToken();
	const userDetails = getUserDetails();

	// Check authentication status
	const isAuthenticated = user && token && !isTokenExpired(token);

	// Get user role with fallback
	const userRole = user?.role || userDetails?.role || "";
	const hasRequiredRole = !requiredRole || userRole === requiredRole;

	// Handle unauthenticated users
	if (!isAuthenticated) {
		// Only show toast for role-related errors, not general auth errors
		// (since apiClient and auth context handle those)
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Handle users without required role
	if (!hasRequiredRole) {
		toast.error(`You need ${requiredRole} permissions to access this page`);
		return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
	}

	return <>{children}</>;
}
