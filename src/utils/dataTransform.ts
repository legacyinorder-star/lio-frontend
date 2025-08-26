// Utility functions to convert snake_case API responses to camelCase for React components
import {
	WillData,
	WillAssetBeneficiary,
	WillBeneficiary,
	WillExecutor,
	WillWitness,
} from "../context/WillContext";
import { getFormattedRelationshipNameById } from "./relationships";
import { QuestionType } from "@/components/will-wizard/types/will.types";

/**
 * Converts a snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively converts all object keys from snake_case to camelCase
 */
export function convertKeysToCamelCase<T>(obj: unknown): T {
	if (obj === null || obj === undefined) {
		return obj as T;
	}

	if (Array.isArray(obj)) {
		return obj.map(convertKeysToCamelCase) as T;
	}

	if (typeof obj === "object") {
		const converted: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
			const camelKey = snakeToCamel(key);
			converted[camelKey] = convertKeysToCamelCase(value);
		}
		return converted as T;
	}

	return obj as T;
}

/**
 * Maps API will data to WillContext format with proper camelCase conversion
 */
export function mapWillDataFromAPI(apiData: unknown): WillData {
	const converted = convertKeysToCamelCase<Record<string, unknown>>(apiData);

	return {
		id: (converted.id as string) || "",
		lastUpdatedAt:
			(converted.lastUpdatedAt as string) ||
			(converted.updatedAt as string) ||
			new Date().toISOString(),
		createdAt: (converted.createdAt as string) || new Date().toISOString(),
		status: (converted.status as string) || "draft",
		userId: (converted.userId as string) || (converted.user_id as string) || "",
		// Payment data
		paymentStatus:
			(converted.paymentStatus as string) ||
			(converted.payment_status as string),
		paymentDate:
			(converted.paymentDate as string) || (converted.payment_date as string),
		// Document data
		document: converted.document
			? {
					willId:
						((converted.document as Record<string, unknown>)
							.willId as string) ||
						((converted.document as Record<string, unknown>)
							.will_id as string) ||
						"",
					userId:
						((converted.document as Record<string, unknown>)
							.userId as string) ||
						((converted.document as Record<string, unknown>)
							.user_id as string) ||
						"",
					document: {
						url:
							((
								(converted.document as Record<string, unknown>)
									.document as Record<string, unknown>
							)?.url as string) || "",
						meta:
							((
								(converted.document as Record<string, unknown>)
									.document as Record<string, unknown>
							)?.meta as Record<string, unknown>) || {},
						mime:
							((
								(converted.document as Record<string, unknown>)
									.document as Record<string, unknown>
							)?.mime as string) || "",
						name:
							((
								(converted.document as Record<string, unknown>)
									.document as Record<string, unknown>
							)?.name as string) || "",
						path:
							((
								(converted.document as Record<string, unknown>)
									.document as Record<string, unknown>
							)?.path as string) || "",
						size:
							((
								(converted.document as Record<string, unknown>)
									.document as Record<string, unknown>
							)?.size as number) || 0,
						type:
							((
								(converted.document as Record<string, unknown>)
									.document as Record<string, unknown>
							)?.type as string) || "",
						access:
							((
								(converted.document as Record<string, unknown>)
									.document as Record<string, unknown>
							)?.access as Record<string, unknown>) || {},
					},
			  }
			: undefined,

		// Owner data
		owner: {
			id: (converted.owner as Record<string, unknown>)?.id as string,
			firstName:
				((converted.owner as Record<string, unknown>)?.firstName as string) ||
				((converted.owner as Record<string, unknown>)?.first_name as string) ||
				"",
			middleName:
				((converted.owner as Record<string, unknown>)?.middleName as string) ||
				((converted.owner as Record<string, unknown>)?.middle_name as string) ||
				"",
			lastName:
				((converted.owner as Record<string, unknown>)?.lastName as string) ||
				((converted.owner as Record<string, unknown>)?.last_name as string) ||
				"",
			dateOfBirth:
				((converted.owner as Record<string, unknown>)?.dateOfBirth as string) ||
				((converted.owner as Record<string, unknown>)
					?.date_of_birth as string) ||
				"",
			maritalStatus:
				((converted.owner as Record<string, unknown>)
					?.maritalStatus as string) ||
				((converted.owner as Record<string, unknown>)
					?.marital_status as string) ||
				"",
			address:
				((converted.owner as Record<string, unknown>)?.address as string) || "",
			city:
				((converted.owner as Record<string, unknown>)?.city as string) || "",
			state:
				((converted.owner as Record<string, unknown>)?.state as string) || "",
			postCode:
				((converted.owner as Record<string, unknown>)?.postCode as string) ||
				((converted.owner as Record<string, unknown>)?.post_code as string) ||
				"",
			country:
				((converted.owner as Record<string, unknown>)?.country as string) || "",
		},

		// Spouse data
		spouse: converted.spouse
			? {
					id: (converted.spouse as Record<string, unknown>).id as string,
					firstName:
						((converted.spouse as Record<string, unknown>)
							.firstName as string) ||
						((converted.spouse as Record<string, unknown>)
							.first_name as string) ||
						"",
					lastName:
						((converted.spouse as Record<string, unknown>)
							.lastName as string) ||
						((converted.spouse as Record<string, unknown>)
							.last_name as string) ||
						"",
			  }
			: undefined,

		// Children data
		children:
			(converted.children as Array<Record<string, unknown>>)?.map(
				(child: Record<string, unknown>) => ({
					id: child.id as string,
					firstName:
						(child.firstName as string) || (child.first_name as string) || "",
					lastName:
						(child.lastName as string) || (child.last_name as string) || "",
					isMinor:
						(child.isMinor as boolean) || (child.is_minor as boolean) || false,
				})
			) || [],

		// Guardians data
		guardians:
			(converted.guardians as Array<Record<string, unknown>>)?.map(
				(guardian: Record<string, unknown>) => ({
					id: guardian.id as string,
					firstName:
						((guardian.person as Record<string, unknown>)
							?.firstName as string) ||
						((guardian.person as Record<string, unknown>)
							?.first_name as string) ||
						(guardian.firstName as string) ||
						(guardian.first_name as string) ||
						"",
					lastName:
						((guardian.person as Record<string, unknown>)
							?.lastName as string) ||
						((guardian.person as Record<string, unknown>)
							?.last_name as string) ||
						(guardian.lastName as string) ||
						(guardian.last_name as string) ||
						"",
					relationship: (guardian.relationship as string) || "",
					isPrimary:
						(guardian.isPrimary as boolean) ||
						(guardian.is_primary as boolean) ||
						false,
				})
			) || [],

		// Assets data
		assets:
			(converted.assets as Array<Record<string, unknown>>)?.map(
				(asset: Record<string, unknown>) => {
					const beneficiaries =
						(asset.beneficiaries as Array<Record<string, unknown>>) || [];
					return {
						id: asset.id as string,
						assetType:
							(asset.assetType as string) || (asset.asset_type as string) || "",
						description: (asset.description as string) || "",
						hasBeneficiaries: beneficiaries.length > 0,
						distributionType:
							beneficiaries.length > 0
								? (asset.distributionType as "equal" | "percentage") ||
								  (asset.distribution_type as "equal" | "percentage") ||
								  "equal"
								: undefined,
						beneficiaries:
							(asset.beneficiaries as Array<Record<string, unknown>>)?.map(
								(beneficiary: Record<string, unknown>) => ({
									id: beneficiary.id as string,
									percentage: (beneficiary.percentage as number) || 0,
									peopleId:
										(beneficiary.peopleId as string) ||
										(beneficiary.people_id as string),
									charitiesId:
										(beneficiary.charitiesId as string) ||
										(beneficiary.charities_id as string),
									person: beneficiary.person
										? {
												id: (beneficiary.person as Record<string, unknown>)
													.id as string,
												firstName:
													((beneficiary.person as Record<string, unknown>)
														.firstName as string) ||
													((beneficiary.person as Record<string, unknown>)
														.first_name as string) ||
													"",
												lastName:
													((beneficiary.person as Record<string, unknown>)
														.lastName as string) ||
													((beneficiary.person as Record<string, unknown>)
														.last_name as string) ||
													"",
												relationship:
													((beneficiary.person as Record<string, unknown>)
														.relationship as string) || "",
												relationshipId:
													((beneficiary.person as Record<string, unknown>)
														.relationshipId as string) ||
													((beneficiary.person as Record<string, unknown>)
														.relationship_id as string) ||
													"",
												isMinor:
													((beneficiary.person as Record<string, unknown>)
														.isMinor as boolean) ||
													((beneficiary.person as Record<string, unknown>)
														.is_minor as boolean) ||
													false,
										  }
										: undefined,
									charity: beneficiary.charity
										? {
												id: (beneficiary.charity as Record<string, unknown>)
													.id as string,
												name:
													((beneficiary.charity as Record<string, unknown>)
														.name as string) || "",
												registrationNumber:
													((beneficiary.charity as Record<string, unknown>)
														.registrationNumber as string) ||
													((beneficiary.charity as Record<string, unknown>)
														.rc_number as string),
										  }
										: undefined,
								})
							) || [],
					};
				}
			) || [],

		// Gifts data
		gifts:
			(converted.gifts as Array<Record<string, unknown>>)?.map(
				(gift: Record<string, unknown>) => ({
					id: gift.id as string,
					type: (gift.type as string) || "",
					description: (gift.description as string) || "",
					value: (gift.value as number) || undefined,
					currency: (gift.currency as string) || undefined,
					peopleId:
						(gift.peopleId as string) ||
						(gift.people_id as string) ||
						undefined,
					charitiesId:
						(gift.charitiesId as string) ||
						(gift.charities_id as string) ||
						undefined,
					person: gift.person
						? {
								id: (gift.person as Record<string, unknown>).id as string,
								firstName:
									((gift.person as Record<string, unknown>)
										.firstName as string) ||
									((gift.person as Record<string, unknown>)
										.first_name as string) ||
									"",
								lastName:
									((gift.person as Record<string, unknown>)
										.lastName as string) ||
									((gift.person as Record<string, unknown>)
										.last_name as string) ||
									"",
								relationship:
									((gift.person as Record<string, unknown>)
										.relationship as string) || "",
								relationshipId:
									((gift.person as Record<string, unknown>)
										.relationshipId as string) ||
									((gift.person as Record<string, unknown>)
										.relationship_id as string) ||
									"",
								isMinor:
									((gift.person as Record<string, unknown>)
										.isMinor as boolean) ||
									((gift.person as Record<string, unknown>)
										.is_minor as boolean) ||
									false,
						  }
						: undefined,
					charity: gift.charity
						? {
								id: (gift.charity as Record<string, unknown>).id as string,
								name:
									((gift.charity as Record<string, unknown>).name as string) ||
									"",
								registrationNumber:
									((gift.charity as Record<string, unknown>)
										.registrationNumber as string) ||
									((gift.charity as Record<string, unknown>)
										.rc_number as string),
						  }
						: undefined,
				})
			) || [],

		// Digital assets data
		digitalAssets: converted.digitalAssets
			? {
					beneficiaryId:
						((converted.digitalAssets as Record<string, unknown>)
							.beneficiaryId as string) ||
						((converted.digitalAssets as Record<string, unknown>)
							.beneficiary_id as string) ||
						"",
			  }
			: undefined,

		// Other arrays
		beneficiaries:
			(converted.beneficiaries as Array<Record<string, unknown>>)?.map(
				(beneficiary: Record<string, unknown>): WillBeneficiary => ({
					firstName:
						(beneficiary.firstName as string) ||
						(beneficiary.first_name as string) ||
						"",
					lastName:
						(beneficiary.lastName as string) ||
						(beneficiary.last_name as string) ||
						"",
					relationship: (beneficiary.relationship as string) || "",
					allocation: (beneficiary.allocation as number) || 0,
				})
			) || [],
		executors:
			(converted.executors as Array<Record<string, unknown>>)?.map(
				(executor: Record<string, unknown>): WillExecutor => ({
					firstName:
						(executor.firstName as string) || (executor.first_name as string),
					lastName:
						(executor.lastName as string) || (executor.last_name as string),
					companyName:
						(executor.companyName as string) ||
						(executor.company_name as string),
					relationship: executor.relationship as string,
					address: {
						address:
							((executor.address as Record<string, unknown>)
								?.address as string) || "",
						city:
							((executor.address as Record<string, unknown>)?.city as string) ||
							"",
						state:
							((executor.address as Record<string, unknown>)
								?.state as string) || "",
						postCode:
							((executor.address as Record<string, unknown>)
								?.postCode as string) ||
							((executor.address as Record<string, unknown>)
								?.post_code as string),
						country:
							((executor.address as Record<string, unknown>)
								?.country as string) || "",
					},
					isPrimary:
						(executor.isPrimary as boolean) ||
						(executor.is_primary as boolean) ||
						false,
					type: (executor.type as "individual" | "corporate") || "individual",
					contactPerson:
						(executor.contactPerson as string) ||
						(executor.contact_person as string),
				})
			) || [],
		witnesses:
			(converted.witnesses as Array<Record<string, unknown>>)?.map(
				(witness: Record<string, unknown>): WillWitness => ({
					firstName:
						(witness.firstName as string) ||
						(witness.first_name as string) ||
						"",
					lastName:
						(witness.lastName as string) || (witness.last_name as string) || "",
					address: {
						address:
							((witness.address as Record<string, unknown>)
								?.address as string) || "",
						city:
							((witness.address as Record<string, unknown>)?.city as string) ||
							"",
						state:
							((witness.address as Record<string, unknown>)?.state as string) ||
							"",
						postCode:
							((witness.address as Record<string, unknown>)
								?.postCode as string) ||
							((witness.address as Record<string, unknown>)
								?.post_code as string),
						country:
							((witness.address as Record<string, unknown>)
								?.country as string) || "",
					},
				})
			) || [],

		// Funeral instructions
		funeralInstructions: converted.funeralInstructions
			? {
					wishes:
						((converted.funeralInstructions as Record<string, unknown>)
							.wishes as string) || "",
			  }
			: converted.funeral_instructions
			? {
					wishes:
						((converted.funeral_instructions as Record<string, unknown>)
							.wishes as string) || "",
			  }
			: undefined,

		// Progress data
		progress: converted.progress
			? {
					id: (converted.progress as Record<string, unknown>).id as string,
					createdAt: (converted.progress as Record<string, unknown>)
						.createdAt as string,
					willId: (converted.progress as Record<string, unknown>)
						.willId as string,
					userId: (converted.progress as Record<string, unknown>)
						.userId as string,
					completedSteps: (converted.progress as Record<string, unknown>)
						.completedSteps as Record<QuestionType, boolean>,
					currentStep: (converted.progress as Record<string, unknown>)
						.currentStep as QuestionType,
					updatedAt: (converted.progress as Record<string, unknown>)
						.updatedAt as string,
			  }
			: undefined,
	};
}

/**
 * Maps asset beneficiary data from API response to WillContext format
 */
export function mapAssetBeneficiariesFromAPI(
	assetBeneficiaries: Array<{
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
	}>
): WillAssetBeneficiary[] {
	return assetBeneficiaries.map((assetBeneficiary) => {
		// Check if people_id is set (individual)
		if (assetBeneficiary.people_id && assetBeneficiary.people_id !== null) {
			if (assetBeneficiary.person) {
				return {
					id: assetBeneficiary.id,
					percentage: assetBeneficiary.percentage,
					peopleId: assetBeneficiary.people_id,
					person: {
						id: assetBeneficiary.person.id,
						firstName: assetBeneficiary.person.first_name,
						lastName: assetBeneficiary.person.last_name,
						relationship:
							getFormattedRelationshipNameById(
								assetBeneficiary.person.relationship_id
							) || "Unknown Relationship",
						relationshipId: assetBeneficiary.person.relationship_id,
						isMinor: assetBeneficiary.person.is_minor,
					},
				};
			} else {
				// Deleted person - don't create fake person object
				return {
					id: assetBeneficiary.id,
					percentage: assetBeneficiary.percentage,
					peopleId: assetBeneficiary.people_id,
					// person is undefined, indicating deleted beneficiary
				};
			}
		}

		// Check if charities_id is set (charity)
		if (
			assetBeneficiary.charities_id &&
			assetBeneficiary.charities_id !== null
		) {
			if (assetBeneficiary.charity) {
				return {
					id: assetBeneficiary.id,
					percentage: assetBeneficiary.percentage,
					charitiesId: assetBeneficiary.charities_id,
					charity: {
						id: assetBeneficiary.charity.id,
						name: assetBeneficiary.charity.name,
						registrationNumber: assetBeneficiary.charity.rc_number,
					},
				};
			} else {
				// Deleted charity - don't create fake charity object
				return {
					id: assetBeneficiary.id,
					percentage: assetBeneficiary.percentage,
					charitiesId: assetBeneficiary.charities_id,
					// charity is undefined, indicating deleted beneficiary
				};
			}
		}

		// Ultimate fallback - this shouldn't happen with proper data
		return {
			id: assetBeneficiary.id,
			percentage: assetBeneficiary.percentage,
			peopleId: assetBeneficiary.id,
			person: {
				id: assetBeneficiary.id,
				firstName: "Unknown",
				lastName: "Beneficiary",
				relationship: "Unknown Relationship",
				relationshipId: "",
				isMinor: false,
			},
		};
	});
}
