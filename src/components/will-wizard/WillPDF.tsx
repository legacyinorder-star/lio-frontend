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
	funeralSection: {
		marginTop: 30,
		marginBottom: 20,
	},
	funeralTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	funeralText: {
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
	finalDeclarationSection: {
		marginTop: 30,
		marginBottom: 20,
	},
	finalDeclarationTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	finalDeclarationText: {
		textAlign: "justify",
		fontSize: 14,
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
			hasBeneficiaries?: boolean;
			distributionType?: "equal" | "percentage";
			beneficiaries?: Array<{
				id?: string;
				percentage?: number;
				beneficiaryName?: string;
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

		residuaryBeneficiaries?: Array<{
			id: string;
			beneficiaryId: string;
			percentage: number;
		}>;
		residuaryDistributionType?: "equal" | "manual";
		funeralInstructions?: {
			wishes: string;
		};
		pets?: {
			hasPets: boolean;
			guardianName?: string;
		};
		petsGuardian?: {
			fullName: string;
			relationship: string;
		};
	};
}

const WillPDF: React.FC<WillPDFProps> = ({ data }) => {
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

	// Helper function to check if pets section should be shown
	const shouldShowPetsSection = () => {
		return data.pets?.hasPets && data.petsGuardian;
	};

	// Helper function to calculate section numbers
	const getSectionNumber = () => {
		let sectionNum = 1;
		const sections = {
			scope: sectionNum++,
			funeral: data.funeralInstructions ? sectionNum++ : null,
			executors: sectionNum++,
			guardians: shouldShowGuardiansSection() ? sectionNum++ : null,
			pets: shouldShowPetsSection() ? sectionNum++ : null,
			distribution: sectionNum++,

			administration: sectionNum++,
			residuary:
				data.residuaryBeneficiaries && data.residuaryBeneficiaries.length > 0
					? sectionNum++
					: null,
			disclaimer: sectionNum++,
			powers: sectionNum++,
			protection: sectionNum++,
			definitions: sectionNum++,
			finalDeclaration: sectionNum++, // Add Final Declaration before witnesses
			witnesses: sectionNum++,
		};
		return sections;
	};

	const sections = getSectionNumber();

	// Helper function to render asset distribution text with bold formatting
	const renderAssetDistributionText = (_asset: {
		type: string;
		description: string;
		hasBeneficiaries?: boolean;
		distributionType?: "equal" | "percentage";
		beneficiaries?: {
			id?: string;
			percentage?: number;
			beneficiaryName?: string;
		}[];
	}) => {
		const relevantBeneficiaries = _asset.beneficiaries || [];

		if (!_asset.hasBeneficiaries || relevantBeneficiaries.length === 0) {
			return <Text>my residuary estate</Text>;
		}

		// Handle single beneficiary case
		if (relevantBeneficiaries.length === 1) {
			const beneficiary = relevantBeneficiaries[0];
			const beneficiaryName =
				beneficiary.beneficiaryName || "Unknown Beneficiary";

			if (_asset.distributionType === "equal") {
				return <Text>{beneficiaryName}</Text>;
			} else if (_asset.distributionType === "percentage") {
				return (
					<>
						<Text>{beneficiaryName}</Text> ({beneficiary.percentage}%)
					</>
				);
			} else {
				return <Text>{beneficiaryName}</Text>;
			}
		}

		// Handle multiple beneficiaries
		const elements = relevantBeneficiaries.map((b, idx) => {
			const isLast = idx === relevantBeneficiaries.length - 1;
			const prefix = idx === 0 ? "" : isLast ? " and " : ", ";
			const beneficiaryName = b.beneficiaryName || "Unknown Beneficiary";

			if (_asset.distributionType === "equal") {
				return (
					<>
						{prefix}
						<Text>{beneficiaryName}</Text>
					</>
				);
			} else if (_asset.distributionType === "percentage") {
				return (
					<>
						{prefix}
						<Text>{beneficiaryName}</Text> ({b.percentage}%)
					</>
				);
			} else {
				return (
					<>
						{prefix}
						<Text>{beneficiaryName}</Text>
					</>
				);
			}
		});

		// Add distribution type suffix for equal distribution
		if (
			_asset.distributionType === "equal" &&
			relevantBeneficiaries.length > 0
		) {
			return <>{elements} (equally)</>;
		}

		return elements;
	};

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.centeredTitle}>
					<View style={styles.titleContainer}>
						<Text style={styles.willTitle}>THE</Text>
						<Text style={styles.willTitle}>LAST WILL & TESTAMENT</Text>
						<Text style={styles.testatorName}>OF</Text>
						<Text style={styles.testatorName}>
							{data.personal.fullName.toUpperCase()}
						</Text>
						<Text style={styles.datedText}>DATED</Text>
						<Text style={styles.datedText}>{formatDate(new Date())}</Text>
					</View>
				</View>

				{/* Scope Section */}
				<View style={styles.scopeSection}>
					<Text style={styles.scopeTitle}>
						{sections.scope}. Scope of this will
					</Text>
					<Text style={styles.scopeText}>
						I am {data.personal.fullName} of {data.personal.address}.
					</Text>
					<Text style={styles.scopeText}>
						This is my last will, disposing of all my worldwide assets.
					</Text>
					<Text style={styles.scopeText}>
						I declare, being of sound mind, that this will is made in accordance
						with my wishes and is intended to be my last will and testament,
						revoking all previous wills and testamentary dispositions made by
						me.
						{/* I revoke any previous wills and codicils. */}
					</Text>
					<Text style={styles.scopeText}>
						This will sets out my wishes regarding the distribution of my estate
						after my death. It includes all my assets, both movable and
						immovable, wherever they may be situated, and any property over
						which I have a power of appointment or disposition.
					</Text>
				</View>

				{/* Funeral Instructions Section */}
				{data.funeralInstructions && (
					<View style={styles.funeralSection}>
						<Text style={styles.funeralTitle}>
							{sections.funeral}. Funeral wishes
						</Text>
						<Text style={styles.funeralText}>
							I want my body to be {data.funeralInstructions.wishes}.
						</Text>
					</View>
				)}

				{/* Executors Section */}
				<View style={styles.executorSection}>
					<Text style={styles.executorTitle}>
						{sections.executors}. Appointment of Executors
					</Text>

					{primaryExecutor && (
						<Text style={styles.executorText}>
							I appoint{" "}
							{primaryExecutor.type === "individual" ? (
								<>
									<Text style={{ fontWeight: "bold" }}>
										{primaryExecutor.fullName}
									</Text>
									{primaryExecutor.relationship && (
										<> (my {primaryExecutor.relationship.toLowerCase()})</>
									)}
								</>
							) : (
								<Text style={{ fontWeight: "bold" }}>
									{primaryExecutor.companyName}
								</Text>
							)}{" "}
							as my primary executor
							{primaryExecutor.type === "corporate"
								? " (a corporate executor)"
								: ""}
							.
						</Text>
					)}

					{additionalExecutors.length > 0 && (
						<>
							<Text style={styles.executorText}>
								If my primary executor dies before me, refuses to act or is
								unable to act, or their appointment does not take effect for any
								other reason, I also appoint the following as my alternative
								executors to fill the resulting vacancy:
							</Text>
							<View style={styles.executorList}>
								{additionalExecutors.map((executor, index) => (
									<View key={index} style={styles.executorItem}>
										<Text style={styles.executorText}>
											{index + 1}.{" "}
											{executor.type === "individual"
												? `${executor.fullName}${
														executor.relationship
															? ` (my ${executor.relationship.toLowerCase()})`
															: ""
												  }`
												: `${executor.companyName}`}
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
						<Text style={styles.guardianTitle}>
							{sections.guardians}. Appointment of Guardians
						</Text>

						{primaryGuardian && (
							<Text style={styles.guardianText}>
								I appoint{" "}
								<Text style={{ fontWeight: "bold" }}>
									{primaryGuardian.fullName}
									{primaryGuardian.relationship
										? ` (my ${primaryGuardian.relationship.toLowerCase()})`
										: ""}{" "}
								</Text>
								as the primary guardian of my minor children.
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
													? ` (my ${guardian.relationship.toLowerCase()})`
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

				{/* Pet Care Section */}
				{shouldShowPetsSection() && (
					<View style={styles.guardianSection}>
						<Text style={styles.guardianTitle}>
							{sections.pets}. Pet Care Provision
						</Text>

						<Text style={styles.guardianText}>
							I give and bequeath my pet(s) to{" "}
							<Text style={{ fontWeight: "bold" }}>
								{data.petsGuardian?.fullName}
								{data.petsGuardian?.relationship
									? ` (my ${data.petsGuardian.relationship.toLowerCase()})`
									: ""}
							</Text>
							.
						</Text>

						<Text style={styles.guardianText}>
							I request that this person provide a loving home for my pet(s) and
							care for them according to their individual needs. This includes
							providing adequate food, water, shelter, veterinary care,
							exercise, and companionship for the remainder of their natural
							lives.
						</Text>

						<Text style={styles.guardianText}>
							If this designated caregiver is unable or unwilling to accept
							responsibility for my pet(s), I direct my executors to make
							appropriate arrangements for their care, including placement with
							a suitable alternative caregiver or, if necessary, a reputable
							animal rescue organization.
						</Text>
					</View>
				)}

				{/* Asset Distribution Section */}
				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						{sections.distribution}. Distribution of Assets
					</Text>

					<Text style={styles.distributionText}>
						I give, devise, and bequeath my estate as follows:
					</Text>

					{data.assets.map((asset, index) => (
						<View key={index} style={styles.assetItem}>
							<Text style={styles.assetDescription}>
								{index + 1}. <Text>{asset.description}</Text> (
								<Text>{asset.type}</Text>) to{" "}
								{renderAssetDistributionText(asset)}.
							</Text>
						</View>
					))}
				</View>

				{/* Estate Administration Section */}
				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						{sections.administration}. Administration of Estate
					</Text>
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
						3. all the previous bequests in this will.
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
								{sections.residuary}. Distribution of my Residuary Estate
							</Text>

							<Text style={styles.distributionText}>
								I direct that my executors shall distribute my residuary estate
								in accordance with the following provisions:
							</Text>

							<Text style={styles.distributionText}>
								I give my residuary estate to{" "}
								{data.residuaryBeneficiaries?.map((beneficiary, index) => {
									const beneficiaryDetails = data.beneficiaries.find(
										(b) => b.id === beneficiary.beneficiaryId
									);
									if (!beneficiaryDetails) return null;

									const isLast =
										index === (data.residuaryBeneficiaries?.length || 0) - 1;

									let prefix = "";
									if (index === 0) {
										prefix = "";
									} else if (isLast) {
										prefix = " and ";
									} else {
										prefix = ", ";
									}

									return (
										<Text key={index} style={styles.distributionText}>
											{prefix}
											<Text style={{ fontWeight: "bold" }}>
												{beneficiaryDetails.fullName}
											</Text>
											{beneficiaryDetails.relationship && (
												<>
													{" "}
													(my {beneficiaryDetails.relationship.toLowerCase()})
												</>
											)}
										</Text>
									);
								})}
								{data.residuaryBeneficiaries &&
									data.residuaryBeneficiaries.length > 1 &&
									(data.residuaryDistributionType === "equal" ? (
										<Text style={styles.distributionText}>
											{" "}
											to be shared equally between them.
										</Text>
									) : (
										<Text style={styles.distributionText}>
											{" "}
											in the following proportions:{" "}
											{data.residuaryBeneficiaries?.map(
												(beneficiary, index) => {
													const beneficiaryDetails = data.beneficiaries.find(
														(b) => b.id === beneficiary.beneficiaryId
													);
													if (!beneficiaryDetails) return null;

													const isLast =
														index ===
														(data.residuaryBeneficiaries?.length || 0) - 1;

													let prefix = "";
													if (index === 0) {
														prefix = "";
													} else if (isLast) {
														prefix = " and ";
													} else {
														prefix = ", ";
													}

													return (
														<Text
															key={`percentage-${index}`}
															style={styles.distributionText}
														>
															{prefix}
															{beneficiary.percentage}% to{" "}
															<Text style={{ fontWeight: "bold" }}>
																{beneficiaryDetails.fullName}
															</Text>
															{isLast ? "." : ""}
														</Text>
													);
												}
											)}
										</Text>
									))}
								{data.residuaryBeneficiaries &&
									data.residuaryBeneficiaries.length === 1 && (
										<Text style={styles.distributionText}>.</Text>
									)}
							</Text>

							<Text style={styles.distributionText}>
								I declare that if any of my residuary beneficiaries predecease
								me, their share shall be distributed equally among the surviving
								residuary beneficiaries.
							</Text>
						</View>
					)}

				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						{sections.disclaimer}. Power for beneficiaries to disclaim bequests
					</Text>
					<Text style={styles.distributionText}>
						Any beneficiary of this will may disclaim any interest in my Estate
						in whole or in part.
					</Text>
				</View>

				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						{sections.powers}. Powers for my executors
					</Text>
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
						{sections.protection}. Paying and protecting my executors
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

				{/* Definitions Section */}
				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						{sections.definitions}. Meaning of words used in this will
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

				{/* Final Declaration Section */}
				<View style={styles.finalDeclarationSection}>
					<Text style={styles.finalDeclarationTitle}>
						{sections.finalDeclaration}. Final Declaration
					</Text>
					<Text style={styles.finalDeclarationText}>I declare that:</Text>
					<Text style={styles.finalDeclarationText}>1. I am over 18;</Text>
					<Text style={styles.finalDeclarationText}>
						2. I am mentally capable of making my own decisions about my will;
					</Text>
					<Text style={styles.finalDeclarationText}>
						3. I am freely and voluntarily making this will;
					</Text>
					<Text style={styles.finalDeclarationText}>
						4. I have considered all those persons I might reasonably be
						expected to provide for by my will; and
					</Text>
					<Text style={styles.finalDeclarationText}>
						5. I understand this will and approve it as a true reflection of my
						wishes.
					</Text>
				</View>

				{/* Witness Signatures Section */}
				<View style={styles.witnessSection}>
					<Text style={styles.witnessTitle}>
						{sections.witnesses}. Witness Signatures
					</Text>
					<Text style={styles.witnessText}>
						I declare that this is my last will and testament, and I sign it in
						the presence of the following witnesses, who in my presence and in
						the presence of each other, sign as witnesses:
					</Text>

					{/* Testator Signature */}
					<View style={styles.witnessSignature}>
						<View style={styles.signatureLine} />
						<Text style={styles.witnessName}>
							Signed by{" "}
							<Text style={{ fontWeight: "bold" }}>
								{data.personal.fullName}
							</Text>{" "}
							(Testator)
						</Text>
						<Text style={styles.witnessDate}>Date: _________________</Text>
					</View>

					{/* Witness Signatures - Always show at least 2 witness signature lines */}
					{data.witnesses && data.witnesses.length > 0 ? (
						// Show existing witnesses if available
						data.witnesses.map((witness, index) => (
							<View key={index} style={styles.witnessSignature}>
								<View style={styles.signatureLine} />
								<Text style={styles.witnessName}>
									<Text style={{ fontWeight: "bold" }}>{witness.fullName}</Text>{" "}
									(Witness)
								</Text>
								<Text style={styles.witnessAddress}>{witness.address}</Text>
								<Text style={styles.witnessDate}>Date: _________________</Text>
							</View>
						))
					) : (
						// Show empty signature lines for manual completion
						<>
							<View style={styles.witnessSignature}>
								<View style={styles.signatureLine} />
								<Text style={styles.witnessName}>
									Witness 1 Name: _________________ (Witness)
								</Text>
								<Text style={styles.witnessAddress}>
									Address: _________________________________________
								</Text>
								<Text style={styles.witnessDate}>Date: _________________</Text>
							</View>
							<View style={styles.witnessSignature}>
								<View style={styles.signatureLine} />
								<Text style={styles.witnessName}>
									Witness 2 Name: _________________ (Witness)
								</Text>
								<Text style={styles.witnessAddress}>
									Address: _________________________________________
								</Text>
								<Text style={styles.witnessDate}>Date: _________________</Text>
							</View>
						</>
					)}

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
