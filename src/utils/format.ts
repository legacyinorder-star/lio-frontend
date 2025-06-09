/**
 * Formats a date string into a consistent format across the application
 * @param dateString - The date string to format (ISO format)
 * @returns Formatted date string in the format "MMM DD, YYYY"
 */
export function formatDate(dateString: string): string {
	if (!dateString) return "";

	const date = new Date(dateString);

	// Check if date is valid
	if (isNaN(date.getTime())) {
		console.warn("Invalid date string:", dateString);
		return "";
	}

	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
