import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";

// Simple test to verify Jest setup
describe("Jest Setup", () => {
	it("should run tests successfully", () => {
		expect(true).toBe(true);
	});

	it("should have access to testing utilities", () => {
		expect(render).toBeDefined();
		expect(screen).toBeDefined();
	});
});

// Test that we can render a simple component
const SimpleComponent = () => <div>Hello World</div>;

describe("Component Rendering", () => {
	it("should render a simple component", () => {
		render(<SimpleComponent />);
		expect(screen.getByText("Hello World")).toBeInTheDocument();
	});
});
