import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useCallback,
} from "react";
import {
	getUserDetails,
	setUserDetails,
	removeAuthData,
	getAuthToken,
	isTokenExpired,
} from "@/utils/auth";
import { toast } from "sonner";
import { getApiUrl, API_CONFIG } from "@/config/api";

interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	token: string;
	role?: string;
}

interface AuthContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	logout: () => void;
	isLoading: boolean;
	refreshSession: () => Promise<boolean>;
	lastActivity: Date | null;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	setUser: () => {},
	logout: () => {},
	isLoading: true,
	refreshSession: async () => false,
	lastActivity: null,
});

// Session management constants
// const SESSION_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes
// const ACTIVITY_EVENTS = [
// 	"mousedown",
// 	"mousemove",
// 	"keypress",
// 	"scroll",
// 	"touchstart",
// ];
// const INACTIVITY_WARNING_TIME = 25 * 60 * 1000; // 25 minutes
// const SESSION_TIMEOUT_TIME = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	// const [lastActivity, setLastActivity] = useState<Date | null>(null);
	// const sessionCheckIntervalRef = useRef<number | null>(null);
	// const inactivityWarningRef = useRef<number | null>(null);
	// const inactivityTimeoutRef = useRef<number | null>(null);

	// Centralized logout function
	const logout = useCallback(() => {
		setUser(null);
		// setLastActivity(null);
		removeAuthData();

		// Clear all localStorage/sessionStorage items that might persist
		localStorage.removeItem("returnUrl");
		localStorage.removeItem("authMetrics");
		sessionStorage.clear();
		// Other context states will be cleared by their own hooks when user becomes null
	}, []);

	// Function to check token expiration
	const checkTokenExpiration = useCallback(() => {
		const token = getAuthToken();
		if (token) {
			// For JWE tokens, we rely on server-side validation
			// Only check expiration for JWT tokens client-side
			const parts = token.split(".");
			const isJWE = parts.length === 5;

			if (!isJWE && isTokenExpired(token)) {
				toast.error("Your session has expired. Please log in again.");
				logout();

				// Prevent redirect loops on auth pages
				const currentPath = window.location.pathname;
				const authPages = [
					"/login",
					"/signup",
					"/verify-otp",
					"/request-password-reset",
					"/reset-password",
				];

				if (!authPages.includes(currentPath)) {
					window.location.href = "/login";
				}
				return false;
			}
		}
		return true;
	}, [logout]);

	// Session refresh function using /auth/me endpoint
	const refreshSession = useCallback(async (): Promise<boolean> => {
		const token = getAuthToken();
		if (!token || isTokenExpired(token)) {
			return false;
		}

		try {
			const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.me), {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const userDetails = await response.json();

				// Update stored user details
				setUserDetails(userDetails);

				// Update user in context if it exists
				if (user) {
					setUser((prevUser) =>
						prevUser
							? {
									...prevUser,
									first_name: userDetails.first_name || prevUser.first_name,
									last_name: userDetails.last_name || prevUser.last_name,
									role: userDetails.role || prevUser.role,
							  }
							: null
					);
				}

				return true;
			} else if (response.status === 401) {
				// Session is no longer valid
				toast.error("Your session has expired. Please log in again.");
				logout();

				// Prevent redirect loops on auth pages
				const currentPath = window.location.pathname;
				const authPages = [
					"/login",
					"/signup",
					"/verify-otp",
					"/request-password-reset",
					"/reset-password",
				];

				if (!authPages.includes(currentPath)) {
					window.location.href = "/login";
				}
				return false;
			}
		} catch (error) {
			console.error("Session refresh failed:", error);
			// Don't logout on network errors, just return false
			return false;
		}

		return false;
	}, [user, logout]);

	// Track user activity - COMMENTED OUT
	// const updateActivity = useCallback(() => {
	// 	// Only track activity if user is authenticated
	// 	if (!user) return;

	// 	// const now = new Date();
	// 	// setLastActivity(now);

	// 	// Clear existing timers
	// 	// if (inactivityWarningRef.current) {
	// 	// 	clearTimeout(inactivityWarningRef.current);
	// 	// }
	// 	// if (inactivityTimeoutRef.current) {
	// 	// 	clearTimeout(inactivityTimeoutRef.current);
	// 	// }

	// 	// Set warning timer
	// 	// inactivityWarningRef.current = setTimeout(() => {
	// 	// 	toast.warning(
	// 	// 		"You've been inactive for a while. Your session will expire soon unless you interact with the page.",
	// 	// 		{
	// 	// 			duration: 10000,
	// 	// 		}
	// 	// 	);
	// 	// }, INACTIVITY_WARNING_TIME);

	// 	// Set timeout timer
	// 	// inactivityTimeoutRef.current = setTimeout(() => {
	// 	// 	toast.error("Session expired due to inactivity.");
	// 	// 	logout();
	// 	// 	window.location.href = "/login";
	// 	// }, SESSION_TIMEOUT_TIME);
	// }, [user, logout]);

	// Initialize auth state on mount
	useEffect(() => {
		const initializeAuth = () => {
			const userDetails = getUserDetails();
			const token = getAuthToken();

			// Check if we have both user details and token
			if (userDetails && token) {
				// Verify token is not expired (skip for JWE tokens)
				const parts = token.split(".");
				const isJWE = parts.length === 5;

				if (isJWE || !isTokenExpired(token)) {
					// Valid auth state - set user
					const userData = {
						id: userDetails.id,
						email: userDetails.email,
						first_name: userDetails.first_name || "",
						last_name: userDetails.last_name || "",
						role: userDetails.role || "",
						token,
					};
					setUser(userData);
				} else {
					// Token is expired - clean up
					console.warn(
						"Token expired during initialization, clearing auth data"
					);
					removeAuthData();
				}
			} else if (userDetails || token) {
				// Partial auth state - clean up inconsistent data
				console.warn("Inconsistent auth state detected, clearing auth data");
				removeAuthData();
			}

			setIsLoading(false);
		};

		initializeAuth();
	}, []); // Remove updateActivity dependency to prevent loops

	// Set up session management when user is authenticated
	useEffect(() => {
		if (user) {
			// Initialize activity tracking for authenticated users
			// updateActivity();

			// Set up token expiration checking interval (every 3 minutes)
			const tokenCheckInterval = setInterval(checkTokenExpiration, 180000);

			// Set up session validation interval
			// sessionCheckIntervalRef.current = setInterval(async () => {
			// 	const isValid = await refreshSession();
			// 	if (!isValid) {
			// 		console.warn("Session validation failed");
			// 	}
			// }, SESSION_CHECK_INTERVAL);

			// Set up activity listeners
			// const handleActivity = () => updateActivity();
			// ACTIVITY_EVENTS.forEach((event) => {
			// 	document.addEventListener(event, handleActivity, { passive: true });
			// });

			// Cleanup function
			return () => {
				clearInterval(tokenCheckInterval);
				// if (sessionCheckIntervalRef.current) {
				// 	clearInterval(sessionCheckIntervalRef.current);
				// 	sessionCheckIntervalRef.current = null;
				// }
				// ACTIVITY_EVENTS.forEach((event) => {
				// 	document.removeEventListener(event, handleActivity);
				// });
			};
		}
	}, [user, checkTokenExpiration, refreshSession]);

	// Save user to localStorage whenever it changes (but only if user exists)
	useEffect(() => {
		if (user) {
			setUserDetails({
				id: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
				role: user.role,
			});
			localStorage.setItem("authToken", user.token);
		}
	}, [user]);

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				logout,
				isLoading,
				refreshSession,
				lastActivity: null,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
