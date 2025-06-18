import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
	message?: string;
	className?: string;
}

export function LoadingSpinner({
	message = "Loading...",
	className = "",
}: LoadingSpinnerProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center py-8 ${className}`}
		>
			<Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	);
}

export default LoadingSpinner;
