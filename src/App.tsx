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
import RequestPasswordResetPage from "@/pages/RequestPasswordResetPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./hooks/useAuth";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import ManageUsersPage from "./pages/admin/ManageUsersPage";

function App() {
	return (
		<AuthProvider>
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
						<Route path="manage-profile" element={<ProfilePage />} />
					</Route>
					<Route
						path="/admin"
						element={
							<ProtectedRoute>
								<AdminLayout />
							</ProtectedRoute>
						}
					>
						<Route path="users" element={<ManageUsersPage />} />
						<Route path="dashboard" element={<DashboardPage />} />
					</Route>
					<Route
						path="/request-password-reset"
						element={<RequestPasswordResetPage />}
					/>
					<Route path="/reset-password" element={<ResetPasswordPage />} />
					<Route path="/verify-otp" element={<OTPVerificationPage />} />
				</Routes>
				<Toaster />
			</Router>
		</AuthProvider>
	);
}

export default App;
