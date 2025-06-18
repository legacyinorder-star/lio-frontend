import React, { forwardRef } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useWillData } from "@/hooks/useWillData";
import { useRelationships } from "@/hooks/useRelationships";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RelationshipSelectProps {
	value?: string;
	onValueChange?: (value: string) => void;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	error?: string;
	className?: string;
	excludeRelationships?: string[];
	useOnlyRelationships?: boolean;
}

const RelationshipSelect = forwardRef<
	React.ElementRef<typeof SelectTrigger>,
	RelationshipSelectProps
>(
	(
		{
			value,
			onValueChange,
			label,
			placeholder = "Select relationship",
			disabled,
			required,
			error,
			className = "",
			excludeRelationships = [],
			useOnlyRelationships = false,
			...props
		},
		ref
	) => {
		const relationshipsData = useRelationships();
		const willData = useWillData();

		const {
			relationships,
			isLoading,
			error: fetchError,
		} = useOnlyRelationships ? relationshipsData : willData;

		const isReady = useOnlyRelationships ? !isLoading : willData.isReady;

		const filteredRelationships = relationships.filter(
			(relationship) =>
				!excludeRelationships.includes(relationship.name.toLowerCase())
		);

		if (isLoading || !isReady) {
			return (
				<div className={`space-y-2 ${className}`}>
					{label && (
						<Label className="flex items-center gap-2">
							{label}
							{required && <span className="text-destructive">*</span>}
						</Label>
					)}
					<div className="flex items-center justify-center py-2">
						<LoadingSpinner
							message="Loading relationships..."
							className="py-2"
						/>
					</div>
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
					<div className="text-sm text-red-500 py-2">
						Error loading relationships: {fetchError}
					</div>
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
					<SelectTrigger ref={ref} {...props}>
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
);

RelationshipSelect.displayName = "RelationshipSelect";

export { RelationshipSelect };
