import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";

export default function PaymentSuccessPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [isValid, setIsValid] = useState(false);

	const willId = searchParams.get("willId");

	useEffect(() => {
		if (!willId) {
			toast.error("Invalid payment success page. Missing will ID.");
			navigate("/app/dashboard");
			return;
		}

		validatePaymentSuccess();
	}, [willId, navigate]);

	const validatePaymentSuccess = async () => {
		try {
			setIsLoading(true);

			const { error } = await apiClient(`/wills/${willId}/payment-successful`, {
				method: "POST",
			});

			if (error) {
				// Handle 400 or other error responses
				toast.error(error || "Payment validation failed");
				navigate("/app/dashboard");
				return;
			}

			// Success - 200 response
			setIsValid(true);
			toast.success("Payment completed successfully!");
		} catch (error) {
			console.error("Error validating payment success:", error);
			toast.error("Failed to validate payment. Please contact support.");
			navigate("/app/dashboard");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoToDashboard = () => {
		navigate("/app/dashboard");
	};

	// Show loading state while validating
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-md mx-auto">
					<CardContent className="p-8">
						<div className="flex flex-col items-center gap-4">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-muted-foreground">Validating payment...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Don't render success content if validation failed
	if (!isValid) {
		return null;
	}

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

					{/* {paymentIntentId && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<p className="text-sm text-gray-600">
								<span className="font-medium">Payment ID:</span>{" "}
								{paymentIntentId}
							</p>
						</div>
					)} */}

					<div className="space-y-3">
						<Button
							variant="default"
							onClick={handleGoToDashboard}
							className="w-full bg-light-green hover:bg-light-green/90 text-black"
						>
							<ArrowRight className="mr-2 h-4 w-4" />
							Continue to Dashboard
						</Button>
					</div>

					<div className="text-center">
						<p className="text-xs text-muted-foreground">
							You will receive a confirmation email shortly.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
