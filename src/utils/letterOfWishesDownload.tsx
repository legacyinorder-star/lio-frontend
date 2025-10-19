import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import LetterOfWishesPDF from "@/components/letter-wizard/LetterOfWishesPDF";
import { LetterOfWishesData } from "@/context/LetterOfWishesContext";
import { WillData } from "@/context/WillContext";

/**
 * Generate and download a Letter of Wishes PDF
 */
export const downloadLetterOfWishesPDF = async (
	letterData: LetterOfWishesData,
	willData: WillData,
	willOwnerName?: string
): Promise<boolean> => {
	try {
		console.log("🔄 Starting Letter of Wishes PDF generation...");
		console.log("📋 Letter data received:", letterData);
		console.log("👤 Will owner name:", willOwnerName);

		// Generate PDF using JSX
		console.log("🔄 Creating PDF document...");
		const pdfDoc = pdf(
			<LetterOfWishesPDF
				data={letterData}
				willData={willData}
				willOwnerName={willOwnerName}
			/>
		);
		console.log("✅ PDF document created successfully");

		try {
			// First try to get the blob directly
			console.log("🔄 Generating PDF blob...");
			const blob = await pdfDoc.toBlob();

			// Verify blob is valid
			if (!(blob instanceof Blob) || blob.size === 0) {
				throw new Error("Generated PDF is invalid");
			}

			console.log("✅ PDF blob generated successfully, size:", blob.size);

			// Create download link
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;

			// Generate filename
			const ownerName = willOwnerName || "letter-of-wishes";
			const filename = `letter-of-wishes-${ownerName
				.toLowerCase()
				.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

			link.download = filename;
			console.log("📁 Downloading file as:", filename);

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up
			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 100);

			console.log("✅ Letter of Wishes PDF downloaded successfully");
			toast.success("Letter of Wishes PDF downloaded successfully");
			return true;
		} catch (blobError) {
			console.error(
				"❌ Direct blob generation failed, trying buffer:",
				blobError
			);
			try {
				// If direct blob generation fails, try using buffer
				console.log("🔄 Trying buffer method...");
				const buffer = await pdfDoc.toBuffer();
				const blob = new Blob([buffer as unknown as BlobPart], {
					type: "application/pdf",
				});
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;

				// Generate filename
				const ownerName = willOwnerName || "letter-of-wishes";
				const filename = `letter-of-wishes-${ownerName
					.toLowerCase()
					.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

				link.download = filename;
				console.log("📁 Downloading file as (buffer method):", filename);

				// Trigger download
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				// Clean up
				setTimeout(() => {
					URL.revokeObjectURL(url);
				}, 100);

				console.log(
					"✅ Letter of Wishes PDF downloaded successfully (buffer method)"
				);
				toast.success("Letter of Wishes PDF downloaded successfully");
				return true;
			} catch (bufferError) {
				console.error("❌ Buffer generation failed:", bufferError);
				throw new Error("Failed to generate PDF document");
			}
		}
	} catch (error) {
		console.error("❌ Error downloading Letter of Wishes PDF:", error);
		toast.error(
			"Failed to generate PDF. Please try again or contact support if the issue persists."
		);
		return false;
	}
};
