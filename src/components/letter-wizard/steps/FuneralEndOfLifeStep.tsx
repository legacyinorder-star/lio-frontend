import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useLetterOfWishes } from "@/context/LetterOfWishesContext";
import { apiClient } from "@/utils/apiClient";

interface FuneralWishesApiResponse {
	id: string;
	created_at: string;
	wishes: "cremated" | "buried";
	will_id: string;
	user_id: string;
}

export default function FuneralEndOfLifeStep() {
	const { letterData, setLetterData, willData } = useLetterOfWishes();

	const [funeralWishes, setFuneralWishes] = useState<
		"cremated" | "buried" | null
	>(null);
	const [burialLocation, setBurialLocation] = useState(
		letterData?.funeralPreferences?.burialLocation || ""
	);
	const [serviceType, setServiceType] = useState<
		"religious" | "non-religious" | "private" | "public" | undefined
	>(letterData?.funeralPreferences?.serviceType);
	const [additionalPreferences, setAdditionalPreferences] = useState(
		letterData?.funeralPreferences?.additionalPreferences || ""
	);
	const [isLoadingFuneralData, setIsLoadingFuneralData] = useState(true);

	// Load funeral wishes from will
	useEffect(() => {
		const loadFuneralWishes = async () => {
			if (!willData?.id) return;

			try {
				const { data, error } = await apiClient(
					`/funeral-wishes/${willData.id}`
				);
				if (error) {
					console.error("Error loading funeral wishes:", error);
				} else {
					setFuneralWishes(data.wishes);
				}
			} catch (error) {
				console.error("Error loading funeral wishes:", error);
			} finally {
				setIsLoadingFuneralData(false);
			}
		};

		loadFuneralWishes();
	}, [willData?.id]);

	const hasFuneralPreferences =
		burialLocation.trim() || serviceType || additionalPreferences.trim();

	const updateFuneralPreferences = () => {
		if (setLetterData) {
			setLetterData({
				...letterData,
				funeralPreferences: {
					...letterData?.funeralPreferences,
					burialLocation: burialLocation.trim(),
					serviceType,
					additionalPreferences: additionalPreferences.trim(),
				},
			});
		}
	};

	return (
		<div className="space-y-6 w-full max-w-4xl">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Funeral & End-of-Life Preferences
			</div>
			<div className="text-muted-foreground">
				Specify your funeral and burial preferences to guide your loved ones.
			</div>

			{/* Funeral Wishes from Will */}
			{!isLoadingFuneralData && funeralWishes && (
				<div className="space-y-6">
					<div>
						<h6 className="font-semibold text-black mb-2 text-[1.1rem]">
							Funeral Wishes from Your Will
						</h6>
						<p className="text-black">
							Your Will indicates you wish to be{" "}
							<span className="font-medium">{funeralWishes}</span>.
						</p>
					</div>

					{/* Funeral Details Form */}
					<div className="space-y-6">
						{/* Burial/Cremation Location */}
						<div className="space-y-2">
							<Label htmlFor="burialLocation">
								Where would you like to be{" "}
								{funeralWishes === "cremated" ? "scattered/buried" : "buried"}?
							</Label>
							<Input
								id="burialLocation"
								placeholder={`e.g., ${
									funeralWishes === "cremated"
										? "Garden of remembrance, family plot, specific location"
										: "Family cemetery, specific cemetery, location"
								}`}
								value={burialLocation}
								onChange={(e) => setBurialLocation(e.target.value)}
								className="w-full"
							/>
						</div>

						{/* Service Type */}
						<div className="space-y-2">
							<Label htmlFor="serviceType">Type of Service</Label>
							<Select
								value={serviceType}
								onValueChange={(
									value: "religious" | "non-religious" | "private" | "public"
								) => setServiceType(value)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select service type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="religious">Religious Service</SelectItem>
									<SelectItem value="non-religious">
										Non-Religious Service
									</SelectItem>
									<SelectItem value="private">Private Service</SelectItem>
									<SelectItem value="public">Public Service</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Additional Preferences */}
						<div className="space-y-2">
							<Label htmlFor="additionalPreferences">
								Additional Preferences
							</Label>
							<Textarea
								id="additionalPreferences"
								placeholder="e.g., Specific music, readings, people to speak, flowers, dress code, etc."
								value={additionalPreferences}
								onChange={(e) => setAdditionalPreferences(e.target.value)}
								className="w-full min-h-[120px]"
							/>
						</div>

						{/* Save Button */}
						<Button
							onClick={updateFuneralPreferences}
							className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
						>
							Save Funeral Details
						</Button>
					</div>

					{/* Funeral Details Summary */}
					{hasFuneralPreferences && (
						<div className="bg-[#F8F8F8] border border-gray-300 rounded-[0.5rem] p-[1.5rem]">
							<div className="space-y-2">
								{burialLocation.trim() && (
									<div className="mb-4">
										<div className="font-semibold text-[0.875rem] text-[#212121] mb-1">
											Your preferred location
										</div>
										<div className="text-[0.875rem] text-[#212121] font-normal">
											{burialLocation}
										</div>
									</div>
								)}
								{serviceType && (
									<div className="mb-4">
										<div className="font-semibold text-[0.875rem] text-[#212121] mb-1">
											Service Type
										</div>
										<div className="text-[0.875rem] text-[#212121] font-normal capitalize">
											{serviceType.replace("-", " ")} Service
										</div>
									</div>
								)}
								{additionalPreferences.trim() && (
									<div className="mb-4">
										<div className="font-semibold text-[0.875rem] text-[#212121] mb-1">
											Additional Preferences
										</div>
										<div className="text-[0.875rem] text-[#212121] font-normal">
											{additionalPreferences}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
