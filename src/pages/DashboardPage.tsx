import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { getUserDetails } from "@/utils/auth";
import { useState, useEffect } from "react";
import { type WillData } from "@/context/WillContext";
import { apiClient } from "@/utils/apiClient";
import { mapWillDataFromAPI } from "@/utils/dataTransform";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

export default function DashboardPage() {
	const navigate = useNavigate();
	const [userName, setUserName] = useState<string>("");
	const [showVaultModal, setShowVaultModal] = useState(false);
	const [showUploadWillModal, setShowUploadWillModal] = useState(false);
	const [currentWill, setCurrentWill] = useState<WillData | null>(null);
	const [isLoadingWill, setIsLoadingWill] = useState(true);

	// Load will data directly from API
	const loadWillData = async () => {
		try {
			setIsLoadingWill(true);
			const { data, error } = await apiClient("/wills/get-user-active-will");

			if (error) {
				console.error("Error loading will data:", error);
				setCurrentWill(null);
				return;
			}

			// Handle both array and single object responses
			const willData = Array.isArray(data) ? data[0] : data;
			if (willData) {
				// Transform API data to camelCase format
				const transformedWillData = mapWillDataFromAPI(willData);
				setCurrentWill(transformedWillData);
			} else {
				setCurrentWill(null);
			}
		} catch (error) {
			console.error("Error loading will data:", error);
			toast.error("Failed to load will data");
			setCurrentWill(null);
		} finally {
			setIsLoadingWill(false);
		}
	};

	// Handler functions
	const handleEditWill = () => {
		if (currentWill) {
			// Navigate to the current step from progress
			const currentStep = currentWill.progress?.currentStep || "personalInfo";
			navigate(`/app/create-will/${currentStep}`);
		}
	};

	const handlePayAndSubmit = () => {
		if (currentWill) {
			// Navigate to payment page
			navigate(
				`/app/payment/checkout?willId=${currentWill.id}&description=Will Creation Service`
			);
		}
	};

	const handleDownloadWill = () => {
		if (currentWill) {
			// Navigate to will download page
			navigate(`/app/will/${currentWill.id}`);
		}
	};

	const handleStartLetterOfWishes = () => {
		navigate("/app/letter-of-wishes");
	};

	const handleUploadSignedWill = () => {
		setShowUploadWillModal(true);
	};

	// Determine button text and action based on will status and current step
	const getWillButtonInfo = () => {
		if (!currentWill) {
			return {
				text: "Start your Will",
				action: () => navigate("/app/create-will"),
				description:
					"Share personal guidance for your loved ones that complements your formal will.",
			};
		}

		const willStatus = currentWill.status;
		const currentStep = currentWill.progress?.currentStep;

		if (willStatus === "under review") {
			return {
				text: "Under Review",
				action: null,
				description:
					"Your Will is currently being reviewed by our legal team. We'll notify you once the review is complete.",
			};
		}

		if (willStatus === "in progress") {
			return {
				text: "Continue Will",
				action: handleEditWill,
				description:
					"Continue working on your Will where you left off. Complete your estate planning today.",
			};
		}

		if (willStatus === "draft" || currentStep === "review") {
			return {
				text: "Pay & Submit",
				action: handlePayAndSubmit,
				description:
					"Your Will is ready! Complete payment and submit for review.",
			};
		}

		if (willStatus === "completed") {
			return {
				text: "Download Will",
				action: handleDownloadWill,
				description:
					"Your Will is ready! You can download it for your records.",
			};
		}

		// Default fallback
		return {
			text: "Continue Will",
			action: handleEditWill,
			description:
				"Continue working on your will where you left off. Complete your estate planning today.",
		};
	};

	const willButtonInfo = getWillButtonInfo();

	const actions = [
		// Only show Will action if not under review
		{
			title: "Will",
			description: willButtonInfo.description,
			href: "/app/create-will",
			action: willButtonInfo.text,
			onClick: willButtonInfo.action,
			disabled: willButtonInfo.action === null, // Disable if under review
		},
		{
			title: "Letter of Wishes",
			description:
				"Share personal guidance for your loved ones that complements your formal Will.",
			href: "/app/letter-of-wishes",
			action: "Add a Letter of Wishes",
			onClick: handleStartLetterOfWishes,
			disabled: currentWill?.status !== "completed", // Only enable when Will is completed
		},
		// Only show upload will card when will is completed
		...(currentWill?.status === "completed"
			? [
					{
						title: "Upload Signed Will",
						description:
							"Upload your signed Will document to the Legacy Vault for secure storage and easy access.",
						href: "#",
						action: "Upload to Vault",
						onClick: handleUploadSignedWill,
						disabled: false,
					},
			  ]
			: []),
	];

	useEffect(() => {
		const userDetails = getUserDetails();
		if (!userDetails) {
			navigate("/login");
			return;
		}

		const name = userDetails.first_name || userDetails.email.split("@")[0];
		setUserName(name);
	}, [navigate]);

	// Load will data on component mount
	useEffect(() => {
		loadWillData();
	}, []);

	// Show loading state if will data is loading
	if (isLoadingWill) {
		return (
			<div className="space-y-8 min-h-screen flex flex-col">
				<div
					id="dashboard-header"
					className="flex flex-col items-start justify-between p-8 ps-14 rounded-lg bg-primary relative"
					style={{
						backgroundImage: `url('/svgs/dashboard_icons/dashboard_card_top_left.svg')`,
						backgroundRepeat: "no-repeat",
						backgroundPosition: "left center",
						backgroundSize: "auto 100%",
					}}
				>
					<h1 className="text-[2.625rem] font-semibold text-white">
						Welcome, {userName}
					</h1>
					<p className="text-white text-sm font-normal mt-2">
						Let's get your legacy in order
					</p>

					<div
						className="bg-white rounded-lg p-6 mt-6 w-2/3 flex items-center justify-center"
						style={{
							boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.15)",
						}}
					>
						<LoadingSpinner message="Loading your will data..." />
					</div>

					{/* Bottom right corner SVG */}
					<img
						src="/svgs/dashboard_icons/dashboard_card_right_corner.svg"
						alt=""
						className="absolute bottom-0 right-0 w-48 h-48 opacity-90"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 min-h-screen flex flex-col">
			<div
				id="dashboard-header"
				className="flex flex-col items-start justify-between p-8 ps-14 rounded-lg bg-primary relative"
				style={{
					backgroundImage: `url('/svgs/dashboard_icons/dashboard_card_top_left.svg')`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "left center",
					backgroundSize: "auto 100%",
				}}
			>
				<h1 className="text-[2.625rem] font-semibold text-white">
					Welcome, {userName}
				</h1>
				<p className="text-white text-sm font-normal mt-2">
					Let's get your legacy in order
				</p>

				<div
					className="bg-white rounded-lg p-6 mt-6 w-2/3"
					style={{
						boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.15)",
						backgroundImage: "url('/images/LIOIllustration.png')",
						backgroundRepeat: "no-repeat",
						backgroundPosition: "right center",
						backgroundSize: "auto 100%",
					}}
				>
					<h3 className="text-[1.25rem] font-semibold text-black mb-2">
						{currentWill?.status === "completed"
							? "Letter of Wishes"
							: "Your Will"}
					</h3>
					<p className="text-black font-normal text-sm mb-4">
						{!currentWill
							? "Get started with your Will"
							: currentWill.status === "completed"
							? "Your Will is complete! Consider adding a letter of wishes to provide personal guidance for your loved ones."
							: willButtonInfo.description}
					</p>
					<Button
						onClick={
							currentWill?.status === "completed"
								? handleStartLetterOfWishes
								: willButtonInfo.action || undefined
						}
						disabled={
							currentWill?.status === "completed"
								? false
								: willButtonInfo.action === null
						}
						className="bg-primary hover:bg-primary/90 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{currentWill?.status === "completed"
							? "Start Letter of Wishes"
							: willButtonInfo.text}
						{!currentWill && (
							<svg
								width="20"
								height="8"
								viewBox="0 0 20 8"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="ml-2 w-6 h-auto"
							>
								<path
									d="M19.3536 4.45707C19.5488 4.26181 19.5488 3.94523 19.3536 3.74996L16.1716 0.567983C15.9763 0.372721 15.6597 0.372721 15.4645 0.567983C15.2692 0.763245 15.2692 1.07983 15.4645 1.27509L18.2929 4.10352L15.4645 6.93194C15.2692 7.12721 15.2692 7.44379 15.4645 7.63905C15.6597 7.83431 15.9763 7.83431 16.1716 7.63905L19.3536 4.45707ZM0 4.10352L-4.37114e-08 4.60352L19 4.60352L19 4.10352L19 3.60352L4.37114e-08 3.60352L0 4.10352Z"
									fill="currentColor"
								/>
							</svg>
						)}
					</Button>
				</div>

				{/* Bottom right corner SVG */}
				<img
					src="/svgs/dashboard_icons/dashboard_card_right_corner.svg"
					alt=""
					className="absolute bottom-0 right-0 w-48 h-48 opacity-90"
				/>
			</div>

			<div>
				<h2 className="font-semibold mt-6 mb-6">Quick Links</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{actions.map((action) => (
						<div
							key={action.title}
							onClick={
								!action.disabled
									? action.onClick ||
									  (() => navigate(action.href || "/app/create-will"))
									: undefined
							}
							className={`block transition-transform ${
								!action.disabled
									? "hover:scale-105 cursor-pointer"
									: "cursor-not-allowed opacity-60"
							}`}
						>
							<Card
								className="p-8 h-full rounded-lg bg-white"
								style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.10)" }}
							>
								<div>
									<h3 className="text-[1.25rem] font-semibold text-black mb-2">
										{action.title}
									</h3>
									<p className="text-sm font-[400] text-muted-foreground mb-6">
										{action.description}
									</p>
									<div
										className={`flex items-center text-sm font-semibold ${
											!action.disabled
												? "text-primary hover:text-primary/80 transition-colors"
												: "text-gray-400"
										}`}
									>
										{action.action}
										{!action.disabled && (
											<svg
												width="20"
												height="8"
												viewBox="0 0 20 8"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
												className="ml-2 w-6 h-auto"
											>
												<path
													d="M19.3536 4.45707C19.5488 4.26181 19.5488 3.94523 19.3536 3.74996L16.1716 0.567983C15.9763 0.372721 15.6597 0.372721 15.4645 0.567983C15.2692 0.763245 15.2692 1.07983 15.4645 1.27509L18.2929 4.10352L15.4645 6.93194C15.2692 7.12721 15.2692 7.44379 15.4645 7.63905C15.6597 7.83431 15.9763 7.83431 16.1716 7.63905L19.3536 4.45707ZM0 4.10352L-4.37114e-08 4.60352L19 4.60352L19 4.10352L19 3.60352L4.37114e-08 3.60352L0 4.10352Z"
													fill="currentColor"
												/>
											</svg>
										)}
									</div>
								</div>
							</Card>
						</div>
					))}
				</div>
			</div>

			{/* Bottom Cards - Pushed to bottom */}
			<div className="mt-auto mb-32">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Left Card - Black Background */}
					<div className="rounded-[0.5rem] p-8 text-white bg-primary">
						<h3 className="text-[1.5rem] text-white font-semibold mb-2">
							Try out the Legacy Vault
						</h3>
						<p className="text-white text-sm mb-16 font-normal leading-relaxed">
							The Legacy Vault is a new way for you to manage all you important
							documents, all in one place.
						</p>
						<div
							onClick={() => setShowVaultModal(true)}
							className="flex items-center text-white cursor-pointer hover:text-gray-300 transition-colors"
						>
							<span className="text-sm font-semibold">Get Started</span>
							<svg
								width="20"
								height="8"
								viewBox="0 0 20 8"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="ml-2 w-6 h-auto"
							>
								<path
									d="M19.3536 4.45707C19.5488 4.26181 19.5488 3.94523 19.3536 3.74996L16.1716 0.567983C15.9763 0.372721 15.6597 0.372721 15.4645 0.567983C15.2692 0.763245 15.2692 1.07983 15.4645 1.27509L18.2929 4.10352L15.4645 6.93194C15.2692 7.12721 15.2692 7.44379 15.4645 7.63905C15.6597 7.83431 15.9763 7.83431 16.1716 7.63905L19.3536 4.45707ZM0 4.10352L-4.37114e-08 4.60352L19 4.60352L19 4.10352L19 3.60352L4.37114e-08 3.60352L0 4.10352Z"
									fill="currentColor"
								/>
							</svg>
						</div>
					</div>

					{/* Right Card - Light Gray Background */}
					<div
						className="rounded-[0.5rem] p-8"
						style={{ backgroundColor: "#FAFAFA" }}
					>
						<div className="flex items-center mb-6">
							<img
								src="/svgs/green_shield.svg"
								alt="Security shield"
								className="h-12 w-auto mr-4"
							/>
							<div>
								<h4 className="font-semibold text-[1.25rem] text-black">
									100% Secure
								</h4>
								<p
									className="text-[0.875rem] font-normal"
									style={{ color: "#545454" }}
								>
									Your data is protected with 256-bit encryption
								</p>
							</div>
						</div>

						<p className="text-sm font-semibold text-primary mt-20">
							Learn how we keep you safe
						</p>
					</div>
				</div>
			</div>

			<Dialog open={showVaultModal} onOpenChange={setShowVaultModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Legacy Vault Coming Soon</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						The Legacy Vault feature is under development.
					</p>
					<p className="text-sm text-muted-foreground">
						We'll notify you when it's ready.
					</p>
					<Button
						onClick={() => setShowVaultModal(false)}
						className="mt-4 text-white"
					>
						Close
					</Button>
				</DialogContent>
			</Dialog>

			{/* Upload Signed Will Modal */}
			<Dialog open={showUploadWillModal} onOpenChange={setShowUploadWillModal}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Upload Signed Will</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Upload your signed Will document to the Legacy Vault for secure
							storage.
						</p>
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
							<div className="space-y-2">
								<div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
									<svg
										className="w-6 h-6 text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										/>
									</svg>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-900">
										Click to upload or drag and drop
									</p>
									<p className="text-xs text-gray-500">
										PDF files only (max 10MB)
									</p>
								</div>
							</div>
							<input
								type="file"
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								accept=".pdf"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										toast.success(`Selected: ${file.name}`);
										// TODO: Implement actual file upload logic
									}
								}}
							/>
						</div>
						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => setShowUploadWillModal(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									toast.info("Upload functionality coming soon!");
									setShowUploadWillModal(false);
								}}
								className="bg-primary hover:bg-primary/90 text-white"
							>
								Upload
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
