export const API_CONFIG = {
	baseUrl:
		import.meta.env.VITE_API_BASE_URL ||
		"https://xx4z-bjeb-pp4s.e2.xano.io/api:XXA97u_a",
	endpoints: {
		auth: {
			login: "/auth/login",
			verifyOtp: "/one_time_password/{one_time_password_id}/verify",
			resendOtp: "/one_time_password/{one_time_password_id}/recreate",
			me: "/auth/me",
			requestPasswordReset: "/password_reset_tokens",
			resetPassword: "/users/update-password",
		},
		admin: {
			users: "/users",
			toggleUserStatus: "admin/users/{users_id}/status",
			documents: "/admin/documents",
			willsUnderReview: "/admin/wills/get-pending-review",
			allWills: "/admin/wills",
			approveWill: "/admin/wills/{will_id}/approve",
			rejectWill: "/admin/wills/{will_id}/reject",
			generateWillPDF: "/admin/wills/{will_id}/generate-pdf",
		},
	},
} as const;

export const getApiUrl = (endpoint: string) => {
	// If endpoint is already a full URL, return it as-is
	if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
		return endpoint;
	}
	// Otherwise, append to base URL
	return `${API_CONFIG.baseUrl}${endpoint}`;
};

// Function to test API connectivity
export const pingApi = async (): Promise<boolean> => {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

		const response = await fetch(`${API_CONFIG.baseUrl}/ping`, {
			method: "GET",
			signal: controller.signal,
		});

		clearTimeout(timeoutId);
		return response.ok;
	} catch (error) {
		console.error("API ping failed:", error);
		return false;
	}
};
