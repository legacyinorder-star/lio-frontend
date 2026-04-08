import { useConsent } from "@/context/ConsentContext";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export function CookiePreferencesModal() {
	const {
		preferencesModalOpen,
		closeCookiePreferences,
		preferences,
		savePreferences,
		acceptAll,
		rejectNonEssential,
	} = useConsent();

	const [analytics, setAnalytics] = useState(false);
	const [functional, setFunctional] = useState(false);
	const [marketing, setMarketing] = useState(false);

	useEffect(() => {
		if (!preferencesModalOpen) return;
		const base = preferences;
		setAnalytics(base?.analytics ?? false);
		setFunctional(base?.functional ?? false);
		setMarketing(base?.marketing ?? false);
	}, [preferencesModalOpen, preferences]);

	const handleSave = () => {
		savePreferences({ analytics, functional, marketing });
		closeCookiePreferences();
	};

	return (
		<Dialog
			open={preferencesModalOpen}
			onOpenChange={(open) => {
				if (!open) closeCookiePreferences();
			}}
		>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Cookie preferences</DialogTitle>
					<DialogDescription className="text-left">
						We use cookies and similar technologies as described in our{" "}
						<Link
							to="/privacy-policy"
							className="underline text-[#173C37]"
							onClick={() => closeCookiePreferences()}
						>
							Privacy Policy
						</Link>
						. Choose which non-essential categories you allow.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-2">
					<div className="rounded-md border border-gray-200 p-4 bg-gray-50/80">
						<p className="font-medium text-[#173C37]">Strictly necessary</p>
						<p className="text-sm text-muted-foreground mt-1">
							Required for the site to work (e.g. security, load balancing).
							Always active.
						</p>
					</div>

					<div className="flex items-start gap-3">
						<Checkbox
							id="consent-analytics"
							checked={analytics}
							onCheckedChange={(v) => setAnalytics(v === true)}
							className="mt-1"
						/>
						<div className="flex-1 space-y-1">
							<Label htmlFor="consent-analytics" className="cursor-pointer">
								Performance / analytics
							</Label>
							<p className="text-sm text-muted-foreground">
								Helps us measure how the site is used (e.g. Google Analytics,
								Microsoft Clarity if enabled).
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Checkbox
							id="consent-functional"
							checked={functional}
							onCheckedChange={(v) => setFunctional(v === true)}
							className="mt-1"
						/>
						<div className="flex-1 space-y-1">
							<Label htmlFor="consent-functional" className="cursor-pointer">
								Functionality
							</Label>
							<p className="text-sm text-muted-foreground">
								Support chat and similar features (e.g. Tawk.to).
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Checkbox
							id="consent-marketing"
							checked={marketing}
							onCheckedChange={(v) => setMarketing(v === true)}
							className="mt-1"
						/>
						<div className="flex-1 space-y-1">
							<Label htmlFor="consent-marketing" className="cursor-pointer">
								Marketing / targeting
							</Label>
							<p className="text-sm text-muted-foreground">
								Advertising and campaign measurement. We do not enable this
								category unless you opt in.
							</p>
						</div>
					</div>
				</div>

				<DialogFooter className="flex flex-col gap-2 sm:flex-col">
					<div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between sm:items-center w-full">
						<Button
							type="button"
							variant="outline"
							className="w-full sm:w-auto"
							onClick={() => {
								rejectNonEssential();
								closeCookiePreferences();
							}}
						>
							Reject non-essential
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full sm:w-auto"
							onClick={() => {
								acceptAll();
								closeCookiePreferences();
							}}
						>
							Accept all
						</Button>
					</div>
					<Button
						type="button"
						className="w-full bg-[#173C37] hover:bg-[#173C37]/90 text-white"
						onClick={handleSave}
					>
						Save preferences
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
