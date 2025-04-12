export const API_CONFIG = {
	baseUrl: "https://x8ki-letl-twmt.n7.xano.io/api:XXA97u_a",
	endpoints: {
		auth: {
			login: "/auth/login",
			verifyOtp: "/one_time_password/{one_time_password_id}/verify",
			me: "/auth/me",
			requestPasswordReset: "/password_reset_tokens",
			resetPassword: "/auth/reset-password",
		},
	},
} as const;

export const getApiUrl = (endpoint: string) => {
	return `${API_CONFIG.baseUrl}${endpoint}`;
};
