import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

interface PublicRouteProps {
	children: ReactNode;
	redirectTo?: string;
	showLoadingCard?: boolean;
}

export default function PublicRoute({
	children,
	redirectTo,
	showLoadingCard = false,
}: PublicRouteProps) {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	// Show loading state while auth is initializing
	if (isLoading) {
		if (!showLoadingCard) {
			return (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading...</p>
					</div>
				</div>
			);
		}

		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-md mx-auto">
					<CardContent className="p-8">
						<div className="flex flex-col items-center gap-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							<div className="text-center">
								<h3 className="font-semibold text-lg mb-2">Loading</h3>
								<p className="text-muted-foreground">
									Please wait while we check your authentication status...
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// If user is authenticated, handle redirects based on the page
	if (user) {
		// Pages that authenticated users should be redirected away from
		const authPages = [
			"/login",
			"/signup",
			"/verify-otp",
			"/request-password-reset",
			"/reset-password",
		];

		// Check if current page is an auth page
		const isAuthPage = authPages.some((page) =>
			location.pathname.startsWith(page)
		);

		if (isAuthPage) {
			// Determine redirect destination
			let destination = redirectTo;

			if (!destination) {
				// Default redirect based on user role
				destination =
					user.role === "admin" ? "/admin/dashboard" : "/app/dashboard";
			}

			// Don't redirect if they're already at the destination
			if (location.pathname === destination) {
				return <>{children}</>;
			}

			return <Navigate to={destination} replace />;
		}

		// For non-auth pages (like homepage, pricing), allow authenticated users to access them
		return <>{children}</>;
	}

	// User is not authenticated, show the public page
	return <>{children}</>;
}
