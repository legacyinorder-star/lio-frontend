export const STRIPE_CONFIG = {
	publishableKey:
		import.meta.env.STRIPE_PUBLISHABLE_KEY || "pk_test_your_test_key_here",
	currency: "gbp",
	paymentMethods: ["card"],
	willPrice: 100, // Price for will creation in USD
	willPriceId:
		import.meta.env.VITE_STRIPE_WILL_PRICE_ID ||
		"price_your_test_price_id_here",
	letterOfWishesPrice: 29.99, // Price for Letter of Wishes in USD
	letterOfWishesPriceId:
		import.meta.env.STRIPE_LETTER_PRICE_ID ||
		"price_your_letter_test_price_id_here",
};

export const PAYMENT_CONFIG = {
	successUrl: `${window.location.origin}/app/payment/success`,
	cancelUrl: `${window.location.origin}/app/payment/cancel`,
};
