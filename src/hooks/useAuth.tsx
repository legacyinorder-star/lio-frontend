import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { getUserDetails, setUserDetails, removeAuthData } from "@/utils/auth";

interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	token: string;
}

interface AuthContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	setUser: () => {},
	logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		// Load user from localStorage on initial render
		const userDetails = getUserDetails();
		if (userDetails) {
			setUser({
				id: userDetails.id,
				email: userDetails.email,
				first_name: userDetails.first_name || "",
				last_name: userDetails.last_name || "",
				token: localStorage.getItem("authToken") || "",
			});
		}
	}, []);

	// Logout function to clear auth data
	const logout = () => {
		setUser(null);
		removeAuthData();
	};

	useEffect(() => {
		// Save user to localStorage whenever it changes
		if (user) {
			setUserDetails({
				id: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
			});
			localStorage.setItem("authToken", user.token);
		}
	}, [user]);

	return (
		<AuthContext.Provider value={{ user, setUser, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
