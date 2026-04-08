export type GtagConsentParams = Record<string, "granted" | "denied">;

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

export function ensureGtagStub(): void {
	window.dataLayer = window.dataLayer ?? [];
	if (!window.gtag) {
		window.gtag = function gtag(...args: unknown[]) {
			window.dataLayer?.push(args);
		};
	}
}

/** Must run before loading gtag.js — set once per page load. */
export function setDefaultConsentDenied(): void {
	ensureGtagStub();
	window.gtag?.("consent", "default", {
		ad_storage: "denied",
		ad_user_data: "denied",
		ad_personalization: "denied",
		analytics_storage: "denied",
		functionality_storage: "denied",
		personalization_storage: "denied",
	});
}

export function updateGtagConsent(prefs: {
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
}): void {
	ensureGtagStub();
	window.gtag?.("consent", "update", {
		analytics_storage: prefs.analytics ? "granted" : "denied",
		functionality_storage: prefs.functional ? "granted" : "denied",
		personalization_storage: prefs.functional ? "granted" : "denied",
		ad_storage: prefs.marketing ? "granted" : "denied",
		ad_user_data: prefs.marketing ? "granted" : "denied",
		ad_personalization: prefs.marketing ? "granted" : "denied",
	});
}
