import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
	appendixSection: {
		marginTop: 40,
		marginBottom: 20,
	},
	appendixTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "left",
	},
	appendixText: {
		fontSize: 14,
		textAlign: "justify",
		marginBottom: 15,
	},
	assetTable: {
		border: "1px solid #000000",
		borderCollapse: "collapse",
		width: "100%",
	},
	assetTableHeader: {
		backgroundColor: "#e0e0e0",
		borderBottom: "1px solid #000000",
		fontWeight: "bold",
	},
	assetTableHeaderCell: {
		border: "1px solid #000000",
		padding: 8,
		textAlign: "left",
	},
	assetTableRow: {
		borderBottom: "1px solid #000000",
	},
	assetTableCell: {
		border: "1px solid #000000",
		padding: 8,
		textAlign: "left",
	},
	appendixPage: { padding: 40, backgroundColor: "#fff" },
	appendixIntro: { fontSize: 14, marginBottom: 20, textAlign: "justify" },
	assetDetailsTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 20,
		marginBottom: 10,
	},
	assetDetailsIntro: { fontSize: 14, marginBottom: 20, textAlign: "justify" },
	assetList: { marginTop: 10 },
	assetListItem: { fontSize: 13, marginBottom: 8, textAlign: "left" },
	assetListItemRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	assetBullet: {
		fontSize: 16,
		fontWeight: "bold",
		marginRight: 8,
		lineHeight: 18,
	},
	assetListItemText: {
		fontSize: 13,
		fontWeight: 600,
		textAlign: "left",
		flex: 1,
	},
	// Checklist styles
	checklistPage: {
		padding: 40,
		backgroundColor: "#fff",
	},
	checklistTitle: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 30,
		textAlign: "center",
		color: "#1f2937",
	},
	checklistSubtitle: {
		fontSize: 16,
		color: "#6b7280",
		marginBottom: 40,
		textAlign: "center",
	},
	checklistSection: {
		marginBottom: 30,
	},
	checklistSectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
		color: "#374151",
		borderBottom: "2px solid #e5e7eb",
		paddingBottom: 8,
	},
	checklistItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 15,
		paddingLeft: 20,
	},
	checklistCheckbox: {
		width: 20,
		height: 20,
		border: "2px solid #d1d5db",
		borderRadius: 4,
		marginRight: 15,
		marginTop: 2,
	},
	checklistText: {
		fontSize: 14,
		color: "#374151",
		flex: 1,
		lineHeight: 1.8,
		marginBottom: 2,
	},
	checklistImportant: {
		fontSize: 14,
		color: "#dc2626",
		fontWeight: "bold",
		marginTop: 20,
		padding: 15,
		backgroundColor: "#fef2f2",
		border: "1px solid #fecaca",
		borderRadius: 6,
		textAlign: "center",
	},
	checklistNote: {
		fontSize: 12,
		color: "#6b7280",
		fontStyle: "italic",
		marginTop: 15,
		textAlign: "center",
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
		gifts?: Array<{
			type: string;
			description: string;
			value?: string;
			beneficiaryId: string;
			beneficiaryName: string;
		}>;
		digitalAssets?: {
			beneficiaryId: string;
			beneficiaryName?: string;
			relationship?: string;
		};
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
			gifts: data.gifts && data.gifts.length > 0 ? sectionNum++ : null,
			digitalAssets: data.digitalAssets?.beneficiaryId ? sectionNum++ : null,

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
					<React.Fragment key={`beneficiary-${b.id || idx}`}>
						{prefix}
						<Text>{beneficiaryName}</Text>
					</React.Fragment>
				);
			} else if (_asset.distributionType === "percentage") {
				return (
					<React.Fragment key={`beneficiary-${b.id || idx}`}>
						{prefix}
						<Text>{beneficiaryName}</Text> ({b.percentage}%)
					</React.Fragment>
				);
			} else {
				return (
					<React.Fragment key={`beneficiary-${b.id || idx}`}>
						{prefix}
						<Text>{beneficiaryName}</Text>
					</React.Fragment>
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
			{/* Checklist Page - First Page */}
			<Page size="A4" style={styles.checklistPage}>
				<Text style={styles.checklistTitle}>
					Legacy in Order – Final Checklist for Making Your Will Legally Valid
				</Text>

				<Text style={styles.checklistSubtitle}>
					Congratulations!!! You've taken a huge step toward protecting your
					assets and getting your Legacy In Order. Now let's get it signed and
					store it safely.
				</Text>

				{/* Step 1 - Review Your Will */}
				<View style={styles.checklistSection}>
					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistSectionTitle}>
							Step 1 - Review Your Will Carefully
						</Text>
					</View>

					<Text style={styles.checklistText}>Before you sign:</Text>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							Read your Will from start to finish. Check that every name, date,
							and instruction is accurate. If anything is unclear or you want to
							make changes update before printing and signing.
						</Text>
					</View>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							Print your Will on plain paper. Keep the pages together and staple
							them securely in the top left corner.
						</Text>
					</View>
				</View>

				{/* Step 2 - Choose Witnesses */}
				<View style={styles.checklistSection}>
					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistSectionTitle}>
							Step 2 - Choose the Right Witnesses
						</Text>
					</View>

					<Text style={styles.checklistText}>
						You must sign your Will in front of two independent witnesses.
					</Text>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							They must be aged 18 or over and mentally competent.
						</Text>
					</View>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							They cannot be a beneficiary named in your Will or be married to,
							or in a partnership with, any beneficiary.
						</Text>
					</View>
				</View>

				{/* Step 3 - Signing Your Will */}
				<View style={styles.checklistSection}>
					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistSectionTitle}>
							Step 3 - Signing Your Will
						</Text>
					</View>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							Arrange for both witnesses to be present at the same time.
						</Text>
					</View>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							Using a pen, you sign first, with both witnesses watching. You
							cannot sign a will electronically.
						</Text>
					</View>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							Each witness must then, write their full name in capital letters,
							Write their address. Sign in the space provided.
						</Text>
					</View>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							If there's a mistake, start again if possible. If not, all parties
							should initial the correction.
						</Text>
					</View>
				</View>

				{/* Step 4 - Store and Register */}
				<View style={styles.checklistSection}>
					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistSectionTitle}>
							Step 4 - Store and Register Your Will
						</Text>
					</View>

					<Text style={styles.checklistText}>
						Once signed and witnessed, your Will is legally valid.
					</Text>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							Store the original in a safe but accessible place.
						</Text>
					</View>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							Tell your Executor and at least one trusted person where it's
							stored and how to access it.
						</Text>
					</View>

					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistText}>
							Consider registering your Will with a recognised will registry. If
							you make a new Will, destroy the old one and update the registry
							immediately.
						</Text>
					</View>
				</View>

				{/* Step 5 - Inspire Others */}
				<View style={styles.checklistSection}>
					<View style={styles.checklistItem}>
						<View style={styles.checklistCheckbox} />
						<Text style={styles.checklistSectionTitle}>
							Step 5 - Inspire Others
						</Text>
					</View>

					<Text style={styles.checklistText}>
						Completing your will is one of the most loving legacies you can
						leave. It spares your loved ones stress, uncertainty, and potential
						disagreements. Inspire your friends and family to do the same by
						sharing Legacy in Order with them.
					</Text>
				</View>
			</Page>

			{/* Main Will Content - Second Page */}
			<Page size="A4" style={styles.page}>
				<View style={styles.centeredTitle}>
					<View style={styles.titleContainer}>
						<Text style={styles.willTitle}>THE</Text>
						<Text style={styles.willTitle}>LAST WILL & TESTAMENT</Text>
						<Text style={styles.testatorName}>OF</Text>
						<Text style={styles.testatorName}>
							{data.personal.fullName.toUpperCase()}
						</Text>
					</View>
				</View>

				{/* Scope Section */}
				<View style={styles.scopeSection}>
					<Text style={styles.scopeTitle}>
						{sections.scope}. Scope of this will
					</Text>
					<Text style={styles.scopeText}>
						<Text style={{ fontWeight: "bold" }}>{sections.scope}.1.</Text> I,{" "}
						{data.personal.fullName}, of {data.personal.address}
						{data.personal.dateOfBirth
							? ` and born on ${data.personal.dateOfBirth}`
							: ""}
						, revoke all previous Wills made by me (as far as they relate to my
						property in the United Kingdom) and declare this to be my last will
						and testament.
					</Text>
					<Text style={styles.scopeText}>
						<Text style={{ fontWeight: "bold" }}>{sections.scope}.2.</Text> This
						Will records how I want my estate to be dealt with after my death.
						It applies to all assets that I own in the United Kingdom, whether
						movable or immovable, and to any property over which I hold a
						general power of appointment.
					</Text>
					<Text style={styles.scopeText}>
						<Text style={{ fontWeight: "bold" }}>{sections.scope}.3.</Text> I
						have included an Appendix to accompany this Will. The Appendix is a
						non-testamentary document and does not form part of my legally
						binding instructions but is provided to assist my Executors and
						Trustees in identifying my financial assets and conveying personal
						messages I wish to share.
					</Text>
				</View>

				{/* Funeral Instructions Section */}
				{data.funeralInstructions && (
					<View style={styles.funeralSection}>
						<Text style={styles.funeralTitle}>
							{sections.funeral}. Funeral wishes
						</Text>
						<Text style={styles.funeralText}>
							<Text style={{ fontWeight: "bold" }}>{sections.funeral}.1.</Text>{" "}
							It is my wish that I am {data.funeralInstructions.wishes}.
						</Text>
					</View>
				)}

				{/* Executors Section */}
				<View style={styles.executorSection}>
					<Text style={styles.executorTitle}>
						{sections.executors}. Appointment of Executors and Trustees
					</Text>

					<Text style={styles.executorText}>
						<Text style={{ fontWeight: "bold" }}>{sections.executors}.1.</Text>{" "}
						I appoint{" "}
						{data.executors.map((executor, index) => {
							const isLast = index === data.executors.length - 1;
							const prefix = index === 0 ? "" : isLast ? " and " : ", ";

							return (
								<React.Fragment key={index}>
									{prefix}
									<Text style={{ fontWeight: "bold" }}>
										{executor.type === "individual"
											? executor.fullName
											: executor.companyName}
									</Text>
									{executor.relationship && executor.type === "individual" && (
										<> (my {executor.relationship.toLowerCase()})</>
									)}
									{executor.type === "corporate" && (
										<> (a corporate executor)</>
									)}
								</React.Fragment>
							);
						})}{" "}
						to act as the executors and trustees of my estate. If any of them
						are unwilling or unable to act, the others may continue, and they
						may appoint a suitable replacement if needed.
					</Text>
					<Text style={styles.executorText}>
						<Text style={{ fontWeight: "bold" }}>{sections.executors}.2.</Text>{" "}
						In this Will, the expression{" "}
						<Text style={{ fontWeight: "bold" }}>"My Trustees"</Text> means my
						personal representative who obtain a grant of probate for this Will
						and, as the context requires, my executors and/ or trustees of my
						Will and of any trust that may arise under this Will.
					</Text>
					<Text style={styles.executorText}>
						<Text style={{ fontWeight: "bold" }}>{sections.executors}.3.</Text>{" "}
						I direct my Trustees to take all actions legally permissible to have
						this Will executed in accordance with my wishes.
					</Text>
				</View>

				{/* Estate Administration Section */}
				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						{sections.administration}. Definition and Administration of Estate
					</Text>
					<Text style={styles.distributionText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.administration}.1.
						</Text>{" "}
						In my Will "my Estate" shall mean:
					</Text>

					<Text style={styles.distributionText}>
						a) All my property, possessions and money of every kind in the
						United Kingdom including property that I have a general power of
						appointment; and
					</Text>

					<Text style={styles.distributionText}>
						b) The money investments and property from time to time representing
						all such property.
					</Text>

					<Text style={styles.distributionText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.administration}.2.
						</Text>{" "}
						My Trustees may sell or convert any or all my remaining assets as
						they consider appropriate and then shall hold my Estate on trust to:
					</Text>

					<Text style={styles.distributionText}>
						a) Pay any debts, funeral and testamentary expenses.
					</Text>

					<Text style={styles.distributionText}>
						b) Satisfy all specific gifts of specified property referred to in
						my Will.
					</Text>

					<Text style={styles.distributionText}>
						c) Deal with the remainder ("my Residuary Estate") as I state in
						this will.
					</Text>
				</View>

				{/* Specific Bequests Section - Moved here */}
				{data.gifts && data.gifts.length > 0 && (
					<View style={styles.giftSection}>
						<Text style={styles.giftTitle}>
							{sections.gifts}. Specific Gifts
						</Text>
						<Text style={styles.giftText}>
							<Text style={{ fontWeight: "bold" }}>{sections.gifts}.1.</Text> I
							give the following, free of inheritance tax:
						</Text>

						{data.gifts.map((gift, index) => (
							<Text key={index} style={styles.giftText}>
								{String.fromCharCode(97 + index)}) To{" "}
								<Text style={{ fontWeight: "bold" }}>
									{gift.beneficiaryName}
								</Text>{" "}
								of {gift.beneficiaryId} my{" "}
								{gift.type === "Cash" && gift.value
									? `$${Number(gift.value).toLocaleString()} (${
											gift.description
									  })`
									: gift.description}
								;
							</Text>
						))}

						<Text style={styles.giftText}>
							b) In giving effect to any gift above, my Trustees shall have the
							final and binding decisions as to the identity of any items
							specifically given and as to the nature and extent of any gift.
						</Text>

						<Text style={styles.giftText}>
							c) My Residuary Estate shall pay the costs of delivering any gift
							to a beneficiary, Vesting any gift in a beneficiary, and the
							upkeep of any gift until delivery or vesting.
						</Text>

						<Text style={styles.giftText}>
							d) Any specific gift that fails to pass to a beneficiary will
							return to my estate to be included in my Residuary Estate.
						</Text>
					</View>
				)}

				{/* Asset Distribution Section */}
				{data.assets &&
					data.assets.some(
						(asset) =>
							asset.distributionType &&
							asset.beneficiaries &&
							asset.beneficiaries.length > 0
					) && (
						<View style={styles.distributionSection}>
							<Text style={styles.distributionTitle}>
								{sections.distribution}. Distribution of Assets
							</Text>

							<Text style={styles.distributionText}>
								<Text style={{ fontWeight: "bold" }}>
									{sections.distribution}.1.
								</Text>{" "}
								I give, devise, and bequeath my estate as follows:
							</Text>

							{data.assets
								.filter(
									(asset) =>
										asset.distributionType &&
										asset.beneficiaries &&
										asset.beneficiaries.length > 0
								)
								.map((asset, index) => (
									<View key={index} style={styles.assetItem}>
										<Text style={styles.assetDescription}>
											<Text style={{ fontWeight: "bold" }}>
												{sections.distribution}.{index + 2}.
											</Text>{" "}
											<Text>{asset.description}</Text> (
											<Text>{asset.type}</Text>) to{" "}
											{renderAssetDistributionText(asset)}.
										</Text>
									</View>
								))}
						</View>
					)}

				{/* Distribution of my Residuary Estate Section */}
				{data.residuaryBeneficiaries &&
					data.residuaryBeneficiaries.length > 0 && (
						<View style={styles.distributionSection}>
							<Text style={styles.distributionTitle}>
								{sections.residuary}. Distribution of my Residuary Estate
							</Text>

							<Text style={styles.distributionText}>
								<Text style={{ fontWeight: "bold" }}>
									{sections.residuary}.1.
								</Text>{" "}
								I direct that my Trustees shall distribute my Residuary Estate
								in accordance with the following provisions:
							</Text>

							{data.residuaryBeneficiaries?.map((beneficiary, index) => {
								const beneficiaryDetails = data.beneficiaries.find(
									(b) => b.id === beneficiary.beneficiaryId
								);
								if (!beneficiaryDetails) return null;

								return (
									<Text key={index} style={styles.distributionText}>
										{String.fromCharCode(97 + index)}){" "}
										{(data.residuaryBeneficiaries?.length || 0) > 1 && (
											<>{beneficiary.percentage}% to </>
										)}
										{(data.residuaryBeneficiaries?.length || 0) === 1 && "to "}
										<Text style={{ fontWeight: "bold" }}>
											{beneficiaryDetails.fullName}
										</Text>{" "}
										my {beneficiaryDetails.relationship.toLowerCase()}
										{beneficiaryDetails.requiresGuardian ? (
											<>
												{" "}
												(but if they die before me their share shall go to their
												children who survive me in equal shares)
											</>
										) : (
											<>
												{" "}
												(but if they die before me their share shall be
												distributed equally among the surviving residuary
												beneficiaries named in this clause)
											</>
										)}
										;
									</Text>
								);
							})}

							<Text style={styles.distributionText}>
								<Text style={{ fontWeight: "bold" }}>
									{sections.residuary}.2.
								</Text>{" "}
								If any of the shares set out in this clause fails it shall be
								added proportionately to the shares which do not fail.
							</Text>
						</View>
					)}

				{/* Guardians Section */}
				{shouldShowGuardiansSection() && (
					<View style={styles.guardianSection}>
						<Text style={styles.guardianTitle}>
							{sections.guardians}. Appointment of Guardians
						</Text>

						{data.guardians?.map((guardian, index) => (
							<Text key={index} style={styles.guardianText}>
								<Text style={{ fontWeight: "bold" }}>
									{sections.guardians}.{index + 1}.
								</Text>{" "}
								{guardian.isPrimary ? (
									<>
										If my partner dies before me, I appoint{" "}
										<Text style={{ fontWeight: "bold" }}>
											{guardian.fullName}
										</Text>{" "}
										my {guardian.relationship.toLowerCase()} as the primary
										guardian of my minor children.
									</>
								) : (
									<>
										If my primary guardian is unable or unwilling to act, I
										appoint the following as alternative guardians{" "}
										<Text style={{ fontWeight: "bold" }}>
											{guardian.fullName}
										</Text>
										.
									</>
								)}
							</Text>
						))}
					</View>
				)}

				{/* Pet Care Section */}
				{shouldShowPetsSection() && (
					<View style={styles.guardianSection}>
						<Text style={styles.guardianTitle}>
							{sections.pets}. Guardianship of Pets
						</Text>

						<Text style={styles.guardianText}>
							<Text style={{ fontWeight: "bold" }}>{sections.pets}.1.</Text> I
							give my pet(s) to{" "}
							<Text style={{ fontWeight: "bold" }}>
								{data.petsGuardian?.fullName}
								{data.petsGuardian?.relationship
									? ` (my ${data.petsGuardian.relationship.toLowerCase()})`
									: ""}
							</Text>
							.
						</Text>

						<Text style={styles.guardianText}>
							<Text style={{ fontWeight: "bold" }}>{sections.pets}.2.</Text> If
							they are unable or unwilling to act, I direct my Trustees to make
							appropriate arrangements for their care, including placement with
							a suitable alternative caregiver or, if necessary, a reputable
							animal rescue organisation.
						</Text>
					</View>
				)}

				{/* Digital Assets Section */}
				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						{sections.digitalAssets}. Digital Assets
					</Text>
					<Text style={styles.distributionText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.digitalAssets}.1.
						</Text>{" "}
						I authorise my Trustees to access, use, distribute and dispose of my
						digital devices and digital assets, (including online accounts,
						emails, photos, social media, subscriptions, software, licences,
						cryptocurrencies, and similar items and accounts), wherever or
						however stored, as they think fit giving due consideration to any
						letter of wishes I may prepare. If no such letter has been left by
						me to cover specific digital assets, then they will pass under my
						Residuary estate.
					</Text>
				</View>

				{/* General Provisions Section */}
				<View style={styles.distributionSection}>
					<Text style={styles.distributionTitle}>
						{sections.powers}. General Provisions
					</Text>
					<Text style={styles.distributionText}>
						<Text style={{ fontWeight: "bold" }}>{sections.powers}.1.</Text> The
						standard provisions and all of the special provisions of the Society
						of Trust and Estate Practitioners (3rd Edition) shall apply.
					</Text>
					<Text style={styles.distributionText}>
						<Text style={{ fontWeight: "bold" }}>{sections.powers}.2.</Text> Any
						person who does not survive me by 28 days who would otherwise be a
						beneficiary under this Will shall be treated for all the purposes of
						my will as having died in my lifetime.
					</Text>
					<Text style={styles.distributionText}>
						<Text style={{ fontWeight: "bold" }}>{sections.powers}.3.</Text>{" "}
						Clause headings in this Will are for ease of reference only and do
						not affect the interpretation of this Will.
					</Text>
				</View>

				{/* Final Declaration Section */}
				<View style={styles.finalDeclarationSection}>
					<Text style={styles.finalDeclarationTitle}>
						{sections.finalDeclaration}. Final Declaration
					</Text>
					<Text style={styles.finalDeclarationText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.finalDeclaration}.1.
						</Text>{" "}
						I declare that:
					</Text>
					<Text style={styles.finalDeclarationText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.finalDeclaration}.2.
						</Text>{" "}
						I am over 18;
					</Text>
					<Text style={styles.finalDeclarationText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.finalDeclaration}.3.
						</Text>{" "}
						I am mentally capable of making my own decisions about my will;
					</Text>
					<Text style={styles.finalDeclarationText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.finalDeclaration}.4.
						</Text>{" "}
						I am freely and voluntarily making this will;
					</Text>
					<Text style={styles.finalDeclarationText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.finalDeclaration}.5.
						</Text>{" "}
						I have considered all those persons I might reasonably be expected
						to provide for by my will; and
					</Text>
					<Text style={styles.finalDeclarationText}>
						<Text style={{ fontWeight: "bold" }}>
							{sections.finalDeclaration}.6.
						</Text>{" "}
						I understand this will and approve it as a true reflection of my
						wishes.
					</Text>
				</View>

				{/* Witness Signatures Section */}
				<View style={styles.witnessSection}>
					<Text style={styles.witnessTitle}>
						{sections.witnesses}. Witness Signatures
					</Text>
					<Text style={styles.witnessText}>
						<Text style={{ fontWeight: "bold" }}>SIGNATURE</Text>
					</Text>
					<Text style={styles.witnessText}>
						<Text style={{ fontWeight: "bold" }}>{sections.witnesses}.1.</Text>{" "}
						I,{" "}
						<Text style={{ fontWeight: "bold" }}>{data.personal.fullName}</Text>{" "}
						declare that this is my last will and testament, and I sign it in
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
						<Text style={{ fontWeight: "bold" }}>{sections.witnesses}.2.</Text>{" "}
						Signed by the testator in our presence and then by us in the
						presence of the testator and each other on the date shown above.
					</Text>
				</View>
			</Page>

			{data.assets && data.assets.length > 0 && (
				<Page style={styles.appendixPage} break>
					<View style={styles.appendixSection}>
						<Text style={styles.appendixTitle}>Appendix</Text>
						<Text style={styles.appendixIntro}>
							<Text style={{ fontWeight: "bold" }}>
								This Appendix does not form part of the Will.
							</Text>{" "}
							Your Will becomes a public document once probate has been issued
							by the courts. This Appendix is a 'non-testamentary' document.
							This means that it is excluded from being made public, keeping
							your detailed assets, personal messages and funeral wishes
							private.
						</Text>
						<Text style={styles.appendixIntro}>
							This Appendix has been included alongside my Will solely to
							provide guidance and practical assistance to my Trustees.
						</Text>

						<Text style={styles.assetDetailsTitle}>Schedule of Assets</Text>
						<Text style={styles.assetDetailsIntro}>
							I have provided a record of my assets to support my Trustees in
							the administration of my estate. While this information reflects
							my holdings at the date of writing, it may not be complete. My
							Trustees should therefore take reasonable steps to identify and
							secure any other assets that may exist but are not listed here.
						</Text>

						{data.assets && data.assets.length > 0 ? (
							<View style={styles.assetList}>
								{data.assets.map((asset, idx) => (
									<Text key={idx} style={styles.assetListItem}>
										- {asset.description} ({asset.type})
									</Text>
								))}
							</View>
						) : (
							<Text style={styles.appendixText}>
								No assets have been added.
							</Text>
						)}
					</View>
				</Page>
			)}
		</Document>
	);
};

export default WillPDF;
