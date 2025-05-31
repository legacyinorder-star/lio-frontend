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
import { Gift, GiftType, NewBeneficiary } from "../types/will.types";

const giftSchema = z.object({
	type: z.enum(["Cash", "Item", "Other"]),
	description: z.string().min(1, "Description is required"),
	value: z.number().optional(),
	beneficiaryId: z.string().min(1, "Beneficiary is required"),
});

interface GiftsStepProps {
	onNext: (data: { gifts: Gift[] }) => void;
	onBack: () => void;
	initialData?: {
		gifts: Gift[];
	};
	beneficiaries: NewBeneficiary[];
}

export default function GiftsStep({
	onNext,
	onBack,
	initialData,
	beneficiaries,
}: GiftsStepProps) {
	const [gifts, setGifts] = useState<Gift[]>(initialData?.gifts || []);
	const [giftDialogOpen, setGiftDialogOpen] = useState(false);
	const [editingGift, setEditingGift] = useState<Gift | null>(null);

	const [giftForm, setGiftForm] = useState<Omit<Gift, "id">>({
		type: "Cash",
		description: "",
		value: undefined,
		beneficiaryId: "",
	});

	const form = useForm<z.infer<typeof giftSchema>>({
		resolver: zodResolver(giftSchema),
		defaultValues: {
			type: "Cash",
			description: "",
			value: undefined,
			beneficiaryId: "",
		},
	});

	const handleSubmit = () => {
		onNext({ gifts });
	};

	const handleGiftFormChange =
		(field: keyof Omit<Gift, "id">) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setGiftForm((prev) => ({
				...prev,
				[field]: field === "value" ? Number(e.target.value) : e.target.value,
			}));
		};

	const handleSaveGift = () => {
		if (!giftForm.description || !giftForm.beneficiaryId) {
			return;
		}

		if (editingGift) {
			setGifts((prev) =>
				prev.map((gift) =>
					gift.id === editingGift.id ? { ...giftForm, id: gift.id } : gift
				)
			);
		} else {
			setGifts((prev) => [...prev, { ...giftForm, id: crypto.randomUUID() }]);
		}

		setGiftForm({
			type: "Cash",
			description: "",
			value: undefined,
			beneficiaryId: "",
		});
		setEditingGift(null);
		setGiftDialogOpen(false);
	};

	const handleEditGift = (gift: Gift) => {
		setEditingGift(gift);
		setGiftForm({
			type: gift.type,
			description: gift.description,
			value: gift.value,
			beneficiaryId: gift.beneficiaryId,
		});
		setGiftDialogOpen(true);
	};

	const handleRemoveGift = (giftId: string) => {
		setGifts((prev) => prev.filter((gift) => gift.id !== giftId));
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
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Your Gifts</h3>
							<Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										onClick={() => {
											setGiftForm({
												type: "Cash",
												description: "",
												value: undefined,
												beneficiaryId: "",
											});
											setEditingGift(null);
										}}
										className="cursor-pointer"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Gift
									</Button>
								</DialogTrigger>
								<DialogContent className="bg-white">
									<DialogHeader>
										<DialogTitle>
											{editingGift ? "Edit Gift" : "Add Gift"}
										</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<Label>Gift Type</Label>
											<Select
												value={giftForm.type}
												onValueChange={(value: GiftType) =>
													setGiftForm((prev) => ({ ...prev, type: value }))
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select gift type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Cash">Cash</SelectItem>
													<SelectItem value="Item">Item</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label>Description</Label>
											<Input
												value={giftForm.description}
												onChange={handleGiftFormChange("description")}
												placeholder="Describe the gift"
											/>
										</div>
										{giftForm.type === "Cash" && (
											<div className="space-y-2">
												<Label>Value</Label>
												<Input
													type="number"
													value={giftForm.value || ""}
													onChange={handleGiftFormChange("value")}
													placeholder="$0.00"
												/>
											</div>
										)}
										<div className="space-y-2">
											<Label>Beneficiary</Label>
											<Select
												value={giftForm.beneficiaryId}
												onValueChange={(value) =>
													setGiftForm((prev) => ({
														...prev,
														beneficiaryId: value,
													}))
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select beneficiary" />
												</SelectTrigger>
												<SelectContent>
													{beneficiaries.map((beneficiary) => (
														<SelectItem
															key={beneficiary.id}
															value={beneficiary.id}
														>
															{`${beneficiary.firstName} ${beneficiary.lastName}`}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="flex justify-end space-x-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setGiftDialogOpen(false)}
											>
												Cancel
											</Button>
											<Button
												type="button"
												onClick={handleSaveGift}
												className="bg-light-green hover:bg-light-green/90 text-black"
											>
												Save
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>

						{gifts.length === 0 ? (
							<p className="text-muted-foreground text-center py-4">
								No gifts added yet. Click "Add Gift" to specify gifts for your
								beneficiaries.
							</p>
						) : (
							<div className="space-y-4">
								{gifts.map((gift) => (
									<div
										key={gift.id}
										className="flex justify-between items-start p-4 border rounded-lg"
									>
										<div className="space-y-1">
											<div className="flex items-center space-x-2">
												<p className="font-medium">{gift.type}</p>
												{gift.type === "Cash" && gift.value && (
													<span className="text-sm text-muted-foreground">
														${gift.value.toLocaleString()}
													</span>
												)}
											</div>
											<p className="text-sm">{gift.description}</p>
											<p className="text-sm text-muted-foreground">
												To:{" "}
												{
													beneficiaries.find((b) => b.id === gift.beneficiaryId)
														?.firstName
												}{" "}
												{
													beneficiaries.find((b) => b.id === gift.beneficiaryId)
														?.lastName
												}
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
												onClick={() => handleRemoveGift(gift.id)}
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
