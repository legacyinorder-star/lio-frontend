import { clarityProjectId } from "@/config/thirdParty";

const CLARITY_FLAG = "__lio_clarity_loaded";

declare global {
	interface Window {
		clarity?: (...args: unknown[]) => void;
	}
}

export function applyClarity(analyticsConsent: boolean): void {
	const id = clarityProjectId.trim();
	if (!analyticsConsent || !id) {
		return;
	}

	if ((window as unknown as Record<string, boolean>)[CLARITY_FLAG]) {
		return;
	}

	(function (
		c: Window,
		l: Document,
		a: string,
		r: string,
		i: string
	) {
		const w = c as unknown as Record<string, unknown>;
		w[a] =
			w[a] ||
			function (...args: unknown[]) {
				((w[a] as { q?: unknown[] }).q =
					(w[a] as { q?: unknown[] }).q || []).push(args);
			};
		const t = l.createElement(r) as HTMLScriptElement;
		t.async = true;
		t.src = "https://www.clarity.ms/tag/" + i;
		const y = l.getElementsByTagName(r)[0];
		y?.parentNode?.insertBefore(t, y);
	})(window, document, "clarity", "script", id);

	(window as unknown as Record<string, boolean>)[CLARITY_FLAG] = true;
}
