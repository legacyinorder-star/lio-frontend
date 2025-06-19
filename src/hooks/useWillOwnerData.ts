import { useState, useCallback } from "react";
import { apiClient } from "@/utils/apiClient";

// API response interfaces
interface WillOwnerApiResponse {
	id: string;
	will_id: string;
	first_name: string;
	last_name: string;
	marital_status: string;
	address: string;
	city: string;
	state: string;
	post_code: string;
	country: string;
	created_at: string;
}

interface SpouseApiResponse {
	id: string;
	will_id: string;
	first_name: string;
	last_name: string;
	relationship_id: string;
	is_minor: boolean;
	created_at: string;
}

// Transformed data interfaces
export interface WillOwnerData {
	id: string;
	willId: string;
	firstName: string;
	lastName: string;
	maritalStatus: string;
	address: string;
	city: string;
	state: string;
	postCode: string;
	country: string;
}

export interface SpouseData {
	id: string;
	firstName: string;
	lastName: string;
}

export interface UseWillOwnerDataReturn {
	willOwnerData: WillOwnerData | null;
	spouseData: SpouseData | null;
	isLoading: boolean;
	error: string | null;
	loadWillOwnerData: (willId: string) => Promise<void>;
	saveWillOwnerData: (data: Partial<WillOwnerData>) => Promise<boolean>;
}

export function useWillOwnerData(): UseWillOwnerDataReturn {
	const [willOwnerData, setWillOwnerData] = useState<WillOwnerData | null>(
		null
	);
	const [spouseData, setSpouseData] = useState<SpouseData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadWillOwnerData = useCallback(async (willId: string) => {
		if (!willId) {
			setError("Will ID is required");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Load will owner data
			const { data: ownerResponse, error: ownerError } =
				await apiClient<WillOwnerApiResponse>(
					`/will_owner/get-by-will/${willId}`
				);

			if (ownerError) {
				console.error("Error loading will owner:", ownerError);
				setError("Failed to load will owner information");
				return;
			}

			if (ownerResponse) {
				const transformedOwnerData: WillOwnerData = {
					id: ownerResponse.id,
					willId: ownerResponse.will_id,
					firstName: ownerResponse.first_name,
					lastName: ownerResponse.last_name,
					maritalStatus: ownerResponse.marital_status,
					address: ownerResponse.address,
					city: ownerResponse.city,
					state: ownerResponse.state,
					postCode: ownerResponse.post_code,
					country: ownerResponse.country,
				};
				setWillOwnerData(transformedOwnerData);

				// If married, load spouse data
				if (ownerResponse.marital_status === "married") {
					const { data: spouseResponse, error: spouseError } =
						await apiClient<SpouseApiResponse>(
							`/people/spouse/get-by-will/${willId}`
						);

					if (spouseError) {
						console.error("Error loading spouse:", spouseError);
						// Don't set error here as spouse data is optional
					} else if (spouseResponse) {
						const transformedSpouseData: SpouseData = {
							id: spouseResponse.id,
							firstName: spouseResponse.first_name,
							lastName: spouseResponse.last_name,
						};
						setSpouseData(transformedSpouseData);
					}
				} else {
					setSpouseData(null);
				}
			}
		} catch (err) {
			console.error("Error in loadWillOwnerData:", err);
			setError("An error occurred while loading will owner data");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const saveWillOwnerData = useCallback(
		async (data: Partial<WillOwnerData>): Promise<boolean> => {
			if (!willOwnerData?.id) {
				setError("Will owner ID is required for saving");
				return false;
			}

			setIsLoading(true);
			setError(null);

			try {
				// Prepare the request data with snake_case keys
				const requestData: Record<string, string> = {};

				if (data.firstName !== undefined)
					requestData.first_name = data.firstName;
				if (data.lastName !== undefined) requestData.last_name = data.lastName;
				if (data.maritalStatus !== undefined)
					requestData.marital_status = data.maritalStatus;
				if (data.address !== undefined) requestData.address = data.address;
				if (data.city !== undefined) requestData.city = data.city;
				if (data.state !== undefined) requestData.state = data.state;
				if (data.postCode !== undefined) requestData.post_code = data.postCode;
				if (data.country !== undefined) requestData.country = data.country;

				const { error } = await apiClient(`/will_owner/${willOwnerData.id}`, {
					method: "PATCH",
					body: JSON.stringify(requestData),
				});

				if (error) {
					console.error("Error saving will owner:", error);
					setError("Failed to save will owner information");
					return false;
				}

				// Update local state with saved data
				setWillOwnerData((prev) => (prev ? { ...prev, ...data } : null));
				return true;
			} catch (err) {
				console.error("Error in saveWillOwnerData:", err);
				setError("An error occurred while saving will owner data");
				return false;
			} finally {
				setIsLoading(false);
			}
		},
		[willOwnerData?.id]
	);

	return {
		willOwnerData,
		spouseData,
		isLoading,
		error,
		loadWillOwnerData,
		saveWillOwnerData,
	};
}
