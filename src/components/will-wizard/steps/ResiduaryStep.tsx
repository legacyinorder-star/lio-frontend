import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ArrowLeft,
	ArrowRight,
	X,
	Plus,
	Share2,
	Edit3,
	ChevronsUpDown,
} from "lucide-react";
import { useWill } from "@/context/WillContext";
import { useBeneficiaryManagement } from "@/hooks/useBeneficiaryManagement";
import { useRelationships } from "@/hooks/useRelationships";
import { getFormattedRelationshipNameById } from "@/utils/relationships";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/custom-dropdown-menu";
import { NewBeneficiaryDialog } from "../components/NewBeneficiaryDialog";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";

interface ResiduaryApiResponse {
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
			rc_number: string;
			user_id: string;
		};
	}>;
}

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
	const [isLoadingResiduary, setIsLoadingResiduary] = useState(false);
	const [hasLoadedResiduary, setHasLoadedResiduary] = useState(false);

	const { activeWill } = useWill();
	const { relationships } = useRelationships();
	const {
		enhancedBeneficiaries,
		fetchBeneficiaries,
		addIndividualBeneficiary,
		addCharityBeneficiary,
	} = useBeneficiaryManagement();

	// Function to fetch existing residuary data
	const fetchResiduaryData = async () => {
		if (!activeWill?.id) return;

		setIsLoadingResiduary(true);
		try {
			const { data, error } = await apiClient<ResiduaryApiResponse>(
				`/residuary/${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error) {
				// If 404, no residuary data exists - this is normal
				if (error.includes("404")) {
					console.log("No existing residuary data found");
					return;
				}
			}

			if (data) {
				console.log("Loaded existing residuary data:", data);

				// Set distribution type
				setIsEqualDistribution(data.distribution_type === "equal");

				// Process beneficiaries
				const processedBeneficiaries: ResiduaryBeneficiary[] = [];
				const selectedIds = new Set<string>();

				data.beneficiaries.forEach((beneficiary) => {
					const beneficiaryId =
						beneficiary.people_id || beneficiary.charities_id;
					if (beneficiaryId) {
						selectedIds.add(beneficiaryId);
						processedBeneficiaries.push({
							id: beneficiary.id,
							beneficiaryId: beneficiaryId,
							percentage: 0, // We'll need to get this from the API response if available
						});
					}
				});

				setResiduaryBeneficiaries(processedBeneficiaries);
				setSelectedBeneficiaries(selectedIds);
			}
		} catch (err) {
			console.error("Error fetching residuary data:", err);
			toast.error("Failed to fetch residuary data");
		} finally {
			setIsLoadingResiduary(false);
			setHasLoadedResiduary(true);
		}
	};

	// Check for existing residuary data when component mounts
	useEffect(() => {
		if (activeWill?.id && !hasLoadedResiduary) {
			fetchResiduaryData();
		}
	}, [activeWill?.id, hasLoadedResiduary]);

	// Fetch beneficiaries when component mounts (only if no residuary data exists)
	useEffect(() => {
		if (
			activeWill?.id &&
			hasLoadedResiduary &&
			selectedBeneficiaries.size === 0
		) {
			fetchBeneficiaries();
		}
	}, [
		activeWill?.id,
		hasLoadedResiduary,
		selectedBeneficiaries.size,
		fetchBeneficiaries,
	]);

	// Debug logging to help identify relationship issues
	useEffect(() => {
		if (enhancedBeneficiaries.length > 0) {
			console.log("Enhanced beneficiaries:", enhancedBeneficiaries);
			console.log("Relationships available:", relationships);

			// Check for beneficiaries with empty relationships
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

		// Close dropdown and clear search
		setIsDropdownOpen(false);
		setSearchQuery("");
	};

	const handleSubmit = () => {
		onNext({ residuaryBeneficiaries });
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

		// Add guardians if selected
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
						relationship: guardian.relationship || "",
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

		// Add guardians
		if (activeWill?.guardians) {
			activeWill.guardians.forEach((guardian) => {
				if (guardian.id && !usedIds.has(guardian.id)) {
					usedIds.add(guardian.id);
					// Try to get formatted relationship name, fallback to stored relationship, then to "Guardian"
					let relationshipName = "Guardian";
					if (guardian.relationship) {
						// If guardian has a relationship ID, try to format it
						if (relationships.length > 0) {
							const formattedName = getFormattedRelationshipNameById(
								relationships,
								guardian.relationship
							);
							if (formattedName) {
								relationshipName = formattedName;
							} else {
								// If formatting fails, use the stored relationship name
								relationshipName = guardian.relationship;
							}
						} else {
							// If no relationships loaded, use the stored relationship name
							relationshipName = guardian.relationship;
						}
					}

					beneficiaries.push({
						id: guardian.id,
						fullName: `${guardian.firstName || ""} ${guardian.lastName || ""}`,
						relationship: relationshipName,
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
						relationships,
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

	const handleAddNewBeneficiary = () => {
		setNewBeneficiaryDialogOpen(true);
	};

	const handleAddIndividualBeneficiary = async (
		firstName: string,
		lastName: string,
		relationshipId: string
	) => {
		await addIndividualBeneficiary(firstName, lastName, relationshipId);
		// Refresh beneficiaries after adding
		await fetchBeneficiaries();
	};

	const handleAddCharityBeneficiary = async (
		charityName: string,
		registrationNumber?: string
	) => {
		await addCharityBeneficiary(charityName, registrationNumber);
		// Refresh beneficiaries after adding
		await fetchBeneficiaries();
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold">
					Distribution of Residuary Estate
				</h2>
				<p className="text-muted-foreground">
					Specify how you would like to distribute any remaining assets not
					specifically mentioned in your will.
				</p>
			</div>

			{/* Loading State */}
			{isLoadingResiduary && (
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-light-green mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading residuary data...</p>
					</div>
				</div>
			)}

			{/* Main Content - only show when not loading */}
			{!isLoadingResiduary && (
				<div className="space-y-4">
					<div className="space-y-4">
						{/* Distribution Mode Toggle */}
						<div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
							<div>
								<h3 className="font-medium">Distribution Mode</h3>
								<p className="text-sm text-muted-foreground">
									{isEqualDistribution
										? "Equal distribution among all beneficiaries"
										: "Manual allocation with custom percentages"}
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									variant={isEqualDistribution ? "default" : "outline"}
									size="sm"
									onClick={() => setIsEqualDistribution(true)}
									className={`flex items-center gap-2 ${
										isEqualDistribution
											? "bg-light-green hover:bg-light-green/90 text-black"
											: ""
									}`}
								>
									<Share2 className="h-4 w-4" />
									Equal
								</Button>
								<Button
									variant={!isEqualDistribution ? "default" : "outline"}
									size="sm"
									onClick={() => setIsEqualDistribution(false)}
									className={`flex items-center gap-2 ${
										!isEqualDistribution
											? "bg-light-green hover:bg-light-green/90 text-black"
											: ""
									}`}
								>
									<Edit3 className="h-4 w-4" />
									Manual
								</Button>
							</div>
						</div>

						{/* Beneficiary Selection */}
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Select Beneficiaries</h3>
								<Button
									variant="outline"
									size="sm"
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
										className="w-full justify-between"
									>
										{searchQuery || "Search and select beneficiaries..."}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
									<DropdownMenuContent className="w-[700px] max-h-[300px] overflow-y-auto">
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
															{beneficiary.fullName} ({beneficiary.relationship}
															)
														</DropdownMenuItem>
													))}
												</div>
											)}
										</div>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							{/* Combined Selected Beneficiaries and Allocation List */}
							{selectedBeneficiaries.size === 0 ? (
								<p className="text-sm text-muted-foreground">
									No beneficiaries selected. Use the dropdown above to add
									beneficiaries.
								</p>
							) : (
								<div className="space-y-2">
									<p className="text-sm text-muted-foreground mb-2">
										Selected beneficiaries for residuary estate:
									</p>
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
													<div
														key={beneficiary.id}
														className="flex items-center justify-between p-4 border rounded-lg"
													>
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
								<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
									<p className="text-sm text-yellow-800">
										Total allocation must equal 100%. Current total:{" "}
										{totalAllocation}%
									</p>
								</div>
							)}

						{/* Navigation buttons */}
						<div className="flex justify-between pt-6">
							<Button
								variant="outline"
								onClick={onBack}
								className="flex items-center gap-2 cursor-pointer"
							>
								<ArrowLeft className="h-4 w-4" />
								Back
							</Button>
							<Button
								onClick={handleSubmit}
								className="flex items-center gap-2 bg-light-green hover:bg-light-green/90 text-black cursor-pointer"
								disabled={
									selectedBeneficiaries.size === 0 ||
									(!isEqualDistribution && totalAllocation !== 100)
								}
							>
								Next
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* New Beneficiary Dialog */}
					<NewBeneficiaryDialog
						open={newBeneficiaryDialogOpen}
						onOpenChange={setNewBeneficiaryDialogOpen}
						onAddIndividual={handleAddIndividualBeneficiary}
						onAddCharity={handleAddCharityBeneficiary}
					/>
				</div>
			)}
		</div>
	);
}
