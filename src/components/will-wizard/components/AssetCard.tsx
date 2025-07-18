import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2 } from "lucide-react";
import { Asset } from "../types/will.types";
import { ASSET_TYPES } from "./AssetTypeSelector";
import { useWill } from "@/context/WillContext";
import { getFormattedRelationshipNameById } from "@/utils/relationships";

interface AssetCardProps {
	asset: Asset;
	onEdit: (asset: Asset) => void;
	onRemove: (assetId: string) => Promise<void>;
	hasDeletedBeneficiaries?: boolean;
}

export function AssetCard({
	asset,
	onEdit,
	onRemove,
	hasDeletedBeneficiaries = false,
}: AssetCardProps) {
	const { activeWill } = useWill();

	// Function to check if a beneficiary is deleted
	const isBeneficiaryDeleted = (beneficiaryId: string): boolean => {
		// Get the will asset from activeWill context
		const willAsset = activeWill?.assets.find(
			(willAsset) => willAsset.id === asset.id
		);

		if (!willAsset) return false;

		// Find the beneficiary in the will asset
		const willBeneficiary = willAsset.beneficiaries.find(
			(wb) => wb.id === beneficiaryId
		);

		if (!willBeneficiary) return true;

		// Check if it's an individual and the person data is missing
		const isIndividual = willBeneficiary.peopleId !== undefined;
		const isCharity = willBeneficiary.charitiesId !== undefined;

		if (isIndividual && !willBeneficiary.person) {
			return true;
		}

		if (isCharity && !willBeneficiary.charity) {
			return true;
		}

		return false;
	};

	// Check if any beneficiary in this asset is deleted
	const hasDeletedBeneficiariesInAsset = asset.beneficiaries.some(
		(beneficiary) => isBeneficiaryDeleted(beneficiary.id)
	);

	// Use the prop or the calculated value
	const showRedBorder =
		hasDeletedBeneficiaries || hasDeletedBeneficiariesInAsset;

	return (
		<Card>
			<CardContent className="p-4">
				{showRedBorder && (
					<div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
						<div className="flex items-center space-x-2">
							<svg
								className="h-5 w-5 text-red-500 flex-shrink-0"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							<div className="text-sm text-red-700">
								<strong>Action Required:</strong> This asset has deleted
								beneficiaries. Please edit the asset to fix this issue before
								proceeding.
							</div>
						</div>
					</div>
				)}
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
							{!asset.hasBeneficiaries ? (
								<p className="text-sm text-muted-foreground">
									This asset will be distributed according to your residuary
									estate.
								</p>
							) : (
								<ul className="text-sm text-muted-foreground list-disc list-inside">
									{asset.beneficiaries.map((beneficiary) => {
										// Get the will asset from activeWill context
										const willAsset = activeWill?.assets.find(
											(willAsset) => willAsset.id === asset.id
										);

										// Find the beneficiary in the will asset
										const willBeneficiary = willAsset?.beneficiaries.find(
											(wb) => wb.id === beneficiary.id
										);

										// If will asset not found, display basic beneficiary info
										if (!willAsset) {
											return (
												<li
													key={beneficiary.id}
													className="text-muted-foreground"
												>
													Beneficiary ID: {beneficiary.id}
													{asset.beneficiaries.length > 1 && (
														<>
															{asset.distributionType === "percentage" &&
																` (${beneficiary.percentage}%)`}
															{asset.distributionType === "equal" &&
																" (equal share)"}
														</>
													)}
												</li>
											);
										}

										// If beneficiary not found in will asset, it might be deleted
										if (!willBeneficiary) {
											return (
												<li
													key={beneficiary.id}
													className="text-red-600 font-medium"
												>
													Unknown Beneficiary (Deleted)
													{asset.beneficiaries.length > 1 && (
														<>
															{asset.distributionType === "percentage" &&
																` (${beneficiary.percentage}%)`}
															{asset.distributionType === "equal" &&
																" (equal share)"}
														</>
													)}
												</li>
											);
										}

										// Check if it's an individual or charity
										const isIndividual = willBeneficiary.peopleId !== undefined;
										const isCharity = willBeneficiary.charitiesId !== undefined;

										// Check if this beneficiary is deleted
										const isDeleted = isBeneficiaryDeleted(beneficiary.id);

										if (isDeleted) {
											return (
												<li
													key={beneficiary.id}
													className="text-red-600 font-medium"
												>
													{isIndividual
														? "Unknown Person (Deleted Beneficiary)"
														: isCharity
														? "Unknown Charity (Deleted Beneficiary)"
														: "Unknown Beneficiary (Deleted)"}
													{asset.beneficiaries.length > 1 && (
														<>
															{asset.distributionType === "percentage" &&
																` (${willBeneficiary.percentage}%)`}
															{asset.distributionType === "equal" &&
																" (equal share)"}
														</>
													)}
												</li>
											);
										}

										// Display the beneficiary details
										let beneficiaryName: string = "";
										let relationship: string = "";
										let registrationNumber: string = "";

										if (isIndividual && willBeneficiary.person) {
											beneficiaryName = `${willBeneficiary.person.firstName} ${willBeneficiary.person.lastName}`;
											if (willBeneficiary.person.relationshipId) {
												relationship = getFormattedRelationshipNameById(
													willBeneficiary.person.relationshipId
												);
											} else {
												relationship =
													willBeneficiary.person.relationship ??
													"Unknown Relationship";
											}
										} else if (isCharity && willBeneficiary.charity) {
											beneficiaryName = willBeneficiary.charity.name;
											relationship = "Charity";
											registrationNumber = String(
												willBeneficiary.charity.registrationNumber ?? ""
											);
										} else {
											beneficiaryName = "Unknown Beneficiary";
											relationship = "Unknown";
											registrationNumber = "";
										}

										return (
											<li key={beneficiary.id}>
												{beneficiaryName}
												<span className="text-muted-foreground">
													{" "}
													({relationship})
													{registrationNumber &&
														` - Reg: ${registrationNumber}`}
												</span>
												{asset.beneficiaries.length > 1 && (
													<>
														{asset.distributionType === "percentage" &&
															` (${willBeneficiary.percentage}%)`}
														{asset.distributionType === "equal" &&
															" (equal share)"}
													</>
												)}
											</li>
										);
									})}
								</ul>
							)}
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
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="ghost" size="icon" className="cursor-pointer">
									<Trash2 className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Asset</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete this asset? This action
										cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => onRemove(asset.id)}
										className="bg-red-600 text-white hover:bg-red-700"
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
