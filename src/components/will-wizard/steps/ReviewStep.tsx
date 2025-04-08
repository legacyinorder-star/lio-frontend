import type { PersonalInfoData } from "./PersonalInfoStep";
import type { Asset } from "./AssetsStep";
import type { Beneficiary } from "./BeneficiariesStep";
import type { ExecutorData } from "./ExecutorStep";

interface ReviewStepProps {
	data: {
		personal: Partial<PersonalInfoData>;
		assets: Asset[];
		beneficiaries: Beneficiary[];
		executor: Partial<ExecutorData>;
	};
}

export default function ReviewStep({ data }: ReviewStepProps) {
	const totalAllocation = data.beneficiaries.reduce(
		(sum, b) => sum + Number(b.allocation),
		0
	);

	return (
		<div className="space-y-8">
			<div>
				<h3 className="text-lg font-medium">Personal Information</h3>
				<div className="mt-2 space-y-2">
					<p>
						<span className="font-medium">Full Name:</span>{" "}
						{data.personal.fullName}
					</p>
					<p>
						<span className="font-medium">Date of Birth:</span>{" "}
						{data.personal.dateOfBirth}
					</p>
					<p>
						<span className="font-medium">Address:</span>{" "}
						{data.personal.address}
					</p>
					<p>
						<span className="font-medium">Phone:</span> {data.personal.phone}
					</p>
					<p>
						<span className="font-medium">Marital Status:</span>{" "}
						{data.personal.maritalStatus}
					</p>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-medium">Assets</h3>
				<div className="mt-2 space-y-2">
					{data.assets.map((asset, index) => (
						<div key={index} className="p-3 border rounded-md">
							<p>
								<span className="font-medium">Type:</span> {asset.type}
							</p>
							<p>
								<span className="font-medium">Description:</span>{" "}
								{asset.description}
							</p>
							<p>
								<span className="font-medium">Value:</span> {asset.value}
							</p>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="text-lg font-medium">Beneficiaries</h3>
				<p className="text-sm text-muted-foreground mb-2">
					Total Allocation: {totalAllocation}%
				</p>
				<div className="mt-2 space-y-2">
					{data.beneficiaries.map((beneficiary, index) => (
						<div key={index} className="p-3 border rounded-md">
							<p>
								<span className="font-medium">Name:</span>{" "}
								{beneficiary.fullName}
							</p>
							<p>
								<span className="font-medium">Relationship:</span>{" "}
								{beneficiary.relationship}
							</p>
							<p>
								<span className="font-medium">Email:</span> {beneficiary.email}
							</p>
							<p>
								<span className="font-medium">Phone:</span> {beneficiary.phone}
							</p>
							<p>
								<span className="font-medium">Allocation:</span>{" "}
								{beneficiary.allocation}%
							</p>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="text-lg font-medium">Executor</h3>
				<div className="mt-2 space-y-2">
					<p>
						<span className="font-medium">Name:</span> {data.executor.fullName}
					</p>
					<p>
						<span className="font-medium">Relationship:</span>{" "}
						{data.executor.relationship}
					</p>
					<p>
						<span className="font-medium">Email:</span> {data.executor.email}
					</p>
					<p>
						<span className="font-medium">Phone:</span> {data.executor.phone}
					</p>
					<p>
						<span className="font-medium">Address:</span>{" "}
						{data.executor.address}
					</p>
				</div>
			</div>
		</div>
	);
}
