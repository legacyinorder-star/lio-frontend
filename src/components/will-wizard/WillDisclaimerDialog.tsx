import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilePen } from "lucide-react";

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
						Writing your Will is the first step to getting your Legacy In Order.
						<p className="mt-2">
							Before you begin, here are a few things you should know to use our
							service with confidence:
						</p>
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
										<strong>How our service works</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										We work with qualified lawyers in each supported
										jurisdiction to ensure the documents are legally sound.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>You are in control</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										We guide you step-by-step but you are responsible for making
										sure the details provided are complete and accurate.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>We do not give personalised legal advice</strong>
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
										Your Will only becomes legally binding once it is signed and
										witnessed according to the instructions for your
										jurisdiction.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>Your Will is just for you</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										Each person needs to complete their own Will. You cannot
										create one on behalf of someone else.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
								<div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										<strong>Some situations need extra attention</strong>
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
										<strong>We've got you covered for most situations</strong>
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed mt-1">
										Our platform is designed for standard estate planning needs.
										If you are not sure whether we are right for you, we
										recommend that you get independent legal advice.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Acknowledgment */}
					<div className="space-y-4 border-t pt-0">
						<p className="text-sm text-muted-foreground leading-relaxed">
							By clicking "Agree & Continue", you confirm that you understand
							and accept Legacy in Order's Terms of Service and Privacy Policy.
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
						<FilePen className="mr-2 h-4 w-4" /> Agree & Continue
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
