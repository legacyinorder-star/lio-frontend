import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const assetSchema = z.object({
	type: z.string().min(1, "Asset type is required"),
	description: z.string().min(1, "Description is required"),
	value: z.string().min(1, "Value is required"),
});

export type Asset = z.infer<typeof assetSchema>;

interface AssetsStepProps {
	data: Asset[];
	onUpdate: (data: Asset[]) => void;
}

export default function AssetsStep({ data, onUpdate }: AssetsStepProps) {
	const [assets, setAssets] = useState<Asset[]>(data);

	const form = useForm<Asset>({
		resolver: zodResolver(assetSchema),
		defaultValues: {
			type: "",
			description: "",
			value: "",
		},
	});

	const onSubmit = (values: Asset) => {
		const updatedAssets = [...assets, values];
		setAssets(updatedAssets);
		onUpdate(updatedAssets);
		form.reset();
	};

	const removeAsset = (index: number) => {
		const updatedAssets = assets.filter((_, i) => i !== index);
		setAssets(updatedAssets);
		onUpdate(updatedAssets);
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-4">
				{assets.map((asset, index) => (
					<div
						key={index}
						className="flex items-center justify-between p-4 border rounded-lg"
					>
						<div>
							<h4 className="font-medium">{asset.type}</h4>
							<p className="text-sm text-muted-foreground">
								{asset.description}
							</p>
							<p className="text-sm">Value: {asset.value}</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => removeAsset(index)}
							className="text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Asset Type</FormLabel>
								<FormControl>
									<select
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										{...field}
									>
										<option value="">Select type</option>
										<option value="real_estate">Real Estate</option>
										<option value="vehicle">Vehicle</option>
										<option value="bank_account">Bank Account</option>
										<option value="investment">Investment</option>
										<option value="jewelry">Jewelry</option>
										<option value="art">Art</option>
										<option value="other">Other</option>
									</select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Input placeholder="Describe the asset" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="value"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Estimated Value</FormLabel>
								<FormControl>
									<Input type="text" placeholder="$0.00" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Add Asset</Button>
				</form>
			</Form>
		</div>
	);
}
