import * as React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/react-datepicker-custom.css";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
	value?: Date | string;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	maxDate?: Date;
	minDate?: Date;
}

export function DatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	disabled = false,
	className,
	maxDate,
	minDate,
}: DatePickerProps) {
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(
		value ? (typeof value === "string" ? new Date(value) : value) : null
	);

	React.useEffect(() => {
		if (value) {
			const newDate = typeof value === "string" ? new Date(value) : value;
			setSelectedDate(newDate);
		}
	}, [value]);

	const handleChange = (date: Date | null) => {
		setSelectedDate(date);
		onChange(date || undefined);
	};

	return (
		<div className={cn("relative", className)}>
			<ReactDatePicker
				selected={selectedDate}
				onChange={handleChange}
				placeholderText={placeholder}
				disabled={disabled}
				maxDate={maxDate}
				minDate={minDate}
				dateFormat="MMMM d, yyyy"
				showMonthDropdown
				showYearDropdown
				dropdownMode="select"
				yearDropdownItemNumber={100}
				scrollableYearDropdown
				className={cn(
					"w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white",
					"focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none",
					"text-sm",
					!selectedDate && "text-gray-400"
				)}
				wrapperClassName="w-full"
				calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
				popperClassName="z-50"
			/>
			<CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
		</div>
	);
}
