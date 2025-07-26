import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
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
	const source = searchParams.get("source");

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

			// TEMPORARY: Mock payment intent creation for testing
			// Remove this when the backend endpoint is ready
			if (import.meta.env.DEV) {
				console.warn("Using mock payment intent for development");
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Mock client secret (this won't work with real Stripe)
				setClientSecret("pi_mock_client_secret_for_testing");
				return;
			}

			/* 
			TODO: CREATE PAYMENT INTENT ENDPOINT IN XANO BACKEND
			
			Endpoint: POST /payments/create-payment-intent
			
			Request Body Parameters:
			{
				willId: string,           // The will ID to associate with payment
				priceId: string,          // Stripe price ID (e.g., "price_1RYPe0JTwE2jGMdxI6gY09EO")
				currency: string,         // Currency code (e.g., "usd")
				description: string       // Payment description (e.g., "Will Creation Service")
			}
			
			Expected Response:
			{
				clientSecret: string,     // Stripe payment intent client secret
				paymentIntentId: string   // Stripe payment intent ID
			}
			
			Xano Implementation Example:
			```javascript
			const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
			
			const { willId, priceId, currency, description } = request.body;
			
			try {
				const paymentIntent = await stripe.paymentIntents.create({
					amount: null,  // Let Stripe determine amount from price ID
					currency: currency || 'usd',
					metadata: {
						willId: willId,
						priceId: priceId
					},
					description: description || 'Will Creation Service',
					// Optional: Add customer info if available
					// customer: customerId,
				});
				
				return {
					clientSecret: paymentIntent.client_secret,
					paymentIntentId: paymentIntent.id
				};
			} catch (error) {
				throw new Error(`Payment intent creation failed: ${error.message}`);
			}
			```
			
			Environment Variables Needed in Xano:
			- STRIPE_SECRET_KEY: Your Stripe secret key (sk_test_... or sk_live_...)
			
			Current Frontend Environment Variables:
			- VITE_STRIPE_PUBLISHABLE_KEY: ${STRIPE_CONFIG.publishableKey}
			- VITE_STRIPE_WILL_PRICE_ID: ${STRIPE_CONFIG.willPriceId}
			*/

			const { data, error } = await apiClient<{ clientSecret: string }>(
				"/payments/create-payment-intent",
				{
					method: "POST",
					body: JSON.stringify({
						willId,
						priceId: STRIPE_CONFIG.willPriceId,
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
			// TEMPORARY: Mock payment success for testing
			// Remove this when the backend endpoint is ready
			if (import.meta.env.DEV) {
				console.warn("Using mock payment success for development");
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 500));

				setPaymentCompleted(true);
				setPaymentIntent({
					id: paymentIntent.id,
					status: paymentIntent.status,
					amount,
					currency: STRIPE_CONFIG.currency,
				});
				return;
			}

			/* 
			TODO: CREATE PAYMENT SUCCESS ENDPOINT IN XANO BACKEND
			
			Endpoint: POST /wills/{willId}/payment-success
			
			URL Parameters:
			- willId: string  // The will ID from the URL path
			
			Request Body Parameters:
			{
				paymentIntentId: string,  // Stripe payment intent ID
				amount: number           // Payment amount in cents
			}
			
			Expected Response:
			{
				success: boolean,        // Indicates if the update was successful
				message?: string        // Optional success/error message
			}
			
			Xano Implementation Example:
			```javascript
			const { paymentIntentId, amount } = request.body;
			const willId = request.params.willId;
			
			try {
				// Optional: Verify payment with Stripe
				const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
				const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
				
				if (paymentIntent.status !== 'succeeded') {
					throw new Error('Payment not completed');
				}
				
				// Update will record with payment information
				const updatedWill = await xano.db.wills.update(willId, {
					payment_status: 'succeeded',
					payment_intent_id: paymentIntentId,
					payment_amount: amount,
					payment_date: new Date().toISOString(),
					status: 'paid' // or whatever status indicates a paid will
				});
				
				return {
					success: true,
					message: 'Payment recorded successfully'
				};
			} catch (error) {
				throw new Error(`Payment verification failed: ${error.message}`);
			}
			```
			
			Database Fields to Update:
			- payment_status: 'succeeded'
			- payment_intent_id: string
			- payment_amount: number (in cents)
			- payment_date: ISO string
			- status: 'paid' (or appropriate status)
			*/

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
				toast.success(
					"Payment successful! Your will has been submitted for review."
				);
			}
		} catch (error) {
			console.error("Error handling payment success:", error);
			toast.error(
				"Payment successful but failed to update will status. Please contact support."
			);
		}
	};

	const handlePaymentCancel = () => {
		if (source === "will-wizard") {
			// Go back to review step
			navigate("/app/create-will?step=review");
		} else {
			navigate("/app/dashboard");
		}
	};

	const handleContinueToWill = () => {
		if (source === "will-wizard") {
			// Return to will wizard or go to success page
			navigate("/app/will-wizard/success");
		} else {
			navigate("/app/create-will");
		}
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
								onClick={handleContinueToWill}
								className="flex-1 bg-primary hover:bg-primary/90 text-white"
							>
								Continue
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			{/* Development Mock Payment Form */}
			{import.meta.env.DEV &&
			clientSecret === "pi_mock_client_secret_for_testing" ? (
				<Card className="max-w-md mx-auto">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5" />
							Mock Payment (Development Only)
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
							<p className="text-sm text-yellow-800">
								<strong>Development Mode:</strong> This is a mock payment form
								for testing. No real payment will be processed.
							</p>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex justify-between items-center mb-2">
								<span className="font-medium">{description}</span>
								<span className="text-lg font-bold text-green-600">
									${amount}
								</span>
							</div>
						</div>

						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={handlePaymentCancel}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								onClick={() =>
									handlePaymentSuccess({
										id: "pi_mock_payment_intent",
										status: "succeeded",
									})
								}
								className="flex-1 bg-green-600 hover:bg-green-700"
							>
								Mock Pay ${amount}
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				/* Real Stripe Payment Form */
				clientSecret && (
					<Elements stripe={stripePromise} options={{ clientSecret }}>
						<PaymentForm
							onSuccess={handlePaymentSuccess}
							onCancel={handlePaymentCancel}
							amount={amount}
							description={description}
						/>
					</Elements>
				)
			)}
		</div>
	);
}
