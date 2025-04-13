export interface UserDetails {
	id: string;
	email: string;
	name?: string;
	first_name?: string;
	last_name?: string;
	token?: string;
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

export const getAuthToken = (): string | null => {
	return localStorage.getItem("authToken");
};
