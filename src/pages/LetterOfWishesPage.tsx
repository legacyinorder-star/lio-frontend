import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import LetterWizard from "@/components/letter-wizard/LetterWizard";

export default function LetterOfWishesPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { step } = useParams();
	const willId = searchParams.get("willId");
	const [isDevelopment] = useState(import.meta.env.DEV);

	useEffect(() => {
		// Check if we have a willId parameter
		if (!willId && !isDevelopment) {
			alert("No will specified for Letter of Wishes");
			navigate("/app/dashboard");
			return;
		}
	}, [willId, navigate, isDevelopment]);

	// If we have a willId or we're in development mode, render the wizard
	if (willId || isDevelopment) {
		// Construct the URL with step parameter if provided
		const url = new URL(window.location.href);
		if (step) {
			url.searchParams.set("step", step);
		}
		// Update the URL without causing a navigation
		window.history.replaceState({}, "", url.toString());

		return <LetterWizard />;
	}

	// Fallback loading state
	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center">
				<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
				<p className="text-muted-foreground">Loading Letter of Wishes...</p>
			</div>
		</div>
	);
}
