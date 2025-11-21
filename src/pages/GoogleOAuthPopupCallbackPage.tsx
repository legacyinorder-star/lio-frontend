import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	getGoogleRedirectUri,
	GOOGLE_OAUTH_BASE_URL,
	POPUP_MESSAGE_TYPE,
} from "@/utils/googlePopupAuth";
import { apiClient } from "@/utils/apiClient";

const GoogleOAuthPopupCallbackPage = () => {
	const [searchParams] = useSearchParams();
	const [status, setStatus] = useState<
		"loading" | "success" | "error" | "no-opener"
	>("loading");
	const [errorMessage, setErrorMessage] = useState("");
	const hasHandledRef = useRef(false);

	useEffect(() => {
		const code = searchParams.get("code");
		const error = searchParams.get("error");
		const state = searchParams.get("state");

		const postMessageToOpener = (payload: Record<string, unknown>) => {
			if (window.opener && !window.opener.closed) {
				window.opener.postMessage(
					{ type: POPUP_MESSAGE_TYPE, ...payload },
					window.location.origin
				);
				return true;
			}
			return false;
		};

		if (error) {
			postMessageToOpener({ error });
			setStatus("error");
			setErrorMessage(
				"Google sign-in was cancelled or encountered an error. You can close this window."
			);
			return;
		}

		if (!code) {
			postMessageToOpener({ error: "Missing authorization code from Google." });
			setStatus("error");
			setErrorMessage(
				"Missing authorization code from Google. Please close this window and try again."
			);
			return;
		}

		const exchangeCode = async () => {
			if (hasHandledRef.current) {
				return;
			}
			hasHandledRef.current = true;

			try {
				const redirectUri = getGoogleRedirectUri();
				const params = new URLSearchParams({
					code,
					redirect_uri: redirectUri,
				});

				if (state) {
					params.set("state", state);
				}

				console.log("Exchanging code with redirect_uri:", redirectUri);

				const response = await apiClient<{
					token: string;
					name?: string;
					email?: string;
					is_created?: boolean;
					message?: string;
				}>(`/oauth/google/continue?${params.toString()}`, {
					authenticated: false,
					baseUrlOverride: GOOGLE_OAUTH_BASE_URL,
					method: "GET",
				});

				if (response.error || !response.data?.token) {
					const errorMsg =
						response.error ||
						response.data?.message ||
						"Failed to complete Google sign-in.";
					console.error("Continue endpoint error:", errorMsg, response);
					throw new Error(errorMsg);
				}

				const delivered = postMessageToOpener({
					token: response.data.token,
					name: response.data.name,
					email: response.data.email,
					is_created: response.data.is_created,
				});

				if (!delivered) {
					setStatus("no-opener");
					setErrorMessage(
						"This window cannot communicate with the original tab. Please copy the URL and contact support."
					);
					return;
				}

				setStatus("success");
				setTimeout(() => window.close(), 500);
			} catch (err) {
				console.error("Google OAuth callback failed:", err);
				postMessageToOpener({
					error:
						err instanceof Error
							? err.message
							: "Unexpected error completing Google sign-in.",
				});
				setStatus("error");
				setErrorMessage(
					err instanceof Error
						? err.message
						: "Unexpected error completing Google sign-in. Please close this window and try again."
				);
			}
		};

		exchangeCode();
	}, [searchParams]);

	const renderMessage = () => {
		switch (status) {
			case "loading":
				return "Completing Google sign-in…";
			case "success":
				return "Google sign-in successful. You can close this window.";
			case "no-opener":
				return errorMessage;
			case "error":
			default:
				return (
					errorMessage || "Google sign-in failed. You can close this window."
				);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-6 text-center">
			<p className="text-sm text-gray-700">{renderMessage()}</p>
		</div>
	);
};

export default GoogleOAuthPopupCallbackPage;
