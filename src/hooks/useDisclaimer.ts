import { useState, useEffect, useCallback } from "react";
import { useWill } from "@/context/WillContext";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";

interface DisclaimerState {
	isAccepted: boolean;
	isLoading: boolean;
	error: string | null;
	hasShown: boolean;
}

// ✅ FIXED: Make storage keys user-specific
const getDisclaimerStorageKey = (userId: string) =>
	`legacy_in_order_disclaimer_accepted_${userId}`;
const getDisclaimerDateKey = (userId: string) =>
	`legacy_in_order_disclaimer_date_${userId}`;

export function useDisclaimer() {
	const { activeWill, setActiveWill } = useWill();
	const { user } = useAuth();
	const [state, setState] = useState<DisclaimerState>({
		isAccepted: false,
		isLoading: false,
		error: null,
		hasShown: false,
	});

	// Check if disclaimer has been accepted (from localStorage or will data)
	const checkDisclaimerStatus = useCallback(() => {
		// ✅ FIXED: Only check localStorage if user is authenticated
		if (!user?.id) {
			setState((prev) => ({
				...prev,
				isAccepted: false,
				hasShown: false,
			}));
			return false;
		}

		// ✅ FIXED: Use user-specific storage keys
		const userStorageKey = getDisclaimerStorageKey(user.id);
		const localAccepted = localStorage.getItem(userStorageKey);

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
	}, [activeWill?.agreed_disclaimer, user?.id]);

	// Accept disclaimer and save to appropriate location
	const acceptDisclaimer = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const acceptanceDate = new Date().toISOString();

			// ✅ FIXED: Only save to localStorage if user is authenticated
			if (user?.id) {
				const userStorageKey = getDisclaimerStorageKey(user.id);
				const userDateKey = getDisclaimerDateKey(user.id);

				// Always save to localStorage as backup
				localStorage.setItem(userStorageKey, "true");
				localStorage.setItem(userDateKey, acceptanceDate);
			}

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
	}, [activeWill, setActiveWill, user?.id]);

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
		// ✅ FIXED: Only clear user-specific storage if user is authenticated
		if (user?.id) {
			const userStorageKey = getDisclaimerStorageKey(user.id);
			const userDateKey = getDisclaimerDateKey(user.id);

			localStorage.removeItem(userStorageKey);
			localStorage.removeItem(userDateKey);
		}

		setState((prev) => ({
			...prev,
			isAccepted: false,
			hasShown: false,
		}));
	}, [user?.id]);

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
