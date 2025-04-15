import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	token: string;
	isAdmin?: boolean;
}

interface AuthContextType {
	user: User | null;
	setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		// Load user from localStorage on initial render
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	useEffect(() => {
		// Save user to localStorage whenever it changes
		if (user) {
			localStorage.setItem("user", JSON.stringify(user));
		} else {
			localStorage.removeItem("user");
		}
	}, [user]);

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
