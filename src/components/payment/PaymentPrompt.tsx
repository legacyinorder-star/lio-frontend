import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	CreditCard,
	Shield,
	CheckCircle,
	FileText,
	Clock,
	Users,
	ArrowRight,
	Star,
} from "lucide-react";
import { PaymentService } from "@/services/paymentService";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";

interface PaymentPromptProps {
	willId?: string;
	onPaymentComplete?: () => void;
}

export default function PaymentPrompt({
	willId,
	onPaymentComplete,
}: PaymentPromptProps) {
	const navigate = useNavigate();
	const [isProcessing, setIsProcessing] = useState(false);

	const features = [
		{
			icon: <FileText className="h-5 w-5" />,
			title: "Legally Valid Will",
			description:
				"Create a legally binding will that meets your state's requirements",
		},
		{
			icon: <Shield className="h-5 w-5" />,
			title: "Secure & Private",
			description: "Your information is encrypted and stored securely",
		},
		{
			icon: <Clock className="h-5 w-5" />,
			title: "Lifetime Access",
			description: "Access and update your will anytime, anywhere",
		},
		{
			icon: <Users className="h-5 w-5" />,
			title: "Unlimited Beneficiaries",
			description: "Add as many beneficiaries and executors as needed",
		},
	];

	const handleStartPayment = async () => {
		if (!willId) {
			toast.error("Will ID is required for payment");
			return;
		}

		setIsProcessing(true);
		try {
			// Create or get will ID if not provided
			let finalWillId = willId;

			if (!finalWillId) {
				const { data, error } = await apiClient<{ id: string }>(
					"/wills/create",
					{
						method: "POST",
						body: JSON.stringify({
							status: "draft",
							payment_status: "pending",
						}),
					}
				);

				if (error || !data) {
					throw new Error(error || "Failed to create will");
				}

				finalWillId = data.id;
			}

			// Navigate to payment page
			const paymentUrl = `/app/payment?willId=${finalWillId}&amount=${PaymentService.getWillPrice()}&description=Will Creation Service`;
			navigate(paymentUrl);
		} catch (error) {
			console.error("Error starting payment:", error);
			toast.error("Failed to start payment process. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleContinueWithoutPayment = () => {
		// For demo purposes, allow users to continue without payment
		// In production, this would be disabled
		toast.info("Demo mode: Continuing without payment");
		if (onPaymentComplete) {
			onPaymentComplete();
		} else {
			navigate("/app/create-will");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Create Your Will Today
					</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Protect your legacy and ensure your wishes are carried out with our
						comprehensive will creation service.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Features */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Star className="h-5 w-5 text-yellow-500" />
									What's Included
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{features.map((feature, index) => (
										<div key={index} className="flex items-start gap-3">
											<div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
												{feature.icon}
											</div>
											<div>
												<h3 className="font-medium text-gray-900">
													{feature.title}
												</h3>
												<p className="text-sm text-gray-600">
													{feature.description}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Pricing */}
					<div className="space-y-6">
						<Card className="border-2 border-green-200">
							<CardHeader className="text-center">
								<Badge className="w-fit mx-auto mb-2 bg-green-100 text-green-800">
									Most Popular
								</Badge>
								<CardTitle className="text-2xl">
									Will Creation Service
								</CardTitle>
								<div className="flex items-baseline justify-center gap-1">
									<span className="text-4xl font-bold text-gray-900">
										${PaymentService.getWillPrice()}
									</span>
									<span className="text-gray-600">one-time</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm">
											Complete will creation wizard
										</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm">PDF download of your will</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm">
											Lifetime access to your will
										</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm">
											Free updates and modifications
										</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm">Customer support included</span>
									</div>
								</div>

								<div className="space-y-3">
									<Button
										onClick={handleStartPayment}
										disabled={isProcessing}
										className="w-full bg-green-600 hover:bg-green-700 text-white"
										size="lg"
									>
										{isProcessing ? (
											"Processing..."
										) : (
											<>
												<CreditCard className="mr-2 h-4 w-4" />
												Pay ${PaymentService.getWillPrice()} & Create Will
												<ArrowRight className="ml-2 h-4 w-4" />
											</>
										)}
									</Button>

									<Button
										variant="outline"
										onClick={handleContinueWithoutPayment}
										className="w-full"
										size="lg"
									>
										Try Demo (Free)
									</Button>
								</div>

								<div className="text-center">
									<p className="text-xs text-gray-500">
										Secure payment powered by Stripe. Your information is
										protected.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
