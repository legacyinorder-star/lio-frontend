import { useState, useEffect, useCallback } from "react";
import { useWill } from "@/context/WillContext";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";

interface DisclaimerState {
	isAccepted: boolean;
	isLoading: boolean;
	error: string | null;
	hasShown: boolean;
}

const DISCLAIMER_STORAGE_KEY = "legacy_in_order_disclaimer_accepted";
const DISCLAIMER_DATE_KEY = "legacy_in_order_disclaimer_date";

export function useDisclaimer() {
	const { activeWill, setActiveWill } = useWill();
	const [state, setState] = useState<DisclaimerState>({
		isAccepted: false,
		isLoading: false,
		error: null,
		hasShown: false,
	});

	// Check if disclaimer has been accepted (from localStorage or will data)
	const checkDisclaimerStatus = useCallback(() => {
		// First check localStorage for temporary acceptance
		const localAccepted = localStorage.getItem(DISCLAIMER_STORAGE_KEY);

		// Then check will data
		const willAccepted = activeWill?.agreed_disclaimer === true;

		// Consider accepted if either source says yes
		const isAccepted = !!(localAccepted === "true" || willAccepted);

		setState((prev) => ({
			...prev,
			isAccepted,
			hasShown: isAccepted, // If already accepted, don't show again
		}));

		return isAccepted;
	}, [activeWill?.agreed_disclaimer]);

	// Accept disclaimer and save to appropriate location
	const acceptDisclaimer = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const acceptanceDate = new Date().toISOString();

			// Always save to localStorage as backup
			localStorage.setItem(DISCLAIMER_STORAGE_KEY, "true");
			localStorage.setItem(DISCLAIMER_DATE_KEY, acceptanceDate);

			// If we have an active will, also save to backend
			if (activeWill?.id) {
				const { error } = await apiClient(
					`/wills/${activeWill.id}/accept-disclaimer`,
					{
						method: "POST",
						body: JSON.stringify({
							agreed_disclaimer: true,
							agreed_disclaimer_date: acceptanceDate,
						}),
					}
				);

				if (error) {
					console.warn("Failed to save disclaimer to backend:", error);
					// Don't fail the whole operation - localStorage is sufficient
				} else {
					// Update will context with backend confirmation
					if (setActiveWill) {
						setActiveWill({
							...activeWill,
							agreed_disclaimer: true,
							agreed_disclaimer_date: acceptanceDate,
						});
					}
				}
			}

			setState((prev) => ({
				...prev,
				isAccepted: true,
				isLoading: false,
				hasShown: true,
			}));

			toast.success(
				"Disclaimer accepted. You can now proceed with creating your will."
			);
			return true;
		} catch (error) {
			console.error("Error accepting disclaimer:", error);
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: "Failed to save disclaimer acceptance. Please try again.",
			}));
			toast.error("Failed to save disclaimer acceptance. Please try again.");
			return false;
		}
	}, [activeWill, setActiveWill]);

	// Decline disclaimer
	const declineDisclaimer = useCallback(() => {
		setState((prev) => ({
			...prev,
			isAccepted: false,
			hasShown: true,
		}));
		toast.info("Will creation cancelled. You can start again anytime.");
		return false;
	}, []);

	// Show disclaimer (for new users or when needed)
	const showDisclaimer = useCallback(() => {
		setState((prev) => ({
			...prev,
			hasShown: false,
		}));
	}, []);

	// Clear disclaimer acceptance (for testing or admin purposes)
	const clearDisclaimer = useCallback(() => {
		localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
		localStorage.removeItem(DISCLAIMER_DATE_KEY);
		setState((prev) => ({
			...prev,
			isAccepted: false,
			hasShown: false,
		}));
	}, []);

	// Check status when activeWill changes
	useEffect(() => {
		checkDisclaimerStatus();
	}, [checkDisclaimerStatus]);

	// Determine if disclaimer should be shown
	const shouldShowDisclaimer = !state.hasShown && !state.isAccepted;

	return {
		// State
		isAccepted: state.isAccepted,
		isLoading: state.isLoading,
		error: state.error,
		shouldShowDisclaimer,
		hasShown: state.hasShown,

		// Actions
		acceptDisclaimer,
		declineDisclaimer,
		showDisclaimer,
		clearDisclaimer,
		checkDisclaimerStatus,

		// Computed
		canProceed: state.isAccepted,
	};
}
