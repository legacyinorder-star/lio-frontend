import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Asset } from "../types/will.types";
import { ASSET_TYPES } from "./AssetTypeSelector";
import { useWill } from "@/context/WillContext";
import { EnhancedBeneficiary } from "@/hooks/useBeneficiaryManagement";
import { useWillData } from "@/hooks/useWillData";

interface AssetCardProps {
	asset: Asset;
	onEdit: (asset: Asset) => void;
	onRemove: (assetId: string) => void;
	enhancedBeneficiaries: EnhancedBeneficiary[];
}

export function AssetCard({
	asset,
	onEdit,
	onRemove,
	enhancedBeneficiaries,
}: AssetCardProps) {
	const { activeWill } = useWill();
	const { relationshipResolver } = useWillData();

	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex justify-between items-start">
					<div className="space-y-1">
						<div className="flex items-center space-x-2">
							{(() => {
								const assetType = ASSET_TYPES.find(
									(t) => t.value === asset.assetType
								);
								if (!assetType) return null;
								const Icon = assetType.icon;
								return (
									<>
										<Icon className="h-4 w-4 text-muted-foreground" />
										<p className="font-medium">{asset.assetType}</p>
									</>
								);
							})()}
						</div>
						<p className="text-sm">{asset.description}</p>
						<div className="mt-2">
							<p className="text-sm font-medium">Distribution:</p>
							<ul className="text-sm text-muted-foreground list-disc list-inside">
								{asset.beneficiaries.map((beneficiary) => {
									// Get beneficiary details from activeWill context
									const willAsset = activeWill?.assets.find(
										(willAsset) => willAsset.id === asset.id
									);
									const willBeneficiary = willAsset?.beneficiaries.find(
										(wb) => wb.id === beneficiary.id
									);

									if (!willBeneficiary) {
										// Fallback to enhancedBeneficiaries if not found in context
										console.log("using the fallback");
										const beneficiaryDetails = enhancedBeneficiaries.find(
											(b) => b.id === beneficiary.id
										);

										if (!beneficiaryDetails) return null;

										const relationship = beneficiaryDetails.relationshipId
											? relationshipResolver?.getFormattedRelationshipName(
													beneficiaryDetails.relationshipId
											  ) || beneficiaryDetails.relationship
											: beneficiaryDetails.relationship;

										return (
											<li key={beneficiary.id}>
												{beneficiaryDetails.type === "charity"
													? beneficiaryDetails.firstName
													: `${beneficiaryDetails.firstName} ${beneficiaryDetails.lastName}`}
												<span className="text-muted-foreground">
													{" "}
													({relationship})
													{beneficiaryDetails.type === "charity" &&
														beneficiaryDetails.registrationNumber &&
														` - Reg: ${beneficiaryDetails.registrationNumber}`}
												</span>
												{asset.distributionType === "percentage" &&
													` (${beneficiary.percentage}%)`}
												{asset.distributionType === "equal" && " (equal share)"}
											</li>
										);
									}

									// Use WillContext structure - check if it's an individual based on type
									const isIndividual = willBeneficiary.peopleId !== undefined;
									const beneficiaryName = isIndividual
										? willBeneficiary.person
											? `${willBeneficiary.person.firstName} ${willBeneficiary.person.lastName}`
											: "Unknown Person"
										: willBeneficiary.charity
										? willBeneficiary.charity.name
										: "Unknown Charity";

									const relationship = isIndividual
										? willBeneficiary.person?.relationshipId
											? relationshipResolver?.getFormattedRelationshipName(
													willBeneficiary.person.relationshipId
											  ) || "Unknown Relationship"
											: willBeneficiary.person?.relationship ||
											  "Unknown Relationship"
										: "Charity";

									const registrationNumber = !isIndividual
										? willBeneficiary.charity?.registrationNumber
										: undefined;

									return (
										<li key={beneficiary.id}>
											{beneficiaryName}
											<span className="text-muted-foreground">
												{" "}
												({relationship})
												{registrationNumber && ` - Reg: ${registrationNumber}`}
											</span>
											{asset.distributionType === "percentage" &&
												` (${willBeneficiary.percentage}%)`}
											{asset.distributionType === "equal" && " (equal share)"}
										</li>
									);
								})}
							</ul>
						</div>
					</div>
					<div className="flex space-x-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEdit(asset)}
							className="cursor-pointer"
						>
							<Edit2 className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onRemove(asset.id)}
							className="cursor-pointer"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
