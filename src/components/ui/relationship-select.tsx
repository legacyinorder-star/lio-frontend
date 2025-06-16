import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRelationships } from "@/hooks/useRelationships";
import { Loader2 } from "lucide-react";

interface RelationshipSelectProps {
	value: string;
	onValueChange: (value: string) => void;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	error?: string;
	className?: string;
	excludeRelationships?: string[];
}

export function RelationshipSelect({
	value,
	onValueChange,
	label = "Relationship",
	placeholder = "Select relationship",
	disabled = false,
	required = false,
	error,
	className = "",
	excludeRelationships = [],
}: RelationshipSelectProps) {
	const { relationships, isLoading, error: fetchError } = useRelationships();

	// Filter out excluded relationships
	const filteredRelationships = relationships.filter(
		(relationship) =>
			!excludeRelationships.includes(relationship.name.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className={`space-y-2 ${className}`}>
				{label && (
					<Label className="flex items-center gap-2">
						{label}
						{required && <span className="text-destructive">*</span>}
						<Loader2 className="h-4 w-4 animate-spin" />
					</Label>
				)}
				<Select disabled>
					<SelectTrigger>
						<SelectValue placeholder="Loading relationships..." />
					</SelectTrigger>
				</Select>
			</div>
		);
	}

	if (fetchError) {
		return (
			<div className={`space-y-2 ${className}`}>
				{label && (
					<Label className="flex items-center gap-2 text-destructive">
						{label}
						{required && <span className="text-destructive">*</span>}
					</Label>
				)}
				<Select disabled>
					<SelectTrigger>
						<SelectValue placeholder="Error loading relationships" />
					</SelectTrigger>
				</Select>
				<p className="text-sm text-destructive">{fetchError}</p>
			</div>
		);
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<Label className="flex items-center gap-2">
					{label}
					{required && <span className="text-destructive">*</span>}
				</Label>
			)}
			<Select value={value} onValueChange={onValueChange} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent className="bg-white">
					{filteredRelationships.map((relationship) => (
						<SelectItem key={relationship.id} value={relationship.id}>
							{relationship.name
								.split(" ")
								.map(
									(word) =>
										word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
								)
								.join(" ")}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
