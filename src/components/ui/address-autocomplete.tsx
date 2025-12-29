import React, { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface AddressSuggestion {
	id: string;
	address: string;
	url: string;
}

interface GetAddressResponse {
	postcode: string;
	line_1: string;
	line_2: string;
	line_3: string;
	town_or_city: string;
	formatted_address: string[];
}

interface AddressAutocompleteProps {
	searchInputId: string;
	onAddressSelect: (address: {
		line_1: string;
		line_2?: string;
		line_3?: string;
		post_town: string;
		postcode: string;
	}) => void;
	placeholder?: string;
	className?: string;
	apiKey?: string;
	disabled?: boolean;
	value?: string;
	onChange?: (value: string) => void;
}

export function AddressAutocomplete({
	searchInputId,
	onAddressSelect,
	placeholder = "Start typing your address or postcode",
	className,
	apiKey,
	disabled = false,
	value,
	onChange,
}: AddressAutocompleteProps) {
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const apiKeyToUse = apiKey || import.meta.env.VITE_GETADDRESS_API_KEY;

	// Fetch address suggestions from getAddress.io
	const fetchSuggestions = useCallback(
		async (term: string) => {
			if (!term || term.length < 3 || !apiKeyToUse) {
				setSuggestions([]);
				setShowSuggestions(false);
				return;
			}

			// Cancel any ongoing requests
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			// Create new abort controller for this request
			abortControllerRef.current = new AbortController();

			setIsLoading(true);

			try {
				const encodedTerm = encodeURIComponent(term.trim());
				const response = await fetch(
					`https://api.getAddress.io/autocomplete/${encodedTerm}?api-key=${apiKeyToUse}`,
					{
						signal: abortControllerRef.current.signal,
					}
				);

				if (!response.ok) {
					if (response.status === 429) {
						console.warn("Rate limit exceeded for getAddress.io");
						return;
					}
					throw new Error(`API request failed: ${response.status}`);
				}

				const data = await response.json();
				setSuggestions(data.suggestions || []);
				setShowSuggestions(data.suggestions?.length > 0);
				setSelectedIndex(-1);
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					// Request was cancelled, ignore
					return;
				}
				console.error("Error fetching address suggestions:", error);
				setSuggestions([]);
				setShowSuggestions(false);
			} finally {
				setIsLoading(false);
			}
		},
		[apiKeyToUse]
	);

	// Fetch full address details from getAddress.io
	const fetchAddressDetails = useCallback(
		async (addressId: string) => {
			if (!apiKeyToUse) return;

			try {
				const response = await fetch(
					`https://api.getAddress.io/get/${addressId}?api-key=${apiKeyToUse}`
				);

				if (!response.ok) {
					throw new Error(`API request failed: ${response.status}`);
				}

				const address: GetAddressResponse = await response.json();

				// Map getAddress.io response to expected format
				onAddressSelect({
					line_1: address.line_1 || "",
					line_2: address.line_2 || undefined,
					line_3: address.line_3 || undefined,
					post_town: address.town_or_city || "",
					postcode: address.postcode || "",
				});

				// Update the input value to show the selected address
				if (inputRef.current) {
					const fullAddress = [address.line_1, address.line_2, address.line_3]
						.filter(Boolean)
						.join(", ");
					inputRef.current.value = fullAddress;
					onChange?.(fullAddress);
				}

				setShowSuggestions(false);
				setSuggestions([]);
			} catch (error) {
				console.error("Error fetching address details:", error);
			}
		},
		[apiKeyToUse, onAddressSelect, onChange]
	);

	// Debounced search handler
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		onChange?.(inputValue);

		// Clear previous debounce timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Set new debounce timer (300ms delay)
		debounceTimerRef.current = setTimeout(() => {
			fetchSuggestions(inputValue);
		}, 300);
	};

	// Handle suggestion selection
	const handleSuggestionClick = (suggestion: AddressSuggestion) => {
		fetchAddressDetails(suggestion.id);
	};

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!showSuggestions || suggestions.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) =>
					prev < suggestions.length - 1 ? prev + 1 : prev
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;
			case "Enter":
				e.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
					handleSuggestionClick(suggestions[selectedIndex]);
				} else if (suggestions.length > 0) {
					handleSuggestionClick(suggestions[0]);
				}
				break;
			case "Escape":
				setShowSuggestions(false);
				setSelectedIndex(-1);
				break;
		}
	};

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				inputRef.current &&
				suggestionsRef.current &&
				!inputRef.current.contains(event.target as Node) &&
				!suggestionsRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	const hasApiKey = !!apiKeyToUse;

	return (
		<div className="relative">
			<Input
				ref={inputRef}
				id={searchInputId}
				type="text"
				placeholder={
					hasApiKey
						? placeholder
						: "Enter your street address (autocomplete unavailable)"
				}
				{...(value !== undefined ? { value } : { defaultValue: value || "" })}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onFocus={() => {
					if (suggestions.length > 0) {
						setShowSuggestions(true);
					}
				}}
				className={cn(className)}
				disabled={disabled}
				autoComplete="off"
			/>
			{hasApiKey && showSuggestions && suggestions.length > 0 && (
				<div
					ref={suggestionsRef}
					className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto"
				>
					{suggestions.map((suggestion, index) => (
						<div
							key={suggestion.id}
							onClick={() => handleSuggestionClick(suggestion)}
							className={cn(
								"cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100",
								selectedIndex === index && "bg-gray-100"
							)}
						>
							{suggestion.address}
						</div>
					))}
				</div>
			)}
			{hasApiKey && isLoading && (
				<div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
					Searching...
				</div>
			)}
		</div>
	);
}
