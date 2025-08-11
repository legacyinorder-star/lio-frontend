import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { LetterOfWishesData } from "@/context/LetterOfWishesContext";
import { WillData } from "@/context/WillContext";

// Create styles
const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#ffffff",
		padding: 40,
		fontFamily: "Helvetica",
		fontSize: 12,
	},
	header: {
		marginBottom: 30,
		textAlign: "left",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "left",
		borderBottom: "1px solid #333",
		paddingBottom: 10,
	},
	subtitle: {
		fontSize: 14,
		color: "#666666",
		marginBottom: 10,
		textAlign: "center",
	},
	date: {
		fontSize: 12,
		color: "#666666",
		textAlign: "center",
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
	},
	subsection: {
		marginBottom: 15,
	},
	subsectionTitle: {
		fontSize: 14,
		fontWeight: "bold",
		marginBottom: 5,
	},
	content: {
		marginBottom: 8,
		lineHeight: 1.4,
	},
	item: {
		marginBottom: 8,
		padding: 8,
		border: "1px solid #e5e5e5",
		borderRadius: 4,
		backgroundColor: "#f9f9f9",
	},
	itemTitle: {
		fontWeight: "bold",
		marginBottom: 3,
	},
	itemContent: {
		color: "#333",
	},
	label: {
		fontWeight: "bold",
		marginBottom: 2,
	},
	value: {
		marginBottom: 5,
	},
	contactItem: {
		marginBottom: 5,
	},
	digitalAssetItem: {
		marginBottom: 8,
		padding: 6,
		border: "1px solid #e5e5e5",
		borderRadius: 3,
	},
	possessionItem: {
		marginBottom: 8,
		paddingLeft: 0,
	},
	charityItem: {
		marginBottom: 8,
		padding: 6,
		border: "1px solid #e5e5e5",
		borderRadius: 3,
	},
	noContent: {
		fontStyle: "italic",
		color: "#666666",
	},
	introduction: {
		marginBottom: 25,
		fontSize: 12,
		lineHeight: 1.5,
		textAlign: "justify",
		color: "#333333",
	},
	table: {
		marginTop: 10,
		marginBottom: 15,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#f5f5f5",
		padding: 8,
		borderBottom: "1px solid #ddd",
		fontWeight: "bold",
	},
	tableRow: {
		flexDirection: "row",
		padding: 8,
		borderBottom: "1px solid #eee",
	},
	tableCell: {
		flex: 1,
		fontSize: 10,
		paddingRight: 5,
	},
	tableCellHeader: {
		flex: 1,
		fontSize: 10,
		fontWeight: "bold",
		paddingRight: 5,
	},
	signatureSection: {
		marginTop: 40,
		marginBottom: 20,
	},
	signatureRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 30,
	},
	signatureField: {
		flex: 1,
		marginRight: 20,
	},
	signatureLine: {
		borderBottom: "1px solid #333",
		height: 20,
		marginBottom: 5,
	},
	signatureLabel: {
		fontSize: 10,
		color: "#666",
		textAlign: "center",
	},
});

interface LetterOfWishesPDFProps {
	data: LetterOfWishesData;
	willData: WillData;
	willOwnerName?: string;
}

const LetterOfWishesPDF: React.FC<LetterOfWishesPDFProps> = ({
	data,
	willData,
	willOwnerName: _willOwnerName,
}) => {
	// Helper function to calculate section numbers
	const getSectionNumber = () => {
		let sectionNum = 1;
		const sections = {
			personalDetails: sectionNum++, // Always show Personal Details as section 1
			purposeOfLetter: sectionNum++, // Always show Purpose of This Letter as section 2
			funeralPreferences:
				(data.funeralPreferences &&
					(data.funeralPreferences.burialLocation ||
						data.funeralPreferences.serviceType ||
						data.funeralPreferences.additionalPreferences)) ||
				willData.funeralInstructions?.wishes
					? sectionNum++
					: null,
			guardianshipPreferences:
				(data.guardianshipPreferences &&
					(data.guardianshipPreferences.reasonForChoice ||
						data.guardianshipPreferences.valuesAndHopes)) ||
				(willData.guardians && willData.guardians.length > 0)
					? sectionNum++
					: null,
			personalPossessions: data.personalPossessions?.length
				? sectionNum++
				: null,
			digitalAssets: data.digitalAssetsPreferences?.digitalAssets?.length
				? sectionNum++
				: null,
			businessLegacy:
				data.businessLegacy &&
				(data.businessLegacy.notificationContacts?.length ||
					data.businessLegacy.professionalInstructions?.trim())
					? sectionNum++
					: null,
			charitableDonations: data.charitableDonations?.length
				? sectionNum++
				: null,
			trusteeInstructions: data.trusteeInstructions?.trim()
				? sectionNum++
				: null,
			notesToLovedOnes: data.notesToLovedOnes?.trim() ? sectionNum++ : null,
		};
		return sections;
	};

	const sections = getSectionNumber();

	const renderPersonalDetails = () => {
		const owner = willData.owner;
		if (!owner) return null;

		// Format owner's full name
		const fullName = `${owner.firstName} ${owner.lastName}`;

		// Format owner's address
		const addressParts = [
			owner.address,
			owner.city,
			owner.state,
			owner.postCode,
			owner.country,
		].filter(Boolean);
		const address =
			addressParts.length > 0
				? addressParts.join(", ")
				: "Address not available";

		// Format current date for letter date
		const letterDate = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		// Format will execution date (using createdAt as placeholder - this should be the actual will execution date)
		const willExecutionDate = willData.createdAt
			? new Date(willData.createdAt).toLocaleDateString("en-GB", {
					day: "numeric",
					month: "long",
					year: "numeric",
			  })
			: null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.personalDetails}. Personal Details
				</Text>

				<View style={styles.content}>
					<Text style={styles.label}>Full Name:</Text>
					<Text style={styles.value}>{fullName}</Text>
				</View>

				<View style={styles.content}>
					<Text style={styles.label}>Address:</Text>
					<Text style={styles.value}>{address}</Text>
				</View>

				<View style={styles.content}>
					<Text style={styles.label}>Date of Letter:</Text>
					<Text style={styles.value}>{letterDate}</Text>
				</View>

				{willExecutionDate && (
					<View style={styles.content}>
						<Text style={styles.value}>
							This letter relates to the Will I executed on {willExecutionDate}.
						</Text>
					</View>
				)}
			</View>
		);
	};

	const renderPurposeOfLetter = () => {
		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.purposeOfLetter}. Purpose of This Letter
				</Text>
				<Text style={styles.content}>
					This letter is intended to provide guidance on how I would like
					certain personal, emotional, and practical matters to be handled after
					my death. I understand it is not legally binding, but I respectfully
					ask that my wishes be honoured to the extent possible.
				</Text>
			</View>
		);
	};

	const renderFuneralPreferences = () => {
		// Check if we have any funeral preferences data or funeral instructions from will
		const hasLetterPreferences =
			data.funeralPreferences &&
			(data.funeralPreferences.burialLocation ||
				data.funeralPreferences.serviceType ||
				data.funeralPreferences.additionalPreferences);

		const hasFuneralInstructions = willData.funeralInstructions?.wishes;

		// Debug logging
		console.log("Funeral preferences debug:", {
			hasLetterPreferences,
			hasFuneralInstructions,
			funeralInstructions: willData.funeralInstructions,
			letterPreferences: data.funeralPreferences,
		});

		// Only show section if we have some content
		if (!hasLetterPreferences && !hasFuneralInstructions) return null;

		const { burialLocation, serviceType, additionalPreferences } =
			data.funeralPreferences || {};

		// Format burial type from will data
		const formatBurialType = (wishes?: string) => {
			if (wishes === "cremated") return "Cremated";
			if (wishes === "buried") return "Buried";
			return "";
		};

		// Format service type
		const formatServiceType = (type?: string) => {
			if (!type) return "[Religious / Non-religious / Private / Public]";
			switch (type) {
				case "religious":
					return "Religious";
				case "non-religious":
					return "Non-religious";
				case "private":
					return "Private";
				case "public":
					return "Public";
				default:
					return type.charAt(0).toUpperCase() + type.slice(1);
			}
		};

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.funeralPreferences}. Funeral and Burial Preferences
				</Text>

				{willData.funeralInstructions?.wishes && (
					<Text style={styles.content}>
						I would prefer to be:{" "}
						{formatBurialType(willData.funeralInstructions?.wishes)}
					</Text>
				)}

				{burialLocation && (
					<Text style={styles.content}>
						Preferred location: {burialLocation}
					</Text>
				)}

				{serviceType && (
					<Text style={styles.content}>
						I would like the following type of service:{" "}
						{formatServiceType(serviceType)}
					</Text>
				)}

				{additionalPreferences && (
					<Text style={styles.content}>
						Additional preferences: {additionalPreferences}
					</Text>
				)}
			</View>
		);
	};

	const renderGuardianshipPreferences = () => {
		const { reasonForChoice, valuesAndHopes } =
			data.guardianshipPreferences || {};
		const hasGuardians = willData.guardians && willData.guardians.length > 0;
		const hasContent = reasonForChoice || valuesAndHopes || hasGuardians;

		if (!hasContent) return null;

		// Format guardian names from will data
		const formatGuardianNames = () => {
			if (!willData.guardians || willData.guardians.length === 0) {
				return "";
			}

			return willData.guardians
				.map((guardian) => `${guardian.firstName} ${guardian.lastName}`)
				.join(", ");
		};

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.guardianshipPreferences}. Guardianship of Children
				</Text>

				{willData.guardians && willData.guardians.length > 0 && (
					<Text style={styles.content}>
						Preferred Guardian(s): {formatGuardianNames()}
					</Text>
				)}

				{reasonForChoice && (
					<Text style={styles.content}>
						Reason for choice: {reasonForChoice}
					</Text>
				)}

				{valuesAndHopes && (
					<Text style={styles.content}>
						Values and hopes for upbringing: {valuesAndHopes}
					</Text>
				)}
			</View>
		);
	};

	const renderDigitalAssets = () => {
		if (!data.digitalAssetsPreferences?.digitalAssets?.length) return null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.digitalAssets}. Digital Assets Preferences
				</Text>

				<Text style={styles.content}>
					This section is intended to guide you in the use, management, or
					disposal of my digital assets, as referenced in my Will.
				</Text>

				<View style={styles.table}>
					{/* Table Header */}
					<View style={styles.tableHeader}>
						<Text style={styles.tableCellHeader}>Platform</Text>
						<Text style={styles.tableCellHeader}>Username/Email</Text>
						<Text style={styles.tableCellHeader}>Action</Text>
						<Text style={styles.tableCellHeader}>Beneficiary</Text>
						<Text style={styles.tableCellHeader}>Instructions</Text>
					</View>

					{/* Table Rows */}
					{data.digitalAssetsPreferences.digitalAssets.map((asset, index) => (
						<View key={index} style={styles.tableRow}>
							<Text style={styles.tableCell}>{asset.platform}</Text>
							<Text style={styles.tableCell}>{asset.usernameOrEmail}</Text>
							<Text style={styles.tableCell}>{asset.action}</Text>
							<Text style={styles.tableCell}>
								{asset.beneficiaryName || "-"}
							</Text>
							<Text style={styles.tableCell}>{asset.notes || "-"}</Text>
						</View>
					))}
				</View>
			</View>
		);
	};

	const renderPersonalPossessions = () => {
		if (!data.personalPossessions?.length) return null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.personalPossessions}. Distribution of Personal Possessions
				</Text>

				<Text style={styles.content}>
					I wish for the following personal items to be given to the named
					individuals:
				</Text>

				{data.personalPossessions.map((possession, index) => (
					<View key={index} style={styles.possessionItem}>
						<Text style={styles.content}>
							{index + 1}. {possession.item} - To: {possession.recipient}
							{possession.reason && ` (Reason: ${possession.reason})`}
						</Text>
					</View>
				))}
			</View>
		);
	};

	const renderBusinessLegacy = () => {
		if (!data.businessLegacy) return null;

		const { notificationContacts, professionalInstructions } =
			data.businessLegacy;
		const hasContent =
			(notificationContacts && notificationContacts.length > 0) ||
			professionalInstructions;

		if (!hasContent) return null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.businessLegacy}. Business/Professional Legacy
				</Text>

				{notificationContacts && notificationContacts.length > 0 && (
					<View style={styles.subsection}>
						<Text style={styles.content}>
							If applicable, please notify the following contacts:
						</Text>
						{notificationContacts.map((contact, index) => (
							<Text key={index} style={styles.content}>
								• {contact.name} - {contact.email}
							</Text>
						))}
					</View>
				)}

				{professionalInstructions && (
					<View style={styles.subsection}>
						<Text style={styles.content}>
							I would like the following guidance followed regarding my business
							or professional matters:
						</Text>
						<Text style={styles.content}>{professionalInstructions}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderCharitableDonations = () => {
		if (!data.charitableDonations?.length) return null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.charitableDonations}. Charitable Donations
				</Text>

				<Text style={styles.content}>
					I would appreciate any support directed to the following charities or
					causes:
				</Text>

				{data.charitableDonations.map((donation, index) => (
					<View key={index} style={styles.possessionItem}>
						<Text style={styles.content}>
							• {donation.charityName}
							{donation.description && ` - ${donation.description}`}
						</Text>
					</View>
				))}
			</View>
		);
	};

	const renderTrusteeInstructions = () => {
		if (!data.trusteeInstructions) return null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.trusteeInstructions}. Trustee and Executor Guidance
				</Text>
				<Text style={styles.content}>{data.trusteeInstructions}</Text>
			</View>
		);
	};

	const renderNotesToLovedOnes = () => {
		if (!data.notesToLovedOnes) return null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.notesToLovedOnes}. Notes to Loved Ones
				</Text>
				<Text style={styles.content}>{data.notesToLovedOnes}</Text>
			</View>
		);
	};

	const renderSignatureSection = () => {
		return (
			<View style={styles.signatureSection}>
				<View style={styles.signatureRow}>
					<View style={styles.signatureField}>
						<View style={styles.signatureLine}></View>
						<Text style={styles.signatureLabel}>Signature</Text>
					</View>
					<View style={styles.signatureField}>
						<View style={styles.signatureLine}></View>
						<Text style={styles.signatureLabel}>Print Name</Text>
					</View>
					<View style={styles.signatureField}>
						<View style={styles.signatureLine}></View>
						<Text style={styles.signatureLabel}>Date</Text>
					</View>
				</View>
			</View>
		);
	};

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Letter of Wishes</Text>
				</View>

				{/* Introduction */}
				<View style={styles.section}>
					<Text style={styles.introduction}>
						This letter sets out my personal wishes and guidance to my
						Executors, Trustees, and loved ones. It is not legally binding but
						expresses my sincere intentions and preferences regarding the
						matters outlined below.
					</Text>
				</View>

				{/* Personal Details */}
				{renderPersonalDetails()}

				{/* Purpose of This Letter */}
				{renderPurposeOfLetter()}

				{/* Funeral Preferences */}
				{renderFuneralPreferences()}

				{/* Guardianship Preferences */}
				{renderGuardianshipPreferences()}

				{/* Personal Possessions */}
				{renderPersonalPossessions()}

				{/* Digital Assets */}
				{renderDigitalAssets()}

				{/* Business Legacy */}
				{renderBusinessLegacy()}

				{/* Charitable Donations */}
				{renderCharitableDonations()}

				{/* Trustee Instructions */}
				{renderTrusteeInstructions()}

				{/* Notes to Loved Ones */}
				{renderNotesToLovedOnes()}

				{/* Signature Section */}
				{renderSignatureSection()}

				{/* Footer */}
				<View style={styles.section}>
					<Text style={styles.content}>
						This Letter of Wishes is intended to provide guidance to your
						executors and loved ones. While it is not legally binding, it
						expresses your personal wishes and preferences regarding various
						aspects of your estate and personal matters.
					</Text>
				</View>
			</Page>
		</Document>
	);
};

export default LetterOfWishesPDF;
