import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ReviewStepProps } from "./steps/ReviewStep";

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
		fontSize: 14,
		marginBottom: 30,
		textAlign: "center",
	},
	willTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 30,
		textAlign: "center",
	},
	testatorName: {
		fontSize: 18,
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
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
		borderBottom: "1px solid #e5e5e5",
		paddingBottom: 5,
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
	disclaimer: {
		marginTop: 30,
		fontSize: 10,
		color: "#666666",
		textAlign: "center",
	},
});

interface WillPDFProps {
	data: ReviewStepProps["data"];
	additionalText?: string;
}

interface Asset {
	type: string;
	description: string;
	value: string;
}

interface Beneficiary {
	fullName: string;
	relationship: string;
	email?: string;
	phone?: string;
	allocation: number;
}

interface Executor {
	fullName?: string;
	companyName?: string;
	relationship?: string;
	email?: string;
	phone?: string;
	address: string;
	isPrimary: boolean;
	type: "individual" | "corporate";
	contactPerson?: string;
}

interface Witness {
	fullName: string;
	address: string;
}

const WillPDF = ({ data, additionalText }: WillPDFProps) => (
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
				{data.assets.map((asset: Asset, index: number) => (
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
				{data.beneficiaries.map((beneficiary: Beneficiary, index: number) => (
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

			{/* Executors */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Executors</Text>
				{data.executors.map((executor: Executor, index: number) => (
					<View key={index} style={styles.item}>
						<View style={styles.row}>
							<Text style={styles.label}>Name:</Text>
							<Text style={styles.value}>
								<Text>
									{executor.type === "individual"
										? executor.fullName
										: executor.companyName}
								</Text>
								{executor.isPrimary && <Text> (Primary Executor)</Text>}
							</Text>
						</View>
						{executor.type === "individual" && executor.relationship && (
							<View style={styles.row}>
								<Text style={styles.label}>Relationship:</Text>
								<Text style={styles.value}>{executor.relationship}</Text>
							</View>
						)}
						{executor.type === "corporate" && executor.contactPerson && (
							<View style={styles.row}>
								<Text style={styles.label}>Contact Person:</Text>
								<Text style={styles.value}>{executor.contactPerson}</Text>
							</View>
						)}
						{executor.email && (
							<View style={styles.row}>
								<Text style={styles.label}>Email:</Text>
								<Text style={styles.value}>{executor.email}</Text>
							</View>
						)}
						{executor.phone && (
							<View style={styles.row}>
								<Text style={styles.label}>Phone:</Text>
								<Text style={styles.value}>{executor.phone}</Text>
							</View>
						)}
						<View style={styles.row}>
							<Text style={styles.label}>Address:</Text>
							<Text style={styles.value}>{executor.address}</Text>
						</View>
					</View>
				))}
			</View>

			{/* Witnesses */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Witnesses</Text>
				{data.witnesses.map((witness: Witness, index: number) => (
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

			{/* Additional Text */}
			{additionalText && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Additional Provisions</Text>
					<Text style={styles.value}>{additionalText}</Text>
				</View>
			)}

			{/* Disclaimer */}
			<Text style={styles.disclaimer}>
				<Text>
					This document is a computer-generated summary of your will. It is
					recommended that you consult with a legal professional to ensure all
					provisions are properly drafted and executed according to applicable
					laws.
				</Text>
			</Text>
		</Page>
	</Document>
);

export default WillPDF;
