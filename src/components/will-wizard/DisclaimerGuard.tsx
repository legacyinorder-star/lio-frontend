import { ReactNode } from "react";
import { useDisclaimer } from "@/hooks/useDisclaimer";
import WillDisclaimerDialog from "./WillDisclaimerDialog";
import { useNavigate } from "react-router-dom";

interface DisclaimerGuardProps {
	children: ReactNode;
	fallbackPath?: string;
}

export default function DisclaimerGuard({
	children,
	fallbackPath = "/app/dashboard",
}: DisclaimerGuardProps) {
	const navigate = useNavigate();
	const {
		shouldShowDisclaimer,
		canProceed,
		isLoading,
		error,
		acceptDisclaimer,
		declineDisclaimer,
	} = useDisclaimer();

	const handleAccept = async () => {
		const success = await acceptDisclaimer();
		if (success) {
			// Disclaimer accepted successfully
		}
	};

	const handleDecline = () => {
		declineDisclaimer();
		navigate(fallbackPath);
	};

	// Show disclaimer if needed
	if (shouldShowDisclaimer) {
		return (
			<WillDisclaimerDialog
				open={true}
				onAccept={handleAccept}
				onDecline={handleDecline}
			/>
		);
	}

	// Show error state if there was an error
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
					<h3 className="text-lg font-medium text-red-800 mb-2">
						Disclaimer Error
					</h3>
					<p className="text-sm text-red-700 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	// Show loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="max-w-md mx-auto p-6">
					<div className="flex items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary mr-3" />
						<span className="text-lg">Processing disclaimer...</span>
					</div>
				</div>
			</div>
		);
	}

	// If disclaimer is accepted, show children
	if (canProceed) {
		return <>{children}</>;
	}

	// Fallback - should not reach here normally
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="max-w-md mx-auto p-6">
				<p className="text-center text-gray-600">
					Please accept the disclaimer to continue.
				</p>
			</div>
		</div>
	);
}
