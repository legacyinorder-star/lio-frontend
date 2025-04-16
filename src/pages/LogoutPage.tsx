import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function LogoutPage() {
	const navigate = useNavigate();
	const { logout } = useAuth();

	useEffect(() => {
		logout();
		toast.success("You have been logged out successfully");
		navigate("/login");
	}, [logout, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">Logging out...</h1>
				<p>You will be redirected to the login page.</p>
			</div>
		</div>
	);
}
