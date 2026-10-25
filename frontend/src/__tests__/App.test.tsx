import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

function TestComponent() {
  return <h1>Customer Inquiry Management System</h1>;
}

describe("App", () => {
  it("renders the application heading", () => {
    render(<TestComponent />);

    expect(
      screen.getByRole("heading", {
        name: "Customer Inquiry Management System",
      }),
    ).toBeInTheDocument();
  });
});
