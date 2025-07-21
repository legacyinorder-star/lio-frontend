import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useWill } from "@/context/WillContext";
import { useWillData } from "@/hooks/useWillData";
import { toast } from "sonner";

export interface DigitalAssetsStepProps {
	onNext?: () => void;
	onBack?: () => void;
}

const DigitalAssetsStep: React.FC<DigitalAssetsStepProps> = ({
	onNext,
	onBack,
}) => {
	const { activeWill, setActiveWill } = useWill();
	const { allBeneficiaries } = useWillData();
	const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	// Load existing digital assets beneficiary on component mount
	useEffect(() => {
		if (activeWill?.digitalAssets?.beneficiaryId) {
			setSelectedBeneficiary(activeWill.digitalAssets.beneficiaryId);
		}
	}, [activeWill?.digitalAssets?.beneficiaryId]);

	const handleNext = async () => {
		if (!selectedBeneficiary) {
			toast.error("Please select a beneficiary for your digital assets");
			return;
		}

		setIsLoading(true);
		try {
			if (activeWill) {
				setActiveWill({
					...activeWill,
					digitalAssets: {
						beneficiaryId: selectedBeneficiary,
					},
				});
			}
			toast.success("Digital assets beneficiary saved");
			onNext?.();
		} catch (error) {
			console.error("Error saving digital assets:", error);
			toast.error("Failed to save digital assets beneficiary");
		} finally {
			setIsLoading(false);
		}
	};

	const getBeneficiaryDisplayName = (beneficiaryId: string) => {
		const beneficiary = allBeneficiaries.find((b) => b.id === beneficiaryId);
		if (!beneficiary) return "Unknown Beneficiary";

		return `${beneficiary.firstName} ${beneficiary.lastName} (${beneficiary.relationship})`;
	};

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Header */}
			<div className="text-center space-y-4">
				<h1 className="text-3xl font-bold text-gray-900">Digital Assets</h1>
				<p className="text-lg text-gray-600 max-w-2xl mx-auto">
					Specify who should inherit your digital assets, including online
					accounts, digital files, cryptocurrencies, and other digital property.
				</p>
			</div>

			{/* Main Content */}
			<Card className="w-full">
				<CardHeader>
					<CardTitle className="text-xl font-semibold text-gray-900">
						Digital Assets Beneficiary
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="digital-assets-beneficiary"
								className="text-base font-medium"
							>
								Who should inherit your digital assets?
							</Label>
							<p className="text-sm text-gray-600">
								This includes your online accounts, digital files,
								cryptocurrencies, social media accounts, and other digital
								property.
							</p>
						</div>

						<Select
							value={selectedBeneficiary}
							onValueChange={setSelectedBeneficiary}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a beneficiary for your digital assets" />
							</SelectTrigger>
							<SelectContent>
								{allBeneficiaries.map((beneficiary) => (
									<SelectItem key={beneficiary.id} value={beneficiary.id}>
										{getBeneficiaryDisplayName(beneficiary.id)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{selectedBeneficiary && (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h4 className="font-medium text-blue-900 mb-2">
									Selected Beneficiary
								</h4>
								<p className="text-blue-800">
									{getBeneficiaryDisplayName(selectedBeneficiary)} will inherit
									all your digital assets.
								</p>
							</div>
						)}
					</div>

					{/* Information Box */}
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
						<h4 className="font-medium text-gray-900 mb-2">
							What are Digital Assets?
						</h4>
						<ul className="text-sm text-gray-700 space-y-1">
							<li>• Online banking and financial accounts</li>
							<li>
								• Social media accounts (Facebook, Instagram, Twitter, etc.)
							</li>
							<li>• Email accounts and cloud storage</li>
							<li>• Cryptocurrencies and digital wallets</li>
							<li>• Digital photos, videos, and documents</li>
							<li>• Online subscriptions and memberships</li>
							<li>• Domain names and websites</li>
							<li>• Digital music, books, and media collections</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			{/* Navigation Buttons */}
			<div className="flex justify-between pt-8 border-t border-gray-200">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					className="cursor-pointer px-8 py-3"
				>
					Back
				</Button>
				<Button
					type="button"
					onClick={handleNext}
					disabled={!selectedBeneficiary || isLoading}
					className="cursor-pointer bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium"
				>
					{isLoading ? "Saving..." : "Continue"}
				</Button>
			</div>
		</div>
	);
};

export default DigitalAssetsStep;
