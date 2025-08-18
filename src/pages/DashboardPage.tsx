import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

import { getUserDetails } from "@/utils/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWill } from "@/context/WillContext";

export default function DashboardPage() {
	const navigate = useNavigate();
	const { activeWill } = useWill();
	const [userName, setUserName] = useState<string>("");

	// Handler functions
	const handleEditWill = () => {
		if (activeWill) {
			// Navigate to the current step from progress
			const currentStep = activeWill.progress?.currentStep || "name";
			navigate(`/app/create-will/${currentStep}`);
		}
	};

	useEffect(() => {
		const userDetails = getUserDetails();
		if (!userDetails) {
			navigate("/login");
			return;
		}

		const name = userDetails.first_name || userDetails.email.split("@")[0];
		setUserName(name);
	}, [navigate]);

	const actions = [
		{
			title: "Will",
			description: activeWill
				? "Continue working on your will where you left off. Complete your estate planning today."
				: "Share personal guidance for your loved ones that complements your formal will.",
			href: "/app/create-will",
			action: activeWill ? "Continue Will" : "Start your Will",
		},
		{
			title: "Letter of Wishes",
			description:
				"Share personal guidance for your loved ones that complements your formal will.",
			href: "/app/letter-of-wishes",
			action: "Add a Letter of Wishes",
		},
	];

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
					style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.15)" }}
				>
					<h3 className="text-[1.25rem] font-semibold text-black mb-2">
						Your Will
					</h3>
					<p className="text-black font-normal text-sm mb-4">
						{!activeWill
							? "Get started with your will"
							: "Continue where you left off. It only takes a few minutes to get started."}
					</p>
					<Button
						onClick={() => {
							if (activeWill) {
								handleEditWill();
							} else {
								navigate("/app/create-will");
							}
						}}
						className="bg-primary hover:bg-primary/90 text-white flex items-center justify-center"
					>
						{!activeWill ? (
							<>
								Start your Will
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
							</>
						) : (
							"Continue Will"
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
							onClick={() => {
								if (action.title === "Continue Your Will" && activeWill) {
									handleEditWill();
								} else {
									navigate(action.href || "/app/create-will");
								}
							}}
							className="block transition-transform hover:scale-105 cursor-pointer"
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
									<div className="flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
										{action.action}
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
							onClick={() => navigate("/app/vault")}
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
		</div>
	);
}
