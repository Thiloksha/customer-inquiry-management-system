
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import InquiriesPage from "../pages/InquiriesPage";
import { apiRequest } from "../services/api";

vi.mock("../services/api", () => ({
  apiRequest: vi.fn(),
}));

describe("InquiriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiRequest).mockResolvedValue({ inquiries: [] });
  });

  it("opens the inquiry form when Add Inquiry is clicked", async () => {
    render(
      <MemoryRouter>
        <InquiriesPage />
      </MemoryRouter>,
    );

    // Wait for the initial inquiry request to finish.
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith("/inquiries");
    });

    fireEvent.click(
      screen.getByRole("button", { name: /add inquiry/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Create New Inquiry" }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/customer name/i)).toBeRequired();
    expect(screen.getByLabelText(/contact information/i)).toBeRequired();
    expect(screen.getByLabelText(/^subject/i)).toBeRequired();
    expect(screen.getByLabelText(/description/i)).toBeRequired();
  });
});
