import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "sonner";
import SignUpPage from "@/pages/SignUpPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import OTPVerificationPage from "./pages/OTPVerificationPage";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/signup" element={<SignUpPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route
					path="/app/dashboard"
					element={
						<ProtectedRoute>
							<DashboardLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<DashboardPage />} />
				</Route>
				<Route path="/verify-otp" element={<OTPVerificationPage />} />
			</Routes>
			<Toaster />
		</Router>
	);
}

export default App;
