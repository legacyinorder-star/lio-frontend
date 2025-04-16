export interface UserDetails {
	id: string;
	email: string;
	name?: string;
	first_name?: string;
	last_name?: string;
}

export const getUserDetails = (): UserDetails | null => {
	const userDetailsStr = localStorage.getItem("userDetails");
	if (!userDetailsStr) return null;
	try {
		return JSON.parse(userDetailsStr);
	} catch (error) {
		console.error("Error parsing user details:", error);
		return null;
	}
};

export const setUserDetails = (userDetails: UserDetails): void => {
	localStorage.setItem("userDetails", JSON.stringify(userDetails));
};

export const getAuthToken = (): string | null => {
	return localStorage.getItem("authToken");
};

export const setAuthToken = (token: string): void => {
	localStorage.setItem("authToken", token);
};

export const removeAuthData = (): void => {
	localStorage.removeItem("userDetails");
	localStorage.removeItem("authToken");
};

export const isAuthenticated = (): boolean => {
	return !!getAuthToken() && !!getUserDetails();
};

interface DecodedToken {
	exp: number;
	iat?: number;
	sub?: string;
	[key: string]: unknown;
}

export const isTokenExpired = (token: string): boolean => {
	try {
		// Check if the token is in the expected format (three parts separated by dots)
		const parts = token.split(".");
		if (parts.length !== 3) {
			console.warn("Token does not have the expected JWT format");
			return true;
		}

		const base64Url = parts[1];

		// Safely decode the base64 with padding if needed
		let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

		// Add padding if needed
		switch (base64.length % 4) {
			case 0:
				break; // No padding needed
			case 2:
				base64 += "==";
				break;
			case 3:
				base64 += "=";
				break;
			default:
				console.warn("Invalid base64 string length");
				return true;
		}

		try {
			// Try to decode using atob
			const jsonPayload = atob(base64);

			// Verify that the result is valid JSON (try parsing a small sample first)
			// This helps prevent processing large amounts of binary data
			if (jsonPayload.slice(0, 10).match(/[^\x20-\x7E]/)) {
				console.warn("Decoded token contains non-printable characters");
				return true;
			}

			const decodedToken = JSON.parse(jsonPayload) as DecodedToken;

			// Check if the token has an expiration claim
			if (!decodedToken.exp) {
				console.warn("Token has no expiration date");
				return true;
			}

			// Check if the token is expired
			const currentTime = Math.floor(Date.now() / 1000);
			return decodedToken.exp < currentTime;
		} catch (parseError) {
			console.error("Error parsing token payload:", parseError);
			return true;
		}
	} catch (error) {
		console.error("Error processing token:", error);
		return true;
	}
};
