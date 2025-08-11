import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { LetterOfWishesData } from "@/context/LetterOfWishesContext";

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
		textAlign: "center",
		borderBottom: "2px solid #333",
		paddingBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
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
		padding: 6,
		border: "1px solid #e5e5e5",
		borderRadius: 3,
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
});

interface LetterOfWishesPDFProps {
	data: LetterOfWishesData;
	willOwnerName?: string;
}

const LetterOfWishesPDF: React.FC<LetterOfWishesPDFProps> = ({
	data,
	willOwnerName: _willOwnerName,
}) => {
	// Helper function to calculate section numbers
	const getSectionNumber = () => {
		let sectionNum = 1;
		const sections = {
			funeralPreferences:
				data.funeralPreferences &&
				(data.funeralPreferences.burialLocation ||
					data.funeralPreferences.serviceType ||
					data.funeralPreferences.additionalPreferences)
					? sectionNum++
					: null,
			guardianshipPreferences:
				data.guardianshipPreferences &&
				(data.guardianshipPreferences.reasonForChoice ||
					data.guardianshipPreferences.valuesAndHopes)
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

	const renderFuneralPreferences = () => {
		if (!data.funeralPreferences) return null;

		const { burialLocation, serviceType, additionalPreferences } =
			data.funeralPreferences;
		const hasContent = burialLocation || serviceType || additionalPreferences;

		if (!hasContent) return null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.funeralPreferences}. Funeral and Burial Preferences
				</Text>
				{burialLocation && (
					<View style={styles.content}>
						<Text style={styles.label}>Burial/Cremation Location:</Text>
						<Text style={styles.value}>{burialLocation}</Text>
					</View>
				)}
				{serviceType && (
					<View style={styles.content}>
						<Text style={styles.label}>Service Type:</Text>
						<Text style={styles.value}>
							{serviceType.replace("-", " ")} Service
						</Text>
					</View>
				)}
				{additionalPreferences && (
					<View style={styles.content}>
						<Text style={styles.label}>Additional Preferences:</Text>
						<Text style={styles.value}>{additionalPreferences}</Text>
					</View>
				)}
			</View>
		);
	};

	const renderGuardianshipPreferences = () => {
		if (!data.guardianshipPreferences) return null;

		const { reasonForChoice, valuesAndHopes } = data.guardianshipPreferences;
		const hasContent = reasonForChoice || valuesAndHopes;

		if (!hasContent) return null;

		return (
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{sections.guardianshipPreferences}. Guardianship Preferences
				</Text>
				{reasonForChoice && (
					<View style={styles.content}>
						<Text style={styles.label}>Reason for Choosing Guardians:</Text>
						<Text style={styles.value}>{reasonForChoice}</Text>
					</View>
				)}
				{valuesAndHopes && (
					<View style={styles.content}>
						<Text style={styles.label}>Values and Hopes for Upbringing:</Text>
						<Text style={styles.value}>{valuesAndHopes}</Text>
					</View>
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
				{data.digitalAssetsPreferences.digitalAssets.map((asset, index) => (
					<View key={index} style={styles.digitalAssetItem}>
						<Text style={styles.itemTitle}>
							{asset.platform} - {asset.usernameOrEmail}
						</Text>
						<Text style={styles.itemContent}>Action: {asset.action}</Text>
						{asset.beneficiaryName && (
							<Text style={styles.itemContent}>
								Beneficiary: {asset.beneficiaryName}
							</Text>
						)}
						{asset.notes && (
							<Text style={styles.itemContent}>
								Access and Instructions: {asset.notes}
							</Text>
						)}
					</View>
				))}
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
				{data.personalPossessions.map((possession, index) => (
					<View key={index} style={styles.possessionItem}>
						<Text style={styles.itemTitle}>{possession.item}</Text>
						<Text style={styles.itemContent}>To: {possession.recipient}</Text>
						{possession.reason && (
							<Text style={styles.itemContent}>
								Reason: {possession.reason}
							</Text>
						)}
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
						<Text style={styles.subsectionTitle}>Notification Contacts</Text>
						{notificationContacts.map((contact, index) => (
							<View key={index} style={styles.contactItem}>
								<Text style={styles.itemContent}>
									{contact.name} - {contact.email}
								</Text>
							</View>
						))}
					</View>
				)}

				{professionalInstructions && (
					<View style={styles.subsection}>
						<Text style={styles.subsectionTitle}>
							Professional Instructions
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
				{data.charitableDonations.map((donation, index) => (
					<View key={index} style={styles.charityItem}>
						<Text style={styles.itemTitle}>{donation.charityName}</Text>
						{donation.description && (
							<Text style={styles.itemContent}>{donation.description}</Text>
						)}
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
					{sections.trusteeInstructions}. Trustee Instructions
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
