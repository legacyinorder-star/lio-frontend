import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWill } from "@/context/WillContext";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { toast } from "sonner";

export default function LetterOfWishesPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { activeWill } = useWill();
	const {
		willData,
		setWillData,
		letterData,
		initializeLetterForWill,
		isLoading,
	} = useLetterOfWishes();

	const willId = searchParams.get("willId");

	useEffect(() => {
		// Check if we have a willId parameter
		if (!willId) {
			toast.error("No will specified for Letter of Wishes");
			navigate("/app/documents");
			return;
		}

		// If we have an active will and it matches the willId, use it
		if (activeWill && activeWill.id === willId) {
			setWillData(activeWill);
			initializeLetterForWill(willId);
		} else {
			toast.error("Please select a will first");
			navigate("/app/documents");
		}
	}, [willId, activeWill, setWillData, initializeLetterForWill, navigate]);

	if (isLoading || !willData || !letterData) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading Letter of Wishes...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-8 text-white">
				<h1 className="text-[2rem] font-semibold mb-2">Letter of Wishes</h1>
				<p className="text-purple-100">
					Create a personal letter to accompany the will for{" "}
					<span className="font-semibold">
						{willData.owner?.firstName} {willData.owner?.lastName}
					</span>
				</p>
			</div>

			{/* Content */}
			<div className="bg-white rounded-lg shadow-sm border p-8">
				<div className="text-center">
					<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-purple-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Coming Soon
					</h2>
					<p className="text-gray-600 mb-8 max-w-md mx-auto">
						The Letter of Wishes wizard is currently under development. This
						will allow you to create a personal letter to guide your loved ones
						alongside your formal will.
					</p>

					{/* Will Information Preview */}
					<div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
						<h3 className="font-semibold text-gray-900 mb-4">
							Will Information Available
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
							<div>
								<strong>Testator:</strong> {willData.owner?.firstName}{" "}
								{willData.owner?.lastName}
							</div>
							{willData.beneficiaries && willData.beneficiaries.length > 0 && (
								<div>
									<strong>Beneficiaries:</strong>{" "}
									{willData.beneficiaries.length} person(s)
								</div>
							)}
							{willData.executors && willData.executors.length > 0 && (
								<div>
									<strong>Executors:</strong> {willData.executors.length}{" "}
									person(s)
								</div>
							)}
							{willData.assets && willData.assets.length > 0 && (
								<div>
									<strong>Assets:</strong> {willData.assets.length} item(s)
								</div>
							)}
						</div>
					</div>

					<div className="mt-8">
						<button
							onClick={() => navigate("/app/documents")}
							className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
						>
							Back to Documents
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
