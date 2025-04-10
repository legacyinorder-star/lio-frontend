import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "sonner";
import SignUpPage from "@/pages/SignUpPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import WillWizard from "@/components/will-wizard/WillWizard";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/signup" element={<SignUpPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route
					path="/app"
					element={
						<ProtectedRoute>
							<DashboardLayout />
						</ProtectedRoute>
					}
				>
					<Route path="dashboard" element={<DashboardPage />} />
					<Route path="create-will" element={<WillWizard />} />
				</Route>
				<Route path="/verify-otp" element={<OTPVerificationPage />} />
			</Routes>
			<Toaster />
		</Router>
	);
}

export default App;
