import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { STRIPE_CONFIG } from "@/config/stripe";

export default function StripeCheckoutPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [isRedirecting, setIsRedirecting] = useState(false);

	const willId = searchParams.get("willId");
	const source = searchParams.get("source");
	const description =
		searchParams.get("description") || "Will Creation Service";

	// Determine price ID based on source
	const isLetterOfWishes = source === "letter-of-wishes";
	const priceId = isLetterOfWishes
		? STRIPE_CONFIG.letterOfWishesPriceId
		: STRIPE_CONFIG.willPriceId;

	useEffect(() => {
		if (!willId) {
			toast.error("Invalid payment request. Missing will ID.");
			navigate("/app/dashboard");
			return;
		}

		redirectToStripeCheckout();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [willId, navigate]);

	const redirectToStripeCheckout = async () => {
		try {
			setIsLoading(true);
			setIsRedirecting(true);

			// Determine success and cancel URLs based on source
			const successUrl = isLetterOfWishes
				? `${window.location.origin}/app/payment/letter-success?willId=${willId}`
				: `${window.location.origin}/app/payment/success?willId=${willId}`;

			const cancelUrl = isLetterOfWishes
				? `${window.location.origin}/app/payment/letter-cancel?willId=${willId}`
				: `${window.location.origin}/app/payment/cancel?willId=${willId}`;

			await PaymentService.createCheckoutSessionAndRedirect({
				willId: willId!,
				priceId: priceId,
				currency: STRIPE_CONFIG.currency,
				description,
				successUrl,
				cancelUrl,
			});
		} catch (error) {
			console.error("Error redirecting to Stripe Checkout:", error);
			toast.error("Failed to initialize payment. Please try again.");
			setIsRedirecting(false);
			setIsLoading(false);
		}
	};

	const handleManualRedirect = () => {
		redirectToStripeCheckout();
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="flex items-center justify-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin" />
							Preparing Payment
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<p className="text-gray-600">
							{isRedirecting
								? "Redirecting to secure payment page..."
								: "Setting up your payment..."}
						</p>
						{!isRedirecting && (
							<Button
								onClick={handleManualRedirect}
								className="w-full"
								disabled={isLoading}
							>
								<CreditCard className="mr-2 h-4 w-4" />
								Continue to Payment
							</Button>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	return null;
}
