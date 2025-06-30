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

	return <>{children}</>;
}
