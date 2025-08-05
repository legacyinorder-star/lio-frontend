import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	useCallback,
} from "react";
import { useWill } from "@/context/WillContext";
import { useRelationships } from "@/hooks/useRelationships";
import { useAuth } from "@/hooks/useAuth";

interface LoadingStates {
	relationships: boolean;
	beneficiaries: boolean;
	assets: boolean;
	gifts: boolean;
	residuary: boolean;
	executors: boolean;
	witnesses: boolean;
}

interface DataLoadingContextType {
	loadingStates: LoadingStates;
	isDataReady: boolean;
	allDataLoaded: boolean;
	updateLoadingState: (key: keyof LoadingStates, isLoading: boolean) => void;
	resetLoadingStates: () => void;
}

const DataLoadingContext = createContext<DataLoadingContextType>({
	loadingStates: {
		relationships: true,
		beneficiaries: false,
		assets: false,
		gifts: false,
		residuary: false,
		executors: false,
		witnesses: false,
	},
	isDataReady: false,
	allDataLoaded: false,
	updateLoadingState: () => {},
	resetLoadingStates: () => {},
});

export const DataLoadingProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [loadingStates, setLoadingStates] = useState<LoadingStates>({
		relationships: true,
		beneficiaries: false,
		assets: false,
		gifts: false,
		residuary: false,
		executors: false,
		witnesses: false,
	});

	const { activeWill } = useWill();
	const { isLoading: isLoadingRelationships, relationships } =
		useRelationships();
	const { user } = useAuth();

	// Update relationships loading state based on the relationships hook
	useEffect(() => {
		setLoadingStates((prev) => ({
			...prev,
			relationships: Boolean(isLoadingRelationships),
		}));
	}, [isLoadingRelationships]);

	// Calculate if basic dependencies are ready (relationships + activeWill)
	const isDataReady = useMemo(() => {
		return Boolean(
			!loadingStates.relationships && relationships.length > 0 && activeWill?.id
		);
	}, [loadingStates.relationships, relationships.length, activeWill?.id]);

	// Calculate if all data is loaded
	const allDataLoaded = useMemo(() => {
		return Boolean(Object.values(loadingStates).every((state) => !state));
	}, [loadingStates]);

	// Function to update individual loading states
	const updateLoadingState = useCallback(
		(key: keyof LoadingStates, isLoading: boolean) => {
			setLoadingStates((prev) => ({
				...prev,
				[key]: isLoading,
			}));
		},
		[]
	);

	// Function to reset all loading states (useful when will changes)
	const resetLoadingStates = useCallback(() => {
		setLoadingStates({
			relationships: Boolean(isLoadingRelationships),
			beneficiaries: false,
			assets: false,
			gifts: false,
			residuary: false,
			executors: false,
			witnesses: false,
		});
	}, [isLoadingRelationships]);

	// Reset loading states when will changes
	useEffect(() => {
		if (activeWill?.id) {
			resetLoadingStates();
		}
	}, [activeWill?.id, resetLoadingStates]);

	// Reset all loading states when user logs out
	useEffect(() => {
		if (!user) {
			resetLoadingStates();
		}
	}, [user]);

	// Debug logging (memoized to prevent excessive logging)
	const debugInfo = useMemo(
		() => ({
			loadingStates,
			isDataReady,
			allDataLoaded,
			relationshipsCount: relationships.length,
			activeWillId: activeWill?.id,
		}),
		[
			loadingStates,
			isDataReady,
			allDataLoaded,
			relationships.length,
			activeWill?.id,
		]
	);

	useEffect(() => {
		console.log("DataLoading states:", debugInfo);
	}, [debugInfo]);

	return (
		<DataLoadingContext.Provider
			value={{
				loadingStates,
				isDataReady,
				allDataLoaded,
				updateLoadingState,
				resetLoadingStates,
			}}
		>
			{children}
		</DataLoadingContext.Provider>
	);
};

export const useDataLoading = () => {
	const context = useContext(DataLoadingContext);
	if (!context) {
		throw new Error("useDataLoading must be used within a DataLoadingProvider");
	}
	return context;
};
