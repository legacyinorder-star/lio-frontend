import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import {
	getUserDetails,
	setUserDetails,
	removeAuthData,
	getAuthToken,
	isTokenExpired,
} from "@/utils/auth";
import { toast } from "sonner";

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
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	setUser: () => {},
	logout: () => {},
	isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Centralized logout function
	const logout = () => {
		setUser(null);
		removeAuthData();
	};

	// Function to check token expiration
	const checkTokenExpiration = () => {
		const token = getAuthToken();
		if (token && isTokenExpired(token)) {
			toast.error("Your session has expired. Please log in again.");
			logout();
			// Force redirect to login page
			window.location.href = "/login";
			return false;
		}
		return true;
	};

	// Initialize auth state on mount
	useEffect(() => {
		const initializeAuth = () => {
			const userDetails = getUserDetails();
			const token = getAuthToken();

			// Check if we have both user details and token
			if (userDetails && token) {
				// Verify token is not expired
				if (!isTokenExpired(token)) {
					// Valid auth state - set user
					setUser({
						id: userDetails.id,
						email: userDetails.email,
						first_name: userDetails.first_name || "",
						last_name: userDetails.last_name || "",
						role: userDetails.role || "",
						token,
					});
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
	}, []);

	// Set up token expiration checking interval
	useEffect(() => {
		// Only set up interval if user is authenticated
		if (user) {
			// Check immediately
			const isValid = checkTokenExpiration();

			if (isValid) {
				// Set up interval to check every minute
				const interval = setInterval(checkTokenExpiration, 60000);
				return () => clearInterval(interval);
			}
		}
	}, [user]);

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
		<AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
