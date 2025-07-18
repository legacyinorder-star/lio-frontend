import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";
import { useWill } from "@/context/WillContext";
import { Asset, AssetType } from "@/components/will-wizard/types/will.types";
import { mapAssetBeneficiariesFromAPI } from "@/utils/dataTransform";
import { useRelationships } from "@/hooks/useRelationships";

interface ApiAssetResponse {
	id: string;
	will_id: string;
	name: string;
	asset_type: string;
	description: string;
	distribution_type: string;
	beneficiaries: Array<{
		id: string;
		created_at: string;
		will_id: string;
		people_id: string | undefined;
		charities_id: string | undefined;
		asset_id: string;
		percentage: number;
		person?: {
			id: string;
			user_id: string;
			will_id: string;
			relationship_id: string;
			first_name: string;
			last_name: string;
			is_minor: boolean;
			created_at: string;
			is_witness: boolean;
		};
		charity?: {
			id: string;
			created_at: string;
			will_id: string;
			name: string;
			user_id: string;
			rc_number?: string;
		};
	}>;
}

export function useAssetManagement(shouldLoad: boolean = true) {
	const [assets, setAssets] = useState<Asset[]>([]);
	const [isLoadingAssets, setIsLoadingAssets] = useState(false);
	const { activeWill, setActiveWill } = useWill();
	const { relationships } = useRelationships();
	const hasLoadedInitialAssets = useRef(false);

	// Load assets from API only when shouldLoad is true
	useEffect(() => {
		const loadAssetsFromAPIEffect = async () => {
			if (
				shouldLoad &&
				activeWill?.id &&
				relationships.length > 0 &&
				!hasLoadedInitialAssets.current
			) {
				await loadAssetsFromAPI();
				hasLoadedInitialAssets.current = true;
			}
		};

		loadAssetsFromAPIEffect();
	}, [shouldLoad, activeWill?.id, relationships.length]);

	// Reset when shouldLoad changes
	useEffect(() => {
		if (!shouldLoad) {
			setAssets([]);
			hasLoadedInitialAssets.current = false;
		}
	}, [shouldLoad]);

	// Function to map beneficiary details from API response to WillContext structure
	const mapBeneficiaryDetails = (
		assetBeneficiaries: ApiAssetResponse["beneficiaries"]
	) => {
		return mapAssetBeneficiariesFromAPI(assetBeneficiaries);
	};

	// Function to load assets from API and update will context
	const loadAssetsFromAPI = async () => {
		if (!activeWill?.id) return;

		setIsLoadingAssets(true);
		try {
			// Fetch assets from API
			const { data: assetsData, error } = await apiClient<ApiAssetResponse[]>(
				`/assets/get-by-will/${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error || !assetsData) {
				toast.error("Failed to fetch assets");
				return;
			}

			// Process each asset and its beneficiaries
			const processedAssets = assetsData.map((assetData) => {
				// Map beneficiary details for this asset using the nested objects
				const mappedBeneficiaries = mapBeneficiaryDetails(
					assetData.beneficiaries
				);

				// Create Asset format for local state
				const asset: Asset = {
					id: assetData.id,
					assetType: assetData.asset_type as AssetType,
					description: assetData.description,
					hasBeneficiaries: assetData.beneficiaries.length > 0,
					distributionType:
						assetData.beneficiaries.length > 0
							? (assetData.distribution_type as "equal" | "percentage")
							: undefined,
					beneficiaries: assetData.beneficiaries.map((b) => ({
						id: b.id,
						percentage: b.percentage,
					})),
				};

				// Create WillAsset format for context (convert snake_case to camelCase)
				const willAsset = {
					id: assetData.id,
					assetType: assetData.asset_type,
					description: assetData.description,
					hasBeneficiaries: assetData.beneficiaries.length > 0,
					distributionType:
						assetData.beneficiaries.length > 0
							? (assetData.distribution_type as "equal" | "percentage")
							: undefined,
					beneficiaries: mappedBeneficiaries,
				};

				return { asset, willAsset };
			});

			// Update local state
			setAssets(processedAssets.map((p) => p.asset));

			// Update will context
			setActiveWill({
				...activeWill,
				assets: processedAssets.map((p) => p.willAsset),
			});
		} catch (err) {
			toast.error("Failed to load assets from API");
		} finally {
			setIsLoadingAssets(false);
		}
	};

	// Save asset to API
	const saveAsset = async (
		assetForm: Omit<Asset, "id">,
		beneficiariesWithPercentages: Array<{
			id: string;
			percentage: number;
			type: "charity" | "individual";
		}>,
		editingAssetId?: string
	) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return null;
		}

		try {
			const payload: {
				will_id: string;
				name: string;
				asset_type: string;
				description: string;
				beneficiaries: Array<{
					id: string;
					percentage: number;
					type: "charity" | "individual";
				}>;
				distribution_type?: "equal" | "percentage";
			} = {
				will_id: activeWill.id,
				name: assetForm.assetType,
				asset_type: assetForm.assetType,
				description: assetForm.description,
				beneficiaries: beneficiariesWithPercentages,
			};

			// Only include distribution_type if there are beneficiaries
			if (assetForm.hasBeneficiaries && assetForm.distributionType) {
				payload.distribution_type = assetForm.distributionType;
			}

			// Use PATCH for updates, POST for new assets
			const endpoint = editingAssetId ? `/assets/${editingAssetId}` : "/assets";
			const method = editingAssetId ? "PATCH" : "POST";

			const { data: assetData, error: assetError } =
				await apiClient<ApiAssetResponse>(endpoint, {
					method,
					body: JSON.stringify(payload),
				});

			if (assetError || !assetData) {
				toast.error("Failed to save asset");
				return null;
			}

			// Update local state with the asset from API response
			const newAsset: Asset = {
				id: assetData.id,
				assetType: assetData.asset_type as AssetType,
				description: assetData.description,
				hasBeneficiaries: assetData.beneficiaries.length > 0,
				distributionType:
					assetData.beneficiaries.length > 0
						? (assetData.distribution_type as "equal" | "percentage")
						: undefined,
				beneficiaries: assetData.beneficiaries.map((b) => ({
					id: b.id,
					percentage: b.percentage,
				})),
			};

			// Map beneficiary details for the will context using the nested objects
			const mappedBeneficiaries = mapBeneficiaryDetails(
				assetData.beneficiaries
			);

			if (editingAssetId) {
				const updatedAssets = assets.map((asset) =>
					asset.id === editingAssetId ? newAsset : asset
				);
				setAssets(updatedAssets);

				// Update will context with all asset properties, not just beneficiaries
				const updatedWillAssets = activeWill.assets.map((willAsset) =>
					willAsset.id === editingAssetId
						? {
								id: assetData.id,
								assetType: assetData.asset_type,
								description: assetData.description,
								hasBeneficiaries: assetData.beneficiaries.length > 0,
								distributionType:
									assetData.beneficiaries.length > 0
										? (assetData.distribution_type as "equal" | "percentage")
										: undefined,
								beneficiaries: mappedBeneficiaries,
						  }
						: willAsset
				);

				setActiveWill({
					...activeWill,
					assets: updatedWillAssets,
				});
			} else {
				const updatedAssets = [...assets, newAsset];
				setAssets(updatedAssets);

				// Add new asset to will context with mapped beneficiaries
				const newWillAsset = {
					id: assetData.id,
					assetType: assetData.asset_type,
					description: assetData.description,
					hasBeneficiaries: assetData.beneficiaries.length > 0,
					distributionType:
						assetData.beneficiaries.length > 0
							? (assetData.distribution_type as "equal" | "percentage")
							: undefined,
					beneficiaries: mappedBeneficiaries,
				};

				setActiveWill({
					...activeWill,
					assets: [...activeWill.assets, newWillAsset],
				});
			}

			toast.success(
				editingAssetId
					? "Asset updated successfully"
					: "Asset added successfully"
			);

			return newAsset;
		} catch (err) {
			toast.error("Failed to save asset");
			return null;
		}
	};

	// Remove asset
	const removeAsset = async (assetId: string) => {
		if (!activeWill?.id) {
			toast.error("No active will found");
			return;
		}

		try {
			// Make DELETE API call
			const { error } = await apiClient(`/assets/${assetId}`, {
				method: "DELETE",
			});

			if (error) {
				toast.error("Failed to delete asset");
				return;
			}

			// Only update local state on successful API call
			const updatedAssets = assets.filter((asset) => asset.id !== assetId);
			setAssets(updatedAssets);

			// Update will context by removing the asset
			if (activeWill) {
				const updatedWillAssets = activeWill.assets.filter(
					(willAsset) => willAsset.id !== assetId
				);
				setActiveWill({
					...activeWill,
					assets: updatedWillAssets,
				});
			}

			toast.success("Asset deleted successfully");
		} catch (err) {
			toast.error("Failed to delete asset");
		}
	};

	return {
		assets,
		setAssets,
		isLoadingAssets,
		loadAssetsFromAPI,
		saveAsset,
		removeAsset,
	};
}
