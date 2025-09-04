import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWill } from "@/context/WillContext";
import { QuestionType } from "./types/will.types";
import { toast } from "sonner";

interface WillGuardProps {
	children: React.ReactNode;
	currentStep: QuestionType;
}

export default function WillGuard({ children, currentStep }: WillGuardProps) {
	const navigate = useNavigate();
	const { activeWill } = useWill();

	useEffect(() => {
		// Check if will exists (except for personalInfo step which creates the will)
		if (currentStep !== "personalInfo" && !activeWill?.id) {
			console.log("❌ WillGuard: No active will found for step:", currentStep);
			navigate("/app/create-will/personalInfo");
			return;
		}

		// Check if will status allows editing
		if (activeWill?.id) {
			const protectedStatuses = ["under review", "completed", "submitted"];

			if (protectedStatuses.includes(activeWill.status)) {
				console.log(
					`🚫 WillGuard: Will editing blocked - status: ${activeWill.status}`
				);
				toast.error(
					`Cannot edit will: ${
						activeWill.status === "under review"
							? "Currently under review"
							: "Will is " + activeWill.status
					}`
				);
				navigate("/app/dashboard");
				return;
			}
		}
	}, [activeWill, navigate, currentStep]);

	// Don't render children if there's no active will (except for personalInfo step)
	if (currentStep !== "personalInfo" && !activeWill?.id) {
		return null;
	}

	// Don't render children if will is in protected status
	if (activeWill?.id) {
		const protectedStatuses = ["under review", "completed", "submitted"];
		if (protectedStatuses.includes(activeWill.status)) {
			return null;
		}
	}

	return <>{children}</>;
}
