import { useState, useEffect } from "react";

/**
 * Custom hook that tracks the user's online status
 * @returns {boolean} True if the user is online, false otherwise
 */
export function useOnlineStatus(): boolean {
	const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return isOnline;
}
