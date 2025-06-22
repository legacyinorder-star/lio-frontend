import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "sonner";
import SignUpPage from "@/pages/SignUpPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import WillWizard from "@/components/will-wizard/WillWizard";
import RequestPasswordResetPage from "@/pages/RequestPasswordResetPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./hooks/useAuth";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import ManageUsersPage from "@/pages/admin/ManageUsersPage";
import UserDetailPage from "@/pages/admin/UserDetailPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import ManageDocumentsPage from "@/pages/admin/ManageDocumentsPage";
import LogoutPage from "@/pages/LogoutPage";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import { WillProvider } from "@/context/WillContext";
import { RelationshipsProvider } from "@/context/RelationshipsContext";
import { DataLoadingProvider } from "@/context/DataLoadingContext";
import PaymentPage from "@/pages/PaymentPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentCancelPage from "@/pages/PaymentCancelPage";
import StripeCheckoutPage from "@/pages/StripeCheckoutPage";
import WillSuccessPage from "@/pages/WillSuccessPage";
import RateLimitTestPage from "@/pages/RateLimitTestPage";

function App() {
	return (
		<AuthProvider>
			<WillProvider>
				<RelationshipsProvider>
					<DataLoadingProvider>
						<Router>
							<Routes>
								<Route
									path="/"
									element={
										<PublicRoute>
											<HomePage />
										</PublicRoute>
									}
								/>
								<Route
									path="/signup"
									element={
										<PublicRoute>
											<SignUpPage />
										</PublicRoute>
									}
								/>
								<Route
									path="/login"
									element={
										<PublicRoute>
											<LoginPage />
										</PublicRoute>
									}
								/>
								<Route path="/logout" element={<LogoutPage />} />
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
										<ProtectedRoute requiredRole="admin">
											<AdminLayout />
										</ProtectedRoute>
									}
								>
									<Route path="users" element={<ManageUsersPage />} />
									<Route path="users/:userId" element={<UserDetailPage />} />
									<Route path="documents" element={<ManageDocumentsPage />} />
									<Route path="dashboard" element={<AdminDashboardPage />} />
								</Route>
								<Route
									path="/request-password-reset"
									element={
										<PublicRoute>
											<RequestPasswordResetPage />
										</PublicRoute>
									}
								/>
								<Route
									path="/reset-password"
									element={
										<PublicRoute>
											<ResetPasswordPage />
										</PublicRoute>
									}
								/>
								<Route
									path="/verify-otp"
									element={
										<PublicRoute>
											<OTPVerificationPage />
										</PublicRoute>
									}
								/>

								{/* Payment Routes */}
								<Route
									path="/app/payment"
									element={
										<ProtectedRoute>
											<PaymentPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/app/payment/checkout"
									element={
										<ProtectedRoute>
											<StripeCheckoutPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/app/payment/success"
									element={
										<ProtectedRoute>
											<PaymentSuccessPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/app/payment/cancel"
									element={
										<ProtectedRoute>
											<PaymentCancelPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/app/will-wizard/success"
									element={
										<ProtectedRoute>
											<WillSuccessPage />
										</ProtectedRoute>
									}
								/>

								{/* 404 - This must be the last route to catch all unknown URLs */}
								<Route
									path="/rate-limit-test"
									element={<RateLimitTestPage />}
								/>
								<Route path="*" element={<NotFoundPage />} />
							</Routes>
							<Toaster />
						</Router>
					</DataLoadingProvider>
				</RelationshipsProvider>
			</WillProvider>
		</AuthProvider>
	);
}

export default App;
