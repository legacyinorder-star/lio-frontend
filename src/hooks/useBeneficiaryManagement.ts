import { useWillData } from "@/hooks/useWillData";

export type { EnhancedBeneficiary } from "@/hooks/useWillData";

/**
 * @deprecated Use useWillData instead for better coordination and loading states
 * This hook is kept for backward compatibility but delegates to useWillData
 */
export function useBeneficiaryManagement() {
	const {
		allBeneficiaries,
		isLoading,
		isReady,
		refetch,
		addIndividualBeneficiary,
		addCharityBeneficiary,
	} = useWillData();

	return {
		enhancedBeneficiaries: allBeneficiaries,
		setEnhancedBeneficiaries: () => {
			console.warn(
				"setEnhancedBeneficiaries is deprecated. Use useWillData for state management."
			);
		},
		isLoadingBeneficiaries: isLoading,
		fetchBeneficiaries: refetch,
		addIndividualBeneficiary,
		addCharityBeneficiary,
		// Additional properties for compatibility
		isReady,
	};
}
