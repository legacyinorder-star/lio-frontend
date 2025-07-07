import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RelationshipSelect } from "@/components/ui/relationship-select";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	ArrowLeft,
	ArrowRight,
	Plus,
	Trash2,
	Edit2,
	ChevronsUpDown,
	X,
} from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import { useWill } from "@/context/WillContext";
import { toast } from "sonner";

import { getFormattedRelationshipNameById } from "@/utils/relationships";
import { useWillData } from "@/hooks/useWillData";
import { useDataLoading } from "@/context/DataLoadingContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/custom-dropdown-menu";

// API response interface
interface ExecutorApiResponse {
	id: string;
	created_at: string;
	will_id: string;
	corporate_executor_id?: string;
	executor_id?: string;
	is_primary: boolean;
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
	corporate_executor?: {
		id: string;
		created_at: string;
		user_id: string;
		name: string;
		will_id: string;
		rc_number: string;
	};
}

// Add this type after the other type definitions
interface Executor {
	id: string;
	type: "individual" | "corporate";
	// Individual executor fields
	firstName?: string;
	lastName?: string;
	relationshipId?: string;
	relationshipName?: string;
	personId?: string; // Store the person ID for editing
	// Corporate executor fields
	name?: string;
	rc_number?: string;
	corporateExecutorId?: string; // Store the corporate executor ID for editing
	isPrimary: boolean;
}

export type ExecutorData = Executor[];

interface ExecutorStepProps {
	data: Partial<ExecutorData>;
	onUpdate: (data: ExecutorData) => void;
	onNext?: () => void;
	onBack?: () => void;
}

export default function ExecutorStep({
	data,
	onUpdate,
	onNext,
	onBack,
}: ExecutorStepProps) {
	const [executorDialogOpen, setExecutorDialogOpen] = useState(false);
	const [editingExecutor, setEditingExecutor] = useState<Executor | null>(null);
	const [executors, setExecutors] = useState<Executor[]>(
		Array.isArray(data)
			? data.filter((executor): executor is Executor => executor !== undefined)
			: []
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingExecutors, setIsLoadingExecutors] = useState(false);
	const [hasLoadedExecutors, setHasLoadedExecutors] = useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [executorToDelete, setExecutorToDelete] = useState<Executor | null>(
		null
	);
	const [useLegacyInOrder, setUseLegacyInOrder] = useState(false);
	const prevExecutorsRef = useRef<Executor[]>([]);
	const { activeWill } = useWill();
	const {
		allBeneficiaries: enhancedBeneficiaries,
		isLoading: isDataLoading,
		isReady,
	} = useWillData();
	const { updateLoadingState } = useDataLoading();

	const [executorForm, setExecutorForm] = useState<Executor>({
		id: "",
		type: "individual",
		firstName: "",
		lastName: "",
		relationshipId: "",
		name: "",
		rc_number: "",
		personId: "",
		corporateExecutorId: "",
		isPrimary: false,
	});

	const [selectedPersonInfo, setSelectedPersonInfo] = useState<{
		id: string;
		firstName: string;
		lastName: string;
		relationship: string;
	} | null>(null);
	const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Update loading state for executors
	useEffect(() => {
		updateLoadingState("executors", isLoadingExecutors);
	}, [isLoadingExecutors, updateLoadingState]);

	// Function to load existing executors
	const loadExecutors = async () => {
		if (!activeWill?.id || hasLoadedExecutors) return;

		setIsLoadingExecutors(true);
		try {
			const { data, error } = await apiClient<ExecutorApiResponse[]>(
				`/executors/get-by-will/${activeWill.id}`,
				{
					method: "GET",
				}
			);

			if (error) {
				// If 404, no executors exist - this is normal
				if (error.includes("404")) {
					console.log("No existing executors found");
					setHasLoadedExecutors(true);
					return;
				}
				toast.error("Failed to load executors");
				return;
			}

			if (data && data.length > 0) {
				// Convert API response to Executor format
				const loadedExecutors: Executor[] = data.map((apiExecutor) => {
					if (apiExecutor.person) {
						// Individual executor
						return {
							id: apiExecutor.id,
							type: "individual" as const,
							firstName: apiExecutor.person.first_name,
							lastName: apiExecutor.person.last_name,
							relationshipId: apiExecutor.person.relationship_id,
							relationshipName: apiExecutor.person.relationship_id,
							personId: apiExecutor.person.id,
							isPrimary: apiExecutor.is_primary,
						};
					} else if (apiExecutor.corporate_executor) {
						// Corporate executor
						return {
							id: apiExecutor.id,
							type: "corporate" as const,
							name: apiExecutor.corporate_executor.name,
							rc_number: apiExecutor.corporate_executor.rc_number,
							corporateExecutorId: apiExecutor.corporate_executor.id,
							isPrimary: apiExecutor.is_primary,
						};
					}
					// Fallback (shouldn't happen)
					return {
						id: apiExecutor.id,
						type: "individual" as const,
						personId: apiExecutor.executor_id,
						isPrimary: apiExecutor.is_primary,
					};
				});

				setExecutors(loadedExecutors);
				console.log("Loaded executors:", loadedExecutors);
			}

			setHasLoadedExecutors(true);
		} catch (err) {
			console.error("Error loading executors:", err);
			toast.error("Failed to load executors");
		} finally {
			setIsLoadingExecutors(false);
		}
	};

	// Helper function to check if form is valid
	const isFormValid = () => {
		if (executorForm.type === "individual") {
			return (
				executorForm.firstName &&
				executorForm.lastName &&
				executorForm.relationshipId
			);
		} else {
			return executorForm.name && executorForm.rc_number;
		}
	};

	// Add executor form handlers
	const handleExecutorFormChange = (field: keyof Executor) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			setExecutorForm((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};
	};

	const handleSaveExecutor = async () => {
		if (!isFormValid() || !activeWill?.id) {
			return;
		}

		console.log("handleSaveExecutor - executorForm:", executorForm);
		console.log("handleSaveExecutor - editingExecutor:", editingExecutor);

		setIsSubmitting(true);
		try {
			let executorId = executorForm.id;

			if (editingExecutor) {
				// EDITING EXISTING EXECUTOR
				if (executorForm.type === "individual") {
					console.log(
						"Editing individual executor with personId:",
						executorForm.personId
					);

					if (!executorForm.personId) {
						toast.error("Person ID is missing for individual executor");
						return;
					}

					// Update person via PATCH /people/{person_id}
					const personPayload = {
						will_id: activeWill.id,
						first_name: executorForm.firstName,
						last_name: executorForm.lastName,
						relationship_id: executorForm.relationshipId,
						is_minor: false,
						is_witness: false,
					};

					const { error: personError } = await apiClient(
						`/people/${executorForm.personId}`,
						{
							method: "PATCH",
							body: JSON.stringify(personPayload),
						}
					);

					if (personError) {
						toast.error("Failed to update person record");
						return;
					}

					// Update executor via PATCH /executors/{id}
					const executorPayload = {
						will_id: activeWill.id,
						executor_id: executorForm.personId,
						is_primary: executorForm.isPrimary,
					};

					const { error: executorError } = await apiClient(
						`/executors/${executorForm.id}`,
						{
							method: "PATCH",
							body: JSON.stringify(executorPayload),
						}
					);

					if (executorError) {
						toast.error("Failed to update executor record");
						return;
					}

					executorId = executorForm.id;
				} else {
					console.log(
						"Editing corporate executor with corporateExecutorId:",
						executorForm.corporateExecutorId
					);

					if (!executorForm.corporateExecutorId) {
						toast.error("Corporate executor ID is missing");
						return;
					}

					// Update corporate executor via PATCH /corporate_executors/{corporate_executor_id}
					const corporateExecutorPayload = {
						will_id: activeWill.id,
						name: executorForm.name,
						rc_number: executorForm.rc_number,
					};

					const { error: corporateExecutorError } = await apiClient(
						`/corporate_executors/${executorForm.corporateExecutorId}`,
						{
							method: "PATCH",
							body: JSON.stringify(corporateExecutorPayload),
						}
					);

					if (corporateExecutorError) {
						toast.error("Failed to update corporate executor record");
						return;
					}

					// Update executor via PATCH /executors/{id}
					const executorPayload = {
						will_id: activeWill.id,
						corporate_executor_id: executorForm.corporateExecutorId,
						is_primary: executorForm.isPrimary,
					};

					const { error: executorError } = await apiClient(
						`/executors/${executorForm.id}`,
						{
							method: "PATCH",
							body: JSON.stringify(executorPayload),
						}
					);

					if (executorError) {
						toast.error("Failed to update executor record");
						return;
					}

					executorId = executorForm.id;
				}
			} else {
				// CREATING NEW EXECUTOR
				if (executorForm.type === "individual") {
					// Create person via /people endpoint
					const personPayload = {
						will_id: activeWill.id,
						first_name: executorForm.firstName,
						last_name: executorForm.lastName,
						relationship_id: executorForm.relationshipId,
						is_minor: false,
						is_witness: false,
					};

					const { data: personData, error: personError } = await apiClient<{
						id: string;
					}>("/people", {
						method: "POST",
						body: JSON.stringify(personPayload),
					});

					if (personError || !personData) {
						toast.error("Failed to create person record");
						return;
					}

					// Create executor via /executors endpoint
					const executorPayload = {
						will_id: activeWill.id,
						executor_id: personData.id,
						is_primary: executorForm.isPrimary,
					};

					const { data: executorData, error: executorError } = await apiClient<{
						id: string;
					}>("/executors", {
						method: "POST",
						body: JSON.stringify(executorPayload),
					});

					if (executorError || !executorData) {
						toast.error("Failed to create executor record");
						return;
					}

					executorId = executorData.id;
				} else {
					// For corporate executors, create corporate executor first then executor
					const corporateExecutorPayload = {
						will_id: activeWill.id,
						name: executorForm.name,
						rc_number: executorForm.rc_number,
					};

					const { data: corporateExecutorData, error: corporateExecutorError } =
						await apiClient<{
							id: string;
						}>("/corporate_executors", {
							method: "POST",
							body: JSON.stringify(corporateExecutorPayload),
						});

					if (corporateExecutorError || !corporateExecutorData) {
						toast.error("Failed to create corporate executor record");
						return;
					}

					// Create executor via /executors endpoint
					const executorPayload = {
						will_id: activeWill.id,
						corporate_executor_id: corporateExecutorData.id,
						is_primary: executorForm.isPrimary,
					};

					const { data: executorData, error: executorError } = await apiClient<{
						id: string;
					}>("/executors", {
						method: "POST",
						body: JSON.stringify(executorPayload),
					});

					if (executorError || !executorData) {
						toast.error("Failed to create executor record");
						return;
					}

					executorId = executorData.id;
				}
			}

			// If this is a primary executor, ensure no other primary exists
			if (executorForm.isPrimary) {
				setExecutors((prev) =>
					prev.map((e) => ({
						...e,
						isPrimary: false,
					}))
				);
			}

			if (editingExecutor) {
				setExecutors((prev) =>
					prev.map((executor) =>
						executor.id === editingExecutor.id
							? { ...executorForm, id: executorId }
							: executor
					)
				);
				toast.success("Executor updated successfully");
			} else {
				setExecutors((prev) => [...prev, { ...executorForm, id: executorId }]);
				toast.success("Executor added successfully");
			}

			// Reset form and close dialog
			setExecutorForm({
				id: "",
				type: "individual",
				firstName: "",
				lastName: "",
				relationshipId: "",
				name: "",
				rc_number: "",
				personId: "",
				corporateExecutorId: "",
				isPrimary: false,
			});
			setEditingExecutor(null);
			setExecutorDialogOpen(false);
		} catch (error) {
			console.error("Error saving executor:", error);
			toast.error("Failed to save executor");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditExecutor = (executor: Executor) => {
		setExecutorForm(executor);
		setEditingExecutor(executor);
		setExecutorDialogOpen(true);
	};

	const handleRemoveExecutor = (executor: Executor) => {
		setExecutorToDelete(executor);
		setConfirmDeleteOpen(true);
	};

	const confirmRemoveExecutor = async () => {
		if (!executorToDelete) return;

		try {
			// Send DELETE request to /executors/{id}
			const { error: executorError } = await apiClient(
				`/executors/${executorToDelete.id}`,
				{
					method: "DELETE",
				}
			);

			if (executorError) {
				toast.error("Failed to remove executor");
				return;
			}

			// If it's a corporate executor, also delete the corporate executor record
			if (
				executorToDelete.type === "corporate" &&
				executorToDelete.corporateExecutorId
			) {
				const { error: corporateError } = await apiClient(
					`/corporate_executors/${executorToDelete.corporateExecutorId}`,
					{
						method: "DELETE",
					}
				);

				if (corporateError) {
					toast.error("Failed to remove corporate executor record");
					return;
				}
			}

			// Remove from local state after successful API calls
			setExecutors((prev) =>
				prev.filter((executor) => executor.id !== executorToDelete.id)
			);

			// If removing Legacy In Order, update checkbox state
			if (
				executorToDelete.type === "corporate" &&
				executorToDelete.name === "Legacy In Order"
			) {
				setUseLegacyInOrder(false);
			}

			toast.success("Executor removed successfully");
			setExecutorToDelete(null);
			setConfirmDeleteOpen(false);
		} catch (err) {
			toast.error("Failed to remove executor");
			console.error("Error removing executor:", err);
		}
	};

	const cancelRemoveExecutor = () => {
		// If canceling removal of Legacy In Order, revert checkbox state
		if (
			executorToDelete &&
			executorToDelete.type === "corporate" &&
			executorToDelete.name === "Legacy In Order"
		) {
			setUseLegacyInOrder(true);
		}

		setExecutorToDelete(null);
		setConfirmDeleteOpen(false);
	};

	// Handle Legacy In Order checkbox change
	const handleLegacyInOrderChange = async (checked: boolean) => {
		if (checked) {
			// Check if Legacy In Order is already added
			const existingLegacyExecutor = executors.find(
				(executor) =>
					executor.type === "corporate" && executor.name === "Legacy In Order"
			);

			if (existingLegacyExecutor) {
				toast.error("Legacy In Order is already added as an executor");
				return;
			}

			if (!activeWill?.id) {
				toast.error("Will ID is required");
				return;
			}

			setIsSubmitting(true);
			try {
				// Create corporate executor record using normal flow
				const corporateExecutorPayload = {
					will_id: activeWill.id,
					name: "Legacy In Order",
					rc_number: "RC123456", // Replace with actual RC number
				};

				const { data: corporateExecutorData, error: corporateExecutorError } =
					await apiClient<{
						id: string;
					}>("/corporate_executors", {
						method: "POST",
						body: JSON.stringify(corporateExecutorPayload),
					});

				if (corporateExecutorError || !corporateExecutorData) {
					toast.error("Failed to create Legacy In Order executor record");
					return;
				}

				// Create executor record as primary
				const executorPayload = {
					will_id: activeWill.id,
					corporate_executor_id: corporateExecutorData.id,
					is_primary: true,
				};

				const { data: executorData, error: executorError } = await apiClient<{
					id: string;
				}>("/executors", {
					method: "POST",
					body: JSON.stringify(executorPayload),
				});

				if (executorError || !executorData) {
					toast.error("Failed to create executor record");
					return;
				}

				// Set all other executors as non-primary since Legacy In Order is primary
				setExecutors((prev) =>
					prev.map((e) => ({
						...e,
						isPrimary: false,
					}))
				);

				// Add Legacy In Order to local state
				const newExecutor: Executor = {
					id: executorData.id,
					type: "corporate",
					name: "Legacy In Order",
					rc_number: "RC123456", // Replace with actual RC number
					corporateExecutorId: corporateExecutorData.id,
					isPrimary: true,
				};

				setExecutors((prev) => [...prev, newExecutor]);
				toast.success("Legacy In Order added as primary executor");
			} catch (error) {
				console.error("Error adding Legacy In Order executor:", error);
				toast.error("Failed to add Legacy In Order executor");
			} finally {
				setIsSubmitting(false);
			}
		} else {
			// Don't immediately change state - let the confirmation dialog handle it
			// Find Legacy In Order executor and trigger removal confirmation
			const legacyExecutor = executors.find(
				(executor) =>
					executor.type === "corporate" && executor.name === "Legacy In Order"
			);

			if (legacyExecutor) {
				// Don't change useLegacyInOrder state here - let the dialog handle it
				handleRemoveExecutor(legacyExecutor);
			}
		}
	};

	// Load executors when component mounts or activeWill changes
	useEffect(() => {
		loadExecutors();
	}, [activeWill?.id]);

	// Update checkbox state based on whether Legacy In Order is already added
	useEffect(() => {
		const hasLegacyInOrder = executors.some(
			(executor) =>
				executor.type === "corporate" && executor.name === "Legacy In Order"
		);
		setUseLegacyInOrder(hasLegacyInOrder);
	}, [executors]);

	// Update parent component when executors change
	useEffect(() => {
		// Only update if executors have actually changed
		if (
			JSON.stringify(executors) !== JSON.stringify(prevExecutorsRef.current)
		) {
			prevExecutorsRef.current = executors;
			onUpdate(executors);
		}
	}, [executors, onUpdate]);

	// Filtering logic for page-level dropdown
	const filteredPeople = enhancedBeneficiaries.filter(
		(beneficiary) =>
			beneficiary.type === "person" &&
			!beneficiary.isMinor && // Exclude minors
			!executors.some((executor) => executor.personId === beneficiary.id) && // Exclude existing executors
			((beneficiary.firstName || "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
				(beneficiary.lastName || "")
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(beneficiary.relationship || "")
					.toLowerCase()
					.includes(searchQuery.toLowerCase()))
	);

	// Handler for selecting a person from the page-level dropdown
	const handleSelectPerson = async (personId: string) => {
		const selected = enhancedBeneficiaries.find(
			(b) => b.id === personId && b.type === "person"
		);

		if (!selected || !activeWill?.id) {
			toast.error("Failed to add executor");
			return;
		}

		setIsSubmitting(true);
		try {
			// Check if person already exists as an executor
			const existingExecutor = executors.find(
				(executor) => executor.personId === selected.id
			);

			if (existingExecutor) {
				toast.error("This person is already an executor");
				return;
			}

			// Create executor record via /executors endpoint
			const executorPayload = {
				will_id: activeWill.id,
				executor_id: selected.id, // Use the existing person ID
				is_primary: executors.length === 0, // Make primary if no other executors
			};

			const { data: executorData, error: executorError } = await apiClient<{
				id: string;
			}>("/executors", {
				method: "POST",
				body: JSON.stringify(executorPayload),
			});

			if (executorError || !executorData) {
				toast.error("Failed to create executor record");
				return;
			}

			// Add to local state
			const newExecutor: Executor = {
				id: executorData.id,
				type: "individual",
				firstName: selected.firstName,
				lastName: selected.lastName,
				relationshipId: selected.relationshipId || "",
				relationshipName: selected.relationship || "",
				personId: selected.id, // Use the existing person ID
				isPrimary: executors.length === 0,
			};

			setExecutors((prev) => [...prev, newExecutor]);

			// Clear the selected person info and search
			setSelectedPersonInfo(null);
			setSearchQuery("");

			toast.success(
				`${selected.firstName} ${selected.lastName} added as executor`
			);
		} catch (error) {
			console.error("Error adding executor:", error);
			toast.error("Failed to add executor");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handler for clearing the selected person
	const handleClearSelectedPerson = () => {
		setSelectedPersonInfo(null);
		setSearchQuery("");
	};

	// Show loading spinner if data is not ready
	if (isDataLoading || !isReady) {
		return <LoadingSpinner message="Loading executor data..." />;
	}

	return (
		<div className="space-y-4">
			<div className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-black">
				Appoint Executors for Your Estate
			</div>
			<div className="text-muted-foreground">
				Executors are responsible for carrying out the terms of your will. You
				should appoint at least one executor, and it's recommended to have a
				backup executor in case the primary executor is unable to serve.
			</div>

			{/* Legacy In Order Recommendation Section */}
			<div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
				<div className="space-y-3">
					<div className="flex items-start">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-green-400 mt-0.5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="ml-3 flex-1">
							<h3 className="text-sm font-medium text-green-800">
								Recommended: Legacy In Order Professional Executor Service
							</h3>
							<div className="mt-2 text-sm text-green-700">
								<p>
									Legacy In Order offers professional executor services to
									ensure your will is executed properly and efficiently. Our
									experienced team handles all legal requirements, asset
									distribution, and administrative tasks.
								</p>
								<ul className="mt-2 list-disc list-inside space-y-1">
									<li>Licensed and bonded professional executors</li>
									<li>Experienced in estate administration</li>
									<li>Available 24/7 for estate matters</li>
									<li>Transparent fee structure</li>
								</ul>
							</div>
							<div className="mt-3 flex items-center space-x-2">
								<Checkbox
									id="useLegacyInOrder"
									checked={useLegacyInOrder}
									onCheckedChange={handleLegacyInOrderChange}
									disabled={isSubmitting}
								/>
								<Label
									htmlFor="useLegacyInOrder"
									className="text-sm font-medium text-green-800"
								>
									Appoint Legacy In Order as my Primary Executor
								</Label>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Executor Selection Dropdown - Full Width */}
			<div className="space-y-4 mt-6">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-medium">Select Executor</h3>
				</div>

				<div className="w-full">
					{selectedPersonInfo ? (
						<div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
							<div className="flex-1">
								<div className="font-medium">
									{selectedPersonInfo.firstName} {selectedPersonInfo.lastName}
								</div>
								<div className="text-sm text-muted-foreground">
									{selectedPersonInfo.relationship}
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearSelectedPerson}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<DropdownMenu
							onOpenChange={setIsPersonDropdownOpen}
							className="w-full"
						>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={isPersonDropdownOpen}
								className="w-full justify-between"
								disabled={isSubmitting}
							>
								{isSubmitting
									? "Adding executor..."
									: searchQuery || "Search and select from existing people..."}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
							<DropdownMenuContent className="w-full min-w-full max-h-[300px] overflow-y-auto">
								<div className="p-2">
									<Input
										placeholder="Search people..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="mb-2"
									/>
									{filteredPeople.length === 0 ? (
										<div className="text-sm text-muted-foreground p-2">
											No people found.
										</div>
									) : (
										<div className="space-y-1">
											{filteredPeople.map((person) => (
												<DropdownMenuItem
													key={person.id}
													onSelect={() => handleSelectPerson(person.id)}
													className="cursor-pointer"
												>
													{person.firstName} {person.lastName} (
													{person.relationship})
												</DropdownMenuItem>
											))}
										</div>
									)}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>

			<div className="space-y-6 mt-6">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-medium">Appointed Executors</h3>
					<Dialog
						open={executorDialogOpen}
						onOpenChange={setExecutorDialogOpen}
					>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								onClick={() => {
									setExecutorForm({
										id: "",
										type: "individual",
										firstName: "",
										lastName: "",
										relationshipId: "",
										name: "",
										rc_number: "",
										personId: "",
										corporateExecutorId: "",
										isPrimary: false,
									});
									setEditingExecutor(null);
								}}
								className="cursor-pointer"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add New Executor
							</Button>
						</DialogTrigger>
						<DialogContent className="bg-white max-w-2xl">
							<DialogHeader>
								<DialogTitle>
									{editingExecutor ? "Edit Executor" : "Add Executor"}
								</DialogTitle>
								<DialogDescription>
									Add an executor who will be responsible for carrying out the
									terms of your will. You can appoint either an individual or a
									corporate executor.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="flex space-x-4 mb-4">
									<Button
										variant={
											executorForm.type === "individual" ? "default" : "outline"
										}
										onClick={() =>
											setExecutorForm((prev) => ({
												...prev,
												type: "individual",
											}))
										}
										className={`cursor-pointer ${
											executorForm.type === "individual"
												? "bg-primary text-white"
												: ""
										}`}
									>
										Individual Executor
									</Button>
									<Button
										variant={
											executorForm.type === "corporate" ? "default" : "outline"
										}
										onClick={() =>
											setExecutorForm((prev) => ({
												...prev,
												type: "corporate",
											}))
										}
										className={`cursor-pointer ${
											executorForm.type === "corporate"
												? "bg-primary text-white"
												: ""
										}`}
									>
										Corporate Executor
									</Button>
								</div>

								{executorForm.type === "individual" ? (
									<>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="executorFirstName">First Name</Label>
												<Input
													id="executorFirstName"
													value={executorForm.firstName}
													onChange={handleExecutorFormChange("firstName")}
													placeholder="John"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="executorLastName">Last Name</Label>
												<Input
													id="executorLastName"
													value={executorForm.lastName}
													onChange={handleExecutorFormChange("lastName")}
													placeholder="Doe"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<RelationshipSelect
												value={executorForm.relationshipId}
												label="Relationship"
												onValueChange={(value) =>
													setExecutorForm((prev) => ({
														...prev,
														relationshipId: value,
													}))
												}
												required={true}
											/>
										</div>
									</>
								) : (
									<>
										<div className="space-y-2">
											<Label htmlFor="companyName">Company Name</Label>
											<Input
												id="companyName"
												value={executorForm.name}
												onChange={handleExecutorFormChange("name")}
												placeholder="Enter company name"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="registrationNumber">
												Registration Number
											</Label>
											<Input
												id="registrationNumber"
												value={executorForm.rc_number}
												onChange={handleExecutorFormChange("rc_number")}
												placeholder="Enter company registration number"
											/>
										</div>
									</>
								)}

								<div className="flex items-center space-x-2">
									<Checkbox
										id="isPrimaryExecutor"
										checked={executorForm.isPrimary}
										onCheckedChange={(checked: boolean) =>
											setExecutorForm((prev) => ({
												...prev,
												isPrimary: checked,
											}))
										}
									/>
									<Label htmlFor="isPrimaryExecutor" className="text-sm">
										Appoint as Primary Executor
									</Label>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										onClick={() => setExecutorDialogOpen(false)}
										disabled={isSubmitting}
										className="cursor-pointer"
									>
										Cancel
									</Button>
									<Button
										onClick={handleSaveExecutor}
										disabled={!isFormValid() || isSubmitting}
										className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
									>
										{isSubmitting ? "Saving..." : "Save"}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{isLoadingExecutors ? (
					<p className="text-muted-foreground text-center py-4">
						Loading executors...
					</p>
				) : executors.length === 0 ? (
					<p className="text-muted-foreground text-center py-4">
						No executors added yet. Click "Add Executor" to appoint executors
						for your estate.
					</p>
				) : (
					<div className="space-y-4">
						{executors.map((executor) => (
							<Card key={executor.id}>
								<CardContent className="p-4">
									<div className="flex justify-between items-start">
										<div className="space-y-1">
											{executor.type === "individual" ? (
												<p className="font-medium">
													{executor.firstName} {executor.lastName}
													<span className="text-sm text-muted-foreground ml-2">
														(
														{getFormattedRelationshipNameById(
															executor.relationshipId || ""
														) !== "Unknown Relationship"
															? getFormattedRelationshipNameById(
																	executor.relationshipId || ""
															  )
															: executor.relationshipName ||
															  "Unknown Relationship"}
														)
													</span>
													{executor.isPrimary && (
														<span className="ml-2 text-sm text-primary">
															(Primary Executor)
														</span>
													)}
												</p>
											) : (
												<div className="space-y-1">
													<p className="font-medium">
														{executor.name}
														<span className="text-sm text-muted-foreground ml-2">
															(Corporate Executor)
														</span>
														{executor.isPrimary && (
															<span className="ml-2 text-sm text-primary">
																(Primary Executor)
															</span>
														)}
													</p>
													<p className="text-sm text-muted-foreground">
														RC Number: {executor.rc_number}
													</p>
												</div>
											)}
										</div>
										<div className="flex space-x-2">
											{/* Conditionally render edit button */}
											{executor.type === "corporate" &&
											executor.name === "Legacy In Order" ? (
												// Show a disabled/non-clickable placeholder for Legacy In Order
												" "
											) : (
												// Show normal edit button for other executors
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEditExecutor(executor)}
													className="cursor-pointer"
												>
													<Edit2 className="h-4 w-4" />
												</Button>
											)}
											{/* Always show delete button */}
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleRemoveExecutor(executor)}
												className="cursor-pointer"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Validation message for multiple primary executors */}
				{executors.filter((executor) => executor.isPrimary).length > 1 && (
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-yellow-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-yellow-800">
									Multiple Primary Executors Selected
								</h3>
								<div className="mt-2 text-sm text-yellow-700">
									<p>
										You can only have one primary executor. Please uncheck the
										"Primary Executor" option for all but one executor to
										continue.
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Validation message for no primary executor */}
				{executors.length > 0 &&
					executors.filter((executor) => executor.isPrimary).length === 0 && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-yellow-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-yellow-800">
										No Primary Executor Selected
									</h3>
									<div className="mt-2 text-sm text-yellow-700">
										<p>
											You must designate one executor as the primary executor.
											Please check the "Primary Executor" option for one of your
											executors to continue.
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

				<div className="flex justify-between pt-4">
					<Button variant="outline" onClick={onBack} className="cursor-pointer">
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
					<Button
						onClick={onNext}
						disabled={
							executors.length === 0 ||
							executors.filter((executor) => executor.isPrimary).length > 1 ||
							executors.filter((executor) => executor.isPrimary).length === 0
						}
						className="cursor-pointer bg-primary hover:bg-primary/90 text-white"
					>
						Next <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Confirm Delete Dialog */}
			<AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Executor</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this executor? This action cannot
							be undone.
						</AlertDialogDescription>
						{executorToDelete && (
							<div className="mt-2 p-2 bg-muted rounded text-sm space-y-1">
								{executorToDelete.type === "individual" ? (
									<div>
										<strong>Individual Executor:</strong>{" "}
										{executorToDelete.firstName} {executorToDelete.lastName}
										{executorToDelete.relationshipId && (
											<span className="text-muted-foreground ml-1">
												(
												{getFormattedRelationshipNameById(
													executorToDelete.relationshipId
												) !== "Unknown Relationship"
													? getFormattedRelationshipNameById(
															executorToDelete.relationshipId
													  )
													: executorToDelete.relationshipName ||
													  "Unknown Relationship"}
												)
											</span>
										)}
										{executorToDelete.isPrimary && (
											<span className="ml-2 text-primary text-xs">
												(Primary Executor)
											</span>
										)}
									</div>
								) : (
									<div>
										<strong>Corporate Executor:</strong> {executorToDelete.name}
										{executorToDelete.rc_number && (
											<div className="text-muted-foreground">
												RC Number: {executorToDelete.rc_number}
											</div>
										)}
										{executorToDelete.isPrimary && (
											<span className="ml-2 text-primary text-xs">
												(Primary Executor)
											</span>
										)}
									</div>
								)}
							</div>
						)}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelRemoveExecutor}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmRemoveExecutor}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Remove Executor
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
