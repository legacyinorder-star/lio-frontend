import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Edit2, Plus, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Asset, AssetType, NewBeneficiary } from "../types/will.types";

const assetSchema = z.object({
	type: z.string().min(1, "Asset type is required"),
	description: z.string().min(1, "Description is required"),
	value: z.string().min(1, "Value is required"),
	distributionType: z.enum(["equal", "percentage"]),
	beneficiaries: z.array(
		z.object({
			id: z.string(),
			percentage: z.number().optional(),
		})
	),
});

interface AssetsStepProps {
	onNext: (data: { assets: Asset[] }) => void;
	onBack: () => void;
	initialData?: {
		assets: Asset[];
	};
	beneficiaries: NewBeneficiary[];
}

export default function AssetsStep({
	onNext,
	onBack,
	initialData,
	beneficiaries,
}: AssetsStepProps) {
	const [assets, setAssets] = useState<Asset[]>(initialData?.assets || []);
	const [assetDialogOpen, setAssetDialogOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

	const [assetForm, setAssetForm] = useState<Omit<Asset, "id">>({
		type: "real_estate" as AssetType,
		description: "",
		value: "",
		distributionType: "equal",
		beneficiaries: [],
	});

	const form = useForm<z.infer<typeof assetSchema>>({
		resolver: zodResolver(assetSchema),
		defaultValues: {
			type: "real_estate",
			description: "",
			value: "",
			distributionType: "equal",
			beneficiaries: [],
		},
	});

	const handleSubmit = () => {
		onNext({ assets });
	};

	const handleAssetFormChange =
		(field: keyof Omit<Asset, "id">) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setAssetForm((prev) => ({
				...prev,
				[field]:
					field === "type" ? (e.target.value as AssetType) : e.target.value,
			}));
		};

	const handleDistributionTypeChange = (value: "equal" | "percentage") => {
		setAssetForm((prev) => ({
			...prev,
			distributionType: value,
			beneficiaries: prev.beneficiaries.map((b) => ({
				...b,
				percentage: value === "equal" ? undefined : b.percentage,
			})),
		}));
	};

	const handleBeneficiaryChange = (
		beneficiaryId: string,
		percentage?: number
	) => {
		setAssetForm((prev) => {
			const existingIndex = prev.beneficiaries.findIndex(
				(b) => b.id === beneficiaryId
			);
			const newBeneficiaries = [...prev.beneficiaries];

			if (existingIndex >= 0) {
				if (percentage === undefined) {
					newBeneficiaries.splice(existingIndex, 1);
				} else {
					newBeneficiaries[existingIndex] = { id: beneficiaryId, percentage };
				}
			} else {
				newBeneficiaries.push({ id: beneficiaryId, percentage });
			}

			return {
				...prev,
				beneficiaries: newBeneficiaries,
			};
		});
	};

	const handleSaveAsset = () => {
		if (editingAsset) {
			setAssets((prev) =>
				prev.map((asset) =>
					asset.id === editingAsset.id ? { ...assetForm, id: asset.id } : asset
				)
			);
		} else {
			setAssets((prev) => [...prev, { ...assetForm, id: crypto.randomUUID() }]);
		}
		setAssetForm({
			type: "real_estate" as AssetType,
			description: "",
			value: "",
			distributionType: "equal",
			beneficiaries: [],
		});
		setEditingAsset(null);
		setAssetDialogOpen(false);
	};

	const handleEditAsset = (asset: Asset) => {
		setEditingAsset(asset);
		setAssetForm({
			type: asset.type,
			description: asset.description,
			value: asset.value,
			distributionType: asset.distributionType,
			beneficiaries: asset.beneficiaries,
		});
		setAssetDialogOpen(true);
	};

	const handleRemoveAsset = (assetId: string) => {
		setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Your Assets</div>
			<div className="text-muted-foreground">
				List all your assets and specify how they should be distributed.
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Assets</h3>
							<Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										onClick={() => {
											setAssetForm({
												type: "real_estate" as AssetType,
												description: "",
												value: "",
												distributionType: "equal",
												beneficiaries: [],
											});
											setEditingAsset(null);
										}}
										className="cursor-pointer"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Asset
									</Button>
								</DialogTrigger>
								<DialogContent className="bg-white">
									<DialogHeader>
										<DialogTitle>
											{editingAsset ? "Edit Asset" : "Add Asset"}
										</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<Label>Asset Type</Label>
											<Select
												value={assetForm.type}
												onValueChange={(value) =>
													setAssetForm((prev) => ({
														...prev,
														type: value as AssetType,
													}))
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select asset type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="real_estate">
														Real Estate
													</SelectItem>
													<SelectItem value="vehicle">Vehicle</SelectItem>
													<SelectItem value="bank_account">
														Bank Account
													</SelectItem>
													<SelectItem value="investment">Investment</SelectItem>
													<SelectItem value="jewelry">Jewelry</SelectItem>
													<SelectItem value="art">Art</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label>Description</Label>
											<Input
												value={assetForm.description}
												onChange={handleAssetFormChange("description")}
												placeholder="Describe the asset"
											/>
										</div>
										<div className="space-y-2">
											<Label>Estimated Value</Label>
											<Input
												type="text"
												value={assetForm.value}
												onChange={handleAssetFormChange("value")}
												placeholder="$0.00"
											/>
										</div>
										<div className="space-y-2">
											<Label>Distribution Type</Label>
											<Select
												value={assetForm.distributionType}
												onValueChange={(value: "equal" | "percentage") =>
													handleDistributionTypeChange(value)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select distribution type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="equal">
														Equal Distribution
													</SelectItem>
													<SelectItem value="percentage">
														Percentage Distribution
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label>Beneficiaries</Label>
											<div className="space-y-2">
												{beneficiaries.map((beneficiary) => {
													const isSelected = assetForm.beneficiaries.some(
														(b) => b.id === beneficiary.id
													);
													const percentage = assetForm.beneficiaries.find(
														(b) => b.id === beneficiary.id
													)?.percentage;

													return (
														<div
															key={beneficiary.id}
															className="flex items-center space-x-2 p-2 border rounded"
														>
															<input
																type="checkbox"
																checked={isSelected}
																onChange={(e) =>
																	handleBeneficiaryChange(
																		beneficiary.id,
																		e.target.checked
																			? assetForm.distributionType ===
																			  "percentage"
																				? 0
																				: undefined
																			: undefined
																	)
																}
																className="h-4 w-4"
															/>
															<span className="flex-1">{`${beneficiary.firstName} ${beneficiary.lastName}`}</span>
															{isSelected &&
																assetForm.distributionType === "percentage" && (
																	<Input
																		type="number"
																		min="0"
																		max="100"
																		value={percentage || 0}
																		onChange={(e) =>
																			handleBeneficiaryChange(
																				beneficiary.id,
																				parseInt(e.target.value) || 0
																			)
																		}
																		className="w-20"
																	/>
																)}
														</div>
													);
												})}
											</div>
										</div>
										<div className="flex justify-end space-x-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setAssetDialogOpen(false)}
											>
												Cancel
											</Button>
											<Button
												type="button"
												onClick={handleSaveAsset}
												className="bg-light-green hover:bg-light-green/90 text-black"
											>
												Save
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>

						{assets.length > 0 && (
							<div className="space-y-2">
								{assets.map((asset) => (
									<div
										key={asset.id}
										className="flex justify-between items-start p-4 border rounded-lg"
									>
										<div className="space-y-1">
											<h4 className="font-medium capitalize">
												{asset.type.replace("_", " ")}
											</h4>
											<p className="text-sm text-muted-foreground">
												{asset.description}
											</p>
											<p className="text-sm">Value: {asset.value}</p>
											<div className="text-sm">
												<span className="font-medium">Distribution: </span>
												{asset.distributionType === "equal"
													? "Equal"
													: "Percentage-based"}
											</div>
											<div className="text-sm">
												<span className="font-medium">Beneficiaries: </span>
												{asset.beneficiaries
													.map((b) => {
														const beneficiary = beneficiaries.find(
															(ben) => ben.id === b.id
														);
														return beneficiary
															? `${beneficiary.firstName} ${
																	beneficiary.lastName
															  }${
																	b.percentage !== undefined
																		? ` (${b.percentage}%)`
																		: ""
															  }`
															: "";
													})
													.filter(Boolean)
													.join(", ")}
											</div>
										</div>
										<div className="flex space-x-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => handleEditAsset(asset)}
											>
												<Edit2 className="h-4 w-4 mr-2" />
												Edit
											</Button>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => handleRemoveAsset(asset.id)}
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Remove
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="flex justify-between pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onBack}
							className="cursor-pointer"
						>
							<ArrowLeft className="mr-2 h-4 w-4" /> Back
						</Button>
						<Button
							type="submit"
							className="cursor-pointer bg-light-green hover:bg-light-green/90 text-black"
						>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
