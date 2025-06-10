import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const paymentIntentId = searchParams.get("payment_intent");

	useEffect(() => {
		if (paymentIntentId) {
			toast.success("Payment completed successfully!");
		}
	}, [paymentIntentId]);

	const handleContinueToWill = () => {
		navigate("/app/create-will");
	};

	const handleGoToDashboard = () => {
		navigate("/app/dashboard");
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="max-w-md mx-auto">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
					<CardTitle className="text-2xl text-green-600">
						Payment Successful!
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-center space-y-2">
						<p className="text-lg font-medium">Thank you for your purchase!</p>
						<p className="text-muted-foreground">
							Your will creation service has been activated. You can now
							continue creating your will.
						</p>
					</div>

					{paymentIntentId && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<p className="text-sm text-gray-600">
								<span className="font-medium">Payment ID:</span>{" "}
								{paymentIntentId}
							</p>
						</div>
					)}

					<div className="space-y-3">
						<Button
							onClick={handleContinueToWill}
							className="w-full bg-light-green hover:bg-light-green/90 text-black"
						>
							<ArrowRight className="mr-2 h-4 w-4" />
							Continue Creating Your Will
						</Button>

						<Button
							variant="outline"
							onClick={handleGoToDashboard}
							className="w-full"
						>
							Back to Dashboard
						</Button>
					</div>

					<div className="text-center">
						<p className="text-xs text-muted-foreground">
							You will receive a confirmation email shortly with your payment
							details.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
