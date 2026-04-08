import { useConsent } from "@/context/ConsentContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CookieBanner() {
	const { hasAnswered, openCookiePreferences, acceptAll, rejectNonEssential } =
		useConsent();

	if (hasAnswered) return null;

	return (
		<div
			role="dialog"
			aria-labelledby="cookie-banner-title"
			aria-describedby="cookie-banner-desc"
			className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-[#FAFAF5] shadow-lg px-4 py-4 md:px-6 md:py-5"
		>
			<div className="mx-auto max-w-4xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex-1 space-y-2 text-sm text-[#173C37]">
					<p id="cookie-banner-title" className="font-semibold">
						Cookies and your privacy
					</p>
					<p id="cookie-banner-desc">
						We use strictly necessary cookies to run this site and, with your
						permission, optional analytics and functionality cookies. Read our{" "}
						<Link to="/privacy-policy" className="underline font-medium">
							Privacy Policy
						</Link>{" "}
						for details.
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto border-[#173C37] text-[#173C37]"
						onClick={rejectNonEssential}
					>
						Reject non-essential
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto border-[#173C37] text-[#173C37]"
						onClick={openCookiePreferences}
					>
						Manage preferences
					</Button>
					<Button
						type="button"
						className="w-full sm:w-auto bg-[#173C37] hover:bg-[#173C37]/90 text-white"
						onClick={acceptAll}
					>
						Accept all
					</Button>
				</div>
			</div>
		</div>
	);
}
