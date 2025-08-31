import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, X, Plus, ChevronsUpDown } from "lucide-react";
import { useWill } from "@/context/WillContext";
import { useWillData } from "@/hooks/useWillData";
import { getFormattedRelationshipNameById } from "@/utils/relationships";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/custom-dropdown-menu";
import { NewBeneficiaryDialog } from "../components/NewBeneficiaryDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import type { WillResiduary } from "@/context/WillContext";

interface ResiduaryBeneficiary {
	id: string;
	beneficiaryId: string;
	percentage: number;
}

interface ResiduaryStepProps {
	onNext: (data: { residuaryBeneficiaries: ResiduaryBeneficiary[] }) => void;
	onBack: () => void;
	initialData?: {
		residuaryBeneficiaries: ResiduaryBeneficiary[];
	};
}

export default function ResiduaryStep({
	onNext,
	onBack,
	initialData,
}: ResiduaryStepProps) {
	const [residuaryBeneficiaries, setResiduaryBeneficiaries] = useState<
		ResiduaryBeneficiary[]
	>(initialData?.residuaryBeneficiaries || []);
	const [newBeneficiaryDialogOpen, setNewBeneficiaryDialogOpen] =
		useState(false);
	const [isEqualDistribution, setIsEqualDistribution] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<
		Set<string>
	>(new Set());
	const [hasLoadedResiduary, setHasLoadedResiduary] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { activeWill, setActiveWill } = useWill();
	const {
		allBeneficiaries: enhancedBeneficiaries,
		isLoading: isLoadingBeneficiaries,
		isReady: isBeneficiariesReady,
		relationships,
		addIndividualBeneficiary,
		addCharityBeneficiary,
	} = useWillData();

	// Load residuary data from API
	const loadResiduaryFromAPI = async () => {
		if (!activeWill?.id || hasLoadedResiduary) return;

		try {
			console.log("Loading residuary data from API...");
			const { data, error } = await apiClient<{
				id: string;
				created_at: string;
				will_id: string;
				distribution_type: string;
				beneficiaries: Array<{
					id: string;
					created_at: string;
					residuary_id: string;
					will_id: string;
					people_id: string | null;
					charities_id: string | null;
					percentage: string;
					charity?: {
						id: string;
						created_at: string;
						will_id: string;
						name: string;
						rc_number: string;
						user_id: string;
					};
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
				}>;
			}>(`/residuary/get-by-will/${activeWill.id}`, {
				method: "GET",
			});

			if (error) {
				// If 404, no residuary exists - this is normal
				if (error.includes("404")) {
					console.log("No existing residuary found");
					setHasLoadedResiduary(true);
					return;
				}
				toast.error("Failed to load residuary data");
				return;
			}

			if (data) {
				console.log("Loaded residuary data:", data);

				// Set distribution type
				setIsEqualDistribution(data.distribution_type === "equal");

				// Process beneficiaries from API response
				const processedBeneficiaries: ResiduaryBeneficiary[] = [];
				const selectedIds = new Set<string>();

				// Add null check for beneficiaries array to prevent runtime errors
				if (data.beneficiaries && Array.isArray(data.beneficiaries)) {
					data.beneficiaries.forEach((beneficiary) => {
						const beneficiaryId =
							beneficiary.people_id || beneficiary.charities_id;
						if (beneficiaryId) {
							selectedIds.add(beneficiaryId);
							processedBeneficiaries.push({
								id: beneficiary.id,
								beneficiaryId: beneficiaryId,
								percentage: parseInt(beneficiary.percentage) || 0,
							});
						}
					});
				} else {
					console.log(
						"No beneficiaries found in residuary data or beneficiaries is not an array"
					);
				}

				setResiduaryBeneficiaries(processedBeneficiaries);
				setSelectedBeneficiaries(selectedIds);

				// Update WillContext with loaded data
				if (activeWill) {
					const residuaryData: WillResiduary = {
						id: data.id,
						distribution_type: data.distribution_type as "equal" | "manual",
						beneficiaries: (data.beneficiaries &&
						Array.isArray(data.beneficiaries)
							? data.beneficiaries
							: []
						).map((beneficiary) => {
							if (beneficiary.charity) {
								return {
									id: beneficiary.id,
									percentage: parseInt(beneficiary.percentage) || 0,
									charitiesId: beneficiary.charities_id!,
									charity: {
										id: beneficiary.charity.id,
										name: beneficiary.charity.name,
										registrationNumber: beneficiary.charity.rc_number,
									},
								};
							} else if (beneficiary.person) {
								return {
									id: beneficiary.id,
									percentage: parseInt(beneficiary.percentage) || 0,
									peopleId: beneficiary.people_id!,
									person: {
										id: beneficiary.person.id,
										firstName: beneficiary.person.first_name,
										lastName: beneficiary.person.last_name,
										relationship: "", // Will be resolved by relationship resolver
										relationshipId: beneficiary.person.relationship_id,
										isMinor: beneficiary.person.is_minor,
									},
								};
							}
							// Fallback
							return {
								id: beneficiary.id,
								percentage: parseInt(beneficiary.percentage) || 0,
								peopleId:
									beneficiary.people_id || beneficiary.charities_id || "",
							};
						}),
					};

					const updatedWill = {
						...activeWill,
						residuary: residuaryData,
					};

					setActiveWill(updatedWill);
				}
			}

			setHasLoadedResiduary(true);
		} catch (err) {
			console.error("Error loading residuary data:", err);
			toast.error("Failed to load residuary data");
			setHasLoadedResiduary(true);
		}
	};

	// Load residuary data when component mounts
	useEffect(() => {
		if (activeWill?.id && !hasLoadedResiduary) {
			loadResiduaryFromAPI();
		}
	}, [activeWill?.id, hasLoadedResiduary]);

	// Debug logging to help identify relationship issues
	useEffect(() => {
		if (enhancedBeneficiaries.length > 0) {
			console.log("Enhanced beneficiaries:", enhancedBeneficiaries);
			console.log("Relationships available:", relationships);

			// Check for beneficiaries with empty relationships - should be much fewer now
			const emptyRelationships = enhancedBeneficiaries.filter(
				(b) =>
					!b.relationship ||
					b.relationship === "" ||
					b.relationship === "Unknown Relationship"
			);
			if (emptyRelationships.length > 0) {
				console.warn(
					"Beneficiaries with empty relationships:",
					emptyRelationships
				);
			}
		}
	}, [enhancedBeneficiaries, relationships]);

	// Apply equal distribution when beneficiaries change or mode changes
	useEffect(() => {
		if (isEqualDistribution) {
			applyEqualDistribution();
		}
	}, [isEqualDistribution, selectedBeneficiaries, activeWill]);

	// Initialize selected beneficiaries from existing residuary beneficiaries
	useEffect(() => {
		if (initialData?.residuaryBeneficiaries) {
			const initialSelected = new Set(
				initialData.residuaryBeneficiaries.map((b) => b.beneficiaryId)
			);
			setSelectedBeneficiaries(initialSelected);
		}
	}, [initialData?.residuaryBeneficiaries]);

	const applyEqualDistribution = () => {
		const availableBeneficiaries = getAvailableBeneficiaries();
		if (availableBeneficiaries.length === 0) return;

		const equalPercentage = Math.round(100 / availableBeneficiaries.length);
		const remainder = 100 - equalPercentage * availableBeneficiaries.length;

		const newResiduaryBeneficiaries = availableBeneficiaries.map(
			(beneficiary, index) => ({
				id: `${beneficiary.id}-${Date.now()}`,
				beneficiaryId: beneficiary.id,
				percentage: equalPercentage + (index < remainder ? 1 : 0), // Distribute remainder to first few beneficiaries
			})
		);

		setResiduaryBeneficiaries(newResiduaryBeneficiaries);
	};

	const handleResiduaryBeneficiaryChange = (
		beneficiaryId: string,
		percentage: number
	) => {
		// If in equal distribution mode, switch to manual mode
		if (isEqualDistribution) {
			setIsEqualDistribution(false);
		}

		setResiduaryBeneficiaries((prev) => {
			const existingIndex = prev.findIndex(
				(b) => b.beneficiaryId === beneficiaryId
			);

			if (existingIndex >= 0) {
				const updated = [...prev];
				updated[existingIndex] = {
					...updated[existingIndex],
					percentage,
				};
				return updated;
			} else {
				return [
					...prev,
					{
						id: `${beneficiaryId}-${Date.now()}`,
						beneficiaryId,
						percentage,
					},
				];
			}
		});
	};

	const handleRemoveResiduaryBeneficiary = (beneficiaryId: string) => {
		setResiduaryBeneficiaries((prev) =>
			prev.filter((b) => b.beneficiaryId !== beneficiaryId)
		);
		setSelectedBeneficiaries((prev) => {
			const newSet = new Set(prev);
			newSet.delete(beneficiaryId);
			return newSet;
		});
	};

	const handleSelectBeneficiary = (beneficiaryId: string) => {
		if (!beneficiaryId) return;

		setSelectedBeneficiaries((prev) => {
			const newSet = new Set(prev);
			newSet.add(beneficiaryId);
			return newSet;
		});

		// Clear search
		setSearchQuery("");
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			// Prepare the payload
			const payload = {
				will_id: activeWill?.id,
				distribution_type: isEqualDistribution ? "equal" : "manual",
				beneficiaries: {
					charities: [] as Array<{ id: string; percentage: number }>,
					people: [] as Array<{ id: string; percentage: number }>,
				},
			};

			// Separate beneficiaries into people and charities with percentages
			residuaryBeneficiaries.forEach((beneficiary) => {
				// Check if it's a charity by looking in enhancedBeneficiaries
				const enhancedBeneficiary = enhancedBeneficiaries.find(
					(b) => b.id === beneficiary.beneficiaryId
				);
				const beneficiaryData = {
					id: beneficiary.beneficiaryId,
					percentage: beneficiary.percentage,
				};

				if (enhancedBeneficiary?.type === "charity") {
					payload.beneficiaries.charities.push(beneficiaryData);
				} else {
					payload.beneficiaries.people.push(beneficiaryData);
				}
			});

			// Always use POST to save residuary data
			console.log("Saving residuary data with POST");
			const { error } = await apiClient<{ id: string }>("/residuary", {
				method: "POST",
				body: JSON.stringify(payload),
			});

			if (error) {
				toast.error("Failed to save residuary data");
				return;
			}

			toast.success("Residuary data saved successfully");
			onNext({ residuaryBeneficiaries });
		} catch (error) {
			console.error("Error saving residuary data:", error);
			toast.error("Failed to save residuary data");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Get available beneficiaries from the will context
	const getAvailableBeneficiaries = () => {
		const beneficiaries = [];
		const usedIds = new Set<string>();

		// Add spouse if exists and selected
		if (
			activeWill?.spouse &&
			activeWill.spouse.id &&
			!usedIds.has(activeWill.spouse.id) &&
			selectedBeneficiaries.has(activeWill.spouse.id)
		) {
			usedIds.add(activeWill.spouse.id);
			beneficiaries.push({
				id: activeWill.spouse.id,
				fullName: `${activeWill.spouse.firstName || ""} ${
					activeWill.spouse.lastName || ""
				}`,
				relationship: "Spouse",
			});
		}

		// Add children if selected
		if (activeWill?.children) {
			activeWill.children.forEach((child) => {
				if (
					child.id &&
					!usedIds.has(child.id) &&
					selectedBeneficiaries.has(child.id)
				) {
					usedIds.add(child.id);
					beneficiaries.push({
						id: child.id,
						fullName: `${child.firstName || ""} ${child.lastName || ""}`,
						relationship: "Child",
					});
				}
			});
		}

		// Add guardians if selected - use relationship name directly like in AssetsCard
		if (activeWill?.guardians) {
			activeWill.guardians.forEach((guardian) => {
				if (
					guardian.id &&
					!usedIds.has(guardian.id) &&
					selectedBeneficiaries.has(guardian.id)
				) {
					usedIds.add(guardian.id);
					beneficiaries.push({
						id: guardian.id,
						fullName: `${guardian.firstName || ""} ${guardian.lastName || ""}`,
						relationship: guardian.relationship || "Guardian",
					});
				}
			});
		}

		// Add enhanced beneficiaries (other beneficiaries) if selected
		enhancedBeneficiaries.forEach((beneficiary) => {
			if (
				beneficiary.id &&
				!usedIds.has(beneficiary.id) &&
				selectedBeneficiaries.has(beneficiary.id)
			) {
				usedIds.add(beneficiary.id);
				beneficiaries.push({
					id: beneficiary.id,
					fullName: `${beneficiary.firstName || ""} ${
						beneficiary.lastName || ""
					}`,
					relationship: beneficiary.relationship || "",
				});
			}
		});

		return beneficiaries;
	};

	// Get all potential beneficiaries for the dropdown
	const getAllPotentialBeneficiaries = () => {
		const beneficiaries = [];
		const usedIds = new Set<string>();

		// Add spouse if exists
		if (
			activeWill?.spouse &&
			activeWill.spouse.id &&
			!usedIds.has(activeWill.spouse.id)
		) {
			usedIds.add(activeWill.spouse.id);
			beneficiaries.push({
				id: activeWill.spouse.id,
				fullName: `${activeWill.spouse.firstName || ""} ${
					activeWill.spouse.lastName || ""
				}`,
				relationship: "Spouse",
			});
		}

		// Add children
		if (activeWill?.children) {
			activeWill.children.forEach((child) => {
				if (child.id && !usedIds.has(child.id)) {
					usedIds.add(child.id);
					beneficiaries.push({
						id: child.id,
						fullName: `${child.firstName || ""} ${child.lastName || ""}`,
						relationship: "Child",
					});
				}
			});
		}

		// Add guardians - use relationship name directly like in AssetsCard
		if (activeWill?.guardians) {
			activeWill.guardians.forEach((guardian) => {
				if (guardian.id && !usedIds.has(guardian.id)) {
					usedIds.add(guardian.id);
					beneficiaries.push({
						id: guardian.id,
						fullName: `${guardian.firstName || ""} ${guardian.lastName || ""}`,
						relationship: guardian.relationship || "Guardian",
					});
				}
			});
		}

		// Add enhanced beneficiaries (other beneficiaries)
		enhancedBeneficiaries.forEach((beneficiary) => {
			if (beneficiary.id && !usedIds.has(beneficiary.id)) {
				usedIds.add(beneficiary.id);

				// Try to get the best relationship name available
				let relationshipName = "Unknown Relationship";

				if (beneficiary.relationshipId && relationships.length > 0) {
					// Try to get formatted relationship name from ID
					const formattedName = getFormattedRelationshipNameById(
						beneficiary.relationshipId
					);
					if (formattedName) {
						relationshipName = formattedName;
					} else if (
						beneficiary.relationship &&
						beneficiary.relationship !== "Unknown Relationship"
					) {
						// Fallback to stored relationship name if it's not the default
						relationshipName = beneficiary.relationship;
					}
				} else if (
					beneficiary.relationship &&
					beneficiary.relationship !== "Unknown Relationship"
				) {
					// Use stored relationship name if no ID or relationships not loaded
					relationshipName = beneficiary.relationship;
				}

				beneficiaries.push({
					id: beneficiary.id,
					fullName: `${beneficiary.firstName || ""} ${
						beneficiary.lastName || ""
					}`,
					relationship: relationshipName,
				});
			}
		});

		return beneficiaries;
	};

	// Filter beneficiaries for dropdown based on search query and not already selected
	const filteredBeneficiaries = getAllPotentialBeneficiaries().filter(
		(beneficiary) =>
			!selectedBeneficiaries.has(beneficiary.id) &&
			(beneficiary.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				beneficiary.relationship
					.toLowerCase()
					.includes(searchQuery.toLowerCase()))
	);

	const totalAllocation = residuaryBeneficiaries.reduce(
		(sum, b) => sum + b.percentage,
		0
	);

	// Show loading state if data is not ready
	if (!isBeneficiariesReady || isLoadingBeneficiaries) {
		return (
			<LoadingSpinner
				message="Loading beneficiaries and relationships..."
				className="min-h-[400px]"
			/>
		);
	}

	const handleAddNewBeneficiary = () => {
		setNewBeneficiaryDialogOpen(true);
	};

	const handleAddIndividualBeneficiary = async (
		firstName: string,
		lastName: string,
		relationshipId: string
	) => {
		const newBeneficiary = await addIndividualBeneficiary(
			firstName,
			lastName,
			relationshipId
		);

		// Automatically add the new beneficiary to selected beneficiaries
		if (newBeneficiary?.id) {
			setSelectedBeneficiaries((prev) => {
				const newSet = new Set(prev);
				newSet.add(newBeneficiary.id);
				return newSet;
			});
			toast.success(
				`${firstName} ${lastName} added and selected for residuary estate`
			);
		}
	};

	const handleAddCharityBeneficiary = async (
		charityName: string,
		registrationNumber?: string
	) => {
		const newBeneficiary = await addCharityBeneficiary(
			charityName,
			registrationNumber
		);

		// Automatically add the new charity to selected beneficiaries
		if (newBeneficiary?.id) {
			setSelectedBeneficiaries((prev) => {
				const newSet = new Set(prev);
				newSet.add(newBeneficiary.id);
				return newSet;
			});
			toast.success(`${charityName} added and selected for residuary estate`);
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Sharing your Residuary Estate
			</div>
			<div className="text-[#696868] text-[0.875rem] -mt-4">
				Specify who you would like to inherit any remaining assets not
				specifically mentioned in your will.
			</div>

			{/* Main Content */}
			<div className="space-y-4 mb-[2.45rem]">
				{/* Distribution Mode Toggle */}
				<div className="space-y-4 mb-[2.45rem]">
					<div className="flex items-center gap-2">
						<span
							style={{
								fontSize: "1rem",
								color: "#000",
								fontWeight: 400,
								fontFamily: "TMT Limkin",
							}}
						>
							How would you like to share your residuary estate?
						</span>
					</div>
					<div className="text-[#696868] text-[0.875rem] -mt-4">
						Choose between equal split among the selected beneficiaries or
						manual allocation with custom percentages.
					</div>

					<div className="space-y-3 mt-[-0.5rem]">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="equalDistribution"
								checked={isEqualDistribution}
								onCheckedChange={(checked) => {
									if (checked) {
										setIsEqualDistribution(true);
									}
								}}
								className="rounded-full"
							/>
							<label
								htmlFor="equalDistribution"
								className="text-sm font-normal cursor-pointer"
							>
								Equal distribution among all beneficiaries
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="manualDistribution"
								checked={!isEqualDistribution}
								onCheckedChange={(checked) => {
									if (checked) {
										setIsEqualDistribution(false);
									}
								}}
								className="rounded-full"
							/>
							<label
								htmlFor="manualDistribution"
								className="text-sm font-normal cursor-pointer"
							>
								Manual allocation with custom percentages
							</label>
						</div>
					</div>
				</div>

				{/* Beneficiary Selection */}
				<div className="space-y-4 mb-[2.45rem]">
					<div className="flex items-center gap-2">
						<span
							style={{
								fontSize: "1rem",
								color: "#000",
								fontWeight: 400,
								fontFamily: "TMT Limkin",
							}}
						>
							Select beneficiaries for your residuary estate
						</span>
					</div>
					<div className="text-[#696868] text-[0.875rem] -mt-4">
						Choose who will receive the remaining assets. You can add new
						beneficiaries or select from existing ones.
					</div>

					<div className="flex justify-between items-center">
						<div className="text-lg font-medium">Available Beneficiaries</div>
						<Button
							variant="outline"
							onClick={handleAddNewBeneficiary}
							className="cursor-pointer"
						>
							<Plus className="mr-2 h-4 w-4" />
							Add New Beneficiary
						</Button>
					</div>

					{/* Beneficiary Select Dropdown */}
					<div className="w-full">
						<DropdownMenu
							onOpenChange={setIsDropdownOpen}
							className="w-full max-h-[300px]"
						>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={isDropdownOpen}
								className="w-full justify-between h-16 bg-white text-[#050505] rounded-[0.25rem] font-medium"
							>
								{searchQuery || "Search and select beneficiaries..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
							<DropdownMenuContent className="w-full max-h-[300px] overflow-y-auto">
								<div className="p-2">
									<Input
										placeholder="Search beneficiaries..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="mb-2"
									/>
									{filteredBeneficiaries.length === 0 ? (
										<div className="text-sm text-muted-foreground p-2">
											No beneficiaries found.
										</div>
									) : (
										<div className="space-y-1">
											{filteredBeneficiaries.map((beneficiary) => (
												<DropdownMenuItem
													key={beneficiary.id}
													onSelect={() =>
														handleSelectBeneficiary(beneficiary.id)
													}
													className="cursor-pointer"
												>
													{beneficiary.fullName} ({beneficiary.relationship})
												</DropdownMenuItem>
											))}
										</div>
									)}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Combined Selected Beneficiaries and Allocation List */}
					{selectedBeneficiaries.size >= 0 && (
						<div className="space-y-2 pt-4">
							<div className="grid gap-4">
								{getAllPotentialBeneficiaries()
									.filter((beneficiary) =>
										selectedBeneficiaries.has(beneficiary.id)
									)
									.map((beneficiary) => {
										const existingAllocation =
											residuaryBeneficiaries.find(
												(b) => b.beneficiaryId === beneficiary.id
											)?.percentage || "";

										return (
											<Card key={beneficiary.id}>
												<CardContent className="p-4">
													<div className="flex justify-between items-center">
														<div>
															<p className="font-medium">
																{beneficiary.fullName}
															</p>
															<p className="text-sm text-muted-foreground">
																{beneficiary.relationship}
															</p>
														</div>
														<div className="flex items-center gap-4">
															<Input
																type="number"
																value={existingAllocation}
																onChange={(e) =>
																	handleResiduaryBeneficiaryChange(
																		beneficiary.id,
																		Number(e.target.value) || 0
																	)
																}
																className="w-24"
																min="0"
																max="100"
																disabled={isEqualDistribution}
																placeholder="0"
															/>
															<span className="text-sm">%</span>
															<Button
																variant="ghost"
																size="icon"
																onClick={() =>
																	handleRemoveResiduaryBeneficiary(
																		beneficiary.id
																	)
																}
																className="cursor-pointer"
															>
																<X className="h-4 w-4" />
															</Button>
														</div>
													</div>
												</CardContent>
											</Card>
										);
									})}
							</div>
						</div>
					)}
				</div>

				{/* Total allocation warning */}
				{!isEqualDistribution &&
					totalAllocation !== 100 &&
					selectedBeneficiaries.size > 0 && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-red-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-red-800">
										Allocation Total Mismatch
									</h3>
									<div className="mt-2 text-sm text-red-700">
										<p>
											Total allocation must equal 100%. Current total:{" "}
											{totalAllocation}%. Please adjust the percentages to
											continue.
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
			</div>

			{/* Navigation buttons */}
			<div className="flex justify-between pt-4">
				<Button variant="outline" onClick={onBack} className="cursor-pointer">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<Button
					onClick={handleSubmit}
					className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
					disabled={
						isSubmitting ||
						selectedBeneficiaries.size === 0 ||
						(!isEqualDistribution && totalAllocation !== 100)
					}
				>
					{isSubmitting ? (
						<>
							<div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-black mr-2" />
							Saving...
						</>
					) : (
						<>
							Next <ArrowRight className="ml-2 h-4 w-4" />
						</>
					)}
				</Button>
			</div>

			{/* New Beneficiary Dialog */}
			<NewBeneficiaryDialog
				open={newBeneficiaryDialogOpen}
				onOpenChange={setNewBeneficiaryDialogOpen}
				onAddIndividual={handleAddIndividualBeneficiary}
				onAddCharity={handleAddCharityBeneficiary}
			/>
		</div>
	);
}
