import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Helper function to format date
const formatDate = (date: Date): string => {
	const day = date.getDate();
	const month = date.toLocaleString("en-US", { month: "long" }).toUpperCase();
	const year = date.getFullYear();

	// Add ordinal suffix to day
	const getOrdinalSuffix = (n: number): string => {
		const s = ["th", "st", "nd", "rd"];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	};

	return `${getOrdinalSuffix(day)} ${month} ${year}`;
};

// Create styles
const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#ffffff",
		padding: 40,
		fontFamily: "Helvetica",
		fontSize: 14,
	},
	centeredTitle: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 0,
		height: "100%",
	},
	titleContainer: {
		textAlign: "center",
		marginTop: -100, // Adjust this value to fine-tune vertical position
	},
	datedText: {
		fontSize: 24,
		marginBottom: 30,
		textAlign: "center",
	},
	willTitle: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 30,
		textAlign: "center",
	},
	testatorName: {
		fontSize: 24,
		marginBottom: 20,
		textAlign: "center",
	},
	header: {
		marginBottom: 20,
		textAlign: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 14,
		color: "#666666",
		marginBottom: 20,
	},
	section: {
		marginBottom: 10,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "left",
	},
	row: {
		flexDirection: "row",
		marginBottom: 5,
	},
	label: {
		width: "30%",
		fontWeight: "bold",
	},
	value: {
		width: "70%",
	},
	item: {
		marginBottom: 10,
		padding: 10,
		border: "1px solid #e5e5e5",
		borderRadius: 4,
	},
	introductoryParagraph: {
		marginTop: 40,
		textAlign: "justify",
		fontSize: 14,
	},
	introductoryParagraph2: {
		marginTop: 20,
		textAlign: "justify",
		fontSize: 14,
	},
	scopeSection: {
		marginTop: 40,
		marginBottom: 20,
	},
	scopeTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	scopeText: {
		textAlign: "justify",
		fontSize: 14,
		marginBottom: 15,
	},
	executorSection: {
		marginTop: 30,
		marginBottom: 20,
	},
	executorTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	executorText: {
		textAlign: "justify",
		fontSize: 14,
		marginBottom: 15,
	},
	executorList: {
		marginTop: 20,
		marginBottom: 20,
	},
	executorItem: {
		marginBottom: 10,
		paddingLeft: 20,
	},
	distributionSection: {
		marginTop: 30,
		marginBottom: 20,
	},
	distributionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	distributionText: {
		textAlign: "justify",
		fontSize: 14,
		marginBottom: 15,
	},
	assetItem: {
		marginBottom: 20,
	},
	assetDescription: {
		textAlign: "justify",
		fontSize: 14,
		marginBottom: 10,
		paddingLeft: 20,
	},
	guardianSection: {
		marginTop: 30,
		marginBottom: 20,
	},
	guardianTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	guardianText: {
		textAlign: "justify",
		fontSize: 14,
		marginBottom: 15,
	},
	guardianList: {
		marginTop: 20,
		marginBottom: 20,
	},
	guardianItem: {
		marginBottom: 10,
		paddingLeft: 20,
	},
	giftSection: {
		marginTop: 30,
		marginBottom: 20,
	},
	giftTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	giftText: {
		textAlign: "justify",
		fontSize: 14,
		marginBottom: 15,
	},
	giftItem: {
		marginBottom: 20,
	},
	giftDescription: {
		textAlign: "justify",
		fontSize: 14,
		marginBottom: 10,
		paddingLeft: 20,
	},
	witnessSection: {
		marginTop: 40,
		marginBottom: 20,
	},
	witnessTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	witnessText: {
		textAlign: "justify",
		fontSize: 14,
		marginBottom: 15,
	},
	witnessSignature: {
		marginTop: 40,
		marginBottom: 10,
	},
	witnessName: {
		fontSize: 14,
		marginBottom: 5,
	},
	witnessAddress: {
		fontSize: 12,
		color: "#666666",
		marginBottom: 20,
	},
	witnessDate: {
		fontSize: 12,
		color: "#666666",
		marginTop: 20,
	},
	signatureLine: {
		borderBottom: "1px solid #000000",
		width: "60%",
		marginBottom: 5,
	},
	additionalInstructionsSection: {
		marginTop: 20,
		marginBottom: 20,
	},
	additionalInstructionsTitle: {
		fontSize: 14,
		fontWeight: "bold",
		marginBottom: 10,
	},
	additionalInstructionsText: {
		fontSize: 12,
		lineHeight: 1.5,
		marginBottom: 10,
	},
});

interface WillPDFProps {
	data: {
		personal: {
			fullName: string;
			dateOfBirth: string;
			address: string;
			phone: string;
			maritalStatus: string;
		};
		assets: Array<{
			type: string;
			description: string;
			distributionType?: "equal" | "percentage";
			beneficiaries?: Array<{
				id?: string;
				percentage?: number;
			}>;
		}>;
		beneficiaries: Array<{
			id?: string;
			fullName: string;
			relationship: string;
			email?: string;
			phone?: string;
			allocation: number;
			dateOfBirth?: string;
			requiresGuardian?: boolean;
		}>;
		executors: Array<{
			fullName?: string;
			companyName?: string;
			relationship?: string;
			email?: string;
			phone?: string;
			address: string;
			isPrimary: boolean;
			type: "individual" | "corporate";
			contactPerson?: string;
			registrationNumber?: string;
		}>;
		witnesses: Array<{
			fullName: string;
			address: string;
		}>;
		guardians?: Array<{
			fullName: string;
			relationship: string;
			isPrimary: boolean;
			address?: string;
		}>;
		gifts?: Array<{
			type: string;
			description: string;
			value?: string;
			beneficiaryId: string;
			beneficiaryName: string;
		}>;
		residuaryBeneficiaries?: Array<{
			id: string;
			beneficiaryId: string;
			percentage: number;
		}>;
		additionalInstructions?: string;
	};
	additionalText?: string;
}

const WillPDF: React.FC<WillPDFProps> = ({ data, additionalText }) => {
	// Find primary executor
	const primaryExecutor = data.executors.find((exec) => exec.isPrimary);
	// Get additional executors (excluding primary)
	const additionalExecutors = data.executors.filter((exec) => !exec.isPrimary);

	// Find primary and alternative guardians
	const primaryGuardian = data.guardians?.find((g) => g.isPrimary);
	const alternativeGuardians =
		data.guardians?.filter((g) => !g.isPrimary) || [];

	// Helper function to check if guardians section should be shown
	const shouldShowGuardiansSection = () => {
		return data.guardians && data.guardians.length > 0;
	};

	// Helper function to get distribution text for an asset
	const getAssetDistributionText = (_asset: {
		type: string;
		description: string;
		distributionType?: "equal" | "percentage";
		beneficiaries?: { id?: string; percentage?: number }[];
	}) => {
		// Get beneficiaries with non-zero allocation for this asset
		const relevantBeneficiaries = _asset.beneficiaries || [];

		if (relevantBeneficiaries.length === 0) {
			return "No beneficiaries specified";
		}

		// Handle single beneficiary case
		if (relevantBeneficiaries.length === 1) {
			const beneficiary = data.beneficiaries.find(
				(ben) =>
					ben.id === relevantBeneficiaries[0].id ||
					ben.fullName === relevantBeneficiaries[0].id
			) || { fullName: "Unknown Beneficiary" };

			if (_asset.distributionType === "equal") {
				return `to ${beneficiary.fullName}`;
			} else if (_asset.distributionType === "percentage") {
				return `to ${beneficiary.fullName} (${relevantBeneficiaries[0].percentage}%)`;
			} else {
				return `to ${beneficiary.fullName}`;
			}
		}

		// Handle multiple beneficiaries
		const distributionText = relevantBeneficiaries
			.map((b, idx) => {
				const isSecondLast = idx === relevantBeneficiaries.length - 2;
				const prefix = idx === 0 ? "" : isSecondLast ? " and " : ", ";
				// Find the beneficiary in the data to get their name
				const beneficiary = data.beneficiaries.find(
					(ben) => ben.id === b.id || ben.fullName === b.id
				) || { fullName: "Unknown Beneficiary" }; // Fallback if not found

				if (_asset.distributionType === "equal") {
					// For equal distribution, just show the name
					return `${prefix}${beneficiary.fullName}`;
				} else if (_asset.distributionType === "percentage") {
					// For percentage distribution, show the percentage
					return `${prefix}${beneficiary.fullName} (${b.percentage}%)`;
				} else {
					return `${prefix}${beneficiary.fullName}`;
				}
			})
			.join("");

		// Add distribution type suffix for equal distribution
		if (
			_asset.distributionType === "equal" &&
			relevantBeneficiaries.length > 0
		) {
			return `${distributionText} (equally)`;
		}

		return distributionText;
	};

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.centeredTitle}>
					<View style={styles.titleContainer}>
						<Text style={styles.datedText}>DATED</Text>
						<Text style={styles.datedText}>{formatDate(new Date())}</Text>
						<Text style={styles.willTitle}>LAST WILL & TESTAMENT</Text>
						<Text style={styles.testatorName}>OF</Text>
						<Text style={styles.testatorName}>
							{data.personal.fullName.toUpperCase()}
						</Text>
					</View>
				</View>

				{/* Scope Section */}
				<View style={styles.scopeSection}>
					<Text style={styles.scopeTitle}>Scope of this will</Text>
					<Text style={styles.scopeText}>
						I am {data.personal.fullName} of {data.personal.address}.
					</Text>
					<Text style={styles.scopeText}>
						I declare, being of sound mind, that this will is made in accordance
						with my wishes and is intended to be my last will and testament,
						revoking all previous wills and testamentary dispositions made by
						me.
					</Text>
					<Text style={styles.scopeText}>
						This will sets out my wishes regarding the distribution of my estate
						after my death. It includes all my assets, both movable and
						immovable, wherever they may be situated, and any property over
						which I have a power of appointment or disposition.
					</Text>
				</View>

				{/* Executors Section */}
				<View style={styles.executorSection}>
					<Text style={styles.executorTitle}>Appointment of Executors</Text>

					{primaryExecutor && (
						<Text style={styles.executorText}>
							I appoint{" "}
							{primaryExecutor.type === "individual"
								? primaryExecutor.fullName
								: `${primaryExecutor.companyName} (${primaryExecutor.contactPerson})`}{" "}
							of {primaryExecutor.address} as my primary executor
							{primaryExecutor.type === "corporate"
								? " (a corporate executor)"
								: ""}
							.
						</Text>
					)}

					{additionalExecutors.length > 0 && (
						<>
							<Text style={styles.executorText}>
								If my primary executor is unable to perform their duties, I also
								appoint the following as my alternative executors:
							</Text>
							<View style={styles.executorList}>
								{additionalExecutors.map((executor, index) => (
									<View key={index} style={styles.executorItem}>
										<Text style={styles.executorText}>
											{index + 1}.{" "}
											{executor.type === "individual"
												? executor.fullName
												: `${executor.companyName} (${executor.contactPerson})`}{" "}
											of {executor.address}
											{executor.type === "corporate"
												? " (a corporate executor)"
												: ""}
										</Text>
									</View>
								))}
							</View>
						</>
					)}

					<Text style={styles.executorText}>
						I give my executors full power to deal with my estate as they think
						fit, including the power to sell, lease, mortgage, or otherwise deal
						with any part of my estate, and to invest and reinvest the proceeds
						of any such dealing.
					</Text>
				</View>

				{/* Guardians Section */}
				{shouldShowGuardiansSection() && (
					<View style={styles.guardianSection}>
						<Text style={styles.guardianTitle}>Appointment of Guardians</Text>

						{primaryGuardian && (
							<Text style={styles.guardianText}>
								I appoint {primaryGuardian.fullName}
								{primaryGuardian.relationship
									? ` (my ${primaryGuardian.relationship})`
									: ""}{" "}
								{primaryGuardian.address} as the primary guardian of my minor
								children.
							</Text>
						)}

						{alternativeGuardians.length > 0 && (
							<>
								<Text style={styles.guardianText}>
									If my primary guardian is unable or unwilling to act, I
									appoint the following as alternative guardians:
								</Text>
								<View style={styles.guardianList}>
									{alternativeGuardians.map((guardian, index) => (
										<View key={index} style={styles.guardianItem}>
											<Text style={styles.guardianText}>
												{index + 1}. {guardian.fullName}
												{guardian.relationship
													? ` (my ${guardian.relationship})`
													: ""}{" "}
											</Text>
										</View>
									))}
								</View>
							</>
						)}

						<Text style={styles.guardianText}>
							I direct that my appointed guardians shall have full authority to
							make decisions regarding the care, education, and welfare of my
							minor children, including but not limited to decisions about their
							residence, education, healthcare, and general upbringing.
						</Text>
					</View>
				)}

				{/* Asset Distribution Section */}
				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>Distribution of Assets</Text>

					<Text style={styles.distributionText}>
						I give, devise, and bequeath my estate as follows:
					</Text>

					{data.assets.map((asset, index) => (
						<View key={index} style={styles.assetItem}>
							<Text style={styles.assetDescription}>
								{index + 1}. {asset.description} ({asset.type})
							</Text>
							<Text style={[styles.assetDescription, { paddingLeft: 40 }]}>
								{getAssetDistributionText(asset)}
							</Text>
						</View>
					))}
				</View>

				{/* Specific Bequests Section */}
				{data.gifts && data.gifts.length > 0 && (
					<View style={styles.giftSection}>
						<Text style={styles.giftTitle}>Specific Bequests</Text>
						<Text style={styles.giftText}>
							I hereby make the following specific bequests:
						</Text>

						{data.gifts.map((gift, index) => (
							<View key={index} style={styles.giftItem}>
								<Text style={styles.giftDescription}>
									{index + 1}. I give and bequeath{" "}
									{gift.type === "Cash" && gift.value
										? `the sum of $${Number(gift.value).toLocaleString()}`
										: gift.description}{" "}
									to {gift.beneficiaryName}.
								</Text>
							</View>
						))}

						<Text style={styles.giftText}>
							I direct that these specific bequests shall be paid or delivered
							as soon as practicable after my death, and that any interest
							accruing on cash bequests shall be paid to the respective
							beneficiaries.
						</Text>
					</View>
				)}

				{/* Estate Administration Section */}
				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>Administration of Estate</Text>
					<Text style={styles.distributionText}>
						All the assets that I can dispose of by will are my Estate. My
						executors may sell all or any of the assets in my Estate as they
						consider appropriate. From my Estate they must pay:
					</Text>

					<Text style={styles.distributionText}>1. my debts;</Text>

					<Text style={styles.distributionText}>
						2. my funeral and testamentary expenses; and
					</Text>

					<Text style={styles.distributionText}>
						3. all the previous gifts in this will.
					</Text>

					<Text style={styles.distributionText}>
						My Residuary Estate is whatever remains when these payments have
						been made. The term Residuary Estate also includes the assets
						representing the remainder, and any added income.
					</Text>
				</View>

				{/* Residuary Estate Section */}
				{data.residuaryBeneficiaries &&
					data.residuaryBeneficiaries.length > 0 && (
						<View style={styles.distributionSection}>
							<Text style={styles.distributionTitle}>
								Gifts of my Residuary Estate
							</Text>

							<Text style={styles.distributionText}>
								I direct that my executors shall distribute my residuary estate
								in accordance with the following provisions:
							</Text>
							{data.residuaryBeneficiaries.map((beneficiary, index) => {
								const beneficiaryDetails = data.beneficiaries.find(
									(b) => b.id === beneficiary.beneficiaryId
								);
								if (!beneficiaryDetails) return null;

								return (
									<View key={index} style={styles.assetItem}>
										<Text style={styles.assetDescription}>
											{beneficiaryDetails.fullName} - {beneficiary.percentage}%
											{beneficiaryDetails.relationship
												? ` (${beneficiaryDetails.relationship})`
												: ""}
										</Text>
									</View>
								);
							})}

							<Text style={styles.distributionText}>
								I declare that if any of my residuary beneficiaries predecease
								me, their share shall be distributed equally among the surviving
								residuary beneficiaries.
							</Text>
						</View>
					)}

				{/* Add Additional Instructions section */}
				{(data.additionalInstructions || additionalText) && (
					<View style={styles.additionalInstructionsSection}>
						<Text style={styles.additionalInstructionsTitle}>
							Additional Instructions and Information
						</Text>
						{data.additionalInstructions && (
							<Text style={styles.additionalInstructionsText}>
								{data.additionalInstructions}
							</Text>
						)}
						{additionalText && (
							<Text style={styles.additionalInstructionsText}>
								{additionalText}
							</Text>
						)}
					</View>
				)}

				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						Power for beneficiaries to disclaim gifts
					</Text>
					<Text style={styles.distributionText}>
						Any beneficiary of this will may disclaim any interest in my Estate
						in whole or in part.
					</Text>
				</View>

				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>Powers for my executors</Text>
					<Text style={styles.distributionText}>
						My executors may transfer assets in kind from my Estate or from my
						Residuary Estate to any beneficiary to satisfy (wholly or partly)
						the beneficiary's interest in my Estate or my Residuary Estate.
					</Text>
					<Text style={styles.distributionText}>
						My executors may borrow cash or other assets for any purpose and may
						mortgage or charge assets in my Estate as security for any borrowing
					</Text>
				</View>

				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						Paying and protecting my executors
					</Text>
					<Text style={styles.distributionText}>
						Anyone who is acting as one of my executors in the course of a
						business or profession (Professional Executor) is entitled to charge
						and be paid reasonable remuneration for any services that they or
						their firm provides.
					</Text>
					<Text style={styles.distributionText}>
						None of my executors, other than a Professional Executor, is liable
						for any loss to my Estate or my Residuary Estate unless it results
						from the executor in question:
					</Text>
					<Text style={styles.distributionText}>
						1. acting in a way they know to be contrary to the interests of the
						beneficiaries of this will; or{" "}
					</Text>

					<Text style={styles.distributionText}>
						2. being recklessly indifferent about whether an action is contrary
						to the beneficiaries' interests.
					</Text>
				</View>

				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						Meaning of words used in this will
					</Text>
					<Text style={styles.distributionText}>
						The rules of interpretation in this clause apply in this will.
					</Text>
					<Text style={styles.distributionText}>
						Express and implied references to an individual's children [do not
						include the individual's children who are illegitimate] [but do]
						include the individual's stepchildren, even if the individual has
						not adopted them
					</Text>
					<Text style={styles.distributionText}>
						References to testamentary expenses include all the expenses
						incurred in obtaining a grant of probate for my Estate, such as:
					</Text>
					<Text style={styles.distributionText}>
						any fees for the preparation of the will;
					</Text>
					<Text style={styles.distributionText}>
						1. the costs of any action that my executors need to take, including
						necessary legal proceedings;
					</Text>
					<Text style={styles.distributionText}>
						2. the costs of collecting in, preserving and selling assets in my
						Estate;
					</Text>
					<Text style={styles.distributionText}>
						3. the costs of administering my Estate, including the professional
						charges of solicitors, valuers and other advisers; and{" "}
					</Text>
					<Text style={styles.distributionText}>
						4. inheritance tax for which my executors are liable under this will
						and which is treated as part of the general testamentary and
						administration expenses of my Estate
					</Text>
				</View>

				{/* Witness Signatures Section */}
				<View style={styles.witnessSection}>
					<Text style={styles.witnessTitle}>Witness Signatures</Text>
					<Text style={styles.witnessText}>
						I declare that this is my last will and testament, and I sign it in
						the presence of the following witnesses, who in my presence and in
						the presence of each other, sign as witnesses:
					</Text>

					{/* Testator Signature */}
					<View style={styles.witnessSignature}>
						<View style={styles.signatureLine} />
						<Text style={styles.witnessName}>
							Signed by {data.personal.fullName} (Testator)
						</Text>
						<Text style={styles.witnessDate}>Date: _________________</Text>
					</View>

					{/* Witness Signatures */}
					{data.witnesses.map((witness, index) => (
						<View key={index} style={styles.witnessSignature}>
							<View style={styles.signatureLine} />
							<Text style={styles.witnessName}>
								{witness.fullName} (Witness)
							</Text>
							<Text style={styles.witnessAddress}>{witness.address}</Text>
							<Text style={styles.witnessDate}>Date: _________________</Text>
						</View>
					))}

					<Text style={styles.witnessText}>
						Signed by the testator in our presence and then by us in the
						presence of the testator and each other on the date shown above.
					</Text>
				</View>
			</Page>
		</Document>
	);
};

export default WillPDF;
