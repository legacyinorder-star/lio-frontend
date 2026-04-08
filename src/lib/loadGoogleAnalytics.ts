import { gaMeasurementId } from "@/config/thirdParty";
import { ensureGtagStub, updateGtagConsent } from "@/lib/gtagConsent";

const GA_SCRIPT_FLAG = "__lio_gtag_loaded";

function loadGtagScript(measurementId: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load gtag.js"));
		document.head.appendChild(script);
	});
}

export async function applyGoogleAnalytics(prefs: {
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
}): Promise<void> {
	const id = gaMeasurementId.trim();
	updateGtagConsent(prefs);

	if (!prefs.analytics || !id) {
		return;
	}

	ensureGtagStub();
	if (!(window as unknown as Record<string, boolean>)[GA_SCRIPT_FLAG]) {
		try {
			await loadGtagScript(id);
			(window as unknown as Record<string, boolean>)[GA_SCRIPT_FLAG] = true;
		} catch {
			return;
		}
	}

	window.gtag?.("js", new Date());
	window.gtag?.("config", id);
}
