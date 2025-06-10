import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { STRIPE_CONFIG } from "@/config/stripe";
import PaymentForm from "@/components/payment/PaymentForm";

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

interface PaymentIntent {
	id: string;
	status: string;
	amount: number;
	currency: string;
}

export default function PaymentPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [clientSecret, setClientSecret] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [paymentCompleted, setPaymentCompleted] = useState(false);
	const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(
		null
	);

	const willId = searchParams.get("willId");
	const amount = parseFloat(
		searchParams.get("amount") || STRIPE_CONFIG.willPrice.toString()
	);
	const description =
		searchParams.get("description") || "Will Creation Service";

	useEffect(() => {
		if (!willId) {
			toast.error("Invalid payment request. Missing will ID.");
			navigate("/app/dashboard");
			return;
		}

		createPaymentIntent();
	}, [willId, navigate]);

	const createPaymentIntent = async () => {
		try {
			setIsLoading(true);

			const { data, error } = await apiClient<{ clientSecret: string }>(
				"/payments/create-payment-intent",
				{
					method: "POST",
					body: JSON.stringify({
						willId,
						amount: Math.round(amount * 100), // Convert to cents
						currency: STRIPE_CONFIG.currency,
						description,
					}),
				}
			);

			if (error) {
				console.error("Error creating payment intent:", error);
				toast.error("Failed to initialize payment. Please try again.");
				navigate("/app/dashboard");
				return;
			}

			if (data?.clientSecret) {
				setClientSecret(data.clientSecret);
			} else {
				toast.error("Invalid payment response from server.");
				navigate("/app/dashboard");
			}
		} catch (error) {
			console.error("Error creating payment intent:", error);
			toast.error("Failed to initialize payment. Please try again.");
			navigate("/app/dashboard");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePaymentSuccess = async (paymentIntent: {
		id: string;
		status: string;
	}) => {
		try {
			// Update will status to paid
			const { error } = await apiClient(`/wills/${willId}/payment-success`, {
				method: "POST",
				body: JSON.stringify({
					paymentIntentId: paymentIntent.id,
					amount: Math.round(amount * 100),
				}),
			});

			if (error) {
				console.error("Error updating will payment status:", error);
				toast.error(
					"Payment successful but failed to update will status. Please contact support."
				);
			} else {
				setPaymentCompleted(true);
				setPaymentIntent({
					id: paymentIntent.id,
					status: paymentIntent.status,
					amount,
					currency: STRIPE_CONFIG.currency,
				});
			}
		} catch (error) {
			console.error("Error handling payment success:", error);
			toast.error(
				"Payment successful but failed to update will status. Please contact support."
			);
		}
	};

	const handlePaymentCancel = () => {
		navigate("/app/dashboard");
	};

	const handleContinueToWill = () => {
		navigate("/app/create-will");
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="max-w-md mx-auto">
					<CardContent className="p-8">
						<div className="flex flex-col items-center gap-4">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-muted-foreground">Initializing payment...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (paymentCompleted && paymentIntent) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="max-w-md mx-auto">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-green-600">
							<CheckCircle className="h-5 w-5" />
							Payment Successful!
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-green-50 p-4 rounded-lg">
							<p className="text-sm text-green-800">
								Your payment of{" "}
								{new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: "USD",
								}).format(paymentIntent.amount)}{" "}
								has been processed successfully.
							</p>
							<p className="text-xs text-green-600 mt-2">
								Payment ID: {paymentIntent.id}
							</p>
						</div>
						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={handlePaymentCancel}
								className="flex-1"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Dashboard
							</Button>
							<Button
								onClick={handleContinueToWill}
								className="flex-1 bg-light-green hover:bg-light-green/90 text-black"
							>
								Continue to Will
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			{clientSecret && (
				<Elements stripe={stripePromise} options={{ clientSecret }}>
					<PaymentForm
						onSuccess={handlePaymentSuccess}
						onCancel={handlePaymentCancel}
						amount={amount}
						description={description}
					/>
				</Elements>
			)}
		</div>
	);
}
