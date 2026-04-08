import {
	CONSENT_POLICY_VERSION,
	CONSENT_STORAGE_KEY,
	type StoredConsentPreferences,
} from "@/config/consent";

function isStoredConsentShape(value: unknown): value is StoredConsentPreferences {
	if (!value || typeof value !== "object") return false;
	const o = value as Record<string, unknown>;
	return (
		typeof o.version === "number" &&
		typeof o.updatedAt === "string" &&
		typeof o.analytics === "boolean" &&
		typeof o.functional === "boolean" &&
		typeof o.marketing === "boolean"
	);
}

export function readStoredConsent(): StoredConsentPreferences | null {
	try {
		const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (!isStoredConsentShape(parsed)) {
			localStorage.removeItem(CONSENT_STORAGE_KEY);
			return null;
		}
		if (parsed.version !== CONSENT_POLICY_VERSION) {
			localStorage.removeItem(CONSENT_STORAGE_KEY);
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

export function writeStoredConsent(
	preferences: Omit<StoredConsentPreferences, "version" | "updatedAt"> &
		Partial<Pick<StoredConsentPreferences, "version" | "updatedAt">>
): StoredConsentPreferences {
	const full: StoredConsentPreferences = {
		version: CONSENT_POLICY_VERSION,
		updatedAt: preferences.updatedAt ?? new Date().toISOString(),
		analytics: preferences.analytics,
		functional: preferences.functional,
		marketing: preferences.marketing,
	};
	localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(full));
	return full;
}

export function clearStoredConsent(): void {
	localStorage.removeItem(CONSENT_STORAGE_KEY);
}
