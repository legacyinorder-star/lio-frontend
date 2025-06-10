import { useState } from "react";
import {
	useStripe,
	useElements,
	PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
	onSuccess: (paymentIntent: { id: string; status: string }) => void;
	onCancel: () => void;
	amount: number;
	description: string;
}

export default function PaymentForm({
	onSuccess,
	onCancel,
	amount,
	description,
}: PaymentFormProps) {
	const stripe = useStripe();
	const elements = useElements();
	const [isProcessing, setIsProcessing] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setIsProcessing(true);
		setMessage("");

		const { error, paymentIntent } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/app/payment/success`,
			},
			redirect: "if_required",
		});

		if (error) {
			setMessage(error.message || "An error occurred during payment.");
			toast.error(error.message || "Payment failed. Please try again.");
		} else if (paymentIntent && paymentIntent.status === "succeeded") {
			setMessage("Payment successful!");
			toast.success("Payment completed successfully!");
			onSuccess(paymentIntent);
		}

		setIsProcessing(false);
	};

	const formatAmount = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	return (
		<Card className="max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CreditCard className="h-5 w-5" />
					Complete Your Payment
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-6">
					<div className="bg-gray-50 p-4 rounded-lg mb-4">
						<div className="flex justify-between items-center mb-2">
							<span className="font-medium">{description}</span>
							<span className="text-lg font-bold text-green-600">
								{formatAmount(amount)}
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Shield className="h-4 w-4" />
							<span>Secure payment powered by Stripe</span>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit}>
					<PaymentElement />

					{message && (
						<div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
							<div className="flex items-center gap-2">
								<CheckCircle className="h-4 w-4 text-blue-600" />
								<span className="text-sm text-blue-800">{message}</span>
							</div>
						</div>
					)}

					<div className="flex gap-3 mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isProcessing}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!stripe || isProcessing}
							className="flex-1 bg-green-600 hover:bg-green-700"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								`Pay ${formatAmount(amount)}`
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
