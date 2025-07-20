import { apiClient } from "@/utils/apiClient";
import { STRIPE_CONFIG } from "@/config/stripe";

export interface CreatePaymentIntentRequest {
	willId: string;
	amount: number; // in cents
	currency: string;
	description: string;
}

export interface CreatePaymentIntentWithPriceRequest {
	willId: string;
	priceId: string;
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

export interface CreateCheckoutSessionRequest {
	willId: string;
	priceId: string;
	currency: string;
	description: string;
	successUrl?: string;
	cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
	sessionId: string;
	url: string;
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

	static async createPaymentIntentWithPrice(
		request: CreatePaymentIntentWithPriceRequest
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

	static getWillPriceId(): string {
		return STRIPE_CONFIG.willPriceId;
	}

	static async createCheckoutSession(
		request: CreateCheckoutSessionRequest
	): Promise<CreateCheckoutSessionResponse> {
		console.log("🔍 createCheckoutSession called with:", request);

		// Create dynamic URLs for success and cancel
		const baseUrl = window.location.origin;
		const successUrl =
			request.successUrl ||
			`${baseUrl}/app/payment/success?willId=${request.willId}`;
		const cancelUrl =
			request.cancelUrl ||
			`${baseUrl}/app/payment/cancel?willId=${request.willId}`;

		const requestBody = {
			will_id: request.willId,
			price_id: request.priceId,
			description: request.description,
			success_url: successUrl,
			cancel_url: cancelUrl,
			// Additional parameters for Stripe Checkout
			mode: "payment",
			paymentMethodTypes: ["card"],
			metadata: {
				will_id: request.willId,
				price_id: request.priceId,
			},
			line_items: [
				{
					price: request.priceId,
					quantity: 1,
				},
			],
		};

		console.log("📤 Sending request body:", requestBody);

		const { data, error } = await apiClient<CreateCheckoutSessionResponse>(
			"/sessions",
			{
				method: "POST",
				authenticated: true,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			}
		);

		if (error || !data) {
			console.error("❌ API error:", error);
			throw new Error(error || "Failed to create checkout session");
		}

		console.log("✅ Response data:", data);
		return data;
	}

	static async createCheckoutSessionAndRedirect(
		request: CreateCheckoutSessionRequest
	): Promise<void> {
		try {
			const { url } = await this.createCheckoutSession(request);
			window.location.href = url;
		} catch (error) {
			console.error("Error creating checkout session:", error);
			throw error;
		}
	}
}
