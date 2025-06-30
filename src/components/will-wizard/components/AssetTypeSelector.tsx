import { Label } from "@/components/ui/label";
import { AssetType } from "../types/will.types";
import {
	Home,
	Building2,
	Car,
	TrendingUp,
	Briefcase,
	Package,
} from "lucide-react";

// Asset type options with icons
const ASSET_TYPES = [
	{
		value: "Property" as AssetType,
		label: "Property",
		icon: Home,
		description: "Primary residence or vacation home",
	},
	{
		value: "Investment Property" as AssetType,
		label: "Investment Property",
		icon: Building2,
		description: "Rental or commercial property",
	},
	{
		value: "Vehicle" as AssetType,
		label: "Vehicle",
		icon: Car,
		description: "Cars, boats, or other vehicles",
	},
	{
		value: "Shares & Stocks" as AssetType,
		label: "Shares & Stocks",
		icon: TrendingUp,
		description: "Investment portfolio or stock holdings",
	},
	{
		value: "Business Interest" as AssetType,
		label: "Business Interest",
		icon: Briefcase,
		description: "Business ownership or partnership",
	},
	{
		value: "Other Assets" as AssetType,
		label: "Other Assets",
		icon: Package,
		description: "Other valuable assets",
	},
];

// Asset type pill component
const AssetTypePill = ({
	type,
	selected,
	onClick,
	className = "",
}: {
	type: (typeof ASSET_TYPES)[0];
	selected?: boolean;
	onClick?: () => void;
	className?: string;
}) => {
	const Icon = type.icon;
	return (
		<button
			type="button"
			onClick={onClick}
			className={`
				flex items-center space-x-2 px-4 py-2 rounded-full border h-10
				whitespace-nowrap overflow-hidden
				${
					selected
						? "bg-primary text-white border-primary"
						: "bg-background hover:bg-muted border-input"
				}
				${onClick ? "cursor-pointer" : ""}
				${className}
			`}
		>
			<Icon className="h-4 w-4 flex-shrink-0" />
			<span className="truncate">{type.label}</span>
		</button>
	);
};

// Asset type selector component
interface AssetTypeSelectorProps {
	selectedType: AssetType;
	onSelect: (type: AssetType) => void;
	className?: string;
}

export function AssetTypeSelector({
	selectedType,
	onSelect,
	className = "",
}: AssetTypeSelectorProps) {
	return (
		<div className={`space-y-4 ${className}`}>
			<Label>Asset Type</Label>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-2 min-w-0">
				{ASSET_TYPES.map((type) => (
					<AssetTypePill
						key={type.value}
						type={type}
						selected={selectedType === type.value}
						onClick={() => onSelect(type.value)}
					/>
				))}
			</div>
			<div className="text-sm text-muted-foreground">
				{ASSET_TYPES.find((t) => t.value === selectedType)?.description}
			</div>
		</div>
	);
}

export { ASSET_TYPES };
