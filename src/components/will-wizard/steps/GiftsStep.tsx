import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	ArrowRight,
	Edit2,
	Plus,
	Trash2,
	DollarSign,
	Gift,
	Package,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
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
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/custom-dropdown-menu";
import { ChevronsUpDown, X } from "lucide-react";
import {
	Gift as GiftType,
	GiftType as GiftTypeEnum,
} from "../types/will.types";
import { useWillData } from "@/hooks/useWillData";
import { useDataLoading } from "@/context/DataLoadingContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useWill } from "@/context/WillContext";
import { useGiftManagement } from "@/hooks/useGiftManagement";
import { getFormattedRelationshipNameById } from "@/utils/relationships";
import { NewBeneficiaryDialog } from "../components/NewBeneficiaryDialog";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";

const giftSchema = z
	.object({
		type: z.enum(["Cash", "Item", "Other"]),
		description: z.string().min(1, "Description is required"),
		value: z.number().optional(),
		currency: z.string().optional(),
		peopleId: z.string().optional(),
		charitiesId: z.string().optional(),
	})
	.refine((data) => data.peopleId || data.charitiesId, {
		message: "Either peopleId or charitiesId is required",
		path: ["peopleId"],
	});

// Gift type options with icons
const GIFT_TYPES = [
	{
		value: "Cash" as GiftTypeEnum,
		label: "Cash",
		icon: DollarSign,
		description: "Monetary gifts or cash bequests",
	},
	{
		value: "Item" as GiftTypeEnum,
		label: "Item",
		icon: Package,
		description: "Personal items or possessions",
	},
	{
		value: "Other" as GiftTypeEnum,
		label: "Other",
		icon: Gift,
		description: "Other specific gifts or bequests",
	},
];

// Currency options
const CURRENCIES = [
	{ code: "USD", symbol: "$", name: "US Dollar" },
	{ code: "EUR", symbol: "€", name: "Euro" },
	{ code: "GBP", symbol: "£", name: "British Pound" },
	{ code: "CAD", symbol: "C$", name: "Canadian Dollar" },
	{ code: "AUD", symbol: "A$", name: "Australian Dollar" },
	{ code: "NGN", symbol: "₦", name: "Nigerian Naira" },
	{ code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
	{ code: "AED", symbol: "د.إ", name: "UAE Dirham" },
	{ code: "QAR", symbol: "ر.ق", name: "Qatari Riyal" },
	{ code: "JPY", symbol: "¥", name: "Japanese Yen" },
	{ code: "CHF", symbol: "CHF", name: "Swiss Franc" },
	{ code: "CNY", symbol: "¥", name: "Chinese Yuan" },
	{ code: "INR", symbol: "₹", name: "Indian Rupee" },
	{ code: "BRL", symbol: "R$", name: "Brazilian Real" },
];

// Gift type pill component
const GiftTypePill = ({
	type,
	selected,
	onClick,
	className = "",
}: {
	type: (typeof GIFT_TYPES)[0];
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
						? "bg-light-green text-black border-light-green"
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

interface GiftsStepProps {
	onNext: (data: { gifts: GiftType[] }) => void;
	onBack: () => void;
	initialData?: {
		gifts: GiftType[];
	};
}

export default function GiftsStep({
	onNext,
	onBack,
	initialData,
}: GiftsStepProps) {
	const [giftForm, setGiftForm] = useState<Omit<GiftType, "id">>({
		type: "Cash",
		description: "",
		value: undefined,
		currency: "USD",
		peopleId: "",
		charitiesId: "",
	});
	const [editingGift, setEditingGift] = useState<GiftType | null>(null);
	const [giftDialogOpen, setGiftDialogOpen] = useState(false);
	const [newBeneficiaryDialogOpen, setNewBeneficiaryDialogOpen] =
		useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isBeneficiaryDropdownOpen, setIsBeneficiaryDropdownOpen] =
		useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [giftToDelete, setGiftToDelete] = useState<GiftType | null>(null);

	const {
		allBeneficiaries: enhancedBeneficiaries,
		relationships,
		addIndividualBeneficiary,
		addCharityBeneficiary,
		isLoading: isDataLoading,
		isReady,
	} = useWillData();
	const { updateLoadingState } = useDataLoading();
	const { activeWill } = useWill();
	const { gifts, saveGift, removeGift } = useGiftManagement(
		initialData?.gifts || [],
		enhancedBeneficiaries
	);

	const form = useForm<z.infer<typeof giftSchema>>({
		resolver: zodResolver(giftSchema),
		defaultValues: {
			type: "Cash",
			description: "",
			value: undefined,
			currency: "USD",
			peopleId: "",
			charitiesId: "",
		},
	});

	// Update loading state for gifts
	useEffect(() => {
		updateLoadingState("gifts", isDataLoading);
	}, [isDataLoading, updateLoadingState]);

	// Initialize form when editing
	useEffect(() => {
		if (editingGift) {
			setGiftForm({
				type: editingGift.type,
				description: editingGift.description,
				value: editingGift.value,
				currency: editingGift.currency,
				peopleId: editingGift.peopleId || "",
				charitiesId: editingGift.charitiesId || "",
			});
		} else {
			setGiftForm({
				type: "Cash",
				description: "",
				value: undefined,
				currency: "USD",
				peopleId: "",
				charitiesId: "",
			});
		}
	}, [editingGift]);

	// Show loading spinner if data is not ready
	if (isDataLoading || !isReady) {
		return <LoadingSpinner message="Loading gifts data..." />;
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// The form validation is not needed for the Next button since we're just passing the gifts
		// The form validation is only used for the gift dialog
		onNext({ gifts });
	};

	const handleGiftFormChange =
		(field: keyof Omit<GiftType, "id">) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>
		) => {
			setGiftForm((prev) => ({
				...prev,
				[field]: field === "value" ? Number(e.target.value) : e.target.value,
			}));
		};

	const handleSelectBeneficiary = (beneficiaryId: string) => {
		if (!beneficiaryId) return;

		// Determine if it's a person or charity based on the beneficiary type
		const beneficiary = enhancedBeneficiaries.find(
			(b) => b.id === beneficiaryId
		);
		if (beneficiary) {
			setGiftForm((prev) => ({
				...prev,
				peopleId: beneficiary.type === "person" ? beneficiaryId : "",
				charitiesId: beneficiary.type === "charity" ? beneficiaryId : "",
			}));
		}

		// Close dropdown and clear search
		setSearchQuery("");
		setIsBeneficiaryDropdownOpen(false);
	};

	const handleSaveGift = async () => {
		if (
			!giftForm.description ||
			(!giftForm.peopleId && !giftForm.charitiesId)
		) {
			return;
		}

		const savedGift = await saveGift(giftForm, editingGift?.id);

		if (savedGift) {
			setGiftForm({
				type: "Cash",
				description: "",
				value: undefined,
				currency: "USD",
				peopleId: "",
				charitiesId: "",
			});
			setEditingGift(null);
			setGiftDialogOpen(false);
		}
	};

	const handleEditGift = (gift: GiftType) => {
		setEditingGift(gift);
		setGiftForm({
			type: gift.type,
			description: gift.description,
			value: gift.value,
			currency: gift.currency,
			peopleId: gift.peopleId || "",
			charitiesId: gift.charitiesId || "",
		});
		setGiftDialogOpen(true);
	};

	const handleRemoveGift = (gift: GiftType) => {
		setGiftToDelete(gift);
		setConfirmDeleteOpen(true);
	};

	const confirmRemoveGift = async () => {
		if (giftToDelete) {
			try {
				// Send DELETE request to API
				const { error } = await apiClient(`/gifts/${giftToDelete.id}`, {
					method: "DELETE",
				});

				if (error) {
					toast.error("Failed to remove gift");
					return;
				}

				// Remove from local state after successful API call
				await removeGift(giftToDelete.id);
				toast.success("Gift removed successfully");
				setGiftToDelete(null);
				setConfirmDeleteOpen(false);
			} catch (err) {
				toast.error("Failed to remove gift");
				console.error("Error removing gift:", err);
			}
		}
	};

	const cancelRemoveGift = () => {
		setGiftToDelete(null);
		setConfirmDeleteOpen(false);
	};

	const handleAddNewBeneficiary = () => {
		setNewBeneficiaryDialogOpen(true);
	};

	const handleAddIndividualBeneficiary = async (
		firstName: string,
		lastName: string,
		relationshipId: string
	) => {
		await addIndividualBeneficiary(firstName, lastName, relationshipId);
	};

	const handleAddCharityBeneficiary = async (
		charityName: string,
		registrationNumber?: string
	) => {
		await addCharityBeneficiary(charityName, registrationNumber);
	};

	// Filter beneficiaries based on search query
	const filteredBeneficiaries = enhancedBeneficiaries.filter(
		(beneficiary) =>
			beneficiary.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			beneficiary.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(beneficiary.registrationNumber &&
				beneficiary.registrationNumber
					.toLowerCase()
					.includes(searchQuery.toLowerCase()))
	);

	// Helper function to get beneficiary ID from form
	const getBeneficiaryIdFromForm = () => {
		return giftForm.peopleId || giftForm.charitiesId || "";
	};

	// Helper function to get selected beneficiary from form
	const getSelectedBeneficiaryFromForm = () => {
		const beneficiaryId = getBeneficiaryIdFromForm();
		return enhancedBeneficiaries.find((b) => b.id === beneficiaryId);
	};

	// Get selected beneficiary details
	const selectedBeneficiary = getSelectedBeneficiaryFromForm();

	// Helper function to get beneficiary ID from Gift
	const getBeneficiaryIdFromGift = (gift: GiftType) => {
		return gift.peopleId || gift.charitiesId || "";
	};

	// Helper function to get beneficiary from gift
	const getBeneficiaryFromGift = (gift: GiftType) => {
		const beneficiaryId = getBeneficiaryIdFromGift(gift);

		// First try to find in enhancedBeneficiaries
		const enhancedBeneficiary = enhancedBeneficiaries.find(
			(b) => b.id === beneficiaryId
		);
		if (enhancedBeneficiary) {
			return enhancedBeneficiary;
		}

		// Fallback to will context if enhancedBeneficiaries is empty
		if (activeWill?.gifts) {
			const willGift = activeWill.gifts.find((wg) => wg.id === gift.id);
			if (willGift) {
				if (willGift.person) {
					return {
						id: willGift.person.id,
						firstName: willGift.person.firstName,
						lastName: willGift.person.lastName,
						relationship: willGift.person.relationship,
						relationshipId: willGift.person.relationshipId,
						type: "person" as const,
					};
				} else if (willGift.charity) {
					return {
						id: willGift.charity.id,
						firstName: willGift.charity.name,
						lastName: "",
						relationship: "Charity",
						registrationNumber: willGift.charity.registrationNumber,
						type: "charity" as const,
					};
				}
			}
		}

		return null;
	};

	return (
		<div className="space-y-4">
			<div className="text-2xl font-semibold">Specify any one-off gifts</div>
			<div className="text-muted-foreground">
				Add any specific gifts you'd like to leave to particular individuals.
				This could include cash gifts, personal items, or other specific
				bequests.
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Your Gifts</h3>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setGiftForm({
										type: "Cash",
										description: "",
										value: undefined,
										currency: "USD",
										peopleId: "",
										charitiesId: "",
									});
									setEditingGift(null);
									setGiftDialogOpen(true);
								}}
								className="cursor-pointer"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Gift
							</Button>
						</div>

						{gifts.length === 0 ? (
							<p className="text-muted-foreground text-center py-4">
								No gifts added yet. Click "Add Gift" to specify gifts for your
								beneficiaries.
							</p>
						) : (
							<div className="space-y-4">
								{gifts.map((gift) => {
									const beneficiary = getBeneficiaryFromGift(gift);
									const relationship = beneficiary?.relationshipId
										? getFormattedRelationshipNameById(
												relationships,
												beneficiary.relationshipId
										  ) || beneficiary.relationship
										: beneficiary?.relationship || "Unknown";

									// Get currency symbol for display
									const currencyInfo = gift.currency
										? CURRENCIES.find((c) => c.code === gift.currency)
										: null;

									return (
										<div
											key={gift.id}
											className="flex justify-between items-start p-4 border rounded-lg"
										>
											<div className="space-y-1">
												<div className="flex items-center space-x-2">
													<p className="font-medium">{gift.type}</p>
													{gift.type === "Cash" && gift.value && (
														<span className="text-sm text-muted-foreground">
															{currencyInfo?.symbol || gift.currency || "$"}
															{gift.value.toLocaleString()}
														</span>
													)}
												</div>
												<p className="text-sm">{gift.description}</p>
												<p className="text-sm text-muted-foreground">
													To: {beneficiary?.firstName} {beneficiary?.lastName} (
													{relationship})
													{beneficiary?.type === "charity" &&
														beneficiary.registrationNumber &&
														` - Reg: ${beneficiary.registrationNumber}`}
												</p>
											</div>
											<div className="flex space-x-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => handleEditGift(gift)}
												>
													<Edit2 className="h-4 w-4 mr-2" />
													Edit
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => handleRemoveGift(gift)}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Remove
												</Button>
											</div>
										</div>
									);
								})}
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

			{/* Gift Dialog */}
			<Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
				<DialogContent className="bg-white max-w-2xl">
					<DialogHeader>
						<DialogTitle>{editingGift ? "Edit Gift" : "Add Gift"}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{/* Gift Type Selector */}
						<div className="space-y-4">
							<Label>Gift Type</Label>
							<div className="grid grid-cols-3 gap-2 min-w-0">
								{GIFT_TYPES.map((type) => (
									<GiftTypePill
										key={type.value}
										type={type}
										selected={giftForm.type === type.value}
										onClick={() =>
											setGiftForm((prev) => ({ ...prev, type: type.value }))
										}
									/>
								))}
							</div>
							<div className="text-sm text-muted-foreground">
								{GIFT_TYPES.find((t) => t.value === giftForm.type)?.description}
							</div>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="giftDescription">Description</Label>
							<textarea
								id="giftDescription"
								value={giftForm.description}
								onChange={handleGiftFormChange("description")}
								placeholder="Describe the gift, its location and any details that may be relevant"
								className="w-full min-h-[100px] p-2 border rounded-md"
							/>
						</div>

						{/* Value and Currency (only for Cash gifts) */}
						{giftForm.type === "Cash" && (
							<div className="space-y-2">
								<div className="flex space-x-[0rem]">
									{/* Currency Selection */}
									<div className="w-48">
										<Label>Currency</Label>
										<DropdownMenu>
											<Button
												type="button"
												variant="outline"
												className="w-full justify-between"
												aria-expanded={isBeneficiaryDropdownOpen}
											>
												{(() => {
													const selectedCurrency = CURRENCIES.find(
														(c) => c.code === giftForm.currency
													);
													return selectedCurrency ? (
														<span>
															{selectedCurrency.symbol} -{" "}
															{selectedCurrency.name}
														</span>
													) : (
														<span className="text-muted-foreground">
															Select currency
														</span>
													);
												})()}
												<ChevronsUpDown className="h-4 w-4" />
											</Button>
											<DropdownMenuContent className="w-[300px] max-h-[300px] overflow-y-auto">
												<div className="space-y-1">
													{CURRENCIES.map((currency) => (
														<DropdownMenuItem
															key={currency.code}
															onSelect={() =>
																setGiftForm((prev) => ({
																	...prev,
																	currency: currency.code,
																}))
															}
															className="cursor-pointer"
														>
															{currency.symbol} - {currency.name}
														</DropdownMenuItem>
													))}
												</div>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									{/* Value Input */}
									<div className="flex-1 w-full">
										<Label htmlFor="giftValue">Value</Label>
										<Input
											id="giftValue"
											type="number"
											value={giftForm.value || ""}
											onChange={handleGiftFormChange("value")}
											placeholder="0.00"
										/>
									</div>
								</div>
							</div>
						)}

						{/* Beneficiary Selection */}
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<Label>Beneficiary</Label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleAddNewBeneficiary}
									className="cursor-pointer"
								>
									<Plus className="mr-2 h-4 w-4" />
									Add New Beneficiary
								</Button>
							</div>
							<div className="w-[600px]">
								<DropdownMenu
									className="w-[600px] max-h-[300px]"
									onOpenChange={setIsBeneficiaryDropdownOpen}
								>
									<Button
										type="button"
										variant="outline"
										className="w-full justify-between"
										aria-expanded={isBeneficiaryDropdownOpen}
									>
										{selectedBeneficiary ? (
											<span>
												{selectedBeneficiary.firstName}{" "}
												{selectedBeneficiary.lastName} (
												{selectedBeneficiary.relationshipId
													? getFormattedRelationshipNameById(
															relationships,
															selectedBeneficiary.relationshipId
													  ) || selectedBeneficiary.relationship
													: selectedBeneficiary.relationship}
												)
												{selectedBeneficiary.type === "charity" &&
													selectedBeneficiary.registrationNumber &&
													` - Reg: ${selectedBeneficiary.registrationNumber}`}
											</span>
										) : (
											<span className="text-muted-foreground">
												Select beneficiary
											</span>
										)}
										<ChevronsUpDown className="h-4 w-4" />
									</Button>
									<DropdownMenuContent className="w-[600px] max-h-[300px] overflow-y-auto">
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
															{beneficiary.firstName} {beneficiary.lastName} (
															{beneficiary.relationshipId
																? getFormattedRelationshipNameById(
																		relationships,
																		beneficiary.relationshipId
																  ) || beneficiary.relationship
																: beneficiary.relationship}
															)
															{beneficiary.type === "charity" &&
																beneficiary.registrationNumber &&
																` - Reg: ${beneficiary.registrationNumber}`}
														</DropdownMenuItem>
													))}
												</div>
											)}
										</div>
									</DropdownMenuContent>
								</DropdownMenu>

								{selectedBeneficiary && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() =>
											setGiftForm((prev) => ({
												...prev,
												peopleId: "",
												charitiesId: "",
											}))
										}
										className="absolute right-2 top-1/2 transform -translate-y-1/2"
									>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							className="cursor-pointer"
							onClick={() => setGiftDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSaveGift}
							disabled={
								!giftForm.description ||
								(!giftForm.peopleId && !giftForm.charitiesId)
							}
							className="bg-light-green hover:bg-light-green/90 text-black cursor-pointer"
						>
							{editingGift ? "Save Changes" : "Add Gift"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* New Beneficiary Dialog */}
			<NewBeneficiaryDialog
				open={newBeneficiaryDialogOpen}
				onOpenChange={setNewBeneficiaryDialogOpen}
				onAddIndividual={handleAddIndividualBeneficiary}
				onAddCharity={handleAddCharityBeneficiary}
			/>

			{/* Confirm Delete Dialog */}
			<AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Gift</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this gift? This action cannot be
							undone.
						</AlertDialogDescription>
						{giftToDelete && (
							<div className="mt-2 p-2 bg-muted rounded text-sm space-y-1">
								<div>
									<strong>{giftToDelete.type}:</strong>{" "}
									{giftToDelete.description}
								</div>
								{(() => {
									const beneficiary = getBeneficiaryFromGift(giftToDelete);
									const relationship = beneficiary?.relationshipId
										? getFormattedRelationshipNameById(
												relationships,
												beneficiary.relationshipId
										  ) || beneficiary.relationship
										: beneficiary?.relationship || "Unknown";

									return beneficiary ? (
										<div className="text-muted-foreground">
											<strong>To:</strong> {beneficiary.firstName}{" "}
											{beneficiary.lastName} ({relationship})
											{beneficiary.type === "charity" &&
												beneficiary.registrationNumber &&
												` - Reg: ${beneficiary.registrationNumber}`}
										</div>
									) : null;
								})()}
							</div>
						)}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelRemoveGift}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmRemoveGift}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Remove Gift
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
