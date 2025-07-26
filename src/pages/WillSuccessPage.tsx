import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight } from "lucide-react";
import { useState } from "react";
import { smartDownloadWill } from "@/utils/willSmartDownload";
import { useWill } from "@/context/WillContext";
import { toast } from "sonner";

export default function WillSuccessPage() {
	const navigate = useNavigate();
	const [isDownloading, setIsDownloading] = useState(false);
	const { activeWill } = useWill();

	const handleDownloadWill = async () => {
		if (!activeWill) {
			toast.error("No will found to download");
			return;
		}

		setIsDownloading(true);
		try {
			await smartDownloadWill(activeWill);
		} catch (error) {
			console.error("Error downloading will:", error);
			toast.error("Failed to download will. Please try again.");
		} finally {
			setIsDownloading(false);
		}
	};

	const handleGoToDashboard = () => {
		navigate("/app/dashboard");
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="max-w-md mx-auto">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
					<CardTitle className="text-2xl text-green-600">
						Will Created Successfully!
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-center space-y-2">
						<p className="text-lg font-medium">Congratulations!</p>
						<p className="text-muted-foreground">
							Your will has been submitted for review. Our legal team will
							review your will and contact you once it's ready for download.
						</p>
					</div>

					<div className="space-y-3">
						<Button
							onClick={handleDownloadWill}
							disabled={isDownloading}
							className="w-full bg-primary hover:bg-primary/90 text-white"
						>
							<Download className="mr-2 h-4 w-4" />
							{isDownloading ? "Generating PDF..." : "Download Your Will"}
						</Button>

						<Button
							variant="outline"
							onClick={handleGoToDashboard}
							className="w-full"
						>
							<ArrowRight className="mr-2 h-4 w-4" />
							Go to Dashboard
						</Button>
					</div>

					<div className="text-center">
						<p className="text-xs text-muted-foreground">
							Your will has been saved securely and you can track its review
							status from your dashboard.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
