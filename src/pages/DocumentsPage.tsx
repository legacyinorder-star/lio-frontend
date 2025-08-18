import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
	const navigate = useNavigate();

	// Load documents from API
	useEffect(() => {
		const userDetails = getUserDetails();
		if (!userDetails) {
			navigate("/login");
			return;
		}

		// For now, just set loading to false since we're not displaying documents
		// This can be expanded later when document functionality is added back
	}, [navigate]);

	const handleContinueWill = () => {
		navigate("/app/create-will");
	};

	const handleContinueLetter = () => {
		navigate("/app/letter-of-wishes");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-[2rem] font-[500] text-black">Your Documents</h1>
					<p className="text-[#545454] font-[400] text-[1rem]">
						Continue where you left off or create a new document.
					</p>
				</div>
			</div>

			{/* Two Cards Side by Side */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-2/4">
				{/* Will Card */}
				<Card
					className="p-6 w-full"
					style={{
						borderRadius: "0.5rem",
						background: "#FFF",
						boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.15)",
					}}
				>
					{/* Document Type Badge */}
					<div
						className="flex items-center space-x-2 text-white text-sm font-medium mb-6 w-fit"
						style={{
							padding: "0.25rem 0.5rem",
							borderRadius: "0.25rem",
							background:
								"linear-gradient(99deg, #024048 42.51%, #1184C1 94.43%)",
						}}
					>
						<FileText className="w-4 h-4" />
						<span>Will</span>
					</div>

					<div className="flex flex-col h-full">
						{/* Header */}
						<div className="flex items-center space-x-4 mb-14">
							<div>
								<h3 className="text-2xl font-semibold text-[#173C37]">Will</h3>
								<p className="text-[#909090] text-sm">
									Last edited 12th August 2025
								</p>
							</div>
						</div>

						{/* Progress Section */}
						<div className="mb-14">
							<div className="flex justify-between items-center mb-2">
								<span className="text-[0.875rem] font-medium text-[#6D6C6C]">
									2/4 sections complete
								</span>
							</div>
							<div
								className="w-full h-2 rounded"
								style={{
									borderRadius: "0.25rem",
									background:
										"linear-gradient(90deg, #A2DD16 0%, #4A8607 100%)",
								}}
							></div>
						</div>
						<div className="flex justify-between items-center">
							<div>
								<h5 className="text-sm text-[#909090] font-[400]">
									Next section
								</h5>
								<p className="text-sm text-[#173C37] font-[500]">
									Personal Details
								</p>
							</div>
							<div>
								<Button
									onClick={handleContinueWill}
									className="text-sm font-medium text-[#173C37]"
								>
									Continue
								</Button>
							</div>
						</div>
					</div>
				</Card>

				{/* Letter of Wishes Card */}
				<Card
					className="p-6 w-full"
					style={{
						borderRadius: "0.5rem",
						background: "#FFF",
						boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.15)",
					}}
				>
					{/* Document Type Badge */}
					<div
						className="flex items-center space-x-2 text-white text-sm font-medium mb-4 w-fit"
						style={{
							padding: "0.25rem 0.5rem",
							borderRadius: "0.25rem",
							background:
								"linear-gradient(99deg, #482B02 42.51%, #C17E11 94.43%)",
						}}
					>
						<FileText className="w-4 h-4" />
						<span>Letter of Wishes</span>
					</div>

					<div className="flex flex-col h-full">
						{/* Header */}
						<div className="flex items-center space-x-4 mb-4">
							<div>
								<h3 className="text-2xl font-semibold text-[#173C37]">
									Letter of Wishes
								</h3>
								<p className="text-[#909090] text-sm">
									Last edited 12th August 2025
								</p>
							</div>
						</div>

						{/* Progress Section */}
						<div className="mb-4">
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium text-[#173C37]">
									2/4 sections complete
								</span>
							</div>
							<div
								className="w-full h-2 rounded"
								style={{
									borderRadius: "0.25rem",
									background:
										"linear-gradient(90deg, #A2DD16 0%, #4A8607 100%)",
								}}
							></div>
						</div>
						<div className="flex justify-between items-center mt-4">
							<span className="text-[0.875rem] font-medium text-[#6D6C6C]">
								Next section:
							</span>
							<Button
								onClick={handleContinueLetter}
								className="text-sm font-medium text-[#173C37]"
							>
								Continue
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
