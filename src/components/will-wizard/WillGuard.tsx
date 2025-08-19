import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWill } from "@/context/WillContext";
import { QuestionType } from "./types/will.types";

interface WillGuardProps {
	children: React.ReactNode;
	currentStep: QuestionType;
}

export default function WillGuard({ children, currentStep }: WillGuardProps) {
	const navigate = useNavigate();
	const { activeWill } = useWill();

	useEffect(() => {
		// Only check for active will on steps other than the personalInfo step
		if (currentStep !== "personalInfo" && !activeWill?.id) {
			console.log("❌ WillGuard: No active will found for step:", currentStep);
			navigate("/app/create-will/personalInfo");
		}
	}, [activeWill, navigate, currentStep]);

	// Don't render children if there's no active will (except for personalInfo step)
	if (currentStep !== "personalInfo" && !activeWill?.id) {
		return null;
	}

	return <>{children}</>;
}
