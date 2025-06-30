import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentCancelPage() {
	const navigate = useNavigate();

	const handleRetryPayment = () => {
		navigate("/app/dashboard");
	};

	const handleGoToDashboard = () => {
		navigate("/app/dashboard");
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="max-w-md mx-auto">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
						<XCircle className="h-8 w-8 text-red-600" />
					</div>
					<CardTitle className="text-2xl text-red-600">
						Payment Cancelled
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-center space-y-2">
						<p className="text-lg font-medium">
							Your payment was not completed
						</p>
						<p className="text-muted-foreground">
							No worries! You can try again anytime. Your will creation process
							has been saved and you can continue from where you left off.
						</p>
					</div>

					<div className="space-y-3">
						<Button
							onClick={handleRetryPayment}
							className="w-full bg-primary hover:bg-primary/90 text-white"
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Payment Again
						</Button>

						<Button
							variant="outline"
							onClick={handleGoToDashboard}
							className="w-full"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Dashboard
						</Button>
					</div>

					<div className="text-center">
						<p className="text-xs text-muted-foreground">
							If you're experiencing issues, please contact our support team for
							assistance.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
