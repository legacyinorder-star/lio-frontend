import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	defaultAcceptedPreferences,
	defaultDeniedPreferences,
	type StoredConsentPreferences,
} from "@/config/consent";
import { readStoredConsent, writeStoredConsent } from "@/lib/consentStorage";
import { setDefaultConsentDenied } from "@/lib/gtagConsent";
import { applyGoogleAnalytics } from "@/lib/loadGoogleAnalytics";
import { applyTawk } from "@/lib/loadTawk";
import { applyClarity } from "@/lib/loadClarity";

type ConsentContextValue = {
	hasAnswered: boolean;
	preferences: StoredConsentPreferences | null;
	preferencesModalOpen: boolean;
	openCookiePreferences: () => void;
	closeCookiePreferences: () => void;
	acceptAll: () => void;
	rejectNonEssential: () => void;
	savePreferences: (
		prefs: Pick<
			StoredConsentPreferences,
			"analytics" | "functional" | "marketing"
		>
	) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

async function applyThirdPartyTags(
	prefs: Pick<
		StoredConsentPreferences,
		"analytics" | "functional" | "marketing"
	>
) {
	await applyGoogleAnalytics(prefs);
	applyTawk(prefs.functional);
	applyClarity(prefs.analytics);
}

export function ConsentProvider({ children }: { children: ReactNode }) {
	const [hasAnswered, setHasAnswered] = useState(false);
	const [preferences, setPreferences] =
		useState<StoredConsentPreferences | null>(null);
	const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setDefaultConsentDenied();
		const stored = readStoredConsent();
		if (stored) {
			setPreferences(stored);
			setHasAnswered(true);
			void applyThirdPartyTags(stored);
		}
		setHydrated(true);
	}, []);

	const persistAndApply = useCallback(
		(
			prefs: Pick<
				StoredConsentPreferences,
				"analytics" | "functional" | "marketing"
			>
		) => {
			const full = writeStoredConsent(prefs);
			setPreferences(full);
			setHasAnswered(true);
			void applyThirdPartyTags(prefs);
		},
		[]
	);

	const acceptAll = useCallback(() => {
		persistAndApply(defaultAcceptedPreferences());
	}, [persistAndApply]);

	const rejectNonEssential = useCallback(() => {
		persistAndApply(defaultDeniedPreferences());
	}, [persistAndApply]);

	const savePreferences = useCallback(
		(
			prefs: Pick<
				StoredConsentPreferences,
				"analytics" | "functional" | "marketing"
			>
		) => {
			persistAndApply(prefs);
		},
		[persistAndApply]
	);

	const openCookiePreferences = useCallback(() => {
		setPreferencesModalOpen(true);
	}, []);

	const closeCookiePreferences = useCallback(() => {
		setPreferencesModalOpen(false);
	}, []);

	const value = useMemo(
		() => ({
			hasAnswered: hydrated && hasAnswered,
			preferences,
			preferencesModalOpen,
			openCookiePreferences,
			closeCookiePreferences,
			acceptAll,
			rejectNonEssential,
			savePreferences,
		}),
		[
			hydrated,
			hasAnswered,
			preferences,
			preferencesModalOpen,
			openCookiePreferences,
			closeCookiePreferences,
			acceptAll,
			rejectNonEssential,
			savePreferences,
		]
	);

	/* Until hydrated, avoid flashing banner — treat as unanswered only after read */
	const displayValue = useMemo(() => {
		if (!hydrated) {
			return {
				...value,
				hasAnswered: true,
			};
		}
		return value;
	}, [hydrated, value]);

	return (
		<ConsentContext.Provider value={displayValue}>
			{children}
		</ConsentContext.Provider>
	);
}

export function useConsent(): ConsentContextValue {
	const ctx = useContext(ConsentContext);
	if (!ctx) {
		throw new Error("useConsent must be used within ConsentProvider");
	}
	return ctx;
}
