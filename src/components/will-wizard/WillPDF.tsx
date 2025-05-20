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
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
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
		marginTop: 40,
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
		marginTop: 40,
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
		marginTop: 40,
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
		marginTop: 40,
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
			value: string;
			distributionType: "equal" | "percentage";
			beneficiaries: Array<{
				id: string;
				percentage?: number;
			}>;
		}>;
		beneficiaries: Array<{
			id: string;
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
		guardians: Array<{
			fullName: string;
			relationship: string;
			isPrimary: boolean;
			address?: string;
		}>;
		gifts: Array<{
			type: string;
			description: string;
			value?: string;
			beneficiaryId: string;
			beneficiaryName: string;
		}>;
	};
	additionalText?: string;
}

const WillPDF = ({ data }: WillPDFProps) => {
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
		value: string;
		distributionType: "equal" | "percentage";
		beneficiaries: { id: string; percentage?: number }[];
	}) => {
		// Get beneficiaries with non-zero allocation for this asset
		const relevantBeneficiaries = _asset.beneficiaries;

		if (relevantBeneficiaries.length === 0) {
			return "No beneficiaries specified";
		}

		// Handle single beneficiary case
		if (relevantBeneficiaries.length === 1) {
			const beneficiary = data.beneficiaries.find(
				(ben) => ben.id === relevantBeneficiaries[0].id
			) || { fullName: "Unknown Beneficiary" };

			if (_asset.distributionType === "equal") {
				return `to ${beneficiary.fullName}`;
			} else {
				return `to ${beneficiary.fullName} (${relevantBeneficiaries[0].percentage}%)`;
			}
		}

		// Handle multiple beneficiaries
		const distributionText = relevantBeneficiaries
			.map((b, idx) => {
				const isSecondLast = idx === relevantBeneficiaries.length - 2;
				const prefix = idx === 0 ? "" : isSecondLast ? " and " : ", ";
				// Find the beneficiary in the data to get their name
				const beneficiary = data.beneficiaries.find(
					(ben) => ben.id === b.id
				) || { fullName: "Unknown Beneficiary" }; // Fallback if not found

				if (_asset.distributionType === "equal") {
					// For equal distribution, just show the name
					return `${prefix}${beneficiary.fullName}`;
				} else {
					// For percentage distribution, show the percentage
					return `${prefix}${beneficiary.fullName} (${b.percentage}%)`;
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
				{data.gifts.length > 0 && (
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

				<View>
					<Text style={styles.distributionText}>
						I direct that my executors shall distribute my estate in accordance
						with the following provisions:
					</Text>

					<Text style={styles.distributionText}>
						1. All my debts, funeral expenses, and testamentary expenses shall
						be paid out of my estate.
					</Text>

					<Text style={styles.distributionText}>
						2. Any assets not specifically mentioned above shall form part of my
						residuary estate and be distributed as follows:
					</Text>

					{data.beneficiaries.map((beneficiary, index) => (
						<View key={index} style={styles.assetItem}>
							<Text style={styles.assetDescription}>
								{beneficiary.fullName}
								{beneficiary.relationship
									? ` (${beneficiary.relationship})`
									: ""}
							</Text>
						</View>
					))}

					<Text style={styles.distributionText}>
						I declare that if any of my beneficiaries predecease me, their share
						shall be distributed equally among the surviving beneficiaries.
					</Text>
				</View>

				{/* Personal Information */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Personal Information</Text>
					<View style={styles.row}>
						<Text style={styles.label}>Full Name:</Text>
						<Text style={styles.value}>{data.personal.fullName}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Date of Birth:</Text>
						<Text style={styles.value}>{data.personal.dateOfBirth}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Address:</Text>
						<Text style={styles.value}>{data.personal.address}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Phone:</Text>
						<Text style={styles.value}>{data.personal.phone}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Marital Status:</Text>
						<Text style={styles.value}>{data.personal.maritalStatus}</Text>
					</View>
				</View>

				{/* Assets */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Assets</Text>
					{data.assets.map((asset, index) => (
						<View key={index} style={styles.item}>
							<View style={styles.row}>
								<Text style={styles.label}>Type:</Text>
								<Text style={styles.value}>{asset.type}</Text>
							</View>
							<View style={styles.row}>
								<Text style={styles.label}>Description:</Text>
								<Text style={styles.value}>{asset.description}</Text>
							</View>
							<View style={styles.row}>
								<Text style={styles.label}>Value:</Text>
								<Text style={styles.value}>{asset.value}</Text>
							</View>
						</View>
					))}
				</View>

				{/* Beneficiaries */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Beneficiaries</Text>
					{data.beneficiaries.map((beneficiary, index) => (
						<View key={index} style={styles.item}>
							<View style={styles.row}>
								<Text style={styles.label}>Name:</Text>
								<Text style={styles.value}>{beneficiary.fullName}</Text>
							</View>
							<View style={styles.row}>
								<Text style={styles.label}>Relationship:</Text>
								<Text style={styles.value}>{beneficiary.relationship}</Text>
							</View>
							{beneficiary.email && (
								<View style={styles.row}>
									<Text style={styles.label}>Email:</Text>
									<Text style={styles.value}>{beneficiary.email}</Text>
								</View>
							)}
							{beneficiary.phone && (
								<View style={styles.row}>
									<Text style={styles.label}>Phone:</Text>
									<Text style={styles.value}>{beneficiary.phone}</Text>
								</View>
							)}
							<View style={styles.row}>
								<Text style={styles.label}>Allocation:</Text>
								<Text style={styles.value}>
									<Text>{beneficiary.allocation}</Text>
									<Text>%</Text>
								</Text>
							</View>
						</View>
					))}
				</View>

				{/* Witnesses */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Witnesses</Text>
					{data.witnesses.map((witness, index) => (
						<View key={index} style={styles.item}>
							<View style={styles.row}>
								<Text style={styles.label}>Name:</Text>
								<Text style={styles.value}>{witness.fullName}</Text>
							</View>
							<View style={styles.row}>
								<Text style={styles.label}>Address:</Text>
								<Text style={styles.value}>{witness.address}</Text>
							</View>
						</View>
					))}
				</View>
			</Page>
		</Document>
	);
};

export default WillPDF;
