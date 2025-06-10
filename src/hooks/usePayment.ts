import { useState, useEffect } from "react";
import { PaymentService, PaymentStatus } from "@/services/paymentService";

interface UsePaymentReturn {
	isPaid: boolean;
	isLoading: boolean;
	paymentStatus: PaymentStatus | null;
	checkPaymentStatus: (willId: string) => Promise<void>;
	refreshPaymentStatus: () => void;
}

export function usePayment(willId?: string): UsePaymentReturn {
	const [isPaid, setIsPaid] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
		null
	);

	const checkPaymentStatus = async (willIdToCheck: string) => {
		if (!willIdToCheck) return;

		setIsLoading(true);
		try {
			const status = await PaymentService.getWillPaymentStatus(willIdToCheck);
			setPaymentStatus(status);
			setIsPaid(status?.status === "succeeded");
		} catch (error) {
			console.error("Error checking payment status:", error);
			// If there's an error, assume not paid
			setIsPaid(false);
			setPaymentStatus(null);
		} finally {
			setIsLoading(false);
		}
	};

	const refreshPaymentStatus = () => {
		if (willId) {
			checkPaymentStatus(willId);
		}
	};

	useEffect(() => {
		if (willId) {
			checkPaymentStatus(willId);
		}
	}, [willId]);

	return {
		isPaid,
		isLoading,
		paymentStatus,
		checkPaymentStatus,
		refreshPaymentStatus,
	};
}
