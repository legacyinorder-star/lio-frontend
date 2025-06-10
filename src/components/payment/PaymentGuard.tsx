import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import PaymentPrompt from "./PaymentPrompt";

interface PaymentGuardProps {
	children: React.ReactNode;
}

export default function PaymentGuard({ children }: PaymentGuardProps) {
	const navigate = useNavigate();
	const [willId, setWillId] = useState<string | undefined>();
	const [isLoading, setIsLoading] = useState(true);
	const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

	const { isLoading: isPaymentLoading, refreshPaymentStatus } =
		usePayment(willId);

	useEffect(() => {
		const checkWillAccess = async () => {
			try {
				setIsLoading(true);

				// Check if there's an active will
				const { data, error } = await apiClient("/wills/get-user-active-will");

				if (error) {
					console.error("Error checking active will:", error);
					// If no will exists, create one and show payment prompt
					const { data: newWill, error: createError } = await apiClient<{
						id: string;
					}>("/wills/create", {
						method: "POST",
						body: JSON.stringify({
							status: "draft",
							payment_status: "pending",
						}),
					});

					if (createError || !newWill) {
						toast.error("Failed to create will. Please try again.");
						navigate("/app/dashboard");
						return;
					}

					setWillId(newWill.id);
					setShowPaymentPrompt(true);
					return;
				}

				// Handle both array and single object responses
				const willData = Array.isArray(data) ? data[0] : data;

				if (willData) {
					setWillId(willData.id);

					// Check if the will has been paid for
					if (
						willData.payment_status === "pending" ||
						!willData.payment_status
					) {
						setShowPaymentPrompt(true);
					} else {
						// Will is paid, allow access
						setShowPaymentPrompt(false);
					}
				} else {
					// No will exists, create one and show payment prompt
					const { data: newWill, error: createError } = await apiClient<{
						id: string;
					}>("/wills/create", {
						method: "POST",
						body: JSON.stringify({
							status: "draft",
							payment_status: "pending",
						}),
					});

					if (createError || !newWill) {
						toast.error("Failed to create will. Please try again.");
						navigate("/app/dashboard");
						return;
					}

					setWillId(newWill.id);
					setShowPaymentPrompt(true);
				}
			} catch (error) {
				console.error("Error checking will access:", error);
				toast.error("Failed to check will access. Please try again.");
				navigate("/app/dashboard");
			} finally {
				setIsLoading(false);
			}
		};

		checkWillAccess();
	}, [navigate]);

	const handlePaymentComplete = () => {
		setShowPaymentPrompt(false);
		refreshPaymentStatus();
	};

	if (isLoading || isPaymentLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="max-w-md mx-auto">
					<CardContent className="p-8">
						<div className="flex flex-col items-center gap-4">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-muted-foreground">
								Checking payment status...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (showPaymentPrompt && willId) {
		return (
			<PaymentPrompt
				willId={willId}
				onPaymentComplete={handlePaymentComplete}
			/>
		);
	}

	// If payment is complete or not required, show the children
	return <>{children}</>;
}
