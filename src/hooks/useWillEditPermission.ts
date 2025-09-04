import { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import { mapWillDataFromAPI } from "@/utils/dataTransform";
import { type WillData } from "@/context/WillContext";
import { toast } from "sonner";

interface WillEditPermission {
	canEdit: boolean;
	willData: WillData | null;
	isLoading: boolean;
	error: string | null;
	reason?: string;
}

/**
 * Hook to check if a will can be edited based on its current status
 *
 * @param willId - Optional will ID to check specific will
 * @param allowedStatuses - Array of statuses that allow editing
 * @returns Object with permission status and will data
 */
export function useWillEditPermission(
	willId?: string,
	allowedStatuses: string[] = ["in progress", "draft"]
): WillEditPermission {
	const [state, setState] = useState<WillEditPermission>({
		canEdit: false,
		willData: null,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		const checkPermission = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));

				let endpoint = "/wills/get-user-active-will";
				if (willId) {
					endpoint = `/wills/${willId}`;
				}

				const { data, error } = await apiClient(endpoint);

				if (error) {
					setState({
						canEdit: false,
						willData: null,
						isLoading: false,
						error: error,
						reason: "Failed to fetch will data",
					});
					return;
				}

				if (!data) {
					// No will exists - allow creation
					setState({
						canEdit: true,
						willData: null,
						isLoading: false,
						error: null,
						reason: "No will exists - creation allowed",
					});
					return;
				}

				const willInfo = Array.isArray(data) ? data[0] : data;
				const transformedWill = mapWillDataFromAPI(willInfo);

				const canEdit = allowedStatuses.includes(transformedWill.status);
				const reason = canEdit
					? `Editing allowed - status: ${transformedWill.status}`
					: `Editing blocked - status: ${transformedWill.status}`;

				setState({
					canEdit,
					willData: transformedWill,
					isLoading: false,
					error: null,
					reason,
				});
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				setState({
					canEdit: false,
					willData: null,
					isLoading: false,
					error: errorMessage,
					reason: "Error checking permission",
				});
			}
		};

		checkPermission();
	}, [willId, allowedStatuses]);

	return state;
}

/**
 * Hook specifically for checking if will operations are allowed
 * Includes additional checks for payment status and other conditions
 */
export function useWillOperationPermission(
	operation: "edit" | "submit" | "download" = "edit"
) {
	const [permission, setPermission] = useState<
		WillEditPermission & {
			operationAllowed: boolean;
			operationReason: string;
		}
	>({
		canEdit: false,
		willData: null,
		isLoading: true,
		error: null,
		operationAllowed: false,
		operationReason: "",
	});

	useEffect(() => {
		const checkOperationPermission = async () => {
			try {
				setPermission((prev) => ({ ...prev, isLoading: true, error: null }));

				const { data, error } = await apiClient("/wills/get-user-active-will");

				if (error || !data) {
					setPermission((prev) => ({
						...prev,
						isLoading: false,
						error: error || "No will found",
						operationAllowed: operation === "edit", // Allow edit for new will creation
						operationReason:
							operation === "edit" ? "Can create new will" : "No will exists",
					}));
					return;
				}

				const willInfo = Array.isArray(data) ? data[0] : data;
				const transformedWill = mapWillDataFromAPI(willInfo);

				let operationAllowed = false;
				let operationReason = "";
				let canEdit = false;

				switch (operation) {
					case "edit":
						canEdit = ["in progress", "draft"].includes(transformedWill.status);
						operationAllowed = canEdit;
						operationReason = canEdit
							? "Editing allowed"
							: `Cannot edit: Will is ${transformedWill.status}`;
						break;

					case "submit":
						operationAllowed =
							transformedWill.status === "draft" &&
							transformedWill.paymentStatus === "paid";
						operationReason = operationAllowed
							? "Ready to submit"
							: transformedWill.status !== "draft"
							? "Will must be in draft status"
							: "Payment required before submission";
						break;

					case "download":
						operationAllowed = transformedWill.status === "completed";
						operationReason = operationAllowed
							? "Download available"
							: "Will must be completed";
						break;
				}

				setPermission({
					canEdit,
					willData: transformedWill,
					isLoading: false,
					error: null,
					reason: `Status: ${transformedWill.status}`,
					operationAllowed,
					operationReason,
				});
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				setPermission((prev) => ({
					...prev,
					isLoading: false,
					error: errorMessage,
					operationAllowed: false,
					operationReason: "Error checking permissions",
				}));
			}
		};

		checkOperationPermission();
	}, [operation]);

	return permission;
}

/**
 * Utility function to show appropriate error messages based on will status
 */
export function showWillStatusError(
	status: string,
	operation: string = "edit"
): void {
	const messages = {
		"under review": `Cannot ${operation} will: Currently under review by our legal team`,
		completed: `Cannot ${operation} will: Will has been finalized`,
		submitted: `Cannot ${operation} will: Will has been submitted for processing`,
		cancelled: `Cannot ${operation} will: Will has been cancelled`,
		rejected: `Cannot ${operation} will: Will was rejected and needs revision`,
	};

	const message =
		messages[status as keyof typeof messages] ||
		`Cannot ${operation} will: Status '${status}' does not allow this operation`;

	toast.error(message);
}
