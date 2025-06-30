import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWill } from "@/context/WillContext";
import { toast } from "sonner";
import { QuestionType } from "./types/will.types";

interface WillGuardProps {
	children: React.ReactNode;
	currentStep: QuestionType;
}

export default function WillGuard({ children, currentStep }: WillGuardProps) {
	const navigate = useNavigate();
	const { activeWill } = useWill();

	useEffect(() => {
		// Only check for active will on steps other than the name step
		if (currentStep !== "name" && !activeWill?.id) {
			toast.error("No active will found. Please start by entering your name.");
			navigate("/app/dashboard");
		}
	}, [activeWill, navigate, currentStep]);

	// Don't render children if there's no active will (except for name step)
	if (currentStep !== "name" && !activeWill?.id) {
		return null;
	}

	// Map step to display information
	const getStepInfo = (
		step: QuestionType
	): { number: number; name: string } => {
		const stepMap: Record<QuestionType, { number: number; name: string }> = {
			name: { number: 1, name: "Personal Information" },
			address: { number: 2, name: "Address Information" },
			hasSpouse: { number: 3, name: "Spouse Information" },
			hasChildren: { number: 4, name: "Children Information" },
			guardians: { number: 5, name: "Guardians" },
			hasAssets: { number: 6, name: "Assets" },
			gifts: { number: 7, name: "Gifts" },
			residuary: { number: 8, name: "Residuary Estate" },
			executors: { number: 9, name: "Executors" },
			witnesses: { number: 10, name: "Witnesses" },
			funeralInstructions: { number: 11, name: "Funeral Instructions" },
			review: { number: 12, name: "Review" },
		};
		return stepMap[step];
	};

	const stepInfo = getStepInfo(currentStep);

	return (
		<>
			{/* Step Indicator */}
			<div
				className="w-full py-3 px-4 text-left text-sm mt-[-1.5rem] font-medium text-gray-800"
				style={{ backgroundColor: "#DFF2EB" }}
			>
				Section {stepInfo.number} of 12: {stepInfo.name}
			</div>
			{children}
		</>
	);
}
