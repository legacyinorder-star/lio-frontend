export const CONSENT_STORAGE_KEY = "lio_cookie_consent_v1";

/** Bump when vendors or cookie categories change (may prompt users again). */
export const CONSENT_POLICY_VERSION = 1;

export interface StoredConsentPreferences {
	version: number;
	updatedAt: string;
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
}

export const defaultDeniedPreferences = (): Omit<
	StoredConsentPreferences,
	"version" | "updatedAt"
> => ({
	analytics: false,
	functional: false,
	marketing: false,
});

export const defaultAcceptedPreferences = (): Omit<
	StoredConsentPreferences,
	"version" | "updatedAt"
> => ({
	analytics: true,
	functional: true,
	marketing: true,
});
