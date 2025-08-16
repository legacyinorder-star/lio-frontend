import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WillDisclaimerDialogProps {
	open: boolean;
	onAccept: () => void;
	onDecline: () => void;
}

export default function WillDisclaimerDialog({
	open,
	onAccept,
	onDecline,
}: WillDisclaimerDialogProps) {
	const handleAccept = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onAccept();
	};

	const handleDecline = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onDecline();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onDecline();
				}
			}}
		>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-8">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl pb-2">
						{/* <Scale className="h-6 w-6 text-primary" /> */}A Quick Note
						Before You Start Your Will
					</DialogTitle>
					<DialogDescription>
						We're here to make getting your Legacy in Order simple, clear, and
						stress-free. Before you begin, here are a few things to know so you
						can use our service with confidence:
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 pt-2">
					{/* Main Content */}
					<div className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>How our templates work</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										We work with qualified lawyers in each supported
										jurisdiction to prepare our legal document templates.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>You're in the driver's seat</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										We guide you step-by-step but You are responsible for making
										sure the details you provide are complete and accurate.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>We don't give personal legal advice</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										Legacy in Order is not a law firm, and does offer tailored
										legal, tax, or financial advice.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>Signing makes it official</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										Your will only become legally binding once it is signed and
										witnessed according to the instructions for your
										jurisdiction.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>Your will is just for you</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										Each person needs to complete their own will. You cannot
										create one on behalf of someone else.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>Some situations need extra care</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										If your circumstances are more complex, you may wish to
										speak with a lawyer. This can include:
									</p>
									<ul className="text-sm text-muted-foreground ml-6 mt-2 space-y-1">
										<li>• Blended or complex families</li>
										<li>• Assets in multiple countries</li>
										<li>
											• Business ownership, trusts, or advanced tax planning
										</li>
										<li>• Caring for a dependant with disabilities</li>
										<li>• Removing a spouse or dependant from your will</li>
									</ul>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>We've got you covered — for most situations</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										Our platform is designed for standard estate planning needs.
										If you're not sure whether we're right for you, we recommend
										getting independent legal advice.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Acknowledgment */}
					<div className="space-y-4 border-t pt-0">
						<p className="text-sm text-muted-foreground leading-relaxed">
							By clicking "Agree & Continue", you confirm you understand and
							accept Legacy in Order's Terms of Service and Privacy Policy.
						</p>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={handleDecline}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleAccept}
						className="bg-primary hover:bg-primary/90 text-white"
					>
						Agree & Continue
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
