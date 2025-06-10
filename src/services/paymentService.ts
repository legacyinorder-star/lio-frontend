import { apiClient } from "@/utils/apiClient";
import { STRIPE_CONFIG } from "@/config/stripe";

export interface CreatePaymentIntentRequest {
	willId: string;
	amount: number; // in cents
	currency: string;
	description: string;
}

export interface CreatePaymentIntentResponse {
	clientSecret: string;
	paymentIntentId: string;
}

export interface PaymentSuccessRequest {
	paymentIntentId: string;
	amount: number; // in cents
}

export interface PaymentStatus {
	id: string;
	status: "pending" | "succeeded" | "failed" | "cancelled";
	amount: number;
	currency: string;
	created: number;
}

export class PaymentService {
	static async createPaymentIntent(
		request: CreatePaymentIntentRequest
	): Promise<CreatePaymentIntentResponse> {
		const { data, error } = await apiClient<CreatePaymentIntentResponse>(
			"/payments/create-payment-intent",
			{
				method: "POST",
				body: JSON.stringify(request),
			}
		);

		if (error || !data) {
			throw new Error(error || "Failed to create payment intent");
		}

		return data;
	}

	static async confirmPaymentSuccess(
		willId: string,
		request: PaymentSuccessRequest
	): Promise<void> {
		const { error } = await apiClient(`/wills/${willId}/payment-success`, {
			method: "POST",
			body: JSON.stringify(request),
		});

		if (error) {
			throw new Error(error);
		}
	}

	static async getPaymentStatus(
		paymentIntentId: string
	): Promise<PaymentStatus> {
		const { data, error } = await apiClient<PaymentStatus>(
			`/payments/${paymentIntentId}/status`
		);

		if (error || !data) {
			throw new Error(error || "Failed to get payment status");
		}

		return data;
	}

	static async getWillPaymentStatus(
		willId: string
	): Promise<PaymentStatus | null> {
		const { data, error } = await apiClient<PaymentStatus>(
			`/wills/${willId}/payment-status`
		);

		if (error) {
			if (error.includes("not found")) {
				return null; // Will hasn't been paid for yet
			}
			throw new Error(error);
		}

		return data;
	}

	static formatAmount(amount: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount / 100); // Convert from cents to dollars
	}

	static getWillPrice(): number {
		return STRIPE_CONFIG.willPrice;
	}

	static getWillPriceInCents(): number {
		return Math.round(STRIPE_CONFIG.willPrice * 100);
	}
}
