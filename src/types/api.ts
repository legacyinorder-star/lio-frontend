export interface SignupResponse {
	authToken: string;
	user: {
		id: number;
		email: string;
		firstName: string;
		lastName: string;
	};
}

export interface ApiError {
	message: string;
	code?: number;
}
