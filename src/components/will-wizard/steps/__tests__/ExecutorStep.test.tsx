import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExecutorStep from "../ExecutorStep";
import { useWill } from "@/context/WillContext";
import { useWillData } from "@/hooks/useWillData";
import { useDataLoading } from "@/context/DataLoadingContext";

// Mock dependencies
jest.mock("@/context/WillContext");
jest.mock("@/hooks/useWillData");
jest.mock("@/context/DataLoadingContext");
jest.mock("@/utils/apiClient");
jest.mock("sonner", () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));

const mockUseWill = useWill as jest.MockedFunction<typeof useWill>;
const mockUseWillData = useWillData as jest.MockedFunction<typeof useWillData>;
const mockUseDataLoading = useDataLoading as jest.MockedFunction<
	typeof useDataLoading
>;

describe("ExecutorStep - Maximum 4 Executors", () => {
	const mockOnUpdate = jest.fn();
	const mockOnNext = jest.fn();
	const mockOnBack = jest.fn();
	const mockUpdateLoadingState = jest.fn();

	const defaultProps = {
		data: [],
		onUpdate: mockOnUpdate,
		onNext: mockOnNext,
		onBack: mockOnBack,
	};

	const mockActiveWill = {
		id: "will-123",
		status: "draft",
	};

	const mockEnhancedBeneficiaries = [
		{
			id: "person-1",
			type: "person",
			firstName: "John",
			lastName: "Doe",
			relationship: "Brother",
			relationshipId: "brother",
			isMinor: false,
		},
		{
			id: "person-2",
			type: "person",
			firstName: "Jane",
			lastName: "Smith",
			relationship: "Sister",
			relationshipId: "sister",
			isMinor: false,
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();

		mockUseWill.mockReturnValue({
			activeWill: mockActiveWill,
		});

		mockUseWillData.mockReturnValue({
			allBeneficiaries: mockEnhancedBeneficiaries,
			isLoading: false,
			isReady: true,
		});

		mockUseDataLoading.mockReturnValue({
			updateLoadingState: mockUpdateLoadingState,
		});
	});

	describe("Maximum 4 Executors Limit", () => {
		it("should allow adding executors up to the limit of 4", () => {
			render(<ExecutorStep {...defaultProps} />);

			// Initial state should show "Add New Executor" button
			const addButton = screen.getByText("Add New Executor");
			expect(addButton).toBeInTheDocument();
		});

		it("should disable 'Add New Executor' button when 4 executors are added", () => {
			const fourExecutors = Array.from({ length: 4 }, (_, i) => ({
				id: `executor-${i}`,
				type: "individual" as const,
				firstName: "Test",
				lastName: `Executor${i}`,
				relationshipId: "brother",
				personId: `person-${i}`,
				isPrimary: i === 0,
			}));

			render(<ExecutorStep {...defaultProps} data={fourExecutors} />);

			// Should show disabled message instead of button
			const disabledMessage = screen.getByText("Maximum 4 executors allowed");
			expect(disabledMessage).toBeInTheDocument();

			// Should not show "Add New Executor" button
			expect(screen.queryByText(/Add New Executor/i)).not.toBeInTheDocument();
		});

		it("should display executor count when executors exist", () => {
			const twoExecutors = [
				{
					id: "executor-1",
					type: "individual" as const,
					firstName: "John",
					lastName: "Doe",
					relationshipId: "brother",
					personId: "person-1",
					isPrimary: true,
				},
				{
					id: "executor-2",
					type: "individual" as const,
					firstName: "Jane",
					lastName: "Smith",
					relationshipId: "sister",
					personId: "person-2",
					isPrimary: false,
				},
			];

			render(<ExecutorStep {...defaultProps} data={twoExecutors} />);

			// Should show "2 / 4 executors"
			const countText = screen.getByText("2 / 4 executors");
			expect(countText).toBeInTheDocument();
		});

		it("should not display executor count when no executors exist", () => {
			render(<ExecutorStep {...defaultProps} />);

			// Should not show count when no executors
			expect(screen.queryByText(/\d+ \/ 4 executors/)).not.toBeInTheDocument();
		});

		it("should disable person selection dropdown when 4 executors exist", () => {
			const fourExecutors = Array.from({ length: 4 }, (_, i) => ({
				id: `executor-${i}`,
				type: "individual" as const,
				firstName: "Test",
				lastName: `Executor${i}`,
				relationshipId: "brother",
				personId: `person-${i}`,
				isPrimary: i === 0,
			}));

			render(<ExecutorStep {...defaultProps} data={fourExecutors} />);

			// Dropdown should be disabled
			const dropdownButton = screen.getByRole("combobox");
			expect(dropdownButton).toBeDisabled();

			// Should show "Maximum 4 executors allowed" message
			expect(dropdownButton).toHaveTextContent("Maximum 4 executors allowed");
		});

		it("should allow person selection dropdown when less than 4 executors exist", () => {
			const oneExecutor = [
				{
					id: "executor-1",
					type: "individual" as const,
					firstName: "John",
					lastName: "Doe",
					relationshipId: "brother",
					personId: "person-1",
					isPrimary: true,
				},
			];

			render(<ExecutorStep {...defaultProps} data={oneExecutor} />);

			// Dropdown should not be disabled
			const dropdownButton = screen.getByRole("combobox");
			expect(dropdownButton).not.toBeDisabled();
		});
	});

	describe("Legacy In Order Checkbox", () => {
		it("should prevent adding Legacy In Order executor when 4 executors already exist", () => {
			const fourExecutors = Array.from({ length: 4 }, (_, i) => ({
				id: `executor-${i}`,
				type: "individual" as const,
				firstName: "Test",
				lastName: `Executor${i}`,
				relationshipId: "brother",
				personId: `person-${i}`,
				isPrimary: i === 0,
			}));

			render(<ExecutorStep {...defaultProps} data={fourExecutors} />);

			// Try to check Legacy In Order checkbox
			const legacyCheckbox = screen.getByLabelText(
				/Appoint Legacy In Order to connect me with a Professional Executor/i
			);

			fireEvent.click(legacyCheckbox);

			// Should not be checked (should be automatically unchecked)
			expect(legacyCheckbox).not.toBeChecked();
		});

		it("should allow adding Legacy In Order executor when less than 4 executors exist", () => {
			const oneExecutor = [
				{
					id: "executor-1",
					type: "individual" as const,
					firstName: "John",
					lastName: "Doe",
					relationshipId: "brother",
					personId: "person-1",
					isPrimary: true,
				},
			];

			render(<ExecutorStep {...defaultProps} data={oneExecutor} />);

			// Legacy In Order checkbox should be interactive
			const legacyCheckbox = screen.getByLabelText(
				/Appoint Legacy In Order to connect me with a Professional Executor/i
			);
			expect(legacyCheckbox).toBeInTheDocument();
			expect(legacyCheckbox).not.toBeChecked();
		});
	});

	describe("Validation Messages", () => {
		it("should show multiple primary executors warning when more than one is primary", () => {
			const executorsWithMultiplePrimary = [
				{
					id: "executor-1",
					type: "individual" as const,
					firstName: "John",
					lastName: "Doe",
					relationshipId: "brother",
					personId: "person-1",
					isPrimary: true,
				},
				{
					id: "executor-2",
					type: "individual" as const,
					firstName: "Jane",
					lastName: "Smith",
					relationshipId: "sister",
					personId: "person-2",
					isPrimary: true,
				},
			];

			render(
				<ExecutorStep {...defaultProps} data={executorsWithMultiplePrimary} />
			);

			expect(
				screen.getByText(/Multiple Primary Executors Selected/i)
			).toBeInTheDocument();
		});

		it("should show no primary executor warning when none is primary", () => {
			const executorsWithNoPrimary = [
				{
					id: "executor-1",
					type: "individual" as const,
					firstName: "John",
					lastName: "Doe",
					relationshipId: "brother",
					personId: "person-1",
					isPrimary: false,
				},
				{
					id: "executor-2",
					type: "individual" as const,
					firstName: "Jane",
					lastName: "Smith",
					relationshipId: "sister",
					personId: "person-2",
					isPrimary: false,
				},
			];

			render(<ExecutorStep {...defaultProps} data={executorsWithNoPrimary} />);

			expect(
				screen.getByText(/No Primary Executor Selected/i)
			).toBeInTheDocument();
		});

		it("should disable Next button when no executors are added", () => {
			render(<ExecutorStep {...defaultProps} />);

			const nextButton = screen.getByRole("button", { name: /Next/i });
			expect(nextButton).toBeDisabled();
		});

		it("should disable Next button when multiple primary executors exist", () => {
			const executorsWithMultiplePrimary = [
				{
					id: "executor-1",
					type: "individual" as const,
					firstName: "John",
					lastName: "Doe",
					relationshipId: "brother",
					personId: "person-1",
					isPrimary: true,
				},
				{
					id: "executor-2",
					type: "individual" as const,
					firstName: "Jane",
					lastName: "Smith",
					relationshipId: "sister",
					personId: "person-2",
					isPrimary: true,
				},
			];

			render(
				<ExecutorStep {...defaultProps} data={executorsWithMultiplePrimary} />
			);

			const nextButton = screen.getByRole("button", { name: /Next/i });
			expect(nextButton).toBeDisabled();
		});

		it("should disable Next button when no primary executor exists", () => {
			const executorsWithNoPrimary = [
				{
					id: "executor-1",
					type: "individual" as const,
					firstName: "John",
					lastName: "Doe",
					relationshipId: "brother",
					personId: "person-1",
					isPrimary: false,
				},
			];

			render(<ExecutorStep {...defaultProps} data={executorsWithNoPrimary} />);

			const nextButton = screen.getByRole("button", { name: /Next/i });
			expect(nextButton).toBeDisabled();
		});

		it("should enable Next button when exactly one primary executor exists", () => {
			const validExecutors = [
				{
					id: "executor-1",
					type: "individual" as const,
					firstName: "John",
					lastName: "Doe",
					relationshipId: "brother",
					personId: "person-1",
					isPrimary: true,
				},
				{
					id: "executor-2",
					type: "individual" as const,
					firstName: "Jane",
					lastName: "Smith",
					relationshipId: "sister",
					personId: "person-2",
					isPrimary: false,
				},
			];

			render(<ExecutorStep {...defaultProps} data={validExecutors} />);

			const nextButton = screen.getByRole("button", { name: /Next/i });
			expect(nextButton).not.toBeDisabled();
		});
	});

	describe("UI Rendering", () => {
		it("should render the component title and description", () => {
			render(<ExecutorStep {...defaultProps} />);

			expect(
				screen.getByText(/Appoint Executors for Your Estate/i)
			).toBeInTheDocument();
		});

		it("should render Legacy In Order recommendation section", () => {
			render(<ExecutorStep {...defaultProps} />);

			expect(
				screen.getByText(/Recommended: Legacy In Order Executor Network/i)
			).toBeInTheDocument();
		});

		it("should render executor selection dropdown", () => {
			render(<ExecutorStep {...defaultProps} />);

			expect(screen.getByText(/Select Executor/i)).toBeInTheDocument();
			expect(
				screen.getByText(/Search and select from existing people\.\.\./i)
			).toBeInTheDocument();
		});

		it("should render Back and Next navigation buttons", () => {
			render(<ExecutorStep {...defaultProps} />);

			expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
		});
	});
});
