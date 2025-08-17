import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadLetterOfWishesPDF } from "@/utils/letterOfWishesDownload";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { useWill } from "@/context/WillContext";

export default function LetterOfWishesSuccessPage() {
	const navigate = useNavigate();
	const [isDownloading, setIsDownloading] = useState(false);

	const { letterData } = useLetterOfWishes();
	const { activeWill } = useWill();

	useEffect(() => {
		if (!letterData) {
			toast.error("Letter of Wishes data not available. Please try again.");
			navigate("/app/dashboard");
			return;
		}
	}, [letterData, navigate]);

	const handleDownloadPDF = async () => {
		if (!letterData || !activeWill) {
			toast.error("Letter of Wishes data not available. Please try again.");
			return;
		}

		setIsDownloading(true);
		try {
			const willOwnerName = activeWill.owner
				? `${activeWill.owner.firstName} ${activeWill.owner.lastName}`
				: undefined;

			console.log("🔄 Generating Letter of Wishes PDF...");
			const pdfResult = await downloadLetterOfWishesPDF(
				letterData,
				activeWill,
				willOwnerName
			);

			if (pdfResult) {
				console.log("✅ Letter of Wishes PDF downloaded successfully");
				toast.success("Letter of Wishes PDF downloaded successfully!");
			} else {
				console.error("❌ Failed to generate Letter of Wishes PDF");
				toast.error("Failed to generate PDF. Please try again.");
			}
		} catch (error) {
			console.error("❌ Error generating Letter of Wishes PDF:", error);
			toast.error("Failed to generate PDF. Please try again.");
		} finally {
			setIsDownloading(false);
		}
	};

	const handleGoToDashboard = () => {
		navigate("/app/dashboard");
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
					<CardTitle className="text-2xl font-bold text-gray-900">
						Letter of Wishes Completed!
					</CardTitle>
					<p className="text-gray-600 mt-2">
						Your Letter of Wishes has been successfully created and is now
						available for download.
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-center">
						<p className="text-gray-700 mb-4">
							Your Letter of Wishes contains all the important personal
							messages, instructions, and preferences you've specified. This
							document will help your loved ones understand your wishes and
							carry them out according to your preferences.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<Button
							onClick={handleDownloadPDF}
							disabled={isDownloading}
							className="flex-1 bg-primary hover:bg-primary/90 text-white"
						>
							{isDownloading ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white mr-2"></div>
									Generating PDF...
								</>
							) : (
								<>
									<Download className="mr-2 h-4 w-4" />
									Download PDF
								</>
							)}
						</Button>
						<Button
							onClick={handleGoToDashboard}
							variant="outline"
							className="flex-1"
						>
							<ArrowRight className="mr-2 h-4 w-4" />
							Go to Dashboard
						</Button>
					</div>

					<div className="text-center text-sm text-gray-500">
						<p>
							You can always access and download your Letter of Wishes from your
							dashboard.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
