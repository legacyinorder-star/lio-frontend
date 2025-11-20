import { apiClient } from "@/utils/apiClient";

const GOOGLE_OAUTH_BASE_URL =
	"https://xx4z-bjeb-pp4s.e2.xano.io/api:U0aE1wpF:local";

const POPUP_MESSAGE_TYPE = "google-oauth";
const POPUP_NAME = "google-oauth-popup";
const POPUP_FEATURES =
	"width=500,height=640,menubar=no,toolbar=no,resizable=yes";
const POPUP_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
const POPUP_POLL_INTERVAL_MS = 500;

export const getGoogleRedirectUri = () => {
	if (typeof window === "undefined") {
		return process.env.VITE_GOOGLE_REDIRECT_URI || "";
	}

	const redirectUri =
		import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
		`${window.location.origin}/auth/callback/google`;

	// Normalize: remove trailing slash if present, ensure consistent format
	return redirectUri.replace(/\/$/, "");
};

const buildAuthUrl = (authUrl: string, redirectUri: string) => {
	if (!authUrl) {
		throw new Error("Missing Google authorization URL");
	}

	try {
		const url = new URL(authUrl);
		const currentRedirect = url.searchParams.get("redirect_uri");
		if (!currentRedirect) {
			url.searchParams.set("redirect_uri", redirectUri);
		}
		return url.toString();
	} catch (error) {
		// Fallback to original string if URL parsing fails
		const separator = authUrl.includes("?") ? "&" : "?";
		return `${authUrl}${separator}redirect_uri=${encodeURIComponent(
			redirectUri
		)}`;
	}
};

interface GooglePopupResult {
	token: string;
	name?: string;
	email?: string;
}

export const startGoogleOAuthPopup = async (): Promise<GooglePopupResult> => {
	if (typeof window === "undefined") {
		throw new Error("Google sign-in is only available in the browser");
	}

	const redirectUri = getGoogleRedirectUri();
	console.log("Initiating Google OAuth with redirect_uri:", redirectUri);

	const initResponse = await apiClient<{ authUrl?: string }>(
		`/oauth/google/init?redirect_uri=${encodeURIComponent(redirectUri)}`,
		{
			authenticated: false,
			baseUrlOverride: GOOGLE_OAUTH_BASE_URL,
			method: "GET",
		}
	);

	if (initResponse.error || !initResponse.data?.authUrl) {
		throw new Error(initResponse.error || "Failed to initiate Google sign-in");
	}

	const { authUrl } = initResponse.data;
	const popupUrl = buildAuthUrl(authUrl || "", redirectUri);

	const popup = window.open(popupUrl, POPUP_NAME, POPUP_FEATURES);

	if (!popup) {
		throw new Error(
			"Unable to open Google sign-in window. Please allow popups and try again."
		);
	}

	return new Promise<GooglePopupResult>((resolve, reject) => {
		let timeoutId: number | null = null;
		let pollInterval: number | null = null;

		const cleanup = () => {
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
			if (pollInterval) {
				window.clearInterval(pollInterval);
			}
			window.removeEventListener("message", handleMessage);
			try {
				if (popup && !popup.closed) {
					popup.close();
				}
			} catch (error) {
				// Ignore cross-origin errors when closing the popup
				console.debug("popup close ignored:", error);
			}
		};

		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== window.location.origin) return;
			if (!event.data || event.data.type !== POPUP_MESSAGE_TYPE) return;

			const { token, name, email, error } = event.data;
			if (error) {
				cleanup();
				console.error("Google sign-in failed:", error);
				reject(new Error(error));
				return;
			}

			if (!token) {
				cleanup();
				reject(new Error("Google sign-in failed: missing token"));
				return;
			}

			cleanup();
			resolve({ token, name, email });
		};

		window.addEventListener("message", handleMessage);

		timeoutId = window.setTimeout(() => {
			cleanup();
			reject(new Error("Google sign-in timed out. Please try again."));
		}, POPUP_TIMEOUT_MS);

		pollInterval = window.setInterval(() => {
			if (popup.closed) {
				cleanup();
				reject(
					new Error("Google sign-in window was closed before completion.")
				);
			}
		}, POPUP_POLL_INTERVAL_MS);
	});
};

export { POPUP_MESSAGE_TYPE, GOOGLE_OAUTH_BASE_URL };
