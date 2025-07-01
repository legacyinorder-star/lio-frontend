import { Button } from "@/components/ui/button";
import { ArrowLeft, Vault, Clock, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export default function VaultComingSoonPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleNotifySubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) {
			toast.error("Please enter your email address");
			return;
		}

		if (!email.includes("@") || !email.includes(".")) {
			toast.error("Please enter a valid email address");
			return;
		}

		setIsSubmitting(true);

		// Simulate API call
		setTimeout(() => {
			toast.success("Thank you! We'll notify you when the vault is ready.");
			setEmail("");
			setIsSubmitting(false);
		}, 1000);
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ backgroundColor: "#FAFAFA" }}
		>
			<div className="max-w-2xl mx-auto text-center space-y-8">
				{/* Icon */}
				<div className="flex justify-center">
					<div
						className="w-24 h-24 rounded-full flex items-center justify-center"
						style={{ backgroundColor: "#173C37" }}
					>
						<Vault className="w-12 h-12 text-white" />
					</div>
				</div>

				{/* Main Content */}
				<div className="space-y-4">
					<h1 className="text-4xl font-bold text-black">My Vault</h1>
					<h2 className="text-2xl font-semibold" style={{ color: "#173C37" }}>
						Coming Soon
					</h2>
					<p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
						We're building something amazing for you. The Legacy Vault will be
						your secure, centralized location for managing all your important
						documents and digital assets.
					</p>
				</div>

				{/* Features Preview */}
				<div className="grid md:grid-cols-2 gap-6 mt-12">
					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="font-semibold text-black mb-2">
							Secure Document Storage
						</h3>
						<p className="text-sm text-muted-foreground">
							Store and organize all your important documents with bank-level
							security and encryption.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 className="font-semibold text-black mb-2">
							Digital Asset Management
						</h3>
						<p className="text-sm text-muted-foreground">
							Manage your digital assets, passwords, and online accounts for
							your beneficiaries.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<h3 className="font-semibold text-black mb-2">
							Family Access Control
						</h3>
						<p className="text-sm text-muted-foreground">
							Control who can access what information and when, ensuring your
							legacy is protected.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
							<Clock className="w-6 h-6 text-orange-600" />
						</div>
						<h3 className="font-semibold text-black mb-2">
							Time Capsule Features
						</h3>
						<p className="text-sm text-muted-foreground">
							Schedule messages and documents to be shared with loved ones at
							specific times or events.
						</p>
					</div>
				</div>

				{/* Notification Signup */}
				<div className="bg-white p-8 rounded-lg shadow-sm border mt-12">
					<div className="flex items-center justify-center mb-4">
						<Bell className="w-6 h-6 text-blue-600 mr-2" />
						<h3 className="text-lg font-semibold text-black">
							Be the First to Know
						</h3>
					</div>
					<p className="text-muted-foreground mb-6">
						We'll notify you as soon as My Vault is ready. No spam, just updates
						on this exciting new feature.
					</p>
					<form
						onSubmit={handleNotifySubmit}
						className="flex gap-3 max-w-md mx-auto"
					>
						<input
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isSubmitting}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
						/>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-primary hover:bg-primary/90 text-white px-6 disabled:opacity-50"
							style={{ backgroundColor: "#173C37" }}
						>
							{isSubmitting ? "..." : "Notify Me"}
						</Button>
					</form>
				</div>

				{/* Back Button */}
				<div className="pt-8">
					<Button
						variant="outline"
						onClick={() => navigate("/app/dashboard")}
						className="cursor-pointer"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Dashboard
					</Button>
				</div>
			</div>
		</div>
	);
}
