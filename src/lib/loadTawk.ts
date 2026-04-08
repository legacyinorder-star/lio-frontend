import { tawkEmbedSrc } from "@/config/thirdParty";

declare global {
	interface Window {
		Tawk_API?: {
			hideWidget?: () => void;
			showWidget?: () => void;
			onLoad?: () => void;
		};
		Tawk_LoadStart?: Date;
	}
}

const TAWK_FLAG = "__lio_tawk_injected";

export function applyTawk(functionalConsent: boolean): void {
	const src = tawkEmbedSrc.trim();

	if (!functionalConsent) {
		try {
			window.Tawk_API?.hideWidget?.();
		} catch {
			/* noop */
		}
		return;
	}

	if (!src) return;
	if ((window as unknown as Record<string, boolean>)[TAWK_FLAG]) {
		try {
			window.Tawk_API?.showWidget?.();
		} catch {
			/* noop */
		}
		return;
	}

	window.Tawk_API = window.Tawk_API ?? {};
	window.Tawk_LoadStart = new Date();
	(function () {
		const s1 = document.createElement("script");
		const s0 = document.getElementsByTagName("script")[0];
		s1.async = true;
		s1.src = src;
		s1.charset = "UTF-8";
		s1.setAttribute("crossorigin", "*");
		s0?.parentNode?.insertBefore(s1, s0);
	})();
	(window as unknown as Record<string, boolean>)[TAWK_FLAG] = true;
}
